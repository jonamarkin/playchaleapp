# PlayChale web architecture

How the web app is put together, why, and what comes next. The API contract lives in [api/openapi.yaml](api/openapi.yaml).

## Overview

```
Browser                                   Next.js server                        Backend
───────                                   ──────────────                        ───────
Client Components ── React Query ──┐
  (views, modals, forms)           │ fetch /api/*          app/api/[...path] ─┐
                                   └──────────────────────────────────────────┤
                                                                               ├─ mocks/api (today)
Server Components (page.tsx) ── serverApi ── in-process ──────────────────────┘
  prefetch + HydrationBoundary              or HTTP + forwarded cookie ─────────── real REST API (later)
```

- **One API contract.** Everything goes through `createApi()` in `lib/api/client.ts`, which maps each endpoint in the OpenAPI spec to a function. It has two transports:
  - `lib/api/browser.ts` fetches `/api/*` (or `NEXT_PUBLIC_API_URL`) from Client Components.
  - `lib/api/server.ts` is used while rendering. With the mock it calls `mocks/api/router.ts` in-process; with the real backend it makes an HTTP request and forwards the session cookie.
- **Switching to the real backend** means setting `NEXT_PUBLIC_API_URL`. The mock route then turns itself off, and no component changes.
- **Server-rendered data.** Each `page.tsx` is a Server Component. It prefetches that page's queries through `<Prefetch>` (`lib/query/prefetch.tsx`) and hands them to React Query. The client view reads the same query keys, so the first paint already has data: no spinner, no layout shift, and real HTML for SEO and link previews.
- **Sessions.** An httpOnly `pc_session` cookie.
  - `proxy.ts` sends requests without the cookie away from private routes before anything renders.
  - `lib/auth/guards.ts` checks the session itself (`requireSession`, `requireProfile`), because a cookie can be stale.
  - The root layout passes the session to `SessionProvider`, so the client's first render already knows who is signed in.

## Directory layout

| Path | What lives there |
| --- | --- |
| `app/` | Routes. `page.tsx` is a thin server file (guards, metadata, prefetch); `*-view.tsx` next to it is the client UI. |
| `app/api/[...path]/route.ts` | Serves the mock API over HTTP. |
| `features/<domain>/queries.ts` | Query keys and `queryOptions` factories. Safe to import on the server. |
| `features/<domain>/hooks.ts` | Client hooks (`useGames`, `useJoinGame`, ...). |
| `features/auth/` | `SessionProvider`, `useSession`, login/signup/logout/onboarding hooks, `useGatedModal`. |
| `lib/api/` | API client, transports, contract types, config. |
| `lib/query/` | Request-scoped `QueryClient` and the `Prefetch` helper. |
| `mocks/api/` | Mock backend: router (endpoint logic), store (saved to `.mock-db.json`), seed data. |
| `components/` | Shared UI. Domain components move into `features/*/components` over time. |
| `hooks/useUIStore.ts` | Zustand store for UI-only state: the active modal, toasts, the action to resume after onboarding. |

## State rules

- **Server data only lives in React Query.** Mutations update or invalidate by key (for example, `useJoinGame` writes the updated game straight into the cache). There's no global data context.
- **UI state lives in Zustand, read through selectors** (`useUIStore((s) => s.showToast)`), so a toast doesn't re-render the whole app.
- **Session:** `useSession()`. Auth hooks set it, then call `router.refresh()` so Server Components render again with the new cookie.

## Design system

Tokens live in `app/globals.css` as HSL channels and are consumed by `tailwind.config.ts`, so
Tailwind's opacity modifiers keep working (`bg-lime-500/20`). See `/styleguide` for the rendered
set (dev only; in production it needs `ENABLE_STYLEGUIDE=true`).

- **Colour:** `lime` and `ink` ramps (50–950). Lime is a background and accent — never text on a
  light surface (~1.5:1). Accent text uses `text-brand`, which resolves per polarity.
