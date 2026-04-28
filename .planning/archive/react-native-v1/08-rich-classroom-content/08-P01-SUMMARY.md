---
phase: 08-rich-classroom-content
plan: P01
subsystem: classroom
tags: [flashcard, tutor-ui, mutation-hook, tdd]
dependency_graph:
  requires: [08-P00]
  provides: [useCreateFlashcard, flashcard-form-ui, flashcard-card-list-icon]
  affects: [P02-pdf-viewer, P03-multi-card-renderer]
tech_stack:
  added: []
  patterns: [tdd-red-green, useMutation-pattern, FormMode-extension]
key_files:
  created: []
  modified:
    - src/features/classroom/useClassroomCards.ts
    - src/features/classroom/__tests__/useClassroomCards.test.ts
    - src/features/classroom/AddCardBottomSheet.tsx
    - src/features/classroom/CardListItem.tsx
    - src/types/database.ts
decisions:
  - content column maps to flashcard front face; title column repurposed as back face — intentional column reuse, documented in comment, no migration needed
  - Flashcard CardTypeOption inserted between Text note and PDF/File in type selector
  - CardListItem preview shows card.content (front face) for flashcard cards — avoids leaking the answer in the tutor card list
metrics:
  duration: ~8min
  completed: 2026-04-08
  tasks_completed: 2
  files_changed: 5
---

# Phase 8 Plan 1: Tutor Flashcard Creation Flow Summary

**One-liner:** Added `useCreateFlashcard` TanStack mutation hook (content=front, title=back), extended `AddCardBottomSheet` with a 5th Flashcard type option and two-field front/back form, and updated `CardListItem` to display a layers-outline icon with front-face preview for flashcard cards.

## What Was Built

### Task 1: useCreateFlashcard hook + FLASH-01 tests (TDD)

- Added `useCreateFlashcard(sectionId)` as a named export at the bottom of `useClassroomCards.ts`, after `useCreateLinkCard` and before `useDeleteCard`.
- Field mapping: `content = front face`, `title = back face` (column repurposed, documented with inline comment referencing RICH-01).
- Guards against empty front/back with an early throw (`'front and back are required'`).
- Replaces FLASH-01 `it.todo` stub with 3 real tests: insert payload assertion, empty-front guard, empty-back guard.
- All 3 tests pass; 6 existing CARD-0x stubs remain as todos (intentional — those are for a later plan).

### Task 2: AddCardBottomSheet flashcard form + CardListItem icon

- Extended `FormMode` type from `'text' | 'link' | null` to `'text' | 'link' | 'flashcard' | null`.
- Added `flashFront` / `flashBack` state; both reset in `handleClose()` and `handleCancelForm()`.
- Added `handleSaveFlashcard()` calling `createFlashcard.mutateAsync({ front, back })` then `handleClose()`.
- Added Flashcard `CardTypeOption` (icon: `layers-outline`) between Text note and PDF/File in the type selector.
- Added flashcard form branch (after link form, before type-selector fallback) with two `TextInput` fields, a disabled-when-empty Save button with `ActivityIndicator`, and a Cancel link — mirrors the link form pattern exactly.
- `CardListItem.getCardIcon`: added `case 'flashcard': return 'layers-outline'`.
- `CardListItem.getCardPreview`: added `case 'flashcard': return card.content.slice(0,60)` — shows front face, not back face (prevents answer leak in tutor list).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Extended CardType in database.ts to include 'flashcard'**
- **Found during:** Task 1 TypeScript check
- **Issue:** `src/types/database.ts` is a manual stub (not generated) and had `CardType = 'text' | 'pdf' | 'image' | 'link'` without `'flashcard'`. This caused TS2769 on the `supabase.from('classroom_cards').insert({ card_type: 'flashcard' })` call.
- **Fix:** Added `'flashcard'` to the `CardType` union in `database.ts` with a comment referencing migration 00016.
- **Files modified:** `src/types/database.ts`
- **Commit:** eb5eaec

## Commits

| Hash | Message |
|------|---------|
| eb5eaec | feat(08-P01): add useCreateFlashcard hook + FLASH-01 tests |
| dc2ad05 | feat(08-P01): flashcard form in AddCardBottomSheet + icon in CardListItem |

## Self-Check: PASSED

- `useCreateFlashcard` exported from `src/features/classroom/useClassroomCards.ts` — CONFIRMED
- FLASH-01 tests: 3 passed, 6 todo — CONFIRMED
- `AddCardBottomSheet.tsx` contains `formMode === 'flashcard'` — CONFIRMED
- `CardListItem.tsx` contains `'flashcard'` case — CONFIRMED
- `src/types/database.ts` CardType includes `'flashcard'` — CONFIRMED
- Commits eb5eaec and dc2ad05 — CONFIRMED in git log
- No new TypeScript errors in modified files — CONFIRMED
