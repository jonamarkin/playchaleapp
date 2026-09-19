'use client';

import React, { useId, useMemo, useState } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import type { Game, PlayerStatInput } from '@/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Eyebrow, Text } from '@/components/ui/typography';
import { useSubmitGameResults, useSubmitPlayerStats } from '@/features/stats/hooks';
import { useCompleteGame } from '@/features/games/hooks';
import { useSport } from '@/features/sports/hooks';
import { formatGameDate } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * The host's post-game report: attendance, result, per-player stats.
 *
 * What gets asked for comes from the sports registry, not from a table in the frontend —
 * adding a sport server-side changes this form with no deploy. Nothing entered here is
 * final: each player approves their own line before it reaches a career total.
 */
interface PostGameModalProps {
    game: Game;
    onClose: () => void;
    onComplete: () => void;
}

type Step = 'attendance' | 'result' | 'stats' | 'review';
type Outcome = NonNullable<PlayerStatInput['outcome']>;

interface PlayerEntry {
    id: string;
    name: string;
    avatarUrl: string;
    showedUp: boolean;
    outcome: Outcome;
    stats: Record<string, number | boolean>;
}

const STEPS: { key: Step; label: string }[] = [
    { key: 'attendance', label: 'Attendance' },
    { key: 'result', label: 'Result' },
    { key: 'stats', label: 'Stats' },
    { key: 'review', label: 'Review' },
];

const OUTCOMES: { value: Outcome; label: string }[] = [
    { value: 'win', label: 'W' },
    { value: 'draw', label: 'D' },
    { value: 'loss', label: 'L' },
];

