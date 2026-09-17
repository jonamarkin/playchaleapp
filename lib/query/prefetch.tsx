import 'server-only';

import { dehydrate, HydrationBoundary, type QueryClient } from '@tanstack/react-query';
import { getQueryClient } from './client';

/**
 * Runs the given prefetches on a request-scoped QueryClient and renders children
 * with that data hydrated, so client hooks using the same query keys render
 * instantly on first paint instead of showing a loading state.
 */
export async function Prefetch({
    queries,
    children,
}: {
    queries: (queryClient: QueryClient) => Promise<unknown>[];
    children: React.ReactNode;
}) {
    const queryClient = getQueryClient();
    await Promise.all(queries(queryClient));
    return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
