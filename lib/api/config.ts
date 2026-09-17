/**
 * Where API requests go.
 * - NEXT_PUBLIC_API_URL unset: the built-in mock API (mocks/api) served at /api.
 * - NEXT_PUBLIC_API_URL set: the real backend; the mock route is disabled.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const USE_MOCK_API = !process.env.NEXT_PUBLIC_API_URL;

export const SESSION_COOKIE = 'pc_session';
