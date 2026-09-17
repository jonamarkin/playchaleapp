'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { AuthUser, Game, PlayerProfile, Message } from '@/types';

type ModalType = 'join' | 'create' | 'profile' | 'stats' | 'match-detail' | 'edit-profile' | 'share-profile' | 'contact-organizer' | 'challenge' | 'manage-game' | null;

interface PendingAction {
  type: 'modal' | 'view';
  modalType?: ModalType;
  item?: any;
  viewPath?: string;
}

import { useAuthStore } from '@/lib/mock/auth';
import * as mockDb from '@/lib/mock/db';
import { useGames, usePlayers } from '@/hooks/useData';
import { useUIStore } from '@/hooks/useUIStore';

interface PlayChaleContextType {
  // Auth & Profile
  user: AuthUser | null;
  isLoading: boolean;
  hasProfile: boolean;
  setHasProfile: (value: boolean) => void;

  // Data
  games: Game[];
  setGames: React.Dispatch<React.SetStateAction<Game[]>>;
  players: PlayerProfile[];
  setPlayers: React.Dispatch<React.SetStateAction<PlayerProfile[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  archivedIds: string[];
  setArchivedIds: React.Dispatch<React.SetStateAction<string[]>>;

  // Modal
  activeModal: ModalType;
  selectedItem: any;
  openModal: (type: ModalType, item?: any) => void;
  closeModal: () => void;

  // Toast
  showToast: string | null;
  triggerToast: (msg: string) => void;

  // Actions
  completeOnboarding: (userData: { name: string; sports: string[]; location: string }) => void;
  handleNavigate: (path: string) => void;
  signOut: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;

  // Pending action for after onboarding
  pendingAction: PendingAction | null;
  setPendingAction: (action: PendingAction | null) => void;
}

const PlayChaleContext = createContext<PlayChaleContextType | null>(null);

export function PlayChaleProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  // -- Auth State (local) --
  const [isLoading, setIsLoading] = useState(true);

  // -- Data from React Query --
  const { data: games = [] } = useGames();
  const { data: players = [] } = usePlayers();

  // -- UI State from Zustand --
  const {
    activeModal, openModal, closeModal, selectedItem,
    showToast, triggerToast,
    pendingAction, setPendingAction
  } = useUIStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      gameId: 'g1',
      senderId: 'p2',
      senderName: 'Elena R.',
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
      content: "Hey, is there parking near Pitch 4? I'm coming with a big car.",
      timestamp: '2h ago',
      isRead: false,
      type: 'inquiry'
    }
  ]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);

  // Restore the mock session after mount so server and client render the same markup
  useEffect(() => {
    Promise.resolve(useAuthStore.persist.rehydrate()).finally(() => setIsLoading(false));
  }, []);

  // Derived during render so it is correct in the same render the session loads.
  // profileVersion is bumped after onboarding to re-read the mock db.
  const [profileVersion, setProfileVersion] = useState(0);
  const hasProfileState = useMemo(
    () => !!user && mockDb.hasProfile(user.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, profileVersion]
  );


  const handleNavigate = useCallback((path: string) => {
    const protectedPaths = ['/stats', '/messages', '/home'];
    const targetPath = path.startsWith('/') ? path : `/${path}`;

    if (protectedPaths.includes(targetPath) && !hasProfileState) {
      setPendingAction({ type: 'view', viewPath: targetPath });
      router.push('/onboarding');
    } else {
      router.push(targetPath === '/home' ? '/home' : targetPath);
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hasProfileState, router, setPendingAction]);

  const onOpenModal = useCallback((type: ModalType, item?: any) => {
    const gatedActions: ModalType[] = ['create', 'challenge'];
    if (type && gatedActions.includes(type) && !hasProfileState) {
      setPendingAction({ type: 'modal', modalType: type, item });
      router.push('/onboarding');
      return;
    }
    openModal(type, item);
  }, [hasProfileState, router, setPendingAction, openModal]);

  const completeOnboarding = useCallback(async (userData: { name: string; sports: string[]; location: string }) => {
    // Read the session directly: onboarding signs up and completes in the same tick
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;
    triggerToast('Saving Profile...');

    try {
      await mockDb.createProfile(currentUser.id, userData);
    } catch (error) {
      console.error(error);
      triggerToast('Error saving profile');
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['players'] });
    queryClient.invalidateQueries({ queryKey: ['profile', currentUser.id] });
    setProfileVersion((v) => v + 1);
    triggerToast(`COMMISSIONED. WELCOME TO THE ARENA, ${userData.name.toUpperCase()}.`);

    if (pendingAction) {
      if (pendingAction.type === 'view' && pendingAction.viewPath) {
        router.push(pendingAction.viewPath);
      } else if (pendingAction.type === 'modal' && pendingAction.modalType) {
        // We use the store action here
        if (pendingAction.modalType) openModal(pendingAction.modalType, pendingAction.item);
        router.push('/discover');
      }
      setPendingAction(null);
    } else {
      router.push('/home');
    }
  }, [pendingAction, router, triggerToast, queryClient, openModal, setPendingAction]);

  const signOut = useCallback(async () => {
    useAuthStore.getState().signOut();
    queryClient.removeQueries({ queryKey: ['myGames'] });
    queryClient.removeQueries({ queryKey: ['pendingApprovals'] });
    router.push('/discover');
  }, [queryClient, router]);

  const uploadAvatar = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      // No file storage yet: keep the image inline as a data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      await mockDb.updateAvatar(user.id, dataUrl);
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });

      triggerToast('Avatar updated!');
      return dataUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      triggerToast('Failed to upload avatar');
      return null;
    }
  }, [user, queryClient, triggerToast]);

  const value: PlayChaleContextType = {
    user,
    hasProfile: hasProfileState,
    setHasProfile: () => setProfileVersion((v) => v + 1),
    games,
    setGames: () => { }, // No-op, data is managed by Server State now
    players,
    setPlayers: () => { }, // No-op
    messages,
    setMessages,
    archivedIds,
    setArchivedIds,
    activeModal,
    selectedItem,
    openModal: onOpenModal,
    closeModal,
    showToast,
    triggerToast,
    completeOnboarding,
    handleNavigate,
    signOut,
    uploadAvatar,
    pendingAction,
    setPendingAction,
    isLoading
  };

  return (
    <PlayChaleContext.Provider value={value}>
      {children}
    </PlayChaleContext.Provider>
  );
}

export function usePlayChale() {
  const context = useContext(PlayChaleContext);
  if (!context) {
    throw new Error('usePlayChale must be used within a PlayChaleProvider');
  }
  return context;
}
