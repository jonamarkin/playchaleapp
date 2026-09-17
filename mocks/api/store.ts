import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { Game, PlayerProfile } from '@/types';
import type { GameResult, PlayerGameStat, MvpVote } from '@/lib/api/types';
import { createSeed } from './seed';

/**
 * In-memory store behind the mock API.
 * Kept on globalThis so dev hot reloads don't wipe it, and saved to
 * .mock-db.json so data survives server restarts. Delete that file to reseed.
 */

export interface MockStore {
    accounts: { id: string; email: string }[];
    sessions: Record<string, string>; // token -> account id
    profiles: PlayerProfile[];
    games: Game[];
    gameResults: GameResult[];
    playerGameStats: PlayerGameStat[];
    mvpVotes: MvpVote[];
}

const DB_FILE = path.join(process.cwd(), '.mock-db.json');

const globalForStore = globalThis as unknown as { __playchaleMockStore?: MockStore };

function freshStore(): MockStore {
    return { ...createSeed(), sessions: {}, gameResults: [], playerGameStats: [], mvpVotes: [] };
}

function load(): MockStore {
    try {
        if (fs.existsSync(DB_FILE)) {
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as MockStore;
        }
    } catch {
        // Corrupt or unreadable file: fall back to the seed
    }
    return freshStore();
}

export function getStore(): MockStore {
    if (!globalForStore.__playchaleMockStore) {
        globalForStore.__playchaleMockStore = load();
    }
    return globalForStore.__playchaleMockStore;
}

export function saveStore() {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(getStore()));
    } catch {
        // Read-only filesystem (e.g. serverless preview): keep data in memory only
    }
}
