import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, USE_MOCK_API } from '@/lib/api/config';

// Serves the mock API (mocks/api) while there is no real backend.
// Disabled automatically once NEXT_PUBLIC_API_URL points at the backend.

const LATENCY_MS = Number(process.env.MOCK_API_LATENCY_MS ?? 150);

async function handle(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    if (!USE_MOCK_API) {
        return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Mock API is disabled' } }, { status: 404 });
    }

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
        path: (await params).path,
        query: request.nextUrl.searchParams,
        body,
        sessionToken: request.cookies.get(SESSION_COOKIE)?.value,
    });

    const response =
        result.body === undefined
            ? new NextResponse(null, { status: result.status })
            : NextResponse.json(result.body, { status: result.status });

    if (result.session) {
        response.cookies.set(SESSION_COOKIE, result.session, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
        });
    } else if (result.session === null) {
        response.cookies.delete(SESSION_COOKIE);
    }
    return response;
}

export { handle as GET, handle as POST, handle as PUT, handle as DELETE };
