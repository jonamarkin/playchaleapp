'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AnimatePresence, m } from 'framer-motion';
import Header from '@/components/Header';
import { useUIStore } from '@/hooks/useUIStore';
import { useSession } from '@/features/auth/session';
import { useCreateGame, useJoinGame } from '@/features/games/hooks';
import type { CreateGameInput } from '@/lib/api/types';

// Lazy load GameModal to reduce initial bundle size
const GameModal = dynamic(() => import('@/components/GameModal'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[200] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

/** Client-side chrome shared by app pages: header, the global modal and toasts */
export default function AppChrome() {
  const router = useRouter();
  const { hasProfile } = useSession();
  const { mutate: createGame } = useCreateGame();
  const { mutate: joinGame } = useJoinGame();
  const activeModal = useUIStore((state) => state.activeModal);
  const selectedItem = useUIStore((state) => state.selectedItem);
  const closeModal = useUIStore((state) => state.closeModal);
  const showToast = useUIStore((state) => state.showToast);
  const triggerToast = useUIStore((state) => state.triggerToast);
  const setPendingAction = useUIStore((state) => state.setPendingAction);

  const sendToOnboarding = () => {
    setPendingAction({ type: 'modal', modalType: 'join', item: selectedItem });
    closeModal();
    router.push('/onboarding');
  };

  return (
    <>
      <Header />

      {/* Global Modal */}
      <AnimatePresence>
        {activeModal && (
          <GameModal
            type={activeModal}
            item={selectedItem}
            onClose={closeModal}
            onCreate={(gameData) => {
              // GameModal shows its own success state
              createGame(gameData as CreateGameInput, {
                onError: (error) => triggerToast(error.message.toUpperCase()),
              });
            }}
            onJoin={(id) => {
              if (!hasProfile) return sendToOnboarding();
              joinGame(id, {
                onSuccess: () => triggerToast('JOIN REQUEST SENT!'),
                onError: (error) => triggerToast(error.message.toUpperCase()),
              });
              closeModal();
            }}
            onSendMessage={() => {
              if (!hasProfile) return sendToOnboarding();
              triggerToast('MESSAGE SENT TO HOST!');
            }}
          />
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <m.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-black text-lime-500 px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl"
          >
            {showToast}
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
