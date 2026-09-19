'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useMyGames } from '@/features/games/hooks';
import { ICONS } from '@/constants';
import GameCard from '@/components/GameCard';

export default function MyGamesView() {
    const router = useRouter();
    const { data, isLoading, error } = useMyGames();
    const [activeTab, setActiveTab] = useState<'hosted' | 'joined'>('hosted');

    const hostedGames = data?.hosted ?? [];
    const joinedGames = data?.joined ?? [];

    return (
        <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 md:px-12 min-h-screen bg-surface-app">
            <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">
                {/* Header */}
                <header className="space-y-4">
                    <div
                        className="animate-in fade-in slide-in-from-left-5 [animation-duration:400ms] inline-flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-black/30"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-lime-500"></span>
                        Your Arena
                    </div>
                    <h1
                        className="animate-in fade-in slide-in-from-bottom-5 [animation-duration:400ms] [animation-delay:100ms] fill-mode-both text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter uppercase"
                    >
                        My Games
                    </h1>
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
                        <div className="w-8 h-8 border-4 border-black/10 border-t-lime-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-black/40 font-bold uppercase text-sm tracking-widest">Loading your games...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center">
                        <p className="text-red-500 font-bold">Error loading games. Please try again.</p>
                    </div>
                ) : (
                    <m.div layout className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {activeTab === 'hosted' && hostedGames.length === 0 && (
                                <m.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="py-16 text-center bg-gray-50 rounded-[32px] border border-black/5"
                                >
                                    <div className="text-4xl mb-4">🏟️</div>
                                    <p className="text-black/40 font-bold uppercase text-sm tracking-widest mb-4">You haven&apos;t hosted any games yet</p>
                                    <button
                                        onClick={() => router.push('/discover')}
                                        className="bg-lime-500 text-black px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                                    >
                                        Create Your First Game
                                    </button>
                                </m.div>
                            )}

                            {activeTab === 'joined' && joinedGames.length === 0 && (
                                <m.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="py-16 text-center bg-gray-50 rounded-[32px] border border-black/5"
                                >
                                    <div className="text-4xl mb-4">🤝</div>
                                    <p className="text-black/40 font-bold uppercase text-sm tracking-widest mb-4">You haven&apos;t joined any games yet</p>
                                    <button
                                        onClick={() => router.push('/discover')}
                                        className="bg-lime-500 text-black px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                                    >
                                        Find Games to Join
                                    </button>
                                </m.div>
                            )}

                            {activeTab === 'hosted' && hostedGames.map((game) => (
                                <GameCard key={game.id} game={game} variant="row" isHost={true} />
                            ))}

                            {activeTab === 'joined' && joinedGames.map((game) => (
                                <GameCard key={game.id} game={game} variant="row" isHost={false} />
                            ))}
                        </AnimatePresence>
                    </m.div>
                )}

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-black/5">
                    <button
                        onClick={() => router.push('/discover')}
                        className="flex-1 bg-black text-lime-500 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
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
