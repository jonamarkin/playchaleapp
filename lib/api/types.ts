/**
 * Request/response shapes of the PlayChale REST API.
 * Mirrors docs/api/openapi.yaml; keep both in sync until types are generated from the spec.
 * Domain entities (Game, PlayerProfile, ...) live in @/types.
 */

import type { AuthUser, Game, PlayerProfile } from '@/types';

export interface Page<T> {
    items: T[];
    nextCursor: string | null;
}

export interface Session {
    user: AuthUser | null;
    hasProfile: boolean;
}

export interface Credentials {
    email: string;
    password: string;
}

export interface CreateProfileInput {
    name: string;
    sports: string[];
    level?: string;
    location: string;
}

export type CreateGameInput = Pick<
    Game,
    'title' | 'sport' | 'location' | 'date' | 'time' | 'spotsTotal' | 'skillLevel' | 'price' | 'visibility'
> & { imageUrl?: string };

export interface MyGames {
    hostedGames: Game[];
    joinedGames: Game[];
}

export interface GameResult {
    gameId: string;
    enteredBy: string;
    resultData: Record<string, number>;
    status: 'pending' | 'approved' | 'disputed';
    approvalThreshold: number;
    approvalsCount: number;
    rejectionsCount: number;
}

export interface PlayerGameStat {
    gameId: string;
    userId: string;
    stats: Record<string, number | boolean>;
    showedUp: boolean;
    /** null = awaiting the player's review */
    approvedByPlayer: boolean | null;
    approvedAt: string | null;
}

export interface MvpVote {
    gameId: string;
    voterId: string;
    votedForId: string;
}

export interface GameResultsResponse {
    result: GameResult | null;
    playerStats: (PlayerGameStat & { player: Pick<PlayerProfile, 'id' | 'name' | 'avatar'> | null })[];
    mvpVotes: MvpVote[];
}

export interface SubmitResultsInput {
    resultData: Record<string, number>;
    approvalThreshold: number;
}

export interface PlayerStatsInput {
    userId: string;
    stats: Record<string, number | boolean>;
    showedUp: boolean;
}

export interface StatApproval extends PlayerGameStat {
    game: Pick<Game, 'id' | 'slug' | 'title' | 'sport' | 'date' | 'time' | 'imageUrl'> | null;
    result: Pick<GameResult, 'resultData' | 'status'> | null;
}

export interface ApiErrorBody {
    error: { code: string; message: string };
}
