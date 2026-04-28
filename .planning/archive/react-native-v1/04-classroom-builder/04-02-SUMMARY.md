---
phase: 04-classroom-builder
plan: 02
subsystem: ui
tags: [react-native, tanstack-query, supabase, optimistic-updates, expo-router]

# Dependency graph
requires:
  - phase: 04-01
    provides: classroom_sections table with RLS, TypeScript types in database.ts

provides:
  - useClassroomSections: query hook for section list ordered by sort_order
  - useCreateSection: mutation with sort_order increment-by-1000 strategy
  - useRenameSection: mutation with query invalidation
  - useDeleteSection: mutation with optimistic removal and rollback
  - useReorderSections: mutation with optimistic sort_order swap and rollback
  - SectionRow: section header component with inline rename, up/down reorder arrows, delete confirmation, Add card ghost button
  - ManageClassroom screen: full CRUD UI with empty/loading/error states, inline Add Section form, gear icon to classroom-settings
  - profile.tsx: My Classroom card now routes to manage-classroom

affects: [04-03, student-discovery]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Optimistic update pattern (onMutate/onError/onSettled) for delete and reorder
    - SectionWithCards wrapper component avoids calling hooks inside .map()
    - Reorder implemented as 2-row sort_order swap, not full re-index
    - Android autoFocus workaround via useRef + setTimeout(100ms) on isEditing change

key-files:
  created:
    - src/features/classroom/useClassroomSections.ts
    - src/features/classroom/SectionRow.tsx
    - src/app/(tabs)/manage-classroom.tsx
  modified:
    - src/app/(tabs)/profile.tsx

key-decisions:
  - "SectionWithCards wrapper avoids hooks-in-map pattern for card rendering inside section list"
  - "Reorder uses 2-row sort_order swap (not full re-index) for minimal DB writes"
  - "useDeleteSection and useReorderSections use full optimistic update cycle (onMutate/onError/onSettled)"
  - "Android autoFocus worked around with useRef + setTimeout(100ms) triggered on isEditing state change"

patterns-established:
  - "Pattern: optimistic mutation — cancelQueries, save previous, setQueryData, return { previous }; onError restores; onSettled invalidates"
  - "Pattern: SectionWithCards wrapper component — child component calls hooks per-section, avoids hooks-in-map violation"

requirements-completed: [CLASS-01, CLASS-02, CLASS-03]

# Metrics
duration: implemented as prerequisite inside 04-03 executor run (single commit)
completed: 2026-04-06
---

# Phase 4 Plan 02: Section Management Layer Summary

**Section CRUD with optimistic updates — 5 TanStack Query hooks, SectionRow component with inline rename and reorder, and ManageClassroom screen wired to Supabase**

## Performance

- **Duration:** Implemented as prerequisite during 04-03 executor run (single commit f9ca194)
- **Started:** 2026-04-06
- **Completed:** 2026-04-06
- **Tasks:** 3 (hooks, SectionRow, ManageClassroom + profile route)
- **Files modified:** 4

## Accomplishments

- 5 section hooks in `useClassroomSections.ts`: query (ordered by sort_order), create (sort_order += 1000 gap), rename, delete with optimistic removal, reorder with optimistic sort_order swap
- `SectionRow` component: inline rename via TextInput (Android autoFocus workaround), up/down reorder arrows disabled at boundaries, delete with Alert confirmation ("Keep Section" / "Delete Section"), "+ Add card" ghost button, empty state text
- `ManageClassroom` screen: header with back button and gear icon (routes to classroom-settings), section list via SectionWithCards wrapper, inline Add Section form, full empty/loading/error states matching UI-SPEC copywriting
- `profile.tsx` My Classroom card updated to route to `/(tabs)/manage-classroom` instead of classroom-settings

## Task Commits

All three tasks were delivered in a single commit (plan executed as prerequisite during 04-03):

1. **Task 1: Section query and mutation hooks** — `f9ca194` (feat)
2. **Task 2: SectionRow component** — `f9ca194` (feat)
3. **Task 3: ManageClassroom screen + profile route** — `f9ca194` (feat)

## Files Created/Modified

- `src/features/classroom/useClassroomSections.ts` — 5 exported hooks: useClassroomSections, useCreateSection, useRenameSection, useDeleteSection (optimistic), useReorderSections (optimistic)
- `src/features/classroom/SectionRow.tsx` — Section header with inline rename, reorder arrows, delete confirmation, Add card CTA, empty state
- `src/app/(tabs)/manage-classroom.tsx` — ManageClassroom screen with SectionWithCards wrapper, Add Section inline form, empty/loading/error states
- `src/app/(tabs)/profile.tsx` — My Classroom card route updated to manage-classroom

## Decisions Made

- **SectionWithCards wrapper:** The manage-classroom screen wraps each SectionRow in a `SectionWithCards` sub-component so that `useClassroomCards` and `useDeleteCard` can be called per-section without violating the Rules of Hooks (hooks cannot be called inside `.map()`). This pattern was established here and documented in STATE.md decisions.
- **Reorder as 2-row swap:** `useReorderSections` swaps sort_order values between two adjacent sections with two Supabase UPDATE calls rather than re-indexing all sections. Simpler, fewer writes, works with the 1000-gap strategy from Plan 01.
- **Optimistic pattern for delete and reorder:** Both mutations use the full `onMutate` / `onError` / `onSettled` cycle so the UI responds instantly and rolls back cleanly on error.
- **Android autoFocus:** TextInput in inline rename mode uses `useRef` + `setTimeout(100ms)` on `isEditing` state changes per Research Pitfall 6 to ensure focus fires on Android's slower layout cycle.

## Deviations from Plan

### Auto-fixed / Enhanced Issues

**1. [Rule 2 - Enhancement] manage-classroom.tsx wired with AddCardBottomSheet and CardListItem at creation time**

- **Found during:** Task 3
- **Context:** Plan 02 called for `onAddCard={() => {}}` no-op. The 04-03 executor ran 04-02 as a prerequisite and immediately wired the card layer (Plan 03 features) into the same screen file.
- **Result:** The committed `manage-classroom.tsx` includes `AddCardBottomSheet`, `CardListItem`, `useClassroomCards`, and `useDeleteCard` imports — all from 04-03. This is not a deviation from correctness; it means the file was delivered in its final state rather than iteratively.
- **Impact:** No rework needed; the screen is complete as built.

---

**Total deviations:** 1 (scope acceleration — 04-02 and 04-03 screen wiring delivered together)
**Impact on plan:** No correctness issues. Screen exceeded 04-02 scope by including 04-03 card wiring, but this was intentional during the combined executor run.

## Issues Encountered

None. All three tasks executed cleanly in a single commit. No blocking issues.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Section CRUD is fully operational and wired to Supabase via RLS-enforced hooks
- `SectionRow` is ready to receive card children (rendered by CardListItem from 04-03)
- `onAddCard` callback is wired to `AddCardBottomSheet` (delivered in 04-03)
- `manage-classroom.tsx` is the complete tutor workspace screen — no further structural changes expected for Phase 4

---
*Phase: 04-classroom-builder*
*Completed: 2026-04-06*
