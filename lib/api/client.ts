/**
 * Typed PlayChale API client.
 *
 * createApi() maps every endpoint in docs/api/openapi.yaml to a function, so the same calls
 * run in the browser (lib/api/browser.ts) and during server rendering (lib/api/server.ts).
 * Shapes come from the generated schema — see lib/api/types.ts.
 */
import type {
    ApiErrorBody,
    Credentials,
    Game,
    GameInput,
    GameResult,
    GameResults,
    GameUpdate,
    MatchRecord,
    Money,
    MvpVote,
    MyGames,
    Page,
    Participant,
    PaymentLine,
    PaymentStatus,
    Player,
    PlayerGameStat,
    PlayerStatInput,
    ProfileInput,
    ResultInput,
    Session,
    Sport,
    StatApproval,
} from './types';

export class ApiError extends Error {
    constructor(public status: number, public code: string, message: string, public field?: string) {
        super(message);
        this.name = 'ApiError';
    }
}

export interface ApiRequest {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    query?: Record<string, string | number | undefined>;
    body?: unknown;
    /** Sent as Idempotency-Key so a retried write on a flaky connection can't double-apply. */
    idempotencyKey?: string;
}

export interface TransportResponse {
    status: number;
    body: unknown;
}

export type Transport = (request: ApiRequest) => Promise<TransportResponse>;

export function toQueryString(query: ApiRequest['query']) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query || {})) {
        if (value !== undefined && value !== '') params.set(key, String(value));
    }
    const qs = params.toString();
    return qs ? `?${qs}` : '';
}

export interface ListGamesQuery {
    [key: string]: string | number | undefined;
    cursor?: string;
    limit?: number;
    sport?: string;
    /** ISO instants — the API filters on startsAt, not on display strings */
    from?: string;
    to?: string;
    maxFeeMinor?: number;
}

