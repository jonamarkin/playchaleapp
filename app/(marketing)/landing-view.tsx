'use client';

import React from 'react';
import Hero from '@/components/Hero';
import DiscoverGames from '@/components/DiscoverGames';
import { Features } from '@/components/Features';
import TopPlayers from '@/components/TopPlayers';
import Programs from '@/components/Programs';
import Testimonials from '@/components/Testimonials';
import { useRouter } from 'next/navigation';
import { useGames } from '@/features/games/hooks';
import { usePlayers } from '@/features/players/hooks';

export default function LandingView() {
  const { data: games = [] } = useGames();
  const { data: players = [] } = usePlayers();
  const router = useRouter();

  return (
    <div className="animate-in fade-in duration-500">
      <Hero onOpenDiscover={() => router.push('/discover')} />
      <div className="bg-[#FDFDFB] -mt-20 relative z-20 rounded-t-[60px] md:rounded-t-[100px] border-t border-black/5 shadow-[0_-40px_100px_rgba(0,0,0,0.1)]">
        <DiscoverGames
          games={games.slice(0, 3)}
          onOpenGame={(game) => router.push(`/game/${game.slug || game.id}`)}
          isFullPage={false}
        />
      </div>
      <Features />
      <div className="bg-black py-40">
        <TopPlayers
          players={players.slice(0, 2)}
          onOpenPlayer={(player) => router.push(`/profile/${player.slug || player.id}`)}
          onViewAll={() => router.push('/community')}
        />
      </div>
      <Programs onOpenDetails={() => router.push('/discover')} />
      <Testimonials />
    </div>
  );
}
