'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
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
  const [activeLocation, setActiveLocation] = useState('All Locations');

  const sports = ['All', 'Football', 'Basketball', 'Tennis', 'Padel'];

  // Extract unique locations dynamically
  const locations = useMemo(() => {
    const locs = new Set(players.map(p => p.location).filter(Boolean));
    return ['All Locations', ...Array.from(locs)];
  }, [players]);

  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesSport = activeSport === 'All' || p.mainSport === activeSport;
      const matchesLocation = activeLocation === 'All Locations' || p.location === activeLocation;
      return matchesSearch && matchesSport && matchesLocation;
    });
  }, [players, search, activeSport, activeLocation]);

  const getPreviewStat = (player: PlayerProfile) => {
    if (player.mainSport === 'Football') return { label: 'Goals', value: player.stats.goals || 0 };
    if (player.mainSport === 'Basketball') return { label: 'Points', value: player.stats.points || 0 };
    if (player.mainSport === 'Tennis' || player.mainSport === 'Padel') return { label: 'Sets Won', value: player.stats.setsWon || 0 };
    return { label: 'Rating', value: player.stats.rating };
  };

  return (
    <section className={`relative overflow-hidden ${isFullPage ? 'bg-[#FDFDFB] pt-24 sm:pt-32 md:pt-40 pb-20 sm:pb-32 md:pb-40' : 'py-20 sm:py-24 md:py-32 bg-black text-white rounded-[40px] sm:rounded-[60px] md:rounded-[120px] mx-2 md:mx-10 mb-20 shadow-2xl'}`}>
      {!isFullPage && (
        <>
          <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#C6FF00]/10 blur-[80px] sm:blur-[120px] rounded-full -mr-20 sm:-mr-40 -mt-20 sm:-mt-40 pointer-events-none opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-blue-500/5 blur-[60px] sm:blur-[100px] rounded-full -ml-10 sm:-ml-20 -mb-10 sm:-mb-20 pointer-events-none"></div>
        </>
      )}

      <div className="max-w-7xl mx-auto relative z-10 px-4 md:px-12">
        {/* Header Section */}
        <div className={`text-center space-y-6 md:space-y-10 mb-12 sm:mb-16 md:mb-24 ${isFullPage ? 'text-black' : 'text-white'}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`inline-flex items-center gap-3 sm:gap-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] ${isFullPage ? 'text-black/30' : 'text-[#C6FF00]'}`}
          >
            <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${isFullPage ? 'bg-black' : 'bg-white animate-pulse'}`}></span>
            {isFullPage ? 'THE COMMUNITY HUB' : 'CITY HALL OF FAME'}
          </motion.div>

          <h2 className={`font-black leading-[0.85] tracking-tighter italic uppercase ${isFullPage ? 'text-5xl sm:text-7xl md:text-[9rem] text-black' : 'text-5xl sm:text-7xl md:text-9xl text-white'}`}>
            Built for <br className="hidden md:block" /> Glory.
          </h2>

          <p className={`font-bold max-w-2xl mx-auto text-sm sm:text-lg md:text-xl leading-tight tracking-tight px-4 ${isFullPage ? 'text-black/60' : 'text-white/50'}`}>
            Where the city's finest record their legacy. Find rivals, climb the ranks, and become an amateur legend.
          </p>

          {isFullPage && (
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pt-4 sm:pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-2 sm:px-0">
                {/* Search Input */}
                <div className="sm:col-span-8 relative group">
                  <input
                    type="text"
                    placeholder="Scout for athletes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-black/5 border-2 border-transparent focus:border-black rounded-full pl-12 sm:pl-16 pr-6 sm:pr-8 py-4 sm:py-6 text-black font-black text-sm sm:text-base outline-none transition-all placeholder:text-black/20 shadow-sm"
                  />
                  <div className="absolute left-6 sm:left-7 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors">
                    <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  </div>
                </div>

                {/* Location Filter Dropdown */}
                <div className="sm:col-span-4 relative group">
                  <select
                    value={activeLocation}
                    onChange={(e) => setActiveLocation(e.target.value)}
                    className="w-full bg-black/5 border-2 border-transparent focus:border-black rounded-full pl-6 pr-10 py-4 sm:py-6 text-black font-black text-sm sm:text-base outline-none transition-all appearance-none cursor-pointer shadow-sm hover:bg-black/10"
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none">
                    <ICONS.MapPin />
                  </div>
                </div>
              </div>

              {/* Sport Filter Pills */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
                {sports.map(sport => (
                  <button
                    key={sport}
                    onClick={() => setActiveSport(sport)}
                    className={`px-5 sm:px-8 py-2 sm:py-3 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeSport === sport ? 'bg-black text-white shadow-xl scale-105' : 'bg-gray-100 text-black/40 hover:bg-gray-200'}`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Players Grid with the "Black-out" hover effect */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 ${isFullPage ? 'w-full' : ''}`}>
          <AnimatePresence mode="popLayout">
            {filteredPlayers.map((player, idx) => {
              const previewStat = getPreviewStat(player);
              const isEven = idx % 2 === 0;

              // Dynamic Theme Logic for Alternating Cards
              let cardClasses = "";
              let textClasses = "";
              let metaClasses = "";
              let borderClasses = "";
              let nameHoverClasses = "";

              if (isFullPage) {
                if (isEven) {
                  // WHITE Card -> BLACK Hover
                  cardClasses = "bg-white hover:bg-black";
                  textClasses = "text-black group-hover:text-white";
                  metaClasses = "text-black/40 group-hover:text-white/50";
                  borderClasses = "border-black/5 group-hover:border-white/10";
                  nameHoverClasses = "group-hover:text-[#C6FF00]";
                } else {
                  // BLACK Card -> WHITE Hover
                  cardClasses = "bg-black hover:bg-white";
                  textClasses = "text-white group-hover:text-black";
                  metaClasses = "text-white/50 group-hover:text-black/40";
                  borderClasses = "border-white/10 group-hover:border-black/5";
                  nameHoverClasses = "group-hover:text-black";
                }
              } else {
                // Widget Mode (Always Dark Transparent)
                cardClasses = "bg-white/5 hover:bg-white/10";
                textClasses = "text-white";
                metaClasses = "text-white/40";
                borderClasses = "border-white/10";
                nameHoverClasses = "group-hover:text-[#C6FF00]";
              }

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
                  className={`group relative overflow-hidden rounded-[32px] sm:rounded-[40px] border transition-all duration-500 cursor-pointer flex flex-col shadow-sm ${cardClasses} ${textClasses} ${borderClasses} hover:shadow-2xl hover:scale-[1.02]`}
                >
                  {/* Morphing Watermark Background */}
                  <div className="absolute -top-10 -right-10 w-48 h-48 sm:w-64 sm:h-64 opacity-[0.03] group-hover:opacity-10 group-hover:rotate-12 transition-all duration-1000 pointer-events-none">
                    <ICONS.Logo />
                  </div>

                  <div className="p-6 sm:p-8 flex flex-col gap-6">
                    {/* Identity Container - Vertical Stack for 3-col */}
                    <div className="relative shrink-0 self-center md:self-start">
                      <div className="relative">
                        <Image
                          src={player.avatar}
                          alt={player.name}
                          width={192}
                          height={192}
                          className="w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-full object-cover border-[6px] sm:border-[8px] border-black/5 group-hover:border-[#C6FF00] transition-all duration-500 shadow-2xl"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-[#C6FF00] text-black w-9 h-9 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-black text-base sm:text-2xl shadow-2xl border-4 border-black group-hover:scale-110 transition-transform">
                          #{idx + 1}
                        </div>
                      </div>
                    </div>

                    {/* Stats & Info Container */}
                    <div className="flex-1 min-w-0 w-full flex flex-col justify-between">
                      <div className="space-y-4 sm:space-y-5 mb-5 sm:mb-8 text-center md:text-left">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center">
                          <span className="bg-[#C6FF00] text-black text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-3 sm:px-4 py-1.5 rounded-full shadow-lg">
                            {player.mainSport}
                          </span>
                          <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-colors ${metaClasses}`}>
                            Verified Legend
                          </span>
                        </div>
                        <h3 className={`text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] italic uppercase ${nameHoverClasses} transition-colors break-words line-clamp-2`}>
                          {player.name}
                        </h3>
                      </div>

                      {/* Rigid Stat Matrix - High Contrast & Symmetrical */}
                      <div className={`grid grid-cols-3 gap-0 border-y py-4 sm:py-8 mb-5 sm:mb-8 transition-colors ${borderClasses}`}>
                        <div className="text-center px-1">
                          <p className={`text-lg sm:text-2xl md:text-3xl font-black italic tracking-tighter mb-1 transition-colors ${textClasses}`}>
                            {player.stats.winRate}
                          </p>
                          <p className={`text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${metaClasses} truncate`}>Win Rate</p>
                        </div>
                        <div className={`text-center border-x px-1 sm:px-4 transition-colors ${borderClasses}`}>
                          <p className={`text-lg sm:text-2xl md:text-3xl font-black italic drop-shadow-sm transition-transform group-hover:scale-110 ${!isFullPage || isEven ? 'text-black group-hover:text-[#C6FF00]' : 'text-[#C6FF00] group-hover:text-black'}`}>
                            {previewStat.value}
                          </p>
                          <p className={`text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${metaClasses} truncate`}>{previewStat.label}</p>
                        </div>
                        <div className="text-center px-1">
                          <p className={`text-lg sm:text-2xl md:text-3xl font-black italic tracking-tighter mb-1 transition-colors ${textClasses}`}>
                            {player.stats.mvps}
                          </p>
                          <p className={`text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${metaClasses} truncate`}>MVPs</p>
                        </div>
                      </div>

                      {/* Scouting Brief */}
                      <div className="flex items-center justify-between gap-3 sm:gap-6 mt-auto">
                        <div className="min-w-0 flex-1">
                          <p className={`text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-1 sm:mb-2 transition-colors ${metaClasses}`}>PLAYER BIO</p>
                          <p className={`text-[10px] sm:text-xs md:text-sm font-bold italic leading-tight line-clamp-2 transition-colors opacity-80 ${textClasses}`}>
                            "{player.bio}"
                          </p>
                        </div>
                        <div className={`p-2 sm:p-3 rounded-2xl transition-all group-hover:translate-x-1 shrink-0 bg-[#C6FF00] text-black`}>
                          <ICONS.ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 sm:mt-24 md:mt-32 text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-white text-black px-8 sm:px-12 md:px-20 py-6 md:py-8 rounded-full font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] hover:bg-[#C6FF00] hover:text-black transition-all hover:scale-105 shadow-2xl flex items-center gap-3 sm:gap-5 mx-auto"
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
