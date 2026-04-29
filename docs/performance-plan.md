# PlayChale Performance Plan

## Baseline

Measured from a production `next build` on 2026-04-29 with placeholder Supabase public env vars.

| Route | Estimated client JS/CSS gzip |
| --- | ---: |
| `/` | 339.8 KB |
| `/discover` | 335.7 KB |
| `/community` | 335.5 KB |
| `/profile/[slug]` | 334.2 KB |
| `/stats` | 334.1 KB |
| `/game/[slug]` | 317.5 KB |
| `/onboarding` | 305.8 KB |
| `/login` | 305.1 KB |
| `/home` | 300.0 KB |
| `/messages` | 300.2 KB |
| `/mygames` | 298.4 KB |

Largest public assets before optimization:

| Asset | Size |
| --- | ---: |
| `public/playchalelogo_final.png` | 1.9 MB |
| `public/icons/icon-512x512.png` | 1.9 MB |
| `public/icons` total | 2.3 MB |

## Pass 1 Results

Completed in the first implementation pass:

- Added `pnpm perf:audit` for repeatable route/chunk measurements.
- Replaced the removed `next lint` command with ESLint 9 flat config.
- Added `pnpm typecheck`.
- Moved app providers out of the root document and into the route groups/pages that need them.
- Replaced broad `middleware.ts` with scoped `proxy.ts` for protected app routes.
- Regenerated PWA icons from the PlayChale logo and fixed `icon-512x512.png` dimensions.
- Moved public game filtering from client-side filtering to the Supabase query.

Asset results:

| Asset | Before | After |
| --- | ---: | ---: |
| `public/playchalelogo_final.png` | 1.9 MB | 233 KB |
| `public/icons/icon-512x512.png` | 1.9 MB | 233 KB |
| `public/icons` total | 2.3 MB | 423 KB |

Route payload results after pass 1:

| Route | Before gzip | After gzip |
| --- | ---: | ---: |
| `/` | 339.8 KB | 339.1 KB |
| `/discover` | 335.7 KB | 334.5 KB |
| `/community` | 335.5 KB | 334.3 KB |
| `/profile/[slug]` | 334.2 KB | 333.0 KB |
| `/stats` | 334.1 KB | 332.9 KB |
| `/game/[slug]` | 317.5 KB | 316.3 KB |
| `/onboarding` | 305.8 KB | 304.7 KB |
| `/login` | 305.1 KB | 289.1 KB |
| `/home` | 300.0 KB | 298.8 KB |
| `/messages` | 300.2 KB | 299.0 KB |
| `/mygames` | 298.4 KB | 297.2 KB |
| `/_not-found` | 244.6 KB | 176.5 KB |

Open follow-ups from pass 1:

- `next-pwa` still does not emit `public/sw.js` or Workbox assets in the current Next 16/Turbopack build.
- Lint passes, but reports warnings around raw `<img>` usage, synchronous set-state-in-effect patterns, and a few text escaping issues.
- Route JS is still dominated by shared client/provider/Supabase/motion chunks; this needs the Phase 2 route/component split.

## Pass 2 Results

Completed in the second implementation pass:

- Converted the marketing route back to a server-rendered page.
- Removed app providers from the marketing layout.
- Replaced the landing page's full `DiscoverGames` and `TopPlayers` client sections with lightweight server-rendered preview sections.
- Kept the existing visual direction while reducing marketing-page JavaScript.
- Switched footer fallback navigation to `next/navigation` routing instead of mutating `window.location`.

Route payload results after pass 2:

| Route | Pass 1 gzip | Pass 2 gzip |
| --- | ---: | ---: |
| `/` | 339.1 KB | 232.9 KB |
| `/discover` | 334.5 KB | 334.9 KB |
| `/community` | 334.3 KB | 334.7 KB |
| `/profile/[slug]` | 333.0 KB | 333.4 KB |
| `/stats` | 332.9 KB | 333.3 KB |
| `/game/[slug]` | 316.3 KB | 316.7 KB |
| `/onboarding` | 304.7 KB | 305.0 KB |
| `/login` | 289.1 KB | 288.7 KB |
| `/home` | 298.8 KB | 299.3 KB |
| `/messages` | 299.0 KB | 299.4 KB |
| `/mygames` | 297.2 KB | 297.7 KB |
| `/_not-found` | 176.5 KB | 176.5 KB |

