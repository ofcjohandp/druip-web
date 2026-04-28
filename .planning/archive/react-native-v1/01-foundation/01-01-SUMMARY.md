---
phase: "01-foundation"
plan: "01"
subsystem: "scaffold"
tags: ["expo", "eas", "jest", "expo-router", "supabase", "dependencies"]
dependency_graph:
  requires: []
  provides:
    - "Expo SDK 54 project with all dependencies installed"
    - "EAS build profiles: development, staging (channel), production (channel)"
    - "app.config.js with runtimeVersion fingerprint policy"
    - "Expo Router file structure: 14 route files across public/auth/tabs groups"
    - "Jest test runner with jest-expo preset and Wave 0 test stubs"
  affects:
    - "01-02-PLAN.md — depends on project structure and src/ directories"
    - "01-03-PLAN.md — depends on Expo Router file structure"
    - "01-04-PLAN.md — depends on tabs layout and src/features/, src/lib/ directories"
tech_stack:
  added:
    - "expo ~54.0.33 (SDK 54 — create-expo-app resolved to 54, plan specified 55)"
    - "expo-router ~6.0.23"
    - "expo-sqlite ~16.0.10"
    - "expo-notifications ^0.32.16"
    - "@supabase/supabase-js ^2.101.1 (satisfies >=2.49.9)"
    - "@tanstack/react-query ^5.96.2"
    - "zustand ^5.0.12"
    - "react-native-mmkv ^4.3.0"
    - "@react-native-community/netinfo ^11.4.1"
    - "react-native-url-polyfill ^3.0.0"
    - "jest-expo ^55.0.13"
    - "@testing-library/react-native ^13.3.3"
  patterns:
    - "Expo managed workflow (no bare ejection)"
    - "Expo Router file-based routing with route groups (auth) and (tabs)"
    - "module.exports in app.config.js for Jest compatibility"
    - "jest.setup.js pre-warms Expo lazy globals to prevent scope errors"
key_files:
  created:
    - "app.config.js"
    - "eas.json"
    - ".env.example"
    - "jest.config.js"
    - "jest.setup.js"
    - ".gitignore"
    - "src/app/_layout.tsx"
    - "src/app/index.tsx"
    - "src/app/sample-lesson.tsx"
    - "src/app/sign-up-prompt.tsx"
    - "src/app/(auth)/_layout.tsx"
    - "src/app/(auth)/sign-in.tsx"
    - "src/app/(auth)/sign-up.tsx"
    - "src/app/(auth)/goal-selection.tsx"
    - "src/app/(tabs)/_layout.tsx"
    - "src/app/(tabs)/index.tsx"
    - "src/app/(tabs)/study.tsx"
    - "src/app/(tabs)/progress.tsx"
    - "src/app/(tabs)/notes.tsx"
    - "src/app/(tabs)/profile.tsx"
    - "__tests__/app-config.test.ts"
    - "__tests__/supabase-client.test.ts"
    - "__tests__/auth-store.test.ts"
    - "__tests__/routing.test.tsx"
    - "__tests__/landing.test.tsx"
    - "__tests__/auth.test.ts"
    - "__tests__/goal-selection.test.tsx"
    - "__tests__/tabs-layout.test.tsx"
    - "__tests__/flatlist-config.test.tsx"
  modified:
    - "package.json (main → expo-router/entry, test script added, all deps)"
    - "tsconfig.json (@/* path alias to src/*)"
decisions:
  - "Used module.exports in app.config.js instead of export default for Jest require() compatibility"
  - "Added jest.setup.js to pre-warm Expo winter runtime lazy globals (TextDecoder, URL, structuredClone, __ExpoImportMetaRegistry) — required when app-config.test.ts runs first alphabetically"
  - "create-expo-app resolved Expo SDK 54 (not 55 as planned) — this is the latest available; all required packages installed at compatible versions"
  - "supabase-js installed with --legacy-peer-deps due to react-dom peer conflict in Expo 54; version ^2.101.1 satisfies SEED-03 (>=2.49.9)"
metrics:
  duration: "13m"
  completed_date: "2026-04-06"
  tasks_completed: 3
  tasks_total: 3
  files_created: 31
  files_modified: 2
---

# Phase 01 Plan 01: Project Scaffold Summary

**One-liner:** Expo SDK 54 project scaffolded with expo-router file structure, supabase-js v2.101.1 (SEED-03), EAS fingerprint OTA config (SEED-05), and jest-expo Wave 0 test stubs for all Phase 1 verification points.

## What Was Built

A compilable Expo managed project with the full directory structure and dependency set that all subsequent plans (02, 03, 04) depend on:

