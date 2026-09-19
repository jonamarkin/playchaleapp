import 'server-only';

import { randomUUID } from 'node:crypto';
import type {
    CareerStats,
    Credentials,
    Game,
    GameInput,
    GameResult,
    GameResults,
    GameUpdate,
    MatchRecord,
    Participant,
    PaymentLine,
    Player,
    PlayerGameStat,
    PlayerStatInput,
    ProfileInput,
    ResultInput,
    Session,
} from '@/lib/api/types';
import { SPORTS, sportByCode } from './sports';
import {
    DEMO_ACCOUNT, HANDLE_PATTERN, RESERVED_HANDLES, TIMEZONE, handleFrom, slugify,
} from './seed';
import { recomputeCareerStats, recountApprovals } from './stats';
import { getStore, saveStore, type MockStore } from './store';

/**
 * Mock implementation of the PlayChale REST API (docs/api/openapi.yaml).
 *
 * Framework-agnostic: app/api/[...path]/route.ts serves it over HTTP, and the server API
 * client calls handleMockRequest() in-process during rendering.
 */

export interface MockRequest {
    method: string;
    /** Path segments after /api, e.g. ['games', 'abc', 'join'] */
    path: string[];
    query: URLSearchParams;
    body: unknown;
    sessionToken: string | undefined;
    idempotencyKey?: string;
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
    accountId: string | null;
    playerId: string | null;
}

type Handler = (ctx: Context) => MockResponse;

class HttpError extends Error {
    constructor(public status: number, public code: string, message: string, public field?: string) {
        super(message);
    }
}

const ok = (body: unknown, status = 200): MockResponse => ({ status, body });
const now = () => new Date().toISOString();

// ---------------------------------------------------------------- helpers

function body<T>(ctx: Context): T {
    if (!ctx.body || typeof ctx.body !== 'object') throw new HttpError(400, 'INVALID_BODY', 'Expected a JSON body');
    return ctx.body as T;
}

function requireAccount(ctx: Context): string {
    if (!ctx.accountId) throw new HttpError(401, 'UNAUTHENTICATED', 'Sign in to continue');
    return ctx.accountId;
}

function requirePlayer(ctx: Context): Player {
    requireAccount(ctx);
    const player = ctx.store.players.find((p) => p.id === ctx.playerId);
    if (!player) throw new HttpError(403, 'PROFILE_REQUIRED', 'Finish setting up your profile first');
    return player;
}

function findGame(store: MockStore, idOrSlug: string): Game {
    const game = store.games.find((g) => g.id === idOrSlug || g.slug === idOrSlug);
    if (!game) throw new HttpError(404, 'GAME_NOT_FOUND', 'Game not found');
    return game;
}

function requireHost(ctx: Context, game: Game) {
    if (game.host.id !== ctx.playerId) throw new HttpError(403, 'NOT_HOST', 'Only the host can do this');
}

const summaryOf = (store: MockStore, playerId: string) => {
    const p = store.players.find((player) => player.id === playerId);
    return p ? { id: p.id, handle: p.handle, name: p.name, avatarUrl: p.avatarUrl } : null;
};

/** Keyset pagination: the cursor is the last item's sort key, not an offset. */
function paginate<T>(items: T[], query: URLSearchParams, key: (item: T) => string, defaultLimit: number) {
    const limit = Math.min(Number(query.get('limit')) || defaultLimit, 100);
    const cursor = query.get('cursor');
    const start = cursor ? items.findIndex((item) => key(item) > decodeCursor(cursor)) : 0;
    const from = start === -1 ? items.length : start;
    const page = items.slice(from, from + limit);
    const last = page.at(-1);
    return {
        items: page,
        nextCursor: last && from + limit < items.length ? encodeCursor(key(last)) : null,
    };
}

const encodeCursor = (value: string) => Buffer.from(value).toString('base64url');
const decodeCursor = (cursor: string) => Buffer.from(cursor, 'base64url').toString('utf8');

function participantsOf(store: MockStore, gameId: string): Participant[] {
    return store.participants
        .filter((p) => p.gameId === gameId && !['declined', 'cancelled', 'removed'].includes(p.status))
        .map((p) => ({
            player: summaryOf(store, p.playerId)!,
            status: p.status,
            role: p.role,
            position: p.position,
            attendance: p.attendance,
            joinedAt: p.joinedAt,
        }))
        .filter((p) => p.player);
}

/** Up to four confirmed players, for the avatar stack on list cards. */
function previewOf(store: MockStore, gameId: string) {
    return store.participants
        .filter((p) => p.gameId === gameId && p.status === 'confirmed')
        .slice(0, 4)
        .map((p) => summaryOf(store, p.playerId))
        .filter((p): p is NonNullable<typeof p> => !!p);
}

