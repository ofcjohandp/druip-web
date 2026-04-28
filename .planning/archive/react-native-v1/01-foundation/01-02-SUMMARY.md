---
phase: "01-foundation"
plan: "02"
subsystem: "database"
tags: ["supabase", "postgres", "rls", "migrations", "typescript", "tanstack-query", "expo-sqlite"]

# Dependency graph
requires:
  - phase: "01-01"
    provides: "Expo SDK 54 project with all dependencies installed (supabase-js, expo-sqlite, react-native-url-polyfill, @tanstack/react-query, zustand, netinfo)"
provides:
  - "Single Supabase client singleton at src/lib/supabase.ts with expo-sqlite localStorage and URL polyfill in correct import order"
  - "TypeScript type stubs for all 7 database tables (modules, topics, lessons, sections, questions, profiles, user_lesson_progress)"
  - "AppProviders component wrapping QueryClient with network awareness via @react-native-community/netinfo"
  - "3 Supabase migration files: content hierarchy schema, user tables, RLS policies"
  - "Supabase project live at https://ciwjpxqqqvbaapsjfypj.supabase.co with all tables created"
  - "RLS enabled on all 7 public tables with (SELECT auth.uid()) performance pattern"
affects:
  - "01-03-PLAN.md — auth store requires supabase client singleton from src/lib/supabase.ts"
  - "01-04-PLAN.md — feature hooks query supabase tables defined here"
  - "All future plans — any plan touching the database uses these migration files as foundation"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "expo-sqlite/localStorage/install imported before react-native-url-polyfill/auto — mandatory order for Supabase auth to work on React Native (AUTH-04)"
    - "(SELECT auth.uid()) subquery pattern in all RLS policies — avoids per-row function call overhead"
    - "is_published = true guard on all content SELECT policies — prevents unpublished content leaking to authenticated users"
    - "handle_new_user() SECURITY DEFINER trigger auto-creates profile row on auth.users INSERT"
    - "AppProviders wraps QueryClient + onlineManager.setEventListener for offline detection via NetInfo"

key-files:
  created:
    - "src/lib/supabase.ts"
    - "src/types/database.ts"
    - "src/providers/AppProviders.tsx"
    - "supabase/migrations/00001_content_schema.sql"
    - "supabase/migrations/00002_user_tables.sql"
    - "supabase/migrations/00003_rls_policies.sql"
  modified: []

key-decisions:
  - "expo-sqlite localStorage shim chosen over AsyncStorage for Supabase auth session persistence — avoids the offline session-loss bug in AsyncStorage (AUTH-04, D-18)"
  - "TypeScript manual type stubs written to match schema exactly — replace with `supabase gen types typescript` once project is linked post-MVP"
  - "User profile auto-creation via SECURITY DEFINER trigger on auth.users — decouples profile creation from app code, ensures no orphaned auth users"
  - "RLS (SELECT auth.uid()) subquery pattern applied to all 8 user-scoped policies — single function call per query instead of per-row evaluation"

patterns-established:
  - "Pattern: Single Supabase client at src/lib/supabase.ts — all features import from this file, never call createClient() directly"
  - "Pattern: AppProviders wraps all feature providers at app root — add new providers here, not in individual screens"
  - "Pattern: Content RLS always gates on is_published = true — content is invisible to clients until explicitly published"

requirements-completed: ["AUTH-03", "AUTH-04", "CONT-01", "CONT-02", "CONT-03", "CONT-04", "CONT-05", "SEED-02"]

# Metrics
duration: 5min
completed: "2026-04-06"
---

# Phase 01 Plan 02: Supabase Schema & Client Summary

**Supabase client with expo-sqlite localStorage, 3 SQL migrations (content hierarchy + user tables + RLS), and AppProviders wrapping QueryClient — database live at ciwjpxqqqvbaapsjfypj.supabase.co with RLS on all 7 tables**

## Performance

- **Duration:** ~5 min (continuation from checkpoint — Tasks 1 and 2 executed in prior session)
- **Started:** 2026-04-06T12:55:52Z
- **Completed:** 2026-04-06T12:56:30Z
- **Tasks:** 3 (Tasks 1 and 2 committed in prior session; Task 3 was human-action checkpoint now cleared)
- **Files modified:** 6

## Accomplishments

- Supabase client singleton created with mandatory expo-sqlite/URL polyfill import order; wired to EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
- Content hierarchy schema (Module -> Topic -> Lesson -> Section -> Question) pushed to live Supabase project with all CONT-01..05 columns and indexes
- RLS enabled on all 7 public tables using `(SELECT auth.uid())` performance pattern; content policies gate on `is_published = true` (T-01/T-02 mitigations)
- TypeScript Database type stubs covering all 7 tables, LessonType, and DailyGoal enums
- AppProviders component with QueryClient and network-aware onlineManager via NetInfo

## Task Commits

1. **Task 1: Supabase client, TypeScript types, and AppProviders** - `ad5825c` (feat)
2. **Task 2: Create Supabase migration files** - `2184851` (feat)
3. **Task 3: Push schema to Supabase** - human-action checkpoint (no additional commit — schema pushed externally; .env created with live credentials)

## Files Created/Modified

- `src/lib/supabase.ts` - Supabase client singleton with expo-sqlite localStorage, URL polyfill, persistSession, autoRefreshToken
- `src/types/database.ts` - TypeScript stubs for 7 tables: modules, topics, lessons, sections, questions, profiles, user_lesson_progress
- `src/providers/AppProviders.tsx` - QueryClientProvider with onlineManager.setEventListener for offline detection
- `supabase/migrations/00001_content_schema.sql` - Content hierarchy: modules/topics/lessons/sections/questions with indexes and updated_at triggers
- `supabase/migrations/00002_user_tables.sql` - profiles (daily_goal, streak_freezes, total_xp) + user_lesson_progress with handle_new_user() trigger
- `supabase/migrations/00003_rls_policies.sql` - RLS enabled on 7 tables; 10 policies using (SELECT auth.uid()) pattern

## Decisions Made

- Used expo-sqlite localStorage shim (not AsyncStorage) for Supabase session storage — avoids the documented offline session-loss bug in AsyncStorage on React Native
- Manual TypeScript type stubs written to match schema exactly until `supabase gen types typescript` can be run with a linked project
- `handle_new_user()` trigger marked SECURITY DEFINER so it runs as the postgres superuser, allowing INSERT into profiles from the auth schema context
- `(SELECT auth.uid())` subquery pattern used in all 8 user-scoped RLS policies — single function evaluation per query, not per row

## Deviations from Plan

None - plan executed exactly as written. All 3 migration files match the plan SQL. Supabase client matches the required import order and auth config. Task 3 was a human-action checkpoint that required the user to push the schema and create the .env file — both completed successfully.

## Issues Encountered

None — schema pushed without errors. .env created with correct EXPO_PUBLIC_ prefixed keys.

## User Setup Required

User manually completed the following (Task 3 human-action checkpoint):
- Created Supabase project at https://supabase.com/dashboard
- Ran `supabase link --project-ref ciwjpxqqqvbaapsjfypj`
- Ran `supabase db push` — completed without errors
- Created `.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Next Phase Readiness

- Supabase client singleton ready for import by Plan 01-03 (auth store)
- Database tables live with RLS — auth features can begin immediately
- AppProviders ready to wrap `src/app/_layout.tsx` (Plan 01-03 task)
- TypeScript types fully cover the schema for type-safe queries

No blockers.

---
*Phase: 01-foundation*
*Completed: 2026-04-06*

## Self-Check: PASSED
