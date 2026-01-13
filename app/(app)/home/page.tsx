'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AppDashboard from '@/components/AppDashboard';
import { usePlayChale } from '@/providers/PlayChaleProvider';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { players, games, handleNavigate } = usePlayChale();
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <AppDashboard
        player={players[0]}
        upcomingGames={games.slice(0, 3)}
        onViewMatch={(game) => router.push(`/game/${game.id}`)}
        onNavigate={handleNavigate}
      />
    </motion.div>
  );
}
