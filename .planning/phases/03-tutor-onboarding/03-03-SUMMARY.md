---
phase: 03-tutor-onboarding
plan: 03
subsystem: tutor-profile-settings
tags: [react-native, expo-router, tanstack-query, tutor, classroom-settings, profile]
dependency_graph:
  requires: [03-01, 03-02]
  provides: [useClassroom-hook, useUpdateClassroom-hook, profile-conditional-tutor-view, classroom-settings-screen]
  affects: [03-04]
tech_stack:
  added: []
  patterns: [explicit-return-type-cast-for-joined-queries, tanstack-query-invalidation-on-mutation, conditional-render-on-profile-flag]
key_files:
  created:
    - src/features/tutor/useClassroom.ts
    - src/features/tutor/useUpdateClassroom.ts
    - src/app/(tabs)/classroom-settings.tsx
  modified:
    - src/features/study/useProfile.ts
    - src/app/(tabs)/profile.tsx
    - src/app/(tabs)/_layout.tsx
decisions:
  - "useClassroom queryFn explicitly typed as Promise<ClassroomRow> to avoid never-type inference from joined Supabase select"
  - "My Classroom section heading added above the card to satisfy plan acceptance criteria and improve visual hierarchy"
metrics:
  duration: ~15 minutes
  completed: 2026-04-06
  tasks_completed: 2
  tasks_blocked: 0
  files_created: 3
  files_modified: 3
---

# Phase 3 Plan 3: Profile Conditional + Classroom Settings Summary

**One-liner:** `useClassroom` fetch hook (with explicit `ClassroomRow` return type), `useUpdateClassroom` mutation with cache invalidation, conditional Profile tab showing "My Classroom" card for tutors, and a pre-filled classroom settings screen with `Save changes` CTA.

## Tasks Completed

| Task | Name | Status | Key Output |
|------|------|--------|------------|
| 1 | Create useClassroom, useUpdateClassroom hooks and extend useProfile | Complete | `useClassroom.ts`, `useUpdateClassroom.ts`, `useProfile.ts` extended with `is_tutor` |
| 2 | Build Profile tab conditional view and classroom settings screen | Complete | `profile.tsx` conditional tutor card, `classroom-settings.tsx` edit form, `_layout.tsx` classroom-settings registered |

## Decisions Made

1. **Explicit `ClassroomRow` return type on `useClassroom`** — The joined Supabase select `'*, tutors!inner(user_id)'` causes supabase-js to infer a complex relational type that TypeScript resolves to `never` for the `data` field in consuming components. Fix: explicitly annotate `queryFn` return as `Promise<ClassroomRow>` and cast `data as ClassroomRow`. Runtime behavior is unchanged; the joined row includes all classroom columns.

2. **"My Classroom" section heading** — The plan's acceptance criteria requires `grep "My Classroom"` to match in `profile.tsx`. Added as a `Text` section heading above the card rather than inside the card (which shows the dynamic classroom name as primary text per UI-SPEC Component 4). Improves visual hierarchy.

## Files Created

### `src/features/tutor/useClassroom.ts`
TanStack Query `useQuery` hook. Fetches the current user's classroom via `classrooms.select('*, tutors!inner(user_id)').eq('tutors.user_id', userId).single()`. Explicitly typed as `Promise<ClassroomRow>` to resolve supabase-js joined-query type inference issue. `enabled: !!userId` prevents firing before session loads.

### `src/features/tutor/useUpdateClassroom.ts`
TanStack Query `useMutation` hook. Calls `supabase.from('classrooms').update({ name, subjects, bio, price_cents }).eq('id', classroomId)`. On success, invalidates `['classroom', userId]` cache key so the profile screen and settings screen reflect new values on next mount.

