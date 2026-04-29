'use client';

import React from 'react';
import DiscoverGames from '@/components/DiscoverGames';
import { useGames } from '@/hooks/useData';

import { useRouter } from 'next/navigation';

export default function DiscoverPage() {
  const { data: games = [] } = useGames();
  const router = useRouter();

  return (
    <div className="pc-view-enter">
      <DiscoverGames
        games={games}
        onOpenGame={(game) => router.push(`/game/${game.slug || game.id}`)}
        isFullPage
      />
    </div>
  );
}
