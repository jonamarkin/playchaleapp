/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { CacheFirst, ExpirationPlugin, NetworkFirst, NetworkOnly, Serwist } from 'serwist';

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
        // Never cache auth or writes. A stale session or a replayed join is worse than an error.
        {
            matcher: ({ url, request }) => url.pathname.startsWith('/api/auth') || request.method !== 'GET',
            handler: new NetworkOnly(),
        },
        // Lists and profiles: try the network briefly, fall back to the last copy.
        // On a failing mobile connection this shows yesterday's games instead of a spinner.
        {
            matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/api/'),
            handler: new NetworkFirst({
                cacheName: 'api',
                networkTimeoutSeconds: 5,
                plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 })],
            }),
        },
        // Remote photography is immutable once fetched.
        {
            matcher: ({ url }) => url.hostname === 'images.unsplash.com' || url.hostname === 'i.pravatar.cc',
            handler: new CacheFirst({
                cacheName: 'remote-images',
                plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 })],
            }),
        },
        ...defaultCache,
    ],
    fallbacks: {
        entries: [
            {
                // A static file, not an app route: the root layout reads cookies, so every
                // route is dynamic and cannot be precached as HTML for offline use.
                url: '/offline.html',
                matcher: ({ request }) => request.destination === 'document',
            },
        ],
    },
});

serwist.addEventListeners();
