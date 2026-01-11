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

interface PlayChaleContextType {
  // Auth & Profile
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
  
  // Location
  userLocation: { lat: number; lng: number } | null;
  
  // Modal
  activeModal: ModalType;
  selectedItem: any;
  openModal: (type: ModalType, item?: any) => void;
  closeModal: () => void;
  
  // Toast
  showToast: string | null;
  triggerToast: (msg: string) => void;
  
  // Actions
  completeOnboarding: (userData: { name: string; sport: string; location: string }) => void;
  handleNavigate: (path: string) => void;
  
  // Pending action for after onboarding
  pendingAction: PendingAction | null;
  setPendingAction: React.Dispatch<React.SetStateAction<PendingAction | null>>;
}

const PlayChaleContext = createContext<PlayChaleContextType | null>(null);

const STORAGE_KEY = 'playchale_profile';

export function PlayChaleProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Initialize from localStorage
  const [hasProfile, setHasProfileState] = useState(false);
  const [games, setGames] = useState<Game[]>(INITIAL_GAMES);
  const [players, setPlayers] = useState<PlayerProfile[]>(INITIAL_PLAYERS);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  
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
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Load profile state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setHasProfileState(data.hasProfile || false);
          if (data.player) {
            setPlayers(prev => {
              const newPlayers = [...prev];
              if (newPlayers.length > 0) {
                newPlayers[0] = { ...newPlayers[0], ...data.player };
              }
              return newPlayers;
            });
          }
        } catch (e) {
          console.error('Failed to parse stored profile:', e);
        }
      }
    }
  }, []);

  // Geolocation
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.log("Location access denied", error)
      );
    }
  }, []);

  const setHasProfile = useCallback((value: boolean) => {
    setHasProfileState(value);
  }, []);

  const triggerToast = useCallback((msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  }, []);

  const handleNavigate = useCallback((path: string) => {
    const protectedPaths = ['/stats', '/messages', '/home'];
    const targetPath = path.startsWith('/') ? path : `/${path}`;
    
    if (protectedPaths.includes(targetPath) && !hasProfile) {
      setPendingAction({ type: 'view', viewPath: targetPath });
      router.push('/onboarding');
    } else {
      router.push(targetPath === '/home' ? '/home' : targetPath);
    }
    
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hasProfile, router]);

  const openModal = useCallback((type: ModalType, item?: any) => {
    const gatedActions: ModalType[] = ['create', 'challenge'];
    
    if (type && gatedActions.includes(type) && !hasProfile) {
      setPendingAction({ type: 'modal', modalType: type, item });
      router.push('/onboarding');
      return;
    }
    
    setSelectedItem(item);
    setActiveModal(type);
  }, [hasProfile, router]);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setSelectedItem(null);
  }, []);

  const completeOnboarding = useCallback((userData: { name: string; sport: string; location: string }) => {
    setHasProfileState(true);
    
    // Personalize the primary player profile
    const updatedPlayer = {
      name: userData.name,
      mainSport: userData.sport,
      recentActivity: `Signed into the league from ${userData.location || 'HQ'}`
    };
    
    setPlayers(prev => {
      const newPlayers = [...prev];
      if (newPlayers.length > 0) {
        newPlayers[0] = {
          ...newPlayers[0],
          ...updatedPlayer
        };
      }
      return newPlayers;
    });
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        hasProfile: true,
        player: updatedPlayer
      }));
    }

    triggerToast(`COMMISSIONED. WELCOME TO THE ARENA, ${userData.name.toUpperCase()}.`);

    if (pendingAction) {
      if (pendingAction.type === 'view' && pendingAction.viewPath) {
        router.push(pendingAction.viewPath);
      } else if (pendingAction.type === 'modal' && pendingAction.modalType) {
        setSelectedItem(pendingAction.item);
        setActiveModal(pendingAction.modalType);
        router.push('/discover');
      }
      setPendingAction(null);
    } else {
      router.push('/home');
    }
  }, [pendingAction, router, triggerToast]);

  const value: PlayChaleContextType = {
    hasProfile,
    setHasProfile,
    games,
    setGames,
    players,
    setPlayers,
    messages,
    setMessages,
    archivedIds,
    setArchivedIds,
    userLocation,
    activeModal,
    selectedItem,
    openModal,
    closeModal,
    showToast,
    triggerToast,
    completeOnboarding,
    handleNavigate,
    pendingAction,
    setPendingAction,
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
