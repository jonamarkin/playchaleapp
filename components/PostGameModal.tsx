'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ICONS, SPORT_STATS } from '@/constants';
import { Game } from '@/types';
import { useSubmitGameResults, useSubmitPlayerStats, useCompleteGame } from '@/hooks/useData';
import { Switch } from '@/components/ui/switch';

interface PostGameModalProps {
    game: Game;
    userId: string;
    onClose: () => void;
    onComplete: () => void;
}

type Step = 'attendance' | 'result' | 'stats' | 'review';

interface PlayerAttendance {
    id: string;
    name: string;
    avatar?: string;
    showedUp: boolean;
}

interface PlayerStats {
    id: string;
    name: string;
    avatar?: string;
    stats: Record<string, number | boolean>;
}

const PostGameModal: React.FC<PostGameModalProps> = ({ game, userId, onClose, onComplete }) => {
    const [step, setStep] = useState<Step>('attendance');
    const [attendance, setAttendance] = useState<PlayerAttendance[]>(
        game.participants?.map(p => ({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            showedUp: true,
        })) || []
    );
    const [gameResult, setGameResult] = useState<Record<string, number>>({});
    const [playerStats, setPlayerStats] = useState<PlayerStats[]>(
        game.participants?.map(p => ({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            stats: {},
        })) || []
    );

    const sportConfig = SPORT_STATS[game.sport] || SPORT_STATS.Football;

    const submitResults = useSubmitGameResults();
    const submitStats = useSubmitPlayerStats();
    const completeGame = useCompleteGame();

    const handleSubmit = async () => {
        try {
            // 1. Mark game as complete
            await completeGame.mutateAsync(game.id);

            // 2. Submit game results
            await submitResults.mutateAsync({
                input: {
                    gameId: game.id,
                    resultData: gameResult,
                    approvalThreshold: sportConfig.approvalThreshold,
                },
                userId,
            });

            // 3. Submit player stats
            const statsPayload = playerStats.map(p => ({
                gameId: game.id,
                userId: p.id,
                stats: p.stats,
                showedUp: attendance.find(a => a.id === p.id)?.showedUp ?? true,
            }));
            await submitStats.mutateAsync(statsPayload);

            onComplete();
        } catch (error) {
            console.error('Failed to submit game results:', error);
        }
    };

    const steps: { key: Step; label: string }[] = [
        { key: 'attendance', label: 'Attendance' },
        { key: 'result', label: 'Result' },
        { key: 'stats', label: 'Stats' },
        { key: 'review', label: 'Review' },
    ];

    const currentStepIndex = steps.findIndex(s => s.key === step);

    const updatePlayerStat = (playerId: string, statKey: string, value: number | boolean) => {
        setPlayerStats(prev => prev.map(p =>
            p.id === playerId
                ? { ...p, stats: { ...p.stats, [statKey]: value } }
                : p
        ));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-black text-white p-6 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full">
                        <ICONS.X />
                    </button>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#C6FF00] mb-2">Post-Game Report</p>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">{game.title}</h2>
                    <p className="text-white/60 text-sm mt-1">{game.sport} • {game.date}</p>

                    {/* Progress */}
                    <div className="flex gap-2 mt-6">
                        {steps.map((s, i) => (
                            <div key={s.key} className="flex-1">
                                <div className={`h-1 rounded-full ${i <= currentStepIndex ? 'bg-[#C6FF00]' : 'bg-white/20'}`} />
                                <p className={`text-[8px] font-black uppercase tracking-widest mt-2 ${i === currentStepIndex ? 'text-[#C6FF00]' : 'text-white/40'}`}>
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[50vh]">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Attendance */}
                        {step === 'attendance' && (
                            <motion.div
                                key="attendance"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <h3 className="text-lg font-black uppercase tracking-tighter">Who showed up?</h3>
                                <p className="text-sm text-black/50">Mark players who attended the game. No-shows affect reliability.</p>

                                <div className="space-y-3 mt-6">
                                    {attendance.map(player => (
                                        <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <Image
                                                    src={player.avatar || 'https://i.pravatar.cc/150'}
                                                    alt={player.name}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full"
                                                />
                                                <span className="font-bold">{player.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold ${player.showedUp ? 'text-green-600' : 'text-red-500'}`}>
                                                    {player.showedUp ? 'Present' : 'No-show'}
                                                </span>
                                                <Switch
                                                    checked={player.showedUp}
                                                    onCheckedChange={(checked) =>
                                                        setAttendance(prev => prev.map(p =>
                                                            p.id === player.id ? { ...p, showedUp: checked } : p
                                                        ))
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Game Result */}
                        {step === 'result' && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <h3 className="text-lg font-black uppercase tracking-tighter">Final Score</h3>
                                <p className="text-sm text-black/50">Enter the final result of the game.</p>

                                <div className="grid grid-cols-2 gap-6 mt-6">
                                    {sportConfig.gameResult.map(field => (
                                        <div key={field.key} className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-black/50">{field.label}</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={gameResult[field.key] || 0}
                                                onChange={(e) => setGameResult(prev => ({ ...prev, [field.key]: parseInt(e.target.value) || 0 }))}
                                                className="w-full text-center text-4xl font-black p-4 bg-gray-50 rounded-2xl border-2 border-black/10 focus:border-[#C6FF00] focus:outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Player Stats */}
                        {step === 'stats' && (
                            <motion.div
                                key="stats"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <h3 className="text-lg font-black uppercase tracking-tighter">Individual Stats</h3>
                                <p className="text-sm text-black/50">Enter stats for each player who attended.</p>

                                <div className="space-y-6 mt-6">
                                    {playerStats.filter(p => attendance.find(a => a.id === p.id)?.showedUp).map(player => (
                                        <div key={player.id} className="p-4 bg-gray-50 rounded-2xl space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Image
                                                    src={player.avatar || 'https://i.pravatar.cc/150'}
                                                    alt={player.name}
                                                    width={36}
                                                    height={36}
                                                    className="rounded-full"
                                                />
                                                <span className="font-bold">{player.name}</span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                {sportConfig.playerStats.map(stat => (
                                                    <div key={stat.key} className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-black/40 flex items-center gap-1">
                                                            <span>{stat.icon}</span> {stat.label}
                                                        </label>
                                                        {stat.type === 'number' ? (
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={(player.stats[stat.key] as number) || 0}
                                                                onChange={(e) => updatePlayerStat(player.id, stat.key, parseInt(e.target.value) || 0)}
                                                                className="w-full text-center text-lg font-bold p-2 bg-white rounded-xl border border-black/10 focus:border-[#C6FF00] focus:outline-none"
                                                            />
                                                        ) : (
                                                            <Switch
                                                                checked={(player.stats[stat.key] as boolean) || false}
                                                                onCheckedChange={(checked) => updatePlayerStat(player.id, stat.key, checked)}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Review */}
                        {step === 'review' && (
                            <motion.div
                                key="review"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h3 className="text-lg font-black uppercase tracking-tighter">Review & Submit</h3>
                                <p className="text-sm text-black/50">
                                    Stats will be sent to all participants for approval.
                                    <span className="font-bold"> {Math.round(sportConfig.approvalThreshold * 100)}% must approve</span> for stats to be finalized.
                                </p>

                                {/* Summary */}
                                <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-black/5">
                                        <span className="font-bold">Final Score</span>
                                        <span className="text-xl font-black">
                                            {gameResult[sportConfig.gameResult[0]?.key] || 0} - {gameResult[sportConfig.gameResult[1]?.key] || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold">Attendance</span>
                                        <span className="text-sm">
                                            {attendance.filter(a => a.showedUp).length} / {attendance.length} players
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold">Approval Required</span>
                                        <span className="text-sm">{Math.round(sportConfig.approvalThreshold * 100)}% of participants</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-black/5 flex gap-3">
                    {step !== 'attendance' && (
                        <button
                            onClick={() => setStep(steps[currentStepIndex - 1].key)}
                            className="flex-1 py-4 bg-gray-100 text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Back
                        </button>
                    )}
                    {step !== 'review' ? (
                        <button
                            onClick={() => setStep(steps[currentStepIndex + 1].key)}
                            className="flex-1 py-4 bg-black text-[#C6FF00] rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitResults.isPending || submitStats.isPending}
                            className="flex-1 py-4 bg-[#C6FF00] text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all disabled:opacity-50"
                        >
                            {submitResults.isPending || submitStats.isPending ? 'Submitting...' : 'Submit for Approval'}
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PostGameModal;
