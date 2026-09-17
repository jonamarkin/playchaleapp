import 'server-only';

import { cookies } from 'next/headers';
import { cache } from 'react';
import { createApi, toQueryString, type Transport } from './client';
import { API_BASE_URL, SESSION_COOKIE, USE_MOCK_API } from './config';

/**
 * API client for Server Components, route handlers and server actions.
 * Forwards the visitor's session cookie. With the mock API it calls the mock
 * router in-process instead of making an HTTP request to itself.
 */

const serverTransport: Transport = async (request) => {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

    if (USE_MOCK_API) {
        const { handleMockRequest } = await import('@/mocks/api/router');
        const [pathname, search = ''] = `${request.path}${toQueryString(request.query)}`.split('?');
        const response = handleMockRequest({
            method: request.method,
            path: pathname.split('/').filter(Boolean),
            query: new URLSearchParams(search),
            body: request.body,
            sessionToken,
        });
        // Clone so server-rendered data can't mutate the store
        return { status: response.status, body: response.body === undefined ? undefined : structuredClone(response.body) };
    }

    const response = await fetch(`${API_BASE_URL}${request.path}${toQueryString(request.query)}`, {
        method: request.method,
        headers: {
            ...(sessionToken ? { Cookie: `${SESSION_COOKIE}=${sessionToken}` } : {}),
            ...(request.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        body: request.body === undefined ? undefined : JSON.stringify(request.body),
        cache: 'no-store',
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : undefined };
};

export const serverApi = createApi(serverTransport);

/** The visitor's session, deduplicated across a single render */
export const getSession = cache(() => serverApi.auth.session());
