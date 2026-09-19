import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import type { Api } from '@/lib/api/client';

/*
 * Query option factories take the API client, so Server Components can prefetch
 * with serverApi and the hooks in ./hooks.ts read the same cache keys with the browser api.
 */

export const gameKeys = {
    all: ['games'] as const,
    lists: () => [...gameKeys.all, 'list'] as const,
    list: (sport?: string) => [...gameKeys.lists(), { sport: sport ?? 'all' }] as const,
    detail: (idOrSlug: string) => [...gameKeys.all, 'detail', idOrSlug] as const,
    mine: () => ['me', 'games'] as const,
};

/** `sport` is a code from the registry; omit it for every sport. No sentinel values reach the API. */
export const gamesListQuery = (client: Api, sport?: string) =>
    infiniteQueryOptions({
        queryKey: gameKeys.list(sport),
        queryFn: ({ pageParam }) => client.games.list({ cursor: pageParam, ...(sport ? { sport } : {}) }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

export const gameQuery = (client: Api, idOrSlug: string) =>
    queryOptions({
        queryKey: gameKeys.detail(idOrSlug),
        queryFn: () => client.games.get(idOrSlug),
    });

export const myGamesQuery = (client: Api) =>
    queryOptions({
        queryKey: gameKeys.mine(),
        queryFn: () => client.me.games(),
    });
