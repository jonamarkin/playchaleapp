'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import AppLoader from '@/components/AppLoader';
import { usePlayChale } from '@/providers/PlayChaleProvider';
import GameDetailView from '@/components/GameDetailView';
import { Game } from '@/types';
import { ICONS } from '@/constants/icons';
import { useJoinGame, useProfile } from '@/hooks/useData';

const PostGameModal = dynamic(() => import('@/components/PostGameModal'), {
    ssr: false,
    loading: () => <AppLoader label="Opening report" overlay />,
});

interface GameClientPageProps {
    id: string;
    initialGame?: Game | null;
}

export default function GameClientPage({ initialGame }: GameClientPageProps) {
    const router = useRouter();
    const { user, triggerToast } = usePlayChale();
    const { mutate: joinGame } = useJoinGame();
    const { data: profile } = useProfile(user?.id);

    const [showPostGameModal, setShowPostGameModal] = useState(false);

    const data = initialGame ?? null;
    const viewType: 'join' | 'manage' | 'report' | null = data
        ? (user && data.organizer_id === user.id ? 'manage' : 'join')
        : null;
    const isHost = user && data && 'organizer_id' in data && data.organizer_id === user.id;
    const isGameComplete = data && 'completed_at' in data && data.completed_at;

    if (!data || !viewType) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="pc-view-enter flex flex-col items-center gap-4 text-center">
                    <ICONS.Logo />
                    <p className="font-black uppercase tracking-widest text-xs opacity-50">Match Not Found</p>
                </div>
            </div>
        );
    }

    const handleShare = async () => {
        const shareData = {
            title: `Join my game: ${data.title}`,
            text: `Play ${data.sport} at ${data.location}. Join me on PlayChale!`,
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
            <div className="fixed top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#C6FF00]/5 to-transparent pointer-events-none" />

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
                    className="fixed bottom-[calc(12.2rem+env(safe-area-inset-bottom))] right-4 z-[125] bg-[#C6FF00] text-black px-5 py-3 md:bottom-6 md:right-6 md:px-6 md:py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
                >
                    <span>📊</span> Complete Game
                </button>
            )}

            {isGameComplete && (
                <div className="fixed bottom-[calc(12.2rem+env(safe-area-inset-bottom))] right-4 z-[125] bg-green-500 text-white px-5 py-3 md:bottom-6 md:right-6 md:px-6 md:py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-2">
                    <span>✓</span> Game Completed
                </div>
            )}

            <GameDetailView
                type={viewType}
                data={data}
                currentUser={profile ?? undefined}
                onJoin={() => {
                    if (user && data.id) {
                        joinGame({ gameId: data.id, userId: user.id });
                        triggerToast("JOIN REQUEST SENT!");
                    } else {
                        router.push('/login');
                    }
                }}
                onShare={handleShare}
            />

            {/* Post-Game Modal */}
            {showPostGameModal && user && 'id' in data && (
                <PostGameModal
                    game={data as Game}
                    userId={user.id}
                    onClose={() => setShowPostGameModal(false)}
                    onComplete={() => {
                        setShowPostGameModal(false);
                        triggerToast("GAME RESULTS SUBMITTED FOR APPROVAL!");
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}
