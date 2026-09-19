# PlayChale web architecture

How the web app is put together, why, and what comes next. The API contract lives in [api/openapi.yaml](api/openapi.yaml).

## Overview

```
Browser                                   Next.js server                        Backend
───────                                   ──────────────                        ───────
Client Components ── React Query ──┐
  (views, sheets, forms)           │ fetch /api/*          app/api/[...path] ─┐
                                   └──────────────────────────────────────────┤ API_ORIGIN unset
                                                                               ├─ mocks/api
Server Components (page.tsx) ── serverApi ── in-process ──────────────────────┘
  prefetch + HydrationBoundary              or HTTP + forwarded cookie ─────────── Go service (API_ORIGIN set)
```

- **One API contract.** Everything goes through `createApi()` in `lib/api/client.ts`, which maps each endpoint in [api/openapi.yaml](api/openapi.yaml) to a function. Shapes are **generated** into `lib/api/schema.ts` (`pnpm gen:api`), so a spec change is a compile error rather than a runtime surprise. Two transports:
  - `lib/api/browser.ts` always fetches this app's own `/api/*`.
  - `lib/api/server.ts` is used while rendering. With the mock it calls `mocks/api/router.ts` in-process; with a backend it requests it directly and forwards the session cookie.
- **The browser never talks to the backend directly.** `app/api/[...path]/route.ts` serves the mock when `API_ORIGIN` is unset and reverse-proxies to that origin when it is set. Same-origin means the session cookie stays first-party and no write pays for a CORS preflight — on a Ghanaian mobile link that preflight would roughly double the latency of every Join. `API_ORIGIN` has no `NEXT_PUBLIC_` prefix on purpose: it is read per request and never enters the client bundle, so one build artefact serves dev, staging and production.
- **Server-rendered data.** Each `page.tsx` is a Server Component. It prefetches that page's queries through `<Prefetch>` (`lib/query/prefetch.tsx`) and hands them to React Query. The client view reads the same query keys, so the first paint already has data: no spinner, no layout shift, and real HTML for SEO and link previews.
- **Sessions.** An httpOnly `pc_session` cookie.
  - `proxy.ts` sends requests without the cookie away from private routes before anything renders.
  - `lib/auth/guards.ts` checks the session itself (`requireSession`, `requireProfile`), because a cookie can be stale.
  - The root layout passes the session to `SessionProvider`, so the client's first render already knows who is signed in.

## Directory layout

| Path | What lives there |
| --- | --- |
| `app/` | Routes. `page.tsx` is a thin server file (guards, metadata, prefetch); `*-view.tsx` next to it is the client UI. |
| `app/api/[...path]/route.ts` | The app's own API surface: mock when `API_ORIGIN` is unset, reverse proxy when it is set. |
| `docs/api/openapi.yaml` | The contract. Both the mock and the Go service implement it; `lib/api/schema.ts` is generated from it. |
| `tests/contract/` | One journey, run against either implementation (`--target=mock\|go`), every response validated against the spec. |
| `tests/e2e/smoke.mjs` | Browser smoke test: host a game through the form and find it again. |
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
   silently broken before. `next dev` still uses Turbopack, and `next.config.mjs` imports Serwist
   lazily so dev never loads it — importing it there adds a webpack config Turbopack can't use.

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

1. ~~**Split `GameModal.tsx`**~~ Done: eight of its ten modes were fake, so they were deleted.
   `create` became the route `app/(app)/games/new/`, `join` became
   `features/games/components/JoinGameSheet.tsx`, and all overlays now use one Radix-based
   `components/ui/dialog.tsx` (focus trap, Escape, scroll lock, `role="dialog"`). The modal bus
   in `useUIStore` is down to `'join' | null`.
2. **Move domain components into `features/*/components`** as you touch them. There's no need for a big-bang move.
   The five game-card implementations are now one `components/GameCard.tsx` with `feature` and
   `row` variants, rendered as links rather than clickable divs.
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
8. ~~**Generate types from the OpenAPI spec**~~ Done in Phase 2: `pnpm gen:api` writes
   `lib/api/schema.ts`, and `lib/api/types.ts` is aliases over it.
9. **Tests and CI:**
   - ~~A contract suite~~ Done: `pnpm test:contract` walks signup → host → join → report →
     approve → career stat, validating every response against the spec by JSON pointer. It runs
     against the mock today and the Go service later, unchanged.
   - ~~A browser smoke test~~ Done: `pnpm test:e2e`.
   - Still to do: Vitest for hooks and utilities, the remaining Playwright flows (onboarding,
     phone OTP, stat approval), and a Lighthouse CI budget so performance can't silently regress.
