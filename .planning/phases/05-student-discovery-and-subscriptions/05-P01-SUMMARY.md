---
phase: 05-student-discovery-and-subscriptions
plan: P01
subsystem: student-data-hooks
tags: [tanstack-query, supabase, hooks, student, subscriptions]
dependency_graph:
  requires: [05-P00]
  provides: [useAllClassrooms, useClassroomDetail, useMySubscriptions, useSubscribe]
  affects: [05-P02, 05-P03, 05-P04]
tech_stack:
  added: []
  patterns: [TanStack Query useQuery with enabled guard, useMutation with dual invalidateQueries, Supabase join with tutors!inner(profiles!inner(email))]
key_files:
  created:
    - src/features/student/useAllClassrooms.ts
    - src/features/student/useClassroomDetail.ts
    - src/features/student/useMySubscriptions.ts
    - src/features/student/useSubscribe.ts
  modified: []
decisions:
  - useAllClassrooms uses tutors!inner(user_id, profiles!inner(email)) join — if FK relationship names differ in Supabase, fallback is tutors!inner(user_id) only
  - useSubscribe closes over userId from auth store at call time — if user logs out mid-session, invalidation targets the session userId (correct behavior)
metrics:
  duration: 125s
  completed_date: "2026-04-06"
  tasks_completed: 2
  files_changed: 4
---

# Phase 05 Plan P01: Student Data Hooks Summary

**One-liner:** Four TanStack Query hooks for student discovery and subscriptions — useAllClassrooms, useClassroomDetail, useMySubscriptions, useSubscribe — following established patterns from Phase 4.

## What Was Built

- `useAllClassrooms` — fetches all published classrooms with tutor join (`tutors!inner(user_id, profiles!inner(email))`), query key `['classrooms']`, enabled when userId present
- `useClassroomDetail` — fetches single classroom with sections ordered by sort_order asc, query key `['classroom-detail', classroomId]`, enabled when classroomId present
- `useMySubscriptions` — fetches current user's subscription rows, query key `['subscriptions', userId]`, enabled when userId present
- `useSubscribe` — mutation that inserts `{student_id, classroom_id, status: 'active'}` and invalidates both `['subscriptions', userId]` and `['classroom-detail', classroomId]` on success (D-17)

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | useAllClassrooms + useClassroomDetail + useMySubscriptions | 163c2e8 | src/features/student/useAllClassrooms.ts, useClassroomDetail.ts, useMySubscriptions.ts |
| 2 | useSubscribe mutation | 2bacaa0 | src/features/student/useSubscribe.ts |

## Verification Results

- `ls src/features/student/*.ts` → 4 files (useAllClassrooms, useClassroomDetail, useMySubscriptions, useSubscribe)
- `npx jest "features/student"` → 4 suites passed, 13 todo, 0 failures
- `grep "invalidateQueries" useSubscribe.ts | wc -l` → 2 (one for subscriptions, one for classroom-detail)
- Each hook uses correct query key per D-14, D-15, D-16, D-17

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. The it.todo() stubs in test files remain as Wave 0 scaffolding and will be implemented in subsequent plans once the screens are built.

## Self-Check: PASSED

- src/features/student/useAllClassrooms.ts: FOUND
- src/features/student/useClassroomDetail.ts: FOUND
- src/features/student/useMySubscriptions.ts: FOUND
- src/features/student/useSubscribe.ts: FOUND
- Commit 163c2e8: FOUND
- Commit 2bacaa0: FOUND