- **Surfaces and polarity:** `<Surface polarity="light|dark">` sets `--fg`, `--fg-muted`,
  `--fg-subtle`, `--line` and `--ring-color` for its subtree. Components read those instead of
  guessing, which is why there are no `dark:` variants and why `text-white/30` should not come back.
- **Type:** `Display` / `Heading` / `Eyebrow` / `Text` in `components/ui/typography.tsx`. The scale
  has a 12px floor; the old `text-[8px]`–`text-[11px]` labels map onto `Eyebrow`.
- **Radius, elevation, depth, motion:** `rounded-chip|field|card|card-lg|card-xl`, `shadow-e1..e3`
  plus `shadow-lime`, `z-header|overlay|modal|toast|tooltip`, `duration-fast|base|slow`.
- **`cn()` is extended** (`lib/utils.ts`) so tailwind-merge understands these custom scales. Without
  that it mis-groups them — `shadow-e1` was being read as a shadow *colour* and silently
  recolouring arbitrary shadows merged with it.
- **Accessibility is built into primitives rather than swept up later:** `IconButton` requires a
  `label`, and (planned) `Field` owns its own id/`htmlFor` pairing.

Raw hex in `className` is gone (291 replaced by codemod); the only literals left are the metadata
theme colour and `ProgramCard`, which Phase 1 deletes.

## Performance rules

The look depends on heavy type, big imagery and motion. These rules keep that fast:

1. **First-paint entrances use CSS, not JavaScript.** Use `tailwindcss-animate` classes (`animate-in fade-in slide-in-from-bottom-5 [animation-delay:...] fill-mode-both`). They run as soon as the HTML paints, before hydration. `fade-in` starts at 1% opacity (see `tailwind.config.ts`), because Chrome ignores elements first painted at opacity 0 when choosing LCP.
2. **framer-motion is for interaction:** hover, exit animations, layout changes, scroll reveals, modals.
   - Always import `m` (never `motion`). `LazyMotion` loads the animation features after first paint, and `strict` mode throws on a stray `motion.*`.
   - For lists that animate items in and out, use `AnimatePresence initial={false}` so server-rendered items don't start hidden.
   - `MotionConfig reducedMotion="user"` respects the OS reduce-motion setting.
3. **No large `blur-[...]` filters.** Use `bg-[radial-gradient(closest-side,rgba(...),transparent)]` for glows. Big blurred elements are expensive to paint on phones.
4. **Images always go through `next/image`, with a correct `sizes`.**
   - Add `priority` to anything visible in the first viewport (hero, first game cards, first avatars). Everything else lazy-loads.
   - AVIF and WebP are enabled.
5. **Navigate with `<Link>`.** It prefetches routes, and route-level `loading.tsx` files (re-exporting `components/RouteLoading.tsx`) give feedback straight away. Keep that fallback taller than the viewport so streamed content never shifts anything visible. Game and profile pages deliberately have no loading fallback, so `notFound()` still returns a real HTTP 404.
6. **Prefetch in `page.tsx`** anything the first screen needs. Client-only fetching is for data that appears after an interaction.
7. **The production build runs webpack** (`next build --webpack`). Service-worker plugins hook into
   webpack; under Turbopack no service worker is emitted at all, which is exactly how the PWA was
   silently broken before. `next dev` still uses Turbopack.

### Measured impact

Production builds of `main` (`2ef5c50`, before) and this architecture (after), measured on the same machine with runs alternating between the two.

**Real Chrome, 4× CPU slowdown, median of 7 runs:**

| Route | LCP before | LCP after |
| --- | --- | --- |
| `/` | 2.59s | 0.38s |
| `/discover` | 2.24s | 0.97s |
| `/community` | 2.91s | 1.04s |
| `/game/[slug]` | 1.61s | 0.37s |
| `/login` | 1.25s | 0.25s |

**Lighthouse mobile preset, median of 5 runs:**

