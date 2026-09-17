import { QueryClient, defaultShouldDehydrateQuery, isServer } from '@tanstack/react-query';

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Data prefetched on the server stays fresh for a minute instead of refetching on hydrate
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
            },
            dehydrate: {
                // Also hand pending prefetches to the client (streaming)
                shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined;

/** A fresh client per server request; one shared client in the browser */
export function getQueryClient() {
    if (isServer) return makeQueryClient();
    browserQueryClient ??= makeQueryClient();
    return browserQueryClient;
}
