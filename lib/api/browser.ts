import { createApi, toQueryString, type Transport } from './client';
import { API_BASE_URL } from './config';

/**
 * Browser transport. Always same-origin (`/api`), so the session cookie is first-party and
 * writes carry no CORS preflight.
 */
const fetchTransport: Transport = async ({ method, path, query, body, idempotencyKey }) => {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    // Lets a write retried on a flaky connection land once, not twice
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

    const response = await fetch(`${API_BASE_URL}${path}${toQueryString(query)}`, {
        method,
        credentials: 'include',
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : undefined };
};

/** API client for Client Components and React Query hooks */
export const api = createApi(fetchTransport);
