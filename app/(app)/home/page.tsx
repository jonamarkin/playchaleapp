'use client';

import React from 'react';
import AppDashboard from '@/components/AppDashboard';
import { usePlayChale } from '@/providers/PlayChaleProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useGames, useProfile, useMyGames, usePlayers } from '@/hooks/useData';

export default function HomePage() {
  const { handleNavigate, user } = usePlayChale();
  const router = useRouter();
  const { data: games = [] } = useGames();
  const { data: profile, isLoading } = useProfile(user?.id);
  const { data: myGamesData } = useMyGames(user?.id);
  const { data: players } = usePlayers();

  // Get top 5 rising stars (excluding current user)
  const risingStars = (players || [])
    .filter(p => p.id !== user?.id)
    .slice(0, 5);

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
    <div className="pc-view-enter">
      <AppDashboard
        player={profile}
        upcomingGames={games.slice(0, 3)}
        myGames={myGamesData}
        risingStars={risingStars}
        onViewMatch={(game) => router.push(`/game/${game.slug || game.id}`)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