/** Adds the viewer envelope and, for a single game, the roster. */
function present(ctx: Context, game: Game, { withParticipants = false } = {}): Game {
    const mine = ctx.playerId
        ? ctx.store.participants.find((p) => p.gameId === game.id && p.playerId === ctx.playerId)
        : undefined;
    const payment = ctx.playerId
        ? ctx.store.payments.find((p) => p.gameId === game.id && p.playerId === ctx.playerId)
        : undefined;

    return {
        ...game,
        ...(withParticipants ? { participants: participantsOf(ctx.store, game.id) } : {}),
        participantPreview: previewOf(ctx.store, game.id),
        viewer: {
            canManage: !!ctx.playerId && game.host.id === ctx.playerId,
            participation: mine && !['declined', 'cancelled', 'removed'].includes(mine.status)
                ? { status: mine.status, role: mine.role, position: mine.position }
                : null,
            payment: payment ?? null,
        },
    };
}

function recountConfirmed(store: MockStore, game: Game) {
    game.confirmedCount = store.participants.filter((p) => p.gameId === game.id && p.status === 'confirmed').length;
}

/** Promotes the first waitlisted player when a confirmed place frees up. */
function promoteFromWaitlist(store: MockStore, game: Game) {
    while (game.confirmedCount < game.capacity) {
        const next = store.participants
            .filter((p) => p.gameId === game.id && p.status === 'waitlisted')
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0];
        if (!next) return;
        next.status = 'confirmed';
        next.position = null;
        recountConfirmed(store, game);
        ensurePaymentLine(store, game, next.playerId);
    }
}

function ensurePaymentLine(store: MockStore, game: Game, playerId: string) {
    if (game.fee.amountMinor === 0) return;
    if (store.payments.some((p) => p.gameId === game.id && p.playerId === playerId)) return;
    store.payments.push({
        gameId: game.id, playerId, amount: game.fee, status: 'owed',
        method: 'momo_manual', markedPaidAt: null, confirmedAt: null, note: null,
    });
}

function createSession(store: MockStore, accountId: string) {
    const token = randomUUID();
    store.sessions[token] = accountId;
    return token;
}

function sessionFor(store: MockStore, accountId: string | null): Session {
    const account = accountId ? store.accounts.find((a) => a.id === accountId) : undefined;
    return {
        user: account ? { id: account.id, email: account.email, phone: account.phone } : null,
        playerId: account?.playerId ?? null,
        hasProfile: !!account?.playerId && store.players.some((p) => p.id === account.playerId),
    };
}

function uniqueHandle(store: MockStore, base: string) {
    let handle = base;
    for (let n = 2; RESERVED_HANDLES.has(handle) || store.players.some((p) => p.handle === handle); n++) {
        handle = `${base}${n}`.slice(0, 20);
    }
    return handle;
}

// ---------------------------------------------------------------- routes

