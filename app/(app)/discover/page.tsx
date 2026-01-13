'use client';

import React from 'react';
import { motion } from 'framer-motion';
import DiscoverGames from '@/components/DiscoverGames';
import { usePlayChale } from '@/providers/PlayChaleProvider';

import { useRouter } from 'next/navigation';

export default function DiscoverPage() {
  const { games, userLocation } = usePlayChale();
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <DiscoverGames
        games={games}
        onOpenGame={(game) => router.push(`/game/${game.id}`)}
        isFullPage
        userLocation={userLocation}
      />
    </motion.div>
  );
}
