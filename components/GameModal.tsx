'use client';

import React, { useState, useEffect } from 'react';
import { ICONS } from '@/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Game, PlayerProfile, Challenge, Participant, JoinRequest, MatchRecord } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ModalProps {
  type: 'join' | 'create' | 'profile' | 'stats' | 'match-detail' | 'edit-profile' | 'share-profile' | 'contact-organizer' | 'challenge' | 'detailed-stats' | 'manage-game' | null;
  item?: any;
  onClose: () => void;
  onJoin?: (id: string) => void;
  onCreate?: (game: Partial<Game>) => void;
  onUpdateStats?: (playerId: string, stats: any) => void;
  onUpdateProfile?: (playerId: string, profile: Partial<PlayerProfile>) => void;
  onOpenContact?: (item: any) => void;
  onSendMessage?: (gameId: string, content: string) => void;
  onSendChallenge?: (recipient: PlayerProfile, challenge: Partial<Challenge>) => void;
  onUpdateGame?: (gameId: string, updates: Partial<Game>) => void;
  onManageRequest?: (gameId: string, requestId: string, accept: boolean) => void;
  onRemoveParticipant?: (gameId: string, playerId: string) => void;
  onShareMatch?: (game: Game) => void;
  onShareProfile?: () => void;
}

const SPORT_ICONS: Record<string, React.ReactNode> = {
  'Football': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m6.7 6.7 10.6 10.6" /><path d="m17.3 6.7-10.6 10.6" /></svg>,
  'Basketball': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20" /><path d="M2 12h20" /><path d="M12 2a14.5 14.5 0 0 1 0 20" /></svg>,
  'Tennis': <ICONS.TennisBall className="scale-75" />,
  'Padel': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M6 12h12" /><path d="M12 6v12" /></svg>,
  'Badminton': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10a5 5 0 1 1 10 0v10l-5-3-5 3V10Z" /><path d="M12 17v4" /></svg>
};

