'use client';

import React, { useState, useEffect } from 'react';
import { ICONS } from '@/constants';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onOpenCreate: () => void;
  activeView: string;
  onNavigate: (view: any) => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenCreate, activeView, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Discover', id: 'discover' },
    { label: 'Community', id: 'community' },
    { label: 'My Stats', id: 'stats' },
    { label: 'Inbox', id: 'messages' }
  ];

  // Logic to determine if we should use the dark theme (white text, transparent bg)
  // We only use the dark/transparent theme when on the Landing Page HERO (before scroll).
  // All other views (Home Dashboard, Discover, etc.) use a light background, so we need a light header.
  const isLanding = activeView === 'landing';
  const headerTheme = (isLanding && !scrolled) ? 'dark' : 'light';

  // Navigation highlighting logic: 'Home' is active on both 'landing' and 'home' views
  const isActive = (id: string) => {
    if (id === 'home') return activeView === 'home' || activeView === 'landing';
    return activeView === id;
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center ${headerTheme === 'light' ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3 md:gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 md:gap-4 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <ICONS.Logo />
            <span className={`font-black text-xl tracking-tighter transition-colors duration-300 ${headerTheme === 'light' ? 'text-black' : 'text-white'}`}>PlayChale</span>
          </motion.div>

          <motion.nav 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`hidden lg:flex transition-all duration-300 rounded-full px-2 py-1 gap-1 items-center border shadow-sm ${headerTheme === 'light' ? 'bg-black/5 border-black/10' : 'bg-white/10 border-white/20 backdrop-blur-md'}`}
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isActive(item.id) ? (headerTheme === 'light' ? 'bg-black text-white' : 'bg-[#C6FF00] text-black shadow-lg shadow-lime-500/20') : (headerTheme === 'light' ? 'text-black/70 hover:text-black hover:bg-black/5' : 'text-white/80 hover:text-white hover:bg-white/10')}`}
              >
                {item.label}
              </button>
            ))}
          </motion.nav>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 md:gap-3"
        >
          <button 
            onClick={onOpenCreate}
            className={`transition-all duration-300 px-5 md:px-7 py-2 md:py-2.5 rounded-full flex items-center gap-2 md:gap-3 group shadow-lg ${headerTheme === 'light' ? 'bg-black text-white hover:bg-[#C6FF00] hover:text-black' : 'bg-[#C6FF00] text-black hover:bg-white'}`}
          >
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Create Game</span>
            <div className={`rounded-full p-1 transition-transform group-hover:translate-x-1 ${headerTheme === 'light' ? 'bg-white/10' : 'bg-black/10'}`}>
              <ICONS.Plus />
            </div>
          </button>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`backdrop-blur-md w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full shadow-sm transition-all border active:scale-90 ${headerTheme === 'light' ? 'bg-white/90 border-gray-100 text-black' : 'bg-white/10 border-white/20 text-white'}`}
          >
            {isMenuOpen ? <ICONS.X /> : <ICONS.Menu />}
          </button>
        </motion.div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[110] bg-black text-white flex flex-col p-8 pt-32"
          >
            <div className="flex justify-between items-center absolute top-8 left-8 right-8">
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => { onNavigate('home'); setIsMenuOpen(false); }}>
                <ICONS.Logo />
                <span className="font-black text-2xl tracking-tighter italic uppercase">PLAYCHALE.</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center"><ICONS.X /></button>
            </div>

            <div className="space-y-8 mt-12">
              {navItems.map((item, idx) => (
                <button 
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setIsMenuOpen(false); }}
                  className="block text-5xl md:text-7xl font-black italic tracking-tighter hover:text-[#C6FF00] transition-all text-left group"
                >
                  <span className="text-xs not-italic opacity-30 mr-6">0{idx+1}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
