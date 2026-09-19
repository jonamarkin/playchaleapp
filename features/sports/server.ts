import 'server-only';

import { cache } from 'react';
import { serverApi } from '@/lib/api/server';

/** One registry fetch per request, shared by metadata and the page itself. */
export const getSports = cache(() => serverApi.sports.list());

/**
 * Display name for a sport code during server rendering — the counterpart to
 * useSportName() on the client. Falls back to the code so metadata never renders "undefined".
 */
export async function sportName(code: string): Promise<string> {
    try {
        const sports = await getSports();
        return sports.find((sport) => sport.code === code)?.name ?? code;
    } catch {
        return code;
    }
}
