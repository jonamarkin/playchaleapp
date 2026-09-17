/**
 * Typed PlayChale API client.
 * createApi() maps every endpoint to a transport, so the same calls run in the
 * browser (lib/api/browser.ts) and during server rendering (lib/api/server.ts).
 */

import type { Game, PlayerProfile } from '@/types';
import type {
    ApiErrorBody,
    CreateGameInput,
    CreateProfileInput,
    Credentials,
    GameResult,
    GameResultsResponse,
    MvpVote,
    MyGames,
    Page,
    PlayerGameStat,
    PlayerStatsInput,
    Session,
    StatApproval,
    SubmitResultsInput,
} from './types';

export class ApiError extends Error {
    constructor(public status: number, public code: string, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

export interface ApiRequest {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    query?: Record<string, string | number | undefined>;
    body?: unknown;
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

export function createApi(transport: Transport) {
    async function call<T>(request: ApiRequest): Promise<T> {
        const { status, body } = await transport(request);
        if (status >= 400) {
            const error = (body as ApiErrorBody | undefined)?.error;
            throw new ApiError(status, error?.code || 'UNKNOWN', error?.message || 'Something went wrong');
        }
        return body as T;
    }

    const id = encodeURIComponent;

    return {
        auth: {
            session: () => call<Session>({ method: 'GET', path: '/auth/session' }),
            login: (credentials: Credentials) => call<Session>({ method: 'POST', path: '/auth/login', body: credentials }),
            signup: (credentials: Credentials) => call<Session>({ method: 'POST', path: '/auth/signup', body: credentials }),
            /** Mock API only: sign in as the seeded demo player */
            demo: () => call<Session>({ method: 'POST', path: '/auth/demo' }),
            logout: () => call<void>({ method: 'POST', path: '/auth/logout' }),
        },
        me: {
            profile: () => call<PlayerProfile>({ method: 'GET', path: '/me/profile' }),
            saveProfile: (input: CreateProfileInput) => call<PlayerProfile>({ method: 'PUT', path: '/me/profile', body: input }),
            updateAvatar: (avatarUrl: string) => call<PlayerProfile>({ method: 'PUT', path: '/me/avatar', body: { avatarUrl } }),
            games: () => call<MyGames>({ method: 'GET', path: '/me/games' }),
            statApprovals: () => call<StatApproval[]>({ method: 'GET', path: '/me/stat-approvals' }),
        },
        players: {
            list: (query: { cursor?: string; limit?: number } = {}) =>
                call<Page<PlayerProfile>>({ method: 'GET', path: '/players', query }),
            get: (idOrSlug: string) => call<PlayerProfile>({ method: 'GET', path: `/players/${id(idOrSlug)}` }),
        },
        games: {
            list: (query: { cursor?: string; limit?: number; sport?: string } = {}) =>
                call<Page<Game>>({ method: 'GET', path: '/games', query }),
            get: (idOrSlug: string) => call<Game>({ method: 'GET', path: `/games/${id(idOrSlug)}` }),
            create: (input: CreateGameInput) => call<Game>({ method: 'POST', path: '/games', body: input }),
            join: (gameId: string) => call<Game>({ method: 'POST', path: `/games/${id(gameId)}/join` }),
            complete: (gameId: string) => call<Game>({ method: 'POST', path: `/games/${id(gameId)}/complete` }),
            results: (gameId: string) => call<GameResultsResponse>({ method: 'GET', path: `/games/${id(gameId)}/results` }),
            submitResults: (gameId: string, input: SubmitResultsInput) =>
                call<GameResult>({ method: 'PUT', path: `/games/${id(gameId)}/results`, body: input }),
            submitPlayerStats: (gameId: string, stats: PlayerStatsInput[]) =>
                call<PlayerGameStat[]>({ method: 'PUT', path: `/games/${id(gameId)}/player-stats`, body: stats }),
            reviewMyStats: (gameId: string, approved: boolean) =>
                call<PlayerGameStat>({ method: 'PUT', path: `/games/${id(gameId)}/player-stats/me/approval`, body: { approved } }),
            voteMvp: (gameId: string, votedForId: string) =>
                call<MvpVote>({ method: 'PUT', path: `/games/${id(gameId)}/mvp-vote`, body: { votedForId } }),
        },
    };
}

export type Api = ReturnType<typeof createApi>;
