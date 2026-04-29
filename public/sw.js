const CACHE_VERSION = 'playchale-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const API_CACHE = `${CACHE_VERSION}-api`;

const PRECACHE_URLS = [
  '/offline.html',
  '/manifest.json',
  '/favicon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

const IMAGE_HOSTS = new Set([
  'images.unsplash.com',
  'i.pravatar.cc'
]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const expectedCaches = new Set([STATIC_CACHE, PAGE_CACHE, IMAGE_CACHE, API_CACHE]);

  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('playchale-') && !expectedCaches.has(key))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (url.origin === self.location.origin && url.pathname.startsWith('/api/') && !request.headers.has('authorization')) {
    event.respondWith(networkFirst(request, API_CACHE, 4000));
    return;
  }

  if (url.origin === self.location.origin && url.pathname.startsWith('/_next/static/')) {
    event.respondWith(networkFirst(request, STATIC_CACHE, 2500));
    return;
  }

  if (isStaticAsset(url) || IMAGE_HOSTS.has(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE, 80));
    return;
  }
});

async function networkFirstPage(request) {
  const pageCache = await caches.open(PAGE_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      pageCache.put(request, response.clone());
    }
    return response;
  } catch {
    const cachedPage = await pageCache.match(request);
    return cachedPage || caches.match('/offline.html');
  }
}

async function networkFirst(request, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkRequest = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    });

  if (!cached) {
    return networkRequest;
  }

  try {
    return await promiseWithTimeout(networkRequest, timeoutMs);
  } catch {
    return cached;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const refresh = fetch(request)
    .then(async (response) => {
      if (response.ok || response.type === 'opaque') {
        await cache.put(request, response.clone());
        trimCache(cacheName, maxEntries);
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) return cached;

  const response = await refresh;
  return response || Response.error();
}

function promiseWithTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), timeoutMs);
    })
  ]);
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const overflow = keys.length - maxEntries;

  if (overflow <= 0) return;

  await Promise.all(keys.slice(0, overflow).map((key) => cache.delete(key)));
}

function isStaticAsset(url) {
  if (url.origin !== self.location.origin) return false;
  return /\.(?:css|js|woff2?|png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname);
}
