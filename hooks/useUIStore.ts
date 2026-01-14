import { create } from 'zustand';

// Types adapted from PlayChaleProvider
export type ModalType = 'join' | 'create' | 'profile' | 'stats' | 'match-detail' | 'edit-profile' | 'share-profile' | 'contact-organizer' | 'challenge' | 'manage-game' | null;

interface PendingAction {
    type: 'modal' | 'view';
    modalType?: ModalType;
    item?: any;
    viewPath?: string;
}

interface UIState {
    // Modal State
    activeModal: ModalType;
    selectedItem: any;
    openModal: (type: ModalType, item?: any) => void;
    closeModal: () => void;

    // Toast State
    showToast: string | null;
    triggerToast: (msg: string) => void;

    // Pending Actions (e.g. redirected after auth)
    pendingAction: PendingAction | null;
    setPendingAction: (action: PendingAction | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
    // Modal Defaults
    activeModal: null,
    selectedItem: null,

    openModal: (type, item = null) => set({ activeModal: type, selectedItem: item }),
    closeModal: () => set({ activeModal: null, selectedItem: null }),

    // Toast Defaults
    showToast: null,
    triggerToast: (msg) => {
        set({ showToast: msg });
        setTimeout(() => set({ showToast: null }), 3000);
    },

    // Pending Actions Defaults
    pendingAction: null,
    setPendingAction: (action) => set({ pendingAction: action }),
}));
