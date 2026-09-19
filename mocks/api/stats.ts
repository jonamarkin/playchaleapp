import type { CareerStats } from '@/lib/api/types';
import type { MockStore } from './store';

const now = () => new Date().toISOString();

/**
 * Recomputes a player's career stats from source — never incremented.
 *
 * A stat line counts only when it is approved AND its game's result is approved AND it was
 * approved against the current result version. That last clause is what stops a host who
 * re-enters a score from keeping the old approvals.
 */
export function recomputeCareerStats(store: MockStore, playerId: string) {
    const player = store.players.find((p) => p.id === playerId);
    if (!player) return;

    const lines = store.playerStats.filter((stat) => {
        if (stat.playerId !== playerId || stat.approval !== 'approved') return false;
        const result = store.results.find((r) => r.gameId === stat.gameId);
        return !!result && result.status === 'approved' && result.version === stat.resultVersion;
    });

    const bySport = new Map<string, CareerStats>();
    for (const line of lines) {
        const entry = bySport.get(line.sport) ?? {
            sport: line.sport, gamesPlayed: 0, wins: 0, losses: 0, draws: 0, mvps: 0, noShows: 0,
            counters: {}, lastGameAt: null,
        };
        entry.gamesPlayed += 1;
        if (line.outcome === 'win') entry.wins += 1;
        if (line.outcome === 'loss') entry.losses += 1;
        if (line.outcome === 'draw') entry.draws += 1;
        if (!line.showedUp) entry.noShows += 1;
        if (store.mvpVotes.some((v) => v.gameId === line.gameId && v.playerId === playerId)) {
            const votes = store.mvpVotes.filter((v) => v.gameId === line.gameId);
            const top = [...new Set(votes.map((v) => v.playerId))]
                .map((id) => ({ id, count: votes.filter((v) => v.playerId === id).length }))
                .sort((a, b) => b.count - a.count)[0];
            if (top?.id === playerId) entry.mvps += 1;
        }
        for (const [key, value] of Object.entries(line.stats)) {
            if (typeof value === 'number') entry.counters[key] = (entry.counters[key] ?? 0) + value;
            else if (value === true) entry.counters[key] = (entry.counters[key] ?? 0) + 1;
        }
        const game = store.games.find((g) => g.id === line.gameId);
        if (game && (!entry.lastGameAt || game.startsAt > entry.lastGameAt)) entry.lastGameAt = game.startsAt;
        bySport.set(line.sport, entry);
    }

    player.careerStats = [...bySport.values()].sort((a, b) => b.gamesPlayed - a.gamesPlayed);
}

/**
 * Re-derives a result's approval state, then everyone's totals.
 *
 * The threshold is measured over the *other* participants' lines only. The host entered the
 * report, so counting their own line towards it would let a host certify their own stats —
 * which is the one thing this whole mechanism exists to prevent. A host who reports a game
 * nobody else was in therefore never gets an approved result, and that is correct.
 */
export function recountApprovals(store: MockStore, gameId: string) {
    const result = store.results.find((r) => r.gameId === gameId);
    if (!result) return;
    const game = store.games.find((g) => g.id === gameId);

    const current = store.playerStats.filter((s) => s.gameId === gameId && s.resultVersion === result.version);
    const others = current.filter((s) => s.playerId !== game?.host.id);

    result.approvalsCount = others.filter((s) => s.approval === 'approved').length;
    result.rejectionsCount = others.filter((s) => s.approval === 'rejected').length;
    const approved = others.length > 0 && result.approvalsCount / others.length >= result.approvalThreshold;
    result.status = result.rejectionsCount > 0 && !approved ? 'disputed' : approved ? 'approved' : 'pending';
    result.approvedAt = result.status === 'approved' ? (result.approvedAt ?? now()) : null;

    // Everyone who ever had a line on this game, so a re-reported result also drops the
    // totals that were built on the version it replaced.
    const affected = new Set(store.playerStats.filter((s) => s.gameId === gameId).map((s) => s.playerId));
    for (const playerId of affected) recomputeCareerStats(store, playerId);
}
