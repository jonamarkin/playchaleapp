import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { MotionProvider } from '@/providers/MotionProvider';
import { SessionProvider } from '@/features/auth/session';
import { getSession } from '@/lib/api/server';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  // Without this only upright faces load and every `italic` in the app is a browser-
  // synthesised slant rather than Inter's drawn italic.
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'PlayChale | Pro-Grade Amateur Sports',
  description: 'The professional-grade social engine for the amateur elite. Organize, compete, and record your legacy.',
  keywords: ['sports', 'amateur sports', 'football', 'basketball', 'tennis', 'padel', 'community'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PlayChale',
  },
  icons: {
    icon: [
      { url: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#C6FF00',
  width: 'device-width',
  initialScale: 1,
  // Pinch zoom stays enabled: blocking it fails WCAG 1.4.4, and this app has a lot of small type.
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    // data-scroll-behavior lets Next disable smooth scrolling during route changes
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body className="font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-tooltip focus:rounded-pill focus:bg-ink-900 focus:px-6 focus:py-3 focus:text-eyebrow focus:font-black focus:uppercase focus:text-lime-500"
        >
          Skip to content
        </a>
        <QueryProvider>
          <SessionProvider session={session}>
            <MotionProvider>{children}</MotionProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
