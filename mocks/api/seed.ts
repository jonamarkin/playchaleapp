import type { Game, GameResult, PaymentLine, Player, PlayerGameStat } from '@/lib/api/types';

/**
 * Seed data for the mock API.
 *
 * Deliberately built relative to "now" so games are always upcoming, and career stats are
 * COMPUTED from seeded approved results (see recomputeCareerStats in router.ts) rather than
 * asserted — the same rule the real backend follows, so a seeded profile can be trusted.
 */

export const DEMO_ACCOUNT = { id: 'acc_demo', email: 'demo@playchale.app', playerId: 'p1' } as const;

export const TIMEZONE = 'Africa/Accra';

/** Reserved handles that can't be claimed, because they'd collide with routes or impersonate us. */
export const RESERVED_HANDLES = new Set([
    'admin', 'api', 'app', 'discover', 'community', 'home', 'stats', 'games', 'game', 'login',
    'logout', 'signup', 'onboarding', 'settings', 'profile', 'me', 'playchale', 'support', 'help',
    'about', 'terms', 'privacy', 'new', 'mygames', 'styleguide', 'offline',
]);

export const HANDLE_PATTERN = /^[a-z0-9_]{3,20}$/;

export function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-') || 'item';
}

export function handleFrom(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20).padEnd(3, '0') || 'player';
}

/** Today at a given hour, shifted by whole days, as an ISO instant. */
function at(dayOffset: number, hour: number, minute = 0): string {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
}

const avatar = (id: string) => `https://i.pravatar.cc/300?u=${id}`;

const PLAYERS: Player[] = [
    {
        id: 'p1', handle: 'marcusj', name: 'Marcus J.', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
        mainSport: 'football', sports: ['football', 'basketball'], bio: 'Centre-back. Rarely beaten in the air, never late to a kickoff.',
        locationText: 'East Legon', city: 'Accra',
        attributes: { pace: 82, shooting: 65, passing: 78, dribbling: 72, defending: 94, physical: 89 },
        careerStats: [],
    },
    {
        id: 'p2', handle: 'elenar', name: 'Elena R.', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
        mainSport: 'basketball', sports: ['basketball'], bio: 'Point guard. Runs the floor and keeps everyone honest.',
        locationText: 'Osu', city: 'Accra',
        attributes: { pace: 88, shooting: 84, passing: 91, dribbling: 90, defending: 70, physical: 68 },
        careerStats: [],
    },
    {
        id: 'p3', handle: 'alexk', name: 'Alex K.', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        mainSport: 'football', sports: ['football'], bio: 'Midfield engine. Organises the Wednesday night run.',
        locationText: 'Cantonments', city: 'Accra',
        attributes: { pace: 76, shooting: 72, passing: 88, dribbling: 80, defending: 66, physical: 74 },
        careerStats: [],
    },
    {
        id: 'p4', handle: 'sarahl', name: 'Sarah L.', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
        mainSport: 'tennis', sports: ['tennis', 'padel'], bio: 'Baseline grinder. Will return everything you hit.',
        locationText: 'Labone', city: 'Accra',
        attributes: { pace: 80, shooting: 70, passing: 65, dribbling: 68, defending: 85, physical: 77 },
        careerStats: [],
    },
    {
        id: 'p5', handle: 'jordanb', name: 'Jordan B.', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
        mainSport: 'basketball', sports: ['basketball'], bio: 'Small forward. Hosts the Thursday 3v3 at the Hoops Lab.',
        locationText: 'Spintex', city: 'Accra',
        attributes: { pace: 84, shooting: 86, passing: 74, dribbling: 82, defending: 78, physical: 85 },
        careerStats: [],
    },
    {
        id: 'p6', handle: 'mayas', name: 'Maya S.', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        mainSport: 'football', sports: ['football', 'volleyball'], bio: 'Playmaker. Weekend five-a-side regular.',
        locationText: 'Madina', city: 'Accra',
        attributes: { pace: 86, shooting: 79, passing: 90, dribbling: 88, defending: 58, physical: 66 },
        careerStats: [],
    },
    {
        id: 'p7', handle: 'carlosm', name: 'Carlos M.', avatarUrl: avatar('carlos'),
        mainSport: 'volleyball', sports: ['volleyball'], bio: 'Blocker. The wall at Skyline Beach Court.',
        locationText: 'Tema', city: 'Accra',
        attributes: { pace: 75, shooting: 88, passing: 82, dribbling: 70, defending: 85, physical: 90 },
        careerStats: [],
    },
];

