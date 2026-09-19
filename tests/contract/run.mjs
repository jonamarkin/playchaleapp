/**
 * PlayChale contract suite — one journey, two implementations.
 *
 *   node tests/contract/run.mjs --target=mock   (default: the Next.js app's /api)
 *   node tests/contract/run.mjs --target=go --base-url=http://localhost:8080
 *
 * Every response is validated against docs/api/openapi.yaml, so this fails when either
 * implementation drifts from the contract — which is the only thing keeping the mock
 * honest while frontend work is built on top of it.
 *
 * It exercises the loop the product depends on: host a game, someone joins, the host
 * reports what happened, the player approves their own line, and only then does it show
 * up as a career stat.
 */
import { Session } from './client.mjs';
import { assertPage, assertSchema } from './validator.mjs';

const args = Object.fromEntries(
    process.argv.slice(2).map((arg) => {
        const [key, value = 'true'] = arg.replace(/^--/, '').split('=');
        return [key, value];
    })
);

const target = args.target ?? 'mock';
const baseUrl = args['base-url'] ?? (target === 'mock' ? 'http://localhost:3000/api' : 'http://localhost:8080');

let passed = 0;
const failures = [];

async function test(name, fn) {
    try {
        await fn();
        passed++;
        console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    } catch (error) {
        failures.push({ name, error });
        console.log(`  \x1b[31m✗\x1b[0m ${name}\n    ${error.message.replace(/\n/g, '\n    ')}`);
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

const unique = () => Math.random().toString(36).slice(2, 10);

/** Signs up a fresh account and completes onboarding. */
async function newPlayer(label, { sport = 'football' } = {}) {
    const session = new Session(baseUrl, label);
    const email = `${label}-${unique()}@contract.test`;

    const signup = await session.post('/auth/signup', { email, password: 'correct-horse-battery' }, { expect: 201 });
    assertSchema('Session', signup.body, `${label} signup`);
    assert(signup.body.hasProfile === false, 'a new account has no profile yet');

    const profile = await session.put('/me/profile', {
        name: `${label[0].toUpperCase()}${label.slice(1)} Tester`,
        sports: [sport],
        skillLevel: 'Intermediate',
        locationText: 'Accra',
    }, { expect: 201 });
    assertSchema('Player', profile.body, `${label} profile`);
    assert(profile.body.careerStats.length === 0, 'a new player starts with no career stats');

    return { session, player: profile.body, email };
}

const soon = (hoursFromNow) => new Date(Date.now() + hoursFromNow * 3600_000).toISOString();

const gameInput = (overrides = {}) => ({
    title: `Contract Match ${unique()}`,
    sport: 'football',
    startsAt: soon(24),
    timezone: 'Africa/Accra',
    durationMinutes: 90,
    locationText: 'Legon Astro Turf',
    capacity: 10,
    joinPolicy: 'open',
    skillLevel: 'All Levels',
    visibility: 'public',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018',
    ...overrides,
});

async function main() {
    console.log(`\nPlayChale contract suite → ${target} (${baseUrl})\n`);

    // ---------------------------------------------------------------- reference data
    const anon = new Session(baseUrl, 'anonymous');
    let sports = [];

    await test('GET /sports returns the registry', async () => {
        const { body } = await anon.get('/sports', { expect: 200 });
        assert(Array.isArray(body) && body.length > 0, 'the registry is not empty');
        body.forEach((sport, i) => assertSchema('Sport', sport, `sports[${i}]`));
        sports = body;
        const football = body.find((s) => s.code === 'football');
        assert(football, 'football is in the registry');
        assert(football.statFields.length > 0, 'football declares stat fields');
    });

    await test('GET /auth/session is anonymous before signing in', async () => {
        const { body } = await anon.get('/auth/session', { expect: 200 });
        assertSchema('Session', body, 'anonymous session');
        assert(body.user === null && body.playerId === null, 'nobody is signed in');
    });

    // ---------------------------------------------------------------- accounts
    const host = await newPlayer('host');
    const guest = await newPlayer('guest');
    const third = await newPlayer('third');

    await test('signup + onboarding gives an account a player', async () => {
        const { body } = await host.session.get('/auth/session', { expect: 200 });
        assertSchema('Session', body, 'host session');
        assert(body.hasProfile === true, 'the host now has a profile');
        assert(body.playerId === host.player.id, 'the session points at the player record');
        assert(body.user.id !== body.playerId, 'accounts and players are separate records');
    });

    await test('handles are unique and checkable', async () => {
        const taken = await guest.session.get(`/me/handle-available?handle=${host.player.handle}`, { expect: 200 });
        assert(taken.body.available === false, "someone else's handle is not available");
        assert(taken.body.reason === 'taken', 'and says why');

        const mine = await host.session.get(`/me/handle-available?handle=${host.player.handle}`, { expect: 200 });
        assert(mine.body.available === true, 'your own handle is still yours');

        const free = await host.session.get(`/me/handle-available?handle=free_${unique()}`, { expect: 200 });
        assert(free.body.available === true, 'an unused handle is available');

        const reserved = await host.session.get('/me/handle-available?handle=admin', { expect: 200 });
        assert(reserved.body.available === false, 'reserved handles are refused');
    });

    // ---------------------------------------------------------------- hosting
    let game;

    await test('POST /games creates a game with the host confirmed', async () => {
        const { body } = await host.session.post('/games', gameInput(), { expect: 201 });
        assertSchema('Game', body, 'created game');
        assert(body.confirmedCount === 1, 'the host occupies a spot');
        assert(body.viewer.canManage === true, 'the host can manage it');
        assert(body.fee.amountMinor === 0, 'a game with no fee is free, not null');
        game = body;
    });

    await test('Idempotency-Key makes a retried create safe', async () => {
        const key = `contract-${unique()}`;
        const input = gameInput({ title: `Retried Match ${unique()}` });
        const first = await host.session.post('/games', input, { idempotencyKey: key, expect: 201 });
        const second = await host.session.post('/games', input, { idempotencyKey: key, expect: 201 });
        assert(first.body.id === second.body.id, 'the retry returns the original game instead of a duplicate');
    });

    await test('GET /games lists it, keyset-paginated', async () => {
        const { body } = await anon.get('/games?limit=2', { expect: 200 });
        assertPage('Game', body, 'games page');
        assert(body.items.length <= 2, 'the limit is respected');
        if (body.nextCursor) {
            const next = await anon.get(`/games?limit=2&cursor=${encodeURIComponent(body.nextCursor)}`, { expect: 200 });
            assertPage('Game', next.body, 'second page');
            const overlap = next.body.items.filter((g) => body.items.some((first) => first.id === g.id));
            assert(overlap.length === 0, 'pages do not repeat items');
        }
    });

    await test('a game is readable by id and by slug', async () => {
        const byId = await anon.get(`/games/${game.id}`, { expect: 200 });
        const bySlug = await anon.get(`/games/${game.slug}`, { expect: 200 });
        assertSchema('Game', byId.body, 'game by id');
        assert(byId.body.id === bySlug.body.id, 'both routes reach the same game');
        assert(Array.isArray(byId.body.participants), 'a single game carries its roster');
    });

    await test('PATCH /games only lets the host edit', async () => {
        const denied = await guest.session.patch(`/games/${game.id}`, { title: 'Hijacked' });
        assert(denied.status === 403, `a non-host gets 403, got ${denied.status}`);
        const { body } = await host.session.patch(`/games/${game.id}`, { locationText: 'Legon Astro Turf, Pitch 2' }, { expect: 200 });
        assertSchema('Game', body, 'patched game');
        assert(body.locationText.endsWith('Pitch 2'), 'the edit applied');
    });

    // ---------------------------------------------------------------- joining
    await test('joining an open game confirms immediately', async () => {
        const { body } = await guest.session.post(`/games/${game.id}/join`, undefined, { expect: 200 });
        assertSchema('Game', body, 'joined game');
        assert(body.viewer.participation.status === 'confirmed', 'an open game confirms the player');
        assert(body.confirmedCount === 2, 'the confirmed count went up');
    });

    await test('writes require a session', async () => {
        const denied = await anon.post(`/games/${game.id}/join`);
        assert(denied.status === 401, `an anonymous join is rejected, got ${denied.status}`);
        assertSchema('Error', denied.body, 'unauthenticated error');
    });

    await test('a full game puts the next player on the waitlist', async () => {
        const small = await host.session.post('/games', gameInput({ capacity: 2, title: `Tiny Match ${unique()}` }), { expect: 201 });
        await guest.session.post(`/games/${small.body.id}/join`, undefined, { expect: 200 });
        const { body } = await third.session.post(`/games/${small.body.id}/join`, undefined, { expect: 200 });
        assert(body.viewer.participation.status === 'waitlisted', 'the third player is waitlisted');
        assert(body.viewer.participation.position === 1, 'they are first in line');
        assert(body.confirmedCount === 2, 'the waitlist does not inflate the confirmed count');

        // ...and leaving promotes them
        await guest.session.del(`/games/${small.body.id}/join`, { expect: 200 });
        const after = await third.session.get(`/games/${small.body.id}`, { expect: 200 });
        assert(after.body.viewer.participation.status === 'confirmed', 'the waitlisted player is promoted');
    });

    await test('an approval game holds players as requests until the host decides', async () => {
        const gated = await host.session.post('/games', gameInput({ joinPolicy: 'approval', title: `Gated Match ${unique()}` }), { expect: 201 });
        const asked = await guest.session.post(`/games/${gated.body.id}/join`, undefined, { expect: 200 });
        assert(asked.body.viewer.participation.status === 'requested', 'the player is only requesting');
        assert(asked.body.confirmedCount === 1, 'a request does not take a spot');

        const decided = await host.session.put(
            `/games/${gated.body.id}/participants/${guest.player.id}/decision`,
            { decision: 'approve' },
            { expect: 200 }
        );
        assertSchema('Game', decided.body, 'game after approval');
        assert(decided.body.confirmedCount === 2, 'approval takes a spot');
    });

    // ---------------------------------------------------------------- payments
    await test('a paid game tracks who owes what', async () => {
        const paid = await host.session.post('/games', gameInput({
            title: `Paid Match ${unique()}`,
            fee: { amountMinor: 2500, currency: 'GHS' },
            paymentHandle: '0244000000',
        }), { expect: 201 });

        await guest.session.post(`/games/${paid.body.id}/join`, undefined, { expect: 200 });

        const lines = await host.session.get(`/games/${paid.body.id}/payments`, { expect: 200 });
        lines.body.forEach((line, i) => assertSchema('PaymentLine', line, `payments[${i}]`));
        const guestLine = lines.body.find((l) => l.playerId === guest.player.id);
        assert(guestLine, 'the player who joined has a payment line');
        assert(guestLine.status === 'owed', 'it starts as owed');
        assert(guestLine.amount.amountMinor === 2500, 'for the game fee, in minor units');

        const marked = await host.session.put(`/games/${paid.body.id}/payments/${guest.player.id}`, { status: 'confirmed' }, { expect: 200 });
        assertSchema('PaymentLine', marked.body, 'confirmed payment');
        assert(marked.body.status === 'confirmed', 'the host can confirm receipt');

        const viewer = await guest.session.get(`/games/${paid.body.id}`, { expect: 200 });
        assert(viewer.body.viewer.payment?.status === 'confirmed', "the player sees their own payment state");
    });

    // ---------------------------------------------------------------- the trust loop
    await test('only the host can report a result', async () => {
        const denied = await guest.session.put(`/games/${game.id}/results`, { resultData: { teamAScore: 9, teamBScore: 0 } });
        assert(denied.status === 403, `a player cannot report the result, got ${denied.status}`);
    });

    await test('the host reports the result and each player’s line', async () => {
        const result = await host.session.put(`/games/${game.id}/results`, {
            resultData: { teamAScore: 3, teamBScore: 1 },
        }, { expect: 200 });
        assertSchema('GameResult', result.body, 'game result');

        const stats = await host.session.put(`/games/${game.id}/player-stats`, [
            { playerId: host.player.id, stats: { goals: 2, assists: 0 }, showedUp: true, outcome: 'win' },
            { playerId: guest.player.id, stats: { goals: 1, assists: 2 }, showedUp: true, outcome: 'win' },
        ], { expect: 200 });
        stats.body.forEach((line, i) => assertSchema('PlayerGameStat', line, `playerStats[${i}]`));
        const guestLine = stats.body.find((l) => l.playerId === guest.player.id);
        assert(guestLine.approval === 'pending', 'a line about someone else waits for them');
        assert(guestLine.resultVersion === result.body.version, 'and records which result it was entered against');

        const completed = await host.session.post(`/games/${game.id}/complete`, undefined, { expect: 200 });
        assert(completed.body.status === 'completed', 'the game is completed');
    });

    await test('unapproved stats do not reach a career total', async () => {
        const { body } = await anon.get(`/players/${guest.player.handle}`, { expect: 200 });
        assertSchema('Player', body, 'guest profile before approval');
        assert(body.careerStats.length === 0, 'nothing counts before the player approves it');
    });

    await test('a host cannot certify their own stats', async () => {
        const { body } = await anon.get(`/players/${host.player.handle}`, { expect: 200 });
        assert(
            body.careerStats.length === 0,
            'the host reported this game, so their own line counts for nothing until another player approves the result'
        );
    });

    await test('the player sees the pending line and approves it', async () => {
        const pending = await guest.session.get('/me/stat-approvals', { expect: 200 });
        pending.body.forEach((approval, i) => assertSchema('StatApproval', approval, `approvals[${i}]`));
        const mine = pending.body.find((a) => a.gameId === game.id);
        assert(mine, 'the reported line is waiting for the player');
        assert(mine.stats.goals === 1, 'it carries what the host reported');

        const approved = await guest.session.put(`/games/${game.id}/player-stats/me`, { decision: 'approve' }, { expect: 200 });
        assertSchema('PlayerGameStat', approved.body, 'approved stat line');
        assert(approved.body.approval === 'approved', 'it is approved');
    });

    await test('approved stats become a career total', async () => {
        const { body } = await anon.get(`/players/${guest.player.handle}`, { expect: 200 });
        assertSchema('Player', body, 'guest profile after approval');
        const football = body.careerStats.find((s) => s.sport === 'football');
        assert(football, 'the player now has a football record');
        assert(football.gamesPlayed === 1, `one game played, got ${football.gamesPlayed}`);
        assert(football.wins === 1, `one win, got ${football.wins}`);
        assert(football.counters.goals === 1, `one goal, got ${football.counters.goals}`);
        assert(football.noShows === 0, 'no no-shows');
    });

    await test('the host’s own line counts once the game is vouched for', async () => {
        const { body } = await anon.get(`/players/${host.player.handle}`, { expect: 200 });
        const football = body.careerStats.find((s) => s.sport === 'football');
        assert(football, 'the approved result unlocks the host\'s own line too');
        assert(football.counters.goals === 2, `the host's two goals, got ${football.counters.goals}`);
    });

    await test('GET /players/{handle}/matches records the game', async () => {
        const { body } = await anon.get(`/players/${guest.player.handle}/matches`, { expect: 200 });
        assertPage('MatchRecord', body, 'match history');
        const record = body.items.find((m) => m.game.id === game.id);
        assert(record, 'the game appears in the history');
        assert(record.approval === 'approved', 'with its approval state');
        assert(record.outcome === 'win', 'and its outcome');
    });

    await test('a rejected line is left out of the totals', async () => {
        const second = await host.session.post('/games', gameInput({ title: `Disputed Match ${unique()}` }), { expect: 201 });
        await guest.session.post(`/games/${second.body.id}/join`, undefined, { expect: 200 });
        await host.session.put(`/games/${second.body.id}/results`, { resultData: { teamAScore: 5, teamBScore: 0 } }, { expect: 200 });
        await host.session.put(`/games/${second.body.id}/player-stats`, [
            { playerId: guest.player.id, stats: { goals: 99 }, showedUp: true, outcome: 'win' },
        ], { expect: 200 });
        await guest.session.put(`/games/${second.body.id}/player-stats/me`, { decision: 'reject', note: 'I scored one' }, { expect: 200 });

        const { body } = await anon.get(`/players/${guest.player.handle}`, { expect: 200 });
        const football = body.careerStats.find((s) => s.sport === 'football');
        assert(football.gamesPlayed === 1, `a disputed game is not counted, got ${football.gamesPlayed}`);
        assert(football.counters.goals === 1, `disputed goals stay out, got ${football.counters.goals}`);
    });

    await test('re-reporting a result invalidates the approval it was given against', async () => {
        const third_ = await host.session.post('/games', gameInput({ title: `Revised Match ${unique()}` }), { expect: 201 });
        await guest.session.post(`/games/${third_.body.id}/join`, undefined, { expect: 200 });
        await host.session.put(`/games/${third_.body.id}/results`, { resultData: { teamAScore: 1, teamBScore: 0 } }, { expect: 200 });
        await host.session.put(`/games/${third_.body.id}/player-stats`, [
            { playerId: guest.player.id, stats: { goals: 1 }, showedUp: true, outcome: 'win' },
        ], { expect: 200 });
        await guest.session.put(`/games/${third_.body.id}/player-stats/me`, { decision: 'approve' }, { expect: 200 });

        const before = await anon.get(`/players/${guest.player.handle}`, { expect: 200 });
        assert(before.body.careerStats[0].gamesPlayed === 2, 'the approved game counted');

        // The host changes their mind about the score
        const revised = await host.session.put(`/games/${third_.body.id}/results`, { resultData: { teamAScore: 4, teamBScore: 4 } }, { expect: 200 });
        assert(revised.body.version > 1, 'a re-report bumps the result version');

        const after = await anon.get(`/players/${guest.player.handle}`, { expect: 200 });
        assert(
            after.body.careerStats[0].gamesPlayed === 1,
            `an approval given against an older result stops counting, got ${after.body.careerStats[0].gamesPlayed}`
        );
    });

    // ---------------------------------------------------------------- my games
    await test('GET /me/games separates hosting from playing', async () => {
        const { body } = await guest.session.get('/me/games', { expect: 200 });
        assert(Array.isArray(body.hosted) && Array.isArray(body.joined), 'hosted and joined are both present');
        body.hosted.forEach((g, i) => assertSchema('Game', g, `hosted[${i}]`));
        body.joined.forEach((g, i) => assertSchema('Game', g, `joined[${i}]`));
        assert(body.joined.some((g) => g.id === game.id), 'the game the player joined is listed');
        assert(!body.hosted.some((g) => g.id === game.id), 'and is not listed as hosted');
    });

    await test('logging out ends the session', async () => {
        const session = new Session(baseUrl, 'logout');
        await session.post('/auth/signup', { email: `logout-${unique()}@contract.test`, password: 'correct-horse-battery' }, { expect: 201 });
        await session.post('/auth/logout', undefined, { expect: 204 });
        const { body } = await session.get('/auth/session', { expect: 200 });
        assert(body.user === null, 'the session is gone');
    });

    // ---------------------------------------------------------------- report
    console.log(`\n${passed} passed, ${failures.length} failed\n`);
    if (failures.length > 0) process.exit(1);
}

main().catch((error) => {
    console.error(`\nThe suite could not run: ${error.message}\n`);
    process.exit(1);
});
