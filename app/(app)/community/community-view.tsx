'use client';

import React from 'react';
import TopPlayers from '@/components/TopPlayers';
import { usePlayers } from '@/features/players/hooks';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function CommunityView() {
  const { data: players = [], fetchNextPage, hasNextPage, isFetchingNextPage } = usePlayers();
  const router = useRouter();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-300">
      <TopPlayers
        players={players}
        onOpenPlayer={(player) => router.push(`/profile/${player.slug || player.id}`)}
        isFullPage
      />

      {hasNextPage && (
        <div className="flex justify-center pb-20">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="bg-[#C6FF00] text-black font-black uppercase tracking-widest rounded-full px-8 py-6 hover:scale-105 transition-all text-xs"
          >
            {isFetchingNextPage ? 'Loading Legends...' : 'Load More Athletes'}
          </Button>
        </div>
      )}
    </div>
  );
}
