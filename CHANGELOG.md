# Changelog

All notable changes to the Nekrosol frontend will be documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased]

### Added
- **World/Locations screen** — replaced the Expo boilerplate Explore tab with 4 location cards (Dustline Tavern, Ember Bank, Blackglass Market, Reactor District), each with radiation badge (🟢 LOW / 🟠 MEDIUM / 🔴 HIGH), in-world flavour text, and a Travel → stub button
- **Mission detail modal** — tapping any mission on the Play tab now opens a modal with full description, ⚡ energy cost, 💰 reward hint, and a **Run Mission** CTA (or **Coming Soon** in grey for unimplemented actions)
- `lib/api.ts` — centralised typed API client for all backend endpoints (`api.players.*`, `api.game.*`) with `PlayerMe`, `ActionResult`, `InventoryResult` response types
- `ESCORT` added to `ActionType` in `home-data.ts`; all 4 missions updated with `energyCost` and `rewardHint`
- 16 Vitest unit tests covering `useHomeAuth` (9) and `useHomeInventory` (7), all passing
- `CHANGELOG.md` — this file
- `ROADMAP.md` — full development plan

### Changed
- `app/(tabs)/_layout.tsx`: Explore tab renamed to **World** with `globe-outline` icon
- `app/(tabs)/home-data.ts`: `MissionItem` type extended with `energyCost: number` and `rewardHint: string`
- `app/(tabs)/home-auth.ts`: imports `ActionType` from `home-data` (single source of truth)

---

## [0.1.0] — Initial Development (backfilled from git history)

### Added

- Expo Router tab navigation with three tabs: **Play**, **Lore**, **Account**
- Home (Play) screen: player stats display (credits, energy, health, radiation), skill list, mission selector, inventory panel, location selector
- Auth flow: login, signup, and logout via Payload player API (`/api/players`)
- Account settings screen with editable display name
- Lore screen fetching and displaying entries from backend `/api/lore`
- Centralised theme system in `constants/theme.ts`
- `useHomeAuth` hook for auth state management on the home screen
- `useHomeInventory` hook for inventory data fetching and display
- `TopNav` component with hamburger menu and sign-out action
- `ROADMAP.md` with frontend-specific todos linked to shared backend roadmap; includes Copilot CLI workflow guide
- `animating-react-native-expo` Copilot skill installed
