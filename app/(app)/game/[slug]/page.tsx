import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { gameQuery } from '@/features/games/queries';
import { ApiError } from '@/lib/api/client';
import { serverApi } from '@/lib/api/server';
import { Prefetch } from '@/lib/query/prefetch';
import GameClientPage from '@/components/GameClientPage';
import { sportName } from '@/features/sports/server';
import { formatGameWhen } from '@/lib/format';

type Props = {
    params: Promise<{ slug: string }>;
};

// Shared by generateMetadata and the page within one request
const getGame = cache(async (slug: string) => {
    try {
        return await serverApi.games.get(slug);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const game = await getGame((await params).slug);

    if (!game) {
        return {
            title: 'Game Not Found | PlayChale',
            description: 'This game does not exist or has been removed.',
        };
    }

    const sport = await sportName(game.sport);
    const when = formatGameWhen(game.startsAt, game.timezone);
    const spotsLeft = Math.max(0, game.capacity - game.confirmedCount);

    return {
        title: `${game.title} | PlayChale`,
        description: `Join ${game.host.name}'s ${sport} game at ${game.locationText}, ${when}.`,
        openGraph: {
            title: `Join ${game.title}`,
            description: `${sport} at ${game.locationText}, ${when}. ${spotsLeft > 0 ? `${spotsLeft} spots left!` : 'Squad full.'}`,
            images: [{ url: game.imageUrl, width: 1200, height: 630, alt: game.title }],
            type: 'website',
        },
    };
}

export default async function GamePage({ params }: Props) {
    const { slug } = await params;
    const game = await getGame(slug);
    if (!game) notFound();

    return (
        // Reuse the game already fetched for metadata instead of requesting it again
        <Prefetch queries={(qc) => [qc.prefetchQuery({ ...gameQuery(serverApi, slug), queryFn: () => game })]}>
            <GameClientPage slug={slug} />
        </Prefetch>
    );
}
