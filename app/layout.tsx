import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'PlayChale | Pro-Grade Amateur Sports',
  description: 'Find local games, organize matches, and track your amateur sports progress with PlayChale.',
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
};

const onboardingCacheRecoveryScript = `
(function () {
  try {
    if (window.location.pathname !== '/onboarding') return;
    document.documentElement.style.background = '#000';
    if (document.body) document.body.style.background = '#000';

    var reloadKey = 'playchale.cache.recovered.v3';
    if (sessionStorage.getItem(reloadKey)) return;

    var cacheCleanup = 'caches' in window
      ? caches.keys().then(function (keys) {
        return Promise.all(keys
          .filter(function (key) {
            return key.indexOf('playchale-') === 0;
          })
          .map(function (key) {
            return caches.delete(key);
          }));
      })
      : Promise.resolve([]);

    var workerCleanup = 'serviceWorker' in navigator
      ? navigator.serviceWorker.getRegistrations().then(function (registrations) {
        return Promise.all(registrations.map(function (registration) {
          return registration.unregister();
        }));
      })
      : Promise.resolve([]);

    Promise.all([cacheCleanup, workerCleanup]).then(function (results) {
      var deletedCaches = results[0] || [];
      var removedWorkers = results[1] || [];
      var didClean = deletedCaches.some(Boolean) || removedWorkers.some(Boolean);

      if (!didClean) return;

      sessionStorage.setItem(reloadKey, 'true');
      window.location.reload();
    });
  } catch (error) {
    console.warn('PlayChale cache recovery skipped:', error);
  }
})();
`.trim();

const onboardingStaticFallback = `
  <div id="playchale-static-onboarding" role="status" aria-live="polite" style="position:fixed;inset:0;z-index:1000;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Inter,system-ui,sans-serif;text-align:center;">
    <div style="max-width:420px;">
      <div style="width:56px;height:56px;margin:0 auto 24px;border-radius:18px;background:#C6FF00;color:#000;display:flex;align-items:center;justify-content:center;font-weight:900;font-style:italic;">PC</div>
      <p style="margin:0 0 16px;color:#C6FF00;font-size:10px;font-weight:900;letter-spacing:.35em;text-transform:uppercase;">Player setup</p>
      <h1 style="margin:0;font-size:42px;line-height:.9;font-weight:900;font-style:italic;text-transform:uppercase;letter-spacing:0;">Select your disciplines.</h1>
      <p style="margin:18px 0 0;color:rgba(255,255,255,.48);font-size:12px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;">Preparing your setup</p>
    </div>
  </div>
`.trim();

const onboardingStaticFallbackScript = `
(function () {
  try {
    if (window.location.pathname !== '/onboarding') return;
    if (document.getElementById('playchale-static-onboarding')) return;

    var fallbackMarkup = ${JSON.stringify(onboardingStaticFallback)};
    var marker = document.currentScript;

    if (marker && marker.insertAdjacentHTML) {
      marker.insertAdjacentHTML('afterend', fallbackMarkup);
      return;
    }

    document.addEventListener('DOMContentLoaded', function () {
      if (!document.getElementById('playchale-static-onboarding')) {
        document.body.insertAdjacentHTML('afterbegin', fallbackMarkup);
      }
    });
  } catch (error) {
    console.warn('PlayChale static onboarding fallback skipped:', error);
  }
})();
`.trim();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: onboardingCacheRecoveryScript,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: onboardingStaticFallbackScript,
          }}
        />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
