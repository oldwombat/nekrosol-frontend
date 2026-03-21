# Copilot Instructions (Frontend / Expo)

## Collaboration
- Always refer to the user as "boss".
- Keep explanations concise but educational; this project is a learning codebase.
- Prefer discoverable, source-backed statements over assumptions.
- Maintain all Plans and TODOs in plan.md in the root of the repo so they are visible to all contributors including Copilot.
- Maintain a release notes markdown file in the root of the repo to track past changes to the codebase so that Copilot can refer to it when making suggestions. Link to the release notes file in the plan.md file.

## App Architecture
- This repo is the player-facing Expo Router app (`app/`), not the Payload backend.
- Main gameplay UI is in `app/(tabs)/index.tsx`.
- Domain/UI data constants live in `app/(tabs)/home-data.ts`.
- Auth and action orchestration is in `app/(tabs)/home-auth.ts`.
- Inventory fetch/state normalization is in `app/(tabs)/home-inventory.ts`.

## Backend Boundary (Critical)
- Never access a database directly from Expo.
- Call backend endpoints using `EXPO_PUBLIC_API_URL` (fallback `http://localhost:3000`) as implemented in `app/(tabs)/home-auth.ts`.
- Keep `credentials: 'include'` on auth/session requests (`/api/players/*`, `/api/player-actions`, `/api/player-inventory`).
- Do not place secrets in Expo env or client code.

## UI & Code Patterns
- Follow the existing Expo Router file-based routing pattern under `app/`.
- Reuse theme tokens from `constants/theme.ts` and hooks under `hooks/`.
- Prefer extracting logic into hooks/util modules (existing pattern: `useHomeAuth`, `useHomeInventory`) instead of bloating screen files.
- Keep changes minimal and consistent with current TypeScript strict mode.

## Commands Used Here
- Install deps: `pnpm install`
- Start dev server: `pnpm start`
- Run platforms: `pnpm ios`, `pnpm android`, `pnpm web`
- Lint: `pnpm lint`

## Workflow Expectations
- When changing request/response shapes, update both frontend usage and backend contract assumptions.
- If adding player actions/items, update `ActionType` and UI handling in `app/(tabs)/home-auth.ts` and `app/(tabs)/index.tsx` together.
- Keep docs current when behavior changes (especially root `README.md`).