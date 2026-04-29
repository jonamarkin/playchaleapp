'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppUser, Message, OnboardingProfileInput, SignInInput } from '@/types';
import { backend } from '@/services';
import { useUIStore } from '@/hooks/useUIStore';

type ModalType = 'join' | 'create' | 'profile' | 'stats' | 'match-detail' | 'edit-profile' | 'share-profile' | 'contact-organizer' | 'challenge' | 'manage-game' | null;

interface PendingAction {
  type: 'modal' | 'view';
  modalType?: ModalType;
  item?: any;
  viewPath?: string;
}

interface PlayChaleContextType {
  // Auth & Profile
  user: AppUser | null;
  isLoading: boolean;
  hasProfile: boolean;
  setHasProfile: (value: boolean) => void;

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
  signIn: (input: SignInInput) => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>;
  completeOnboarding: (userData: OnboardingProfileInput) => Promise<void>;
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
  const [user, setUser] = useState<AppUser | null>(null);

  // -- Auth State (local) --
  const [hasProfileState, setHasProfileState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    let isActive = true;

    backend.auth.getSession().then((session) => {
      if (!isActive) return;
      setUser(session.user);
      setHasProfileState(session.hasProfile);
      setIsLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, []);


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

  const signIn = useCallback(async (input: SignInInput) => {
    setIsLoading(true);
    const session = await backend.auth.signIn(input);
    setUser(session.user);
    setHasProfileState(session.hasProfile);
    setIsLoading(false);
    router.push(session.hasProfile ? '/home' : '/onboarding');
  }, [router]);

  const signInWithProvider = useCallback(async (provider: 'google' | 'github') => {
    setIsLoading(true);
    const session = await backend.auth.signInWithProvider(provider);
    setUser(session.user);
    setHasProfileState(session.hasProfile);
    setIsLoading(false);
    router.push(session.hasProfile ? '/home' : '/onboarding');
  }, [router]);

  const completeOnboarding = useCallback(async (userData: OnboardingProfileInput) => {
    triggerToast('Saving Profile...');

    const session = await backend.auth.completeOnboarding(userData);
    setUser(session.user);
    setHasProfileState(true);
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
  }, [pendingAction, router, triggerToast, openModal, setPendingAction]);

  const signOut = useCallback(async () => {
    await backend.auth.signOut();
    setUser(null);
    setHasProfileState(false);
    router.push('/discover');
  }, [router]);

  const uploadAvatar = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const publicUrl = await backend.auth.uploadAvatar(file, user.id);
      setUser({ ...user, avatar: publicUrl });
      triggerToast('Avatar updated!');
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      triggerToast('Failed to upload avatar');
      return null;
    }
  }, [user, triggerToast]);

  const value: PlayChaleContextType = {
    user,
    hasProfile: hasProfileState,
    setHasProfile: setHasProfileState,
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
    signIn,
    signInWithProvider,
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
