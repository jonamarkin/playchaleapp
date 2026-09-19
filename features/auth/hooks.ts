'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/browser';
import type { CreateProfileInput, Credentials, Session } from '@/lib/api/types';
import { playerKeys } from '@/features/players/queries';
import { useUIStore, type ModalType } from '@/hooks/useUIStore';
import { sessionKey, useSession } from './session';

/** Only allow same-site relative redirects from ?next= */
export function safeNextPath(next: string | null | undefined, fallback = '/home') {
    return next && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}

function useApplySession() {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useCallback(
        (session: Session) => {
            // Drop cached per-user data from any previous session
            queryClient.removeQueries({ queryKey: ['me'] });
            queryClient.setQueryData(sessionKey, session);
            // Re-render Server Components with the new session cookie
            router.refresh();
        },
        [queryClient, router]
    );
}

export function useLogin() {
    const applySession = useApplySession();
    return useMutation({
        mutationFn: (credentials: Credentials) => api.auth.login(credentials),
        onSuccess: applySession,
    });
}

export function useDemoLogin() {
    const applySession = useApplySession();
    return useMutation({ mutationFn: () => api.auth.demo(), onSuccess: applySession });
}

export function useLogout() {
    const applySession = useApplySession();
    const router = useRouter();
    return useMutation({
        mutationFn: () => api.auth.logout(),
        onSuccess: () => {
            applySession({ user: null, hasProfile: false });
            router.push('/discover');
        },
    });
}

/** Signs up (unless already signed in) and saves the onboarding profile */
export function useCompleteOnboarding() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const session = useSession();
    const { triggerToast, pendingAction, setPendingAction, openModal } = useUIStore();

    return useMutation({
        mutationFn: async ({ credentials, profile }: { credentials?: Credentials; profile: CreateProfileInput }) => {
            if (!session.user) {
                if (!credentials) throw new Error('Email and password are required');
                await api.auth.signup(credentials);
            }
            return { profile: await api.me.saveProfile(profile), session: await api.auth.session() };
        },
        onSuccess: ({ profile, session: nextSession }) => {
            queryClient.setQueryData(sessionKey, nextSession);
            queryClient.setQueryData(playerKeys.me(), profile);
            queryClient.invalidateQueries({ queryKey: playerKeys.all });
            triggerToast(`COMMISSIONED. WELCOME TO THE ARENA, ${profile.name.toUpperCase()}.`);

            if (pendingAction?.type === 'modal' && pendingAction.modalType) {
                openModal(pendingAction.modalType, pendingAction.item);
                setPendingAction(null);
                router.push('/discover');
            } else {
                router.push(safeNextPath(searchParams.get('next')));
            }
            router.refresh();
        },
    });
}

/**
 * Opens a modal, sending signed-out or not-yet-onboarded users to onboarding first
 * for actions that need a profile. The action resumes after onboarding.
 */
export function useGatedModal() {
    const { hasProfile } = useSession();
    const router = useRouter();
    const openModal = useUIStore((state) => state.openModal);
    const setPendingAction = useUIStore((state) => state.setPendingAction);

    return useCallback(
        (type: ModalType, item?: unknown, gated = false) => {
            if (gated && !hasProfile) {
                setPendingAction({ type: 'modal', modalType: type, item });
                router.push('/onboarding');
                return;
            }
            openModal(type, item);
        },
        [hasProfile, openModal, router, setPendingAction]
    );
}
