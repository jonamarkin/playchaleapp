'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import DiscoverGames from '@/components/DiscoverGames';
import { Features } from '@/components/Features';
import TopPlayers from '@/components/TopPlayers';
import Programs from '@/components/Programs';
import Testimonials from '@/components/Testimonials';
import { usePlayChale } from '@/providers/PlayChaleProvider';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { games, players, openModal, handleNavigate } = usePlayChale();
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Hero onOpenDiscover={() => handleNavigate('/discover')} />
      <div className="bg-[#FDFDFB] -mt-20 relative z-20 rounded-t-[60px] md:rounded-t-[100px] border-t border-black/5 shadow-[0_-40px_100px_rgba(0,0,0,0.1)]">
        <DiscoverGames
          games={games.slice(0, 3)}
          onOpenGame={(game) => router.push(`/game/${game.id}`)}
          isFullPage={false}
        />
      </div>
      <Features />
      <div className="bg-black py-40">
        <TopPlayers
          players={players.slice(0, 2)}
          onOpenPlayer={(player) => openModal('profile', player)}
          onViewAll={() => handleNavigate('/community')}
        />
      </div>
      <Programs onOpenDetails={() => handleNavigate('/discover')} />
      <Testimonials />
    </motion.div>
  );
}
