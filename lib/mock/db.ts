/**
 * In-browser mock backend.
 * Stands in for the real API while the UI is being built: every function is
 * async and returns app-shaped data, so hooks/useData.ts can swap these calls
 * for HTTP requests later without the components changing.
 *
 * State is persisted to localStorage so created games, joins and profiles
 * survive a reload. Call resetMockDb() (or clear the storage key) to reseed.
 */

import { DEFAULT_SPORT_IMAGES } from '@/constants';
import { Game, Participant, PlayerProfile } from '@/types';
import { createSeed, slugify } from './seed';

const STORAGE_KEY = 'playchale_mock_db_v1';
const LATENCY_MS = 250;

export interface GameResultRecord {
    game_id: string;
    entered_by: string;
    result_data: Record<string, any>;
    status: 'pending' | 'approved' | 'disputed';
    approval_threshold: number;
    approvals_count: number;
    rejections_count: number;
}

export interface PlayerGameStatRecord {
    game_id: string;
    user_id: string;
    stats: Record<string, any>;
    showed_up: boolean;
    approved_by_player: boolean | null;
    approved_at: string | null;
}

export interface MvpVoteRecord {
    game_id: string;
    voter_id: string;
    voted_for_id: string;
}

interface MockDb {
    accounts: { id: string; email: string }[];
    profiles: PlayerProfile[];
    games: Game[];
    gameResults: GameResultRecord[];
    playerGameStats: PlayerGameStatRecord[];
    mvpVotes: MvpVoteRecord[];
}

let cache: MockDb | null = null;

function freshDb(): MockDb {
    return { ...createSeed(), gameResults: [], playerGameStats: [], mvpVotes: [] };
}

function db(): MockDb {
    if (cache) return cache;
    if (typeof window === 'undefined') return freshDb();

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        cache = stored ? (JSON.parse(stored) as MockDb) : freshDb();
    } catch {
        cache = freshDb();
    }
    return cache;
}

