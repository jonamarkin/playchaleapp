import { Metadata } from 'next';
import { createSeed } from '@/lib/mock/seed';
import GameClientPage from '@/components/GameClientPage';

// Mock data lives in the browser, so the server only knows the seeded games.
// Games created in the UI still render; they just get the generic metadata.
function getSeedGame(slugOrId: string) {
    return createSeed().games.find((g) => g.slug === slugOrId || g.id === slugOrId) || null;
}

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const slug = (await params).slug;
    const game = getSeedGame(slug);

    if (!game) {
        return {
            title: 'Game | PlayChale',
            description: 'Join this game on PlayChale.'
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
    return <GameClientPage slug={slug} />;
}
