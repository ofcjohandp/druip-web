---
phase: "01-foundation"
plan: "03"
subsystem: "auth-onboarding"
tags: ["auth", "onboarding", "expo-router", "zustand", "supabase", "stack-protected", "react-native"]

dependency_graph:
  requires:
    - phase: "01-01"
      provides: "Expo Router file structure with placeholder screens for index, sample-lesson, sign-up-prompt, (auth)/*, (tabs)/*"
    - phase: "01-02"
      provides: "supabase client singleton at src/lib/supabase.ts, Database types, AppProviders, profiles table with daily_goal column"
    - phase: "01-04"
      provides: "theme.ts design tokens (COLORS, RADII, SPACING) — imported by all screens"
  provides:
    - "Complete play-first onboarding flow: landing → sample lesson → sign-up prompt → auth → goal selection → tabs"
    - "useAuthStore: Zustand store with session/isLoading/isOnline state and initializeAuthListener"
    - "SessionProvider: bridges Supabase auth events to store with NetInfo offline tracking"
    - "Stack.Protected auth routing in root _layout.tsx (3 guards: public, authenticated, unauthenticated)"
    - "5-question sample lesson engine with progress bar, answer locking, and feedback (hardcoded, no Supabase)"
    - "Email/password sign-up (AUTH-02: no extra fields) navigating to goal selection"
    - "Email/password sign-in with offline notice (D-19)"
    - "3-card goal selection (Chill/Steady/Focused) storing daily_goal to profiles (AUTH-07)"
    - "useNotificationPermission scaffold (AUTH-08, trigger deferred to Phase 2)"
  affects:
    - "All subsequent phases — auth routing is the entry point to every authenticated screen"
    - "Phase 02 — lesson completion screen will call requestNotificationPermission (AUTH-08)"

tech-stack:
  added: []
  patterns:
    - "useAuthStore.getUser() then getSession() pattern — server-validates token before reading full session (AUTH-04)"
    - "initializeAuthListener called once in SessionProvider useEffect — single source of auth event truth"
    - "Stack.Protected with guard={!session} for unauthenticated routes, guard={!!session} for authenticated"
    - "SplashScreen.hideAsync() deferred until isLoading=false — no flash of wrong screen on launch"
    - "Hardcoded sample questions in sampleQuestions.ts — zero Supabase dependency for sample lesson (T-06)"

key-files:
  created:
    - "src/features/auth/useAuthStore.ts"
    - "src/features/auth/SessionProvider.tsx"
    - "src/features/auth/useNotificationPermission.ts"
    - "src/features/onboarding/sampleQuestions.ts"
    - "src/features/onboarding/SampleLessonEngine.tsx"
  modified:
    - "src/providers/AppProviders.tsx (added SessionProvider wrapper)"
    - "src/app/_layout.tsx (replaced placeholder with Stack.Protected auth routing)"
    - "src/app/index.tsx (replaced placeholder with landing screen)"
    - "src/app/sample-lesson.tsx (replaced placeholder with SampleLessonEngine wrapper)"
    - "src/app/sign-up-prompt.tsx (replaced placeholder with score display and Create account CTA)"
    - "src/app/(auth)/_layout.tsx (added slide_from_right animation, explicit screen list)"
    - "src/app/(auth)/sign-in.tsx (replaced placeholder with email/password form + offline notice)"
    - "src/app/(auth)/sign-up.tsx (replaced placeholder with email/password only form AUTH-02)"
    - "src/app/(auth)/goal-selection.tsx (replaced placeholder with 3-card goal selection AUTH-07)"

decisions:
  - "SplashScreen.hideAsync() called inside RootNavigator (child of AppProviders) so useAuthStore is in provider scope before hide"
  - "SampleLessonEngine imports from theme.ts (Plan 04) rather than hardcoding values — Plan 04 ran in same wave"
  - "handleContinue on last question passes current score state (already incremented by handleOptionPress) — no double-count"
  - "sign-in button disabled when !isOnline per D-19 — prevents confusing network error on offline tap"

metrics:
  duration: "6m"
  completed_date: "2026-04-06"
  tasks_completed: 3
  tasks_total: 3
  files_created: 5
  files_modified: 9
---

# Phase 01 Plan 03: Auth & Onboarding Flow Summary

**Complete play-first onboarding with Zustand auth store, Stack.Protected routing, 5-question sample lesson engine, email/password auth (AUTH-02), and 3-card daily goal selection (AUTH-07) — user journey from cold launch to authenticated tabs fully wired**

## What Was Built

The complete user journey from first app open to authenticated home screen:

