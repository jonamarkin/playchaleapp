'use client';

import React from 'react';
import { AnimatePresence, m } from 'framer-motion';
import Header from '@/components/Header';
import JoinGameSheet from '@/features/games/components/JoinGameSheet';
import { useUIStore } from '@/hooks/useUIStore';
import type { Game } from '@/types';

/** Client-side chrome shared by app pages: header, the join sheet and toasts. */
export default function AppChrome() {
  const activeModal = useUIStore((state) => state.activeModal);
  const selectedItem = useUIStore((state) => state.selectedItem);
  const closeModal = useUIStore((state) => state.closeModal);
  const showToast = useUIStore((state) => state.showToast);

  const joinGame = activeModal === 'join' ? (selectedItem as Game | null) : null;

  return (
    <>
      <Header />

      {joinGame && (
        <JoinGameSheet game={joinGame} open onOpenChange={(open) => !open && closeModal()} />
      )}

      <AnimatePresence>
        {showToast && (
          <m.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-28 left-1/2 z-toast -translate-x-1/2 rounded-pill bg-ink-900 px-8 py-4 text-eyebrow font-black uppercase tracking-widest text-lime-500 shadow-e3 lg:bottom-10"
            role="status"
          >
            {showToast}
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
