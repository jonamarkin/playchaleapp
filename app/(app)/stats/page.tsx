'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProfileDashboard from '@/components/ProfileDashboard';
import { usePlayChale } from '@/providers/PlayChaleProvider';

export default function StatsPage() {
  const router = useRouter();
  const { players, openModal, hasProfile } = usePlayChale();

  // Protect this route
  useEffect(() => {
    if (!hasProfile) {
      router.push('/onboarding');
    }
  }, [hasProfile, router]);

  if (!hasProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
    >
      <ProfileDashboard 
        player={players[0]} 
        onEditStats={() => openModal('stats', players[0])} 
        onEditProfile={() => openModal('edit-profile', players[0])}
        onShareProfile={() => openModal('share-profile', players[0])}
        onViewMatch={(match) => openModal('match-detail', match)} 
      />
    </motion.div>
  );
}
