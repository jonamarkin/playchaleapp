
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Serve modern formats; Next falls back to the original for browsers without support
    formats: ['image/avif', 'image/webp'],
    // Disable image optimization in development for faster compile times
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**',
      },
    ],
    // Limit the device sizes to reduce processing
    deviceSizes: [640, 750, 1080, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};

/**
 * Service worker (production builds only).
 *
 * Serwist replaces next-pwa, which was a webpack plugin and so emitted no service worker at
 * all under Next 16's Turbopack build, while the manifest, icons and offline page all claimed
 * otherwise. Serwist is a webpack plugin too, hence `next build --webpack` in package.json.
 *
 * It is imported lazily so that `next dev` (Turbopack) never loads it: importing it there adds
 * a webpack config Turbopack can't use — the "Turbopack with a webpack config" error — and
 * prints a Turbopack incompatibility warning. No service worker is built in dev anyway.
 */
export default process.env.NODE_ENV === 'production'
  ? (await import('@serwist/next')).default({
    swSrc: 'app/sw.ts',
    swDest: 'public/sw.js',
    reloadOnOnline: true,
    // The offline fallback must be in the precache, or there is nothing to serve offline
    additionalPrecacheEntries: [{ url: '/offline.html', revision: '1' }],
  })(nextConfig)
  : nextConfig;
