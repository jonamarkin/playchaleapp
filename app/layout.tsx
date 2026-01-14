import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PlayChaleProvider } from '@/providers/PlayChaleProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'PlayChale | Pro-Grade Amateur Sports',
  description: 'The professional-grade social engine for the amateur elite. Organize, compete, and record your legacy.',
  keywords: ['sports', 'amateur sports', 'football', 'basketball', 'tennis', 'padel', 'community'],
};

import { QueryProvider } from '@/providers/QueryProvider';

// ...

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <QueryProvider>
          <PlayChaleProvider>
            {children}
          </PlayChaleProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
