
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import * as mockDb from '@/lib/mock/db';
import { Game } from '@/types';

// Data currently comes from the in-browser mock backend (lib/mock/db.ts).
// When the real API lands, swap the mockDb calls below for API requests.

// --- Keys ---
export const QUERY_KEYS = {
    games: ['games'],
    game: (slugOrId: string) => ['game', slugOrId],
    myGames: (userId: string) => ['myGames', userId],
    players: ['players'],
    profile: (userId: string) => ['profile', userId],
    stats: (userId: string) => ['stats', userId],
    gameResults: (gameId: string) => ['gameResults', gameId],
    pendingApprovals: (userId: string) => ['pendingApprovals', userId],
};

const PLAYERS_PAGE_SIZE = 12;

// --- Games & Players ---

export const useGames = () => {
    return useQuery({
        queryKey: QUERY_KEYS.games,
        queryFn: mockDb.listPublicGames,
    });
};

export const useGame = (slugOrId: string | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.game(slugOrId || ''),
        queryFn: () => mockDb.getGame(slugOrId!),
        enabled: !!slugOrId,
    });
};

export const usePlayers = () => {
    return useQuery({
        queryKey: QUERY_KEYS.players,
        queryFn: mockDb.listPlayers,
    });
};

export const useInfinitePlayers = () => {
    return useInfiniteQuery({
        queryKey: ['players', 'infinite'],
        queryFn: ({ pageParam }) => mockDb.listPlayersPage(pageParam, PLAYERS_PAGE_SIZE),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === PLAYERS_PAGE_SIZE ? allPages.length : undefined;
        },
    });
};

export const useProfile = (userId: string | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.profile(userId || ''),
        queryFn: () => mockDb.getProfile(userId!),
        enabled: !!userId,
    });
};

export const useCreateGame = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ game, userId }: { game: Partial<Game>, userId: string }) => mockDb.createGame(game, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games });
            queryClient.invalidateQueries({ queryKey: ['myGames'] });
        },
    });
};

export const useJoinGame = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ gameId, userId }: { gameId: string, userId: string }) => mockDb.joinGame(gameId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games });
            queryClient.invalidateQueries({ queryKey: ['game'] });
            queryClient.invalidateQueries({ queryKey: ['myGames'] });
        },
    });
};

// --- My Games (Hosted + Joined) ---

export const useMyGames = (userId: string | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.myGames(userId || ''),
        queryFn: () => mockDb.listMyGames(userId!),
        enabled: !!userId,
    });
};

// --- Game Results & Stats ---

interface GameResultInput {
    gameId: string;
    resultData: Record<string, any>;
    approvalThreshold: number;
}

interface PlayerStatsInput {
    gameId: string;
    userId: string;
    stats: Record<string, any>;
    showedUp: boolean;
}

export const useGameResults = (gameId: string | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.gameResults(gameId || ''),
        queryFn: () => mockDb.getGameResults(gameId!),
        enabled: !!gameId,
    });
};

export const usePendingApprovals = (userId: string | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.pendingApprovals(userId || ''),
        queryFn: () => mockDb.listPendingApprovals(userId!),
        enabled: !!userId,
    });
};

// Submit game results (host only)
export const useSubmitGameResults = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ input, userId }: { input: GameResultInput, userId: string }) =>
            mockDb.submitGameResults(input, userId),
        onSuccess: (_, { input }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameResults(input.gameId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games });
        },
    });
};

// Submit individual player stats (host only)
export const useSubmitPlayerStats = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (stats: PlayerStatsInput[]) => mockDb.submitPlayerStats(stats),
        onSuccess: (_, stats) => {
            if (stats[0]) {
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameResults(stats[0].gameId) });
            }
            queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
        },
    });
};

// Approve/reject stats (player)
export const useApproveStats = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ gameId, userId, approved }: { gameId: string, userId: string, approved: boolean }) =>
            mockDb.approveStats(gameId, userId, approved),
        onSuccess: (_, { gameId, userId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameResults(gameId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingApprovals(userId) });
        },
    });
};

// Vote for MVP
export const useVoteForMVP = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ gameId, voterId, votedForId }: { gameId: string, voterId: string, votedForId: string }) =>
            mockDb.voteForMVP(gameId, voterId, votedForId),
        onSuccess: (_, { gameId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameResults(gameId) });
        },
    });
};

// Mark game as complete
export const useCompleteGame = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (gameId: string) => mockDb.completeGame(gameId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games });
            queryClient.invalidateQueries({ queryKey: ['game'] });
            queryClient.invalidateQueries({ queryKey: ['myGames'] });
        },
    });
};
