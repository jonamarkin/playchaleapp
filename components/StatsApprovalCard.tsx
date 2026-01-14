'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { SPORT_STATS } from '@/constants';
import { useApproveStats, useVoteForMVP } from '@/hooks/useData';

interface PendingApproval {
    id: string;
    game_id: string;
    user_id: string;
    stats: Record<string, any>;
    showed_up: boolean;
    games: {
        id: string;
        title: string;
        sport: string;
        date: string;
        time: string;
        image_url: string;
    };
    game_results: {
        result_data: Record<string, any>;
        status: string;
    };
}

interface StatsApprovalCardProps {
    approval: PendingApproval;
    userId: string;
    onApproved?: () => void;
}

const StatsApprovalCard: React.FC<StatsApprovalCardProps> = ({ approval, userId, onApproved }) => {
    const approveStats = useApproveStats();
    const voteForMVP = useVoteForMVP();

    const sportConfig = SPORT_STATS[approval.games?.sport] || SPORT_STATS.Football;
    const gameResult = approval.game_results?.result_data || {};

    const handleApprove = async () => {
        try {
            await approveStats.mutateAsync({
                gameId: approval.game_id,
                userId: userId,
                approved: true,
            });
            onApproved?.();
        } catch (error) {
            console.error('Failed to approve stats:', error);
        }
    };

    const handleReject = async () => {
        try {
            await approveStats.mutateAsync({
                gameId: approval.game_id,
                userId: userId,
                approved: false,
            });
            onApproved?.();
        } catch (error) {
            console.error('Failed to reject stats:', error);
        }
    };

    if (!approval.games) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-black/5 rounded-[28px] overflow-hidden shadow-sm hover:shadow-lg transition-all"
        >
            {/* Header */}
            <div className="relative h-24 sm:h-32">
                <Image
                    src={approval.games.image_url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018'}
                    alt={approval.games.title}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                    <span className="bg-[#C6FF00] text-black px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                        Pending Approval
                    </span>
                    <h4 className="text-white font-black italic uppercase tracking-tighter text-lg mt-1 truncate">
                        {approval.games.title}
                    </h4>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                {/* Game Result */}
                <div className="flex items-center justify-between pb-4 border-b border-black/5">
                    <span className="text-xs font-black uppercase tracking-widest text-black/40">Final Score</span>
                    <span className="text-xl font-black">
                        {gameResult[sportConfig.gameResult[0]?.key] || 0} - {gameResult[sportConfig.gameResult[1]?.key] || 0}
                    </span>
                </div>

                {/* Your Stats */}
                <div className="space-y-3">
                    <span className="text-xs font-black uppercase tracking-widest text-black/40">Your Stats</span>
                    <div className="grid grid-cols-3 gap-3">
                        {sportConfig.playerStats.map(stat => (
                            <div key={stat.key} className="bg-gray-50 rounded-xl p-3 text-center">
                                <span className="text-2xl">{stat.icon}</span>
                                <p className="text-lg font-black mt-1">{approval.stats[stat.key] || 0}</p>
                                <p className="text-[8px] font-bold uppercase tracking-widest text-black/40">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Attendance */}
                <div className={`flex items-center gap-2 p-3 rounded-xl ${approval.showed_up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    <span className="text-lg">{approval.showed_up ? '✓' : '✗'}</span>
                    <span className="text-sm font-bold">
                        {approval.showed_up ? 'Marked as Present' : 'Marked as No-Show'}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleReject}
                        disabled={approveStats.isPending}
                        className="flex-1 py-3 bg-gray-100 text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all disabled:opacity-50"
                    >
                        Dispute
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={approveStats.isPending}
                        className="flex-1 py-3 bg-[#C6FF00] text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all disabled:opacity-50"
                    >
                        {approveStats.isPending ? 'Approving...' : 'Approve'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default StatsApprovalCard;
