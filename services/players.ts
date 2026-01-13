/**
 * Players service - handles all player-related API calls
 * Currently uses mock data but structured for easy API integration
 */

import { api, type ApiResponse } from './api';
import { PlayerProfile } from '@/types';
import { TOP_PLAYERS } from '@/constants';

const ENDPOINTS = {
    players: '/api/players',
    player: (id: string) => `/api/players/${id}`,
    profile: '/api/profile',
    updateProfile: '/api/profile',
};

/**
 * Fetch all players
 */
export async function getPlayers(): Promise<ApiResponse<PlayerProfile[]>> {
    // TODO: Replace with actual API call
    // return api.get<PlayerProfile[]>(ENDPOINTS.players);

    return {
        data: TOP_PLAYERS,
        error: null,
        status: 200,
    };
}

/**
 * Fetch a single player by ID
 */
export async function getPlayer(id: string): Promise<ApiResponse<PlayerProfile>> {
    // TODO: Replace with actual API call
    // return api.get<PlayerProfile>(ENDPOINTS.player(id));

    const player = TOP_PLAYERS.find((p) => p.id === id);
    return {
        data: player || null,
        error: player ? null : 'Player not found',
        status: player ? 200 : 404,
    };
}

/**
 * Get current user's profile
 */
export async function getCurrentProfile(): Promise<ApiResponse<PlayerProfile>> {
    // TODO: Replace with actual API call
    // return api.get<PlayerProfile>(ENDPOINTS.profile);

    return {
        data: TOP_PLAYERS[0],
        error: null,
        status: 200,
    };
}

/**
 * Update current user's profile
 */
export async function updateProfile(
    profileData: Partial<PlayerProfile>
): Promise<ApiResponse<PlayerProfile>> {
    // TODO: Replace with actual API call
    // return api.patch<PlayerProfile>(ENDPOINTS.updateProfile, profileData);

    const updatedProfile = {
        ...TOP_PLAYERS[0],
        ...profileData,
    };

    return {
        data: updatedProfile,
        error: null,
        status: 200,
    };
}

/**
 * Search players by name or sport
 */
export function searchPlayers(
    players: PlayerProfile[],
    query: string
): PlayerProfile[] {
    const lowerQuery = query.toLowerCase();
    return players.filter(
        (player) =>
            player.name.toLowerCase().includes(lowerQuery) ||
            player.mainSport.toLowerCase().includes(lowerQuery)
    );
}