const IMAGES = {
    football: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200',
    football2: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=1200',
    basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200',
    tennis: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=1200',
    volleyball: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80&w=1200',
};

const GHS = (amountMinor: number) => ({ amountMinor, currency: 'GHS' });

type SeedGame = Omit<Game, 'host' | 'viewer' | 'participants'> & { hostId: string; roster: { playerId: string; status: 'confirmed' | 'requested' | 'waitlisted' }[] };

const GAMES: SeedGame[] = [
    {
        id: 'g1', slug: 'night-scuffle-5v5-g1', title: 'Night Scuffle 5v5', sport: 'football',
        status: 'scheduled', visibility: 'public', startsAt: at(1, 18, 30), timezone: TIMEZONE, durationMinutes: 90,
        locationText: 'Central Park Arena, Pitch 4', venueId: null, lat: null, lng: null,
        fee: GHS(2500), paymentMethod: 'momo_manual', paymentHandle: '024 123 4567',
        capacity: 10, confirmedCount: 3, joinPolicy: 'open', skillLevel: 'Intermediate',
        imageUrl: IMAGES.football, completedAt: null, cancelledAt: null, createdAt: at(-3, 9),
        hostId: 'p3', roster: [{ playerId: 'p3', status: 'confirmed' }, { playerId: 'p1', status: 'confirmed' }, { playerId: 'p6', status: 'confirmed' }],
    },
    {
        id: 'g2', slug: 'elite-3v3-run-g2', title: 'Elite 3v3 Run', sport: 'basketball',
        status: 'scheduled', visibility: 'public', startsAt: at(2, 20, 0), timezone: TIMEZONE, durationMinutes: 75,
        locationText: 'Underground Hoops Lab', venueId: null, lat: null, lng: null,
        fee: GHS(0), paymentMethod: 'none', paymentHandle: null,
        capacity: 6, confirmedCount: 2, joinPolicy: 'open', skillLevel: 'Competitive',
        imageUrl: IMAGES.basketball, completedAt: null, cancelledAt: null, createdAt: at(-2, 12),
        hostId: 'p5', roster: [{ playerId: 'p5', status: 'confirmed' }, { playerId: 'p2', status: 'confirmed' }],
    },
    {
        id: 'g3', slug: 'doubles-showdown-g3', title: 'Doubles Showdown', sport: 'tennis',
        status: 'scheduled', visibility: 'public', startsAt: at(4, 8, 0), timezone: TIMEZONE, durationMinutes: 120,
        locationText: 'Riverbank Clay Courts', venueId: null, lat: null, lng: null,
        fee: GHS(6000), paymentMethod: 'momo_manual', paymentHandle: '020 987 6543',
        capacity: 4, confirmedCount: 2, joinPolicy: 'approval', skillLevel: 'Beginner',
        imageUrl: IMAGES.tennis, completedAt: null, cancelledAt: null, createdAt: at(-1, 17),
        hostId: 'p4', roster: [{ playerId: 'p4', status: 'confirmed' }, { playerId: 'p2', status: 'requested' }],
    },
    {
        id: 'g4', slug: 'power-volley-4s-g4', title: 'Power Volley 4s', sport: 'volleyball',
        status: 'scheduled', visibility: 'public', startsAt: at(3, 19, 0), timezone: TIMEZONE, durationMinutes: 90,
        locationText: 'Skyline Beach Court', venueId: null, lat: null, lng: null,
        fee: GHS(4000), paymentMethod: 'momo_manual', paymentHandle: '055 222 1111',
        capacity: 4, confirmedCount: 1, joinPolicy: 'open', skillLevel: 'Intermediate',
        imageUrl: IMAGES.volleyball, completedAt: null, cancelledAt: null, createdAt: at(-1, 10),
        hostId: 'p7', roster: [{ playerId: 'p7', status: 'confirmed' }],
    },
    {
        id: 'g5', slug: 'sunday-league-warmup-g5', title: 'Sunday League Warmup', sport: 'football',
        status: 'scheduled', visibility: 'public', startsAt: at(5, 7, 30), timezone: TIMEZONE, durationMinutes: 90,
        locationText: 'Legon Astro Turf', venueId: null, lat: null, lng: null,
        fee: GHS(0), paymentMethod: 'none', paymentHandle: null,
        capacity: 12, confirmedCount: 3, joinPolicy: 'open', skillLevel: 'All Levels',
        imageUrl: IMAGES.football2, completedAt: null, cancelledAt: null, createdAt: at(-4, 8),
        hostId: 'p1', roster: [{ playerId: 'p1', status: 'confirmed' }, { playerId: 'p3', status: 'confirmed' }, { playerId: 'p4', status: 'confirmed' }],
    },
    // Two completed games with approved results: these are what the seeded career stats come from.
    {
        id: 'g6', slug: 'midweek-clash-g6', title: 'Midweek Clash', sport: 'football',
        status: 'completed', visibility: 'public', startsAt: at(-7, 18, 30), timezone: TIMEZONE, durationMinutes: 90,
        locationText: 'Central Park Arena, Pitch 2', venueId: null, lat: null, lng: null,
        fee: GHS(2000), paymentMethod: 'momo_manual', paymentHandle: '024 123 4567',
        capacity: 10, confirmedCount: 4, joinPolicy: 'open', skillLevel: 'Intermediate',
        imageUrl: IMAGES.football, completedAt: at(-7, 20), cancelledAt: null, createdAt: at(-14, 9),
        hostId: 'p3', roster: [{ playerId: 'p3', status: 'confirmed' }, { playerId: 'p1', status: 'confirmed' }, { playerId: 'p6', status: 'confirmed' }, { playerId: 'p4', status: 'confirmed' }],
    },
    {
        id: 'g7', slug: 'sunrise-five-a-side-g7', title: 'Sunrise Five-a-side', sport: 'football',
        status: 'completed', visibility: 'public', startsAt: at(-14, 7, 0), timezone: TIMEZONE, durationMinutes: 90,
        locationText: 'Legon Astro Turf', venueId: null, lat: null, lng: null,
        fee: GHS(0), paymentMethod: 'none', paymentHandle: null,
        capacity: 10, confirmedCount: 3, joinPolicy: 'open', skillLevel: 'All Levels',
        imageUrl: IMAGES.football2, completedAt: at(-14, 8, 30), cancelledAt: null, createdAt: at(-21, 8),
        hostId: 'p1', roster: [{ playerId: 'p1', status: 'confirmed' }, { playerId: 'p3', status: 'confirmed' }, { playerId: 'p6', status: 'confirmed' }],
    },
];

