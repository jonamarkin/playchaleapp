/**
 * Mock auth session.
 * Any email/password signs in: known emails resume that account, unknown ones
 * sign in as the demo player so the app is usable without onboarding.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser } from '@/types';
import { createAccount, findAccountByEmail } from './db';
import { DEMO_ACCOUNT } from './seed';

interface AuthState {
    user: AuthUser | null;
    signIn: (email: string) => AuthUser;
    signInAsDemo: () => AuthUser;
    signUp: (email: string) => AuthUser;
    signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,

            signIn: (email) => {
                const user = findAccountByEmail(email) || { ...DEMO_ACCOUNT };
                set({ user });
                return user;
            },
            signInAsDemo: () => {
                const user = { ...DEMO_ACCOUNT };
                set({ user });
                return user;
            },
            signUp: (email) => {
                const user = createAccount(email);
                set({ user });
                return user;
            },
            signOut: () => set({ user: null }),
        }),
        {
            name: 'playchale_mock_session',
            partialize: (state) => ({ user: state.user }),
            // Rehydrated by PlayChaleProvider after mount, so server and client render the same markup
            skipHydration: true,
        }
    )
);
