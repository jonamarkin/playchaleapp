import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { playerQuery } from '@/features/players/queries';
import { ApiError } from '@/lib/api/client';
import { getSession, serverApi } from '@/lib/api/server';
import { sportName } from '@/features/sports/server';
import { primaryStats, winRate } from '@/lib/format';
import { Prefetch } from '@/lib/query/prefetch';
import ProfileView from './profile-view';

type Props = {
    params: Promise<{ slug: string }>;
};

const getPlayer = cache(async (slug: string) => {
    try {
        return await serverApi.players.get(slug);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const player = await getPlayer((await params).slug);
    if (!player) return { title: 'Player Not Found | PlayChale' };

    const sport = await sportName(player.mainSport);
    const record = primaryStats(player.careerStats, player.mainSport);
    // Only claim a record when one has actually been approved
    const summary = record
        ? `${record.gamesPlayed} games, ${winRate(record) ?? '—'} win rate.`
        : 'Building a record on PlayChale.';

    return {
        title: `${player.name} | PlayChale`,
        description: `${player.name} plays ${sport} on PlayChale. ${summary}`,
        openGraph: { title: player.name, images: player.avatarUrl.startsWith('http') ? [{ url: player.avatarUrl }] : undefined },
    };
}

export default async function ProfilePage({ params }: Props) {
    const { slug } = await params;

    // /profile/me is an alias for the signed-in player's own profile
    if (slug === 'me') {
        const session = await getSession();
        if (!session.user) redirect('/login?next=/profile/me');
        redirect(session.hasProfile && session.playerId ? `/profile/${session.playerId}` : '/onboarding');
    }

    const player = await getPlayer(slug);
    if (!player) notFound();

    return (
        <Prefetch queries={(qc) => [qc.prefetchQuery({ ...playerQuery(serverApi, slug), queryFn: () => player })]}>
            <ProfileView slug={slug} />
        </Prefetch>
    );
}
