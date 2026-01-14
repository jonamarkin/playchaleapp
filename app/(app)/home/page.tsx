'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import AppDashboard from '@/components/AppDashboard';
import { usePlayChale } from '@/providers/PlayChaleProvider';

import { useRouter } from 'next/navigation';

import { useEffect } from 'react';
import { useProfile } from '@/hooks/useData';

export default function HomePage() {
  const { games, handleNavigate, user } = usePlayChale();
  const router = useRouter();
  const { data: profile, isLoading } = useProfile(user?.id);

  const myGames = useMemo(() => {
    if (!user) return [];
    return games.filter((g: any) =>
      g.organizer_id === user.id ||
      g.participants?.some((p: any) => p.id === user.id)
    );
  }, [games, user]);

  useEffect(() => {
    if (!isLoading && !profile) {
      router.replace('/onboarding');
    }
  }, [isLoading, profile, router]);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-white/10 border-t-[#C6FF00] rounded-full animate-spin"></div>
        <div className="text-white/50 font-mono text-xs uppercase tracking-widest animate-pulse">Loading Identity...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <AppDashboard
        player={profile}
        upcomingGames={myGames.slice(0, 3)}
        onViewMatch={(game) => router.push(`/game/${game.id}`)}
        onNavigate={handleNavigate}
      />
    </motion.div>
  );
}
