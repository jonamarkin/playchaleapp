'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { GAMES as INITIAL_GAMES, TOP_PLAYERS as INITIAL_PLAYERS } from '@/constants';
import { Game, PlayerProfile, Message, Challenge, Participant } from '@/types';

type ModalType = 'join' | 'create' | 'profile' | 'stats' | 'match-detail' | 'edit-profile' | 'share-profile' | 'contact-organizer' | 'challenge' | 'manage-game' | null;

interface PendingAction {
  type: 'modal' | 'view';
  modalType?: ModalType;
  item?: any;
  viewPath?: string;
}

import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useGames, usePlayers, useProfile } from '@/hooks/useData';
import { useUIStore } from '@/hooks/useUIStore';

// ... other imports

interface PlayChaleContextType {
  // Auth & Profile
  user: User | null;
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

const STORAGE_KEY = 'playchale_profile';

export function PlayChaleProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  // -- Auth State (local) --
  const [hasProfileState, setHasProfileState] = useState(false);
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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // SUPABASE AUTH LISTENER
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // We can check profile existence here or via useProfile hook
        // For Context compatibility, let's do a quick check or keep it simpler
        // Ideally, we move 'hasProfile' logic into the useProfile hook too.
        // For now, let's keep it manual to avoid breaking the complex Onboarding flow logic abruptly.
        const { data: profile } = await supabase.from('profiles').select('onboarding_completed').eq('id', session.user.id).single();
        setHasProfileState(profile?.onboarding_completed || false);
      } else {
        setHasProfileState(false);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);


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
    if (!user) return;
    triggerToast('Saving Profile...');

    const starterStats = { gamesPlayed: 0, winRate: '0%', mvps: 0, reliability: '100%', rating: 6.0 };

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: userData.name,
      username: userData.name.replace(/\s+/g, '').toLowerCase(),
      location: userData.location,
      sports: userData.sports,
      onboarding_completed: true,
      attributes: { pace: 80, shooting: 75, passing: 78, dribbling: 82, defending: 60, physical: 70 }
    }).eq('id', user.id);

    if (profileError) {
      console.error(profileError);
      triggerToast('Error saving profile');
      return;
    }

    for (const sport of userData.sports) {
      await supabase.from('user_sport_stats').upsert({
        user_id: user.id,
        sport,
        stats: starterStats
      });
    }

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
  }, [user, pendingAction, router, triggerToast, supabase, openModal, setPendingAction]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHasProfileState(false);
    router.push('/discover');
  }, [supabase, router]);

  const uploadAvatar = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      triggerToast('Avatar updated!');
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      triggerToast('Failed to upload avatar');
      return null;
    }
  }, [user, supabase, triggerToast]);

  const value: PlayChaleContextType = {
    user,
    hasProfile: hasProfileState,
    setHasProfile: setHasProfileState,
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