- **useAuthStore** (Zustand): `session`, `isLoading`, `isOnline` state with `initializeAuthListener` that uses `getUser()` then `getSession()` to avoid `AuthSessionMissingError` (AUTH-04). Defensive `.catch()` sets session to null on offline launch (AUTH-05).
- **SessionProvider**: Single-mount `useEffect` calls `initializeAuthListener` and subscribes to NetInfo for offline tracking (D-19). Wraps children inside `AppProviders`.
- **Root _layout.tsx**: Replaced with `Stack.Protected` routing — `guard={!session}` wraps sample-lesson and sign-up-prompt (unauthenticated only); `guard={!!session}` wraps (tabs) (authenticated only); `guard={!session}` wraps (auth). `SplashScreen.hideAsync()` fires when `isLoading` becomes false.
- **Landing screen** (`index.tsx`): "Druip" logo, "Study smarter, not harder" tagline, "Try a lesson" CTA, secondary "I already have an account" link (D-01).
- **sampleQuestions.ts**: 5 hardcoded physio-themed questions — no Supabase import (T-06 mitigation).
- **SampleLessonEngine**: Progress bar, one-at-a-time questions, answer locking on tap, correct/wrong colour feedback, explanation shown on wrong answer, "Continue" / "See results" button.
- **sample-lesson.tsx**: Wraps engine, navigates to sign-up-prompt with `{ score, total }` params on completion.
- **sign-up-prompt.tsx**: Shows score ("You scored X/Y"), "Create account" primary CTA, "I already have an account" secondary link (D-04, D-05, D-06).
- **sign-in.tsx**: Email/password form with offline banner when `isOnline=false`, button disabled offline, `signInWithPassword` — no other fields (D-19).
- **sign-up.tsx**: Email/password only — no university, student number, or year fields (AUTH-02). Navigates to goal-selection on success.
- **goal-selection.tsx**: 3 cards (Chill/Steady/Focused), single-tap stores `daily_goal` to `profiles` table and navigates to `/(tabs)` (AUTH-07, D-07, D-08, D-09).
- **useNotificationPermission.ts**: Scaffold with `requestNotificationPermission()` exported — AUTH-08 comment referencing Phase 2 trigger.

## Verification Results

| Check | Result |
|-------|--------|
| Stack.Protected blocks in _layout.tsx | 3 guards (confirmed) |
| initializeAuthListener in useAuthStore | present |
| onAuthStateChange subscription | present |
| SessionProvider in AppProviders | present |
| sampleQuestions.ts supabase import | none (T-06 satisfied) |
| SAMPLE_QUESTIONS count | 5 |
| Offline banner in sign-in | present |
| AUTH-02: no extra signup fields | confirmed |
| Goal cards count | 3 (Chill, Steady, Focused) |
| Jest: 5 auth/routing test suites | 5 passed, 21 todo |

## Task Commits

1. **Task 1: Auth store, session provider, Stack.Protected routing** — `0418fd4`
2. **Task 2: Play-first onboarding screens** — `0067e44`
3. **Task 3: Auth screens (sign-in, sign-up, goal selection)** — `332bed6`

## Files Created/Modified

**Created (5):**
- `src/features/auth/useAuthStore.ts` — Zustand store + initializeAuthListener
- `src/features/auth/SessionProvider.tsx` — auth event bridge with NetInfo
- `src/features/auth/useNotificationPermission.ts` — AUTH-08 scaffold
- `src/features/onboarding/sampleQuestions.ts` — 5 hardcoded physio questions
- `src/features/onboarding/SampleLessonEngine.tsx` — question-by-question lesson engine

**Modified (9):**
- `src/providers/AppProviders.tsx` — added SessionProvider wrapper
- `src/app/_layout.tsx` — Stack.Protected auth routing with SplashScreen
- `src/app/index.tsx` — landing screen
- `src/app/sample-lesson.tsx` — SampleLessonEngine wrapper
- `src/app/sign-up-prompt.tsx` — score display + Create account CTA
- `src/app/(auth)/_layout.tsx` — slide_from_right animation
- `src/app/(auth)/sign-in.tsx` — email/password + offline notice
- `src/app/(auth)/sign-up.tsx` — email/password only (AUTH-02)
- `src/app/(auth)/goal-selection.tsx` — 3-card goal selection (AUTH-07)

## Decisions Made

- `SplashScreen.hideAsync()` called in `RootNavigator` (child component of `AppProviders`) so `useAuthStore` is inside the Zustand provider scope before the splash hides
- `SampleLessonEngine` imports from `src/features/ui/theme.ts` (available from Plan 04, same wave) rather than hardcoding values — keeps design tokens as single source of truth
- `handleContinue` on last question passes the already-incremented `score` state value — no double-counting
- Sign-in button disabled when `!isOnline` to prevent confusing network error messages on offline tap

## Deviations from Plan

None — plan executed exactly as written. All 3 tasks match acceptance criteria. Theme.ts was available (Plan 04 ran in same wave), so SampleLessonEngine imports from it rather than hardcoding values as the fallback path specified.

## Known Stubs

None. All screens specified in this plan are fully implemented. Tab screens (Home, Study, Progress, Notes, Profile) remain as intentional placeholders from Plan 04 — those are out of scope for this plan.

## Self-Check: PASSED

- FOUND: src/features/auth/useAuthStore.ts
- FOUND: src/features/auth/SessionProvider.tsx
- FOUND: src/features/auth/useNotificationPermission.ts
- FOUND: src/features/onboarding/sampleQuestions.ts
- FOUND: src/features/onboarding/SampleLessonEngine.tsx
- FOUND: src/providers/AppProviders.tsx
- FOUND: src/app/_layout.tsx
- FOUND: src/app/index.tsx
- FOUND: src/app/sample-lesson.tsx
- FOUND: src/app/sign-up-prompt.tsx
- FOUND: src/app/(auth)/_layout.tsx
- FOUND: src/app/(auth)/sign-in.tsx
- FOUND: src/app/(auth)/sign-up.tsx
- FOUND: src/app/(auth)/goal-selection.tsx
- FOUND commit 0418fd4 (Task 1)
- FOUND commit 0067e44 (Task 2)
- FOUND commit 332bed6 (Task 3)
