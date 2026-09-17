import 'server-only';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/api/server';

/** For pages that need a signed-in user. proxy.ts already bounces requests without a session cookie. */
export async function requireSession(pathname: string) {
    const session = await getSession();
    if (!session.user) redirect(`/login?next=${encodeURIComponent(pathname)}`);
    return session;
}

/** For pages that need a signed-in user who has finished onboarding */
export async function requireProfile(pathname: string) {
    const session = await requireSession(pathname);
    if (!session.hasProfile) redirect(`/onboarding?next=${encodeURIComponent(pathname)}`);
    return session;
}
