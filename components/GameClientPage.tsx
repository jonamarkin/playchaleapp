'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/features/auth/session';
import { useUIStore } from '@/hooks/useUIStore';
import GameDetailView from '@/components/GameDetailView';
import PostGameModal from '@/components/PostGameModal';
import { ICONS } from '@/constants';
import { useGame, useJoinGame } from '@/features/games/hooks';
import { useSportName } from '@/features/sports/hooks';

interface GameClientPageProps {
    slug: string;
}

export default function GameClientPage({ slug }: GameClientPageProps) {
    const router = useRouter();
    const { user, hasProfile } = useSession();
    const triggerToast = useUIStore((state) => state.triggerToast);
    const { mutate: joinGame, isPending: joining } = useJoinGame();
    const sportName = useSportName();

    const { data } = useGame(slug);
    const [showPostGameModal, setShowPostGameModal] = useState(false);

    const isHost = !!data?.viewer?.canManage;
    const isGameComplete = data?.status === 'completed';

    if (!data) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-lime-500 rounded-full animate-bounce"></div>
                    <p className="font-black uppercase tracking-widest text-xs opacity-50">Loading Arena...</p>
                </div>
            </div>
        );
    }

    const handleShare = async () => {
        const shareData = {
            title: `Join my game: ${data.title}`,
            text: `Play ${sportName(data.sport)} at ${data.locationText}. Join me on PlayChale!`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                console.log('Shared successfully');
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                triggerToast("LINK COPIED TO CLIPBOARD");
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-black pt-20 relative">
            {/* Background Ambient */}
            <div className="fixed top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-lime-500/5 to-transparent pointer-events-none" />

            <button
                onClick={() => router.back()}
                className="fixed top-24 left-4 md:left-8 z-50 w-10 h-10 bg-black/50 backdrop-blur-md border border-white/10 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all"
            >
                <ICONS.ChevronRight className="rotate-180" />
            </button>

            {/* Complete Game Button (Host only, after game time) */}
            {isHost && !isGameComplete && (
                <button
                    onClick={() => setShowPostGameModal(true)}
                    className="fixed bottom-6 right-6 z-50 bg-lime-500 text-black px-6 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
                >
                    <span>📊</span> Complete Game
                </button>
            )}

            {isGameComplete && (
                <div className="fixed bottom-6 right-6 z-50 bg-green-500 text-white px-6 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-2">
                    <span>✓</span> Game Completed
                </div>
            )}

            <GameDetailView
                game={data}
                joining={joining}
                onJoin={() => {
                    if (!user) {
                        router.push(`/login?next=${encodeURIComponent(`/game/${slug}`)}`);
                    } else if (!hasProfile) {
                        router.push(`/onboarding?next=${encodeURIComponent(`/game/${slug}`)}`);
                    } else {
                        joinGame(data.id, {
                            // The server decides between confirmed, waitlisted and requested
                            onSuccess: (updated) => {
                                const status = updated.viewer?.participation?.status;
                                triggerToast(
                                    status === 'requested' ? 'REQUEST SENT — THE HOST WILL CONFIRM'
                                        : status === 'waitlisted' ? "YOU'RE ON THE WAITLIST"
                                            : `YOU'RE IN — ${updated.title.toUpperCase()}`
                                );
                            },
                            onError: (error) => triggerToast(error.message.toUpperCase()),
                        });
                    }
                }}
                onShare={handleShare}
            />

            {/* Post-Game Modal */}
            {showPostGameModal && user && (
                <PostGameModal
                    game={data}
                    onClose={() => setShowPostGameModal(false)}
                    onComplete={() => {
                        setShowPostGameModal(false);
                        triggerToast("GAME RESULTS SUBMITTED FOR APPROVAL!");
                    }}
                />
            )}
        </div>
    );
}