const ProSelect = ({ value, onChange, options, label, iconMap }: { value: string, onChange: (v: string) => void, options: string[], label: string, iconMap?: Record<string, React.ReactNode> }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative space-y-2">
      <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-full px-6 py-4 text-white font-bold outline-none transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          {iconMap?.[value] && <span className="text-[#C6FF00]">{iconMap[value]}</span>}
          <span>{value}</span>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#C6FF00]' : 'text-white/20'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[210]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-[32px] overflow-hidden z-[220] shadow-2xl backdrop-blur-3xl"
            >
              <div className="p-2 space-y-1">
                {options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { onChange(opt); setIsOpen(false); }}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${value === opt ? 'bg-[#C6FF00] text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-4">
                      {iconMap?.[opt] && (
                        <span className={`transition-colors ${value === opt ? 'text-black' : 'text-[#C6FF00]/40 group-hover:text-[#C6FF00]'}`}>
                          {iconMap[opt]}
                        </span>
                      )}
                      <span className="font-bold">{opt}</span>
                    </div>
                    {value === opt && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const GameModal: React.FC<ModalProps> = ({
  type: initialType, item: initialItem, onClose, onJoin, onCreate, onUpdateStats, onUpdateProfile, onOpenContact, onSendMessage, onSendChallenge, onUpdateGame, onManageRequest, onRemoveParticipant, onShareMatch, onShareProfile
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [type, setType] = useState(initialType);
  const [item, setItem] = useState(initialItem);
  const [history, setHistory] = useState<{ type: any, item: any }[]>([]);
  const [contactMessage, setContactMessage] = useState('');

  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Game>>({});
  const [profileForm, setProfileForm] = useState<Partial<PlayerProfile>>({});
  const [statsForm, setStatsForm] = useState<any>({});
  const [careerStatsForm, setCareerStatsForm] = useState<any>({});
  const [createForm, setCreateForm] = useState<Partial<Game>>({
    sport: 'Football',
    title: '',
    location: '',
    time: '18:00',
    date: 'Today',
    spotsTotal: 10,
    skillLevel: 'All Levels',
    price: '$5'
  });

  useEffect(() => {
    if (type === 'manage-game' && item) {
      setEditForm({
        title: item.title,
        location: item.location,
        time: item.time,
        date: item.date,
        spotsTotal: item.spotsTotal,
        skillLevel: item.skillLevel
      });
    }
    if (type === 'edit-profile' && item) {
      setProfileForm({
        name: item.name,
        mainSport: item.mainSport,
        avatar: item.avatar
      });
    }
    if (type === 'stats' && item) {
      setStatsForm({ ...item.attributes });
      setCareerStatsForm({ ...item.stats });
    }
  }, [type, item]);

  // Challenge specific state
  const [challengeSport, setChallengeSport] = useState('Football');
  const [challengeType, setChallengeType] = useState<'1v1' | '2v2' | 'Team'>('1v1');
  const [challengeMsg, setChallengeMsg] = useState('');

  const isDarkTheme = type === 'join' || type === 'create' || type === 'contact-organizer' || type === 'share-profile' || type === 'match-detail' || type === 'profile' || type === 'challenge' || type === 'detailed-stats' || type === 'manage-game' || type === 'edit-profile' || type === 'stats';

  const handleChallengeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onSendChallenge?.(item as PlayerProfile, {
        sport: challengeSport,
        type: challengeType,
        message: challengeMsg
      });
      setLoading(false);
      setStep(2);
      setTimeout(onClose, 2000);
    }, 1200);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onCreate?.(createForm);
      setLoading(false);
      setStep(2);
      setTimeout(onClose, 2000);
    }, 1500);
  };

  const handleJoinSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      onJoin?.(item.id);
      setLoading(false);
      setStep(2);
      setTimeout(onClose, 2000);
    }, 1200);
  };

  const handleUpdateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onUpdateGame?.(item.id, editForm);
      setLoading(false);
      setIsEditing(false);
    }, 1000);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onUpdateProfile?.(item.id, profileForm);
      setLoading(false);
      setStep(2);
      setTimeout(onClose, 2000);
    }, 1000);
  };

  const handleStatsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      // Merge career stats back into the update
      onUpdateStats?.(item.id, { ...statsForm, ...careerStatsForm });
      setLoading(false);
      setStep(2);
      setTimeout(onClose, 2000);
    }, 1000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onSendMessage?.(item.id, contactMessage);
      setLoading(false);
      setStep(2);
      setTimeout(onClose, 2000);
    }, 1200);
  };

  const goBack = () => {
    if (history.length > 0) {
      const last = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setType(last.type);
      setItem(last.item);
    }
  };

  const pushView = (newType: any, newItem?: any) => {
    setHistory(prev => [...prev, { type, item }]);
    setType(newType);
    if (newItem) setItem(newItem);
  };

  const game = (type === 'join' || type === 'contact-organizer' || type === 'manage-game') ? item as Game : null;
  const completedMatch = type === 'match-detail' ? item as MatchRecord : null;
  const player = (type === 'profile' || type === 'detailed-stats' || type === 'challenge' || type === 'edit-profile' || type === 'stats' || type === 'share-profile') ? item as PlayerProfile : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className={`relative w-full max-w-2xl rounded-[40px] md:rounded-[56px] shadow-2xl overflow-y-auto max-h-[90vh] ${isDarkTheme ? 'bg-black border border-white/10 text-white' : 'bg-white text-black'} p-6 md:p-12 hide-scrollbar`}
      >
        <div className="absolute top-6 right-6 md:top-8 md:right-8 flex gap-2 md:gap-3 z-20">
          {history.length > 0 && (
            <button onClick={goBack} className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all ${isDarkTheme ? 'bg-white/10 text-white hover:bg-[#C6FF00] hover:text-black' : 'bg-gray-100 text-black hover:bg-black hover:text-white'}`}>
              <div className="rotate-180 scale-110 md:scale-125"><ICONS.ChevronRight /></div>
            </button>
          )}
          <button onClick={onClose} className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all ${isDarkTheme ? 'bg-white/10 text-white hover:bg-[#C6FF00] hover:text-black' : 'bg-gray-100 text-black hover:bg-black hover:text-white'}`}><ICONS.X /></button>
        </div>

        {step === 2 ? (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center space-y-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-[#C6FF00] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-lime-500/20">
              {/* Fix: removed invalid md:width and md:height props and use className instead */}
              <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 md:w-10 md:h-10"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 className={`text-3xl md:text-4xl font-black tracking-tighter italic uppercase ${isDarkTheme ? 'text-[#C6FF00]' : 'text-black'}`}>
              {type === 'challenge' ? 'CHALLENGE ISSUED!' : (type === 'create' ? 'MATCH PUBLISHED!' : (type === 'contact-organizer' ? 'MESSAGE SENT!' : 'SUCCESS!'))}
            </h2>
            <p className={`${isDarkTheme ? 'text-white/60' : 'text-black/60'} font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px]`}>
              {type === 'challenge' ? 'Wait for the opponent to accept.' : 'Action complete.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] px-4 md:px-5 py-1.5 rounded-full inline-block ${isDarkTheme ? 'bg-[#C6FF00] text-black' : 'bg-black text-white'}`}>
                  {type?.toUpperCase().replace('-', ' ')}
                </span>
                {type === 'manage-game' && (
                  <span className="text-[9px] font-black uppercase bg-red-500 text-white px-3 py-1 rounded-full italic animate-pulse">Organizer Mode</span>
                )}
              </div>
              <h2 className={`text-4xl md:text-6xl font-black tracking-tighter leading-tight italic uppercase`}>
                {player ? (type === 'challenge' ? `Challenge ${player.name}` : player.name) : (type === 'create' ? 'Host a Match' : (game?.title || completedMatch?.title))}
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {/* Post-Match Report View (Rich Details for History) */}
              {type === 'match-detail' && completedMatch && (
                <motion.div key="post-match" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                  <div className="relative h-64 md:h-80 rounded-[40px] overflow-hidden">
                    <img src={completedMatch.imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C6FF00]">Match Final Result</p>
                        <h3 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none">{completedMatch.score}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Opponent</p>
                        <p className="text-xl font-black italic uppercase tracking-tight">{completedMatch.opponent}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-2">Match MVP</h4>
                        <div className="bg-[#C6FF00] p-6 rounded-[32px] flex items-center gap-6 shadow-2xl">
                          <img src={completedMatch.mvp?.avatar} className="w-16 h-16 rounded-full border-4 border-black/10" />
                          <div>
                            <p className="text-black font-black italic text-xl uppercase tracking-tighter leading-none mb-1">{completedMatch.mvp?.name}</p>
                            <p className="text-black/50 text-[10px] font-black uppercase tracking-widest">{completedMatch.mvp?.contribution}</p>
                          </div>
                          <div className="ml-auto bg-black text-[#C6FF00] w-12 h-12 rounded-full flex items-center justify-center font-black text-xs italic">MVP</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-2">Performance Analytics</h4>
                        <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 space-y-6">
                          {completedMatch.matchStats && Object.entries(completedMatch.matchStats).map(([key, val]) => (
                            <div key={key} className="space-y-2">
                              <div className="flex justify-between items-end">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{key}</span>
                                <span className="text-sm font-black text-white">{val}</span>
                              </div>
                              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[#C6FF00] w-2/3" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-2">Match Squad ({completedMatch.participants?.length || 0})</h4>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
                        {completedMatch.participants?.map((p) => (
                          <div key={p.id} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default">
                            <div className="flex items-center gap-4">
                              <img src={p.avatar} className="w-10 h-10 rounded-full border border-white/10" />
                              <div>
                                <p className="text-xs font-black italic uppercase">{p.name}</p>
                                <p className="text-[8px] font-black text-[#C6FF00] uppercase tracking-widest">{p.role}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black italic leading-none">{p.rating}</p>
                              <p className="text-[7px] font-black uppercase tracking-widest text-white/20">Rating</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/10">
                    <button onClick={onClose} className="w-full bg-white text-black py-5 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-[#C6FF00] transition-all">Close Report</button>
                  </div>
                </motion.div>
              )}

              {/* Edit Profile View */}
              {type === 'edit-profile' && player && (
                <motion.form key="edit-profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleProfileSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Full Name</label>
                      <Input
                        required
                        value={profileForm.name}
                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full h-auto bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-full px-6 py-4 text-white font-bold outline-none transition-all focus-visible:ring-0 placeholder:text-white/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Main Discipline</label>
                      <Select value={profileForm.mainSport} onValueChange={(v) => setProfileForm({ ...profileForm, mainSport: v })}>
                        <SelectTrigger className="w-full bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-full px-6 py-4 h-auto text-white font-bold outline-none transition-all shadow-sm focus:ring-0">
                          <SelectValue placeholder="Select Sport" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border border-white/10 rounded-[20px] shadow-2xl overflow-hidden p-1 z-[250]">
                          {['Football', 'Basketball', 'Tennis', 'Padel', 'Badminton'].map(sport => (
                            <SelectItem key={sport} value={sport} className="focus:bg-white/10 focus:text-white rounded-xl py-3 px-4 font-bold cursor-pointer text-white/80">
                              <div className="flex items-center gap-3">
                                <span className="text-[#C6FF00]">{SPORT_ICONS[sport]}</span>
                                <span>{sport}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Avatar URL</label>
                    <Input
                      value={profileForm.avatar}
                      onChange={e => setProfileForm({ ...profileForm, avatar: e.target.value })}
                      className="w-full h-auto bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-full px-6 py-4 text-white font-bold outline-none transition-all focus-visible:ring-0 placeholder:text-white/20"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-auto bg-[#C6FF00] text-black py-6 rounded-full font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-all flex items-center justify-center gap-4 shadow-2xl hover:bg-[#b0ff00]">
                    {loading ? 'Saving...' : 'Update Profile'}
                  </Button>
                </motion.form>
              )}

              {/* Edit Stats View */}
              {type === 'stats' && player && (
                <motion.form key="edit-stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleStatsSubmit} className="space-y-12">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-2">Technical Attributes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-white/5 p-8 rounded-[40px] border border-white/10">
                      {Object.keys(statsForm).map(key => (
                        <div key={key} className="space-y-3">
                          <div className="flex justify-between items-center px-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{key}</label>
                            <span className="text-sm font-black text-[#C6FF00]">{statsForm[key]}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="99"
                            value={statsForm[key]}
                            onChange={e => setStatsForm({ ...statsForm, [key]: parseInt(e.target.value) })}
                            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#C6FF00]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-2">Career Career Totals</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {player.mainSport === 'Football' && (
                        <>
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <label className="text-[8px] font-black uppercase text-white/40 block mb-1">Goals</label>
                            <input type="number" value={careerStatsForm.goals} onChange={e => setCareerStatsForm({ ...careerStatsForm, goals: parseInt(e.target.value) })} className="bg-transparent text-xl font-black text-white w-full outline-none" />
                          </div>
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <label className="text-[8px] font-black uppercase text-white/40 block mb-1">Assists</label>
                            <input type="number" value={careerStatsForm.assists} onChange={e => setCareerStatsForm({ ...careerStatsForm, assists: parseInt(e.target.value) })} className="bg-transparent text-xl font-black text-white w-full outline-none" />
                          </div>
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <label className="text-[8px] font-black uppercase text-white/40 block mb-1">Clean Sheets</label>
                            <input type="number" value={careerStatsForm.cleanSheets} onChange={e => setCareerStatsForm({ ...careerStatsForm, cleanSheets: parseInt(e.target.value) })} className="bg-transparent text-xl font-black text-white w-full outline-none" />
                          </div>
                        </>
                      )}
                      {player.mainSport === 'Basketball' && (
                        <>
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <label className="text-[8px] font-black uppercase text-white/40 block mb-1">Points</label>
                            <input type="number" value={careerStatsForm.points} onChange={e => setCareerStatsForm({ ...careerStatsForm, points: parseInt(e.target.value) })} className="bg-transparent text-xl font-black text-white w-full outline-none" />
                          </div>
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <label className="text-[8px] font-black uppercase text-white/40 block mb-1">Rebounds</label>
                            <input type="number" value={careerStatsForm.rebounds} onChange={e => setCareerStatsForm({ ...careerStatsForm, rebounds: parseInt(e.target.value) })} className="bg-transparent text-xl font-black text-white w-full outline-none" />
                          </div>
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <label className="text-[8px] font-black uppercase text-white/40 block mb-1">Steals</label>
                            <input type="number" value={careerStatsForm.steals} onChange={e => setCareerStatsForm({ ...careerStatsForm, steals: parseInt(e.target.value) })} className="bg-transparent text-xl font-black text-white w-full outline-none" />
                          </div>
                        </>
                      )}
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <label className="text-[8px] font-black uppercase text-white/40 block mb-1">MVPs</label>
                        <input type="number" value={careerStatsForm.mvps} onChange={e => setCareerStatsForm({ ...careerStatsForm, mvps: parseInt(e.target.value) })} className="bg-transparent text-xl font-black text-white w-full outline-none" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-[#C6FF00] text-black py-6 rounded-full font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-all flex items-center justify-center gap-4 shadow-2xl">
                    {loading ? 'Saving...' : 'Update Pro Stats'}
                  </button>
                </motion.form>
              )}

              {/* Share Profile View */}
              {type === 'share-profile' && player && (
                <motion.div key="share-profile" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                  <div className="relative aspect-[3/4] max-w-[340px] mx-auto bg-zinc-900 rounded-[48px] overflow-hidden border border-white/10 shadow-2xl p-8 flex flex-col items-center text-center space-y-6">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <ICONS.Logo />
                    </div>
                    <div className="relative mt-4">
                      <img src={player.avatar} className="w-40 h-40 rounded-full border-4 border-[#C6FF00] shadow-2xl object-cover" />
                      <div className="absolute -bottom-2 -right-2 bg-[#C6FF00] text-black w-14 h-14 rounded-full flex items-center justify-center font-black text-xl italic uppercase shadow-xl">PRO</div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{player.name}</h3>
                      <p className="text-[#C6FF00] font-black uppercase tracking-widest text-[9px]">{player.mainSport} Elite</p>
                    </div>
                    <div className="w-full grid grid-cols-3 gap-4 py-4 border-y border-white/5">
                      <div>
                        <span className="block text-2xl font-black text-white italic">{player.stats.rating}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Rating</span>
                      </div>
                      <div>
                        <span className="block text-2xl font-black text-white italic">{player.stats.winRate}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Wins</span>
                      </div>
                      <div>
                        <span className="block text-2xl font-black text-white italic">{player.stats.mvps}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/30">MVPs</span>
                      </div>
                    </div>
                    <div className="pt-4 opacity-20">
                      <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h4v4H3V3zm14 0h4v4h-4V3zM3 17h4v4H3v-4zm14 0h4v4h-4v-4zM7 3h4v4H7V3zm6 0h4v4h-4V3zM7 17h4v4H7v-4zm6 13h4v4h-4v-4zM3 7h4v4H3V7zm14 0h4v4h-4V7zM3 13h4v4H3v-4zm14 0h4v4h-4v-4zM7 7h4v4H7V7zm6 0h4v4h-4V7zM7 13h4v4H7v-4zm6 13h4v4h-4v-4zM11 11h2v2h-2v-2z" /></svg>
                      <p className="text-[8px] font-black uppercase tracking-widest mt-2">Scan to Challenge</p>
                    </div>
                  </div>
                  <button
                    onClick={onShareProfile}
                    className="w-full bg-[#C6FF00] text-black py-6 rounded-full font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-all flex items-center justify-center gap-4 shadow-2xl"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                    Copy Pro Profile Link
                  </button>
                </motion.div>
              )}

              {/* Create Game View */}
              {type === 'create' && (
                <motion.form key="create-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleCreateSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Discipline</label>
                      <Select value={createForm.sport} onValueChange={(v) => setCreateForm({ ...createForm, sport: v })}>
                        <SelectTrigger className="w-full bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-full px-6 py-4 h-auto text-white font-bold outline-none transition-all shadow-sm focus:ring-0">
                          <SelectValue placeholder="Select Sport" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border border-white/10 rounded-[20px] shadow-2xl overflow-hidden p-1 z-[250]">
                          {['Football', 'Basketball', 'Tennis', 'Padel', 'Badminton'].map(sport => (
                            <SelectItem key={sport} value={sport} className="focus:bg-white/10 focus:text-white rounded-xl py-3 px-4 font-bold cursor-pointer text-white/80">
                              <div className="flex items-center gap-3">
                                <span className="text-[#C6FF00]">{SPORT_ICONS[sport]}</span>
                                <span>{sport}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Match Title</label>
                      <Input
                        required
                        value={createForm.title}
                        onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                        placeholder="e.g. Saturday Night 5v5"
                        className="w-full h-auto bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-full px-6 py-4 text-white font-bold outline-none transition-all focus-visible:ring-0 placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Location / Pitch Details</label>
                    <Input
                      required
                      value={createForm.location}
                      onChange={e => setCreateForm({ ...createForm, location: e.target.value })}
                      placeholder="e.g. City Sports Arena, Pitch 4"
                      className="w-full h-auto bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-full px-6 py-4 text-white font-bold outline-none transition-all focus-visible:ring-0 placeholder:text-white/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Date</label>
                      <Input
                        required
                        value={createForm.date}
                        onChange={e => setCreateForm({ ...createForm, date: e.target.value })}
                        placeholder="e.g. Tomorrow"
                        className="w-full h-auto bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-full px-6 py-4 text-white font-bold outline-none transition-all focus-visible:ring-0 placeholder:text-white/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Kickoff Time</label>
                      <Input
                        required
                        type="time"
                        value={createForm.time}
                        onChange={e => setCreateForm({ ...createForm, time: e.target.value })}
                        className="w-full h-auto bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-full px-6 py-4 text-white font-bold outline-none transition-all focus-visible:ring-0 placeholder:text-white/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Max Capacity</label>
                      <Input
                        required
                        type="number"
                        min="2"
                        value={createForm.spotsTotal}
                        onChange={e => setCreateForm({ ...createForm, spotsTotal: parseInt(e.target.value) })}
                        className="w-full h-auto bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-full px-6 py-4 text-white font-bold outline-none transition-all focus-visible:ring-0 placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Entry Fee</label>
                      <Input
                        value={createForm.price}
                        onChange={e => setCreateForm({ ...createForm, price: e.target.value })}
                        placeholder="e.g. Free or $5"
                        className="w-full h-auto bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-full px-6 py-4 text-white font-bold outline-none transition-all focus-visible:ring-0 placeholder:text-white/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Skill Required</label>
                      <Select value={createForm.skillLevel} onValueChange={(v) => setCreateForm({ ...createForm, skillLevel: v as any })}>
                        <SelectTrigger className="w-full bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-full px-6 py-4 h-auto text-white font-bold outline-none transition-all shadow-sm focus:ring-0">
                          <SelectValue placeholder="Select Level" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border border-white/10 rounded-[20px] shadow-2xl overflow-hidden p-1 z-[250]">
                          {['All Levels', 'Beginner', 'Intermediate', 'Competitive'].map(level => (
                            <SelectItem key={level} value={level} className="focus:bg-white/10 focus:text-white rounded-xl py-3 px-4 font-bold cursor-pointer text-white/80">
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#C6FF00] text-black py-6 rounded-full font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] shadow-2xl h-auto hover:bg-[#b0ff00]"
                    >
                      {loading ? 'Publishing...' : 'Publish Match to Feed'}
                    </Button>
                  </div>
                </motion.form>
              )}

              {/* Organizer Management View */}
              {type === 'manage-game' && game && (
                <motion.div key="manage-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">

                  {isEditing ? (
                    <form onSubmit={handleUpdateMatch} className="space-y-6 bg-white/5 p-8 rounded-[40px] border border-white/10">
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter text-[#C6FF00]">Edit Match Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Title</label>
                          <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 font-bold outline-none focus:border-[#C6FF00]" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Location</label>
                          <input value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 font-bold outline-none focus:border-[#C6FF00]" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Time</label>
                          <input value={editForm.time} onChange={e => setEditForm({ ...editForm, time: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 font-bold outline-none focus:border-[#C6FF00]" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Max Spots</label>
                          <input type="number" value={editForm.spotsTotal} onChange={e => setEditForm({ ...editForm, spotsTotal: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 font-bold outline-none focus:border-[#C6FF00]" />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button type="submit" disabled={loading} className="flex-1 bg-[#C6FF00] text-black py-4 rounded-full font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all">
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-white/10 py-4 rounded-full font-black uppercase tracking-widest text-[10px]">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex justify-between items-center bg-white/5 p-6 rounded-[32px] border border-white/10">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[20px] bg-[#C6FF00] flex items-center justify-center text-black font-black text-xl italic uppercase">{(game.sport || '?')[0]}</div>
                        <div>
                          <p className="text-white font-black italic text-xl uppercase tracking-tighter">{game.location}</p>
                          <p className="text-[10px] font-black text-[#C6FF00] uppercase tracking-widest">{game.date} • {game.time}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => onShareMatch?.(game)} className="bg-white/5 hover:bg-white/10 p-3 rounded-full transition-all border border-white/10">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                        </button>
                        <button onClick={() => setIsEditing(true)} className="bg-white/10 hover:bg-[#C6FF00] hover:text-black px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all">Edit Match</button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Join Requests */}
                    <div className="space-y-6">
                      <div className="flex justify-between items-end px-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Join Requests ({game.requests?.length || 0})</h4>
                      </div>
                      <div className="space-y-3">
                        {game.requests?.map((req: JoinRequest) => (
                          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={req.id} className="bg-white/5 p-5 rounded-[28px] border border-white/10 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <img src={req.avatar} className="w-10 h-10 rounded-full border border-white/20" />
                              <div>
                                <p className="text-sm font-black italic uppercase">{req.name}</p>
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{req.timestamp}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => onManageRequest?.(game.id, req.id, true)} className="w-9 h-9 bg-[#C6FF00] text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></button>
                              <button onClick={() => onManageRequest?.(game.id, req.id, false)} className="w-9 h-9 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-all"><ICONS.X /></button>
                            </div>
                          </motion.div>
                        ))}
                        {(!game.requests || game.requests.length === 0) && (
                          <div className="py-12 bg-white/5 rounded-[28px] border border-dashed border-white/10 text-center text-[10px] font-black uppercase tracking-widest text-white/20">No pending requests</div>
                        )}
                      </div>
                    </div>

                    {/* Active Squad */}
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-2">Active Squad ({game.participants?.length}/{game.spotsTotal})</h4>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
                        {game.participants?.map((p: Participant) => (
                          <div key={p.id} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 group">
                            <div className="flex items-center gap-3">
                              <img src={p.avatar} className="w-9 h-9 rounded-full border border-white/10" alt={p.name} />
                              <div>
                                <span className="text-xs font-black italic uppercase block">{p.name}</span>
                                {p.role === 'Host' && <span className="text-[7px] font-black text-[#C6FF00] uppercase tracking-widest">Organizer</span>}
                              </div>
                            </div>
                            {p.role !== 'Host' && (
                              <button
                                onClick={() => onRemoveParticipant?.(game.id, p.id)}
                                className="opacity-0 group-hover:opacity-100 bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                              >
                                Kick
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Game Join View (Upcoming Matches) */}
              {type === 'join' && game && (
                <motion.div key="game-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="relative h-48 md:h-64 rounded-[32px] overflow-hidden">
                    <img src={game.imageUrl} className="w-full h-full object-cover" alt={game.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-6 left-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#C6FF00] flex items-center justify-center text-black font-black text-xs italic">
                        {game.sport ? game.sport.substring(0, 1) : '?'}
                      </div>
                      <div>
                        <p className="text-white text-xs font-black uppercase tracking-widest">{game.sport || 'Multi'}</p>
                        <p className="text-[#C6FF00] text-sm font-black">{game.price}</p>
                      </div>
                    </div>
                    {/* Floating Share Button on Image */}
                    <button
                      onClick={() => onShareMatch?.(game)}
                      className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full text-white hover:bg-[#C6FF00] hover:text-black transition-all"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Match Info</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-white/80">
                            <ICONS.Clock />
                            <span className="font-bold">{game.date} • {game.time}</span>
                          </div>
                          <div className="flex items-center gap-3 text-white/80">
                            <ICONS.MapPin />
                            <span className="font-bold">{game.location}</span>
                          </div>
                          <div className="flex items-center gap-3 text-white/80">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            <span className="font-bold">{game.spotsTaken || 0} / {game.spotsTotal || 0} Players Joined</span>
                          </div>
                          <div className="flex items-center gap-3 text-white/80">
                            <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center text-[10px] font-black uppercase">Lv</div>
                            <span className="font-bold">{game.skillLevel || 'All Levels'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Organizer</h4>
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-xs uppercase italic">{game.organizer?.[0] || 'H'}</div>
                          <div className="flex-1">
                            <p className="font-black italic uppercase text-sm">{game.organizer || 'Host'}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Verified Host</p>
                          </div>
                          <button
                            onClick={() => pushView('contact-organizer', game)}
                            className="bg-white/10 hover:bg-[#C6FF00] hover:text-black p-2 rounded-lg transition-all"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Current Squad</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 hide-scrollbar">
                        {game.participants?.map((p: Participant) => (
                          <div key={p.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                              <img src={p.avatar} className="w-8 h-8 rounded-full border border-white/10" alt={p.name} />
                              <span className="text-xs font-black italic uppercase">{p.name}</span>
                            </div>
                            <span className="text-[8px] font-black uppercase bg-white/10 px-2 py-1 rounded">{p.role || 'Member'}</span>
                          </div>
                        ))}
                        {(!game.participants || game.participants.length === 0) && (
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/20 text-center py-4">Squad list empty</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <button
                      onClick={handleJoinSubmit}
                      disabled={loading || (game.spotsTaken || 0) >= (game.spotsTotal || 1)}
                      className="w-full bg-[#C6FF00] text-black py-5 rounded-full font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-all flex items-center justify-center gap-4 shadow-xl disabled:opacity-50 disabled:grayscale"
                    >
                      {loading ? 'Processing...' : ((game.spotsTaken || 0) >= (game.spotsTotal || 1) ? 'Match Full' : 'Join This Match')}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Contact Organizer View */}
              {type === 'contact-organizer' && game && (
                <motion.div key="contact-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <p className="text-white/60 font-bold leading-relaxed">Sending a message to <span className="text-white">{game.organizer || 'Host'}</span> regarding <span className="text-[#C6FF00]">{game.title}</span>.</p>
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Inquiry Details</label>
                      <textarea
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Ask about parking, equipment, or late arrival..."
                        className="w-full h-40 bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-[32px] p-6 text-white font-bold outline-none transition-all resize-none"
                        required
                      />
                    </div>
                    <button disabled={loading} className="w-full bg-[#C6FF00] text-black py-5 rounded-full font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-all flex items-center justify-center gap-4 shadow-xl">
                      {loading ? 'Sending...' : 'Send Message to Host'}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Player Profile View */}
              {type === 'profile' && player && (
                <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 md:space-y-10">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                    <img src={player.avatar} className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-[#C6FF00]" />
                    <div className="flex-1 space-y-4 text-center md:text-left">
                      <div>
                        <h4 className="text-white/30 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Main Discipline</h4>
                        <p className="text-white text-xl md:text-2xl font-black italic">{player.mainSport}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <h4 className="text-white/30 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Win Rate</h4>
                          <p className="text-[#C6FF00] text-2xl md:text-3xl font-black">{player.stats.winRate}</p>
                        </div>
                        <div>
                          <h4 className="text-white/30 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Reliability</h4>
                          <p className="text-white text-2xl md:text-3xl font-black">{player.stats.reliability}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <button onClick={() => pushView('detailed-stats')} className="bg-white/5 text-white py-4 md:py-5 rounded-full font-black uppercase tracking-widest text-[10px] md:text-[11px] hover:bg-white/10 transition-all">View Detailed Stats</button>
                    <button onClick={() => pushView('challenge')} className="bg-[#C6FF00] text-black rounded-full py-4 md:py-5 font-black uppercase tracking-widest text-[10px] md:text-[11px] hover:scale-[1.05] transition-all flex items-center justify-center gap-2 md:gap-3 shadow-xl shadow-lime-500/10">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                      Issue Challenge
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Detailed Stats View */}
              {type === 'detailed-stats' && player && (
                <motion.div key="detailed-stats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 md:space-y-10">
                  <div className="space-y-4">
                    <h4 className="text-white font-black italic uppercase tracking-tighter text-xl">Technical Profile</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-white/5 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-white/5">
                      {Object.entries(player.attributes).map(([attr, val]) => (
                        <div key={attr} className="space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{attr}</span>
                            <span className="text-sm font-black text-[#C6FF00]">{val}</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${val}%` }}
                              transition={{ duration: 1, delay: 0.2 }}
                              className={`h-full ${val > 85 ? 'bg-[#C6FF00]' : 'bg-white/40'}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Rating', value: player.stats.rating },
                      { label: 'Matches', value: player.stats.gamesPlayed },
                      { label: 'MVPs', value: player.stats.mvps },
                      { label: 'Wins', value: Math.round(player.stats.gamesPlayed * 0.68) }
                    ].map(stat => (
                      <div key={stat.label} className="bg-white/5 rounded-[28px] p-5 text-center border border-white/5">
                        <span className="block text-2xl md:text-3xl font-black text-white italic">{stat.value}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{stat.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-black italic uppercase tracking-tighter text-xl">Form Guide</h4>
                    <div className="space-y-3">
                      {player.matchHistory?.map(match => (
                        <div key={match.id} className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${match.result === 'W' ? 'bg-[#C6FF00] text-black' : match.result === 'L' ? 'bg-red-500 text-white' : 'bg-white/10 text-white'}`}>
                              {match.result === 'Win' ? 'W' : match.result === 'Loss' ? 'L' : 'D'}
                            </div>
                            <div>
                              <p className="font-black italic text-sm text-white uppercase">{match.opponent}</p>
                              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{match.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-[#C6FF00] text-lg leading-none">{match.rating}</p>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Rating</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Challenge Form View */}
              {type === 'challenge' && player && (
                <motion.form key="challenge" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleChallengeSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <ProSelect
                      label="Discipline"
                      value={challengeSport}
                      onChange={setChallengeSport}
                      options={['Football', 'Basketball', 'Tennis', 'Padel']}
                      iconMap={SPORT_ICONS}
                    />
                    <ProSelect
                      label="Match Type"
                      value={challengeType}
                      onChange={v => setChallengeType(v as any)}
                      options={['1v1', '2v2', 'Team']}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Challenge Message</label>
                    <textarea
                      value={challengeMsg} onChange={(e) => setChallengeMsg(e.target.value)}
                      placeholder="Drop some trash talk or match rules..."
                      className="w-full h-32 bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-[32px] p-6 text-white font-bold placeholder:text-white/20 outline-none transition-all resize-none"
                      required
                    />
                  </div>
                  <button disabled={loading} className="w-full bg-[#C6FF00] text-black py-5 rounded-full font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-all flex items-center justify-center gap-4 shadow-xl">
                    {loading ? 'Issuing...' : 'Send Challenge Request'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GameModal;
