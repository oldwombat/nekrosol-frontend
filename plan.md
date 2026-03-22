# Nekrosol Frontend — Plan

See [RELEASE_NOTES.md](./RELEASE_NOTES.md) for a summary of what's currently built.

---

## Terminology

Same as backend — see `nekrosol-backend/plan.md` for full glossary.

---

## Architecture Overview

```
app/(tabs)/_layout.tsx           AuthProvider + ToastProvider wrapping all tabs
app/(tabs)/auth-context.tsx  →   useAuthContext() — shared player state
app/(tabs)/home-auth.ts      →   useHomeAuth() — auth/action/prestige logic (used by AuthProvider)
app/(tabs)/index.tsx         →   Play tab (stats, missions, inventory)
app/(tabs)/explore.tsx       →   World tab (location cards + modals)
app/(tabs)/messages.tsx      →   Messages tab (NPC inbox + activity log)
hooks/use-toast-queue.tsx    →   ToastProvider + useToasts()
hooks/use-energy-countdown   →   5-min energy regen countdown
hooks/use-radiation-countdown→   60-min radiation decay countdown
```

---

## Sprint Status

### ✅ Sprint 1 — Prestige Trials Framework (DONE)
Quest API client, `PrestigeQuestModal`, quest states wired into HomeStats PRESTIGE ↑ button.

### ✅ Sprint 3 — Frontend Integration (DONE)
Mission engine integration, NPC inbox, energy countdown, radiation countdown.

### ✅ Sprint 4 — Location Mechanics (DONE)
`EmberBankModal`, `DustlineTavernModal`, `ReactorDistrictModal`. Mission modal removed — right panel only.

### ✅ Sprint 5 — Tutorial Mission UX (DONE)
Step-by-step tutorial descriptions, "Complete Tutorial ✓" button, locked hints for tutorial missions.

### ✅ Sprint 6 — Activity Log & Toasts (DONE)
- `ToastProvider` / `useToasts()` / `ToastOverlay` — animated red/green/blue toast pills
- Toast dispatch on mission actions (stat changes, inventory deltas) and passive regen ticks
- Messages tab filter: Show Log / Hide Log toggle
- `activity_log` messages shown in Messages tab with colour-coded borders

### ✅ Sprint 7 — Auth Gating & Shared Auth Context (DONE)
- World (explore) and Messages tabs now show login form when unauthenticated — same pattern as Play tab
- `auth-context.tsx`: `AuthProvider` wraps all tabs so login on any tab syncs to all others
- All tabs use `useAuthContext()` instead of calling `useHomeAuth()` directly

---

## Backlog / Future Sprints

- [ ] `frontend-title-selector` — Account screen: "Display Title" picker showing all earned prestige rank names. Calls `PATCH /api/players/me` to update `displayTitle`.
- [ ] `frontend-stat-bars` — Radiation pulse above 80%. Health green→yellow→red gradient. Energy pip-style. Credits animated counter.
- [ ] `frontend-inventory-screen` — Dedicated `app/(tabs)/inventory.tsx` tab. FlatList with use/equip actions. Empty state.
- [ ] `frontend-onboarding` — Welcome modal on first login (when `displayName` is empty). Choose display name + lore intro. AsyncStorage dismiss.
- [ ] `frontend-topnav-player` — Show `displayName` and credit balance in TopNav header when authenticated.
- [ ] `frontend-skill-xp-display` — Show XP progress per skill once backend awards XP on mission completion.
- [ ] Fix Expo Router warning: components inside `app/(tabs)/components/` treated as routes — move to `components/` at repo root or suppress with `unstable_settings`.

