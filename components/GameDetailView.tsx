'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ICONS } from '@/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Game, PlayerProfile, JoinRequest, Participant, MatchRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GameDetailProps {
    type: 'join' | 'manage' | 'report';
    data: Game | MatchRecord; // Depending on type
    currentUser?: PlayerProfile;
    onJoin?: (id: string) => void;
    onUpdate?: (id: string, updates: Partial<Game>) => void;
    onManageRequest?: (gameId: string, requestId: string, accept: boolean) => void;
    onRemoveParticipant?: (gameId: string, playerId: string) => void;
    onShare?: (item: any) => void;
    onClose?: () => void; // Optional, maybe for back navigation
}

const SPORT_ICONS: Record<string, React.ReactNode> = {
    'Football': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m6.7 6.7 10.6 10.6" /><path d="m17.3 6.7-10.6 10.6" /></svg>,
    'Basketball': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20" /><path d="M2 12h20" /><path d="M12 2a14.5 14.5 0 0 1 0 20" /></svg>,
    'Tennis': <ICONS.TennisBall className="scale-75" />,
    'Volleyball': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2.5 10.5 8 16l4-4" /><path d="M12 12l4 4 5.5-5.5" /></svg>,
    'Swimming': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20" /><path d="M2 16h20" /><path d="M2 8h20" /></svg>,
    'Athletics': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16l2-1 2.5-3.5-1.5-3 2-2 3 1 2 2 3-1" /><path d="M11 11.5L14 16l-1 4" /><path d="M11 11.5L9 16l2 4" /></svg>
};