10. **Accessibility:** remove `userScalable: false` and `maximumScale: 1` from the viewport (they block pinch zoom), and fix the malformed star SVG in `Features.tsx`.

### Backend

The contract is REST + OpenAPI. The service is **Go**, in its own repo at `playchale/playchale-api`,
built as a **modular monolith**: one deployable with clear internal modules. That scales far enough
for a city-by-city launch without microservice overhead, and it is the right shape for one developer.

Until it exists, `mocks/api` implements the same spec and the app is developed against it. The mock
does not get thrown away when the service lands — it stays as the local dev backend, which is why
`pnpm test:contract` runs against both.

| Concern | Recommendation |
| --- | --- |
| Modules | auth, profiles, games (+ participants), results (stats, approvals, MVP), messaging, notifications |
| Database | PostgreSQL. Relational data with strong consistency around joins, capacity and approvals. Add PostGIS when "games near me" arrives. |
| Router / data | chi, pgx + sqlc (no ORM — the aggregation query is one you want to read), goose migrations embedded via `embed.FS`, oapi-codegen so contract conformance is a compile error |
| Cache / realtime | Neither at first. Redis and SSE arrive with chat (Phase 6), not before |
| Background jobs | Not yet. Career stats are recomputed from source in the same transaction, which is idempotent, so a nightly job can later prove them correct |
| Concurrency | Joins take the game row `FOR UPDATE`. Without it, twelve people tapping Join on a ten-spot game all get in — that test comes before the handler |
| Files | Object storage (S3 or Cloudflare R2) with presigned uploads for avatars and game images |
| Auth | Session cookie on a same-site API subdomain (`api.playchale.app`, cookie domain `.playchale.app`), so `lib/api/server.ts` can forward it. Add OAuth (Google) there. |
| Payments | Mobile money (MoMo) for paid games. Keep amounts in minor units plus a currency. |
| Observability | Structured logs, request tracing, error tracking |

**Contract changes made in Phase 2**, ahead of the backend, so they were done once rather than twice:
- `date`/`time` strings became one ISO `startsAt` plus an IANA `timezone`; `price: "₵25"` became
  `fee: { amountMinor, currency }`, where `0` means free rather than a missing value.
- Joining goes through a six-state participant lifecycle
  (`requested | waitlisted | confirmed | declined | cancelled | removed`), with waitlist promotion.
- Career stats are counts (`wins`, `noShows`, per-sport `counters`), derived from approved results
  only and never written by a client. A win rate is a rendering decision — see `lib/format.ts`.
- Per-viewer state moved into a `viewer` envelope, so the rest of a game stays cacheable.
- Lists are keyset-paginated; writes accept an `Idempotency-Key`.
- A `/sports` registry carries each sport's result and stat fields, so adding a sport is a row
  rather than a deploy, and the post-game form builds itself from it.

Still outstanding: the avatar flow should switch to presigned uploads.

### How the stats stay worth trusting

The profile is the product, so the rules that make its numbers mean something are deliberate:

- The host reports what happened; **each player approves their own line**, and only approved lines
  reach a career total.
- A stat line counts only when its game's **result** is approved too, and only when the approval was
  given against the **current** result version — so a host who re-enters the score cannot keep the
  approvals the old score earned.
- The result's approval threshold is measured over **the other participants' lines only**. The host
  entered the report, so counting their own approval towards it would let a host certify their own
  stats; a game nobody else was in therefore never produces an approved result. The contract suite
  covers each of these directly — the first two were found by it, not by review.
- Self-rated attributes exist, but they are rendered apart from the record and labelled as such.

## Removed in Phase 1

Deleted because the UI existed with no backend and no path to one in the MVP: in-app messaging
(`MessageCenter`, `/messages`), challenges, programs, testimonials, and eight `GameModal` modes
(manage-game, edit-profile, edit-stats, share-profile, contact-organizer, match-detail, profile,
detailed-stats). `Message`, `Challenge`, `JoinRequest`, `Program` and `Testimonial` left `types.ts`
with them; `Game.requests` went too, since the API never returned it.

Every invented metric is gone: the six feature-card counters, "Join 5,000+ athletes",
"12,482 Players Active in 42 Cities", "482 Players Active", "342 matches played", the onboarding
"projected matches/rivals" and the "#1,242 City Rank" that sat inside the signed-in dashboard (now
the player's real game count). The rule from here: a number on screen comes from the API, or it is
not a number.

Also fixed while here: 9 of the 34 seeded Unsplash URLs were dead upstream — including both Padel
and both Badminton covers, so creating a game in those sports always produced a broken image.

Chat returns in Phase 6 as game-scoped threads, rebuilt rather than resurrected: the old inbox was
host-centric and keyed off a magic `'host-user'` id.
