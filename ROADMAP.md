# Nekrosol — Development Roadmap

> This roadmap lives in both repos and is kept in sync. The canonical copy is in `nekrosol-backend/ROADMAP.md`.  
> Ask Copilot CLI to work on any item by referencing its `[todo-id]`.

---

## Frontend Todos

### Tests
- [ ] **Hook unit tests (useHomeAuth, useHomeInventory)** `[tests-frontend-hooks]`  
  Add Vitest + `@testing-library/react-hooks`. Test auth flow, inventory merge logic, action dispatch and state updates.

### UI/UX
- [ ] **Replace Explore tab with World/Locations screen** `[frontend-replace-explore]`  
  Replace the Expo template placeholder with 4 location cards (Dustline Tavern, Ember Bank, Blackglass Market, Reactor District) showing name, summary, radiation badge, and stub travel button.

- [ ] **Dedicated Inventory screen** `[frontend-inventory-screen]`  
  New `app/(tabs)/inventory.tsx` tab. FlatList of items with quantities. Inline use/equip actions. Empty state.

- [ ] **Global auth context** `[frontend-auth-context]` ← *unblocks TopNav player info*  
  Move player state from `useHomeAuth` into a React context at `app/_layout.tsx`.

- [ ] **Enhanced stat bars** `[frontend-stat-bars]`  
  Radiation pulse above 80%. Health green→yellow→red. Energy pip-style for max=10. Credits animated counter.

- [ ] **Onboarding flow** `[frontend-onboarding]`  
  Welcome modal on first login (when `displayName` is empty). Choose display name + lore intro.

- [ ] **Mission detail modal** `[frontend-mission-modal]`  
  Tap mission → modal with full description, energy cost, reward preview, Run Mission CTA.

- [ ] **Player info in TopNav** `[frontend-topnav-player]` *(needs: auth context)*  
  Show `displayName` and credits in the header when authenticated.

### Architecture
- [ ] **Frontend API client module** `[arch-api-client]`  
  Create `lib/api.ts`. Replace scattered `fetch` calls with typed functions.

---

## Backend Todos

See `nekrosol-backend/ROADMAP.md` for the full picture including backend tests, game mechanics, and architecture work.

---

## Copilot CLI Workflow

```bash
# One-time setup
brew install gh && gh auth login
```

Ask Copilot to work on any `[todo-id]` above. It will create a feature branch, implement the change, and open a draft PR for your review. See `nekrosol-backend/ROADMAP.md` for full workflow notes and branch naming conventions.
