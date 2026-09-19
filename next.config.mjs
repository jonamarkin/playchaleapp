import withSerwistInit from '@serwist/next';

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

// Replaces next-pwa, which is a webpack plugin and so produced no service worker at all
// under Next 16's Turbopack build — while the manifest, icons and offline page all
// claimed otherwise. Caching strategy lives in app/sw.ts.
const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  reloadOnOnline: true,
  // The offline fallback must be in the precache, or there is nothing to serve offline
  additionalPrecacheEntries: [{ url: '/offline.html', revision: '1' }],
});

export default withSerwist(nextConfig);
