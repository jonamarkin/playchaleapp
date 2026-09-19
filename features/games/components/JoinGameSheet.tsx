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

    const spotsLeft = Math.max(game.spotsTotal - game.spotsTaken, 0);
    const alreadyIn = !!user && !!game.participants?.some((p) => p.id === user.id);
    const full = spotsLeft === 0;

    function join() {
        joinGame(game.id, {
            onSuccess: () => {
                triggerToast(`YOU'RE IN — ${game.title.toUpperCase()}`);
                onOpenChange(false);
            },
            onError: (error) => triggerToast(error.message.toUpperCase()),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent title={game.title} description={`${game.sport} · ${game.skillLevel}`}>
                <div className="space-y-8">
                    <div className="relative h-48 overflow-hidden rounded-card md:h-56">
                        <Image src={game.imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
                        <div className="absolute bottom-5 left-5 flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-lime-500 text-ink-900">
                                <SportIcon sport={game.sport} size={20} />
                            </span>
                            <div>
                                <Eyebrow className="text-white/70">{game.sport}</Eyebrow>
                                <p className="text-body font-black text-lime-500">{game.price}</p>
                            </div>
                        </div>
                    </div>

                    <dl className="grid gap-4 sm:grid-cols-2">
                        <Detail icon={<Clock className="h-5 w-5" />} label="When" value={`${game.date} · ${game.time}`} />
                        <Detail icon={<MapPin className="h-5 w-5" />} label="Where" value={game.location} />
                        <Detail icon={<Users className="h-5 w-5" />} label="Squad" value={`${game.spotsTaken} of ${game.spotsTotal} joined`} />
                        <Detail icon={<SportIcon sport={game.sport} size={20} />} label="Level" value={game.skillLevel} />
                    </dl>

                    <div className="space-y-3">
                        <Eyebrow>Squad</Eyebrow>
                        {game.participants?.length ? (
                            <ul className="space-y-2">
                                {game.participants.map((p) => (
                                    <li key={p.id} className="flex items-center justify-between rounded-field border border-line bg-fg/5 p-3">
                                        <Link href={`/profile/${p.slug || p.id}`} className="flex items-center gap-3">
                                            <Image src={p.avatar} alt="" width={32} height={32} className="h-8 w-8 rounded-pill object-cover" />
                                            <span className="text-body-sm font-black italic uppercase">{p.name}</span>
                                        </Link>
                                        <Eyebrow>{p.role || 'Player'}</Eyebrow>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Text size="sm" tone="subtle">No one has joined yet — be first.</Text>
                        )}
                    </div>

                    <div className="border-t border-line pt-6">
                        {alreadyIn ? (
                            <Text size="sm" tone="muted" className="text-center">You&apos;re already on this squad.</Text>
                        ) : !user ? (
                            <Button asChild full size="lg">
                                <Link href={`/login?next=${encodeURIComponent(`/game/${game.slug || game.id}`)}`}>Sign in to join</Link>
                            </Button>
                        ) : !hasProfile ? (
                            <Button asChild full size="lg">
                                <Link href={`/onboarding?next=${encodeURIComponent(`/game/${game.slug || game.id}`)}`}>Finish your profile to join</Link>
                            </Button>
                        ) : (
                            <Button full size="lg" loading={isPending} disabled={full} onClick={join}>
                                {full ? 'Squad full' : `Join this match · ${spotsLeft} left`}
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
