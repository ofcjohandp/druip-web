---
phase: 03-tutor-onboarding
plan: 02
subsystem: tutor-signup-flow
tags: [react-native, expo-router, supabase, tanstack-query, zustand, tutor, classroom]
dependency_graph:
  requires: [03-01]
  provides: [isTutor-toggle, create-classroom-screen, useCreateClassroom-hook, SubjectTagInput-component, pendingTutorOnboarding-guard]
  affects: [03-03, 03-04]
tech_stack:
  added: []
  patterns: [zustand-flag-for-navigation-race, price-as-integer-cents, tanstack-mutation-for-supabase-write, tag-chip-input-pattern]
key_files:
  created:
    - src/features/tutor/useCreateClassroom.ts
    - src/features/tutor/SubjectTagInput.tsx
    - src/app/(auth)/create-classroom.tsx
  modified:
    - src/features/auth/useAuthStore.ts
    - src/app/(auth)/sign-up.tsx
    - src/app/(auth)/_layout.tsx
    - src/app/_layout.tsx
    - src/types/database.ts
decisions:
  - "pendingTutorOnboarding Zustand flag prevents root navigator guard from racing with create-classroom route"
  - "price_cents conversion: parseInt(price, 10) * 100 on write; default UI value '180'"
  - "SubjectTagInput manages local inputValue state; subjects[] lifted to parent via onSubjectsChange prop"
  - "Database Relationships: [] added to all table types to satisfy supabase-js GenericTable constraint"
metrics:
  duration: ~25 minutes
  completed: 2026-04-06
  tasks_completed: 2
  tasks_blocked: 0
  files_created: 3
  files_modified: 5
---

# Phase 3 Plan 2: Sign-up Toggle + Create Classroom Summary

**One-liner:** Tutor sign-up toggle with `pendingTutorOnboarding` race-condition guard, `useCreateClassroom` TanStack mutation (profiles + tutors + classrooms insert), `SubjectTagInput` tag chip component, and `create-classroom` form screen navigating to tabs on success.

## Tasks Completed

| Task | Name | Status | Key Output |
|------|------|--------|-----------|
| 1 | Create tutor feature hooks and SubjectTagInput component | Complete | `useCreateClassroom.ts`, `SubjectTagInput.tsx`, `useAuthStore.ts` extended |
| 2 | Modify sign-up screen, auth layout, root guard, and create classroom screen | Complete | `sign-up.tsx`, `_layout.tsx` (auth + root), `create-classroom.tsx` |

## Decisions Made

1. **`pendingTutorOnboarding` Zustand flag** — Set to `true` before `router.replace('/(auth)/create-classroom')` in sign-up; cleared to `false` after `router.replace('/(tabs)')` in create-classroom. Prevents the root navigator guard's `session && !inTabs` check from firing and overriding the tutor routing path.

2. **Price as integer cents** — UI pre-fills `"180"` (string); `parseInt(price, 10) * 100` converts to `18000` cents on write. Consistent with the schema decision from Plan 01.

3. **SubjectTagInput local state** — `inputValue` is local state inside the component; `subjects[]` is lifted to the parent via `onSubjectsChange` prop. Parent (create-classroom screen) owns the source of truth for subjects.

4. **`Relationships: []` added to all `Database` table types** — Required to satisfy `supabase-js` v2's `GenericTable` constraint. Without it, `Schema extends GenericSchema` resolves to `never`, making all Supabase table operations untyped. This fixes the pre-existing `never` type errors across Phase 1/2 study files as a side effect.

## Files Created

### `src/features/tutor/useCreateClassroom.ts`
TanStack Query `useMutation` hook. Three sequential Supabase writes: (1) `profiles.update({ is_tutor: true })`, (2) `tutors.insert({ user_id })`, (3) `classrooms.insert({ tutor_id, name, subjects, bio, price_cents, is_published: true })`. Returns the classroom object on success; throws on any step error.

### `src/features/tutor/SubjectTagInput.tsx`
Tag chip input component. Props: `subjects: string[]`, `onSubjectsChange`. Local `inputValue` state. Add on button press or `onSubmitEditing`. Remove via chip ✕ button (Ionicons `close`, 14px, COLORS.textMuted). Chips render in `flexDirection: 'row', flexWrap: 'wrap'` layout. Uses `Button` component (variant="ghost") for the Add button.

