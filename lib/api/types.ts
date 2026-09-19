/**
 * The API's shapes, aliased from the types generated out of docs/api/openapi.yaml
 * (`pnpm gen:api` → lib/api/schema.ts).
 *
 * Nothing here is hand-written: a change to the spec becomes a compile error at the call
 * sites, which is what keeps the mock, the frontend and the Go service describing the
 * same API.
 */
import type { components } from './schema';

type Schemas = components['schemas'];

// Core domain
export type Money = Schemas['Money'];
export type Sport = Schemas['Sport'];
export type StatField = Schemas['StatField'];
export type PlayerSummary = Schemas['PlayerSummary'];
export type Player = Schemas['Player'];
export type CareerStats = Schemas['CareerStats'];
export type Game = Schemas['Game'];
export type GameSummary = Schemas['GameSummary'];
export type GameViewer = Schemas['GameViewer'];
export type Participant = Schemas['Participant'];
export type ParticipantStatus = Schemas['ParticipantStatus'];
export type PaymentLine = Schemas['PaymentLine'];
export type GameResult = Schemas['GameResult'];
export type GameResults = Schemas['GameResults'];
export type PlayerGameStat = Schemas['PlayerGameStat'];
export type StatApproval = Schemas['StatApproval'];
export type MatchRecord = Schemas['MatchRecord'];
export type MvpVote = Schemas['MvpVote'];

// Auth
export type AuthUser = Schemas['AuthUser'];
export type Session = Schemas['Session'];
export type Credentials = Schemas['Credentials'];

// Inputs
export type ProfileInput = Schemas['ProfileInput'];
export type GameInput = Schemas['GameInput'];
export type GameUpdate = Schemas['GameUpdate'];
export type ResultInput = Schemas['ResultInput'];
export type PlayerStatInput = Schemas['PlayerStatInput'];

export type ApiErrorBody = Schemas['Error'];

/** A page of `T`, keyset-paginated. */
export interface Page<T> {
    items: T[];
    nextCursor: string | null;
}

export type MyGames = { hosted: Game[]; joined: Game[] };

export type SkillLevel = Schemas['SkillLevel'];
export type PaymentStatus = NonNullable<PaymentLine['status']>;