Open follow-ups from pass 2:

- Landing payload is down about 31%, but still above the 180 KB gzip target because it shares the large global client/runtime chunks.
- App routes remain near 300-335 KB gzip and need shared-provider and modal chunk work next.
- `next-pwa` still does not emit `public/sw.js` or Workbox assets.

## Pass 3 Results

Completed in the third implementation pass:

- Removed animation runtime from the public landing sections and replaced the visible polish with CSS transitions.
- Converted `Hero`, `Features`, `Testimonials`, `ProgramCard`, and `Programs` to server-rendered components.
- Added a server-rendered `MarketingFooter` so the public layout no longer imports the app footer's client navigation code.
- Split `ICONS` out of the large demo-data constants module so client routes that only need icons no longer pull in games, players, testimonials, and sport configuration.
- Passed marketing program data from the server page into the programs section instead of importing the constants module inside a client component.

Route payload results after pass 3:

| Route | Baseline gzip | Pass 2 gzip | Pass 3 gzip |
| --- | ---: | ---: | ---: |
| `/` | 339.8 KB | 232.9 KB | 185.2 KB |
| `/discover` | 335.7 KB | 334.9 KB | 333.0 KB |
| `/community` | 335.5 KB | 334.7 KB | 332.7 KB |
| `/profile/[slug]` | 334.2 KB | 333.4 KB | 331.5 KB |
| `/stats` | 334.1 KB | 333.3 KB | 331.3 KB |
| `/game/[slug]` | 317.5 KB | 316.7 KB | 315.8 KB |
| `/onboarding` | 305.8 KB | 305.0 KB | 303.3 KB |
| `/login` | 305.1 KB | 288.7 KB | 287.6 KB |
| `/home` | 300.0 KB | 299.3 KB | 297.3 KB |
| `/messages` | 300.2 KB | 299.4 KB | 297.5 KB |
| `/mygames` | 298.4 KB | 297.7 KB | 295.7 KB |
| `/_not-found` | 244.6 KB | 176.5 KB | 177.1 KB |

Open follow-ups from pass 3:

- Landing is now down about 45% from baseline. The remaining public route weight is mostly shared Next runtime plus the `next/image`/`next/link` client support chunk.
- App routes still carry the large Supabase/client-data stack; the next big cut is moving more auth/data reads server-side and making the app shell less provider-heavy.
- `next-pwa` still does not emit `public/sw.js` or Workbox assets.

## Pass 4 Results

Completed in the fourth implementation pass:

- Removed global `useGames()` and `usePlayers()` from `PlayChaleProvider`; pages now fetch the data they actually render.
- Lazy-loaded the app modal host so create/join mutation hooks and heavy modal code do not sit directly in the app shell.
- Reworked the game client page to rely on the server-fetched game instead of waiting on the global games list.
- Reworked profile pages to fetch one profile by slug/id instead of searching a global players list.
- Replaced broad Supabase `select('*')` calls with explicit columns for games, profiles, sport stats, my games, paginated players, and server-side game detail.
- Capped public game lists and home rising-star previews to avoid large weak-network payloads.

Route payload results after pass 4:

| Route | Pass 3 gzip | Pass 4 gzip |
| --- | ---: | ---: |
| `/` | 185.2 KB | 185.2 KB |
| `/discover` | 333.0 KB | 331.0 KB |
| `/community` | 332.7 KB | 330.8 KB |
| `/profile/[slug]` | 331.5 KB | 329.4 KB |
| `/stats` | 331.3 KB | 329.3 KB |
| `/game/[slug]` | 315.8 KB | 313.7 KB |
| `/onboarding` | 303.3 KB | 296.0 KB |
| `/login` | 287.6 KB | 284.9 KB |
| `/home` | 297.3 KB | 295.4 KB |
| `/messages` | 297.5 KB | 295.5 KB |
| `/mygames` | 295.7 KB | 293.8 KB |
| `/_not-found` | 177.1 KB | 177.1 KB |

