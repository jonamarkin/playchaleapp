'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/browser';
import type { CreateGameInput } from '@/lib/api/types';
import { gameKeys, gameQuery, gamesListQuery, myGamesQuery } from './queries';

export function useGames(sport = 'All') {
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
        mutationFn: (input: CreateGameInput) => api.games.create(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
            queryClient.invalidateQueries({ queryKey: gameKeys.mine() });
        },
    });
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
