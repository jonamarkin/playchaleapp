/**
 * Where API requests go.
 *
 * The browser always talks to this app's own `/api` — never to the backend directly. That
 * keeps the session cookie first-party and avoids a CORS preflight before every join and
 * every result, which on a Ghanaian mobile link doubles the latency of each write.
 *
 * `API_ORIGIN` is a **server-only** variable (no NEXT_PUBLIC_ prefix, deliberately):
 * - unset  → app/api/[...path] serves the built-in mock (mocks/api)
 * - set    → app/api/[...path] reverse-proxies to that origin
 *
 * Because it is read at request time and never reaches the client bundle, one build
 * artefact can serve local dev, staging and production.
 */

/** What the browser calls. Always same-origin. */
export const API_BASE_URL = '/api';

/** The backend the server forwards to, or null while the mock is in charge. */
export const API_ORIGIN = process.env.API_ORIGIN?.replace(/\/$/, '') || null;

export const USE_MOCK_API = !API_ORIGIN;

export const SESSION_COOKIE = 'pc_session';