const GameDetailView: React.FC<GameDetailProps> = ({
    type, data, currentUser, onJoin, onUpdate, onManageRequest, onRemoveParticipant, onShare
}) => {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Game>>({});

    // Cast data based on type for easier access
    const game = (type === 'join' || type === 'manage') ? data as Game : null;
    const match = type === 'report' ? data as MatchRecord : null;

    React.useEffect(() => {
        if (type === 'manage' && game) {
            setEditForm({
                title: game.title,
                location: game.location,
                time: game.time,
                spotsTotal: game.spotsTotal,
            });
        }
    }, [type, game]);

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            if (game) onUpdate?.(game.id, editForm);
            setLoading(false);
            setIsEditing(false);
        }, 1000);
    };

    const handleJoin = () => {
        setLoading(true);
        setTimeout(() => {
            if (game) onJoin?.(game.id);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-32">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="bg-[#C6FF00] text-black px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                            {type === 'report' ? 'Match Report' : (type === 'manage' ? 'Organizer Mode' : 'Upcoming Match')}
                        </span>
                        {game?.status && (
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${game.status === 'upcoming' ? 'border-[#C6FF00] text-[#C6FF00]' : 'border-white/20 text-white/40'}`}>
                                {game.status}
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-white">
                        {game?.title || match?.title}
                    </h1>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    {onShare && (
                        <button onClick={() => onShare(data)} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                        </button>
                    )}
                    {type === 'manage' && (
                        <button onClick={() => setIsEditing(!isEditing)} className="bg-white/10 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-all">
                            {isEditing ? 'Cancel Edit' : 'Edit Details'}
                        </button>
                    )}
                </div>
            </div>

            {/* MATCH REPORT VIEW */}
            {type === 'report' && match && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                    {/* Hero Stats */}
                    <div className="relative h-[400px] rounded-[48px] overflow-hidden group">
                        <img src={match.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col md:flex-row justify-between items-end gap-8">
                            <div className="space-y-4">
                                <p className="text-[#C6FF00] font-black uppercase tracking-[0.3em] text-[10px]">Final Score</p>
                                <div className="flex items-center gap-6">
                                    <span className="text-7xl md:text-9xl font-black italic text-white leading-none tracking-tighter">{match.score}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Vs Opponent</p>
                                <p className="text-3xl font-black italic uppercase text-white tracking-tight">{match.opponent}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                        <div className="space-y-12">
                            {/* MVP Card */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black italic uppercase text-[#C6FF00] tracking-tight">Match MVP</h3>
                                <div className="bg-gradient-to-br from-[#C6FF00] to-[#a3d600] p-1 rounded-[40px] shadow-2xl shadow-lime-500/10">
                                    <div className="bg-black/90 p-8 rounded-[36px] flex items-center gap-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C6FF00]/10 blur-[50px] rounded-full pointer-events-none" />
                                        <img src={match.mvp?.avatar} className="w-20 h-20 rounded-full border-4 border-[#C6FF00] object-cover" />
                                        <div>
                                            <p className="text-white text-2xl font-black italic uppercase tracking-tighter leading-none mb-2">{match.mvp?.name}</p>
                                            <p className="text-[#C6FF00] text-[10px] font-black uppercase tracking-widest">{match.mvp?.contribution}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black italic uppercase text-white tracking-tight">Match Stats</h3>
                                <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-8">
                                    {match.matchStats && Object.entries(match.matchStats).map(([key, val]) => (
                                        <div key={key} className="space-y-3">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-white/40">{key}</span>
                                                <span className="text-white">{val}</span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '70%' }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className="h-full bg-[#C6FF00]"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Squad List */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-black italic uppercase text-white tracking-tight">The Squad</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {match.participants?.map((p) => (
                                    <Link href={`/profile/${p.id}`} key={p.id} className="group flex items-center justify-between bg-white/5 border border-white/5 hover:bg-white/10 p-4 rounded-3xl transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <img src={p.avatar} className="w-12 h-12 rounded-full border-2 border-white/10 group-hover:border-[#C6FF00] transition-colors" />
                                            <div>
                                                <p className="text-white font-black italic uppercase text-sm">{p.name}</p>
                                                <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">{p.role}</p>
                                            </div>
                                        </div>
                                        <div className="text-right px-4">
                                            <span className="block text-xl font-black italic text-white">{p.rating}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* JOIN / MANAGE VIEW */}
            {(type === 'join' || type === 'manage') && game && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">

                    {/* Left Col: Info & Image */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="relative aspect-video rounded-[48px] overflow-hidden border border-white/10 shadow-2xl">
                            <img src={game.imageUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                            {/* Float Badge */}
                            <div className="absolute top-8 left-8 bg-black/30 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-3">
                                <div className="text-[#C6FF00]">{SPORT_ICONS[game.sport] || '⚽'}</div>
                                <span className="text-white text-[10px] font-black uppercase tracking-widest">{game.sport}</span>
                            </div>

                            <div className="absolute bottom-8 left-8">
                                <p className="text-[#C6FF00] font-black uppercase tracking-[0.2em] text-[10px] mb-2">Location</p>
                                <p className="text-3xl font-black italic uppercase text-white leading-none">{game.location}</p>
                            </div>
                        </div>

                        {/* Edit Form */}
                        {isEditing && (
                            <form onSubmit={handleUpdate} className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-white/40 ml-4">Title</label>
                                        <Input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="bg-black/50 border-white/10 rounded-full h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-white/40 ml-4">Location</label>
                                        <Input value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="bg-black/50 border-white/10 rounded-full h-12" />
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading} className="w-full bg-[#C6FF00] text-black h-12 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-lime-400">
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </form>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/5 p-6 rounded-[32px] space-y-2">
                                <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Date & Time</p>
                                <p className="text-xl font-black text-white italic">{game.date} @ {game.time}</p>
                            </div>
                            <div className="bg-white/5 border border-white/5 p-6 rounded-[32px] space-y-2">
                                <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Entry Fee</p>
                                <p className="text-xl font-black text-[#C6FF00] italic">{game.price}</p>
                            </div>
                        </div>

                        {/* Description or Additional Info could go here */}
                    </div>

                    {/* Right Col: Squad & Actions */}
                    <div className="space-y-8">

                        {/* Organizer Card */}
                        <div className="bg-white/5 border border-white/10 p-1 rounded-[32px]">
                            <div className="bg-black p-6 rounded-[28px] flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#C6FF00] flex items-center justify-center font-black italic text-lg">
                                    {game.organizer.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Hosted By</p>
                                    <p className="text-white font-black italic uppercase">{game.organizer}</p>
                                </div>
                            </div>
                        </div>

                        {/* Squad List */}
                        <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 min-h-[400px] flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black italic uppercase text-white">Squad</h3>
                                <span className="text-[#C6FF00] font-black text-sm">{game.participants?.length || 0} / {game.spotsTotal}</span>
                            </div>

                            <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                {game.participants?.map(p => (
                                    <div key={p.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl transition-colors">
                                        <img src={p.avatar} className="w-10 h-10 rounded-full border border-white/10" />
                                        <div className="flex-1">
                                            <p className="text-white font-black italic text-sm">{p.name}</p>
                                            <p className="text-white/30 text-[8px] font-black uppercase tracking-widest">{p.role || 'Player'}</p>
                                        </div>
                                        {type === 'manage' && p.role !== 'Host' && onRemoveParticipant && (
                                            <button onClick={() => onRemoveParticipant(game.id, p.id)} className="text-red-500 hover:bg-red-500/20 p-2 rounded-full transition-colors">
                                                <ICONS.X />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {Array.from({ length: Math.max(0, game.spotsTotal - (game.participants?.length || 0)) }).map((_, i) => (
                                    <div key={`empty-${i}`} className="flex items-center gap-4 p-3 opacity-30">
                                        <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/30" />
                                        <p className="text-white font-black uppercase text-[10px] tracking-widest">Open Spot</p>
                                    </div>
                                ))}
                            </div>

                            {type === 'join' && (
                                <div className="pt-8 mt-4 border-t border-white/10">
                                    <Button onClick={handleJoin} disabled={loading} className="w-full py-7 rounded-full bg-[#C6FF00] text-black font-black uppercase tracking-widest hover:bg-lime-400 hover:scale-[1.02] shadow-xl text-xs">
                                        {loading ? 'Joining...' : 'Join Squad'}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Join Requests (Organizer Only) */}
                        {type === 'manage' && game.requests && game.requests.length > 0 && (
                            <div className="bg-[#C6FF00]/10 border border-[#C6FF00]/20 rounded-[40px] p-8">
                                <h3 className="text-[#C6FF00] font-black italic uppercase mb-6">Pending Requests</h3>
                                <div className="space-y-4">
                                    {game.requests.map(req => (
                                        <div key={req.id} className="bg-black p-4 rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img src={req.avatar} className="w-8 h-8 rounded-full" />
                                                <span className="text-white font-bold text-sm">{req.name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => onManageRequest?.(game.id, req.id, true)} className="w-8 h-8 bg-[#C6FF00] rounded-full flex items-center justify-center text-black">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                                </button>
                                                <button onClick={() => onManageRequest?.(game.id, req.id, false)} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white">
                                                    <ICONS.X />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </motion.div>
            )}

        </div>
    );
};

export default GameDetailView;
