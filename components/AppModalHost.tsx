'use client';

import dynamic from 'next/dynamic';
import AppLoader from '@/components/AppLoader';
import { usePlayChale } from '@/providers/PlayChaleProvider';
import { useCreateGame, useJoinGame } from '@/hooks/useData';

const GameModal = dynamic(() => import('@/components/GameModal'), {
  ssr: false,
  loading: () => <AppLoader label="Opening modal" overlay />,
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
