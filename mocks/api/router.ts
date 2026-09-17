import 'server-only';

import { randomUUID } from 'node:crypto';
import { DEFAULT_SPORT_IMAGES } from '@/constants';
import type { Game, Participant, PlayerProfile } from '@/types';
import type {
    CreateGameInput,
    CreateProfileInput,
    Credentials,
    GameResult,
    GameResultsResponse,
    MyGames,
    Page,
    PlayerGameStat,
    PlayerStatsInput,
    Session,
    StatApproval,
    SubmitResultsInput,
} from '@/lib/api/types';
import { DEMO_ACCOUNT, slugify } from './seed';
import { getStore, saveStore, type MockStore } from './store';

/**
 * Mock implementation of the PlayChale REST API (docs/api/openapi.yaml).
 * Framework-agnostic: app/api/[...path]/route.ts serves it over HTTP, and the
 * server API client calls handleMockRequest() in-process during rendering.
 */

export interface MockRequest {
    method: string;
    /** Path segments after /api, e.g. ['games', 'abc', 'join'] */
    path: string[];
    query: URLSearchParams;
    body: unknown;
    sessionToken: string | undefined;
}

export interface MockResponse {
    status: number;
    body?: unknown;
    /** A token to set as the session cookie, or null to clear it */
    session?: string | null;
}

interface Context extends MockRequest {
    params: Record<string, string>;
    store: MockStore;
    userId: string | null;
}

type Handler = (ctx: Context) => MockResponse;

class HttpError extends Error {
    constructor(public status: number, public code: string, message: string) {
        super(message);
    }
}

const ok = (body: unknown, status = 200): MockResponse => ({ status, body });

function requireUser(ctx: Context): string {
    if (!ctx.userId) throw new HttpError(401, 'UNAUTHENTICATED', 'Sign in to continue');
    return ctx.userId;
}

function requireProfile(ctx: Context): PlayerProfile {
    const userId = requireUser(ctx);
    const profile = ctx.store.profiles.find((p) => p.id === userId);
    if (!profile) throw new HttpError(403, 'PROFILE_REQUIRED', 'Complete onboarding first');
    return profile;
}

function findGame(store: MockStore, idOrSlug: string): Game {
    const game = store.games.find((g) => g.id === idOrSlug || g.slug === idOrSlug);
    if (!game) throw new HttpError(404, 'GAME_NOT_FOUND', 'Game not found');
    return game;
}

function requireHost(ctx: Context, game: Game) {
    if (game.organizerId !== requireUser(ctx)) {
        throw new HttpError(403, 'NOT_HOST', 'Only the host can do this');
    }
}

function paginate<T>(items: T[], query: URLSearchParams, defaultLimit: number): Page<T> {
    const limit = Math.min(Number(query.get('limit')) || defaultLimit, 100);
    const offset = Number(query.get('cursor')) || 0;
    const slice = items.slice(offset, offset + limit);
    const next = offset + limit;
    return { items: slice, nextCursor: next < items.length ? String(next) : null };
}

function uniqueSlug(base: string, taken: (slug: string) => boolean) {
    let slug = base;
    for (let n = 2; taken(slug); n++) slug = `${base}-${n}`;
    return slug;
}

const toParticipant = (profile: PlayerProfile, role: string): Participant => ({
    id: profile.id,
    slug: profile.slug,
    name: profile.name,
    avatar: profile.avatar,
    role,
});

function body<T>(ctx: Context): T {
    if (!ctx.body || typeof ctx.body !== 'object') {
        throw new HttpError(400, 'INVALID_BODY', 'Expected a JSON body');
    }
    return ctx.body as T;
}

function createSession(store: MockStore, userId: string) {
    const token = randomUUID();
    store.sessions[token] = userId;
    return token;
}

function sessionFor(store: MockStore, userId: string | null): Session {
    const account = userId ? store.accounts.find((a) => a.id === userId) : undefined;
    return {
        user: account ? { id: account.id, email: account.email } : null,
        hasProfile: !!account && store.profiles.some((p) => p.id === account.id),
    };
}

function recountApprovals(store: MockStore, gameId: string) {
    const result = store.gameResults.find((r) => r.gameId === gameId);
    if (!result) return;
    const stats = store.playerGameStats.filter((s) => s.gameId === gameId);
    result.approvalsCount = stats.filter((s) => s.approvedByPlayer === true).length;
    result.rejectionsCount = stats.filter((s) => s.approvedByPlayer === false).length;
    result.status =
        stats.length > 0 && result.approvalsCount / stats.length >= result.approvalThreshold ? 'approved' : 'pending';
}

