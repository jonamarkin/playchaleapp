'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    let isMounted = true;

    const registerServiceWorker = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          if (!isMounted) return;

          registration.update();
        })
        .catch((error) => {
          console.warn('PlayChale service worker registration failed:', error);
        });
    };

    if (document.readyState === 'complete') {
      registerServiceWorker();
    } else {
      window.addEventListener('load', registerServiceWorker);
    }

    return () => {
      isMounted = false;
      window.removeEventListener('load', registerServiceWorker);
    };
  }, []);

  return null;
}
