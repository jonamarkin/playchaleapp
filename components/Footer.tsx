'use client';

import React from 'react';
import { ICONS } from '@/constants';
import { motion } from 'framer-motion';

interface FooterProps {
  onNavigate: (view: any) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-black text-white pt-32 pb-12 px-6 md:px-12 overflow-hidden rounded-t-[60px] md:rounded-t-[100px] mt-[-60px] z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C6FF00]/5 blur-[120px] rounded-full -mr-20 -mt-20 pointer-events-none opacity-50"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-24">

          {/* Brand & Newsletter */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <ICONS.Logo />
                <span className="font-black text-3xl tracking-tighter italic uppercase">PlayChale.</span>
              </div>
              <p className="text-white/40 font-bold text-lg leading-snug max-w-sm tracking-tight">
                The professional-grade social engine for the amateur elite. Organize, compete, and record your legacy.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C6FF00]">Elite Access</h4>
              <div className="relative max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email for match alerts..."
                  className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-sm font-bold outline-none focus:border-[#C6FF00] transition-all"
                />
                <button className="absolute right-2 top-2 bottom-2 bg-[#C6FF00] text-black px-6 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all">
                  Join
                </button>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-6">Get scouted. No spam, only stats.</p>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">The Arena</h4>
              <ul className="space-y-4">
                {[
                  { label: 'Discover Games', path: '/discover' },
                  { label: 'Local Rankings', path: '/community' },
                  { label: 'Tournament Hub', path: '/discover' },
                  { label: 'Pitch Partners', path: '/discover' }
                ].map(item => (
                  <li key={item.label}>
                    <button onClick={() => onNavigate(item.path)} className="text-sm font-black italic uppercase tracking-tight hover:text-[#C6FF00] transition-colors text-left">{item.label}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Community</h4>
              <ul className="space-y-4">
                {[
                  { label: 'Sport Tribes', path: '/community' },
                  { label: 'Hall of Fame', path: '/community' },
                  { label: 'Athlete Blogs', path: '/home' },
                  { label: 'Guidelines', path: '/home' }
                ].map(item => (
                  <li key={item.label}>
                    <button onClick={() => onNavigate(item.path)} className="text-sm font-black italic uppercase tracking-tight hover:text-[#C6FF00] transition-colors text-left">{item.label}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8 col-span-2 md:col-span-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Follow Us</h4>
              <div className="flex gap-4">
                {['IG', 'X', 'DS'].map(social => (
                  <button key={social} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs hover:bg-[#C6FF00] hover:text-black transition-all">
                    {social}
                  </button>
                ))}
              </div>
              <button
                onClick={scrollToTop}
                className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
              >
                Back to Top
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#C6FF00] group-hover:text-black transition-all">
                  <div className="-rotate-90 scale-75"><ICONS.ChevronRight /></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Massive Watermark Branding */}
        <div className="relative mb-16 select-none pointer-events-none opacity-[0.03]">
          <h2 className="text-[12vw] font-black italic tracking-tighter leading-none text-center uppercase">
            PlayChale.
          </h2>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 cursor-pointer hover:text-white transition-colors">Terms of Play</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 cursor-pointer hover:text-white transition-colors">Cookie Settings</span>
          </div>

          <div className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-full border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF00] animate-pulse"></span>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
              12,482 Players Active in 42 Cities
            </span>
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            &copy; 2025 PLAYCHALE LABS. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
