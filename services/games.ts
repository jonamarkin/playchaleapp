/**
 * Games service - handles all game-related API calls
 * Currently uses mock data but structured for easy API integration
 */

import { type ApiResponse } from './api';
import { backend } from './backend';
import { Game } from '@/types';

/**
 * Fetch all games
 * Currently returns mock data, ready for API integration
 */
export async function getGames(): Promise<ApiResponse<Game[]>> {
    const games = await backend.games.list();
    return {
        data: games,
        error: null,
        status: 200,
    };
}

/**
 * Fetch a single game by ID
 */
export async function getGame(id: string): Promise<ApiResponse<Game>> {
    const game = await backend.games.get(id);
    return {
        data: game || null,
        error: game ? null : 'Game not found',
        status: game ? 200 : 404,
    };
}

/**
 * Create a new game
 */
export async function createGame(
    gameData: Omit<Game, 'id'>
): Promise<ApiResponse<Game>> {
    const session = await backend.auth.getSession();
    const id = await backend.games.create(gameData, session.user?.id || 'p1');
    const newGame = await backend.games.get(id);

    return {
        data: newGame,
        error: null,
        status: 201,
    };
}

/**
 * Request to join a game
 */
export async function joinGame(gameId: string): Promise<ApiResponse<{ success: boolean }>> {
    const session = await backend.auth.getSession();
    await backend.games.join(gameId, session.user?.id || 'p1');

    return {
        data: { success: true },
        error: null,
        status: 200,
    };
}

/**
 * Filter games by criteria
 */
export function filterGames(
    games: Game[],
    filters: {
        sport?: string;
        skillLevel?: string;
        priceType?: 'free' | 'paid' | 'all';
        searchQuery?: string;
    }
): Game[] {
    return games.filter((game) => {
        const matchesSport = !filters.sport || filters.sport === 'All' || game.sport === filters.sport;
        const matchesSkill = !filters.skillLevel || filters.skillLevel === 'All Levels' || game.skillLevel === filters.skillLevel;
        const matchesPrice =
            !filters.priceType ||
            filters.priceType === 'all' ||
            (filters.priceType === 'free' && game.price.toLowerCase() === 'free') ||
            (filters.priceType === 'paid' && game.price.toLowerCase() !== 'free');
        const matchesSearch =
            !filters.searchQuery ||
            game.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
            game.location.toLowerCase().includes(filters.searchQuery.toLowerCase());

        return matchesSport && matchesSkill && matchesPrice && matchesSearch;
    });
}
