'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Onboarding route failed:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="pc-view-enter max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/5 shadow-2xl">
          <span className="rounded-2xl bg-[#C6FF00] px-3 py-2 text-sm font-black italic text-black">PC</span>
        </div>
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C6FF00]">Setup interrupted</p>
          <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter">Let&apos;s reload your player setup.</h1>
          <p className="text-sm font-bold leading-relaxed text-white/45">
            The onboarding screen hit a client-side loading issue. Retry setup, or head back to sign in.
          </p>
        </div>
        <div className="grid gap-3">
          <button
            type="button"
            onClick={reset}
            className="pc-btn-press touch-target rounded-full bg-[#C6FF00] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-black"
          >
            Retry Setup
          </button>
          <Link
            href="/login"
            className="pc-btn-press touch-target rounded-full border border-white/10 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/50"
          >
            Go To Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
