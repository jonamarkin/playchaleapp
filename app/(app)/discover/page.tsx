'use client';

import React from 'react';
import { motion } from 'framer-motion';
import DiscoverGames from '@/components/DiscoverGames';
import { usePlayChale } from '@/providers/PlayChaleProvider';

export default function DiscoverPage() {
  const { games, openModal, userLocation } = usePlayChale();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
    >
      <DiscoverGames 
        games={games} 
        onOpenGame={(game) => openModal('join', game)} 
        isFullPage 
        userLocation={userLocation} 
      />
    </motion.div>
  );
}
