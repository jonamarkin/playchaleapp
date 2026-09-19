'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/browser';
import type { Game, GameInput, GameUpdate } from '@/lib/api/types';
import { gameKeys, gameQuery, gamesListQuery, myGamesQuery } from './queries';

export function useGames(sport?: string) {
    return useInfiniteQuery({
        ...gamesListQuery(api, sport),
        // Flatten pages for components that render a simple list
        select: (data) => data.pages.flatMap((page) => page.items),
    });
}

export function useGame(idOrSlug: string) {
    return useQuery(gameQuery(api, idOrSlug));
}

export function useMyGames(enabled = true) {
    return useQuery({ ...myGamesQuery(api), enabled });
}

export function useCreateGame() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: GameInput) => api.games.create(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
            queryClient.invalidateQueries({ queryKey: gameKeys.mine() });
        },
    });
}

/**
 * Writes return the updated game, so every mutation seeds the detail cache with the
 * server's version rather than guessing at the new state locally.
 */
function useGameMutation<TInput>(mutationFn: (input: TInput) => Promise<Game>) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn,
        onSuccess: (game) => {
            queryClient.setQueryData(gameKeys.detail(game.id), game);
            if (game.slug) queryClient.setQueryData(gameKeys.detail(game.slug), game);
            queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
            queryClient.invalidateQueries({ queryKey: gameKeys.mine() });
        },
    });
}

export function useUpdateGame(gameId: string) {
    return useGameMutation((input: GameUpdate) => api.games.update(gameId, input));
}

export function useCancelGame(gameId: string) {
    return useGameMutation((reason?: string) => api.games.cancel(gameId, reason));
}

export function useLeaveGame(gameId: string) {
    return useGameMutation(() => api.games.leave(gameId));
}

/** Host approving or declining someone who asked to join. */
export function useDecideParticipant(gameId: string) {
    return useGameMutation(({ playerId, decision }: { playerId: string; decision: 'approve' | 'decline' }) =>
        api.games.decideParticipant(gameId, playerId, decision)
    );
}

export function useRemoveParticipant(gameId: string) {
    return useGameMutation((playerId: string) => api.games.removeParticipant(gameId, playerId));
}

export function useJoinGame() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (gameId: string) => api.games.join(gameId),
        onSuccess: (game) => {
            queryClient.setQueryData(gameKeys.detail(game.id), game);
            if (game.slug) queryClient.setQueryData(gameKeys.detail(game.slug), game);
            queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
            queryClient.invalidateQueries({ queryKey: gameKeys.mine() });
        },
    });
}

export function useCompleteGame() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (gameId: string) => api.games.complete(gameId),
        onSuccess: (game) => {
            queryClient.setQueryData(gameKeys.detail(game.id), game);
            if (game.slug) queryClient.setQueryData(gameKeys.detail(game.slug), game);
            queryClient.invalidateQueries({ queryKey: gameKeys.mine() });
        },
    });
}
