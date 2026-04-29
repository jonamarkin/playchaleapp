'use client';

import React from 'react';
import Image from 'next/image';
import { Activity, BarChart3, History, Pencil, Settings2, Share2, UserRound } from 'lucide-react';
import { ICONS } from '@/constants/icons';
import { PlayerProfile, MatchRecord } from '@/types';
import ImageUpload from './ImageUpload';
import { usePlayChale } from '@/providers/PlayChaleProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DashboardProps {
  player: PlayerProfile;
  isOwner?: boolean;
  onEditStats: () => void;
  onEditProfile: () => void;
  onShareProfile: () => void;
  onViewMatch: (match: ProfileMatchRecord) => void;
}

type ProfileMatchRecord = MatchRecord & { slug?: string };

const MOBILE_PROFILE_TABS = [
  { id: 'overview', label: 'Overview', icon: UserRound },
  { id: 'stats', label: 'Stats', icon: Activity },
  { id: 'history', label: 'History', icon: History },
  { id: 'actions', label: 'Actions', icon: Settings2 },
] as const;

type MobileProfileTab = (typeof MOBILE_PROFILE_TABS)[number]['id'];

const ProfileDashboard: React.FC<DashboardProps> = ({
  player, isOwner = false, onEditStats, onEditProfile, onShareProfile, onViewMatch
}) => {
  const { uploadAvatar } = usePlayChale();
  const [activeSport, setActiveSport] = React.useState(player.mainSport);
  const [activeMobileTab, setActiveMobileTab] = React.useState<MobileProfileTab>('overview');

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

  const sportHighlights = getSportSpecificHighlights();
  const filteredMatches = (player.matchHistory || []).filter(m => m.sport === activeSport);

  const renderSportSelector = () => (
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
  );

  const renderProfileActions = () => (
    <div className="grid grid-cols-1 gap-3 md:gap-4 pt-0 md:pt-4">
      {isOwner && (
        <button
          onClick={onEditProfile}
          className="pc-btn-press touch-target w-full bg-white/10 text-white py-5 md:py-6 rounded-full font-black uppercase tracking-widest text-[10px] md:text-[11px] hover:bg-white/20 transition-all border border-white/5 flex items-center justify-center gap-3 min-h-[58px] md:min-h-[64px]"
        >
          <Pencil className="h-4 w-4" />
          Edit Profile
        </button>
      )}
      <button
        onClick={onShareProfile}
        className="pc-btn-press touch-target w-full bg-[#C6FF00] text-black py-5 md:py-6 rounded-full font-black uppercase tracking-widest text-[10px] md:text-[11px] transition-all flex items-center justify-center gap-3 min-h-[58px] md:min-h-[64px] shadow-xl shadow-lime-500/10"
      >
        <Share2 className="h-4 w-4" />
        Share Pro Card
      </button>
      {isOwner && (
        <button
          onClick={onEditStats}
          className="pc-btn-press touch-target w-full bg-white/5 text-white/60 py-4 rounded-full font-black uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all flex items-center justify-center gap-2 min-h-[52px]"
        >
          <BarChart3 className="h-4 w-4" />
          Update Season Stats
        </button>
      )}
    </div>
  );

  return (
    <section className="min-h-screen bg-black pt-5 md:pt-32 pb-[calc(8.75rem+env(safe-area-inset-bottom))] md:pb-32 px-3 md:px-12 text-white overflow-x-hidden relative">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-[#C6FF00]/5 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-5 md:gap-16 items-start">

          <div className="pc-view-enter w-full lg:w-[380px] shrink-0">
            <div className="bg-white/5 backdrop-blur-3xl rounded-[32px] md:rounded-[56px] p-5 md:p-10 border border-white/10 space-y-6 md:space-y-10 relative overflow-hidden shadow-2xl">
              <div className="flex flex-row md:flex-col items-center md:text-center gap-4 md:gap-0 md:space-y-6">
                <div className="relative">
                  {isOwner ? (
                    <ImageUpload
                      currentImage={player.avatar}
                      eager
                      onImageSelected={async (file) => {
                        await uploadAvatar(file);
                      }}
                    />
                  ) : (
                    <Image src={player.avatar} alt={player.name} width={160} height={160} loading="eager" className="w-28 h-28 md:w-40 md:h-40 rounded-full object-cover border-[6px] border-white/5 shadow-2xl" />
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-[#C6FF00] text-black w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-sm md:text-lg shadow-2xl uppercase italic">PRO</div>
                </div>
                <div className="min-w-0 flex-1 md:flex-none">
                  <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">{player.name}</h2>
                  <p className="text-[#C6FF00] font-black uppercase tracking-[0.3em] text-[8px] mt-2">{player.mainSport} Specialist</p>
                  <div className="md:hidden mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-black/30 border border-white/5 px-3 py-2">
                      <span className="block text-lg font-black italic text-white leading-none">{activeStats.rating}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Rating</span>
                    </div>
                    <div className="rounded-2xl bg-black/30 border border-white/5 px-3 py-2">
                      <span className="block text-lg font-black italic text-[#C6FF00] leading-none">{activeStats.winRate}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Wins</span>
                    </div>
                    <div className="rounded-2xl bg-black/30 border border-white/5 px-3 py-2">
                      <span className="block text-lg font-black italic text-white leading-none">{activeStats.mvps}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/30">MVPs</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                {renderProfileActions()}
              </div>
            </div>
          </div>

          <div className="md:hidden sticky top-3 z-30 w-full space-y-3">
            <div className="rounded-[28px] border border-white/10 bg-black/75 p-1.5 shadow-2xl backdrop-blur-2xl">
              <div className="grid grid-cols-4 gap-1">
                {MOBILE_PROFILE_TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeMobileTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveMobileTab(tab.id)}
                      className={`pc-btn-press touch-target flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-[22px] text-[8px] font-black uppercase tracking-[0.12em] transition-all ${isActive ? 'bg-[#C6FF00] text-black shadow-lg shadow-lime-500/15' : 'text-white/45 hover:bg-white/10 hover:text-white'}`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-full border border-white/10 bg-black/70 p-1.5 shadow-xl backdrop-blur-2xl">
              {renderSportSelector()}
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="pc-fade-right space-y-8 md:space-y-16">
              <div className={`${activeMobileTab === 'overview' ? 'block' : 'hidden'} md:block space-y-5 md:space-y-10`}>
                <div className="hidden md:flex md:items-center justify-between gap-6">
                  <h3 className="text-4xl sm:text-6xl md:text-8xl font-black leading-none italic tracking-tighter uppercase">Performance.</h3>

                  {/* Sport Selector */}
                  <div className="w-full md:w-auto">
                    {renderSportSelector()}
                  </div>
                </div>
                <div className="md:hidden space-y-1">
                  <h3 className="text-3xl font-black leading-none italic tracking-tighter uppercase">Overview</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/35">{activeSport} performance snapshot</p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-6">
                  {metrics.map((m) => (
                    <div key={m.label} className="bg-white/5 rounded-[28px] md:rounded-[40px] p-5 md:p-10 border border-white/10 group hover:bg-white/10 transition-all">
                      <span className={`text-4xl sm:text-6xl md:text-8xl font-black italic tracking-tighter block leading-none mb-3 md:mb-4 ${m.color}`}>{m.value}</span>
                      <span className="text-[9px] md:text-xs font-black uppercase tracking-[0.22em] md:tracking-[0.4em] text-white/40">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sport Specific Highlights */}
              <div className={`${activeMobileTab === 'stats' ? 'block' : 'hidden'} md:block space-y-5 md:space-y-8`}>
                <div className="space-y-1">
                  <h4 className="text-2xl font-black italic tracking-tight uppercase border-l-4 border-[#C6FF00] pl-4">{activeSport} Highlights</h4>
                  <p className="md:hidden pl-5 text-[10px] font-black uppercase tracking-widest text-white/35">Sport-specific form and production</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {sportHighlights.map((h) => (
                    <div key={h.label} className="bg-white/5 rounded-[28px] md:rounded-[32px] p-5 md:p-8 border border-white/5 hover:border-[#C6FF00]/30 transition-all">
                      <span className="block text-3xl md:text-4xl font-black text-[#C6FF00] italic mb-1">{h.value}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{h.label}</span>
                    </div>
                  ))}
                  {sportHighlights.length === 0 && (
                    <div className="col-span-2 md:col-span-3 text-center py-12 text-white/30 italic">No highlights recorded for {activeSport} yet.</div>
                  )}
                </div>
              </div>

              <div className={`${activeMobileTab === 'history' ? 'block' : 'hidden'} md:block space-y-5 md:space-y-8`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-2xl font-black italic tracking-tight uppercase">Recent Match Activity</h4>
                    <p className="md:hidden mt-1 text-[10px] font-black uppercase tracking-widest text-white/35">{activeSport} match log</p>
                  </div>
                  <button className="hidden md:block text-[#C6FF00] font-black uppercase tracking-widest text-[9px] border-b border-[#C6FF00] pb-1">View Full Log</button>
                </div>
                <div className="space-y-4">
                  {filteredMatches.map((match) => (
                    <div key={match.id} onClick={() => onViewMatch(match)} className="pc-btn-press touch-target bg-white/5 hover:bg-white/10 transition-all rounded-[28px] md:rounded-[32px] p-4 md:p-8 border border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-5 md:gap-6 cursor-pointer group">
                      <div className="flex items-center gap-4 md:gap-6 min-w-0">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-black border border-white/10 rounded-full flex items-center justify-center font-black text-[10px] md:text-xs text-[#C6FF00] italic uppercase shrink-0">{match.date}</div>
                        <div className="min-w-0">
                          <h5 className="text-lg md:text-xl font-black tracking-tight mb-1 truncate">{match.title}</h5>
                          <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${match.result === 'Win' || match.result === 'W' ? 'text-[#C6FF00]' : 'text-red-500'}`}>
                            <span className={`w-2 h-2 rounded-full ${match.result === 'Win' || match.result === 'W' ? 'bg-[#C6FF00]' : 'bg-red-500'}`}></span>
                            {match.result}
                          </span>
                        </div>
                      </div>
                      <div className="flex w-full md:w-auto justify-between md:justify-start gap-4 md:gap-12 items-center rounded-[24px] md:rounded-none bg-black/20 md:bg-transparent p-3 md:p-0">
                        <div className="text-center">
                          <span className="block text-2xl md:text-3xl font-black text-white italic">{match.score.split(' ')[0]}</span>
                          <span className="text-[10px] font-black uppercase opacity-30 tracking-widest">{match.sport === 'Basketball' ? 'Points' : 'Goals'}</span>
                        </div>
                        <div className="text-center">
                          <span className="block text-2xl md:text-3xl font-black text-white italic">{match.rating}</span>
                          <span className="text-[10px] font-black uppercase opacity-30 tracking-widest">Rating</span>
                        </div>
                        <div className="p-3 rounded-full bg-white/5 group-hover:bg-[#C6FF00] group-hover:text-black transition-all shrink-0">
                          <ICONS.ChevronRight />
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredMatches.length === 0 && (
                    <div className="text-center py-12 text-white/30 italic">No matches recorded for {activeSport} yet.</div>
                  )}
                </div>
              </div>

              <div className={`${activeMobileTab === 'actions' ? 'block' : 'hidden'} md:hidden space-y-4`}>
                <div>
                  <h4 className="text-2xl font-black italic tracking-tight uppercase">Profile Actions</h4>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-white/35">{isOwner ? 'Manage your player card' : 'Share this player card'}</p>
                </div>
                <div className="rounded-[32px] border border-white/10 bg-white/5 p-4">
                  {renderProfileActions()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileDashboard;
