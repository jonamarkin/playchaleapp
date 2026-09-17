import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/api/config';

// Cheap first line of defence: redirect before rendering when there is no session cookie at all.
// Pages still verify the session itself (lib/auth/guards.ts), since a cookie can be stale.

const PRIVATE_PREFIXES = ['/home', '/stats', '/messages', '/mygames'];

export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const isPrivate = PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

    if (isPrivate && !request.cookies.has(SESSION_COOKIE)) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.search = `?next=${encodeURIComponent(pathname + search)}`;
        return NextResponse.redirect(url);
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/home/:path*', '/stats/:path*', '/messages/:path*', '/mygames/:path*'],
};
