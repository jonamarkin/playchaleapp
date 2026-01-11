'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AppDashboard from '@/components/AppDashboard';
import { usePlayChale } from '@/providers/PlayChaleProvider';

export default function HomePage() {
  const { players, games, openModal, handleNavigate } = usePlayChale();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
    >
      <AppDashboard 
        player={players[0]} 
        upcomingGames={games.slice(0, 3)} 
        onViewMatch={(game) => openModal('join', game)} 
        onNavigate={handleNavigate} 
      />
    </motion.div>
  );
}