| Route | Score | CLS | Main-thread work |
| --- | --- | --- | --- |
| `/` | 82 → 84 | 0 → 0 | 5.2s → 4.6s |
| `/discover` | 89 → 86 | 0.098 → 0 | 3.8s → 1.8s |
| `/community` | 84 → 85 | 0.002 → 0 | 2.5s → 1.9s |
| `/game/[slug]` | 75 → 88 | 0.171 → 0 | 1.6s → 1.4s |
| `/login` | 94 → 99 | 0 → 0 | 1.2s → 1.0s |

Lighthouse's simulated LCP is worse on `/discover` and `/community`. Its model charges the longer hydration of server-rendered HTML to LCP, while real paints happen 2–3× earlier (table above). Before, those pages painted a spinner and then loaded data in the browser. Game page image bytes also fell from 146KB to 36KB (AVIF, correctly sized).

## Roadmap

### Web app, next steps

1. **Split `GameModal.tsx` (1,100 lines, ten modal types) into one lazily loaded component per modal.** Only the open modal's code downloads, and each one gets easier to change.
2. **Move domain components into `features/*/components`** as you touch them. There's no need for a big-bang move.
3. **Loading skeletons for each route,** matching the real layout, instead of the shared spinner.
4. **Optimistic updates** for joining a game, MVP votes and stat approvals, so taps feel instant.
5. **Error boundaries (`error.tsx`) for each route group,** with an on-brand retry screen.
6. ~~**Fix the PWA.**~~ Done: `next-pwa` → Serwist (`app/sw.ts`), with a `--webpack` production
   build. Verified in-browser: the worker installs and controls the page, document navigations fall
   back to `/offline.html`, `/api/games` is cached (network-first, 5s timeout) and `/api/auth/*`
   and every non-GET are never cached. Manifest fixed: `start_url` `/home`, `id`, `scope`,
   padded maskable icons, shortcuts, and the broken screenshot entry removed.
7. ~~**Mobile navigation:**~~ Done: `components/app-shell/BottomNav.tsx` below `lg`, with the
   header's hamburger drawer retired there (Log Out moved onto the profile page).
8. **Generate types from the OpenAPI spec** (`openapi-typescript`) and delete the hand-written mirrors in `lib/api/types.ts`.
9. **Tests and CI:**
   - Vitest for hooks and utilities.
   - Playwright for the key flows: sign-in, onboarding, discover → join, host → results → approval.
   - A Lighthouse CI budget, so performance can't silently regress.
10. **Accessibility:** remove `userScalable: false` and `maximumScale: 1` from the viewport (they block pinch zoom), and fix the malformed star SVG in `Features.tsx`.

### Backend

The contract is REST + OpenAPI; the language and framework are still open. A **modular monolith** fits this stage: one deployable service with clear internal modules. It scales far enough for a city-by-city launch without microservice overhead.

| Concern | Recommendation |
| --- | --- |
| Modules | auth, profiles, games (+ participants), results (stats, approvals, MVP), messaging, notifications |
| Database | PostgreSQL. Relational data with strong consistency around joins, capacity and approvals. Add PostGIS when "games near me" arrives. |
| Cache / realtime | Redis for rate limits, caching hot lists (discover, leaderboards) and presence |
| Realtime | WebSockets or SSE for messages, join requests and approval prompts |
| Background jobs | A queue for recalculating player stats once results are approved, and for notifications |
| Files | Object storage (S3 or Cloudflare R2) with presigned uploads for avatars and game images |
| Auth | Session cookie on a same-site API subdomain (`api.playchale.app`, cookie domain `.playchale.app`), so `lib/api/server.ts` can forward it. Add OAuth (Google) there. |
| Payments | Mobile money (MoMo) for paid games. Keep amounts in minor units plus a currency. |
| Observability | Structured logs, request tracing, error tracking |

**Contract changes to make when the backend lands** (marked `TODO(backend)` in the code and spec):
- `Game.date`/`time` become one ISO `startsAt` timestamp. `price` becomes `amount` (minor units) plus `currency`.
- Joins go through a participant `status` (requested → confirmed), so hosts can approve players.
- Player career stats (`sportStats`) become aggregates computed from approved `player_game_stats`, not fields clients write.
- The avatar flow switches to presigned uploads.