function save() {
    if (!cache || typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch {
        // Storage full or blocked: keep working in memory
    }
}

const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
const clone = <T>(value: T): T => structuredClone(value);

export function resetMockDb() {
    cache = freshDb();
    save();
}

// --- Accounts ---

export function findAccountByEmail(email: string) {
    return db().accounts.find((a) => a.email.toLowerCase() === email.toLowerCase()) || null;
}

export function createAccount(email: string) {
    const existing = findAccountByEmail(email);
    if (existing) return existing;

    const account = { id: crypto.randomUUID(), email };
    db().accounts.push(account);
    save();
    return account;
}

export function hasProfile(userId: string) {
    return db().profiles.some((p) => p.id === userId);
}

// --- Profiles ---

function findProfile(idOrSlug: string) {
    return db().profiles.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

function uniqueProfileSlug(name: string) {
    const base = slugify(name);
    let slug = base;
    let counter = 1;
    while (db().profiles.some((p) => p.slug === slug)) {
        counter += 1;
        slug = `${base}-${counter}`;
    }
    return slug;
}

export async function listPlayers(): Promise<PlayerProfile[]> {
    await delay();
    return clone(db().profiles);
}

export async function listPlayersPage(page: number, pageSize: number): Promise<PlayerProfile[]> {
    await delay();
    const start = page * pageSize;
    return clone(db().profiles.slice(start, start + pageSize));
}

export async function getProfile(idOrSlug: string): Promise<PlayerProfile | null> {
    await delay();
    const profile = findProfile(idOrSlug);
    return profile ? clone(profile) : null;
}

export async function createProfile(
    userId: string,
    data: { name: string; sports: string[]; location: string }
): Promise<PlayerProfile> {
    await delay();
    const starterStats = { gamesPlayed: 0, winRate: '0%', mvps: 0, reliability: '100%', rating: 6.0 };
    const sportStats = Object.fromEntries(data.sports.map((sport) => [sport, { ...starterStats }]));
    const mainSport = data.sports[0] || 'Football';

    const profile: PlayerProfile = {
        id: userId,
        slug: uniqueProfileSlug(data.name),
        name: data.name,
        avatar: `https://i.pravatar.cc/300?u=${userId}`,
        mainSport,
        location: data.location,
        attributes: { pace: 80, shooting: 75, passing: 78, dribbling: 82, defending: 60, physical: 70 },
        sportStats,
        stats: sportStats[mainSport] || { ...starterStats },
        bio: '',
        matchHistory: [],
    };

    const profiles = db().profiles;
    const index = profiles.findIndex((p) => p.id === userId);
    if (index >= 0) profiles[index] = profile;
    else profiles.push(profile);
    save();
    return clone(profile);
}

export async function updateAvatar(userId: string, avatarUrl: string): Promise<void> {
    await delay();
    const profile = findProfile(userId);
    if (!profile) throw new Error('Profile not found');
    profile.avatar = avatarUrl;
    save();
}

// --- Games ---

function findGame(idOrSlug: string) {
    return db().games.find((g) => g.id === idOrSlug || g.slug === idOrSlug);
}

function toParticipant(profile: PlayerProfile, role: string): Participant {
    return { id: profile.id, slug: profile.slug, name: profile.name, avatar: profile.avatar, role };
}

export async function listPublicGames(): Promise<Game[]> {
    await delay();
    return clone(db().games.filter((g) => g.visibility !== 'private'));
}

export async function getGame(idOrSlug: string): Promise<Game | null> {
    await delay();
    const game = findGame(idOrSlug);
    return game ? clone(game) : null;
}

export async function createGame(gameData: Partial<Game>, userId: string): Promise<string> {
    await delay();
    const organizer = findProfile(userId);
    if (!organizer) throw new Error('Complete onboarding before hosting a game');

    const id = crypto.randomUUID();
    const sport = gameData.sport || 'Football';
    const images = DEFAULT_SPORT_IMAGES[sport] || DEFAULT_SPORT_IMAGES.Football;
    const title = gameData.title || 'Untitled Game';

    db().games.unshift({
        id,
        slug: `${slugify(title)}-${id.slice(0, 8)}`,
        organizer_id: userId,
        organizer: organizer.name,
        title,
        sport,
        location: gameData.location || '',
        time: gameData.time || '',
        date: gameData.date || '',
        spotsTotal: gameData.spotsTotal || 10,
        spotsTaken: 1,
        skillLevel: gameData.skillLevel || 'All Levels',
        imageUrl: gameData.imageUrl || images[0],
        price: gameData.price || 'Free',
        status: 'upcoming',
        visibility: gameData.visibility || 'public',
        participants: [toParticipant(organizer, 'Host')],
    });
    save();
    return id;
}

export async function joinGame(gameId: string, userId: string): Promise<void> {
    await delay();
    const game = findGame(gameId);
    const profile = findProfile(userId);
    if (!game) throw new Error('Game not found');
    if (!profile) throw new Error('Complete onboarding before joining a game');

    const participants = game.participants || [];
    if (participants.some((p) => p.id === userId)) return;
    if (participants.length >= game.spotsTotal) throw new Error('This game is full');

    game.participants = [...participants, toParticipant(profile, 'Player')];
    game.spotsTaken = game.participants.length;
    save();
}

export async function listMyGames(userId: string): Promise<{ hostedGames: Game[]; joinedGames: Game[] }> {
    await delay();
    const games = db().games;
    return clone({
        hostedGames: games.filter((g) => g.organizer_id === userId),
        joinedGames: games.filter(
            (g) => g.organizer_id !== userId && g.participants?.some((p) => p.id === userId)
        ),
    });
}

export async function completeGame(gameId: string): Promise<void> {
    await delay();
    const game = findGame(gameId);
    if (!game) throw new Error('Game not found');
    game.completed_at = new Date().toISOString();
    game.status = 'completed';
    save();
}

// --- Results, stats & MVP votes ---

export async function getGameResults(gameId: string) {
    await delay();
    const { gameResults, playerGameStats, mvpVotes, profiles } = db();
    return clone({
        results: gameResults.find((r) => r.game_id === gameId) || null,
        playerStats: playerGameStats
            .filter((s) => s.game_id === gameId)
            .map((s) => {
                const p = profiles.find((profile) => profile.id === s.user_id);
                return { ...s, profiles: p ? { id: p.id, full_name: p.name, avatar_url: p.avatar } : null };
            }),
        mvpVotes: mvpVotes.filter((v) => v.game_id === gameId),
        error: null,
    });
}

export async function listPendingApprovals(userId: string) {
    await delay();
    const { playerGameStats, gameResults } = db();
    return clone(
        playerGameStats
            .filter((s) => s.user_id === userId && s.approved_by_player === null)
            .map((s) => {
                const game = findGame(s.game_id);
                const result = gameResults.find((r) => r.game_id === s.game_id);
                return {
                    ...s,
                    games: game
                        ? { id: game.id, title: game.title, sport: game.sport, date: game.date, time: game.time, image_url: game.imageUrl }
                        : null,
                    game_results: result ? { result_data: result.result_data, status: result.status } : null,
                };
            })
    );
}

export async function submitGameResults(
    input: { gameId: string; resultData: Record<string, any>; approvalThreshold: number },
    userId: string
): Promise<GameResultRecord> {
    await delay();
    const record: GameResultRecord = {
        game_id: input.gameId,
        entered_by: userId,
        result_data: input.resultData,
        status: 'pending',
        approval_threshold: input.approvalThreshold,
        approvals_count: 0,
        rejections_count: 0,
    };
    const results = db().gameResults;
    const index = results.findIndex((r) => r.game_id === input.gameId);
    if (index >= 0) results[index] = record;
    else results.push(record);
    save();
    return clone(record);
}

export async function submitPlayerStats(
    stats: { gameId: string; userId: string; stats: Record<string, any>; showedUp: boolean }[]
): Promise<PlayerGameStatRecord[]> {
    await delay();
    const all = db().playerGameStats;
    const saved = stats.map((s) => {
        const record: PlayerGameStatRecord = {
            game_id: s.gameId,
            user_id: s.userId,
            stats: s.stats,
            showed_up: s.showedUp,
            approved_by_player: null,
            approved_at: null,
        };
        const index = all.findIndex((r) => r.game_id === s.gameId && r.user_id === s.userId);
        if (index >= 0) all[index] = record;
        else all.push(record);
        return record;
    });
    save();
    return clone(saved);
}

export async function approveStats(gameId: string, userId: string, approved: boolean): Promise<PlayerGameStatRecord> {
    await delay();
    const { playerGameStats, gameResults } = db();
    const record = playerGameStats.find((s) => s.game_id === gameId && s.user_id === userId);
    if (!record) throw new Error('No stats to approve');

    record.approved_by_player = approved;
    record.approved_at = new Date().toISOString();

    const result = gameResults.find((r) => r.game_id === gameId);
    if (result) {
        const gameStats = playerGameStats.filter((s) => s.game_id === gameId);
        result.approvals_count = gameStats.filter((s) => s.approved_by_player === true).length;
        result.rejections_count = gameStats.filter((s) => s.approved_by_player === false).length;
        result.status = result.approvals_count / gameStats.length >= result.approval_threshold ? 'approved' : 'pending';
    }
    save();
    return clone(record);
}

export async function voteForMVP(gameId: string, voterId: string, votedForId: string): Promise<MvpVoteRecord> {
    await delay();
    const votes = db().mvpVotes;
    const vote = { game_id: gameId, voter_id: voterId, voted_for_id: votedForId };
    const index = votes.findIndex((v) => v.game_id === gameId && v.voter_id === voterId);
    if (index >= 0) votes[index] = vote;
    else votes.push(vote);
    save();
    return clone(vote);
}