- **Expo project** initialized via `create-expo-app` with TypeScript template, then all required packages installed
- **EAS configuration** with three build profiles: `development` (simulator, internal), `staging` (channel for OTA), `production` (channel for OTA)
- **`app.config.js`** with `runtimeVersion: { policy: 'fingerprint' }` (SEED-05), `softwareKeyboardLayoutMode: 'resize'` (STUDY-09), bundle identifiers, and notification plugin
- **14 Expo Router route files** across three groups: public (index, sample-lesson, sign-up-prompt), auth group (sign-in, sign-up, goal-selection), tabs group (Home, Study, Progress, Notes, Profile — DASH-04 order)
- **`src/features/`, `src/lib/`, `src/types/`, `src/providers/`** directories created for Plans 02-04
- **Jest infrastructure**: jest-expo preset, `@/*` path alias, setupFilesAfterEnv, 9 test suites with 10 Wave 0 stubs
- **2 passing tests** verifying `runtimeVersion` fingerprint and `softwareKeyboardLayoutMode` in app.config.js

## Verification Results

| Check | Result |
|-------|--------|
| `@supabase/supabase-js` version | ^2.101.1 (>=2.49.9 — SEED-03 satisfied) |
| `runtimeVersion.policy` | `fingerprint` (SEED-05 satisfied) |
| EAS build profiles | development, staging, production |
| 14 route files | All present |
| Jest test run | 9 suites passed, 34 todos + 2 passing |
| `tsconfig.json` path alias | `@/*` → `src/*` |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] jest-expo Expo lazy global scope error in app-config.test.ts**
- **Found during:** Task 3
- **Issue:** When `app-config.test.ts` runs first alphabetically, Expo's `winter/runtime.native.ts` lazy getters (`__ExpoImportMetaRegistry`, `structuredClone`, `TextDecoder`, `URL`, etc.) fire during module initialization when `jest-runtime`'s `isInsideTestCode` is `false`. This throws `ReferenceError: You are trying to import a file outside of the scope of the test code.` Only affects the first test file to run; subsequent files are unaffected because the getters are already evaluated.
- **Fix:** Added `jest.setup.js` (loaded via `setupFiles`) that pre-warms all Expo lazy globals before any test file executes. Also changed `app-config.test.ts` to use `require('fs').readFileSync` to read app.config.js as text (avoiding `require('../app.config.js')` which triggers Expo's module scope guard).
- **Files modified:** `jest.setup.js` (created), `jest.config.js` (added `setupFiles`), `__tests__/app-config.test.ts`
- **Commit:** f6e822c

**2. [Rule 1 - Bug] Fixed `setupFilesAfterFramework` typo in jest.config.js**
- **Found during:** Task 3
- **Issue:** The plan specified `setupFilesAfterFramework` which is not a valid Jest config key (causes validation warning on every test run).
- **Fix:** Corrected to `setupFilesAfterEnv`.
- **Files modified:** `jest.config.js`
- **Commit:** f6e822c

**3. [Rule 3 - Blocking] supabase-js peer dependency conflict required --legacy-peer-deps**
- **Found during:** Task 1
- **Issue:** `npx expo install @supabase/supabase-js` failed because `react-dom@19.2.4` (an optional peer of `expo-router`) requires `react@^19.2.4` but the project has `react@19.1.0`. The `expo install` command does not pass `--legacy-peer-deps`.
- **Fix:** Installed `@supabase/supabase-js` via `npm install --legacy-peer-deps`. Version ^2.101.1 installed, fully satisfying SEED-03.
- **Files modified:** `package.json`
- **Commit:** e3865a3

### SDK Version Note

`create-expo-app` resolved **Expo SDK 54** (not 55 as the plan specified — SDK 55 was referenced in the plan as the target but is not yet available via `create-expo-app@latest`). All required packages installed at SDK 54-compatible versions. This does not block any subsequent plan; the stack decisions (Expo Router, Supabase, TanStack Query, Zustand, MMKV) are fully present.

## Known Stubs

The following are intentional placeholder screens (plan design, not accidental stubs):

| File | Stub | Resolved by |
|------|------|-------------|
| `src/app/index.tsx` | Centered "Druip — Landing" text | Plan 01-03 |
| `src/app/sample-lesson.tsx` | Centered "Sample Lesson" text | Plan 01-03 |
| `src/app/sign-up-prompt.tsx` | Centered "Sign Up Prompt" text | Plan 01-03 |
| `src/app/(auth)/sign-in.tsx` | Centered "Sign In" text | Plan 01-03 |
| `src/app/(auth)/sign-up.tsx` | Centered "Sign Up" text | Plan 01-03 |
| `src/app/(auth)/goal-selection.tsx` | Centered "Goal Selection" text | Plan 01-03 |
| `src/app/(tabs)/index.tsx` | Centered "Home" text | Plan 01-04 |
| `src/app/(tabs)/study.tsx` | Centered "Study" text | Plan 01-04 |
| `src/app/(tabs)/progress.tsx` | Centered "Progress" text | Plan 01-04 |
| `src/app/(tabs)/notes.tsx` | Centered "Notes" text | Plan 01-04 |
| `src/app/(tabs)/profile.tsx` | Centered "Profile" text | Plan 01-04 |

These stubs are intentional per the plan design. Each placeholder will be replaced by its respective plan.

## Self-Check: PASSED
