'use client';

import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/constants';
import { motion } from 'framer-motion';
import { PlayerProfile, MatchRecord } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardProps {
  player: PlayerProfile;
  isOwner?: boolean;
  onEditStats: () => void;
  onEditProfile: () => void;
  onShareProfile: () => void;
  onViewMatch: (match: any) => void;
}

const ProfileDashboard: React.FC<DashboardProps> = ({
  player, isOwner = false, onEditStats, onEditProfile, onShareProfile, onViewMatch
}) => {
  const [activeSport, setActiveSport] = React.useState(player.mainSport);

  // Derive stats based on active sport, fallback to main stats if missing
  const activeStats = player.sportStats?.[activeSport] || player.stats;

  const metrics = [
    { label: 'Matches', value: activeStats.gamesPlayed, color: 'text-white' },
    { label: 'Win Rate', value: activeStats.winRate, color: 'text-[#C6FF00]' },
    { label: 'Reliability', value: activeStats.reliability, color: 'text-white' },
    { label: 'MVPs', value: activeStats.mvps, color: 'text-white' }
  ];

  const getSportSpecificHighlights = () => {
    const s = activeStats;
    if (activeSport === 'Football') {
      return [
        { label: 'Goals', value: s.goals || 0 },
        { label: 'Assists', value: s.assists || 0 },
        { label: 'Clean Sheets', value: s.cleanSheets || 0 }
      ];
    }
    if (activeSport === 'Basketball') {
      return [
        { label: 'Total Points', value: s.points || 0 },
        { label: 'Rebounds', value: s.rebounds || 0 },
        { label: 'Steals', value: s.steals || 0 }
      ];
    }
    if (activeSport === 'Tennis') {
      return [
        { label: 'Sets Won', value: s.setsWon || 0 },
        { label: 'Aces', value: s.aces || 0 },
        { label: 'Win Streak', value: s.winStreak || 0 }
      ];
    }
    if (activeSport === 'Volleyball') {
      return [
        { label: 'Aces', value: s.aces || 0 },
        { label: 'Blocks', value: s.blocks || 0 },
        { label: 'Digs', value: s.digs || 0 }
      ];
    }
    if (activeSport === 'Swimming') {
      return [
        { label: 'Laps Swum', value: s.lapsSwum || 0 },
        { label: 'Meet Wins', value: s.meetWins || 0 },
        { label: 'Podiums', value: s.podiums || 0 }
      ];
    }
    if (activeSport === 'Athletics') {
      return [
        { label: 'PB Count', value: s.personalBests || 0 },
        { label: 'Meet Wins', value: s.meetWins || 0 },
        { label: 'Podiums', value: s.podiums || 0 }
      ];
    }
    return [];
  };

  // ... richMatchHistory is static mock data in this file. 
  // Ideally it should filter by sport too, but the mock data is hardcoded in the component body (lines 53-103).
  // For now, I will leave match history as is, or filter it? 
  // The user request was "see stats for different sports". 
  // Match history filtering is a nice to have. I'll focus on the stats cards first.

  return (
    <section className="min-h-screen bg-black pt-24 md:pt-32 pb-20 md:pb-32 px-4 md:px-12 text-white overflow-hidden relative">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-[#C6FF00]/5 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-16 items-start">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white/5 backdrop-blur-3xl rounded-[56px] p-8 md:p-10 border border-white/10 space-y-10 relative overflow-hidden shadow-2xl">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <Image src={player.avatar} alt={player.name} width={160} height={160} className="w-40 h-40 rounded-full object-cover border-[6px] border-white/5 shadow-2xl" />
                  <div className="absolute -bottom-1 -right-1 bg-[#C6FF00] text-black w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-2xl uppercase italic">PRO</div>
                </div>
                <div>
                  <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{player.name}</h2>
                  <p className="text-[#C6FF00] font-black uppercase tracking-[0.3em] text-[8px] mt-2">{player.mainSport} Specialist</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4">
                {isOwner && (
                  <button
                    onClick={onEditProfile}
                    className="w-full bg-white/10 text-white py-6 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-white/20 transition-all border border-white/5 flex items-center justify-center gap-3 min-h-[64px]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    Edit Profile
                  </button>
                )}
                <button
                  onClick={onShareProfile}
                  className="w-full bg-[#C6FF00] text-black py-6 rounded-full font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all flex items-center justify-center gap-3 min-h-[64px] shadow-xl shadow-lime-500/10"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                  Share Pro Card
                </button>
                {isOwner && (
                  <button
                    onClick={onEditStats}
                    className="w-full bg-white/5 text-white/60 py-4 rounded-full font-black uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    Update Season Stats
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          <div className="flex-1 w-full">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <h3 className="text-4xl sm:text-6xl md:text-8xl font-black leading-none italic tracking-tighter uppercase">Performance.</h3>

                  {/* Sport Selector */}
                  <div className="w-full md:w-auto">
                    <Select value={activeSport} onValueChange={setActiveSport}>
                      <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10 text-white rounded-full h-12 px-6 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all focus:ring-[#C6FF00]">
                        <SelectValue placeholder="Select Sport" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border border-white/10 text-white rounded-xl">
                        {Object.keys(player.sportStats || {}).map(sport => (
                          <SelectItem
                            key={sport}
                            value={sport}
                            className="font-black uppercase tracking-widest text-[10px] focus:bg-[#C6FF00] focus:text-black py-3 cursor-pointer"
                          >
                            {sport}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {metrics.map((m) => (
                    <div key={m.label} className="bg-white/5 rounded-[40px] p-8 md:p-10 border border-white/10 group hover:bg-white/10 transition-all">
                      <span className={`text-5xl sm:text-6xl md:text-8xl font-black italic tracking-tighter block leading-none mb-4 ${m.color}`}>{m.value}</span>
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/40">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sport Specific Highlights */}
              <div className="space-y-8">
                <h4 className="text-2xl font-black italic tracking-tight uppercase border-l-4 border-[#C6FF00] pl-4">{activeSport} Highlights</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {getSportSpecificHighlights().map((h) => (
                    <div key={h.label} className="bg-white/5 rounded-[32px] p-8 border border-white/5 hover:border-[#C6FF00]/30 transition-all">
                      <span className="block text-4xl font-black text-[#C6FF00] italic mb-1">{h.value}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{h.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h4 className="text-2xl font-black italic tracking-tight uppercase">Recent Match Activity</h4>
                  <button className="text-[#C6FF00] font-black uppercase tracking-widest text-[9px] border-b border-[#C6FF00] pb-1">View Full Log</button>
                </div>
                <div className="space-y-4">
                  {(player.matchHistory || [])
                    .filter(m => m.sport === activeSport)
                    .map((match, i) => (
                      <div key={i} onClick={() => onViewMatch(match)} className="bg-white/5 hover:bg-white/10 transition-all rounded-[32px] p-8 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 cursor-pointer group">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-black border border-white/10 rounded-full flex items-center justify-center font-black text-xs text-[#C6FF00] italic uppercase">{match.date}</div>
                          <div>
                            <h5 className="text-xl font-black tracking-tight mb-1">{match.title}</h5>
                            <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${match.result === 'Win' || match.result === 'W' ? 'text-[#C6FF00]' : 'text-red-500'}`}>
                              <span className={`w-2 h-2 rounded-full ${match.result === 'Win' || match.result === 'W' ? 'bg-[#C6FF00]' : 'bg-red-500'}`}></span>
                              {match.result}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-12 items-center">
                          <div className="text-center">
                            <span className="block text-3xl font-black text-white italic">{match.score.split(' ')[0]}</span>
                            <span className="text-[10px] font-black uppercase opacity-30 tracking-widest">{match.sport === 'Basketball' ? 'Points' : 'Goals'}</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-3xl font-black text-white italic">{match.rating}</span>
                            <span className="text-[10px] font-black uppercase opacity-30 tracking-widest">Rating</span>
                          </div>
                          <div className="p-3 rounded-full bg-white/5 group-hover:bg-[#C6FF00] group-hover:text-black transition-all">
                            <ICONS.ChevronRight />
                          </div>
                        </div>
                      </div>
                    ))}
                  {(player.matchHistory || []).filter(m => m.sport === activeSport).length === 0 && (
                    <div className="text-center py-12 text-white/30 italic">No matches recorded for {activeSport} yet.</div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileDashboard;
