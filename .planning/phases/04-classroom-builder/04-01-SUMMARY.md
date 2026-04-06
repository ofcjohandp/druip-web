---
phase: 04-classroom-builder
plan: "01"
subsystem: database
tags: [supabase, migration, rls, typescript, expo-packages]
dependency_graph:
  requires: [04-00]
  provides: [classroom_sections table, classroom_cards table, CardType, expo-document-picker, expo-image-picker]
  affects: [04-02, 04-03, 04-04]
tech_stack:
  added: [expo-document-picker ~14.0.8, expo-image-picker ~17.0.10]
  patterns: [RLS subquery chain auth.uid(), TEXT CHECK constraint over enum, sort_order INTEGER DEFAULT 1000]
key_files:
  created:
    - supabase/migrations/00006_classroom_sections_cards.sql
  modified:
    - src/types/database.ts
    - package.json
    - package-lock.json
decisions:
  - Used TEXT + CHECK constraint for card_type instead of Postgres enum to avoid migration complexity
  - sort_order uses INTEGER DEFAULT 1000 gap strategy (room for insertion without full reindex)
  - RLS policies use nested subquery chain through tutors table to auth.uid() — same pattern as Phase 3
metrics:
  duration: ~3 minutes
  completed_date: "2026-04-06"
  tasks_completed: 2
  tasks_pending: 1
  files_created: 1
  files_modified: 3
---

# Phase 4 Plan 01: Database Foundation Summary

**One-liner:** classroom_sections and classroom_cards tables with full RLS, CardType union type, and expo file-picker packages installed.

## What Was Built

### Task 1: Migration file (COMPLETE — commit 6de428d)

`supabase/migrations/00006_classroom_sections_cards.sql` creates:

- `classroom_sections` — id, classroom_id (FK→classrooms CASCADE), name, sort_order (DEFAULT 1000), created_at, updated_at
- `classroom_cards` — id, section_id (FK→classroom_sections CASCADE), card_type (TEXT CHECK: text/pdf/image/link), content, title, storage_path, sort_order (DEFAULT 1000), created_at, updated_at
- RLS enabled on both tables
- 8 policies total (4 per table: SELECT, INSERT, UPDATE, DELETE) using auth.uid() subquery chain through tutors

### Task 2: TypeScript types + packages (COMPLETE — commit 4648644)

`src/types/database.ts` additions:
- `export type CardType = 'text' | 'pdf' | 'image' | 'link'`
- `classroom_sections` with Row/Insert/Update/Relationships
- `classroom_cards` with Row/Insert/Update/Relationships (card_type: CardType)

`package.json` additions:
- `expo-document-picker ~14.0.8`
- `expo-image-picker ~17.0.10`

### Task 3: Push migration + create storage bucket (PENDING — awaiting human action)

User must:
1. Run `npx supabase db push` to apply migration to live Supabase project
2. Create private storage bucket named `classroom-assets` in Supabase Dashboard

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] npx expo install failed due to pre-existing peer dependency conflict**
- **Found during:** Task 2 package installation
- **Issue:** `react-dom@19.2.4` requires `react@^19.2.4` but project has `react@19.1.0`. Pre-existing conflict unrelated to expo-document-picker or expo-image-picker.
- **Fix:** Used `npm install --legacy-peer-deps` instead of `npx expo install`. Both packages installed at SDK-compatible versions (14.0.8 and 17.0.10).
- **Files modified:** package.json, package-lock.json
- **Commit:** 4648644

## Known Stubs

None — this plan creates only database schema and types. No UI components, no stubs.

## Pending: Task 3 (Human Action Required)

The migration is ready but has not been pushed to the live Supabase project yet. Task 3 requires manual steps — see CHECKPOINT REACHED below.

## Self-Check

- [x] supabase/migrations/00006_classroom_sections_cards.sql created
- [x] src/types/database.ts contains classroom_sections and classroom_cards
- [x] src/types/database.ts exports CardType
- [x] package.json contains expo-document-picker and expo-image-picker
- [x] Commits 6de428d and 4648644 exist
- [ ] Task 3 migration push — awaiting human action
- [ ] Storage bucket classroom-assets — awaiting human action
