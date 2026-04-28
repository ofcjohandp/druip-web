---
phase: 03-tutor-onboarding
plan: 01
subsystem: database-schema
tags: [supabase, rls, typescript-types, test-stubs, tutor, classrooms]
dependency_graph:
  requires: []
  provides: [tutors-table, classrooms-table, is_tutor-column, tutor-typescript-types, wave-0-test-stubs]
  affects: [03-02, 03-03, 03-04]
tech_stack:
  added: []
  patterns: [rls-auth-uid-subquery, integer-cents-for-price, postgres-text-array-for-subjects]
key_files:
  created:
    - supabase/migrations/00005_tutor_tables.sql
    - src/features/tutor/__tests__/useCreateClassroom.test.ts
    - src/features/tutor/__tests__/useUpdateClassroom.test.ts
    - src/app/(auth)/__tests__/sign-up.test.tsx
    - src/app/(auth)/__tests__/create-classroom.test.tsx
  modified:
    - src/types/database.ts
decisions:
  - "price_cents stored as INTEGER (R180 = 18000) to avoid floating-point issues"
  - "subjects stored as TEXT[] Postgres array — PostgREST serializes natively, Phase 5 filtering ready"
  - "Separate tutors table (not just is_tutor on profiles) for future tutor-specific fields (payout, verification)"
  - "is_tutor boolean denormalized on profiles for fast conditional rendering without extra query"
  - "RLS uses (SELECT auth.uid()) subquery pattern — consistent with project conventions"
metrics:
  duration: ~8 minutes
  completed: 2026-04-06
  tasks_completed: 2
  tasks_blocked: 1
  files_created: 5
  files_modified: 1
---

# Phase 3 Plan 1: Schema + Types + Test Stubs Summary

**One-liner:** Supabase migration adding `is_tutor` on profiles, `tutors` table, and `classrooms` table with RLS; TypeScript types updated; 4 Wave 0 test stubs created with 16 pending todos.

## Tasks Completed

| Task | Name | Status | Key Output |
|------|------|--------|-----------|
| 1 | Create Supabase migration and update TypeScript types | Complete | `00005_tutor_tables.sql`, `database.ts` updated |
| 3 | Create Wave 0 test stubs (Nyquist) | Complete | 4 test files, 16 `it.todo()` entries, Jest green |

## Tasks Blocked

| Task | Name | Blocked By |
|------|------|-----------|
| 2 | Push Supabase schema migration | Requires `SUPABASE_ACCESS_TOKEN` + interactive `npx supabase db push` |

## Decisions Made

1. **Price as integer cents** — `price_cents INTEGER NOT NULL DEFAULT 18000` (R180 = 18000). Avoids floating-point arithmetic errors in Phase 5 subscription display/calculation.
2. **Subjects as TEXT[] array** — Native Postgres array column; PostgREST serializes without manual JSON handling. Enables Phase 5 subject-based filtering queries.
3. **Separate tutors table** — Tutor identity is its own entity rather than just a flag on profiles. Enables Phase 4+ additions (payout details, verification status, ratings) without polluting the profiles table.
4. **Denormalized is_tutor on profiles** — Fast boolean read for conditional rendering in Profile tab without needing a second query round-trip to the tutors table.
5. **RLS uses (SELECT auth.uid()) subquery** — Matches the established project convention from `00003_rls_policies.sql` and `00004_lesson_attempts.sql`.

## Migration File: supabase/migrations/00005_tutor_tables.sql

Acceptance criteria verified:
- `CREATE TABLE tutors` — 1 occurrence
- `CREATE TABLE classrooms` — 1 occurrence
- `ENABLE ROW LEVEL SECURITY` — 2 occurrences (tutors + classrooms)
- `auth.uid()` — 5 occurrences (2 tutors policies + 3 classrooms policies)
- `is_tutor` — 2 occurrences (comment + ALTER TABLE statement)
- `price_cents.*INTEGER` — 1 occurrence

## TypeScript Types Updated

Added to `src/types/database.ts`:
- `profiles.Row.is_tutor: boolean` (after `streak_freezes`)
- `tutors` table with Row / Insert / Update
- `classrooms` table with Row / Insert / Update

No new TypeScript errors introduced by these changes (pre-existing errors in Phase 2 code are unrelated).

## Test Stubs (Wave 0 Nyquist)

| File | Describe Block | Todos |
|------|---------------|-------|
| `src/features/tutor/__tests__/useCreateClassroom.test.ts` | `useCreateClassroom` | 5 |
| `src/features/tutor/__tests__/useUpdateClassroom.test.ts` | `useUpdateClassroom` | 4 |
| `src/app/(auth)/__tests__/sign-up.test.tsx` | `SignUpScreen — tutor toggle` | 3 |
| `src/app/(auth)/__tests__/create-classroom.test.tsx` | `CreateClassroomScreen` | 4 |

Jest result: **4 passed, 16 todo** — Wave 0 Nyquist requirement satisfied.

## Deviations from Plan

**1. [Rule 1 - Bug] RLS policy auth.uid() uses subquery pattern**

- **Found during:** Task 1
- **Issue:** The plan's SQL used bare `auth.uid()` calls. The project's established convention (from `00004_lesson_attempts.sql` and STATE.md decision log) uses `(SELECT auth.uid())` subquery for RLS performance.
- **Fix:** Applied `(SELECT auth.uid())` subquery pattern to all 5 RLS policy references in the migration.
- **Files modified:** `supabase/migrations/00005_tutor_tables.sql`

Note: The acceptance criteria for `grep -c "auth.uid()"` still returns 5 because both patterns match the grep pattern.

**2. Pre-existing TypeScript errors** (out of scope — deferred)

- `@expo/vector-icons/Ionicons` type declaration not found — pre-existing from Phase 1/2
- Phase 2 study feature query type errors — pre-existing, unrelated to tutor schema
- These are NOT introduced by this plan and are tracked in deferred-items.md

## Blocked: Task 2 — Supabase Schema Push

Task 2 is a `checkpoint:human-action` gate. The migration file is ready at `supabase/migrations/00005_tutor_tables.sql`. The user must:

1. Ensure `SUPABASE_ACCESS_TOKEN` is set (Supabase Dashboard → Account → Access Tokens)
2. Run: `npx supabase db push`
3. Confirm 'y' if prompted
4. Verify in Supabase Dashboard: `tutors` table, `classrooms` table, `profiles.is_tutor` column, RLS policies on both new tables

## Known Stubs

None — this plan creates no UI components with placeholder data. All test stubs are intentional Wave 0 structure (not data stubs).

## Self-Check: PASSED

Files verified:
- `supabase/migrations/00005_tutor_tables.sql` — EXISTS
- `src/types/database.ts` — EXISTS, contains `is_tutor: boolean`, `tutors:`, `classrooms:`, `price_cents: number`
- `src/features/tutor/__tests__/useCreateClassroom.test.ts` — EXISTS, 5 todos
- `src/features/tutor/__tests__/useUpdateClassroom.test.ts` — EXISTS, 4 todos
- `src/app/(auth)/__tests__/sign-up.test.tsx` — EXISTS, 3 todos
- `src/app/(auth)/__tests__/create-classroom.test.tsx` — EXISTS, 4 todos
