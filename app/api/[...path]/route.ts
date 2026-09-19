import { NextRequest, NextResponse } from 'next/server';
import { API_ORIGIN, SESSION_COOKIE, USE_MOCK_API } from '@/lib/api/config';

/**
 * The app's own API surface, and the only one the browser ever calls.
 *
 * With `API_ORIGIN` unset it serves the mock (mocks/api) in-process; with it set it
 * reverse-proxies to the real backend, passing the session cookie through. Swapping
 * backends is therefore an environment variable, not a rebuild — and browser traffic
 * stays same-origin either way, so there is no CORS preflight on any write.
 */

const LATENCY_MS = Number(process.env.MOCK_API_LATENCY_MS ?? 150);

/** Hop-by-hop and Next-specific headers that must not be forwarded verbatim. */
const STRIPPED = new Set(['host', 'connection', 'keep-alive', 'transfer-encoding', 'upgrade', 'content-length']);

async function handle(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

    return USE_MOCK_API
        ? serveMock(request, path, sessionToken)
        : proxy(request, path);
}

// ---------------------------------------------------------------- mock

async function serveMock(request: NextRequest, path: string[], sessionToken: string | undefined) {
    const { handleMockRequest } = await import('@/mocks/api/router');

    const text = request.method === 'GET' ? '' : await request.text();
    let body: unknown;
    try {
        body = text ? JSON.parse(text) : undefined;
    } catch {
        return NextResponse.json({ error: { code: 'INVALID_JSON', message: 'Body must be valid JSON' } }, { status: 400 });
    }

    // Simulated network latency so loading states are visible while building UI
    if (LATENCY_MS > 0) await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

    const result = handleMockRequest({
        method: request.method,
        path,
        query: request.nextUrl.searchParams,
        body,
        sessionToken,
        idempotencyKey: request.headers.get('idempotency-key') ?? undefined,
    });

    const response =
        result.body === undefined
            ? new NextResponse(null, { status: result.status })
            : NextResponse.json(result.body, { status: result.status });

    applySession(response, result.session);
    return response;
}

function applySession(response: NextResponse, session: string | null | undefined) {
    if (session) {
        response.cookies.set(SESSION_COOKIE, session, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
        });
    } else if (session === null) {
        response.cookies.delete(SESSION_COOKIE);
    }
}

// ---------------------------------------------------------------- proxy

async function proxy(request: NextRequest, path: string[]) {
    const target = `${API_ORIGIN}/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
        if (!STRIPPED.has(key.toLowerCase())) headers.set(key, value);
    });
    // The backend sees the original caller, not this server
    const forwardedFor = request.headers.get('x-forwarded-for');
    headers.set('x-forwarded-for', forwardedFor ?? '');
    headers.set('x-forwarded-proto', request.nextUrl.protocol.replace(':', ''));

    let upstream: Response;
    try {
        upstream = await fetch(target, {
            method: request.method,
            headers,
            body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text(),
            redirect: 'manual',
            cache: 'no-store',
        });
    } catch {
        // The backend being down is a 502 from this app, not an opaque fetch failure
        return NextResponse.json(
            { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'The server is unreachable. Try again in a moment.' } },
            { status: 502 }
        );
    }

    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
        if (!STRIPPED.has(key.toLowerCase())) responseHeaders.append(key, value);
    });

    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export {
    handle as GET,
    handle as POST,
    handle as PUT,
    handle as PATCH,
    handle as DELETE,
};
