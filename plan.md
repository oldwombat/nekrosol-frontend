# Nekrosol Frontend — Plan

See [RELEASE_NOTES.md](./RELEASE_NOTES.md) for a summary of what's currently built.

---

## Active Sprint: Prestige Quest Framework (Frontend)

### Problem

The PRESTIGE ↑ button in HomeStats currently calls the prestige endpoint directly. It needs to:
1. Check whether the player has a completed quest for this prestige level
2. Show a quest modal if not yet completed (for click-type quests: immediate accept + complete)
3. Reflect locked / available / completed states visually

### Dependencies

Frontend Phase 2 depends on backend Phase 1 being live (needs quest IDs + status from API).

---

## Todos (Frontend)

### Phase 2 — Frontend Quest UI

- [ ] `frontend-quest-api` — Add `api.game.quests()` and `api.game.completeQuest(id)` to `lib/api.ts`. Add `QuestStatus` and `PlayerQuest` response types.
- [ ] `frontend-quest-modal` — Create `app/(tabs)/components/PrestigeQuestModal.tsx`. Shows quest title, flavour text, requirement description, and "Accept & Complete" CTA (for click-type quests: calls complete immediately).
- [ ] `frontend-quest-display` — Update `HomeStats.tsx`: wire quest state into PRESTIGE ↑ button. States: locked (grey, disabled), available (gold, opens modal), completed (green ✓, unlocks prestige button).
- [ ] `frontend-quest-hook` — Add quest fetch to `home-auth.ts`: load quests on mount, expose `questsForSkill(key)` helper.

### Near-term

- [ ] `frontend-title-selector` — Account screen: add "Display Title" picker showing all earned prestige rank names across all skills. Calls `PATCH /api/players/me` to update `displayTitle`. Depends on prestige working end-to-end.

---

## Backlog / Future Sprints

- [ ] Add global auth context so player state doesn't need to be re-fetched per tab
- [ ] Stat bar animations (radiation pulse at high levels, health colour gradient)
- [ ] Dedicated Inventory screen (currently inline on Play tab)
- [ ] Onboarding flow for new players
- [ ] Location travel mechanic (frontend currently shows location cards with stub Travel → button)
- [ ] Puzzle UI (cipher, wiring, sequence) for future quest types
- [ ] Fix Expo Router warning: component files inside `app/(tabs)/components/` are treated as routes — move to `components/` at repo root or suppress with `unstable_settings`
