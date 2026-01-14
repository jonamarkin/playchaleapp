'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePlayChale } from '@/providers/PlayChaleProvider';
import { useMyGames } from '@/hooks/useData';
import { ICONS } from '@/constants';
import { Game } from '@/types';

const GameCard = ({ game, isHost, onClick }: { game: Game; isHost: boolean; onClick: () => void }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        className="bg-white border-2 border-black/5 p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] flex gap-4 sm:gap-5 items-center hover:border-[#C6FF00] transition-all cursor-pointer group shadow-sm"
    >
        <Image
            src={game.imageUrl}
            alt={game.title}
            width={80}
            height={80}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-[16px] sm:rounded-[20px] object-cover shadow-lg shrink-0"
        />
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-black/40">{game.sport}</span>
                {game.visibility === 'private' && (
                    <span className="bg-black text-[#C6FF00] px-2 py-0.5 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-wider">Private</span>
                )}
                {isHost && (
                    <span className="bg-[#C6FF00] text-black px-2 py-0.5 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-wider">Host</span>
                )}
            </div>
            <h4 className="text-base sm:text-lg font-black italic uppercase tracking-tighter truncate">{game.title}</h4>
            <div className="flex items-center gap-3 sm:gap-4 mt-1 text-[9px] sm:text-[10px] font-bold text-black/40">
                <div className="flex items-center gap-1"><ICONS.Clock /> {game.date} • {game.time}</div>
                <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    {game.spotsTaken}/{game.spotsTotal}
                </div>
            </div>
        </div>
        <div className="p-3 bg-black/5 group-hover:bg-[#C6FF00] group-hover:text-black rounded-full transition-all shrink-0">
            <ICONS.ChevronRight />
        </div>
    </motion.div>
);

export default function MyGamesPage() {
    const router = useRouter();
    const { user } = usePlayChale();
    const { data, isLoading, error } = useMyGames(user?.id);
    const [activeTab, setActiveTab] = useState<'hosted' | 'joined'>('hosted');

    const hostedGames = data?.hostedGames || [];
    const joinedGames = data?.joinedGames || [];

    return (
        <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 md:px-12 min-h-screen bg-[#FDFDFB]">
            <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">
                {/* Header */}
                <header className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-black/30"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF00]"></span>
                        Your Arena
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter uppercase"
                    >
                        My Games
                    </motion.h1>
                </header>

                {/* Tabs */}
                <div className="flex gap-2 bg-gray-100 p-1.5 rounded-full w-fit">
                    <button
                        onClick={() => setActiveTab('hosted')}
                        className={`px-5 sm:px-6 py-2.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'hosted' ? 'bg-black text-white shadow-md' : 'text-black/40 hover:text-black/60'}`}
                    >
                        Hosted ({hostedGames.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('joined')}
                        className={`px-5 sm:px-6 py-2.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'joined' ? 'bg-black text-white shadow-md' : 'text-black/40 hover:text-black/60'}`}
                    >
                        Joined ({joinedGames.length})
                    </button>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="py-20 text-center">
                        <div className="w-8 h-8 border-4 border-black/10 border-t-[#C6FF00] rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-black/40 font-bold uppercase text-sm tracking-widest">Loading your games...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center">
                        <p className="text-red-500 font-bold">Error loading games. Please try again.</p>
                    </div>
                ) : (
                    <motion.div layout className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {activeTab === 'hosted' && hostedGames.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="py-16 text-center bg-gray-50 rounded-[32px] border border-black/5"
                                >
                                    <div className="text-4xl mb-4">🏟️</div>
                                    <p className="text-black/40 font-bold uppercase text-sm tracking-widest mb-4">You haven&apos;t hosted any games yet</p>
                                    <button
                                        onClick={() => router.push('/discover')}
                                        className="bg-[#C6FF00] text-black px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                                    >
                                        Create Your First Game
                                    </button>
                                </motion.div>
                            )}

                            {activeTab === 'joined' && joinedGames.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="py-16 text-center bg-gray-50 rounded-[32px] border border-black/5"
                                >
                                    <div className="text-4xl mb-4">🤝</div>
                                    <p className="text-black/40 font-bold uppercase text-sm tracking-widest mb-4">You haven&apos;t joined any games yet</p>
                                    <button
                                        onClick={() => router.push('/discover')}
                                        className="bg-[#C6FF00] text-black px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                                    >
                                        Find Games to Join
                                    </button>
                                </motion.div>
                            )}

                            {activeTab === 'hosted' && hostedGames.map((game) => (
                                <GameCard
                                    key={game.id}
                                    game={game}
                                    isHost={true}
                                    onClick={() => router.push(`/game/${game.slug || game.id}`)}
                                />
                            ))}

                            {activeTab === 'joined' && joinedGames.map((game) => (
                                <GameCard
                                    key={game.id}
                                    game={game}
                                    isHost={false}
                                    onClick={() => router.push(`/game/${game.slug || game.id}`)}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-black/5">
                    <button
                        onClick={() => router.push('/discover')}
                        className="flex-1 bg-black text-[#C6FF00] py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                    >
                        Discover Games
                    </button>
                    <button
                        onClick={() => router.push('/home')}
                        className="flex-1 bg-gray-100 text-black py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </section>
    );
}
