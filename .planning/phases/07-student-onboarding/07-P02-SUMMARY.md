---
phase: 07-student-onboarding
plan: P02
subsystem: onboarding screens + navigation guard
tags: [react-native, expo-router, tanstack-query, zustand, supabase-storage, datetimepicker]
dependency_graph:
  requires:
    - P01 (useUpsertStudentProfile, useSubjectTags, useSaveStudentSubjectTags, useStudentSubjectTags, pendingStudentOnboarding in useAuthStore)
    - P00 (student_profiles table, subject_tags table, student_subject_tags table)
  provides:
    - 6 onboarding screens navigable from step-1 to step-6
    - OnboardingProgress component (step dots)
    - TagBubbleSelect reusable multi-select bubble component
    - UNIVERSITIES constant (8 SA universities with campuses)
    - HELP_TYPES constant (5 help type options)
    - Root guard extended with pendingStudentOnboarding
    - sign-up.tsx non-tutor redirect to onboarding
  affects:
    - src/app/_layout.tsx
    - src/app/(auth)/_layout.tsx
    - src/app/(auth)/sign-up.tsx
tech_stack:
  added:
    - "@react-native-community/datetimepicker@8.4.4"
  patterns:
    - Progressive upsert pattern — each screen saves only its own fields via useUpsertStudentProfile
    - TagBubbleSelect reused for both subject tags (DB-driven) and help types (hardcoded)
    - Photo upload via expo-image-picker + Supabase Storage avatars bucket at userId/profile.{ext}
    - Root guard uses !inAuth guard to prevent redirect loop when user is already in onboarding
    - Both onboarding_complete: true (DB) and setPendingStudentOnboarding(false) (Zustand) set at step-6 finish
key_files:
  created:
    - src/features/onboarding/universities.ts
    - src/features/onboarding/helpTypes.ts
    - src/features/onboarding/OnboardingProgress.tsx
    - src/features/onboarding/TagBubbleSelect.tsx
    - src/app/(auth)/onboarding/_layout.tsx
    - src/app/(auth)/onboarding/step-1-profile.tsx
    - src/app/(auth)/onboarding/step-2-university.tsx
    - src/app/(auth)/onboarding/step-3-degree.tsx
    - src/app/(auth)/onboarding/step-4-subjects.tsx
    - src/app/(auth)/onboarding/step-5-help-type.tsx
    - src/app/(auth)/onboarding/step-6-test-date.tsx
  modified:
    - src/app/(auth)/_layout.tsx
    - src/app/(auth)/sign-up.tsx
    - src/app/_layout.tsx
    - app.config.js
decisions:
  - TagBubbleSelect is a shared component used by both step-4-subjects (DB tags) and step-5-help-type (hardcoded) — avoids duplication with a single flexible interface { id, label }
  - Photo upload uses upsert (upsert: true) on Storage so re-runs don't error if file already exists
  - step-6-test-date uses `finishOnboarding(null)` for both Skip and no-date-selected paths — single code path for completion
  - Root guard condition `pendingStudentOnboarding && !inAuth` prevents redirect loop — once user is inside (auth)/onboarding, guard does not re-redirect
  - datetimepicker plugin added to app.config.js to satisfy Expo's native module config requirement
metrics:
  duration: ~10 minutes
  completed: 2026-04-08T15:28:12Z
  tasks_completed: 2
  files_changed: 14
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

# Phase 07 Plan P02: Onboarding Screens + Navigation Guard Summary

**One-liner:** 6-screen student onboarding flow with progressive Supabase upserts, photo upload, tag bubble selection, optional date picker, and root guard + sign-up redirect ensuring non-tutors complete onboarding before reaching the marketplace.

## What Was Built

### Task 1: Shared Components and Constants

**src/features/onboarding/universities.ts**
- `UNIVERSITIES` array with 8 South African universities (NWU, UP, Stellenbosch, UCT, Wits, UKZN, UFS, UJ)
- Each entry has `university` name and `campuses` array

