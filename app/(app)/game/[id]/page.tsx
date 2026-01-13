'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlayChale } from '@/providers/PlayChaleProvider';
import GameDetailView from '@/components/GameDetailView';
import { Game, MatchRecord } from '@/types';
import { ICONS } from '@/constants';

export default function GamePage() {
    const params = useParams();
    const router = useRouter();
    const { games, players, activeModal } = usePlayChale();
    const [viewType, setViewType] = useState<'join' | 'manage' | 'report' | null>(null);
    const [data, setData] = useState<Game | MatchRecord | null>(null);

    const id = params?.id as string;
    const currentUser = players[0]; // Assuming first player is current user as per convention

    useEffect(() => {
        if (!id) return;

        // 1. Search in Upcoming Games
        const foundGame = games.find(g => g.id === id);
        if (foundGame) {
            // Check if current user is the organizer
            // In mock data, organizer is a name string e.g. "Alex K."
            // In a real app we'd compare IDs. For now, let's assume if it's in 'games' list and user is host, it is manage.
            // But PlayChaleProvider doesn't have a robust 'user is host' check other than name matching or if we just created it.
            // Let's rely on basic logic: if I created it, I manage it.
            // For now, default to 'join' unless we can prove ownership. 
            // Simplified: If the modal would have been 'manage-game' (which we can't check easily without triggering), 
            // let's just check if the current user name matches organizer.
            const isOrganizer = foundGame.organizer === currentUser.name;

            setViewType(isOrganizer ? 'manage' : 'join');
            setData(foundGame);
            return;
        }

        // 2. Search in Match Histories (Completed Matches)
        // We search across all players in the mock db to find the match record
        // This is inefficient in real life but fine for mock
        let foundMatch: MatchRecord | undefined;
        for (const p of players) {
            if (p.matchHistory) {
                foundMatch = p.matchHistory.find(m => m.id === id);
                if (foundMatch) break;
            }
        }

        if (foundMatch) {
            setViewType('report');
            setData(foundMatch);
            return;
        }

        // If not found, redirect to home or 404
        // router.push('/home'); 
    }, [id, games, players, currentUser]);

    if (!data || !viewType) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-[#C6FF00] rounded-full animate-bounce"></div>
                    <p className="font-black uppercase tracking-widest text-xs opacity-50">Loading Arena...</p>
                </div>
            </div>
        );
    }

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

            <GameDetailView
                type={viewType}
                data={data}
                currentUser={currentUser}
                onJoin={() => {
                    console.log('Joined game', data.id);
                    // In a real app calls API. For mock, maybe show toast?
                    // The extraction of onJoin logic from provider/modal is needed if we want it to actually update mock state.
                }}
                onShare={() => {
                    console.log('Sharing', data.id);
                }}
            />
        </div>
    );
}
