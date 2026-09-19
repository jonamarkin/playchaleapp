/**
 * Domain types for the app.
 *
 * These are the API's shapes, generated from docs/api/openapi.yaml — the app no longer keeps a
 * second, divergent model (which is how `date: "Wed, Oct 25"`, `price: "₵25"` and
 * `winRate: "68%"` ended up baked into the UI). Import from here in components;
 * `@/lib/api/types` is the same set plus request/response helpers.
 */
export type {
    AuthUser,
    CareerStats,
    Game,
    GameResult,
    GameResults,
    GameSummary,
    GameViewer,
    MatchRecord,
    Money,
    MyGames,
    MvpVote,
    Participant,
    ParticipantStatus,
    PaymentLine,
    Player,
    PlayerGameStat,
    PlayerStatInput,
    PlayerSummary,
    Session,
    SkillLevel,
    Sport,
    StatApproval,
    StatField,
} from '@/lib/api/types';
