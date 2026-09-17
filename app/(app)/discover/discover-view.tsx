'use client';

import { useRouter } from 'next/navigation';
import DiscoverGames from '@/components/DiscoverGames';
import { useGames } from '@/features/games/hooks';

export default function DiscoverView() {
  const { data: games = [] } = useGames();
  const router = useRouter();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-300">
      <DiscoverGames
        games={games}
        onOpenGame={(game) => router.push(`/game/${game.slug || game.id}`)}
        isFullPage
      />
    </div>
  );
}
