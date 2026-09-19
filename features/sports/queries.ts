import { queryOptions } from '@tanstack/react-query';
import type { Api } from '@/lib/api/client';

export const sportKeys = {
    all: ['sports'] as const,
};

/**
 * The registry changes about as often as a deploy, so it is cached for the session and
 * every form that needs sport names, capacities or stat fields reads it from here.
 */
export const sportsQuery = (client: Api) =>
    queryOptions({
        queryKey: sportKeys.all,
        queryFn: () => client.sports.list(),
        staleTime: 60 * 60 * 1000,
    });