/** Approved results for the two completed games. */
const RESULTS: GameResult[] = [
    {
        gameId: 'g6', enteredBy: 'p3', resultData: { teamAScore: 3, teamBScore: 2 }, status: 'approved',
        approvalThreshold: 0.5, approvalsCount: 4, rejectionsCount: 0, version: 1, approvedAt: at(-7, 21),
    },
    {
        gameId: 'g7', enteredBy: 'p1', resultData: { teamAScore: 1, teamBScore: 1 }, status: 'approved',
        approvalThreshold: 0.5, approvalsCount: 3, rejectionsCount: 0, version: 1, approvedAt: at(-14, 10),
    },
];

const STATS: PlayerGameStat[] = [
    { gameId: 'g6', playerId: 'p1', sport: 'football', stats: { goals: 1, assists: 0, cleanSheet: false }, showedUp: true, outcome: 'win', approval: 'approved', approvedAt: at(-7, 21), resultVersion: 1, note: null },
    { gameId: 'g6', playerId: 'p3', sport: 'football', stats: { goals: 2, assists: 1, cleanSheet: false }, showedUp: true, outcome: 'win', approval: 'approved', approvedAt: at(-7, 21), resultVersion: 1, note: null },
    { gameId: 'g6', playerId: 'p6', sport: 'football', stats: { goals: 0, assists: 2, cleanSheet: false }, showedUp: true, outcome: 'loss', approval: 'approved', approvedAt: at(-7, 21), resultVersion: 1, note: null },
    { gameId: 'g6', playerId: 'p4', sport: 'football', stats: { goals: 0, assists: 0, cleanSheet: false }, showedUp: false, outcome: 'loss', approval: 'approved', approvedAt: at(-7, 21), resultVersion: 1, note: null },
    { gameId: 'g7', playerId: 'p1', sport: 'football', stats: { goals: 0, assists: 1, cleanSheet: true }, showedUp: true, outcome: 'draw', approval: 'approved', approvedAt: at(-14, 10), resultVersion: 1, note: null },
    { gameId: 'g7', playerId: 'p3', sport: 'football', stats: { goals: 1, assists: 0, cleanSheet: false }, showedUp: true, outcome: 'draw', approval: 'approved', approvedAt: at(-14, 10), resultVersion: 1, note: null },
    { gameId: 'g7', playerId: 'p6', sport: 'football', stats: { goals: 0, assists: 0, cleanSheet: false }, showedUp: true, outcome: 'draw', approval: 'approved', approvedAt: at(-14, 10), resultVersion: 1, note: null },
];

