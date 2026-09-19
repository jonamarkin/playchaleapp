import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { createSeed } from './seed';
import { recomputeCareerStats } from './stats';

/**
 * In-memory store behind the mock API.
 *
 * Kept on globalThis so dev hot reloads don't wipe it, and saved to .mock-db.json so data
 * survives restarts. Delete that file to reseed.
 */
export type MockStore = ReturnType<typeof createSeed>;

const DB_FILE = path.join(process.cwd(), '.mock-db.json');
const SCHEMA_VERSION = 2; // bumped with the contract rewrite, so stale files reseed

const globalForStore = globalThis as unknown as { __playchaleMockStore?: MockStore };

function load(): MockStore {
    try {
        if (fs.existsSync(DB_FILE)) {
            const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as MockStore & { __v?: number };
            if (parsed.__v === SCHEMA_VERSION) return parsed;
        }
    } catch {
        // Corrupt or unreadable: fall back to the seed
    }
    return seeded();
}

/** Career stats are derived, so the seed computes them the same way the API does. */
function seeded(): MockStore {
    const store = createSeed();
    for (const player of store.players) recomputeCareerStats(store, player.id);
    return store;
}

export function getStore(): MockStore {
    if (!globalForStore.__playchaleMockStore) {
        globalForStore.__playchaleMockStore = load();
    }
    return globalForStore.__playchaleMockStore;
}

export function saveStore() {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify({ ...getStore(), __v: SCHEMA_VERSION }));
    } catch {
        // Read-only filesystem (e.g. serverless preview): keep data in memory only
    }
}

export function resetStore() {
    globalForStore.__playchaleMockStore = seeded();
    saveStore();
}
