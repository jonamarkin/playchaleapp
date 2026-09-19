'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Eyebrow, Text } from '@/components/ui/typography';
import SportIcon from '@/components/SportIcon';
import { useJoinGame } from '@/features/games/hooks';
import { useSession } from '@/features/auth/session';
import { useUIStore } from '@/hooks/useUIStore';
import { useSportName } from '@/features/sports/hooks';
import { formatGameWhen, formatMoney } from '@/lib/format';
import type { Game } from '@/types';

/**
 * The join flow, lifted out of the 1,124-line GameModal. Confirms the details and joins;
 * everything else that modal claimed to do (challenges, messaging the host, editing the
 * game) had no backend and was removed.
 */
export default function JoinGameSheet({ game, open, onOpenChange }: { game: Game; open: boolean; onOpenChange: (open: boolean) => void }) {
    const { user, hasProfile } = useSession();
    const { mutate: joinGame, isPending } = useJoinGame();
    const triggerToast = useUIStore((state) => state.triggerToast);
    const sportName = useSportName();

    const spotsLeft = Math.max(game.capacity - game.confirmedCount, 0);
    const full = spotsLeft === 0;
    // The server decides what joining means; the label just has to match what will happen.
    const participation = game.viewer?.participation ?? null;
    // Requests and declines aren't the squad — only people actually on the game are listed.
    const squad = game.participants?.filter((p) => p.status === 'confirmed' || p.status === 'waitlisted') ?? [];
    const outcome = game.joinPolicy === 'approval' ? 'request' : full ? 'waitlist' : 'confirm';

    const joinLabel = {
        request: 'Ask the host to join',
        waitlist: `Join the waitlist · ${game.confirmedCount} ahead of you`,
        confirm: `Join this match · ${spotsLeft} left`,
    }[outcome];

    const doneToast = {
        request: 'REQUEST SENT — THE HOST WILL CONFIRM',
        waitlist: "YOU'RE ON THE WAITLIST",
        confirm: `YOU'RE IN — ${game.title.toUpperCase()}`,
    };

    function join() {
        joinGame(game.id, {
            onSuccess: (updated) => {
                const status = updated.viewer?.participation?.status;
                triggerToast(
                    status === 'requested' ? doneToast.request
                        : status === 'waitlisted' ? doneToast.waitlist
                            : doneToast.confirm
                );
                onOpenChange(false);
            },
            onError: (error) => triggerToast(error.message.toUpperCase()),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent title={game.title} description={`${sportName(game.sport)} · ${game.skillLevel}`}>
                <div className="space-y-8">
                    <div className="relative h-48 overflow-hidden rounded-card md:h-56">
                        <Image src={game.imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
                        <div className="absolute bottom-5 left-5 flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-lime-500 text-ink-900">
                                <SportIcon sport={game.sport} size={20} />
                            </span>
                            <div>
                                <Eyebrow className="text-white/70">{sportName(game.sport)}</Eyebrow>
                                <p className="text-body font-black text-lime-500">{formatMoney(game.fee)}</p>
                            </div>
                        </div>
                    </div>

                    <dl className="grid gap-4 sm:grid-cols-2">
                        <Detail icon={<Clock className="h-5 w-5" />} label="When" value={formatGameWhen(game.startsAt, game.timezone)} />
                        <Detail icon={<MapPin className="h-5 w-5" />} label="Where" value={game.locationText} />
                        <Detail icon={<Users className="h-5 w-5" />} label="Squad" value={`${game.confirmedCount} of ${game.capacity} joined`} />
                        <Detail icon={<SportIcon sport={game.sport} size={20} />} label="Level" value={game.skillLevel} />
                    </dl>

                    <div className="space-y-3">
                        <Eyebrow>Squad</Eyebrow>
                        {squad.length ? (
                            <ul className="space-y-2">
                                {squad.map((p) => (
                                    <li key={p.player.id} className="flex items-center justify-between rounded-field border border-line bg-fg/5 p-3">
                                        <Link href={`/profile/${p.player.handle}`} className="flex items-center gap-3">
                                            <Image src={p.player.avatarUrl} alt="" width={32} height={32} className="h-8 w-8 rounded-pill object-cover" />
                                            <span className="text-body-sm font-black italic uppercase">{p.player.name}</span>
                                        </Link>
                                        <Eyebrow>{p.status === 'waitlisted' ? `Waitlist #${p.position}` : p.role === 'host' ? 'Host' : 'Player'}</Eyebrow>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Text size="sm" tone="subtle">No one has joined yet — be first.</Text>
                        )}
                    </div>

                    <div className="border-t border-line pt-6">
                        {participation ? (
                            <Text size="sm" tone="muted" className="text-center">
                                {participation.status === 'confirmed' ? "You're on this squad."
                                    : participation.status === 'requested' ? 'Your request is with the host.'
                                        : `You're #${participation.position} on the waitlist.`}
                            </Text>
                        ) : !user ? (
                            <Button asChild full size="lg">
                                <Link href={`/login?next=${encodeURIComponent(`/game/${game.slug || game.id}`)}`}>Sign in to join</Link>
                            </Button>
                        ) : !hasProfile ? (
                            <Button asChild full size="lg">
                                <Link href={`/onboarding?next=${encodeURIComponent(`/game/${game.slug || game.id}`)}`}>Finish your profile to join</Link>
                            </Button>
                        ) : (
                            <Button full size="lg" loading={isPending} onClick={join}>
                                {joinLabel}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 rounded-field border border-line bg-fg/5 p-4">
            <span aria-hidden="true" className="mt-0.5 text-lime-500">{icon}</span>
            <div className="min-w-0">
                <dt><Eyebrow>{label}</Eyebrow></dt>
                <dd className="truncate text-body font-bold">{value}</dd>
            </div>
        </div>
    );
}
