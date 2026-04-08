---
phase: 07-student-onboarding
plan: P01
subsystem: onboarding hooks + auth store + classroom filtering
tags: [tanstack-query, zustand, supabase, rls, react-native]
dependency_graph:
  requires:
    - P00 (subject_tags, student_profiles, student_subject_tags tables + TypeScript types)
  provides:
    - useSubjectTags hook
    - useStudentProfile hook (maybeSingle — null-safe for new users)
    - useUpsertStudentProfile mutation hook
    - useStudentSubjectTags + useSaveStudentSubjectTags hooks
    - pendingStudentOnboarding flag in useAuthStore
    - Tag-filtered useAllClassrooms(tagIds?) query
  affects:
    - src/features/auth/useAuthStore.ts
    - src/features/student/useAllClassrooms.ts
tech_stack:
  added: []
  patterns:
    - useQuery with maybeSingle() for nullable single-row reads
    - useMutation with upsert + onConflict: 'id' for progressive profile accumulation
    - delete + insert pattern for replacing junction table selections
    - Two-step tag filter query (fetch IDs, then .in()) to avoid ambiguous nested !inner joins
    - isLoading held true until async onboarding check resolves (prevents root guard flash)
key_files:
  created:
    - src/features/onboarding/useSubjectTags.ts
    - src/features/onboarding/useStudentProfile.ts
    - src/features/onboarding/useUpsertStudentProfile.ts
    - src/features/onboarding/useStudentSubjectTags.ts
  modified:
    - src/features/auth/useAuthStore.ts
    - src/features/student/useAllClassrooms.ts
decisions:
  - useStudentProfile uses maybeSingle() not single() — new users have no student_profiles row; single() would throw PGRST116
  - checkStudentOnboarding extracted as standalone async function — called by both initializeAuthListener getUser path and onAuthStateChange SIGNED_IN path
  - useAllClassrooms tag filtering uses two-step query (fetch classroom_subject_tags IDs, then .in()) — avoids ambiguous nested !inner joins with existing tutors!inner
  - empty tagIds skips filter entirely — empty .in() would return zero rows (Pitfall 5 from RESEARCH.md)
  - onAuthStateChange defers setLoading(false) until after checkStudentOnboarding resolves — prevents race condition for returning students
metrics:
  duration: ~3 minutes
  completed: 2026-04-08
  tasks_completed: 2
  files_changed: 6
requirements:
  - ONBD-01
  - ONBD-05
  - ONBD-08
---

# Phase 07 Plan P01: Onboarding Query Hooks + Auth Store + Classroom Filtering Summary

**One-liner:** 4 TanStack Query hooks for student onboarding data layer (subject tags, student profiles, tag selections) plus pendingStudentOnboarding flag in Zustand auth store and tag-filtered classroom query via classroom_subject_tags junction.

## What Was Built

### Task 1: Onboarding Query Hooks

**src/features/onboarding/useSubjectTags.ts**
- `useQuery` over `subject_tags` table, ordered by name
- No auth guard — subject tags are public read for all authenticated users
- Returns `data ?? []` — never null

**src/features/onboarding/useStudentProfile.ts**
- `useQuery` over `student_profiles` with `.maybeSingle()` — returns `null` for new users (no row), not an error
- Enabled only when userId is defined

**src/features/onboarding/useUpsertStudentProfile.ts**
- `useMutation` using Supabase `.upsert({ id: userId, ...fields }, { onConflict: 'id' })`
- Each onboarding screen passes only its own fields — progressive accumulation pattern
- Invalidates `['student_profile', userId]` on success

**src/features/onboarding/useStudentSubjectTags.ts**
- `useStudentSubjectTags`: reads `student_subject_tags` for current user, returns array of `tag_id` strings
- `useSaveStudentSubjectTags`: delete-all + insert-new mutation — atomically replaces tag selections
- Invalidates `['student_subject_tags', userId]` on success

### Task 2: useAuthStore + useAllClassrooms Updates

**src/features/auth/useAuthStore.ts**
- Added `pendingStudentOnboarding: boolean` to `AuthState` interface and initial state
- Added `setPendingStudentOnboarding` action
- Extracted `checkStudentOnboarding(userId)` helper: checks `profiles.is_tutor` (tutors skip), then checks `student_profiles.onboarding_complete` with `.maybeSingle()`
- `initializeAuthListener`: calls `checkStudentOnboarding` before `.finally(() => setLoading(false))` — `isLoading` stays `true` until check resolves
- `onAuthStateChange`: defers `setLoading(false)` until `checkStudentOnboarding` resolves — covers cold-start returning student path

**src/features/student/useAllClassrooms.ts**
- Signature changed from `useAllClassrooms()` to `useAllClassrooms(tagIds?: string[])`
- When `tagIds` is non-empty: two-step query — fetch matching `classroom_subject_tags.classroom_id` by tag IDs, then `.in('id', classroomIds)` on classrooms
- When `tagIds` is empty or undefined: skips filter entirely, returns all published classrooms
- Query key is `['classrooms', tagIds ?? []]` — tagged queries cache separately from untagged

## Commits

| Hash | Message |
|------|---------|
| 5611f99 | feat(07-P01): create onboarding query hooks (useSubjectTags, useStudentProfile, useUpsertStudentProfile, useStudentSubjectTags) |
| d76347b | feat(07-P01): add pendingStudentOnboarding to useAuthStore + tag filtering in useAllClassrooms |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All hooks are fully implemented. Wave 0 test stubs from P00 remain as `it.todo()` — these are intentional scaffolding to be filled in P03 (test implementation plan).

## Self-Check: PASSED
