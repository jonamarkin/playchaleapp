'use client';

import { useRouter } from 'next/navigation';
import AppDashboard from '@/components/AppDashboard';
import { useSession } from '@/features/auth/session';
import { useGames, useMyGames } from '@/features/games/hooks';
import { useMyProfile, usePlayers } from '@/features/players/hooks';

export default function HomeView() {
  const router = useRouter();
  const { user } = useSession();
  const { data: profile } = useMyProfile();
  const { data: myGames } = useMyGames();
  const { data: games = [] } = useGames();
  const { data: players = [] } = usePlayers();

  // Top 5 rising stars, excluding the current user
  const risingStars = players.filter((p) => p.id !== user?.id).slice(0, 5);

  if (!profile) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-300">
      <AppDashboard
        player={profile}
        upcomingGames={games.slice(0, 3)}
        myGames={myGames}
        risingStars={risingStars}
        onViewMatch={(game) => router.push(`/game/${game.slug || game.id}`)}
        onNavigate={(path: string) => router.push(path.startsWith('/') ? path : `/${path}`)}
      />
    </div>
  );
}
