---
phase: 01-real-dashboard
plan: 01
subsystem: dashboard
tags: [supabase, server-component, data-wiring, empty-states]
dependency_graph:
  requires: []
  provides: [real-dashboard-data, empty-states]
  affects: [druip-web/src/app/(dashboard)/home/page.tsx]
tech_stack:
  added: []
  patterns:
    - Promise.all parallel Supabase queries in async Server Component
    - PostgREST FK join normalization (array-to-single via type cast)
    - Conditional rendering based on DB data presence
key_files:
  created: []
  modified:
    - druip-web/src/app/(dashboard)/home/page.tsx
decisions:
  - "Used unknown cast + runtime normalization for Supabase FK join types (no generated types file yet)"
  - "Streak card always rendered even at 0 — spotlight card conditionally hidden when no subscriptions"
  - "Error on query falls back to empty state (no raw errors surfaced to user)"
metrics:
  duration: 2m
  completed: 2026-04-09
  tasks_completed: 1
  files_modified: 1
---

# Phase 01 Plan 01: Wire Dashboard to Real Supabase Data — Summary

**One-liner:** Replaced hardcoded mock dashboard data with parallel Supabase queries (profiles.streak_count, subscriptions+classrooms, tutors+profiles), rendering real data or Stitch-matching empty states for new users.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Wire Supabase queries and replace hardcoded data | 13d3a63 | druip-web/src/app/(dashboard)/home/page.tsx |

## What Was Built

The home dashboard (`druip-web/src/app/(dashboard)/home/page.tsx`) is now a fully data-wired async Server Component. Three Supabase queries run in parallel via `Promise.all`:

1. **profiles.streak_count** — replaces hardcoded `12`; streak subtext conditionally renders "Start your streak today!" (0) or "You're on a N-day streak. Keep going!" (>0)
2. **subscriptions joined to classrooms** — ordered by `subscribed_at DESC`; spotlight bento card hidden entirely when empty; Continue Learning section shows subscription cards or Stitch no-subscriptions empty state
3. **tutors joined to profiles** — ordered by `created_at DESC`, limit 4; Tutors of the Week grid renders real tutors (name from `full_name ?? email ?? "Unnamed Tutor"`) or Stitch no-tutors empty state

Additional UI fixes applied per UI-SPEC:
- "View All" button: disabled (`text-outline cursor-default`)
- "Book a Session" button: disabled (`bg-surface-container-high text-outline cursor-default`)
- Inactive bottom nav tabs: icon-only with `aria-label`, no visible text labels

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript FK join type inference**
- **Found during:** Task 1 — tsc check
- **Issue:** Supabase-js without generated types infers PostgREST FK joins as arrays (`classrooms[]`, `profiles[]`) rather than single objects or null. Direct type cast to singular types failed TypeScript's overlap check.
- **Fix:** Cast through `unknown` first, then normalize with runtime `Array.isArray` check (maps array to first element or null). This is correct — PostgREST can return arrays for to-one relationships without generated types.
- **Files modified:** druip-web/src/app/(dashboard)/home/page.tsx
- **Commit:** 13d3a63 (included in task commit)

## Verification Results

- `npx tsc --noEmit`: PASS — zero errors
- `npx next build`: PASS — compiled successfully, /home route dynamic as expected
- All grep acceptance checks: PASS
  - `Promise.all` count: 1
  - `student_id` present (not `user_id`)
  - `subscribed_at` ordering (not `updated_at`)
  - `full_name` in tutors join
  - `Macroeconomics 101` absent
  - `Advanced Statistics` absent
  - `Mandla K.` absent
  - Hardcoded `>12<` absent
  - `No classrooms joined yet.` present
  - `No tutors yet.` present
  - `CONTINUE LEARNING` badge present
  - `Go to Classroom` CTA present
  - `cursor-default` on both disabled buttons
  - `aria-label` on all 3 inactive nav tabs

## Known Stubs

- Progress bar in Continue Learning cards renders at 0% — progress tracking is deferred to Phase 5. This is intentional per D-07 and RESEARCH.md.
- "Go to Classroom", "Browse Tutors", "Browse Classrooms", "Resume Lecture" CTAs use `href="#"` — routing will be wired in Phase 4 (student-discovery).
- Spotlight card subtext shows "Your subscribed classroom" (generic) — tutor name join is omitted because it requires a second-level join (subscriptions → classrooms → tutors → profiles) that adds complexity; acceptable for Phase 1.

These stubs do not prevent the plan's goal (replacing mock data with real data and proper empty states) from being achieved.

## Self-Check: PASSED

- [x] `druip-web/src/app/(dashboard)/home/page.tsx` — exists and modified
- [x] Commit `13d3a63` — exists in git log
- [x] `tsc --noEmit` — PASS
- [x] `next build` — PASS
