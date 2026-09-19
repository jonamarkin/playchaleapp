'use client';

import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/browser';
import type { Session } from '@/lib/api/types';

export const sessionKey = ['session'] as const;

const InitialSessionContext = createContext<Session>({ user: null, playerId: null, hasProfile: false });

/**
 * Seeds the session from the server render, so the first client render already
 * knows who is signed in (no flash of signed-out UI, no hydration mismatch).
 */
export function SessionProvider({ session, children }: { session: Session; children: React.ReactNode }) {
    return <InitialSessionContext.Provider value={session}>{children}</InitialSessionContext.Provider>;
}

export function useSession(): Session {
    const initialSession = useContext(InitialSessionContext);
    const { data } = useQuery({
        queryKey: sessionKey,
        queryFn: () => api.auth.session(),
        initialData: initialSession,
        // The server render is authoritative; auth actions update this cache directly
        staleTime: Infinity,
    });
    return data;
}

/**
 * The signed-in player's id, or null.
 *
 * Accounts and players are separate records — an account may later own a venue — so
 * anything comparing against a host or participant must use this, not `user.id`.
 */
export function useViewerId(): string | null {
    return useSession().playerId;
}