export interface Account {
    id: string;
    email: string | null;
    phone: string | null;
    /** Set once onboarding creates a profile. Accounts and players are separate on purpose. */
    playerId: string | null;
}

export interface OtpChallenge {
    id: string;
    phone: string;
    code: string;
    expiresAt: string;
    attempts: number;
}

export interface SeedParticipant {
    gameId: string;
    playerId: string;
    status: 'requested' | 'waitlisted' | 'confirmed' | 'declined' | 'cancelled' | 'removed';
    role: 'host' | 'player';
    position: number | null;
    attendance: 'present' | 'no_show' | null;
    joinedAt: string;
}

export function createSeed() {
    const games: Game[] = [];
    const participants: SeedParticipant[] = [];
    const payments: PaymentLine[] = [];

    for (const { hostId, roster, ...game } of GAMES) {
        games.push({ ...game, host: summary(hostId) } as Game);

        roster.forEach((entry, index) => {
            participants.push({
                gameId: game.id,
                playerId: entry.playerId,
                status: entry.status,
                role: entry.playerId === hostId ? 'host' : 'player',
                position: entry.status === 'waitlisted' ? index : null,
                attendance: game.status === 'completed'
                    ? (STATS.find((s) => s.gameId === game.id && s.playerId === entry.playerId)?.showedUp === false ? 'no_show' : 'present')
                    : null,
                joinedAt: game.createdAt!,
            });

            if (game.fee.amountMinor > 0 && entry.status === 'confirmed') {
                payments.push({
                    gameId: game.id,
                    playerId: entry.playerId,
                    amount: game.fee,
                    // The host's own line is settled; everyone else starts owing.
                    status: entry.playerId === hostId ? 'waived' : 'owed',
                    method: 'momo_manual',
                    markedPaidAt: null,
                    confirmedAt: null,
                    note: null,
                });
            }
        });
    }

    return {
        accounts: [{ id: DEMO_ACCOUNT.id, email: DEMO_ACCOUNT.email, phone: null, playerId: DEMO_ACCOUNT.playerId }] as Account[],
        sessions: {} as Record<string, string>,
        otpChallenges: [] as OtpChallenge[],
        players: structuredClone(PLAYERS),
        games,
        participants,
        payments,
        results: structuredClone(RESULTS),
        playerStats: structuredClone(STATS),
        mvpVotes: [
            { gameId: 'g6', voterId: 'p1', playerId: 'p3' },
            { gameId: 'g6', voterId: 'p6', playerId: 'p3' },
        ],
        idempotency: {} as Record<string, { status: number; body: unknown }>,
    };
}

function summary(playerId: string) {
    const p = PLAYERS.find((player) => player.id === playerId)!;
    return { id: p.id, handle: p.handle, name: p.name, avatarUrl: p.avatarUrl };
}
