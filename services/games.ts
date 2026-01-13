/**
 * Games service - handles all game-related API calls
 * Currently uses mock data but structured for easy API integration
 */

import { api, type ApiResponse } from './api';
import { Game } from '@/types';
import { GAMES } from '@/constants';

const ENDPOINTS = {
    games: '/api/games',
    game: (id: string) => `/api/games/${id}`,
    join: (id: string) => `/api/games/${id}/join`,
    create: '/api/games',
};

/**
 * Fetch all games
 * Currently returns mock data, ready for API integration
 */
export async function getGames(): Promise<ApiResponse<Game[]>> {
    // TODO: Replace with actual API call when backend is ready
    // return api.get<Game[]>(ENDPOINTS.games);

    // Mock implementation
    return {
        data: GAMES,
        error: null,
        status: 200,
    };
}

/**
 * Fetch a single game by ID
 */
export async function getGame(id: string): Promise<ApiResponse<Game>> {
    // TODO: Replace with actual API call
    // return api.get<Game>(ENDPOINTS.game(id));

    const game = GAMES.find((g) => g.id === id);
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
    // TODO: Replace with actual API call
    // return api.post<Game>(ENDPOINTS.create, gameData);

    const newGame: Game = {
        ...gameData,
        id: `g${Date.now()}`,
    };

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
    // TODO: Replace with actual API call
    // return api.post<{ success: boolean }>(ENDPOINTS.join(gameId), {});

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
