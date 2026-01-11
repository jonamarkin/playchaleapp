'use client';

import React, { useState, useMemo } from 'react';
import { ICONS } from '@/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerProfile } from '@/types';

interface TopPlayersProps {
  players: PlayerProfile[];
  onOpenPlayer: (p: PlayerProfile) => void;
  isFullPage?: boolean;
}

const TopPlayers: React.FC<TopPlayersProps> = ({ players, onOpenPlayer, isFullPage = false }) => {
  const [search, setSearch] = useState('');
  const [activeSport, setActiveSport] = useState('All');

  const sports = ['All', 'Football', 'Basketball', 'Tennis', 'Padel'];

  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesSport = activeSport === 'All' || p.mainSport === activeSport;
      return matchesSearch && matchesSport;
    });
  }, [players, search, activeSport]);

  const getPreviewStat = (player: PlayerProfile) => {
    if (player.mainSport === 'Football') return { label: 'Goals', value: player.stats.goals || 0 };
    if (player.mainSport === 'Basketball') return { label: 'Points', value: player.stats.points || 0 };
    if (player.mainSport === 'Tennis' || player.mainSport === 'Padel') return { label: 'Sets Won', value: player.stats.setsWon || 0 };
    return { label: 'Rating', value: player.stats.rating };
  };

  return (
    <section className={`relative overflow-hidden ${isFullPage ? 'bg-[#FDFDFB] pt-32 md:pt-40 pb-40' : 'py-24 md:py-32 bg-black text-white rounded-[60px] md:rounded-[120px] mx-2 md:mx-10 mb-20 shadow-2xl'}`}>
      {!isFullPage && (
        <>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C6FF00]/10 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full -ml-20 -mb-20 pointer-events-none"></div>
        </>
      )}
      
      <div className="max-w-7xl mx-auto relative z-10 px-4 md:px-12">
        {/* Header Section */}
        <div className={`text-center space-y-6 md:space-y-10 mb-16 md:mb-24 ${isFullPage ? 'text-black' : 'text-white'}`}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            className={`inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.6em] ${isFullPage ? 'text-black/30' : 'text-[#C6FF00]'}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isFullPage ? 'bg-black' : 'bg-white animate-pulse'}`}></span>
            {isFullPage ? 'THE COMMUNITY HUB' : 'CITY HALL OF FAME'}
          </motion.div>
          
          <h2 className={`font-black leading-[0.85] tracking-tighter italic uppercase ${isFullPage ? 'text-6xl md:text-[9rem] text-black' : 'text-6xl md:text-9xl text-white'}`}>
            Built for <br className="hidden md:block" /> Glory.
          </h2>
          
          <p className={`font-bold max-w-2xl mx-auto text-lg md:text-xl leading-tight tracking-tight ${isFullPage ? 'text-black/60' : 'text-white/50'}`}>
            Where the city's finest record their legacy. Find rivals, climb the ranks, and become an amateur legend.
          </p>

          {isFullPage && (
            <div className="max-w-4xl mx-auto space-y-8 pt-6">
              <div className="relative group">
                <input 
                  type="text"
                  placeholder="Scout for athletes or search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-black/5 border-2 border-transparent focus:border-black rounded-full pl-16 pr-8 py-5 md:py-6 text-black font-black outline-none transition-all placeholder:text-black/20 shadow-sm"
                />
                <div className="absolute left-7 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                {sports.map(sport => (
                  <button 
                    key={sport} 
                    onClick={() => setActiveSport(sport)} 
                    className={`px-6 md:px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeSport === sport ? 'bg-black text-white shadow-xl scale-105' : 'bg-gray-100 text-black/40 hover:bg-gray-200'}`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Players Grid with the "Black-out" hover effect */}
        <div className={`grid grid-cols-1 gap-6 md:gap-10 ${isFullPage ? 'lg:grid-cols-2' : 'lg:grid-cols-2'}`}>
          <AnimatePresence mode="popLayout">
            {filteredPlayers.map((player, idx) => {
              const previewStat = getPreviewStat(player);
              
              // Dynamic Theme Logic for the "Black-out" effect
              const cardBaseClasses = isFullPage 
                ? "bg-white border-black/5 text-black hover:bg-black hover:text-white" 
                : "bg-white/5 border-white/10 text-white hover:bg-white/10";

              return (
                <motion.div 
                  key={player.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  onClick={() => onOpenPlayer(player)}
                  className={`group relative overflow-hidden rounded-[56px] md:rounded-[72px] border transition-all duration-500 cursor-pointer flex flex-col shadow-sm ${cardBaseClasses} hover:shadow-2xl hover:scale-[1.02]`}
                >
                  {/* Morphing Watermark Background */}
                  <div className="absolute -top-10 -right-10 w-64 h-64 opacity-[0.03] group-hover:opacity-10 group-hover:rotate-12 transition-all duration-1000 pointer-events-none">
                    <ICONS.Logo />
                  </div>

                  <div className="p-10 md:p-12 xl:p-14 flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-12">
                    {/* Identity Container */}
                    <div className="relative shrink-0">
                      <div className="relative">
                        <img 
                          src={player.avatar} 
                          alt={player.name} 
                          className="w-36 h-36 md:w-48 md:h-48 rounded-full object-cover border-[8px] border-black/5 group-hover:border-[#C6FF00] transition-all duration-500 shadow-2xl" 
                        />
                        <div className="absolute -bottom-2 -right-2 bg-[#C6FF00] text-black w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl shadow-2xl border-4 border-black group-hover:scale-110 transition-transform">
                          #{idx + 1}
                        </div>
                      </div>
                    </div>

                    {/* Stats & Info Container */}
                    <div className="flex-1 min-w-0 w-full flex flex-col justify-between">
                      <div className="space-y-5 mb-8 text-center md:text-left">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2.5 items-center">
                          <span className="bg-[#C6FF00] text-black text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                            {player.mainSport}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isFullPage ? 'text-black/30 group-hover:text-white/40' : 'text-white/40'}`}>
                            Verified Legend
                          </span>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-none italic uppercase group-hover:text-[#C6FF00] transition-colors truncate">
                          {player.name}
                        </h3>
                      </div>

                      {/* Rigid Stat Matrix - High Contrast & Symmetrical */}
                      <div className={`grid grid-cols-3 gap-0 border-y py-8 mb-8 transition-colors ${isFullPage ? 'border-black/5 group-hover:border-white/10' : 'border-white/5'}`}>
                        <div className="text-center px-2">
                          <p className="text-2xl md:text-3xl font-black italic tracking-tighter mb-1 transition-colors group-hover:text-white">
                            {player.stats.winRate}
                          </p>
                          <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${isFullPage ? 'text-black/30 group-hover:text-white/30' : 'text-white/30'} truncate`}>Win Rate</p>
                        </div>
                        <div className={`text-center border-x px-4 transition-colors ${isFullPage ? 'border-black/5 group-hover:border-white/10' : 'border-white/5'}`}>
                          <p className="text-2xl md:text-3xl font-black italic text-[#C6FF00] drop-shadow-sm transition-transform group-hover:scale-110">
                            {previewStat.value}
                          </p>
                          <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${isFullPage ? 'text-black/30 group-hover:text-white/30' : 'text-white/30'} truncate`}>{previewStat.label}</p>
                        </div>
                        <div className="text-center px-2">
                          <p className="text-2xl md:text-3xl font-black italic tracking-tighter mb-1 transition-colors group-hover:text-white">
                            {player.stats.mvps}
                          </p>
                          <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${isFullPage ? 'text-black/30 group-hover:text-white/30' : 'text-white/30'} truncate`}>MVPs</p>
                        </div>
                      </div>

                      {/* Scouting Brief */}
                      <div className="flex items-center justify-between gap-6 mt-auto">
                        <div className="min-w-0 flex-1">
                          <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 transition-colors ${isFullPage ? 'text-black/20 group-hover:text-white/20' : 'text-white/20'}`}>Latest Scouting Brief</p>
                          <p className={`text-xs md:text-sm font-bold italic leading-tight truncate transition-colors ${isFullPage ? 'text-black/60 group-hover:text-white/70' : 'text-white/60'}`}>
                            "{player.recentActivity}"
                          </p>
                        </div>
                        <div className={`p-3 rounded-2xl transition-all group-hover:translate-x-1 shrink-0 ${isFullPage ? 'bg-black/5 group-hover:bg-[#C6FF00] group-hover:text-black' : 'bg-white/5 group-hover:bg-[#C6FF00] group-hover:text-black'}`}>
                          <ICONS.ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {!isFullPage && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-24 md:mt-32 text-center">
             <button 
               onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
               className="bg-white text-black px-12 md:px-20 py-6 md:py-8 rounded-full font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] hover:bg-[#C6FF00] hover:text-black transition-all hover:scale-105 shadow-2xl flex items-center gap-5 mx-auto"
             >
               View Full City Rankings
               <div className="bg-black text-[#C6FF00] p-2 rounded-full"><ICONS.ChevronRight /></div>
             </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TopPlayers;
