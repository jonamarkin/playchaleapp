'use client';

import React from 'react';
import AppDashboard from '@/components/AppDashboard';
import AppLoader from '@/components/AppLoader';
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
    return <AppLoader label="Loading your home" tone="light" />;
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
