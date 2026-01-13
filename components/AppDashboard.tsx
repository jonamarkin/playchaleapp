'use client';

import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/constants';
import { motion } from 'framer-motion';
import { PlayerProfile, Game } from '@/types';

interface AppDashboardProps {
  player: PlayerProfile;
  upcomingGames: Game[];
  onViewMatch: (game: Game) => void;
  onNavigate: (view: any) => void;
}

const AppDashboard: React.FC<AppDashboardProps> = ({ player, upcomingGames, onViewMatch, onNavigate }) => {
  return (
    <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 md:px-12 min-h-screen bg-[#FDFDFB]">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 md:space-y-16">
        {/* Welcome Header */}
        <header className="flex flex-col gap-6 sm:gap-8">
          <div className="space-y-3 sm:space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-black/30"
            >
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-black"></span>
              Athlete Command Center
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black italic tracking-tighter uppercase leading-[0.85]"
            >
              Welcome back, <br /> <span className="text-[#C6FF00] bg-black px-3 sm:px-5 inline-block -rotate-1 shadow-2xl">{player.name.split(' ')[0]}</span>
            </motion.h1>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-black text-white p-5 sm:p-6 md:p-8 rounded-[32px] sm:rounded-[40px] flex items-center gap-5 sm:gap-8 shadow-2xl relative overflow-hidden w-fit"
          >
            <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-5 rotate-12"><ICONS.Logo /></div>
            <div className="text-right">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">City Rank</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-black italic text-[#C6FF00]">#1,242</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#C6FF00] text-black flex items-center justify-center font-black shadow-xl">
              <ICONS.UpArrow />
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 md:gap-14">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-8 sm:space-y-10 md:space-y-12">
            {/* Spotlight Match */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative aspect-[4/3] sm:aspect-video md:aspect-[21/9] rounded-[32px] sm:rounded-[48px] md:rounded-[56px] overflow-hidden group cursor-pointer shadow-2xl border-2 sm:border-4 border-black/5"
              onClick={() => onViewMatch(upcomingGames[0])}
            >
              <Image
                src={upcomingGames[0].imageUrl}
                alt={upcomingGames[0].title}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover transition-transform duration-[2s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 p-6 sm:p-8 md:p-10 lg:p-14 flex flex-col justify-end sm:justify-center">
                <span className="bg-[#C6FF00] text-black px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-3 sm:mb-4 md:mb-6 inline-block w-fit shadow-lg">Spotlight Match Today</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black text-white italic uppercase tracking-tighter mb-3 sm:mb-4 md:mb-6 leading-none">{upcomingGames[0].title}</h2>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8 text-white/70 font-black uppercase tracking-widest text-[8px] sm:text-[9px] md:text-[10px]">
                  <div className="flex items-center gap-2 sm:gap-3"><ICONS.Clock /> {upcomingGames[0].time}</div>
                  <div className="flex items-center gap-2 sm:gap-3"><ICONS.MapPin /> {upcomingGames[0].location.split('•')[0]}</div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions & Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {[
                { label: 'Win Rate', value: player.stats.winRate, icon: <div className="scale-50 sm:scale-75"><ICONS.Logo /></div>, bg: "bg-white", textColor: "text-black", labelColor: "text-black/30", iconColor: "text-black/10" },
                { label: 'Season MVPs', value: player.stats.mvps, icon: <ICONS.UpArrow />, bg: "bg-black", textColor: "text-[#C6FF00]", labelColor: "text-white/40", iconColor: "text-[#C6FF00]/30" },
                { label: 'Match Reliability', value: player.stats.reliability, icon: <ICONS.Clock />, bg: "bg-white", textColor: "text-black", labelColor: "text-black/30", iconColor: "text-black/10" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -8 }}
                  className={`${stat.bg} border-2 ${stat.bg === 'bg-black' ? 'border-white/10' : 'border-black/5'} rounded-[32px] sm:rounded-[40px] md:rounded-[44px] p-6 sm:p-8 md:p-10 hover:border-[#C6FF00] transition-all shadow-sm flex flex-col justify-between min-h-[140px] sm:min-h-[160px]`}
                >
                  <div className={`${stat.iconColor} mb-4 sm:mb-6 md:mb-8`}>{stat.icon}</div>
                  <div>
                    <h3 className={`text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter leading-none mb-1 ${stat.textColor}`}>{stat.value}</h3>
                    <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${stat.labelColor}`}>{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Match Feed */}
            <div className="space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-0 border-b border-black/5 pb-4 sm:pb-6">
                <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">Recommended Games</h3>
                <button onClick={() => onNavigate('discover')} className="text-black/40 hover:text-black font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] transition-colors">View All Matches</button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8">
                {upcomingGames.slice(1, 3).map(game => (
                  <motion.div
                    key={game.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onViewMatch(game)}
                    className="bg-white border-2 border-black/5 p-5 sm:p-6 md:p-8 rounded-[32px] sm:rounded-[40px] md:rounded-[48px] flex gap-4 sm:gap-5 md:gap-6 items-center hover:bg-black hover:text-white transition-all cursor-pointer group shadow-sm"
                  >
                    <Image src={game.imageUrl} alt={game.title} width={96} height={96} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-[20px] sm:rounded-[28px] md:rounded-[32px] object-cover shadow-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#C6FF00] mb-1 sm:mb-2 block">{game.sport}</span>
                      <h4 className="text-base sm:text-lg md:text-xl font-black italic uppercase tracking-tighter group-hover:text-white transition-colors truncate">{game.title}</h4>
                      <div className="flex items-center gap-3 sm:gap-4 mt-1 sm:mt-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-40">
                        <ICONS.Clock /> {game.time}
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 bg-black/5 group-hover:bg-[#C6FF00] group-hover:text-black rounded-full transition-all shrink-0">
                      <ICONS.ChevronRight />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8 sm:space-y-10 md:space-y-12">
            {/* Athlete Pro Profile */}
            <div className="bg-black text-white rounded-[40px] sm:rounded-[48px] md:rounded-[60px] p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8 md:space-y-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 sm:p-8 md:p-10 opacity-10 pointer-events-none"><ICONS.Logo /></div>
              <div className="flex items-center gap-5 sm:gap-6 md:gap-8 relative z-10">
                <Image src={player.avatar} alt={player.name} width={96} height={96} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-3 sm:border-4 border-[#C6FF00] shadow-2xl" />
                <div className="min-w-0">
                  <h4 className="text-lg sm:text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-none truncate">{player.name}</h4>
                  <p className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#C6FF00] mt-1 sm:mt-2">{player.mainSport} Elite</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 py-5 sm:py-6 md:py-8 border-y border-white/10">
                <div>
                  <span className="block text-xl sm:text-2xl font-black italic">{player.stats.gamesPlayed}</span>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase text-white/30 tracking-widest">Matches</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-black italic">{player.stats.rating}</span>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase text-white/30 tracking-widest">Season Rtg</span>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4 pt-2">
                <button onClick={() => onNavigate('stats')} className="w-full bg-[#C6FF00] text-black py-4 sm:py-5 rounded-full font-black uppercase tracking-widest text-[10px] sm:text-[11px] hover:scale-105 transition-all shadow-xl shadow-lime-500/10">Manage Pro Profile</button>
                <button onClick={() => onNavigate('community')} className="w-full bg-white/5 border border-white/10 py-4 sm:py-5 rounded-full font-black uppercase tracking-widest text-[10px] sm:text-[11px] hover:bg-white/10 transition-all">Scout Competitors</button>
              </div>
            </div>

            {/* Rising Legends Leaderboard Preview */}
            <div className="space-y-6 sm:space-y-8 bg-gray-50 p-6 sm:p-8 md:p-10 rounded-[40px] sm:rounded-[48px] md:rounded-[56px] border border-black/5">
              <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter">Rising Legends</h3>
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-5 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl sm:rounded-2xl bg-black text-[#C6FF00] flex items-center justify-center font-black text-[10px] sm:text-xs italic shrink-0">#{i + 1}</div>
                      <div className="min-w-0">
                        <p className="font-black italic text-sm sm:text-base uppercase tracking-tight group-hover:text-black transition-colors truncate">Legend_Athlete_{i}</p>
                        <p className="text-[8px] sm:text-[9px] font-black uppercase text-black/30 tracking-widest">Unbeaten Streak: {i * 4}</p>
                      </div>
                    </div>
                    <div className="text-black bg-[#C6FF00] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-sm hover:scale-110 transition-all shrink-0">Follow</div>
                  </div>
                ))}
              </div>
              <button onClick={() => onNavigate('community')} className="w-full py-3 sm:py-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-black/30 hover:text-black transition-colors">View Global Rankings</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDashboard;

