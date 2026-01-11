'use client';

import React from 'react';
import { motion } from 'framer-motion';
import TopPlayers from '@/components/TopPlayers';
import { usePlayChale } from '@/providers/PlayChaleProvider';

export default function CommunityPage() {
  const { players, openModal } = usePlayChale();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
    >
      <TopPlayers 
        players={players} 
        onOpenPlayer={(player) => openModal('profile', player)} 
        isFullPage 
      />
    </motion.div>
  );
}