Open follow-ups from pass 4:

- App route bundle weight is still mostly shared auth/Supabase/client runtime. The next structural bundle cut is moving auth/profile bootstrapping server-side or splitting the app shell by protected/public app routes.
- Data payloads are now scoped, but production should add matching database indexes for `games.visibility`, `games.organizer_id`, `game_participants.user_id`, `profiles.slug`, and `user_sport_stats.user_id`.
- `next-pwa` still does not emit `public/sw.js` or Workbox assets.

## Pass 5 Results

Completed in the fifth implementation pass:

- Removed inactive `next-pwa`/Workbox wiring, which was not emitting a service worker with the current Next 16/Turbopack build.
- Added a first-party `public/sw.js` with offline page precache, navigation network-first fallback, cache-first Next static assets, stale-while-revalidate static/image assets, and capped image cache growth.
- Added production-only root service worker registration with a ready-state fallback so it registers even if hydration happens after `load`.
- Kept Supabase caching conservative: only same-origin service worker routing plus unauthenticated Supabase GETs without an `authorization` header are eligible for API cache.
- Removed the missing manifest screenshot reference and added `pnpm pwa:check` to guard required PWA files and manifest icon paths.
- Verified the emitted service worker surface: `public/sw.js` exists and no stale Workbox service worker files are produced.

Route payload results after pass 5:

| Route | Pass 4 gzip | Pass 5 gzip |
| --- | ---: | ---: |
| `/` | 185.2 KB | 185.6 KB |
| `/discover` | 331.0 KB | 331.3 KB |
| `/community` | 330.8 KB | 331.1 KB |
| `/profile/[slug]` | 329.4 KB | 329.8 KB |
| `/stats` | 329.3 KB | 329.7 KB |
| `/game/[slug]` | 313.7 KB | 314.1 KB |
| `/onboarding` | 296.0 KB | 296.4 KB |
| `/login` | 284.9 KB | 285.2 KB |
| `/home` | 295.4 KB | 295.8 KB |
| `/messages` | 295.5 KB | 295.9 KB |
| `/mygames` | 293.8 KB | 294.2 KB |
| `/_not-found` | 177.1 KB | 177.3 KB |

Open follow-ups from pass 5:

- Service worker support is now in place, but deeper offline UX still needs product decisions around which authenticated screens should show stale private data and for how long.
- App route bundle weight is still the main performance ceiling. The next phase should focus on runtime smoothness plus an auth/app shell split so non-mutating screens do less client work.
- Lint still passes with warnings around raw `<img>` usage, missing image alt text in modal/detail surfaces, and synchronous `setState` inside a few effects.

## Pass 6 Results

Completed in the sixth implementation pass:

- Replaced shell/page-level Framer Motion wrappers with CSS animations for the app header, app toast, login page, onboarding wrapper, and simple app page transitions.
- Added global reduced-motion handling so users/devices that request less motion avoid long transitions, smooth scrolling, and looping animation work.
- Added `content-visibility`/containment utilities and applied them to large offscreen marketing sections so lower-power devices can skip rendering work until sections approach the viewport.
- Converted `GameDetailView` and `GameModal` raw `<img>` tags to `next/image` with explicit dimensions/fill sizing and accessible alt text.
- Added Supabase storage host support to `next/image` remote patterns for uploaded avatars/media.
- Removed a modal form synchronization effect that caused cascading render warnings; modal forms now initialize/update during view changes.
- Deferred localStorage/geolocation fallback state updates so those hooks do not synchronously cascade inside effects.
- Cleaned up remaining lint warnings; `pnpm lint` now exits with zero warnings.

Route payload results after pass 6:

| Route | Pass 5 gzip | Pass 6 gzip |
| --- | ---: | ---: |
| `/` | 185.6 KB | 185.9 KB |
| `/discover` | 331.3 KB | 331.2 KB |
| `/community` | 331.1 KB | 330.9 KB |
| `/profile/[slug]` | 329.8 KB | 328.8 KB |
| `/stats` | 329.7 KB | 328.6 KB |
| `/game/[slug]` | 314.1 KB | 314.0 KB |
| `/onboarding` | 296.4 KB | 296.4 KB |
| `/login` | 285.2 KB | 250.3 KB |
| `/home` | 295.8 KB | 294.5 KB |
| `/messages` | 295.9 KB | 295.7 KB |
| `/mygames` | 294.2 KB | 294.1 KB |
| `/_not-found` | 177.3 KB | 177.6 KB |

