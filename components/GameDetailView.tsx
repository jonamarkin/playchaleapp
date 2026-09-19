'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, MapPin, Share2, Wallet, X } from 'lucide-react';
import type { Game, Participant } from '@/types';
import SportIcon from '@/components/SportIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eyebrow, Text } from '@/components/ui/typography';
import { useDecideParticipant, useRemoveParticipant, useUpdateGame } from '@/features/games/hooks';
import { useSportName } from '@/features/sports/hooks';
import { formatGameDate, formatGameTime, formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * The game page — the thing people share, so it has to read well cold.
 *
 * Whether the viewer can manage the game comes from `game.viewer`, not from comparing ids
 * in the client: the server already made that decision and the two can't disagree.
 *
 * The old `report` mode was dropped with the contract rewrite. It rendered a MatchRecord
 * shape (score strings, an MVP "contribution" blurb) that no endpoint ever returned, and
 * nothing rendered it. Results now live on the completed game.
 */
interface GameDetailProps {
    game: Game;
    onJoin?: () => void;
    joining?: boolean;
    onShare?: () => void;
}

const LIVE_STATUSES: Participant['status'][] = ['confirmed', 'waitlisted', 'requested'];

export default function GameDetailView({ game, onJoin, joining = false, onShare }: GameDetailProps) {
    const sportName = useSportName();
    const [isEditing, setIsEditing] = useState(false);

    const canManage = !!game.viewer?.canManage;
    const participation = game.viewer?.participation ?? null;
    const roster = (game.participants ?? []).filter((p) => LIVE_STATUSES.includes(p.status));
    const confirmed = roster.filter((p) => p.status === 'confirmed');
    const requests = roster.filter((p) => p.status === 'requested');
    const waitlist = roster.filter((p) => p.status === 'waitlisted');
    const openSpots = Math.max(0, game.capacity - game.confirmedCount);

    return (
        <div className="mx-auto w-full max-w-5xl space-y-8 p-4 pb-32 md:p-8">
            <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-pill bg-lime-500 px-4 py-1.5 text-eyebrow font-black uppercase tracking-[0.2em] text-ink-900">
                            {canManage ? 'You host this' : 'Upcoming match'}
                        </span>
                        <span
                            className={cn(
                                'rounded-pill border px-3 py-1 text-eyebrow font-black uppercase tracking-widest',
                                game.status === 'scheduled' ? 'border-lime-500 text-lime-500' : 'border-white/20 text-white/40'
                            )}
                        >
                            {game.status}
                        </span>
                    </div>
                    <h1 className="text-4xl font-black italic uppercase leading-none tracking-tighter text-white md:text-7xl">
                        {game.title}
                    </h1>
                </div>

                <div className="flex gap-4">
                    {onShare && (
                        <Button variant="outline" size="icon" onClick={onShare} aria-label="Share this game" className="border-white/10 text-white hover:bg-white hover:text-ink-900">
                            <Share2 className="h-5 w-5" />
                        </Button>
                    )}
                    {canManage && (
                        <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="border-white/10 text-white hover:bg-white hover:text-ink-900">
                            {isEditing ? 'Cancel edit' : 'Edit details'}
                        </Button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 md:gap-12">
                <div className="space-y-8 lg:col-span-2">
                    <div className="relative aspect-video overflow-hidden rounded-card-xl border border-white/10 shadow-e3">
                        <Image src={game.imageUrl} alt="" fill priority sizes="(max-width: 1024px) 100vw, 660px" className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent opacity-80" />

                        <div className="glass absolute left-8 top-8 flex items-center gap-3 rounded-pill border border-white/10 px-6 py-3">
                            <span className="text-lime-500"><SportIcon sport={game.sport} size={18} /></span>
                            <span className="text-eyebrow font-black uppercase tracking-widest text-white">{sportName(game.sport)}</span>
                        </div>

                        <div className="absolute bottom-8 left-8 right-8">
                            <Eyebrow className="mb-2 text-lime-500">Location</Eyebrow>
                            <p className="text-2xl font-black italic uppercase leading-none text-white md:text-3xl">{game.locationText}</p>
                        </div>
                    </div>

                    {isEditing && canManage && <EditGameForm game={game} onDone={() => setIsEditing(false)} />}

                    <div className="grid grid-cols-2 gap-4">
                        <Fact icon={<Clock className="h-4 w-4" />} label="Date & time">
                            <span className="text-xl font-black italic text-white">
                                {formatGameDate(game.startsAt, game.timezone)}
                            </span>
                            <span className="block text-body-sm font-bold text-white/50">
                                {formatGameTime(game.startsAt, game.timezone)}
                                {game.durationMinutes ? ` · ${game.durationMinutes} min` : ''}
                            </span>
                        </Fact>
                        <Fact icon={<Wallet className="h-4 w-4" />} label="Entry fee">
                            <span className="text-xl font-black italic text-lime-500">{formatMoney(game.fee)}</span>
                            {game.paymentMethod === 'momo_manual' && game.paymentHandle && (
                                <span className="block text-body-sm font-bold text-white/50">MoMo · {game.paymentHandle}</span>
                            )}
                        </Fact>
                    </div>
                </div>

                <div className="space-y-8">
                    <Link
                        href={`/profile/${game.host.handle}`}
                        className="flex items-center gap-4 rounded-card border border-white/10 bg-white/5 p-6 transition-colors hover:border-lime-500/40"
                    >
                        <Image src={game.host.avatarUrl} alt="" width={48} height={48} className="h-12 w-12 rounded-pill object-cover" />
                        <div className="min-w-0">
                            <Eyebrow>Hosted by</Eyebrow>
                            <p className="truncate font-black italic uppercase text-white">{game.host.name}</p>
                        </div>
                    </Link>

                    <section className="flex min-h-[400px] flex-col rounded-card-xl border border-white/10 bg-white/5 p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-lg font-black italic uppercase text-white">Squad</h2>
                            <span className="text-body-sm font-black text-lime-500">{game.confirmedCount} / {game.capacity}</span>
                        </div>

                        <div className="custom-scrollbar max-h-[400px] flex-1 space-y-4 overflow-y-auto pr-2">
                            {confirmed.map((p) => (
                                <RosterRow key={p.player.id} entry={p} gameId={game.id} canManage={canManage} />
                            ))}

                            {Array.from({ length: openSpots }).map((_, i) => (
                                <div key={`empty-${i}`} className="flex items-center gap-4 p-3 opacity-30">
                                    <div className="h-10 w-10 rounded-pill border-2 border-dashed border-white/30" />
                                    <p className="text-eyebrow font-black uppercase tracking-widest text-white">Open spot</p>
                                </div>
                            ))}

                            {waitlist.length > 0 && (
                                <div className="space-y-2 border-t border-white/10 pt-4">
                                    <Eyebrow>Waitlist</Eyebrow>
                                    {waitlist.map((p) => (
                                        <RosterRow key={p.player.id} entry={p} gameId={game.id} canManage={canManage} />
                                    ))}
                                </div>
                            )}

                            {canManage && requests.length > 0 && (
                                <div className="space-y-2 border-t border-white/10 pt-4">
                                    <Eyebrow>Wants to join · {requests.length}</Eyebrow>
                                    {requests.map((p) => (
                                        <RequestRow key={p.player.id} entry={p} gameId={game.id} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {!canManage && (
                            <div className="mt-4 border-t border-white/10 pt-8">
                                {participation ? (
                                    <Text size="sm" tone="muted" className="text-center">
                                        {participation.status === 'confirmed' ? "You're on this squad."
                                            : participation.status === 'requested' ? 'Your request is with the host.'
                                                : `You're #${participation.position} on the waitlist.`}
                                    </Text>
                                ) : (
                                    <Button full size="lg" loading={joining} onClick={onJoin}>
                                        {game.joinPolicy === 'approval' ? 'Ask to join'
                                            : openSpots === 0 ? 'Join the waitlist'
                                                : 'Join squad'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

function Fact({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2 rounded-card border border-white/5 bg-white/5 p-6">
            <div className="flex items-center gap-2 text-white/30">
                <span aria-hidden="true">{icon}</span>
                <Eyebrow>{label}</Eyebrow>
            </div>
            <div>{children}</div>
        </div>
    );
}

function RosterRow({ entry, gameId, canManage }: { entry: Participant; gameId: string; canManage: boolean }) {
    const { mutate: remove, isPending } = useRemoveParticipant(gameId);
    const { player, status, role, position } = entry;

    return (
        <div className="flex items-center gap-4 rounded-field p-3 transition-colors hover:bg-white/5">
            <Link href={`/profile/${player.handle}`} className="flex min-w-0 flex-1 items-center gap-4">
                <Image src={player.avatarUrl} alt="" width={40} height={40} className="h-10 w-10 rounded-pill border border-white/10 object-cover" />
                <div className="min-w-0">
                    <p className="truncate text-body-sm font-black italic text-white">{player.name}</p>
                    <Eyebrow>{status === 'waitlisted' ? `Waitlist #${position}` : role === 'host' ? 'Host' : 'Player'}</Eyebrow>
                </div>
            </Link>
            {canManage && role !== 'host' && (
                <button
                    onClick={() => remove(player.id)}
                    disabled={isPending}
                    aria-label={`Remove ${player.name} from this game`}
                    className="rounded-pill p-2 text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-40"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

function RequestRow({ entry, gameId }: { entry: Participant; gameId: string }) {
    const { mutate: decide, isPending } = useDecideParticipant(gameId);
    const { player } = entry;

    return (
        <div className="flex items-center gap-3 rounded-field p-3">
            <Image src={player.avatarUrl} alt="" width={40} height={40} className="h-10 w-10 rounded-pill object-cover" />
            <p className="min-w-0 flex-1 truncate text-body-sm font-black italic text-white">{player.name}</p>
            <Button size="sm" loading={isPending} onClick={() => decide({ playerId: player.id, decision: 'approve' })}>
                Approve
            </Button>
            <Button
                size="sm"
                variant="ghost"
                disabled={isPending}
                onClick={() => decide({ playerId: player.id, decision: 'decline' })}
                className="text-white/40"
            >
                Decline
            </Button>
        </div>
    );
}

/** Host edit. Only the fields a host actually changes after posting. */
function EditGameForm({ game, onDone }: { game: Game; onDone: () => void }) {
    const { mutate: update, isPending } = useUpdateGame(game.id);
    const [title, setTitle] = useState(game.title);
    const [locationText, setLocationText] = useState(game.locationText);
    const [capacity, setCapacity] = useState(String(game.capacity));

    function submit(event: React.FormEvent) {
        event.preventDefault();
        update({ title, locationText, capacity: Number(capacity) }, { onSuccess: onDone });
    }

    return (
        <form onSubmit={submit} className="space-y-6 rounded-card-xl border border-white/10 bg-white/5 p-8">
            <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Title" value={title} onChange={setTitle} />
                <Field label="Location" value={locationText} onChange={setLocationText} />
                <Field label="Squad size" value={capacity} onChange={setCapacity} type="number" />
            </div>
            <Button type="submit" full loading={isPending}>Save changes</Button>
        </form>
    );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
    const id = React.useId();
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="ml-4"><Eyebrow>{label}</Eyebrow></label>
            <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-12 rounded-pill border-white/10 bg-ink-950/50" />
        </div>
    );
}
