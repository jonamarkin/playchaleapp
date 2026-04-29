# Backend Readiness Plan

PlayChale now depends on a single frontend-facing backend facade: `services/backend.ts`.
The current implementation is `services/mockBackend.ts`, so the full product remains usable while the real backend is built.

## Current Architecture

- App code imports `backend` or hooks from `hooks/useData.ts`.
- `mockBackend` owns dummy auth/session, profiles, games, joins, and post-game stats flows.
- `httpBackend` implements the same interface against HTTP endpoints and activates when `NEXT_PUBLIC_DATA_SOURCE=http`.
- `services/api.ts` is the low-level HTTP wrapper for the future backend adapter.
- Supabase client code, migrations, callback routes, middleware, env vars, and packages have been removed from the frontend.

## API Contract To Implement Next

Auth and profile:
- `GET /auth/session`
- `POST /auth/login`
- `POST /auth/oauth`
- `POST /auth/logout`
- `POST /auth/onboarding`
- `POST /media/avatar`

Games:
- `GET /games`
- `GET /games/:idOrSlug`
- `POST /games`
- `POST /games/:id/join`
- `GET /me/games`
- `POST /games/:id/complete`

Players:
- `GET /players?limit=6`
- `GET /players?page=0&pageSize=12`
- `GET /players/:idOrSlug`

Post-game workflow:
- `GET /games/:id/results`
- `GET /stats/pending-approvals`
- `POST /games/:id/results`
- `POST /games/:id/player-stats`
- `POST /games/:id/stats/approval`
- `POST /games/:id/mvp-votes`

## Implementation Phases

1. Build the backend endpoints above against the real database and auth model.
2. Implement the backend endpoints to match `services/httpBackend.ts`.
3. Switch local `.env` to `NEXT_PUBLIC_DATA_SOURCE=http` once the API is available.
4. Keep mock mode as an offline/demo fallback for development and low-connectivity testing.
5. Add contract tests around the backend facade so UI work does not break when the API evolves.
