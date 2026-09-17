<div align="center">
  <h1>⚡ PlayChale</h1>
  <p><strong>The professional-grade social engine for the amateur elite.</strong></p>
  <p>Organize, compete, and record your legacy.</p>
</div>

---

## 🎯 About

**PlayChale** is a Next.js-powered sports social platform designed for amateur athletes who take their game seriously. Whether you're into football, basketball, padel, or tennis—PlayChale helps you find local games, connect with players, and build your competitive profile.

### Key Features

- 🏟️ **Discover Games** — Browse and join local pickup games, matches, and tournaments
- 👤 **Player Profiles** — Track your stats, win rate, MVPs, and reliability score
- 🎮 **Challenge System** — Send 1v1, 2v2, or team challenges to other players
- 📊 **Performance Stats** — Monitor sport-specific metrics like goals, assists, and aces
- 💬 **Messaging** — Coordinate with organizers and other players
- 🏆 **Community** — Connect with top players and local rankings

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Data:** TanStack Query + Zustand, backed by an in-browser mock backend (`lib/mock/`) until the real API is ready
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

### Mock data

There is no backend yet. All data comes from `lib/mock/`:

- **Sign in** with any email and password. Unknown emails sign in as the demo player (Marcus J., `demo@playchale.app`), who hosts a game so host-only flows can be tested.
- **Onboarding** creates a new local account and profile.
- Changes (created games, joins, results) are saved to `localStorage` under `playchale_mock_db_v1`. Clear that key, or call `resetMockDb()` from `lib/mock/db.ts`, to start from the seed data again.
- Seed data is built from `constants.tsx` in `lib/mock/seed.ts`.

---

## 📁 Project Structure

```
playchale/
├── app/                    # Next.js App Router pages
│   ├── (app)/              # Protected app routes
│   │   ├── home/           # Dashboard home
│   │   ├── discover/       # Game discovery
│   │   ├── community/      # Community features
│   │   ├── messages/       # Player messaging
│   │   └── stats/          # Performance statistics
│   ├── (marketing)/        # Public landing pages
│   └── onboarding/         # User onboarding flow
├── components/             # Reusable UI components
├── providers/              # React Context providers
├── types.ts                # TypeScript type definitions
└── constants.tsx           # App constants and mock data
```

---

## 📜 License

MIT © 2025 PlayChale Labs
