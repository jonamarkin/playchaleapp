import type { Sport } from '@/lib/api/types';

/**
 * The sports registry, served by GET /sports.
 *
 * In the Go service this is a table: adding a sport is a row, not a deploy, and the frontend
 * renders result/stat entry from whatever it returns. Codes are stable identifiers; names are
 * display text.
 */
export const SPORTS: Sport[] = [
    {
        code: 'football',
        name: 'Football',
        isTeamSport: true,
        defaultCapacity: 10,
        approvalThreshold: 0.5,
        resultFields: [
            { key: 'teamAScore', label: 'Team A', type: 'number' },
            { key: 'teamBScore', label: 'Team B', type: 'number' },
        ],
        statFields: [
            { key: 'goals', label: 'Goals', type: 'number' },
            { key: 'assists', label: 'Assists', type: 'number' },
            { key: 'cleanSheet', label: 'Clean sheet', type: 'boolean' },
        ],
    },
    {
        code: 'basketball',
        name: 'Basketball',
        isTeamSport: true,
        defaultCapacity: 10,
        approvalThreshold: 0.5,
        resultFields: [
            { key: 'teamAScore', label: 'Team A', type: 'number' },
            { key: 'teamBScore', label: 'Team B', type: 'number' },
        ],
        statFields: [
            { key: 'points', label: 'Points', type: 'number' },
            { key: 'rebounds', label: 'Rebounds', type: 'number' },
            { key: 'assists', label: 'Assists', type: 'number' },
        ],
    },
    {
        code: 'tennis',
        name: 'Tennis',
        isTeamSport: false,
        defaultCapacity: 2,
        // Singles: both players must agree before a result counts.
        approvalThreshold: 1,
        resultFields: [
            { key: 'playerASets', label: 'Player A sets', type: 'number' },
            { key: 'playerBSets', label: 'Player B sets', type: 'number' },
        ],
        statFields: [
            { key: 'setsWon', label: 'Sets won', type: 'number' },
            { key: 'gamesWon', label: 'Games won', type: 'number' },
            { key: 'won', label: 'Won the match', type: 'boolean' },
        ],
    },
    {
        code: 'padel',
        name: 'Padel',
        isTeamSport: true,
        defaultCapacity: 4,
        approvalThreshold: 1,
        resultFields: [
            { key: 'teamASets', label: 'Team A sets', type: 'number' },
            { key: 'teamBSets', label: 'Team B sets', type: 'number' },
        ],
        statFields: [
            { key: 'setsWon', label: 'Sets won', type: 'number' },
            { key: 'gamesWon', label: 'Games won', type: 'number' },
            { key: 'won', label: 'Won the match', type: 'boolean' },
        ],
    },
    {
        code: 'volleyball',
        name: 'Volleyball',
        isTeamSport: true,
        defaultCapacity: 12,
        approvalThreshold: 0.5,
        resultFields: [
            { key: 'teamASets', label: 'Team A sets', type: 'number' },
            { key: 'teamBSets', label: 'Team B sets', type: 'number' },
        ],
        statFields: [
            { key: 'points', label: 'Points', type: 'number' },
            { key: 'aces', label: 'Aces', type: 'number' },
            { key: 'blocks', label: 'Blocks', type: 'number' },
        ],
    },
    {
        code: 'badminton',
        name: 'Badminton',
        isTeamSport: false,
        defaultCapacity: 2,
        approvalThreshold: 1,
        resultFields: [
            { key: 'playerASets', label: 'Player A sets', type: 'number' },
            { key: 'playerBSets', label: 'Player B sets', type: 'number' },
        ],
        statFields: [
            { key: 'setsWon', label: 'Sets won', type: 'number' },
            { key: 'pointsWon', label: 'Points won', type: 'number' },
            { key: 'won', label: 'Won the match', type: 'boolean' },
        ],
    },
];

export const sportByCode = (code: string) => SPORTS.find((s) => s.code === code);

/** Display name for a code, falling back to the code itself for unknown sports. */
export const sportName = (code: string) => sportByCode(code)?.name ?? code;
