/**
 * Seed data for the mock backend.
 * Built from the static fixtures in constants.tsx, with the fields the app
 * expects from a real API (slugs, organizer ids) filled in.
 */

import { GAMES, TOP_PLAYERS } from '@/constants';
import { Game, PlayerProfile } from '@/types';

export const DEMO_ACCOUNT = {
    id: 'p1',
    email: 'demo@playchale.app',
} as const;

export function slugify(text: string): string {
    const slug = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    return slug || 'item';
}

const profiles: PlayerProfile[] = TOP_PLAYERS.map((p) => ({
    ...p,
    slug: slugify(p.name),
}));

const slugById = new Map(profiles.map((p) => [p.id, p.slug]));

// A game hosted by the demo user, so host-only flows (manage, complete game) can be tested
const demoHostedGame: Game = {
    id: 'g5',
    sport: 'Football',
    title: 'SUNDAY LEAGUE WARMUP',
    location: 'Legon Astro Turf',
    time: '07:30',
    date: 'Sun, Oct 29',
    spotsTotal: 12,
    spotsTaken: 3,
    skillLevel: 'All Levels',
    organizer: 'Marcus J.',
    imageUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=1200',
    price: 'Free',
    status: 'upcoming',
    visibility: 'public',
    participants: [
        { id: 'p1', name: 'Marcus J.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', role: 'Host' },
        { id: 'p3', name: 'Alex K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', role: 'Player' },
        { id: 'p4', name: 'Sarah L.', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200', role: 'Player' },
    ],
};

const games: Game[] = [...GAMES, demoHostedGame].map((g) => {
    const participants = (g.participants || []).map((p) => ({
        ...p,
        slug: slugById.get(p.id),
        role: p.role || 'Player',
    }));
    return {
        ...g,
        slug: `${slugify(g.title)}-${g.id}`,
        organizerId: participants.find((p) => p.role === 'Host')?.id,
        participants,
        spotsTaken: participants.length,
    };
});

export function createSeed() {
    return {
        accounts: [{ ...DEMO_ACCOUNT }] as { id: string; email: string }[],
        profiles: structuredClone(profiles),
        games: structuredClone(games),
    };
}
