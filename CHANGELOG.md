# Changelog

All notable changes to the Nekrosol frontend will be documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased]

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