const routes: [method: string, pattern: string, handler: Handler][] = [
    // ---- Auth
    ['GET', 'auth/session', (ctx) => ok(sessionFor(ctx.store, ctx.accountId))],

    ['POST', 'auth/signup', (ctx) => {
        const { email, password } = body<Credentials>(ctx);
        if (!email?.includes('@')) throw new HttpError(400, 'INVALID_EMAIL', 'Enter a valid email address', 'email');
        if (!password || password.length < 8) throw new HttpError(400, 'INVALID_PASSWORD', 'Use at least 8 characters', 'password');
        if (ctx.store.accounts.some((a) => a.email?.toLowerCase() === email.toLowerCase())) {
            throw new HttpError(409, 'EMAIL_TAKEN', 'An account with this email already exists', 'email');
        }
        const account = { id: randomUUID(), email, phone: null, playerId: null };
        ctx.store.accounts.push(account);
        return { status: 201, body: sessionFor(ctx.store, account.id), session: createSession(ctx.store, account.id) };
    }],

    ['POST', 'auth/login', (ctx) => {
        const { email } = body<Credentials>(ctx);
        // Mock only: any password works, and unknown emails sign in as the demo player.
        const account = ctx.store.accounts.find((a) => a.email?.toLowerCase() === email?.toLowerCase())
            ?? ctx.store.accounts.find((a) => a.id === DEMO_ACCOUNT.id)!;
        return { status: 200, body: sessionFor(ctx.store, account.id), session: createSession(ctx.store, account.id) };
    }],

    ['POST', 'auth/demo', (ctx) => ({
        status: 200,
        body: sessionFor(ctx.store, DEMO_ACCOUNT.id),
        session: createSession(ctx.store, DEMO_ACCOUNT.id),
    })],

    ['POST', 'auth/google', (ctx) => {
        // Mock only: no token verification. The Go service validates with google idtoken.
        const { idToken } = body<{ idToken: string }>(ctx);
        if (!idToken) throw new HttpError(401, 'UNAUTHENTICATED', 'Google sign-in failed');
        return { status: 200, body: sessionFor(ctx.store, DEMO_ACCOUNT.id), session: createSession(ctx.store, DEMO_ACCOUNT.id) };
    }],

    ['POST', 'auth/otp/start', (ctx) => {
        const { phone } = body<{ phone: string }>(ctx);
        const normalised = normalisePhone(phone);
        if (!normalised) throw new HttpError(400, 'INVALID_PHONE', 'Enter a valid phone number', 'phone');
        const challenge = {
            id: randomUUID(),
            phone: normalised,
            // Mock only: fixed code, and returned below so tests and dev can sign in.
            code: '123456',
            expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
            attempts: 0,
        };
        ctx.store.otpChallenges.push(challenge);
        return ok({ challengeId: challenge.id, expiresAt: challenge.expiresAt, resendAfterSeconds: 60 }, 202);
    }],

    ['POST', 'auth/otp/verify', (ctx) => {
        const { challengeId, code } = body<{ challengeId: string; code: string }>(ctx);
        const challenge = ctx.store.otpChallenges.find((c) => c.id === challengeId);
        if (!challenge) throw new HttpError(401, 'OTP_INVALID', 'That code is not valid');
        if (challenge.expiresAt < now()) throw new HttpError(401, 'OTP_EXPIRED', 'That code has expired, request a new one');
        challenge.attempts += 1;
        if (challenge.attempts > 5) throw new HttpError(429, 'RATE_LIMITED', 'Too many attempts, request a new code');
        if (challenge.code !== code) throw new HttpError(401, 'OTP_INVALID', 'That code is not correct');

        let account = ctx.store.accounts.find((a) => a.phone === challenge.phone);
        if (!account) {
            account = { id: randomUUID(), email: null, phone: challenge.phone, playerId: null };
            ctx.store.accounts.push(account);
        }
        ctx.store.otpChallenges = ctx.store.otpChallenges.filter((c) => c.id !== challengeId);
        return { status: 200, body: sessionFor(ctx.store, account.id), session: createSession(ctx.store, account.id) };
    }],

    ['POST', 'auth/logout', (ctx) => {
        if (ctx.sessionToken) delete ctx.store.sessions[ctx.sessionToken];
        return { status: 204, session: null };
    }],

    // ---- Reference
    ['GET', 'sports', () => ok(SPORTS)],

    // ---- Me
    ['GET', 'me/handle-available', (ctx) => {
        const handle = (ctx.query.get('handle') ?? '').toLowerCase();
        if (!HANDLE_PATTERN.test(handle)) return ok({ handle, available: false, reason: 'invalid' });
        if (RESERVED_HANDLES.has(handle)) return ok({ handle, available: false, reason: 'reserved' });
        const taken = ctx.store.players.some((p) => p.handle === handle && p.id !== ctx.playerId);
        return ok({ handle, available: !taken, ...(taken ? { reason: 'taken' } : {}) });
    }],

    ['GET', 'me/profile', (ctx) => ok(requirePlayer(ctx))],

    ['PUT', 'me/profile', (ctx) => {
        const accountId = requireAccount(ctx);
        const input = body<ProfileInput>(ctx);
        if (!input.name?.trim() || input.name.trim().length < 2) {
            throw new HttpError(400, 'INVALID_NAME', 'Tell us your name', 'name');
        }
        if (!input.sports?.length) throw new HttpError(400, 'INVALID_SPORTS', 'Pick at least one sport', 'sports');
        // Sports are codes from the registry, never display names
        const unknown = input.sports.find((code) => !SPORTS.some((sport) => sport.code === code));
        if (unknown) throw new HttpError(400, 'INVALID_SPORTS', `Unknown sport: ${unknown}`, 'sports');

        const account = ctx.store.accounts.find((a) => a.id === accountId)!;
        const existing = ctx.store.players.find((p) => p.id === account.playerId);

        let handle = existing?.handle ?? uniqueHandle(ctx.store, handleFrom(input.name));
        if (input.handle && input.handle !== handle) {
            const wanted = input.handle.toLowerCase();
            if (!HANDLE_PATTERN.test(wanted)) throw new HttpError(400, 'INVALID_HANDLE', 'Handles are 3–20 letters, numbers or underscores', 'handle');
            if (RESERVED_HANDLES.has(wanted)) throw new HttpError(409, 'HANDLE_TAKEN', 'That handle is reserved', 'handle');
            if (ctx.store.players.some((p) => p.handle === wanted && p.id !== existing?.id)) {
                throw new HttpError(409, 'HANDLE_TAKEN', 'That handle is already taken', 'handle');
            }
            handle = wanted;
        }

        const player: Player = {
            id: existing?.id ?? randomUUID(),
            handle,
            name: input.name.trim(),
            avatarUrl: existing?.avatarUrl ?? `https://i.pravatar.cc/300?u=${handle}`,
            bio: input.bio ?? existing?.bio ?? '',
            mainSport: input.sports[0],
            sports: input.sports,
            skillLevel: input.skillLevel ?? existing?.skillLevel,
            locationText: input.locationText ?? existing?.locationText ?? '',
            city: input.city ?? existing?.city ?? '',
            attributes: { ...(existing?.attributes ?? { pace: 70, shooting: 70, passing: 70, dribbling: 70, defending: 70, physical: 70 }), ...(input.attributes ?? {}) },
            // Career stats are derived; onboarding never seeds them.
            careerStats: existing?.careerStats ?? [],
            createdAt: existing?.createdAt ?? now(),
        };

        if (existing) ctx.store.players[ctx.store.players.indexOf(existing)] = player;
        else ctx.store.players.push(player);
        account.playerId = player.id;

        return ok(player, existing ? 200 : 201);
    }],

    ['PUT', 'me/avatar', (ctx) => {
        const player = requirePlayer(ctx);
        const { avatarUrl } = body<{ avatarUrl: string }>(ctx);
        if (!avatarUrl) throw new HttpError(400, 'INVALID_AVATAR', 'avatarUrl is required');
        player.avatarUrl = avatarUrl;
        // Denormalised copies on games this player hosts
        for (const game of ctx.store.games) if (game.host.id === player.id) game.host.avatarUrl = avatarUrl;
        return ok(player);
    }],

    ['GET', 'me/games', (ctx) => {
        const player = requirePlayer(ctx);
        const mine = ctx.store.participants.filter((p) => p.playerId === player.id && ['confirmed', 'requested', 'waitlisted'].includes(p.status));
        const games = ctx.store.games;
        return ok({
            hosted: games.filter((g) => g.host.id === player.id).map((g) => present(ctx, g)),
            joined: games
                .filter((g) => g.host.id !== player.id && mine.some((p) => p.gameId === g.id))
                .map((g) => present(ctx, g)),
        });
    }],

    ['GET', 'me/stat-approvals', (ctx) => {
        const player = requirePlayer(ctx);
        const approvals = ctx.store.playerStats
            .filter((s) => s.playerId === player.id && s.approval === 'pending')
            .map((stat) => {
                const game = ctx.store.games.find((g) => g.id === stat.gameId);
                return {
                    ...stat,
                    player: summaryOf(ctx.store, stat.playerId),
                    game: game ? gameSummary(game) : null,
                    result: ctx.store.results.find((r) => r.gameId === stat.gameId) ?? null,
                };
            });
        return ok(approvals);
    }],

    // ---- Players
    ['GET', 'players', (ctx) => {
        const sport = ctx.query.get('sport');
        const q = ctx.query.get('q')?.toLowerCase();
        const players = ctx.store.players
            .filter((p) => (!sport || p.sports?.includes(sport)) && (!q || p.name.toLowerCase().includes(q) || p.handle.includes(q)))
            .sort((a, b) => a.id.localeCompare(b.id));
        return ok(paginate(players, ctx.query, (p) => p.id, 12));
    }],

    ['GET', 'players/:handleOrId', (ctx) => {
        const key = ctx.params.handleOrId.replace(/^@/, '');
        const player = ctx.store.players.find((p) => p.id === key || p.handle === key);
        if (!player) throw new HttpError(404, 'PLAYER_NOT_FOUND', 'Player not found');
        return ok(player);
    }],

    ['GET', 'players/:handleOrId/matches', (ctx) => {
        const key = ctx.params.handleOrId.replace(/^@/, '');
        const player = ctx.store.players.find((p) => p.id === key || p.handle === key);
        if (!player) throw new HttpError(404, 'PLAYER_NOT_FOUND', 'Player not found');

        const matches: MatchRecord[] = ctx.store.playerStats
            .filter((s) => s.playerId === player.id)
            .map((stat) => {
                const game = ctx.store.games.find((g) => g.id === stat.gameId);
                const votes = ctx.store.mvpVotes.filter((v) => v.gameId === stat.gameId);
                const topVotes = Math.max(0, ...votes.map((v) => votes.filter((x) => x.playerId === v.playerId).length));
                return {
                    game: game ? gameSummary(game) : null,
                    stats: stat.stats,
                    outcome: stat.outcome ?? null,
                    approval: stat.approval,
                    wasMvp: topVotes > 0 && votes.filter((v) => v.playerId === player.id).length === topVotes,
                    result: ctx.store.results.find((r) => r.gameId === stat.gameId) ?? null,
                } as MatchRecord;
            })
            .filter((m) => m.game)
            .sort((a, b) => (b.game!.startsAt).localeCompare(a.game!.startsAt));

        return ok(paginate(matches, ctx.query, (m) => m.game!.startsAt + m.game!.id, 20));
    }],

    // ---- Games
    ['GET', 'games', (ctx) => {
        const sport = ctx.query.get('sport');
        const from = ctx.query.get('from');
        const to = ctx.query.get('to');
        const maxFeeMinor = ctx.query.get('maxFeeMinor');

        const games = ctx.store.games
            .filter((g) => g.visibility === 'public' && g.status === 'scheduled')
            .filter((g) => !sport || sport === 'all' || g.sport === sport)
            .filter((g) => !from || g.startsAt >= from)
            .filter((g) => !to || g.startsAt < to)
            .filter((g) => maxFeeMinor === null || g.fee.amountMinor <= Number(maxFeeMinor))
            .sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.id.localeCompare(b.id));

        const page = paginate(games, ctx.query, (g) => g.startsAt + g.id, 20);
        return ok({ ...page, items: page.items.map((g) => present(ctx, g)) });
    }],

    ['POST', 'games', (ctx) => {
        const host = requirePlayer(ctx);
        const input = body<GameInput>(ctx);
        if (!input.title?.trim() || input.title.trim().length < 3) throw new HttpError(400, 'INVALID_TITLE', 'Give the match a title', 'title');
        if (!sportByCode(input.sport)) throw new HttpError(400, 'INVALID_SPORT', 'Pick a sport we support', 'sport');
        if (!input.startsAt || Number.isNaN(Date.parse(input.startsAt))) throw new HttpError(400, 'INVALID_STARTS_AT', 'When does it start?', 'startsAt');
        if (!input.locationText?.trim()) throw new HttpError(400, 'INVALID_LOCATION', 'Where is it?', 'locationText');
        if (!input.capacity || input.capacity < 2) throw new HttpError(400, 'INVALID_CAPACITY', 'A game needs at least two players', 'capacity');

        const id = randomUUID();
        const game: Game = {
            id,
            slug: `${slugify(input.title)}-${id.slice(0, 8)}`,
            title: input.title.trim(),
            sport: input.sport,
            status: 'scheduled',
            visibility: input.visibility ?? 'public',
            startsAt: new Date(input.startsAt).toISOString(),
            timezone: input.timezone ?? TIMEZONE,
            durationMinutes: input.durationMinutes ?? 90,
            locationText: input.locationText.trim(),
            venueId: null, lat: null, lng: null,
            fee: input.fee ?? { amountMinor: 0, currency: 'GHS' },
            paymentMethod: (input.fee?.amountMinor ?? 0) > 0 ? 'momo_manual' : 'none',
            paymentHandle: input.paymentHandle ?? null,
            capacity: input.capacity,
            confirmedCount: 1,
            joinPolicy: input.joinPolicy ?? 'open',
            skillLevel: input.skillLevel ?? 'All Levels',
            imageUrl: input.imageUrl ?? '',
            host: { id: host.id, handle: host.handle, name: host.name, avatarUrl: host.avatarUrl },
            completedAt: null, cancelledAt: null, createdAt: now(),
        };
        ctx.store.games.unshift(game);
        ctx.store.participants.push({
            gameId: id, playerId: host.id, status: 'confirmed', role: 'host', position: null, attendance: null, joinedAt: now(),
        });
        return ok(present(ctx, game, { withParticipants: true }), 201);
    }],

    ['GET', 'games/:gameId', (ctx) => ok(present(ctx, findGame(ctx.store, ctx.params.gameId), { withParticipants: true }))],

    ['PATCH', 'games/:gameId', (ctx) => {
        const game = findGame(ctx.store, ctx.params.gameId);
        requireHost(ctx, game);
        const input = body<GameUpdate>(ctx);
        if (input.capacity !== undefined && input.capacity < game.confirmedCount) {
            throw new HttpError(400, 'INVALID_CAPACITY', `${game.confirmedCount} players have already joined`, 'capacity');
        }
        Object.assign(game, {
            ...input,
            ...(input.startsAt ? { startsAt: new Date(input.startsAt).toISOString() } : {}),
            ...(input.fee ? { paymentMethod: input.fee.amountMinor > 0 ? 'momo_manual' : 'none' } : {}),
        });
        if (input.capacity !== undefined) promoteFromWaitlist(ctx.store, game);
        return ok(present(ctx, game, { withParticipants: true }));
    }],

    ['POST', 'games/:gameId/cancel', (ctx) => {
        const game = findGame(ctx.store, ctx.params.gameId);
        requireHost(ctx, game);
        game.status = 'cancelled';
        game.cancelledAt = now();
        return ok(present(ctx, game, { withParticipants: true }));
    }],

    ['POST', 'games/:gameId/complete', (ctx) => {
        const game = findGame(ctx.store, ctx.params.gameId);
        requireHost(ctx, game);
        game.status = 'completed';
        game.completedAt = game.completedAt ?? now();
        return ok(present(ctx, game, { withParticipants: true }));
    }],

    // ---- Participants
    ['GET', 'games/:gameId/participants', (ctx) => ok(participantsOf(ctx.store, findGame(ctx.store, ctx.params.gameId).id))],

    ['POST', 'games/:gameId/join', (ctx) => {
        const player = requirePlayer(ctx);
        const game = findGame(ctx.store, ctx.params.gameId);
        if (game.status !== 'scheduled') throw new HttpError(409, 'GAME_CLOSED', 'This game is no longer open');

        const existing = ctx.store.participants.find((p) => p.gameId === game.id && p.playerId === player.id);
        if (existing && ['confirmed', 'requested', 'waitlisted'].includes(existing.status)) {
            return ok(present(ctx, game, { withParticipants: true })); // idempotent
        }

        const full = game.confirmedCount >= game.capacity;
        const status = game.joinPolicy === 'approval' ? 'requested' : full ? 'waitlisted' : 'confirmed';
        const position = status === 'waitlisted'
            ? ctx.store.participants.filter((p) => p.gameId === game.id && p.status === 'waitlisted').length + 1
            : null;

        if (existing) Object.assign(existing, { status, position, joinedAt: now() });
        else ctx.store.participants.push({ gameId: game.id, playerId: player.id, status, role: 'player', position, attendance: null, joinedAt: now() });

        recountConfirmed(ctx.store, game);
        if (status === 'confirmed') ensurePaymentLine(ctx.store, game, player.id);
        return ok(present(ctx, game, { withParticipants: true }));
    }],

    ['DELETE', 'games/:gameId/join', (ctx) => {
        const player = requirePlayer(ctx);
        const game = findGame(ctx.store, ctx.params.gameId);
        const mine = ctx.store.participants.find((p) => p.gameId === game.id && p.playerId === player.id);
        if (!mine) throw new HttpError(404, 'NOT_PARTICIPANT', "You're not on this game");
        if (mine.role === 'host') throw new HttpError(403, 'FORBIDDEN', 'The host cannot leave; cancel the game instead');
        mine.status = 'cancelled';
        mine.position = null;
        ctx.store.payments = ctx.store.payments.filter((p) => !(p.gameId === game.id && p.playerId === player.id && p.status === 'owed'));
        recountConfirmed(ctx.store, game);
        promoteFromWaitlist(ctx.store, game);
        return ok(present(ctx, game, { withParticipants: true }));
    }],

    ['PUT', 'games/:gameId/participants/:playerId/decision', (ctx) => {
        const game = findGame(ctx.store, ctx.params.gameId);
        requireHost(ctx, game);
        const { decision } = body<{ decision: 'approve' | 'decline' }>(ctx);
        const entry = ctx.store.participants.find((p) => p.gameId === game.id && p.playerId === ctx.params.playerId);
        if (!entry) throw new HttpError(404, 'NOT_PARTICIPANT', 'No such request');

        if (decision === 'decline') {
            entry.status = 'declined';
        } else {
            if (game.confirmedCount >= game.capacity) throw new HttpError(409, 'GAME_FULL', 'The squad is full');
            entry.status = 'confirmed';
            entry.position = null;
            ensurePaymentLine(ctx.store, game, entry.playerId);
        }
        recountConfirmed(ctx.store, game);
        return ok(present(ctx, game, { withParticipants: true }));
    }],

    ['DELETE', 'games/:gameId/participants/:playerId', (ctx) => {
        const game = findGame(ctx.store, ctx.params.gameId);
        requireHost(ctx, game);
        const entry = ctx.store.participants.find((p) => p.gameId === game.id && p.playerId === ctx.params.playerId);
        if (!entry) throw new HttpError(404, 'NOT_PARTICIPANT', 'No such player on this game');
        if (entry.role === 'host') throw new HttpError(403, 'FORBIDDEN', 'The host cannot be removed');
        entry.status = 'removed';
        recountConfirmed(ctx.store, game);
        promoteFromWaitlist(ctx.store, game);
        return ok(present(ctx, game, { withParticipants: true }));
    }],

    // ---- Payments (tracking only)
    ['GET', 'games/:gameId/payments', (ctx) => {
        requireAccount(ctx);
        const game = findGame(ctx.store, ctx.params.gameId);
        return ok(ctx.store.payments
            .filter((p) => p.gameId === game.id)
            .map((p) => ({ ...p, player: summaryOf(ctx.store, p.playerId) })));
    }],

    ['PUT', 'games/:gameId/payments/:playerId', (ctx) => {
        const player = requirePlayer(ctx);
        const game = findGame(ctx.store, ctx.params.gameId);
        const { status, note } = body<{ status: PaymentLine['status']; note?: string }>(ctx);
        const line = ctx.store.payments.find((p) => p.gameId === game.id && p.playerId === ctx.params.playerId);
        if (!line) throw new HttpError(404, 'PAYMENT_NOT_FOUND', 'Nothing owed for that player');

        const isHost = game.host.id === player.id;
        const isSelf = player.id === ctx.params.playerId;
        // A player may say "I've paid"; only the host confirms it or waives the fee.
        if (!isHost && !(isSelf && status === 'marked_paid')) {
            throw new HttpError(403, 'FORBIDDEN', 'Only the host can confirm or waive payments');
        }

        line.status = status;
        line.note = note ?? line.note;
        if (status === 'marked_paid') line.markedPaidAt = now();
        if (status === 'confirmed') line.confirmedAt = now();
        return ok({ ...line, player: summaryOf(ctx.store, line.playerId) });
    }],

    // ---- Results
    ['GET', 'games/:gameId/results', (ctx) => {
        const game = findGame(ctx.store, ctx.params.gameId);
        const votes = ctx.store.mvpVotes.filter((v) => v.gameId === game.id);
        const tally = [...new Set(votes.map((v) => v.playerId))]
            .map((id) => ({ id, count: votes.filter((v) => v.playerId === id).length }))
            .sort((a, b) => b.count - a.count);

        const results: GameResults = {
            result: ctx.store.results.find((r) => r.gameId === game.id) ?? null,
            playerStats: ctx.store.playerStats
                .filter((s) => s.gameId === game.id)
                .map((s) => ({ ...s, player: summaryOf(ctx.store, s.playerId) ?? undefined })),
            mvpVotes: votes,
            mvp: tally[0] ? summaryOf(ctx.store, tally[0].id) : null,
        };
        return ok(results);
    }],

    ['PUT', 'games/:gameId/results', (ctx) => {
        const game = findGame(ctx.store, ctx.params.gameId);
        requireHost(ctx, game);
        const input = body<ResultInput>(ctx);
        const sport = sportByCode(game.sport);
        const existing = ctx.store.results.find((r) => r.gameId === game.id);

        const result: GameResult = {
            gameId: game.id,
            enteredBy: game.host.id,
            resultData: input.resultData ?? {},
            status: 'pending',
            approvalThreshold: sport?.approvalThreshold ?? 0.5,
            approvalsCount: 0,
            rejectionsCount: 0,
            // Resubmitting invalidates approvals recorded against the previous version.
            version: (existing?.version ?? 0) + 1,
            approvedAt: null,
        };
        if (existing) ctx.store.results[ctx.store.results.indexOf(existing)] = result;
        else ctx.store.results.push(result);

        recountApprovals(ctx.store, game.id);
        return ok(result);
    }],

    ['PUT', 'games/:gameId/player-stats', (ctx) => {
        const game = findGame(ctx.store, ctx.params.gameId);
        requireHost(ctx, game);
        const inputs = body<PlayerStatInput[]>(ctx);
        if (!Array.isArray(inputs)) throw new HttpError(400, 'INVALID_BODY', 'Expected an array of player stats');
        const result = ctx.store.results.find((r) => r.gameId === game.id);
        if (!result) throw new HttpError(400, 'RESULT_REQUIRED', 'Submit the result first');

        const saved = inputs.map((input) => {
            const isHost = input.playerId === game.host.id;
            const line: PlayerGameStat = {
                gameId: game.id,
                playerId: input.playerId,
                sport: game.sport,
                stats: input.stats ?? {},
                showedUp: input.showedUp ?? true,
                outcome: input.outcome ?? null,
                // The host entered these, so their own line needs no second opinion.
                approval: isHost ? 'approved' : 'pending',
                approvedAt: isHost ? now() : null,
                resultVersion: result.version,
                note: null,
            };
            const index = ctx.store.playerStats.findIndex((s) => s.gameId === game.id && s.playerId === input.playerId);
            if (index >= 0) ctx.store.playerStats[index] = line;
            else ctx.store.playerStats.push(line);

            const entry = ctx.store.participants.find((p) => p.gameId === game.id && p.playerId === input.playerId);
            if (entry) entry.attendance = line.showedUp ? 'present' : 'no_show';
            return line;
        });

        recountApprovals(ctx.store, game.id);
        return ok(saved);
    }],

    ['PUT', 'games/:gameId/player-stats/me', (ctx) => {
        const player = requirePlayer(ctx);
        const game = findGame(ctx.store, ctx.params.gameId);
        const { decision, note } = body<{ decision: 'approve' | 'reject'; note?: string }>(ctx);
        const line = ctx.store.playerStats.find((s) => s.gameId === game.id && s.playerId === player.id);
        if (!line) throw new HttpError(404, 'STATS_NOT_FOUND', 'No stats recorded for you in this game');

        line.approval = decision === 'approve' ? 'approved' : 'rejected';
        line.approvedAt = now();
        line.note = note ?? null;
        recountApprovals(ctx.store, game.id);
        return ok(line);
    }],

    ['PUT', 'games/:gameId/mvp-vote', (ctx) => {
        const player = requirePlayer(ctx);
        const game = findGame(ctx.store, ctx.params.gameId);
        const { playerId } = body<{ playerId: string }>(ctx);
        const onGame = (id: string) => ctx.store.participants.some((p) => p.gameId === game.id && p.playerId === id && p.status === 'confirmed');
        if (!onGame(player.id)) throw new HttpError(403, 'NOT_PARTICIPANT', 'Only players in this game can vote');
        if (!onGame(playerId)) throw new HttpError(400, 'INVALID_VOTE', 'You can only vote for players in this game');

        const vote = { gameId: game.id, voterId: player.id, playerId };
        const index = ctx.store.mvpVotes.findIndex((v) => v.gameId === game.id && v.voterId === player.id);
        if (index >= 0) ctx.store.mvpVotes[index] = vote;
        else ctx.store.mvpVotes.push(vote);

        recomputeCareerStats(ctx.store, playerId);
        return ok(vote);
    }],
];