// --- Routes ---

const routes: [method: string, pattern: string, handler: Handler][] = [
    // Auth
    ['GET', 'auth/session', (ctx) => ok(sessionFor(ctx.store, ctx.userId))],

    ['POST', 'auth/signup', (ctx) => {
        const { email, password } = body<Credentials>(ctx);
        if (!email?.includes('@') || !password) {
            throw new HttpError(400, 'INVALID_CREDENTIALS', 'Enter a valid email and password');
        }
        if (ctx.store.accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
            throw new HttpError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
        }
        const account = { id: randomUUID(), email };
        ctx.store.accounts.push(account);
        return { status: 201, body: sessionFor(ctx.store, account.id), session: createSession(ctx.store, account.id) };
    }],

    ['POST', 'auth/login', (ctx) => {
        const { email } = body<Credentials>(ctx);
        // Mock only: any password works, and unknown emails sign in as the demo player
        const account =
            ctx.store.accounts.find((a) => a.email.toLowerCase() === email?.toLowerCase()) ||
            ctx.store.accounts.find((a) => a.id === DEMO_ACCOUNT.id)!;
        return { status: 200, body: sessionFor(ctx.store, account.id), session: createSession(ctx.store, account.id) };
    }],

    ['POST', 'auth/demo', (ctx) => ({
        status: 200,
        body: sessionFor(ctx.store, DEMO_ACCOUNT.id),
        session: createSession(ctx.store, DEMO_ACCOUNT.id),
    })],

    ['POST', 'auth/logout', (ctx) => {
        if (ctx.sessionToken) delete ctx.store.sessions[ctx.sessionToken];
        return { status: 204, session: null };
    }],

    // Current user
    ['GET', 'me/profile', (ctx) => ok(requireProfile(ctx))],

    ['PUT', 'me/profile', (ctx) => {
        const userId = requireUser(ctx);
        const input = body<CreateProfileInput>(ctx);
        if (!input.name?.trim() || !input.sports?.length) {
            throw new HttpError(400, 'INVALID_PROFILE', 'Name and at least one sport are required');
        }
        const { profiles } = ctx.store;
        const existing = profiles.find((p) => p.id === userId);
        const starter = { gamesPlayed: 0, winRate: '0%', mvps: 0, reliability: '100%', rating: 6.0 };
        const sportStats = Object.fromEntries(input.sports.map((s) => [s, existing?.sportStats[s] || { ...starter }]));
        const mainSport = input.sports[0];

        const profile: PlayerProfile = {
            id: userId,
            slug: existing?.slug || uniqueSlug(slugify(input.name), (s) => profiles.some((p) => p.slug === s)),
            name: input.name.trim(),
            avatar: existing?.avatar || `https://i.pravatar.cc/300?u=${userId}`,
            mainSport,
            location: input.location,
            attributes: existing?.attributes || { pace: 80, shooting: 75, passing: 78, dribbling: 82, defending: 60, physical: 70 },
            sportStats,
            stats: sportStats[mainSport],
            bio: existing?.bio || '',
            matchHistory: existing?.matchHistory || [],
        };
        if (existing) profiles[profiles.indexOf(existing)] = profile;
        else profiles.push(profile);
        return ok(profile, existing ? 200 : 201);
    }],

    ['PUT', 'me/avatar', (ctx) => {
        const profile = requireProfile(ctx);
        const { avatarUrl } = body<{ avatarUrl: string }>(ctx);
        if (!avatarUrl) throw new HttpError(400, 'INVALID_AVATAR', 'avatarUrl is required');
        profile.avatar = avatarUrl;
        return ok(profile);
    }],

    ['GET', 'me/games', (ctx) => {
        const userId = requireUser(ctx);
        const games = ctx.store.games;
        const result: MyGames = {
            hostedGames: games.filter((g) => g.organizerId === userId),
            joinedGames: games.filter((g) => g.organizerId !== userId && g.participants?.some((p) => p.id === userId)),
        };
        return ok(result);
    }],

    ['GET', 'me/stat-approvals', (ctx) => {
        const userId = requireUser(ctx);
        const { store } = ctx;
        const approvals: StatApproval[] = store.playerGameStats
            .filter((s) => s.userId === userId && s.approvedByPlayer === null)
            .map((s) => {
                const game = store.games.find((g) => g.id === s.gameId);
                const result = store.gameResults.find((r) => r.gameId === s.gameId);
                return {
                    ...s,
                    game: game && {
                        id: game.id, slug: game.slug, title: game.title, sport: game.sport,
                        date: game.date, time: game.time, imageUrl: game.imageUrl,
                    },
                    result: result ? { resultData: result.resultData, status: result.status } : null,
                } as StatApproval;
            });
        return ok(approvals);
    }],

    // Players
    ['GET', 'players', (ctx) => ok(paginate(ctx.store.profiles, ctx.query, 12))],

    ['GET', 'players/:idOrSlug', (ctx) => {
        const profile = ctx.store.profiles.find((p) => p.id === ctx.params.idOrSlug || p.slug === ctx.params.idOrSlug);
        if (!profile) throw new HttpError(404, 'PLAYER_NOT_FOUND', 'Player not found');
        return ok(profile);
    }],

    // Games
    ['GET', 'games', (ctx) => {
        const sport = ctx.query.get('sport');
        const games = ctx.store.games.filter(
            (g) => g.visibility !== 'private' && (!sport || sport === 'All' || g.sport === sport)
        );
        return ok(paginate(games, ctx.query, 50));
    }],

    ['POST', 'games', (ctx) => {
        const organizer = requireProfile(ctx);
        const input = body<CreateGameInput>(ctx);
        if (!input.title?.trim() || !input.sport) {
            throw new HttpError(400, 'INVALID_GAME', 'Title and sport are required');
        }
        const id = randomUUID();
        const images = DEFAULT_SPORT_IMAGES[input.sport] || DEFAULT_SPORT_IMAGES.Football;
        const game: Game = {
            id,
            slug: `${slugify(input.title)}-${id.slice(0, 8)}`,
            organizerId: organizer.id,
            organizer: organizer.name,
            title: input.title.trim(),
            sport: input.sport,
            location: input.location || '',
            date: input.date || '',
            time: input.time || '',
            spotsTotal: input.spotsTotal || 10,
            spotsTaken: 1,
            skillLevel: input.skillLevel || 'All Levels',
            imageUrl: input.imageUrl || images[0],
            price: input.price || 'Free',
            status: 'upcoming',
            visibility: input.visibility || 'public',
            participants: [toParticipant(organizer, 'Host')],
        };
        ctx.store.games.unshift(game);
        return ok(game, 201);
    }],

    ['GET', 'games/:idOrSlug', (ctx) => ok(findGame(ctx.store, ctx.params.idOrSlug))],

    ['POST', 'games/:id/join', (ctx) => {
        const profile = requireProfile(ctx);
        const game = findGame(ctx.store, ctx.params.id);
        const participants = game.participants || [];
        if (!participants.some((p) => p.id === profile.id)) {
            if (participants.length >= game.spotsTotal) throw new HttpError(409, 'GAME_FULL', 'This game is full');
            game.participants = [...participants, toParticipant(profile, 'Player')];
            game.spotsTaken = game.participants.length;
        }
        return ok(game);
    }],

    ['POST', 'games/:id/complete', (ctx) => {
        const game = findGame(ctx.store, ctx.params.id);
        requireHost(ctx, game);
        game.completedAt = game.completedAt || new Date().toISOString();
        game.status = 'completed';
        return ok(game);
    }],

    ['GET', 'games/:id/results', (ctx) => {
        const { store } = ctx;
        const game = findGame(store, ctx.params.id);
        const response: GameResultsResponse = {
            result: store.gameResults.find((r) => r.gameId === game.id) || null,
            playerStats: store.playerGameStats
                .filter((s) => s.gameId === game.id)
                .map((s) => {
                    const p = store.profiles.find((profile) => profile.id === s.userId);
                    return { ...s, player: p ? { id: p.id, name: p.name, avatar: p.avatar } : null };
                }),
            mvpVotes: store.mvpVotes.filter((v) => v.gameId === game.id),
        };
        return ok(response);
    }],

    ['PUT', 'games/:id/results', (ctx) => {
        const game = findGame(ctx.store, ctx.params.id);
        requireHost(ctx, game);
        const input = body<SubmitResultsInput>(ctx);
        const result: GameResult = {
            gameId: game.id,
            enteredBy: game.organizerId!,
            resultData: input.resultData || {},
            status: 'pending',
            approvalThreshold: input.approvalThreshold ?? 0.5,
            approvalsCount: 0,
            rejectionsCount: 0,
        };
        const results = ctx.store.gameResults;
        const index = results.findIndex((r) => r.gameId === game.id);
        if (index >= 0) results[index] = result;
        else results.push(result);
        recountApprovals(ctx.store, game.id);
        return ok(result);
    }],

    ['PUT', 'games/:id/player-stats', (ctx) => {
        const game = findGame(ctx.store, ctx.params.id);
        requireHost(ctx, game);
        const inputs = body<PlayerStatsInput[]>(ctx);
        if (!Array.isArray(inputs)) throw new HttpError(400, 'INVALID_BODY', 'Expected an array of player stats');

        const all = ctx.store.playerGameStats;
        const saved = inputs.map((input) => {
            const record: PlayerGameStat = {
                gameId: game.id,
                userId: input.userId,
                stats: input.stats || {},
                showedUp: input.showedUp ?? true,
                // The host's own line doesn't need their approval
                approvedByPlayer: input.userId === game.organizerId ? true : null,
                approvedAt: input.userId === game.organizerId ? new Date().toISOString() : null,
            };
            const index = all.findIndex((r) => r.gameId === game.id && r.userId === input.userId);
            if (index >= 0) all[index] = record;
            else all.push(record);
            return record;
        });
        recountApprovals(ctx.store, game.id);
        return ok(saved);
    }],

    ['PUT', 'games/:id/player-stats/me/approval', (ctx) => {
        const userId = requireUser(ctx);
        const game = findGame(ctx.store, ctx.params.id);
        const { approved } = body<{ approved: boolean }>(ctx);
        const record = ctx.store.playerGameStats.find((s) => s.gameId === game.id && s.userId === userId);
        if (!record) throw new HttpError(404, 'STATS_NOT_FOUND', 'No stats recorded for you in this game');
        record.approvedByPlayer = !!approved;
        record.approvedAt = new Date().toISOString();
        recountApprovals(ctx.store, game.id);
        return ok(record);
    }],

    ['PUT', 'games/:id/mvp-vote', (ctx) => {
        const userId = requireUser(ctx);
        const game = findGame(ctx.store, ctx.params.id);
        const { votedForId } = body<{ votedForId: string }>(ctx);
        const isParticipant = (id: string) => game.participants?.some((p) => p.id === id);
        if (!isParticipant(userId)) throw new HttpError(403, 'NOT_PARTICIPANT', 'Only players in this game can vote');
        if (!isParticipant(votedForId)) throw new HttpError(400, 'INVALID_VOTE', 'You can only vote for players in this game');

        const votes = ctx.store.mvpVotes;
        const vote = { gameId: game.id, voterId: userId, votedForId };
        const index = votes.findIndex((v) => v.gameId === game.id && v.voterId === userId);
        if (index >= 0) votes[index] = vote;
        else votes.push(vote);
        return ok(vote);
    }],
];

function match(pattern: string, path: string[]): Record<string, string> | null {
    const parts = pattern.split('/');
    if (parts.length !== path.length) return null;
    const params: Record<string, string> = {};
    for (let i = 0; i < parts.length; i++) {
        if (parts[i].startsWith(':')) params[parts[i].slice(1)] = decodeURIComponent(path[i]);
        else if (parts[i] !== path[i]) return null;
    }
    return params;
}

export function handleMockRequest(req: MockRequest): MockResponse {
    const store = getStore();
    const userId = (req.sessionToken && store.sessions[req.sessionToken]) || null;

    let pathMatched = false;
    for (const [method, pattern, handler] of routes) {
        const params = match(pattern, req.path);
        if (!params) continue;
        pathMatched = true;
        if (method !== req.method) continue;

        try {
            const response = handler({ ...req, params, store, userId });
            if (req.method !== 'GET') saveStore();
            return response;
        } catch (error) {
            if (error instanceof HttpError) {
                return { status: error.status, body: { error: { code: error.code, message: error.message } } };
            }
            throw error;
        }
    }

    return pathMatched
        ? { status: 405, body: { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } } }
        : { status: 404, body: { error: { code: 'NOT_FOUND', message: 'Endpoint not found' } } };
}