### `src/app/(auth)/create-classroom.tsx`
Classroom creation form screen. `KeyboardAvoidingView > ScrollView(keyboardShouldPersistTaps="handled") > form`. Fields: classroom name, subjects (SubjectTagInput), bio (optional, multiline), monthly price (R prefix, numeric keyboard, default "180"). CTA disabled when `!name.trim() || subjects.length === 0 || !price.trim()`. Loading state shows `ActivityIndicator`. On success: clears `pendingTutorOnboarding` flag, navigates to `/(tabs)`.

## Files Modified

### `src/features/auth/useAuthStore.ts`
Added `pendingTutorOnboarding: boolean` (default `false`) and `setPendingTutorOnboarding: (pending: boolean) => void` to `AuthState` interface and store.

### `src/app/(auth)/sign-up.tsx`
Added `isTutor` boolean state and `Switch` toggle card (Card component, "I want to teach" / "Create a classroom for your students"). Modified `handleSignUp` to branch: tutor path sets `pendingTutorOnboarding(true)` then routes to `create-classroom`; student path unchanged to `goal-selection`.

### `src/app/(auth)/_layout.tsx`
Added `<Stack.Screen name="create-classroom" />` to the auth stack navigator.

### `src/app/_layout.tsx`
Root navigator guard now reads `pendingTutorOnboarding` from auth store. Guard condition changed from `session && !inTabs` to `session && !inTabs && !pendingTutorOnboarding`. Added `pendingTutorOnboarding` to the `useEffect` dependency array.

### `src/types/database.ts`
Added `Relationships: []` to all table type definitions. Replaced `Omit<Row, ...>` patterns in `Insert` types with explicit field lists (required because `Omit` on a self-referential interface caused issues when `Relationships` was added). This resolves the pre-existing `never` type resolution bug across all Supabase operations.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added `Relationships: []` to all `Database` table types**

- **Found during:** Task 1 TypeScript verification (`npx tsc --noEmit`)
- **Issue:** `supabase-js` v2's `GenericTable` type requires a `Relationships` field. Without it, `Schema extends GenericSchema` evaluates to `never`, causing all Supabase table operations (`insert`, `update`, `select`) in new code to be typed as `never`. Same root cause as the pre-existing errors in `useCompleteLesson.ts` and other Phase 1/2 study files.
- **Fix:** Added `Relationships: []` to all table definitions in `src/types/database.ts`. Also replaced `Omit<Row, ...>` patterns with explicit `Insert` types to avoid self-referential type resolution issues.
- **Files modified:** `src/types/database.ts`
- **Side effect:** Pre-existing `never` errors in study/lesson files also resolved.

### Pre-existing Issues (out of scope — deferred)

- `@expo/vector-icons/Ionicons` type declaration not found — affects `SubjectTagInput.tsx` (new) and `LessonListItem.tsx`, `QuestionCard.tsx`, `(tabs)/_layout.tsx` (pre-existing Phase 1/2). Package `@expo/vector-icons` is not installed in `node_modules/@expo/`. Runtime works (Metro bundles it) but TypeScript cannot find the declaration. Tracked in deferred-items.

## Known Stubs

None — all form fields are wired to state and the mutation hook writes to real Supabase tables. The `create-classroom` screen has no placeholder data. Test stubs (Wave 0) are intentional structure from Plan 01, not data stubs.

## Self-Check

Files verified:
- `src/features/tutor/useCreateClassroom.ts` — EXISTS
- `src/features/tutor/SubjectTagInput.tsx` — EXISTS
- `src/app/(auth)/create-classroom.tsx` — EXISTS
- `src/features/auth/useAuthStore.ts` — EXISTS, contains `pendingTutorOnboarding` (3 occurrences)
- `src/app/(auth)/sign-up.tsx` — EXISTS, contains `isTutor`, `Switch`, `I want to teach`, `create-classroom`, `setPendingTutorOnboarding`
- `src/app/(auth)/_layout.tsx` — EXISTS, contains `create-classroom`
- `src/app/_layout.tsx` — EXISTS, contains `pendingTutorOnboarding`
- TypeScript: only pre-existing `@expo/vector-icons/Ionicons` errors remain; all new-code errors resolved
- Jest: 3 test suites passed, 12 todos (Wave 0 stubs), 0 failures

## Self-Check: PASSED
