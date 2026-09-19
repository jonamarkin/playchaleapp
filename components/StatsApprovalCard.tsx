'use client';

import React from 'react';
import Image from 'next/image';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Eyebrow, Text } from '@/components/ui/typography';
import { useReviewMyStats } from '@/features/stats/hooks';
import { useSport } from '@/features/sports/hooks';
import { formatGameDate } from '@/lib/format';
import type { StatApproval } from '@/lib/api/types';
import { cn } from '@/lib/utils';

/**
 * One line a host reported about you, waiting on your word.
 *
 * Nothing here reaches a career total until it is approved — this card is the whole
 * reason the numbers on a profile mean anything.
 */
interface StatsApprovalCardProps {
    approval: StatApproval;
    onReviewed?: () => void;
}

const StatsApprovalCard: React.FC<StatsApprovalCardProps> = ({ approval, onReviewed }) => {
    const reviewStats = useReviewMyStats();
    const { sport } = useSport(approval.sport);
    const resultData = approval.result?.resultData ?? {};

    if (!approval.game) return null;
    const { game } = approval;

    const review = (decision: 'approve' | 'reject') =>
        reviewStats.mutate({ gameId: approval.gameId, decision }, { onSuccess: () => onReviewed?.() });

    const score = sport?.resultFields.map((field) => resultData[field.key] ?? 0).join(' – ');

    return (
        <article className="animate-in fade-in slide-in-from-bottom-5 overflow-hidden rounded-card border-2 border-line bg-surface-panel shadow-e1 transition-all [animation-duration:400ms] hover:shadow-e2">
            <div className="relative h-24 sm:h-32">
                <Image src={game.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
                <div className="absolute inset-x-4 bottom-3">
                    <span className="rounded-pill bg-lime-500 px-2.5 py-1 text-eyebrow font-black uppercase tracking-widest text-ink-900">
                        Your call
                    </span>
                    <h3 className="mt-1 truncate text-lg font-black italic uppercase tracking-tighter text-white">{game.title}</h3>
                    <Eyebrow className="text-white/60">{formatGameDate(game.startsAt, game.timezone)}</Eyebrow>
                </div>
            </div>

            <div className="space-y-4 p-5">
                {score && (
                    <div className="flex items-center justify-between border-b border-line pb-4">
                        <Eyebrow>Final score</Eyebrow>
                        <span className="text-xl font-black">{score}</span>
                    </div>
                )}

                <div className="space-y-3">
                    <Eyebrow>What the host reported</Eyebrow>
                    <div className="grid grid-cols-3 gap-3">
                        {sport?.statFields.map((field) => (
                            <div key={field.key} className="rounded-field bg-fg/5 p-3 text-center">
                                <p className="text-lg font-black">
                                    {typeof approval.stats[field.key] === 'boolean'
                                        ? (approval.stats[field.key] ? 'Yes' : 'No')
                                        : (approval.stats[field.key] ?? 0)}
                                </p>
                                <Eyebrow className="mt-1 block">{field.label}</Eyebrow>
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    className={cn(
                        'flex items-center gap-2 rounded-field p-3',
                        approval.showedUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    )}
                >
                    {approval.showedUp ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    <Text size="sm" weight="bold" className="text-current">
                        {approval.showedUp ? 'Marked present' : 'Marked as a no-show'}
                        {approval.outcome ? ` · recorded as a ${approval.outcome}` : ''}
                    </Text>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button variant="outline" full disabled={reviewStats.isPending} onClick={() => review('reject')}>
                        Dispute
                    </Button>
                    <Button full loading={reviewStats.isPending} onClick={() => review('approve')}>
                        Approve
                    </Button>
                </div>
            </div>
        </article>
    );
};

export default StatsApprovalCard;
