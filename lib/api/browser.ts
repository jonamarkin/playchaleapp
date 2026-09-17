import { createApi, toQueryString, type Transport } from './client';
import { API_BASE_URL } from './config';

const fetchTransport: Transport = async ({ method, path, query, body }) => {
    const response = await fetch(`${API_BASE_URL}${path}${toQueryString(query)}`, {
        method,
        credentials: 'include',
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : undefined };
};

/** API client for Client Components and React Query hooks */
export const api = createApi(fetchTransport);
