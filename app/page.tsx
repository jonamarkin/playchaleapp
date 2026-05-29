import React from 'react';
import Hero from '@/components/Hero';
import { Features } from '@/components/Features';
import MarketingGamesPreview from '@/components/MarketingGamesPreview';
import MarketingPlayersPreview from '@/components/MarketingPlayersPreview';
import Programs from '@/components/Programs';
import Testimonials from '@/components/Testimonials';
import { GAMES, PROGRAMS, TOP_PLAYERS } from '@/constants';

export default function LandingPage() {
  return (
    <div>
      <Hero />
      <div className="pc-content-visibility bg-[#FDFDFB] -mt-20 relative z-20 rounded-t-[60px] md:rounded-t-[100px] border-t border-black/5 shadow-[0_-40px_100px_rgba(0,0,0,0.1)]">
        <MarketingGamesPreview games={GAMES.slice(0, 3)} />
      </div>
      <Features />
      <div className="pc-content-visibility bg-black py-40">
        <MarketingPlayersPreview players={TOP_PLAYERS.slice(0, 2)} />
      </div>
      <Programs programs={PROGRAMS} />
      <Testimonials />
    </div>
  );
}
