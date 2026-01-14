'use client';

import React from 'react';
import { motion } from 'framer-motion';
import TopPlayers from '@/components/TopPlayers';
import { useInfinitePlayers } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function CommunityPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePlayers();
  const players = data ? data.pages.flat() : [];
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
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
    </motion.div>
  );
}