### `src/app/(tabs)/classroom-settings.tsx`
Classroom settings form screen. `SafeAreaView > KeyboardAvoidingView > ScrollView(keyboardShouldPersistTaps="handled")`. Header row with back arrow (`Ionicons arrow-back`, `router.back()`). Four form fields: classroom name, subjects (SubjectTagInput), bio (optional multiline), monthly price (R prefix + numeric input). `useEffect` pre-fills all fields from `useClassroom()` data when it loads. CTA disabled when `!name.trim() || subjects.length === 0 || !price.trim()`. Loading state shows `ActivityIndicator`. Error text shown on mutation failure. On success: `router.back()`.

## Files Modified

### `src/features/study/useProfile.ts`
Changed `.select('streak_count, total_xp')` to `.select('streak_count, total_xp, is_tutor')`. The `is_tutor` field is already in the `profiles` TypeScript type (added in Plan 01) so this is the only change needed.

### `src/app/(tabs)/profile.tsx`
Replaced static placeholder with conditional render: if `profile?.is_tutor && classroom`, shows "My Classroom" section heading + tappable `Card` with school icon, classroom name, "Manage your classroom" subtext, and chevron. Card `onPress` navigates to `/(tabs)/classroom-settings`. Non-tutors continue to see the placeholder text.

### `src/app/(tabs)/_layout.tsx`
Added `<Tabs.Screen name="classroom-settings" options={{ title: 'Classroom Settings', href: null }} />` after the existing `study/[topicId]` hidden screen. `href: null` hides it from the tab bar while allowing `router.push` navigation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Explicit return type annotation on `useClassroom` queryFn**

- **Found during:** Task 2 TypeScript verification
- **Issue:** `.select('*, tutors!inner(user_id)')` causes supabase-js to infer a joined relational type. TypeScript resolves the `data` field in consuming components (`profile.tsx`, `classroom-settings.tsx`) to `never`, blocking access to `classroom.name`, `classroom.id`, etc.
- **Fix:** Imported `Database` type, defined `type ClassroomRow = Database['public']['Tables']['classrooms']['Row']`, and annotated `queryFn: async (): Promise<ClassroomRow>` with `return data as ClassroomRow`. The actual runtime data shape matches — the cast is safe because the query always returns the classrooms columns.
- **Files modified:** `src/features/tutor/useClassroom.ts`

### Pre-existing Issues (out of scope — not introduced by this plan)

- `@expo/vector-icons/Ionicons` type declaration not found — pre-existing from Phase 1/2, tracked in deferred-items. Affects `_layout.tsx`, `SubjectTagInput.tsx`, `LessonListItem.tsx`, `QuestionCard.tsx`, and now also `profile.tsx` and `classroom-settings.tsx` (same root cause: `@expo/vector-icons` package missing from `node_modules/@types/`).

## Known Stubs

None — all form fields in classroom-settings are wired to `useClassroom` data and the `useUpdateClassroom` mutation. The profile screen reads live data from `useProfile` and `useClassroom`. No placeholder or hardcoded values flow to the UI.

## Self-Check

Files verified:
- `src/features/tutor/useClassroom.ts` — EXISTS, contains `useQuery`, `tutors!inner`, `single()`, `ClassroomRow`
- `src/features/tutor/useUpdateClassroom.ts` — EXISTS, contains `useMutation`, `invalidateQueries`, `price_cents`
- `src/app/(tabs)/classroom-settings.tsx` — EXISTS, contains `Classroom settings`, `Save changes`, `useUpdateClassroom`, `SubjectTagInput`, `price_cents`, `router.back`, `arrow-back`, `ActivityIndicator`
- `src/app/(tabs)/profile.tsx` — EXISTS, contains `is_tutor`, `useClassroom`, `My Classroom`, `Manage your classroom`, `classroom-settings`, `school`, `chevron-forward`
- `src/app/(tabs)/_layout.tsx` — EXISTS, `href: null` count = 2, contains `classroom-settings`
- `src/features/study/useProfile.ts` — EXISTS, contains `streak_count, total_xp, is_tutor`
- TypeScript: only pre-existing `@expo/vector-icons/Ionicons` errors; all new-code errors resolved

## Self-Check: PASSED
