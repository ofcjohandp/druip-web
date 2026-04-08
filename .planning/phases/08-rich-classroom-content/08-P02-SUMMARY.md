---
phase: 08-rich-classroom-content
plan: P02
subsystem: classroom
tags: [flashcard, student-ui, pdf-viewer, card-renderer, tdd, reanimated, webview]
dependency_graph:
  requires: [08-P00, 08-P01]
  provides: [FlashCard-component, StudentCardRenderer, pdf-viewer-screen, classroom-detail-card-wiring]
  affects: [student-classroom-experience]
tech_stack:
  added: []
  patterns: [tdd-red-green, reanimated-v4-flip, WebView-pdf, card-type-dispatcher, SectionWithStudentCards-wrapper]
key_files:
  created:
    - src/features/classroom/FlashCard.tsx
    - src/features/classroom/StudentCardRenderer.tsx
    - src/app/(tabs)/pdf-viewer.tsx
  modified:
    - src/features/classroom/__tests__/FlashCard.test.tsx
    - src/features/classroom/__tests__/StudentCardRenderer.test.tsx
    - src/app/(tabs)/classroom-detail.tsx
decisions:
  - "{ perspective: 1000 } placed first in both frontAnim and backAnim transforms — Android safety requirement"
  - isFlipped.value toggled in onPress only, never read-mutated inside useAnimatedStyle — prevents infinite render loop
  - decodeURIComponent applied to url param in pdf-viewer before passing to WebView — prevents 404 from double-encoding
  - SectionWithStudentCards is a component (not inline function) so useClassroomCards hook call is valid inside .map()
  - Pre-existing TypeScript errors (@expo/vector-icons/Ionicons, manage-classroom.tsx line 255) confirmed pre-existing — not introduced by this plan
metrics:
  duration: ~2min
  completed: 2026-04-08
  tasks_completed: 2
  files_changed: 6
---

# Phase 8 Plan 2: Student Card Rendering Layer Summary

**One-liner:** Built Reanimated v4 flip FlashCard, StudentCardRenderer dispatcher for all 5 card types, full-screen WebView pdf-viewer screen, and wired SectionWithStudentCards into classroom-detail for subscribed students.

## What Was Built

### Task 1: FlashCard component + tests (TDD)

- Created `src/features/classroom/FlashCard.tsx` with Reanimated v4 flip animation.
- Both Animated.View faces include `{ perspective: 1000 }` as the first transform item (Android safety).
- `isFlipped.value` is toggled in `onPress` only — never mutated inside `useAnimatedStyle`.
- `backfaceVisibility: 'hidden'` on both faces; back face uses `position: absolute` overlay.
- Replaced FLASH-02a/FLASH-02b `it.todo` stubs with 3 passing tests: initial front render, back render after press, empty-string no-crash.

### Task 2: StudentCardRenderer + pdf-viewer + classroom-detail wiring (TDD)

- Created `src/features/classroom/StudentCardRenderer.tsx` — switch on `card.card_type`:
  - `text`: plain text card
  - `link`: TouchableOpacity calling `Linking.openURL(card.content)`
  - `image`: Image with `source={{ uri: card.signedUrl }}` — renders null if no signedUrl
  - `pdf`: TouchableOpacity navigating to `/(tabs)/pdf-viewer?url=ENCODED&title=ENCODED`; loading state when no signedUrl
  - `flashcard`: `<FlashCard front={card.content} back={card.title} />`
  - `default`: returns null (no crash)
- Created `src/app/(tabs)/pdf-viewer.tsx` — full-screen WebView screen:
  - Decodes `url` param with `decodeURIComponent` before passing to WebView
  - Header with back button and title
  - `startInLoadingState` + `renderLoading` ActivityIndicator spinner
  - Error state when no URL provided
- Updated `src/app/(tabs)/classroom-detail.tsx`:
  - Added imports: `useClassroomCards`, `StudentCardRenderer`, `Database` type
  - Added `SectionWithStudentCards` component above default export — calls `useClassroomCards(section.id)`, maps cards through `StudentCardRenderer`
  - Replaced subscribed section `<View><Text>{section.name}</Text></View>` with `<SectionWithStudentCards key={section.id} section={section} />`
- Replaced all 4 `it.todo` stubs in `StudentCardRenderer.test.tsx` with 5 passing tests (TEXT-01, LINK-01, PDF-01, FLASH-03, UNKNOWN-01).

## Deviations from Plan

None — plan executed exactly as written. Pre-existing TypeScript errors (`@expo/vector-icons/Ionicons` missing types across 14+ files, `manage-classroom.tsx` line 255 `Property 'id' does not exist on type 'never'`) were present before this plan and are out of scope.

## Known Stubs

None. All `it.todo` stubs in FlashCard.test.tsx and StudentCardRenderer.test.tsx have been replaced with passing tests.

## Commits

| Hash | Message |
|------|---------|
| aa1ceb0 | feat(08-P02): FlashCard component + FLASH-02 tests |
| 4dab805 | feat(08-P02): StudentCardRenderer, pdf-viewer screen, classroom-detail wiring |

## Self-Check: PASSED

- `src/features/classroom/FlashCard.tsx` — FOUND
- `src/features/classroom/StudentCardRenderer.tsx` — FOUND
- `src/app/(tabs)/pdf-viewer.tsx` — FOUND
- `src/app/(tabs)/classroom-detail.tsx` contains `StudentCardRenderer` — CONFIRMED
- FlashCard tests: 3 passed — CONFIRMED
- StudentCardRenderer tests: 5 passed — CONFIRMED
- Total tests: 8 passed across 2 suites — CONFIRMED
- Commits aa1ceb0 and 4dab805 — CONFIRMED in git log
