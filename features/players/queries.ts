import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import type { Api } from '@/lib/api/client';

export const PLAYERS_PAGE_SIZE = 12;

export const playerKeys = {
    all: ['players'] as const,
    list: () => [...playerKeys.all, 'list'] as const,
    detail: (idOrSlug: string) => [...playerKeys.all, 'detail', idOrSlug] as const,
    me: () => ['me', 'profile'] as const,
};

export const playersListQuery = (client: Api) =>
    infiniteQueryOptions({
        queryKey: playerKeys.list(),
        queryFn: ({ pageParam }) => client.players.list({ cursor: pageParam, limit: PLAYERS_PAGE_SIZE }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

export const playerQuery = (client: Api, idOrSlug: string) =>
    queryOptions({
        queryKey: playerKeys.detail(idOrSlug),
        queryFn: () => client.players.get(idOrSlug),
    });

export const myProfileQuery = (client: Api) =>
    queryOptions({
        queryKey: playerKeys.me(),
        queryFn: () => client.me.profile(),
    });
