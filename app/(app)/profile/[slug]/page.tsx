'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProfileDashboard from '@/components/ProfileDashboard';
import { TOP_PLAYERS } from '@/constants';
import { usePlayChale } from '@/providers/PlayChaleProvider';

export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { players, user, openModal, triggerToast } = usePlayChale();
    const profileSlug = params.slug as string;

    // 2. Find the player data (by slug or ID)
    const playerData = React.useMemo(() => {
        if (!players) return null;

        // Try to match by slug first, then ID
        const found = players.find(p => p.slug === profileSlug || p.id === profileSlug);

        // If "me" alias is used, return current user if logged in
        if (profileSlug === 'me' && user) {
            return players.find(p => p.id === user.id);
        }

        return found;
    }, [players, profileSlug, user]);

    // 1. Check if it's the current user's profile
    const isOwner = user?.id === playerData?.id;

    React.useEffect(() => {
        if (!playerData && !isOwner) {
            // Optional: Redirect or show 404
            // router.push('/404');
        }
    }, [playerData, isOwner]);

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        triggerToast('PROFILE LINK COPIED TO CLIPBOARD');
    };

    if (!playerData) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-white/10 border-t-[#C6FF00] rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Scouting Player...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black min-h-screen"
        >
            <ProfileDashboard
                player={playerData}
                isOwner={isOwner}
                onEditStats={() => isOwner && openModal('stats', playerData)}
                onEditProfile={() => isOwner && openModal('edit-profile', playerData)}
                onShareProfile={handleShare}
                onViewMatch={(match) => router.push(`/game/${match.slug || match.id}`)}
            />
        </motion.div>
    );
}
