'use client';

import { useState, useCallback } from 'react';

type ModalType =
    | 'join'
    | 'create'
    | 'profile'
    | 'stats'
    | 'match-detail'
    | 'edit-profile'
    | 'share-profile'
    | 'contact-organizer'
    | 'challenge'
    | 'manage-game'
    | null;

interface ModalState<T = unknown> {
    isOpen: boolean;
    type: ModalType;
    data: T | null;
}

/**
 * Custom hook for managing modal state
 * Provides open, close, and data management for modals
 */
export function useModal<T = unknown>() {
    const [state, setState] = useState<ModalState<T>>({
        isOpen: false,
        type: null,
        data: null,
    });

    const open = useCallback((type: ModalType, data?: T) => {
        setState({
            isOpen: true,
            type,
            data: data ?? null,
        });
    }, []);

    const close = useCallback(() => {
        setState({
            isOpen: false,
            type: null,
            data: null,
        });
    }, []);

    const setData = useCallback((data: T | null) => {
        setState((prev) => ({
            ...prev,
            data,
        }));
    }, []);

    return {
        isOpen: state.isOpen,
        type: state.type,
        data: state.data,
        open,
        close,
        setData,
    };
}

export type { ModalType };
