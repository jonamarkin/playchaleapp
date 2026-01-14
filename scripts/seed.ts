
import { createClient } from '@supabase/supabase-js';
import { GAMES, TOP_PLAYERS } from '@/constants';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing credentials in .env.local');
    console.error(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'Found' : 'Missing'}`);
    console.error(`SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? 'Found' : 'Missing'}`);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
    console.log('🌱 Starting seed process...');

    // 1. Seed Users (Profiles)
    console.log(`\nCreating ${TOP_PLAYERS.length} profiles...`);

    for (const player of TOP_PLAYERS) {
        // We need to create an Auth User first to get a valid UUID
        // However, for pure data seeding of "Public Profiles" where we don't need them to login yet,
        // we can check if we want to create dummy auth users or just insert into profiles if there is no FK constraint.
        // BUT, our schema has `id references auth.users`.
        // So we MUST create auth users.

        // Check if user exists (by email - we'll generate fake emails)
        // Strip special chars like quotes from name
        const cleanName = player.name.replace(/[^a-zA-Z0-9\s]/g, '');
        const email = `${cleanName.replace(/\s+/g, '.').toLowerCase()}@example.com`;

        // Note: Admin create user
        let { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: 'password123',
            email_confirm: true,
            user_metadata: { full_name: player.name }
        });

        if (authError) {
            console.log(`Skipping creation for ${player.name}: ${authError.message}`);

            // Attempt to find existing user to get ID
            const { data: { users: existingUsers }, error: listError } = await supabase.auth.admin.listUsers();

            if (listError) {
                console.error(`Error listing users: ${listError.message}`);
                continue;
            }

            const existingUser = existingUsers.find(u => u.email === email);

            if (existingUser) {
                console.log(`Found existing user: ${existingUser.id}`);
                // Mock the authUser object structure to proceed
                // admin.createUser returns { user: User }
                authUser = { user: existingUser };
            } else {
                console.error(`Could not find existing user for ${email} despite creation error.`);
                continue;
            }
        }

        if (authUser && authUser.user) {
            console.log(`Created Auth User: ${authUser.user.id} (${player.name})`);

            // Update the Profile that was auto-created by Trigger (if trigger exists)
            // OR insert/update it manually.
            // Since our migration created a trigger, a profile might already exist.
            // Let's upsert to be safe and ensure all fields match our constants.

            const { error: profileError } = await supabase.from('profiles').upsert({
                id: authUser.user.id,
                username: player.name.replace(/\s+/g, '').toLowerCase(),
                full_name: player.name,
                avatar_url: player.avatar,
                bio: player.bio,
                location: player.location,
                level: 'Competitive', // Default
                sports: Object.keys(player.sportStats),
                attributes: player.attributes,
                onboarding_completed: true
            });

            if (profileError) console.error(`Error updating profile for ${player.name}:`, profileError);

            // Seed Sport Stats
            for (const [sport, stats] of Object.entries(player.sportStats)) {
                const { error: statsError } = await supabase.from('user_sport_stats').upsert({
                    user_id: authUser.user.id,
                    sport: sport,
                    stats: stats
                });
                if (statsError) console.error(`Error adding stats for ${player.name} (${sport}):`, statsError);
            }
        }
    }

    // 2. Seed Games
    console.log(`\nCreating ${GAMES.length} games...`);
    // For games, we need an organizer_id. We'll fetch the first user we find to be the "host".
    const { data: users } = await supabase.from('profiles').select('id').limit(1);
    const hostId = users && users[0] ? users[0].id : null;

    if (hostId) {
        for (const game of GAMES) {
            const { error } = await supabase.from('games').upsert({
                id: game.id, // Using the 'g1', 'g2' from constants for now
                organizer_id: hostId,
                title: game.title,
                sport: game.sport,
                status: game.status,
                location: game.location,
                time: game.time,
                date: game.date,
                max_participants: game.spotsTotal,
                spots_taken: game.spotsTaken,
                price: game.price,
                image_url: game.imageUrl,
                skill_level: game.skillLevel
            });

            if (error) console.error(`Error creating game ${game.title}:`, error);
            else console.log(`Created game: ${game.title}`);
        }
    } else {
        console.log('Skipping games execution: No users found to set as organizer.');
    }

    console.log('\n✅ Seeding complete!');
}

seed().catch(console.error);
