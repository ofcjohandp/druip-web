---
phase: 06-direct-messaging
plan: "01"
subsystem: messaging
tags: [database, rls, types, test-stubs]
dependency_graph:
  requires: [classrooms table, profiles table, subscriptions table, tutors USING(true) RLS fix]
  provides: [messages table DDL, messages RLS policies, messages TypeScript types, messaging test stubs]
  affects: [06-02-PLAN.md, 06-03-PLAN.md]
tech_stack:
  added: []
  patterns: [it.todo stub pattern, (SELECT auth.uid()) RLS subquery pattern]
key_files:
  created:
    - supabase/migrations/00012_messages_table.sql
    - src/features/messaging/__tests__/useMessages.test.ts
    - src/features/messaging/__tests__/useSendMessage.test.ts
    - src/features/messaging/__tests__/useClassroomSubscribers.test.ts
  modified:
    - src/types/database.ts
decisions:
  - messages table uses UUID PKs with ON DELETE CASCADE FKs to classrooms and profiles
  - RLS uses (SELECT auth.uid()) subquery pattern matching established project convention
  - Four separate RLS policies: subscriber read, subscriber insert, tutor read, tutor insert
  - Test stubs use it.todo() with no imports/mocks matching Phase 4/5 wave-0 convention
metrics:
  duration: ~4min
  completed: "2026-04-06"
  tasks_completed: 2
  tasks_total: 3
  files_created: 4
  files_modified: 1
---

# Phase 06 Plan 01: Messages Foundation Summary

**One-liner:** Messages table with 4 RLS policies, TypeScript types, and 3 it.todo test stub files for Phase 6 Direct Messaging.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create messages migration and TypeScript types | 196fa3a | supabase/migrations/00012_messages_table.sql, src/types/database.ts |
| 2 | Create Wave 0 test stubs for messaging hooks | 21595ef | src/features/messaging/__tests__/useMessages.test.ts, useSendMessage.test.ts, useClassroomSubscribers.test.ts |

## Tasks Awaiting Human Action

| # | Task | Status |
|---|------|--------|
| 3 | Push schema to Supabase | Awaiting `supabase db push` |

## What Was Built

### Migration: 00012_messages_table.sql

Created the `messages` table with:
- `id` UUID PK, `classroom_id` FK → classrooms(id) ON DELETE CASCADE, `sender_id` FK → profiles(id) ON DELETE CASCADE
- `content` TEXT NOT NULL, `created_at` TIMESTAMPTZ DEFAULT now()
- RLS ENABLED with 4 policies covering read/insert for subscribers and tutors

### TypeScript Types: database.ts

Added `messages` entry to `Database['public']['Tables']` with Row (5 fields), Insert (3 required fields), Update (content only), Relationships: [].

### Test Stubs: messaging/__tests__/

Three stub files with `it.todo()` entries — no imports, no mocks. Jest recognizes all 10 todos across 3 suites (verified: exit 0).

## Decisions Made

- Used `(SELECT auth.uid())` subquery in all RLS conditions — matches project-wide convention from migration 00007 and STATE.md
- Subscriber INSERT policy checks both `sender_id = auth.uid()` AND active subscription — prevents impersonation (T-02)
- Tutor INSERT/SELECT chain via `classrooms → tutors` is safe because migration 00011 set `tutors SELECT USING(true)` breaking the recursion (T-03)

## Deviations from Plan

None — plan executed exactly as written for Tasks 1 and 2.

## Auth Gates / Blocked Tasks

**Task 3** is a `checkpoint:human-action` gate requiring `supabase db push` to apply migration 00012 to the remote Supabase project. This cannot be automated without interactive confirmation or `SUPABASE_ACCESS_TOKEN` set.

## Known Stubs

None in the migration or types. Test stub files are intentionally todo-only (Wave 0 pattern — will be implemented in Plans 02-03).

## Self-Check

- [x] supabase/migrations/00012_messages_table.sql exists
- [x] src/types/database.ts contains "messages:"
- [x] All 3 test stub files exist under src/features/messaging/__tests__/
- [x] Commits 196fa3a and 21595ef verified

## Self-Check: PASSED