**src/features/onboarding/helpTypes.ts**
- `HELP_TYPES` array with 5 options: Understanding content, Test preparation, Assignments, Exam preparation, Practical skills

**src/features/onboarding/OnboardingProgress.tsx**
- Row of filled/unfilled dots showing current step position
- Uses `COLORS.accent` for filled dots, `COLORS.border` for empty — no hardcoded hex values

**src/features/onboarding/TagBubbleSelect.tsx**
- Accepts `{ id, label }` options array, `selected` ID array, `onToggle` callback
- Tappable bubble chips with selected/unselected visual state using theme tokens
- Reused in step-4 (subject tags from DB) and step-5 (hardcoded help types)

**@react-native-community/datetimepicker**
- Installed via `npx expo install` (SDK 54 compatible version 8.4.4)
- Plugin added to `app.config.js`

### Task 2: Onboarding Screens + Navigation Wiring

**src/app/(auth)/onboarding/_layout.tsx**
- Stack navigator for all 6 steps, `headerShown: false`, `animation: slide_from_right`

**step-1-profile.tsx** (ONBD-02)
- Collects `first_name` (required), `last_name` (required), optional profile photo
- Photo upload: `expo-image-picker` → Supabase Storage bucket `avatars` at `{userId}/profile.{ext}`
- Public URL stored in `student_profiles.photo_url`
- Continue disabled until both name fields populated

**step-2-university.tsx** (ONBD-03)
- Scrollable list of `UNIVERSITIES` — tap to select
- Campuses list appears once university selected — tap to select campus
- Saves `university` + `campus` via upsert, then navigates to step-3

**step-3-degree.tsx** (ONBD-04)
- Free-text `TextInput` for degree/programme name
- Row of 6 circular bubbles for year of study (1–6), selected gets accent background
- Saves `degree` + `year_of_study` via upsert

**step-4-subjects.tsx** (ONBD-05)
- Fetches tags via `useSubjectTags()` — shows `ActivityIndicator` while loading
- Maps tags to `TagBubbleSelect` options
- Saves via `useSaveStudentSubjectTags().mutateAsync(selectedTagIds)` (delete + insert pattern from P01)
- At least 1 tag required to continue

**step-5-help-type.tsx** (ONBD-06)
- Uses `TagBubbleSelect` with `HELP_TYPES` constant
- Saves `help_types: string[]` array to `student_profiles` via upsert
- At least 1 help type required to continue

**step-6-test-date.tsx** (ONBD-07)
- Optional `DateTimePicker` — user can pick, clear, or skip entirely
- On Finish/Skip: saves `upcoming_test_date` + `onboarding_complete: true` to `student_profiles`
- Calls `useAuthStore.getState().setPendingStudentOnboarding(false)` to clear Zustand flag
- Navigates to `/(tabs)` via `router.replace`

**src/app/(auth)/_layout.tsx** — added `<Stack.Screen name="onboarding" />` to auth Stack

**src/app/(auth)/sign-up.tsx** — non-tutor branch now:
1. Sets session if available (mirrors tutor branch)
2. Calls `setPendingStudentOnboarding(true)`
3. `router.replace('/(auth)/onboarding/step-1-profile')`

**src/app/_layout.tsx** — root guard extended:
```typescript
const pendingStudentOnboarding = useAuthStore((s) => s.pendingStudentOnboarding);

// In useEffect:
if (session && !inTabs && !pendingTutorOnboarding && !pendingStudentOnboarding) {
  router.replace('/(tabs)');
} else if (session && pendingStudentOnboarding && !inAuth) {
  router.replace('/(auth)/onboarding/step-1-profile');
} else if (!session && inTabs) {
  router.replace('/');
}
// Dependency array includes pendingStudentOnboarding
```

## Commits

| Hash | Message |
|------|---------|
| d57316a | feat(07-P02): create onboarding shared components and constants |
| 78d77f0 | feat(07-P02): create 6 onboarding screens + layout + guard wiring |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All 6 screens are fully wired to their respective hooks and constants. Data flows from UI through hooks to Supabase on each step.

## Self-Check: PASSED
