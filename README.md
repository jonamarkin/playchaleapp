<div align="center">
  <h1>⚡ PlayChale</h1>
  <p><strong>The professional-grade social engine for the amateur elite.</strong></p>
  <p>Organize, compete, and record your legacy.</p>
</div>

---

## 🎯 About

**PlayChale** is a Next.js-powered sports social platform designed for amateur athletes who take their game seriously. Whether you're into football, basketball, padel, or tennis—PlayChale helps you find local games, connect with players, and build your competitive profile.

### Key Features

- 🏟️ **Discover games** — find pickup games near you, join, or go on the waitlist
- 🧑‍🤝‍🧑 **Host a match** — set the pitch, time, squad size and fee; approve players if you want to
- 📊 **A record worth sharing** — the host reports the game, each player approves their own line,
  and only approved lines become career stats. Nothing on a profile is typed in by its owner
- 💸 **Payment tracking** — who has paid and who owes, with the host's mobile-money number shown.
  PlayChale never touches the money
- 🏆 **Community** — browse players by sport and area

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Data:** Server Components prefetch into TanStack Query; a REST client talks to a built-in mock API until the real backend is ready (see [docs/architecture.md](docs/architecture.md))
- **Package Manager:** pnpm

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/jonamarkin/playchaleapp.git
cd playchaleapp

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Mock API

There is no backend yet. The app serves a mock implementation of the REST contract ([docs/api/openapi.yaml](docs/api/openapi.yaml)) at `/api`, from `mocks/api/`:

- **Sign in** with any email and password. Unknown emails sign in as the demo player (Marcus J., `demo@playchale.app`), who hosts a game so host-only flows can be tested.
- **Onboarding** creates a new account and profile.
- Data is shared by every browser using the dev server and saved to `.mock-db.json`. Delete that file and restart the server to reseed from `mocks/api/seed.ts`.
- `MOCK_API_LATENCY_MS` (default 150) simulates network latency for browser requests.
- To use a real backend, set `API_ORIGIN`. `/api` reverse-proxies to it and the mock turns itself off; the browser keeps talking to the same origin either way.

### Tests

Both need a server running (`pnpm dev` or `pnpm start`):

```bash
pnpm test:contract   # the API journey, every response validated against the OpenAPI spec
pnpm test:e2e        # browser smoke test: host a game through the form and find it again
pnpm lint:api        # lint the contract itself
pnpm gen:api         # regenerate lib/api/schema.ts after editing the spec
```

`pnpm test:contract --target=go --base-url=http://localhost:8080` runs the same suite against the
Go service once it exists.

---

## 📁 Project Structure

```
playchaleapp/
├── app/                    # Routes: page.tsx (server: guards, metadata, prefetch) + *-view.tsx (client UI)
│   ├── (app)/              # App routes (home, discover, community, game, profile, stats, mygames)
│   ├── (marketing)/        # Landing page
│   ├── api/[...path]/      # The app's API surface: mock, or reverse proxy when API_ORIGIN is set
│   ├── login/ onboarding/
├── features/<domain>/      # queries.ts (keys + query options) and hooks.ts (client hooks)
├── lib/api/                # Typed REST client, browser/server transports, contract types
├── lib/query/              # QueryClient + server prefetch helper
├── lib/auth/               # Server route guards
├── mocks/api/              # Mock backend (router, store, seed)
├── components/             # Shared UI components
├── providers/              # React Query, framer-motion providers
├── tests/contract/         # One API journey, runnable against the mock or the Go service
├── tests/e2e/              # Browser smoke test
├── proxy.ts                # Redirects signed-out users away from private routes
└── docs/                   # Architecture notes and OpenAPI contract
```

---

## 📜 License

MIT © 2025 PlayChale Labs
