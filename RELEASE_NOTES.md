# Nekrosol Frontend — Release Notes

A human-readable summary of what has been built and what the codebase currently does.
For a commit-level changelog see [CHANGELOG.md](./CHANGELOG.md).

---

## Current Codebase State

### Stack
- **Expo 54** + **React Native 0.81** + **Expo Router** (file-based routing)
- **TypeScript** strict mode throughout
- **Vitest** unit tests (16 passing)
- Web target runs at `http://localhost:8081`

### Screens / Routes

| Route | Screen | Status |
|-------|--------|--------|
| `app/(tabs)/index.tsx` | Play / Home | ✅ Full game UI |
| `app/(tabs)/explore.tsx` | World / Locations | ✅ 4 location cards |
| `app/(tabs)/lore.tsx` | Lore | ✅ Fetches from backend |
| `app/(tabs)/account.tsx` | Account | ✅ Display name edit |

### Components

| Component | Purpose |
|-----------|---------|
| `components/top-nav.tsx` | Sticky header with player status bar (Credits / Energy / Health / Radiation chips when logged in), hamburger menu |
| `app/(tabs)/components/HomeStats.tsx` | Left: 4 stat bars. Right: 12 skills with rank names, prestige stars (★), progress bar to 100, PRESTIGE ↑ CTA |
| `app/(tabs)/components/HomeMissions.tsx` | Mission list with energy cost, reward hint, mission detail modal |
| `app/(tabs)/components/HomeInventory.tsx` | Inventory item list with use-item actions |

### Data & Hooks

| File | Purpose |
|------|---------|
| `app/(tabs)/home-data.ts` | `PlayerProfile` type, `getStatItems`, skill rank tables (`getSkillRank`), mission/location data |
| `app/(tabs)/home-auth.ts` | `useHomeAuth` — auth state, `onAction`, `onPrestige` |
| `app/(tabs)/home-inventory.ts` | `useHomeInventory` — inventory fetch and merge |
| `lib/api.ts` | Centralised typed API client (`api.players.*`, `api.game.*`) |
| `constants/theme.ts` | `Colors`, `StatusColors`, `Fonts`, `spacing`, `typography`, style sheets |

### Skill Rank System
12 skills, each with 5 rank names (one per prestige level):

| Skill | P0 | P1 | P2 | P3 | P4 |
|-------|----|----|----|----|-----|
| Thug | Scrapper | Brawler | Bruiser | Enforcer | Juggernaut |
| Thief | Pickpocket | Prowler | Cutpurse | Shadowstep | Phantom |
| Grifter | Hustler | Schemer | Con Artist | Mastermind | Architect |
| Pilot | Joyrider | Freelancer | Ace | Vanguard | Ghost |
| Medic | Patcher | Field Medic | Surgeon | Trauma Specialist | Miracle Worker |
| Hacker | Script Kiddie | Logic Bomber | Zero-Day | Ghost Wire | Null Pointer |
| Technician | Tinkerer | Rigger | Engineer | Artificer | Forge Sage |
| Chemist | Mixer | Alchemist | Synthesist | Toxicologist | Plague Savant |
| Physicist | Student | Researcher | Theorist | Radiomancer | Void Entropist |
| Scavenger | Drifter | Scrounger | Salvager | Wraith Walker | Dust Prophet |
| Mechanic | Grease Monkey | Wrenchhead | Machinist | Forge Hand | Iron Sage |
| Smuggler | Mule | Runner | Operator | Ghost Liner | Shadow Broker |

### Player Status Bar (Header)
When logged in, the `TopNav` shows a compact second row of 4 stat chips with semantic colour coding:
- **Credits**: `StatusColors.info` (blue)
- **Energy**: green → yellow → orange → red (based on % remaining)
- **Health**: green → yellow → orange → red (based on % remaining)
- **Radiation**: green → yellow → orange → red (based on % of max)

### API Client (`lib/api.ts`)
All backend calls go through the typed `api` object:
- `api.players.me/login/logout/signup`
- `api.game.action(action)` → ActionResult
- `api.game.inventory()` → InventoryResult
- `api.game.prestige(skill)` → PrestigeResult

---

## What's Planned Next

See [plan.md](./plan.md) for the full prioritised implementation backlog.

**Immediate next sprint — Prestige Quest Framework:**
1. Quest API client methods (`api.game.quests`, `api.game.completeQuest`)
2. `PrestigeQuestModal` component
3. Wire quest states (locked / available / completed) into HomeStats PRESTIGE ↑ button

---

## Known Gaps / Not Yet Built

- No prestige quest requirement — prestige is still a free button press (quest system in progress)
- Skill XP not awarded by missions (skills stay at 0 without manual admin seeding)
- No `displayTitle` field / Title selector on Account screen
- No global auth context — player state is scoped to Play tab only (TopNav re-fetches independently)
- No dedicated Inventory screen (inventory shown inline on Play tab)
- No onboarding flow (new players see login form cold)
- Stat bar animations (radiation pulse, health colour gradient) not yet implemented
- Frontend-only location cards — no travel mechanic backend yet
