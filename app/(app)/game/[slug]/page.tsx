import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import GameClientPage from '@/components/GameClientPage';

// Helper to fetch game data server-side - supports both slug and ID lookups
async function getGame(slugOrId: string) {
    const supabase = await createClient();

    // Try to find by slug first
    let { data, error } = await supabase
        .from('games')
        .select(`
            *,
            profiles:organizer_id(full_name),
            game_participants(
                user_id,
                status,
                profiles:user_id(id, full_name, avatar_url)
            )
        `)
        .eq('slug', slugOrId)
        .single();

    // If not found by slug, try by ID (backward compatibility)
    if (error || !data) {
        const result = await supabase
            .from('games')
            .select(`
                *,
                profiles:organizer_id(full_name),
                game_participants(
                    user_id,
                    status,
                    profiles:user_id(id, full_name, avatar_url)
                )
            `)
            .eq('id', slugOrId)
            .single();

        data = result.data;
        error = result.error;
    }

    if (error || !data) return null;

    // Transform to match app type
    return {
        ...data,
        imageUrl: data.image_url,
        spotsTotal: data.max_participants,
        spotsTaken: data.game_participants ? data.game_participants.length : data.spots_taken,
        skillLevel: data.skill_level,
        organizer: data.profiles?.full_name || 'Unknown Organizer',
        participants: data.game_participants?.map((p: any) => ({
            id: p.user_id,
            name: p.profiles?.full_name || 'User',
            avatar: p.profiles?.avatar_url || '',
            role: p.user_id === data.organizer_id ? 'Host' : (p.status === 'confirmed' ? 'Player' : 'Pending'),
            rating: 5.0
        })) || []
    };
}

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const slug = (await params).slug;
    const game = await getGame(slug);

    if (!game) {
        return {
            title: 'Game Not Found - PlayChale',
            description: 'This game does not exist or has been removed.'
        };
    }

    return {
        title: `${game.title} | PlayChale`,
        description: `Join ${game.organizer}'s ${game.sport} game at ${game.location} on ${game.date}.`,
        openGraph: {
            title: `Join ${game.title}`,
            description: `Play ${game.sport} at ${game.location}. ${game.spotsTotal - game.spotsTaken} spots left!`,
            images: [
                {
                    url: game.imageUrl || 'https://playchale.app/og-default.jpg',
                    width: 1200,
                    height: 630,
                    alt: game.title,
                }
            ],
            type: 'website',
        },
    };
}

export default async function GamePage({ params }: Props) {
    const slug = (await params).slug;
    const game = await getGame(slug);

    return <GameClientPage id={game?.id || slug} initialGame={game} />;
}

