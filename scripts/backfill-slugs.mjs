
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY; // Using public key since we likely have RLS allowing updates if we are the user, wait... public key might not allow updating OTHER users.
// If RLS is strict, I can't update other users with public key.
// But this is a cleanup script. I usually need SERVICE_ROLE_KEY.
// Let's check if SERVICE_ROLE_KEY is in env.

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey);

function generateSlug(name) {
    if (!name) return 'user-' + Math.random().toString(36).substr(2, 6);
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

async function backfill() {
    console.log('Fetching profiles...');
    const { data: profiles, error } = await supabase.from('profiles').select('id, full_name, slug');

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    console.log(`Found ${profiles.length} profiles.`);

    for (const p of profiles) {
        if (!p.slug) {
            let slug = generateSlug(p.full_name);
            console.log(`Updating ${p.full_name} (${p.id}) -> ${slug}`);

            // Check uniqueness logic primitive
            // Ideally we rely on the DB trigger I wrote, but if it didn't run, we do it here.
            // Wait, if the migration didn't run, the COLUMN might not exist.
            // Let's try to update.
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ slug: slug })
                .eq('id', p.id);

            if (updateError) {
                console.error(`Failed to update ${p.id}:`, updateError.message);
            }
        } else {
            console.log(`Skipping ${p.full_name}, already has slug: ${p.slug}`);
        }
    }
    console.log('Done.');
}

backfill();
