import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import GameClientPage from '@/components/GameClientPage';

// Helper to fetch game data server-side
async function getGame(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
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
        .eq('id', id)
        .single();

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
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const id = (await params).id;
    const game = await getGame(id);

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
                    url: game.imageUrl || 'https://playchale.app/og-default.jpg', // Ensure this fallback works or is valid
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
    const id = (await params).id;
    const game = await getGame(id);

    return <GameClientPage id={id} initialGame={game} />;
}