const PostGameModal: React.FC<PostGameModalProps> = ({ game, onClose, onComplete }) => {
    const { sport } = useSport(game.sport);
    const [step, setStep] = useState<Step>('attendance');
    const [gameResult, setGameResult] = useState<Record<string, number>>({});
    const [players, setPlayers] = useState<PlayerEntry[]>(() =>
        (game.participants ?? [])
            .filter((p) => p.status === 'confirmed')
            .map((p) => ({
                id: p.player.id,
                name: p.player.name,
                avatarUrl: p.player.avatarUrl,
                showedUp: p.attendance !== 'no_show',
                outcome: 'draw',
                stats: {},
            }))
    );

    const submitResults = useSubmitGameResults();
    const submitStats = useSubmitPlayerStats();
    const completeGame = useCompleteGame();
    const isSubmitting = submitResults.isPending || submitStats.isPending || completeGame.isPending;

    const present = useMemo(() => players.filter((p) => p.showedUp), [players]);
    const currentStepIndex = STEPS.findIndex((s) => s.key === step);
    const threshold = sport ? Math.round(sport.approvalThreshold * 100) : 100;

    const update = (id: string, patch: Partial<PlayerEntry>) =>
        setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

    const setStat = (id: string, key: string, value: number | boolean) =>
        setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, stats: { ...p.stats, [key]: value } } : p)));

    async function handleSubmit() {
        try {
            // Order matters: the stats reference the result version they were entered against
            await submitResults.mutateAsync({ gameId: game.id, input: { resultData: gameResult } });
            await submitStats.mutateAsync({
                gameId: game.id,
                stats: players.map((p) => ({
                    playerId: p.id,
                    stats: p.stats,
                    showedUp: p.showedUp,
                    outcome: p.outcome,
                })),
            });
            await completeGame.mutateAsync(game.id);
            onComplete();
        } catch (error) {
            console.error('Failed to submit game results:', error);
        }
    }

    const stepContent = {
        attendance: (
            <StepPane key="attendance" title="Who showed up?" hint="No-shows count against reliability, so this is worth getting right.">
                <div className="space-y-3">
                    {players.map((player) => (
                        <div key={player.id} className="flex items-center justify-between rounded-card border border-line bg-fg/5 p-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <Image src={player.avatarUrl} alt="" width={40} height={40} className="h-10 w-10 rounded-pill object-cover" />
                                <span className="truncate font-bold">{player.name}</span>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                                <span className={cn('text-body-sm font-bold', player.showedUp ? 'text-green-600' : 'text-red-500')}>
                                    {player.showedUp ? 'Present' : 'No-show'}
                                </span>
                                <Switch
                                    checked={player.showedUp}
                                    aria-label={`${player.name} showed up`}
                                    onCheckedChange={(checked) => update(player.id, { showedUp: checked })}
                                />
                            </div>
                        </div>
                    ))}
                    {players.length === 0 && <Text size="sm" tone="subtle">No one was confirmed for this game.</Text>}
                </div>
            </StepPane>
        ),
        result: (
            <StepPane key="result" title="Final score" hint={`How ${sport?.name ?? game.sport} results are recorded.`}>
                <div className="grid grid-cols-2 gap-6">
                    {sport?.resultFields.map((field) => (
                        <ScoreField
                            key={field.key}
                            label={field.label}
                            value={gameResult[field.key] ?? 0}
                            onChange={(value) => setGameResult((prev) => ({ ...prev, [field.key]: value }))}
                        />
                    ))}
                </div>
            </StepPane>
        ),
        stats: (
            <StepPane key="stats" title="Individual stats" hint="Each player approves their own line before it counts.">
                <div className="space-y-6">
                    {present.map((player) => (
                        <div key={player.id} className="space-y-4 rounded-card border border-line bg-fg/5 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <Image src={player.avatarUrl} alt="" width={36} height={36} className="h-9 w-9 rounded-pill object-cover" />
                                    <span className="truncate font-bold">{player.name}</span>
                                </div>
                                <OutcomePicker
                                    name={player.name}
                                    value={player.outcome}
                                    onChange={(outcome) => update(player.id, { outcome })}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {sport?.statFields.map((field) => (
                                    <StatField
                                        key={field.key}
                                        label={field.label}
                                        type={field.type}
                                        value={player.stats[field.key]}
                                        onChange={(value) => setStat(player.id, field.key, value)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                    {present.length === 0 && <Text size="sm" tone="subtle">Nobody is marked as present.</Text>}
                </div>
            </StepPane>
        ),
        review: (
            <StepPane
                key="review"
                title="Review & submit"
                hint={`Stats go to every player for approval — ${threshold}% must approve before they count towards career totals.`}
            >
                <dl className="space-y-4 rounded-card border border-line bg-fg/5 p-4">
                    <SummaryRow label="Final score">
                        {sport?.resultFields.map((f) => gameResult[f.key] ?? 0).join(' – ') || '—'}
                    </SummaryRow>
                    <SummaryRow label="Attendance">{present.length} of {players.length} players</SummaryRow>
                    <SummaryRow label="Results">
                        {present.filter((p) => p.outcome === 'win').length}W · {present.filter((p) => p.outcome === 'draw').length}D ·{' '}
                        {present.filter((p) => p.outcome === 'loss').length}L
                    </SummaryRow>
                </dl>
            </StepPane>
        ),
    }[step];

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent title={game.title} description={`Post-game report · ${formatGameDate(game.startsAt, game.timezone)}`} className="max-w-2xl">
                <div className="space-y-6">
                    <ol className="flex gap-2" aria-label="Report progress">
                        {STEPS.map((s, i) => (
                            <li key={s.key} className="flex-1" aria-current={i === currentStepIndex ? 'step' : undefined}>
                                <div className={cn('h-1 rounded-pill', i <= currentStepIndex ? 'bg-lime-500' : 'bg-fg/10')} />
                                <Eyebrow className={cn('mt-2 block', i === currentStepIndex ? 'text-brand' : undefined)}>{s.label}</Eyebrow>
                            </li>
                        ))}
                    </ol>

                    <div className="max-h-[50vh] overflow-y-auto">
                        <AnimatePresence mode="wait">{stepContent}</AnimatePresence>
                    </div>

                    <div className="flex gap-3 border-t border-line pt-6">
                        {currentStepIndex > 0 && (
                            <Button variant="outline" full onClick={() => setStep(STEPS[currentStepIndex - 1].key)}>Back</Button>
                        )}
                        {step !== 'review' ? (
                            <Button variant="inverse" full onClick={() => setStep(STEPS[currentStepIndex + 1].key)}>Continue</Button>
                        ) : (
                            <Button full loading={isSubmitting} onClick={handleSubmit}>Submit for approval</Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

function StepPane({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
    return (
        <m.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="space-y-1">
                <h3 className="text-lg font-black uppercase tracking-tighter">{title}</h3>
                <Text size="sm" tone="subtle">{hint}</Text>
            </div>
            {children}
        </m.div>
    );
}

function ScoreField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
    const id = useId();
    return (
        <div className="space-y-2">
            <label htmlFor={id}><Eyebrow>{label}</Eyebrow></label>
            <input
                id={id}
                type="number"
                min="0"
                inputMode="numeric"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-card border-2 border-line bg-fg/5 p-4 text-center text-4xl font-black focus:border-lime-500 focus:outline-none"
            />
        </div>
    );
}

function StatField({
    label, type, value, onChange,
}: { label: string; type: 'number' | 'boolean'; value: number | boolean | undefined; onChange: (value: number | boolean) => void }) {
    const id = useId();
    return (
        <div className="space-y-1">
            <label htmlFor={id}><Eyebrow>{label}</Eyebrow></label>
            {type === 'number' ? (
                <input
                    id={id}
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={(value as number) || 0}
                    onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-field border border-line bg-surface-panel p-2 text-center text-body font-bold focus:border-lime-500 focus:outline-none"
                />
            ) : (
                <Switch id={id} checked={Boolean(value)} onCheckedChange={onChange} />
            )}
        </div>
    );
}

/** W/D/L for one player — the input career records are actually built from. */
function OutcomePicker({ name, value, onChange }: { name: string; value: Outcome; onChange: (value: Outcome) => void }) {
    return (
        <div className="flex shrink-0 gap-1 rounded-pill bg-fg/5 p-1" role="group" aria-label={`Result for ${name}`}>
            {OUTCOMES.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    aria-pressed={value === option.value}
                    onClick={() => onChange(option.value)}
                    className={cn(
                        'h-8 w-8 rounded-pill text-label font-black transition-colors',
                        value === option.value ? 'bg-ink-900 text-lime-500' : 'text-fg-muted hover:bg-fg/10'
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
            <dt className="font-bold">{label}</dt>
            <dd className="text-body-sm font-black">{children}</dd>
        </div>
    );
}

export default PostGameModal;