Open follow-ups from pass 6:

- App routes still import Framer Motion inside the large feature components. The next bundle-focused pass should split or remove Framer from dashboards, discover, community, and modal variants.
- Landing is slightly heavier from the global CSS utilities, but offscreen rendering should be cheaper on real devices.
- The biggest remaining route target is the protected app shell/auth split, followed by replacing simple feature-level Framer usage with CSS transitions.

## Pass 7 Results

Completed in the seventh implementation pass:

- Removed Framer Motion from the shared modal host so app routes no longer pay for it before a modal is opened.
- Replaced simple Framer fades/hover/layout animations with CSS utilities in `AppDashboard`, `DiscoverGames`, `TopPlayers`, `MessageCenter`, `ProfileDashboard`, `GameCard`, `GameDetailView`, `MyGamesPage`, `ContactModal`, and `StatsApprovalCard`.
- Removed an unused Framer import from `ImageUpload`, which is part of profile/stat surfaces.
- Lazy-loaded the host-only post-game reporting modal on game detail pages so `PostGameModal` and its Framer-heavy wizard do not sit in the initial `/game/[slug]` route payload.
- Kept Framer only in deeper, stateful flows for now: `GameModal`, `Onboarding`, and the dynamically loaded `PostGameModal`.

Route payload results after pass 7:

| Route | Pass 6 gzip | Pass 7 gzip |
| --- | ---: | ---: |
| `/` | 185.9 KB | 185.9 KB |
| `/discover` | 331.2 KB | 295.0 KB |
| `/community` | 330.9 KB | 294.8 KB |
| `/profile/[slug]` | 328.8 KB | 293.6 KB |
| `/stats` | 328.6 KB | 293.4 KB |
| `/game/[slug]` | 314.0 KB | 272.9 KB |
| `/onboarding` | 296.4 KB | 296.0 KB |
| `/login` | 250.3 KB | 250.3 KB |
| `/home` | 294.5 KB | 259.5 KB |
| `/messages` | 295.7 KB | 259.6 KB |
| `/mygames` | 294.1 KB | 257.8 KB |
| `/_not-found` | 177.6 KB | 177.6 KB |

Open follow-ups from pass 7:

- The app route target is much closer, but most protected routes still sit above 250 KB gzip due to the auth/provider/Supabase shell and shared UI/data chunks.
- `/onboarding` is now the heaviest unchanged client route because it still uses Framer across its step wizard. It should either keep Framer intentionally or be converted to CSS step transitions.
- The next structural pass should split protected shell/auth bootstrapping and move more route-specific client code behind dynamic imports.

## Targets

- Landing first-load JS/CSS below 180 KB gzip.
- App route JS/CSS below 220 KB gzip.
- No PWA/static image asset above 300 KB unless intentionally user-facing.
- Initial feed/profile payloads below 50 KB.
- Public routes should not perform auth refresh work unless necessary.
- Production builds should emit a service worker for offline support.

## Implementation Phases

1. Baseline and guardrails: `perf:audit`, working lint/typecheck, documented route weights.
2. Low-risk cuts: optimize PWA assets, scope auth proxy, move global providers out of root, remove unused global imports.
3. Bundle architecture: split marketing into server-rendered sections with client islands, lazy-load heavy modal variants, and keep motion on CSS/lightweight primitives.
4. Data efficiency: backend-owned filtering, pagination, indexes, feed/profile views, and narrow response DTOs.
5. Offline and weak-network behavior: repair service worker generation, app shell/feed/profile caches, stale-data fallbacks, background retry for mutations.
6. Runtime smoothness: reduced-motion/low-power styles, `content-visibility`, lighter shadows/blurs on constrained devices.

Run `pnpm perf:audit` after `pnpm build` to compare route payloads after each phase.