function gameSummary(game: Game) {
    return {
        id: game.id, slug: game.slug, title: game.title, sport: game.sport,
        startsAt: game.startsAt, timezone: game.timezone, locationText: game.locationText, imageUrl: game.imageUrl,
    };
}

function normalisePhone(phone: string): string | null {
    const digits = (phone ?? '').replace(/[^\d+]/g, '');
    if (/^\+\d{10,15}$/.test(digits)) return digits;
    if (/^0\d{9}$/.test(digits)) return `+233${digits.slice(1)}`;   // Ghanaian local format
    if (/^233\d{9}$/.test(digits)) return `+${digits}`;
    return null;
}

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
    const accountId = (req.sessionToken && store.sessions[req.sessionToken]) || null;
    const account = accountId ? store.accounts.find((a) => a.id === accountId) : undefined;

    // Replaying a write with the same key returns the first response instead of applying twice.
    const idemKey = req.idempotencyKey && accountId ? `${accountId}:${req.idempotencyKey}` : null;
    if (idemKey && store.idempotency[idemKey]) return store.idempotency[idemKey];

    let pathMatched = false;
    for (const [method, pattern, handler] of routes) {
        const params = match(pattern, req.path);
        if (!params) continue;
        pathMatched = true;
        if (method !== req.method) continue;

        try {
            const response = handler({ ...req, params, store, accountId, playerId: account?.playerId ?? null });
            if (req.method !== 'GET') {
                if (idemKey) store.idempotency[idemKey] = { status: response.status, body: response.body };
                saveStore();
            }
            return response;
        } catch (error) {
            if (error instanceof HttpError) {
                return {
                    status: error.status,
                    body: { error: { code: error.code, message: error.message, ...(error.field ? { field: error.field } : {}) } },
                };
            }
            throw error;
        }
    }

    return pathMatched
        ? { status: 405, body: { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } } }
        : { status: 404, body: { error: { code: 'NOT_FOUND', message: 'Endpoint not found' } } };
}
