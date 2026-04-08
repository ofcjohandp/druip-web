---
phase: 09-ui-overhaul
plan: "06"
subsystem: ui-validation
tags: [typescript, color-audit, validation, design-system]
dependency_graph:
  requires: [09-03, 09-04, 09-05]
  provides: [clean-typecheck, zero-hardcoded-colors]
  affects: [src/features/ui/theme.ts, src/app, src/features]
tech_stack:
  added: ["@expo/vector-icons@15.1.1 (top-level install)"]
  patterns: ["COLORS.successSurface/errorSurface tokens for quiz feedback states"]
key_files:
  created: []
  modified:
    - src/features/ui/theme.ts
    - src/features/ui/Avatar.tsx
    - src/features/study/QuestionCard.tsx
    - src/features/onboarding/SampleLessonEngine.tsx
    - src/app/(tabs)/subscribe-confirm.tsx
    - src/app/(tabs)/manage-classroom.tsx
    - src/app/(auth)/tutor-profile.tsx
    - package.json
decisions:
  - "@expo/vector-icons installed at top level to resolve TS2307 — was nested inside expo/node_modules, bundler resolution found it at runtime but tsc could not"
  - "full_name cast as any in tutor-profile.tsx — column not in generated DB types but migration 00018 adds it; cast is temporary until types are regenerated"
  - "Added successSurface and errorSurface to COLORS in theme.ts — quiz feedback tints moved out of QuestionCard and SampleLessonEngine into the design token system"
metrics:
  duration: "191s"
  completed_date: "2026-04-08"
  tasks_completed: 1
  tasks_total: 2
  files_changed: 9
status: partial — awaiting Task 2 (human visual verify checkpoint)
---

# Phase 09 Plan 06: Final Validation — Type Check, Color Audit, Visual Verify Summary

**One-liner:** TypeScript clean (0 errors), zero hardcoded hex colors outside theme.ts, all UI components and packages verified present — awaiting simulator visual approval.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Run type check and hardcoded color audit (with fixes) | a04c5a2 | theme.ts, Avatar.tsx, QuestionCard.tsx, SampleLessonEngine.tsx, subscribe-confirm.tsx, manage-classroom.tsx, tutor-profile.tsx, package.json |

## Task 2: Pending Visual Checkpoint

Task 2 is a `checkpoint:human-verify` — awaiting visual confirmation on iOS Simulator.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] @expo/vector-icons not installed at top level**
- **Found during:** Task 1 (TypeScript check)
- **Issue:** 18 files importing `@expo/vector-icons/Ionicons` produced TS2307 "Cannot find module" because the package was only nested inside `node_modules/expo/node_modules/`. Runtime bundler found it, but tsc did not.
- **Fix:** `npm install @expo/vector-icons@15.1.1 --save --legacy-peer-deps` to match the version bundled with expo SDK 54
- **Files modified:** package.json, package-lock.json
- **Commit:** a04c5a2

**2. [Rule 1 - Bug] manage-classroom.tsx subscriber map type resolves to `never`**
- **Found during:** Task 1 (TypeScript check)
- **Issue:** TS2339 — `sub.id` failed because Supabase inferred query return as `never` due to complex join typing. `(sub as any)` was already used for `profiles` but not for `sub` itself.
- **Fix:** Typed the map callback parameter as `(sub: any)` and removed redundant cast
- **Commit:** a04c5a2

**3. [Rule 1 - Bug] tutor-profile.tsx updating non-existent `full_name` column**
- **Found during:** Task 1 (TypeScript check)
- **Issue:** TS2353 — `profiles` DB type has no `full_name` field. Migration 00018 adds it but types haven't been regenerated.
- **Fix:** Cast update payload as `any` — temporary until `supabase gen types` is re-run after migration
- **Commit:** a04c5a2

**4. [Rule 2 - Missing tokens] Hardcoded quiz feedback colors not in theme**
- **Found during:** Task 1 (color audit)
- **Issue:** `#E8F5E9` (correct answer tint) and `#FFEBEE` (wrong answer tint) were hardcoded in both QuestionCard.tsx and SampleLessonEngine.tsx
- **Fix:** Added `COLORS.successSurface` and `COLORS.errorSurface` to theme.ts; replaced all four instances
- **Files modified:** theme.ts, QuestionCard.tsx, SampleLessonEngine.tsx
- **Commit:** a04c5a2

**5. [Rule 2 - Missing token] Avatar.tsx and subscribe-confirm.tsx using `#FFFFFF` literal**
- **Found during:** Task 1 (color audit)
- **Issue:** Avatar initials text used `'#FFFFFF'`; confetti cannon colors array used `'#FFFFFF'`
- **Fix:** Replaced with `COLORS.textOnAccent` (same value, token-based)
- **Files modified:** Avatar.tsx, subscribe-confirm.tsx
- **Commit:** a04c5a2

## Known Stubs

None — validation plan, no new UI components introduced.

## Self-Check: PARTIAL

Task 1 complete and committed. Task 2 is at checkpoint — visual verification pending.

- Commit a04c5a2: FOUND
- Zero TS errors: CONFIRMED
- Zero hardcoded hex (excl. exceptions): CONFIRMED
- Input.tsx, Tag.tsx, Avatar.tsx exist: CONFIRMED
- @expo-google-fonts/syne in package.json: CONFIRMED
- react-native-confetti-cannon in package.json: CONFIRMED
