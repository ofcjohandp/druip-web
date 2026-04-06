---
phase: 04-classroom-builder
plan: "00"
subsystem: classroom
tags: [testing, stubs, wave-0, tdd]
dependency_graph:
  requires: []
  provides: [classroom-test-stubs]
  affects: [04-01, 04-02, 04-03]
tech_stack:
  added: []
  patterns: [jest-todo-stubs]
key_files:
  created:
    - src/features/classroom/__tests__/useClassroomSections.test.ts
    - src/features/classroom/__tests__/useClassroomCards.test.ts
    - src/features/classroom/__tests__/uploadClassroomFile.test.ts
  modified: []
decisions:
  - "Used it.todo() stubs (no imports/mocks) so jest recognizes valid test suites immediately"
metrics:
  duration: "72s"
  completed: "2026-04-06"
  tasks: 1
  files: 3
---

# Phase 4 Plan 0: Wave 0 Classroom Test Stubs Summary

**One-liner:** Three jest todo-stub test files created in `src/features/classroom/__tests__/` so all subsequent plans have valid test targets from the start.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create test stub files for classroom feature hooks and utilities | dd93a5d | src/features/classroom/__tests__/useClassroomSections.test.ts, useClassroomCards.test.ts, uploadClassroomFile.test.ts |

## What Was Built

Wave 0 test stub scaffolding for the classroom feature. All three files use only `describe` and `it.todo()` — no imports, no mocks, no implementation code. This pattern ensures jest can discover and run these files immediately, returning 0 failures (todo items are counted but not run), satisfying VALIDATION.md's requirement that `npx jest --testPathPatterns=classroom --passWithNoTests` exits 0.

**Test stubs created:**
- `useClassroomSections.test.ts` — 6 todo stubs covering CLASS-01, CLASS-02, CLASS-03 requirements
- `useClassroomCards.test.ts` — 6 todo stubs covering CARD-01 through CARD-05 requirements
- `uploadClassroomFile.test.ts` — 7 todo stubs in two describe blocks covering CARD-02 upload utility

**Verification result:** `Tests: 32 todo, 32 total — 6 test suites passed`

## Deviations from Plan

None - plan executed exactly as written.

Note: `--testPathPattern` flag was replaced by `--testPathPatterns` in jest v30. Used the correct flag `--testPathPatterns` for verification. The plan's verify command used the older flag, but both work in this jest version.

## Known Stubs

All content in this plan IS intentional stubs. These are wave-0 scaffolding files designed to be filled in by subsequent plans (04-01 through 04-03). No stubs exist that block this plan's goal — the goal of plan 04-00 is specifically to create these stub files.

## Self-Check: PASSED

Files exist:
- FOUND: src/features/classroom/__tests__/useClassroomSections.test.ts
- FOUND: src/features/classroom/__tests__/useClassroomCards.test.ts
- FOUND: src/features/classroom/__tests__/uploadClassroomFile.test.ts

Commits exist:
- FOUND: dd93a5d (test(04-00): add wave 0 classroom test stubs)
