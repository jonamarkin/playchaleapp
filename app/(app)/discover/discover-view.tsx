'use client';

import DiscoverGames from '@/components/DiscoverGames';
import { useGames } from '@/features/games/hooks';

export default function DiscoverView() {
  const { data: games = [] } = useGames();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-300">
      <DiscoverGames games={games} isFullPage />
    </div>
  );
}
