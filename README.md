# Nekrosol — Frontend

Player-facing Expo web app for **Nekrosol**, a browser-based text RPG set in a dying solar system.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | [Expo](https://expo.dev) 54 + React Native 0.81 |
| Routing | Expo Router (file-based) |
| Language | TypeScript (strict) |
| Tests | Vitest (unit) |
| Target | Web — `http://localhost:8081` |

## Quick Start

```bash
pnpm install
pnpm web    # http://localhost:8081
```

The app connects to the Nekrosol backend at `http://localhost:3000` by default. Set `EXPO_PUBLIC_API_URL` to override.

## Screens

| Route | Screen | Notes |
|-------|--------|-------|
| `app/(tabs)/index.tsx` | **Play** | Stats, missions, inventory — main game loop |
| `app/(tabs)/explore.tsx` | **World** | 4 location cards with interactive modals |
| `app/(tabs)/messages.tsx` | **Messages** | NPC inbox + activity log (filterable) |
| `app/(tabs)/lore.tsx` | **Lore** | In-world lore entries from backend |
| `app/(tabs)/account.tsx` | **Account** | Display name, sign out |

All tabs gate behind a login form when unauthenticated (same pattern across all tabs).

## Key Files

| File | Purpose |
|------|---------|
| `app/(tabs)/auth-context.tsx` | `AuthProvider` + `useAuthContext()` — shared player auth state across all tabs |
| `app/(tabs)/home-auth.ts` | `useHomeAuth()` — auth logic (login, actions, prestige, quests) |
| `app/(tabs)/home-data.ts` | `PlayerProfile` type, skill rank tables, location/mission static data |
| `app/(tabs)/home-inventory.ts` | `useHomeInventory()` — inventory fetch and merge |
| `lib/api.ts` | Typed API client — all backend calls via `api.players.*` / `api.game.*` |
| `constants/theme.ts` | Design tokens: `Colors`, `StatusColors`, `base`, `buttons`, `form` style sheets |
| `hooks/use-toast-queue.tsx` | `ToastProvider` + `useToasts()` — animated toast notification system |
| `hooks/use-energy-countdown.ts` | Live energy regeneration countdown (5 min per pip) |
| `hooks/use-radiation-countdown.ts` | Live radiation decay countdown (60 min per point) |
| `app/(tabs)/components/ToastOverlay.tsx` | Renders animated toast pills (red/green/blue) |
| `app/(tabs)/components/HomeStats.tsx` | Stat bars + 12-skill prestige display |
| `app/(tabs)/components/HomeMissions.tsx` | Mission list with availability, costs, complete/run CTAs |
| `app/(tabs)/components/HomeInventory.tsx` | Inline inventory with use-item actions |

## Auth Pattern

All tabs use a shared `AuthProvider` (in `_layout.tsx`) so login on any tab instantly unlocks all others. Access `useAuthContext()` in any tab — never call `useHomeAuth()` directly from a tab screen.

## Commands

```bash
pnpm install       # install dependencies
pnpm web           # start web dev server (port 8081)
pnpm ios           # start iOS simulator
pnpm android       # start Android emulator
pnpm lint          # ESLint
pnpm test          # Vitest unit tests
npx tsc --noEmit   # TypeScript type check
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | `http://localhost:3000` | Backend base URL |

## Git Workflow

All work happens on feature branches — never commit directly to `main`. See `AGENTS.md` for branch naming conventions.

## Docs

- [`RELEASE_NOTES.md`](./RELEASE_NOTES.md) — What's been built sprint by sprint
- [`ROADMAP.md`](./ROADMAP.md) — Upcoming features and backlog
- [`CHANGELOG.md`](./CHANGELOG.md) — Commit-level change log
