---
phase: 05-student-discovery-and-subscriptions
plan: P00
subsystem: data-foundation
tags: [supabase, migration, rls, typescript, test-stubs]
dependency_graph:
  requires: []
  provides: [subscriptions-table, subscriptions-types, student-test-infrastructure]
  affects: [05-P01, 05-P02, 05-P03, 05-P04]
tech_stack:
  added: []
  patterns: [TEXT+CHECK constraint for status enum, (SELECT auth.uid()) subquery RLS pattern, it.todo() Wave 0 test stubs]
key_files:
  created:
    - supabase/migrations/00007_subscriptions.sql
    - src/features/student/__tests__/useAllClassrooms.test.ts
    - src/features/student/__tests__/useClassroomDetail.test.ts
    - src/features/student/__tests__/useMySubscriptions.test.ts
    - src/features/student/__tests__/useSubscribe.test.ts
  modified:
    - src/types/database.ts
decisions:
  - subscriptions.status uses TEXT + CHECK constraint matching Phase 4 card_type pattern — avoids migration complexity of Postgres enum
  - classrooms/classroom_sections/classroom_cards each got a public authenticated SELECT policy alongside existing tutor-scoped policies — Postgres OR logic applies
metrics:
  duration: 94s
  completed_date: "2026-04-06"
  tasks_completed: 2
  files_changed: 6
---

# Phase 05 Plan P00: Data Foundation Summary

**One-liner:** Subscriptions table with RLS, TypeScript types, and Wave 0 jest stubs for student discovery and subscription hooks.

## What Was Built

- Supabase migration `00007_subscriptions.sql` pushed to remote — creates `subscriptions` table (id, student_id, classroom_id, subscribed_at, status) with UNIQUE(student_id, classroom_id) constraint
- 3 new SELECT policies on `classrooms`, `classroom_sections`, and `classroom_cards` allowing any authenticated user to read published data
- 5 RLS policies total: 3 public browse policies + student own-row read/insert + tutor classroom subscriptions read
- `SubscriptionStatus` type alias and full `subscriptions` table Row/Insert/Update types added to `database.ts`
- `subscription_status` entry added to the Enums block
- 4 Wave 0 test stub files under `src/features/student/__tests__/` — all recognized by jest (13 todo, 0 failures)

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Write and push migration 00007_subscriptions.sql | a223b54 | supabase/migrations/00007_subscriptions.sql |
| 2 | Add subscriptions types to database.ts + Wave 0 test stubs | b543217 | src/types/database.ts, 4 test stubs |

## Verification Results

- `grep -c "CREATE TABLE subscriptions" 00007_subscriptions.sql` → 1
- `grep "SubscriptionStatus" src/types/database.ts` → 5 matches (type alias + Row + Insert + Update + Enums)
- `grep -c "subscriptions:" src/types/database.ts` → 1
- `npx jest "features/student"` → 4 suites passed, 13 todo, 0 failures
- `supabase db push` → Finished successfully (00007_subscriptions.sql applied)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — this plan creates test stubs intentionally as Wave 0 scaffolding. The it.todo() stubs will be implemented in subsequent plans (P01–P04).

## Self-Check: PASSED

- supabase/migrations/00007_subscriptions.sql: FOUND
- src/types/database.ts (SubscriptionStatus): FOUND
- src/features/student/__tests__/useAllClassrooms.test.ts: FOUND
- src/features/student/__tests__/useClassroomDetail.test.ts: FOUND
- src/features/student/__tests__/useMySubscriptions.test.ts: FOUND
- src/features/student/__tests__/useSubscribe.test.ts: FOUND
- Commit a223b54: FOUND
- Commit b543217: FOUND
