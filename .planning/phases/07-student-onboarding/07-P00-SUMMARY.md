---
phase: 07-student-onboarding
plan: P00
subsystem: database + types + test scaffolding
tags: [supabase, migration, rls, typescript, jest]
dependency_graph:
  requires: []
  provides:
    - subject_tags table (Supabase)
    - classroom_subject_tags table (Supabase)
    - student_profiles table (Supabase)
    - student_subject_tags table (Supabase)
    - TypeScript types for all 4 new tables
    - Wave 0 test stubs for onboarding hooks
  affects:
    - src/types/database.ts
    - src/features/student/__tests__/useAllClassrooms.test.ts
tech_stack:
  added: []
  patterns:
    - RLS (SELECT auth.uid()) subquery on all user-scoped policies
    - it.todo() Wave 0 stubs with no imports (Phase 4 decision)
    - student_profiles 1-to-1 FK to profiles(id), mirrors tutors pattern
key_files:
  created:
    - supabase/migrations/00013_student_onboarding.sql
    - src/features/onboarding/__tests__/useStudentProfile.test.ts
    - src/features/onboarding/__tests__/useSubjectTags.test.ts
    - src/features/onboarding/__tests__/useStudentSubjectTags.test.ts
  modified:
    - src/types/database.ts
    - src/features/student/__tests__/useAllClassrooms.test.ts
decisions:
  - student_profiles uses profiles(id) as PK (1-to-1, mirrors tutors pattern)
  - subject_tags shared between tutors and students — single source of truth for tags
  - classroom_subject_tags junction replaces classrooms.subjects TEXT[] as source of truth (subjects column retained for backward compatibility)
  - Wave 0 stubs use it.todo() with no imports, per Phase 4 precedent
metrics:
  duration: ~5 minutes
  completed: 2026-04-08
  tasks_completed: 2
  files_changed: 6
requirements:
  - ONBD-01
  - ONBD-02
  - ONBD-03
  - ONBD-04
  - ONBD-05
  - ONBD-06
  - ONBD-07
  - ONBD-08
---

# Phase 07 Plan P00: Student Onboarding Data Foundation Summary

**One-liner:** Supabase migration creating 4 new tables (subject_tags, classroom_subject_tags, student_profiles, student_subject_tags) with RLS policies + data migration from classrooms.subjects TEXT[] + TypeScript types + Wave 0 jest stubs.

## What Was Built

### Task 1: Migration 00013_student_onboarding.sql

Created and pushed `supabase/migrations/00013_student_onboarding.sql` containing:

- **subject_tags** — shared tag library for tutors and students. Read policy for all authenticated users, no write policy for students (tutor tag management via classroom_subject_tags only).
- **classroom_subject_tags** — classroom-to-tag junction replacing classrooms.subjects TEXT[]. RLS: public read for authenticated users; full management for the owning tutor.
- **student_profiles** — student-specific onboarding data, 1-to-1 FK to profiles(id). RLS: own row only (SELECT/INSERT/UPDATE). Includes updated_at trigger.
- **student_subject_tags** — student-to-tag junction. RLS: own rows only (ALL).
- **Data migration** — existing classrooms.subjects TEXT[] values extracted into subject_tags (slug = lowercased, spaces to hyphens) and classroom_subject_tags via INSERT ... ON CONFLICT DO NOTHING.

Migration pushed successfully via `npx supabase db push`.

### Task 2: TypeScript Types + Wave 0 Test Stubs

**src/types/database.ts** additions:
- `HelpType` type alias
- `subject_tags`, `classroom_subject_tags`, `student_profiles`, `student_subject_tags` table entries (Row/Insert/Update/Relationships)

**New test stub files:**
- `src/features/onboarding/__tests__/useStudentProfile.test.ts` — 8 it.todo stubs across `useStudentProfile` and `useUpsertStudentProfile`
- `src/features/onboarding/__tests__/useSubjectTags.test.ts` — 2 it.todo stubs
- `src/features/onboarding/__tests__/useStudentSubjectTags.test.ts` — 3 it.todo stubs

**Updated:**
- `src/features/student/__tests__/useAllClassrooms.test.ts` — 3 tag-filtering stubs added

Jest result: 7 suites, 29 todos, 0 failures.

## Commits

| Hash | Message |
|------|---------|
| 27721d8 | feat(07-P00): write and push migration 00013_student_onboarding |
| 55a4633 | feat(07-P00): add TypeScript types for new tables + Wave 0 test stubs |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

All stubs are intentional Wave 0 scaffolding. No stubs block plan goal (data foundation). Hooks will be implemented in P01–P03.

## Self-Check: PASSED

- [x] `supabase/migrations/00013_student_onboarding.sql` exists with 4 CREATE TABLE statements
- [x] `supabase db push` completed successfully (exit 0)
- [x] `grep "student_profiles" src/types/database.ts` returns 2 matches
- [x] `npx jest` exits 0, 7 suites, 29 todos recognised
- [x] Commits 27721d8 and 55a4633 exist
