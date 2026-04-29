'use client';

import dynamic from 'next/dynamic';
import { usePlayChale } from '@/providers/PlayChaleProvider';
import { useCreateGame, useJoinGame } from '@/hooks/useData';

const GameModal = dynamic(() => import('@/components/GameModal'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[200] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-[#C6FF00] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function AppModalHost() {
  const { mutate: createGame } = useCreateGame();
  const { mutate: joinGame } = useJoinGame();
  const {
    user,
    activeModal,
    selectedItem,
    closeModal,
    handleNavigate,
    triggerToast,
    hasProfile,
    setPendingAction
  } = usePlayChale();

  return (
    <>
      {activeModal && (
        <GameModal
          type={activeModal}
          item={selectedItem}
          onClose={closeModal}
          onCreate={(gameData) => {
            if (user) {
              createGame({ game: gameData, userId: user.id });
            }
          }}
          onJoin={(id) => {
            if (!hasProfile) {
              setPendingAction({ type: 'modal', modalType: 'join', item: selectedItem });
              closeModal();
              handleNavigate('/onboarding');
              return;
            }
            if (user) {
              joinGame({ gameId: id, userId: user.id });
              triggerToast("JOIN REQUEST SENT!");
              closeModal();
            }
          }}
          onSendMessage={() => {
            if (!hasProfile) {
              setPendingAction({ type: 'modal', modalType: 'join', item: selectedItem });
              closeModal();
              handleNavigate('/onboarding');
              return;
            }
            triggerToast("MESSAGE SENT TO HOST!");
          }}
        />
      )}
    </>
  );
}
