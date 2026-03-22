# Nekrosol Frontend — Agent Rules

## Stack

- Expo SDK + React Native (Web target: port 8081)
- TypeScript — run `npx tsc --noEmit` to validate after changes
- Tabs-based navigation via Expo Router (`app/(tabs)/`)
- Shared auth state via `AuthProvider` in `_layout.tsx` — all tabs use `useAuthContext()`, never `useHomeAuth()` directly
- Toast notifications via `ToastProvider` / `useToasts()`

## Key Directories

```
app/(tabs)/          # Tab screens (index, explore, messages, lore, account)
app/(tabs)/components/  # Shared tab components
hooks/               # Reusable hooks (use-energy-countdown, use-radiation-countdown, use-toast-queue)
lib/api.ts           # All backend API calls
constants/theme.ts   # Design tokens (palette, base, buttons, form styles)
```

## Commands

- Dev server: `npx expo start --web` (port 8081)
- Type check: `npx tsc --noEmit`

## Git Workflow

- **Never commit directly to `main`**. All work happens on a feature branch.
- Branch naming: `feature/<short-description>` (e.g. `feature/radiation-decay`, `feature/bank-deposits`)
- Workflow:
  1. `git checkout -b feature/<name>` from latest `main`
  2. Make changes, commit with descriptive messages + Co-authored-by trailer
  3. `git push origin feature/<name>`
  4. Open a PR targeting `main` — do not merge without user approval
- Hotfixes may use `hotfix/<name>` branches
