---
phase: 08-rich-classroom-content
plan: P00
subsystem: classroom
tags: [foundation, schema, packages, typescript, testing]
dependency_graph:
  requires: []
  provides: [flashcard-db-constraint, webview-package, reanimated-package, cardtype-union, wave0-test-stubs]
  affects: [P01-flashcard-ui, P02-pdf-viewer, P03-multi-card-renderer]
tech_stack:
  added: [react-native-webview, react-native-reanimated, react-native-worklets]
  patterns: [plain-literal-union-over-conditional-mapped-type, wave0-todo-stubs]
key_files:
  created:
    - supabase/migrations/00016_add_flashcard_card_type.sql
    - src/features/classroom/__tests__/FlashCard.test.tsx
    - src/features/classroom/__tests__/StudentCardRenderer.test.tsx
  modified:
    - src/features/classroom/useClassroomCards.ts
    - src/features/classroom/__tests__/useClassroomCards.test.ts
    - package.json
    - package-lock.json
decisions:
  - Plain literal union replaces conditional mapped type in CardType — stays correct until supabase gen types is re-run post-migration
  - react-native-worklets installed with --legacy-peer-deps after expo install errored on jest peer conflict (pre-existing, unrelated)
  - babel.config.js left unchanged — babel-preset-expo handles reanimated plugin automatically in SDK 54
metrics:
  duration: ~5min
  completed: 2026-04-08
  tasks_completed: 2
  files_changed: 7
---

# Phase 8 Plan 0: Foundation — Schema, Packages, CardType, Wave 0 Stubs Summary

**One-liner:** Extended DB CHECK constraint for 'flashcard', installed webview/reanimated/worklets, updated CardType to plain literal union, and dropped Wave 0 test stubs for P01–P03.

## What Was Built

This plan lays the foundation for all Phase 8 plans. No UI was built — this is pure infrastructure.

### Task 1: Migration 00016 + Package Installs

- Created `supabase/migrations/00016_add_flashcard_card_type.sql` which drops the existing `classroom_cards_card_type_check` constraint and re-adds it with `'flashcard'` included. Migration is staged for `npx supabase db push` against the remote project.
- Installed `react-native-webview` (for PDF viewer in P02) and `react-native-reanimated` + `react-native-worklets` (for FlashCard flip animation in P01) — all confirmed present in `node_modules`.

### Task 2: CardType Union + Wave 0 Test Stubs

- Replaced the conditional mapped type in `useClassroomCards.ts` with a plain `'text' | 'pdf' | 'image' | 'link' | 'flashcard'` literal union. The old conditional type evaluated identically at compile time (both branches were identical) but was fragile against Supabase type regeneration.
- Added `FLASH-01` todo stub to `useClassroomCards.test.ts`.
- Created `FlashCard.test.tsx` with `FLASH-02a` and `FLASH-02b` todo stubs.
- Created `StudentCardRenderer.test.tsx` with `PDF-01`, `FLASH-03`, `TEXT-01`, and `LINK-01` todo stubs.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] expo install peer conflict for reanimated/worklets**
- **Found during:** Task 1
- **Issue:** `npx expo install react-native-reanimated react-native-worklets` failed due to a pre-existing peer conflict between `jest@30.3.0` and `jest-watch-typeahead@2.2.1` (which requires jest ^29). This is a pre-existing conflict unrelated to this plan.
- **Fix:** Ran `npm install react-native-reanimated react-native-worklets --legacy-peer-deps` which resolved both packages successfully. All three packages confirmed present in node_modules.
- **Files modified:** package.json, package-lock.json
- **Commit:** 98a4d2e

## Known Stubs

The following test files contain only `it.todo` stubs — intentional Wave 0 scaffolding for later plans:

| File | Stubs | Resolved by |
|------|-------|-------------|
| `src/features/classroom/__tests__/FlashCard.test.tsx` | FLASH-02a, FLASH-02b | P01 |
| `src/features/classroom/__tests__/StudentCardRenderer.test.tsx` | PDF-01, FLASH-03, TEXT-01, LINK-01 | P02/P03 |
| `src/features/classroom/__tests__/useClassroomCards.test.ts` | FLASH-01 (+ existing CARD-0x stubs) | P01 |

These stubs are intentional — they make jest recognize valid test suites immediately without import/mock overhead, following the pattern established in Phase 04-classroom-builder.

## Commits

| Hash | Message |
|------|---------|
| 98a4d2e | chore(08-P00): migration 00016 + install webview, reanimated, worklets |
| 4257893 | feat(08-P00): update CardType union + add Wave 0 test stubs |

## Self-Check: PASSED

- `supabase/migrations/00016_add_flashcard_card_type.sql` — FOUND
- `src/features/classroom/__tests__/FlashCard.test.tsx` — FOUND
- `src/features/classroom/__tests__/StudentCardRenderer.test.tsx` — FOUND
- `src/features/classroom/useClassroomCards.ts` contains `'text' | 'pdf' | 'image' | 'link' | 'flashcard'` — CONFIRMED
- `react-native-webview`, `react-native-reanimated`, `react-native-worklets` in node_modules — CONFIRMED
- Commits 98a4d2e and 4257893 — CONFIRMED in git log
- `babel.config.js` unchanged — CONFIRMED (not touched)
