---
phase: 05-student-discovery-and-subscriptions
plan: P03
subsystem: student-screens
tags: [react-native, screens, expo-router, discovery, subscriptions, theme-tokens]
dependency_graph:
  requires: [05-P01, 05-P02]
  provides: [index-discovery-screen, classroom-detail-screen, subscribe-confirm-screen]
  affects: [05-P04]
tech_stack:
  added: []
  patterns: [SafeAreaView+ScrollView screen structure, useLocalSearchParams for route params, router.push with query string params, router.back() on success/cancel]
key_files:
  created:
    - src/app/(tabs)/classroom-detail.tsx
    - src/app/(tabs)/subscribe-confirm.tsx
  modified:
    - src/app/(tabs)/index.tsx
decisions:
  - Button component uses title prop (not children) — adapted from plan code to match actual Button.tsx interface in codebase
  - subscribe-confirm receives price as query string param (price_cents as string) and parses with parseInt
metrics:
  duration: 98s
  completed_date: "2026-04-06"
  tasks_completed: 2
  files_changed: 3
---

# Phase 05 Plan P03: Student Screens Summary

**One-liner:** Three screens wire up the complete student discovery and subscription flow — index.tsx (discovery with subscribed/browse split), classroom-detail.tsx (locked/unlocked sections with Subscribe CTA), subscribe-confirm.tsx (calm confirmation with Maybe later escape hatch).

## What Was Built

- `index.tsx` — full replacement of placeholder screen; imports useAllClassrooms + useMySubscriptions; splits classrooms into "Your Classrooms" (active subscriptions only, hidden when empty) and "Browse Classrooms" sections; loading/error/empty states; ClassroomCard map for both sections
- `classroom-detail.tsx` — fetches classroom via useClassroomDetail + checks subscription via useMySubscriptions; back button (44x44 touch, arrow-back Ionicon); subjects as tag pills; locked sections via LockedContentOverlay for non-subscribers; unlocked section rows for subscribers; Subscribe CTA button with price label navigates to subscribe-confirm; "You're subscribed" + checkmark-circle indicator for subscribers
- `subscribe-confirm.tsx` — receives id/name/price via query params; useSubscribe mutation; calm copy ("You'll get full access to all sections and materials in this classroom."); Subscribe button disabled when isPending; "Maybe later" ghost button; router.back() on success and cancel

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Home/Discovery screen (index.tsx replacement) | c0fe1f9 | src/app/(tabs)/index.tsx |
| 2 | Classroom detail screen + Subscribe confirmation screen | b3d656b | src/app/(tabs)/classroom-detail.tsx, src/app/(tabs)/subscribe-confirm.tsx |

## Verification Results

1. `grep "useAllClassrooms" src/app/(tabs)/index.tsx | wc -l` → 2
2. `grep "isSubscribed" src/app/(tabs)/classroom-detail.tsx | wc -l` → 3 (definition + 2 conditional uses)
3. `grep "mutation.isPending" src/app/(tabs)/subscribe-confirm.tsx | wc -l` → 1
4. `grep "Maybe later" src/app/(tabs)/subscribe-confirm.tsx | wc -l` → 1
5. `grep "You'll get full access" src/app/(tabs)/subscribe-confirm.tsx | wc -l` → 1
6. `npx jest` → 24 suites passed, 107 tests (82 todo, 25 passed), 0 failures

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Button component uses `title` prop, not `children`**
- **Found during:** Task 2
- **Issue:** Plan code used `<Button variant="primary">Subscribe</Button>` (children pattern) but actual `src/features/ui/Button.tsx` interface is `Button({ title, onPress, variant, disabled })` — children not in interface
- **Fix:** Replaced all Button usages in both screens to use `title="..."` prop
- **Files modified:** src/app/(tabs)/classroom-detail.tsx, src/app/(tabs)/subscribe-confirm.tsx
- **Commit:** b3d656b

## Known Stubs

None. All three screens are fully wired to hooks from P01 and components from P02. Data flows from Supabase through TanStack Query to rendered UI.

## Self-Check: PASSED

- src/app/(tabs)/index.tsx: FOUND
- src/app/(tabs)/classroom-detail.tsx: FOUND
- src/app/(tabs)/subscribe-confirm.tsx: FOUND
- Commit c0fe1f9: FOUND
- Commit b3d656b: FOUND
