'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProfileDashboard from '@/components/ProfileDashboard';
import { usePlayChale } from '@/providers/PlayChaleProvider';
import { useProfile } from '@/hooks/useData';

export default function StatsPage() {
  const router = useRouter();
  const { openModal, hasProfile, user } = usePlayChale();
  const { data: profile, isLoading } = useProfile(user?.id);

  // Protect this route
  useEffect(() => {
    if (!hasProfile && !user) {
      router.push('/onboarding');
    }
  }, [hasProfile, user, router]);

  if (!profile || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading your profile...</div>
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
        player={profile}
        isOwner={true}
        onEditStats={() => openModal('stats', profile)}
        onEditProfile={() => openModal('edit-profile', profile)}
        onShareProfile={() => openModal('share-profile', profile)}
        onViewMatch={(match) => router.push(`/game/${match.id}`)}
      />
    </motion.div>
  );
}
