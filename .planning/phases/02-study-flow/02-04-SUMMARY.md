---
phase: 02-study-flow
plan: "04"
subsystem: lesson-complete
tags: [react-native, tanstack-query, zustand, lesson-complete, schema-push]
dependency_graph:
  requires: [02-01, 02-02, 02-03]
  provides: [LessonCompleteScreen, useProfile, completion-mutation-trigger]
  affects: []
tech_stack:
  added: []
  patterns: [tanstack-query-profile-hook, useEffect-mutation-on-mount, router-replace-navigation]
key_files:
  created:
    - src/app/lesson-complete.tsx
    - src/features/study/useProfile.ts
  modified:
    - __tests__/lesson-complete.test.tsx
decisions:
  - "useProfile uses enabled: !!userId guard to prevent queries before auth resolves"
  - "Completion mutation fires in useEffect with isSuccess + isPending guards to prevent duplicate writes"
  - "router.replace used for Continue CTA (not push) so back gesture does not return to completed lesson session (D-09)"
  - "Database schema push (Task 2) requires SUPABASE_ACCESS_TOKEN — blocked at auth gate, requires user to run supabase link and db push manually"
metrics:
  duration: "~2m (Task 1 complete; Task 2 auth-gated)"
  completed_date: "2026-04-06"
  tasks_completed: 1
  files_created: 2
  files_modified: 1
---

# Phase 2 Plan 04: Lesson-Complete Screen + Schema Push Summary

**One-liner:** Lesson-complete screen displaying XP (28pt), score in "N of M correct" format, streak count, and Continue CTA wired to completion mutation — plus useProfile hook for Supabase profiles query. Database push pending user auth token.

## What Was Built

### Lesson-Complete Screen (Task 1)

`src/app/lesson-complete.tsx`:
- Extracts route params: `score`, `total`, `lessonId`, `topicId`, `xpReward` from Expo Router `useLocalSearchParams`
- Fires `useCompleteLesson` mutation on mount via `useEffect` with idempotent guards (`isSuccess`, `isPending`)
- Displays XP earned: "XP earned" label (14pt muted) + XP value (28pt semibold) per UI-SPEC
- Score summary: `"{score} of {total} correct"` — 16pt regular, centered
- Streak count: `"Current streak: {N} days"` — 16pt regular, centered (D-09)
- Continue CTA: full-width, `COLORS.accent` background, `minHeight: 48`, `borderRadius: RADII.button` (12pt)
- `router.replace(`/(tabs)/study/${topicId}`)` on Continue press — replace not push (D-09)
- `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}` on CTA (STUDY-08)
- Tone: calm — no confetti, no animations, no effusive language (D-10)

### useProfile Hook (Task 1)

`src/features/study/useProfile.ts`:
- TanStack Query hook: `queryKey: ['profile', userId]`
- Fetches `streak_count, total_xp` from Supabase `profiles` table
- `enabled: !!userId` prevents queries before auth resolves
- `.throwOnError()` for TanStack Query error integration

### Test Coverage (Task 1)

`__tests__/lesson-complete.test.tsx` — 5 passing tests (replacing Wave 0 todo stubs):
- Renders XP value "10" on screen
- Renders "XP earned" label
- Renders score summary "12 of 15 correct"
- Renders streak count "Current streak: 5 days"
- Renders "Continue" CTA button

All mocks: `useLocalSearchParams`, `useProfile`, `useCompleteLesson`, `useAuthStore`, `useRouter`.

## Task 2: Database Schema Push — Auth Gate

**Status:** Blocked — requires `SUPABASE_ACCESS_TOKEN`

**What was attempted:** `npx supabase db push` → error "Cannot find project ref. Have you run supabase link?"

**Root cause:** `supabase link` requires `SUPABASE_ACCESS_TOKEN` which is a personal access token from the Supabase dashboard. Not present in environment.

**The migration file exists and is correct:** `supabase/migrations/00004_lesson_attempts.sql` was created in Plan 01 and contains:
- `lesson_attempts` table with RLS
- `questions_explanation_required_when_published` CHECK constraint (CONT-06)

**To complete Task 2, the user must:**
1. Get access token from: Supabase Dashboard → Account → Access Tokens → Generate new token
2. Run: `export SUPABASE_ACCESS_TOKEN="<token>"`
3. Run: `npx supabase link --project-ref ciwjpxqqqvbaapsjfypj`
4. Run: `npx supabase db push`

## Deviations from Plan

### Auth Gates

**Task 2: Database schema push requires SUPABASE_ACCESS_TOKEN**
- **Found during:** Task 2 execution
- **Issue:** `supabase link` and `supabase db push` require a personal access token that cannot be automated
- **Status:** Blocked — user must provide token and run commands manually
- **Migration file:** Ready at `supabase/migrations/00004_lesson_attempts.sql`

### No Other Deviations

Task 1 executed exactly as planned.

## Verification Results

```
Test Suites: 13 passed, 13 total
Tests:       34 todo, 25 passed, 59 total
Time:        0.667 s
```

All tests pass. 5 new lesson-complete tests pass (up from 4 todos).

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | eca0a9f | feat(02-04): lesson-complete screen + useProfile hook + completion mutation + tests |
| Task 2 | — | Blocked at auth gate — requires SUPABASE_ACCESS_TOKEN |

## Known Stubs

None — lesson-complete screen and useProfile hook are fully implemented and wired to real data. The database push is pending (auth gate), not a code stub.

## Self-Check: PASSED
