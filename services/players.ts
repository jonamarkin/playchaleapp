/**
 * Players service - handles all player-related API calls
 * Currently uses mock data but structured for easy API integration
 */

import { type ApiResponse } from './api';
import { backend } from './backend';
import { PlayerProfile } from '@/types';

/**
 * Fetch all players
 */
export async function getPlayers(): Promise<ApiResponse<PlayerProfile[]>> {
    const players = await backend.players.list(24);
    return {
        data: players,
        error: null,
        status: 200,
    };
}

/**
 * Fetch a single player by ID
 */
export async function getPlayer(id: string): Promise<ApiResponse<PlayerProfile>> {
    const player = await backend.players.get(id);
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
    const session = await backend.auth.getSession();
    const profile = session.user ? await backend.players.get(session.user.id) : null;

    return {
        data: profile,
        error: profile ? null : 'Profile not found',
        status: profile ? 200 : 404,
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

    const current = await getCurrentProfile();
    const updatedProfile = current.data ? { ...current.data, ...profileData } : null;

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
