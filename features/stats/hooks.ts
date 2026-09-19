'use client';

import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/browser';
import type { Api } from '@/lib/api/client';
import type { PlayerStatInput, ResultInput } from '@/lib/api/types';

export const statsKeys = {
    results: (gameId: string) => ['games', 'results', gameId] as const,
    approvals: () => ['me', 'stat-approvals'] as const,
};

export const gameResultsQuery = (client: Api, gameId: string) =>
    queryOptions({ queryKey: statsKeys.results(gameId), queryFn: () => client.games.results(gameId) });

export function useGameResults(gameId: string) {
    return useQuery(gameResultsQuery(api, gameId));
}

export function usePendingApprovals(enabled = true) {
    return useQuery({ queryKey: statsKeys.approvals(), queryFn: () => api.me.statApprovals(), enabled });
}

export function useSubmitGameResults() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ gameId, input }: { gameId: string; input: ResultInput }) =>
            api.games.submitResult(gameId, input),
        onSuccess: (_, { gameId }) => queryClient.invalidateQueries({ queryKey: statsKeys.results(gameId) }),
    });
}

export function useSubmitPlayerStats() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ gameId, stats }: { gameId: string; stats: PlayerStatInput[] }) =>
            api.games.submitPlayerStats(gameId, stats),
        onSuccess: (_, { gameId }) => {
            queryClient.invalidateQueries({ queryKey: statsKeys.results(gameId) });
            queryClient.invalidateQueries({ queryKey: statsKeys.approvals() });
        },
    });
}

export function useReviewMyStats() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ gameId, decision, note }: { gameId: string; decision: 'approve' | 'reject'; note?: string }) =>
            api.games.reviewMyStats(gameId, decision, note),
        onSuccess: (_, { gameId }) => {
            queryClient.invalidateQueries({ queryKey: statsKeys.results(gameId) });
            queryClient.invalidateQueries({ queryKey: statsKeys.approvals() });
        },
    });
}

export function useVoteForMVP() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ gameId, votedForId }: { gameId: string; votedForId: string }) => api.games.voteMvp(gameId, votedForId),
        onSuccess: (_, { gameId }) => queryClient.invalidateQueries({ queryKey: statsKeys.results(gameId) }),
    });
}
