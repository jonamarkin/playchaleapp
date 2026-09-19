'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Display, Eyebrow, Text } from '@/components/ui/typography';
import SportIcon from '@/components/SportIcon';
import { useCreateGame } from '@/features/games/hooks';
import { useSports } from '@/features/sports/hooks';
import { useUIStore } from '@/hooks/useUIStore';
import { CURRENCIES, DEFAULT_SPORT_IMAGES } from '@/constants';
import { cn } from '@/lib/utils';
import type { GameInput } from '@/lib/api/types';

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Competitive'] as const;

/** The host's own zone — where the game is played, not where a viewer happens to be reading. */
const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Accra';

const fieldClass =
    'w-full h-auto bg-fg/5 border-2 border-line focus:border-lime-500 rounded-pill px-6 py-4 text-fg font-bold outline-none transition-all focus-visible:ring-0 placeholder:text-fg-subtle';

/** Hosting a game is a page, not a modal: it has a URL, survives the back button and can be linked to. */
export default function CreateGameForm() {
    const router = useRouter();
    const { mutate: createGame, isPending } = useCreateGame();
    const triggerToast = useUIStore((state) => state.triggerToast);

    const { data: sports = [] } = useSports();

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState('18:00');
    const [currency, setCurrency] = useState('GHS');
    const [amount, setAmount] = useState('');
    const [paymentHandle, setPaymentHandle] = useState('');
    const [form, setForm] = useState({
        sport: 'football',
        title: '',
        locationText: '',
        capacity: 10,
        durationMinutes: 90,
        skillLevel: 'All Levels' as GameInput['skillLevel'],
        joinPolicy: 'open' as GameInput['joinPolicy'],
        visibility: 'public' as GameInput['visibility'],
    });

    // Money crosses the wire as minor units so no rounding happens on the way
    const amountMinor = Math.round((Number(amount) || 0) * 100);

    function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!date) return;

        const images = DEFAULT_SPORT_IMAGES[form.sport] ?? DEFAULT_SPORT_IMAGES.football;
        const [hours, minutes] = time.split(':').map(Number);
        const startsAt = new Date(date);
        startsAt.setHours(hours, minutes, 0, 0);

        createGame(
            {
                ...form,
                startsAt: startsAt.toISOString(),
                timezone: TIMEZONE,
                fee: { amountMinor, currency },
                ...(amountMinor > 0 && paymentHandle ? { paymentHandle } : {}),
                imageUrl: images[Math.floor(Math.random() * images.length)],
            },
            {
                onSuccess: (game) => {
                    triggerToast('MATCH PUBLISHED');
                    router.push(`/game/${game.slug || game.id}`);
                },
                onError: (error) => triggerToast(error.message.toUpperCase()),
            }
        );
    }

    return (
        <form onSubmit={submit} className="space-y-8">
            <header className="space-y-3">
                <Eyebrow tone="accent">Host a match</Eyebrow>
                <Display as="h1" size="md">Set up your game</Display>
                <Text tone="muted">Players in your area will see it in Discover the moment you publish.</Text>
            </header>

            <div className="grid gap-6 md:grid-cols-2">
                <Field label="Sport" htmlFor="sport">
                    <Select value={form.sport} onValueChange={(v) => setForm({ ...form, sport: v, capacity: sports.find((s) => s.code === v)?.defaultCapacity ?? form.capacity })}>
                        <SelectTrigger id="sport" className={cn(fieldClass, 'shadow-sm focus:ring-0')}>
                            <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                        <SelectContent className="z-modal rounded-field border border-line bg-ink-900 p-1 text-fg shadow-e3">
                            {sports.map((sport) => (
                                <SelectItem key={sport.code} value={sport.code} className="cursor-pointer rounded-chip px-4 py-3 font-bold focus:bg-fg/10">
                                    <span className="flex items-center gap-3">
                                        <span className="text-lime-500"><SportIcon sport={sport.code} size={18} /></span>
                                        {sport.name}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>

                <Field label="Match title" htmlFor="title">
                    <Input
                        id="title"
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Saturday night 5v5"
                        className={fieldClass}
                    />
                </Field>
            </div>

            <Field label="Location" htmlFor="location" hint="Pitch, court or venue — as you'd tell a friend">
                <Input
                    id="location"
                    required
                    value={form.locationText}
                    onChange={(e) => setForm({ ...form, locationText: e.target.value })}
                    placeholder="e.g. Legon Astro Turf, Pitch 2"
                    className={fieldClass}
                />
            </Field>

            <fieldset className="space-y-2">
                <legend className="sr-only">Who can see this match</legend>
                <div className="relative mb-2 flex rounded-pill bg-fg/5 p-1">
                    <span
                        aria-hidden="true"
                        className={cn(
                            'absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-pill bg-lime-500 transition-transform duration-base',
                            form.visibility === 'private' ? 'translate-x-full' : 'translate-x-0'
                        )}
                    />
                    {(['public', 'private'] as const).map((value) => (
                        <button
                            key={value}
                            type="button"
                            aria-pressed={form.visibility === value}
                            onClick={() => setForm({ ...form, visibility: value })}
                            className={cn(
                                'relative z-10 flex-1 rounded-pill py-3 text-eyebrow font-black uppercase tracking-widest transition-colors touch-target',
                                form.visibility === value ? 'text-ink-900' : 'text-fg-muted hover:text-fg'
                            )}
                        >
                            {value === 'public' ? 'Public match' : 'Invite only'}
                        </button>
                    ))}
                </div>
                <Text size="sm" tone="subtle">
                    {form.visibility === 'public'
                        ? 'Listed in Discover for anyone nearby.'
                        : 'Hidden from Discover — only people with the link can join.'}
                </Text>
            </fieldset>

            <div className="grid gap-6 md:grid-cols-3">
                <Field label="Date" htmlFor="date">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button id="date" type="button" variant="outline" className={cn(fieldClass, 'justify-start text-left')}>
                                <CalendarIcon aria-hidden="true" className="mr-2 h-4 w-4 text-lime-500" />
                                {date ? format(date, 'EEE, MMM d') : 'Pick a date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto border-line p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                        </PopoverContent>
                    </Popover>
                </Field>

                <Field label="Kick-off" htmlFor="time">
                    <Input id="time" required type="time" value={time} onChange={(e) => setTime(e.target.value)} className={fieldClass} />
                </Field>

                <Field label="Spots" htmlFor="spots">
                    <Input
                        id="spots"
                        required
                        type="number"
                        min={2}
                        value={form.capacity}
                        onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                        className={fieldClass}
                    />
                </Field>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Field label="Cost per player" htmlFor="amount" hint="Leave empty if the game is free">
                    <div className="flex gap-3">
                        <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger aria-label="Currency" className={cn(fieldClass, 'w-[120px] px-4')}>
                                <SelectValue placeholder="GHS" />
                            </SelectTrigger>
                            <SelectContent className="z-modal max-h-[300px] rounded-field border border-line bg-ink-900 p-1 text-fg shadow-e3">
                                {CURRENCIES.map((c) => (
                                    <SelectItem key={c.code} value={c.code} className="cursor-pointer rounded-chip px-4 py-3 font-bold focus:bg-fg/10">
                                        <span className="flex items-center gap-3">
                                            <span className="font-black tracking-wider text-lime-500">{c.code}</span>
                                            <span className="text-fg-subtle">{c.symbol}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            id="amount"
                            type="number"
                            min={0}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className={cn(fieldClass, 'flex-1')}
                        />
                    </div>
                </Field>

                <Field label="Skill level" htmlFor="level">
                    <Select value={form.skillLevel} onValueChange={(v) => setForm({ ...form, skillLevel: v as GameInput['skillLevel'] })}>
                        <SelectTrigger id="level" className={fieldClass}>
                            <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent className="z-modal rounded-field border border-line bg-ink-900 p-1 text-fg shadow-e3">
                            {LEVELS.map((level) => (
                                <SelectItem key={level} value={level} className="cursor-pointer rounded-chip px-4 py-3 font-bold focus:bg-fg/10">
                                    {level}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
            </div>

            {amountMinor > 0 && (
                <Field label="Mobile money number" htmlFor="momo" hint="Shown to players so they can pay you before the game. PlayChale doesn't handle the money.">
                    <Input
                        id="momo"
                        type="tel"
                        inputMode="tel"
                        value={paymentHandle}
                        onChange={(e) => setPaymentHandle(e.target.value)}
                        placeholder="024 000 0000"
                        className={fieldClass}
                    />
                </Field>
            )}

            <fieldset className="space-y-2">
                <legend className="sr-only">How players join</legend>
                <div className="relative mb-2 flex rounded-pill bg-fg/5 p-1">
                    <span
                        aria-hidden="true"
                        className={cn(
                            'absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-pill bg-lime-500 transition-transform duration-base',
                            form.joinPolicy === 'approval' ? 'translate-x-full' : 'translate-x-0'
                        )}
                    />
                    {(['open', 'approval'] as const).map((value) => (
                        <button
                            key={value}
                            type="button"
                            aria-pressed={form.joinPolicy === value}
                            onClick={() => setForm({ ...form, joinPolicy: value })}
                            className={cn(
                                'relative z-10 flex-1 rounded-pill py-3 text-eyebrow font-black uppercase tracking-widest transition-colors touch-target',
                                form.joinPolicy === value ? 'text-ink-900' : 'text-fg-muted hover:text-fg'
                            )}
                        >
                            {value === 'open' ? 'Anyone can join' : 'I approve each player'}
                        </button>
                    ))}
                </div>
                <Text size="sm" tone="subtle">
                    {form.joinPolicy === 'open'
                        ? 'Players take a spot straight away, and the rest go on a waitlist.'
                        : 'Players ask first — you confirm who gets a spot.'}
                </Text>
            </fieldset>

            <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row-reverse">
                <Button type="submit" size="lg" loading={isPending} className="sm:flex-1">Publish match</Button>
                <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>Cancel</Button>
            </div>
        </form>
    );
}

/** Label and control stay wired together here, so a field can't ship without one. */
function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label htmlFor={htmlFor} className="ml-4 block text-eyebrow font-black uppercase text-fg-muted">
                {label}
            </label>
            {children}
            {hint && <Text size="sm" tone="subtle" className="ml-4">{hint}</Text>}
        </div>
    );
}
