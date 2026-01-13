'use client';

import { useState, useCallback, useEffect } from 'react';

interface ToastState {
    message: string | null;
    isVisible: boolean;
}

interface UseToastOptions {
    duration?: number;
}

/**
 * Custom hook for managing toast notifications
 * @param options - Toast options including duration
 */
export function useToast(options: UseToastOptions = {}) {
    const { duration = 3000 } = options;

    const [state, setState] = useState<ToastState>({
        message: null,
        isVisible: false,
    });

    const show = useCallback((message: string) => {
        setState({
            message,
            isVisible: true,
        });
    }, []);

    const hide = useCallback(() => {
        setState((prev) => ({
            ...prev,
            isVisible: false,
        }));
    }, []);

    // Auto-hide after duration
    useEffect(() => {
        if (!state.isVisible) return;

        const timer = setTimeout(() => {
            hide();
        }, duration);

        return () => clearTimeout(timer);
    }, [state.isVisible, duration, hide]);

    // Clear message after animation
    useEffect(() => {
        if (state.isVisible) return;

        const timer = setTimeout(() => {
            setState((prev) => ({
                ...prev,
                message: null,
            }));
        }, 300); // Animation duration

        return () => clearTimeout(timer);
    }, [state.isVisible]);

    return {
        message: state.message,
        isVisible: state.isVisible,
        show,
        hide,
    };
}