export function createApi(transport: Transport) {
    async function call<T>(request: ApiRequest): Promise<T> {
        const { status, body } = await transport(request);
        if (status >= 400) {
            const error = (body as ApiErrorBody | undefined)?.error;
            throw new ApiError(status, error?.code || 'UNKNOWN', error?.message || 'Something went wrong', error?.field);
        }
        return body as T;
    }

    const id = encodeURIComponent;

    return {
        auth: {
            session: () => call<Session>({ method: 'GET', path: '/auth/session' }),
            startOtp: (phone: string) =>
                call<{ challengeId: string; expiresAt: string; resendAfterSeconds: number }>({
                    method: 'POST', path: '/auth/otp/start', body: { phone },
                }),
            verifyOtp: (challengeId: string, code: string) =>
                call<Session>({ method: 'POST', path: '/auth/otp/verify', body: { challengeId, code } }),
            google: (idToken: string) => call<Session>({ method: 'POST', path: '/auth/google', body: { idToken } }),
            login: (credentials: Credentials) => call<Session>({ method: 'POST', path: '/auth/login', body: credentials }),
            signup: (credentials: Credentials) => call<Session>({ method: 'POST', path: '/auth/signup', body: credentials }),
            /** Mock API only: sign in as the seeded demo player */
            demo: () => call<Session>({ method: 'POST', path: '/auth/demo' }),
            logout: () => call<void>({ method: 'POST', path: '/auth/logout' }),
        },
        me: {
            profile: () => call<Player>({ method: 'GET', path: '/me/profile' }),
            saveProfile: (input: ProfileInput) => call<Player>({ method: 'PUT', path: '/me/profile', body: input }),
            checkHandle: (handle: string) =>
                call<{ handle: string; available: boolean; reason?: string }>({
                    method: 'GET', path: '/me/handle-available', query: { handle },
                }),
            updateAvatar: (avatarUrl: string) => call<Player>({ method: 'PUT', path: '/me/avatar', body: { avatarUrl } }),
            games: () => call<MyGames>({ method: 'GET', path: '/me/games' }),
            statApprovals: () => call<StatApproval[]>({ method: 'GET', path: '/me/stat-approvals' }),
        },
        sports: {
            list: () => call<Sport[]>({ method: 'GET', path: '/sports' }),
        },
        players: {
            list: (query: { cursor?: string; limit?: number; sport?: string; q?: string } = {}) =>
                call<Page<Player>>({ method: 'GET', path: '/players', query }),
            get: (handleOrId: string) => call<Player>({ method: 'GET', path: `/players/${id(handleOrId)}` }),
            matches: (handleOrId: string, query: { cursor?: string; limit?: number } = {}) =>
                call<Page<MatchRecord>>({ method: 'GET', path: `/players/${id(handleOrId)}/matches`, query }),
        },
        games: {
            list: (query: ListGamesQuery = {}) => call<Page<Game>>({ method: 'GET', path: '/games', query }),
            get: (gameId: string) => call<Game>({ method: 'GET', path: `/games/${id(gameId)}` }),
            create: (input: GameInput, idempotencyKey?: string) =>
                call<Game>({ method: 'POST', path: '/games', body: input, idempotencyKey }),
            update: (gameId: string, input: GameUpdate) => call<Game>({ method: 'PATCH', path: `/games/${id(gameId)}`, body: input }),
            cancel: (gameId: string, reason?: string) => call<Game>({ method: 'POST', path: `/games/${id(gameId)}/cancel`, body: { reason } }),
            complete: (gameId: string) => call<Game>({ method: 'POST', path: `/games/${id(gameId)}/complete` }),

            join: (gameId: string, idempotencyKey?: string) =>
                call<Game>({ method: 'POST', path: `/games/${id(gameId)}/join`, idempotencyKey }),
            leave: (gameId: string) => call<Game>({ method: 'DELETE', path: `/games/${id(gameId)}/join` }),
            participants: (gameId: string) => call<Participant[]>({ method: 'GET', path: `/games/${id(gameId)}/participants` }),
            decideParticipant: (gameId: string, playerId: string, decision: 'approve' | 'decline') =>
                call<Game>({ method: 'PUT', path: `/games/${id(gameId)}/participants/${id(playerId)}/decision`, body: { decision } }),
            removeParticipant: (gameId: string, playerId: string) =>
                call<Game>({ method: 'DELETE', path: `/games/${id(gameId)}/participants/${id(playerId)}` }),

            payments: (gameId: string) => call<PaymentLine[]>({ method: 'GET', path: `/games/${id(gameId)}/payments` }),
            updatePayment: (gameId: string, playerId: string, status: PaymentStatus, note?: string) =>
                call<PaymentLine>({ method: 'PUT', path: `/games/${id(gameId)}/payments/${id(playerId)}`, body: { status, note } }),

            results: (gameId: string) => call<GameResults>({ method: 'GET', path: `/games/${id(gameId)}/results` }),
            submitResult: (gameId: string, input: ResultInput) =>
                call<GameResult>({ method: 'PUT', path: `/games/${id(gameId)}/results`, body: input }),
            submitPlayerStats: (gameId: string, stats: PlayerStatInput[]) =>
                call<PlayerGameStat[]>({ method: 'PUT', path: `/games/${id(gameId)}/player-stats`, body: stats }),
            reviewMyStats: (gameId: string, decision: 'approve' | 'reject', note?: string) =>
                call<PlayerGameStat>({ method: 'PUT', path: `/games/${id(gameId)}/player-stats/me`, body: { decision, note } }),
            voteMvp: (gameId: string, playerId: string) =>
                call<MvpVote>({ method: 'PUT', path: `/games/${id(gameId)}/mvp-vote`, body: { playerId } }),
        },
    };
}

export type Api = ReturnType<typeof createApi>;

/** Free games are `amountMinor: 0`, never a missing fee. */
export const isFree = (money: Money) => money.amountMinor === 0;
