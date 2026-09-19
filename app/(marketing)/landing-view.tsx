'use client';

import React from 'react';
import DiscoverGames from '@/components/DiscoverGames';
import { Features } from '@/components/Features';
import TopPlayers from '@/components/TopPlayers';
import { useRouter } from 'next/navigation';
import { useGames } from '@/features/games/hooks';
import { usePlayers } from '@/features/players/hooks';

export default function LandingView({
  hero,
  overlapHero,
}: {
  hero: React.ReactNode;
  /** The cinematic hero is dark, so the next section rises over it with rounded corners */
  overlapHero: boolean;
}) {
  const { data: games = [] } = useGames();
  const { data: players = [] } = usePlayers();
  const router = useRouter();

  return (
    <div className="animate-in fade-in duration-500">
      {hero}
      <div
        className={
          overlapHero
            ? 'bg-surface-app -mt-20 pt-8 md:pt-16 relative z-20 rounded-t-[60px] md:rounded-t-[100px] border-t border-black/5 shadow-[0_-40px_100px_rgba(0,0,0,0.1)]'
            : undefined
        }
      >
        <DiscoverGames
          games={games.slice(0, 3)}
            isFullPage={false}
        />
      </div>
      <Features />
      <div className="bg-black py-40">
        <TopPlayers
          players={players.slice(0, 2)}
          onOpenPlayer={(player) => router.push(`/profile/${player.slug || player.id}`)}
          onViewAll={() => router.push('/community')}
        />
      </div>
    </div>
  );
}
