---
phase: 02-study-flow
plan: "01"
subsystem: study-data
tags: [database, zustand, tanstack-query, tdd, rls, migrations]
dependency_graph:
  requires: []
  provides: [lesson_attempts-table, useStudySessionStore, useLessonQuestions, useTopics, useLessons, useCompleteLesson, wave0-test-stubs]
  affects: [02-02, 02-03, 02-04]
tech_stack:
  added: []
  patterns: [zustand-store, tanstack-query-hooks, rls-subquery-pattern, tdd-red-green]
key_files:
  created:
    - supabase/migrations/00004_lesson_attempts.sql
    - src/features/study/useStudySessionStore.ts
    - src/features/study/useLessonQuestions.ts
    - src/features/study/useTopics.ts
    - src/features/study/useLessons.ts
    - src/features/study/useCompleteLesson.ts
    - __tests__/study-session-store.test.ts
    - __tests__/question-card.test.tsx
    - __tests__/feedback-panel.test.tsx
    - __tests__/lesson-complete.test.tsx
  modified:
    - src/types/database.ts
decisions:
  - "useLessonQuestions uses .limit(20) safety cap to prevent runaway question lists"
  - "lockAnswer includes idempotent guard (if isLocked return) to block double-tap state mutation"
  - "useCompleteLesson writes to both lesson_attempts and user_lesson_progress atomically"
  - "softwareKeyboardLayoutMode=resize was already in app.config.js from Phase 1 — no change needed"
metrics:
  duration: "~12m"
  completed_date: "2026-04-06"
  tasks_completed: 3
  files_created: 10
  files_modified: 1
---

# Phase 2 Plan 01: Study Data Foundation Summary

**One-liner:** Lesson_attempts migration with RLS + CONT-06 constraint, Zustand quiz session store with idempotent lockAnswer, 5 TanStack Query hooks with throwOnError, and Wave 0 test stubs for all Phase 2 components.

## What Was Built

This plan establishes the complete data layer for the Druip study flow before any UI is built. All subsequent plans in Phase 2 (quiz engine, screens, lesson-complete) depend on these contracts.

### Database (Task 1)

`supabase/migrations/00004_lesson_attempts.sql` creates:
- `lesson_attempt_status_enum` ENUM (`in_progress`, `completed`)
- `lesson_attempts` table with id, user_id, lesson_id, score, total_questions, status, started_at, completed_at, timestamps
- Indexes on user_id, lesson_id, and compound user_id+lesson_id
- RLS enabled with `(SELECT auth.uid())` subquery pattern for SELECT and INSERT
- `questions_explanation_required_when_published` CHECK constraint (CONT-06): prevents `is_published=true` when `explanation IS NULL`

`src/types/database.ts` extended with:
- `LessonAttemptStatus` type alias
- `lesson_attempts` Row/Insert/Update shapes in the Database interface
- `lesson_attempt_status` enum entry

### Zustand Store (Task 2 — TDD)

`src/features/study/useStudySessionStore.ts` implements:
- `initSession(lessonId, questions)` — sets all fields, initializes answers array to null per question
- `lockAnswer(selectedIndex, isCorrect)` — sets isLocked, records answer, increments score if correct; idempotent guard prevents double-tap mutation
- `advance()` — increments currentIndex, clears isLocked
- `clearSession()` — resets all fields to initial values

### TanStack Query Hooks (Task 2)

| Hook | Purpose | Key detail |
|------|---------|------------|
| `useLessonQuestions` | Fetch questions for a lesson | `sections!inner(lesson_id)` join, `.limit(20)` safety cap |
| `useTopics` | Fetch published topics for a module | staleTime 5 min |
| `useLessons` | Fetch published lessons for a topic | staleTime 5 min |
| `useCompleteLesson` | Write completion to DB | Inserts lesson_attempts + upserts user_lesson_progress |

All hooks use `.throwOnError()` for TanStack Query error integration and import `supabase` from `@/lib/supabase`.

### Wave 0 Test Stubs (Task 3)

4 test files with requirement-tagged stubs for all Phase 2 components:
- `study-session-store.test.ts` — 8 store behavior tests (STUDY-01, 02, 04, 05)
- `question-card.test.tsx` — 5 component stubs (STUDY-03, 08)
- `feedback-panel.test.tsx` — 5 panel stubs (STUDY-06)
- `lesson-complete.test.tsx` — 4 screen stubs (STUDY-07)

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Notes

- `app.config.js` already contained `softwareKeyboardLayoutMode: 'resize'` from Phase 1 execution — STUDY-09 was already satisfied, no change needed. Documented as no-op.
- TDD RED phase: test file was written for the Zustand store before implementation, confirmed failing (module not found), then GREEN confirmed with 8/8 passing.

## Verification Results

```
Test Suites: 13 passed, 13 total
Tests:       48 todo, 10 passed, 58 total
Time:        0.703 s
```

All tests pass. `npx jest --passWithNoTests` exits 0.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | afbf4ca | feat(02-01): database migration for lesson_attempts + TypeScript types |
| Task 2 | 8719318 | feat(02-01): Zustand session store + TanStack Query hooks for study flow |
| Task 3 | e6e1341 | test(02-01): Wave 0 test stubs for Phase 2 components |

## Known Stubs

None — all files created in this plan are fully implemented (not stubs). The test files contain `test.todo()` stubs but those are intentional Wave 0 placeholders, not data stubs blocking the plan's goal.

## Self-Check: PASSED
