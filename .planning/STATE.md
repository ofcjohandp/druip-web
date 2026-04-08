---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: "Phase 7 functionally complete (device test pending). Phase 8 planned — 4 plans ready. Fix: run npm install (expo-file-system missing), then test onboarding on device, then /gsd-execute-phase 8"
last_updated: "2026-04-08T18:41:00.000Z"
last_activity: 2026-04-08
progress:
  total_phases: 8
  completed_phases: 5
  total_plans: 32
  completed_plans: 26
  percent: 81
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-06)

**Core value:** A student opens Druip, finds their tutor's classroom, and has everything they need to pass their test in one place.
**Current focus:** Phase 07 — student-onboarding

## Current Position

Phase: 07 (student-onboarding) — EXECUTING
Plan: 4 of 4 (P00 complete)
Status: Ready to execute
Last activity: 2026-04-08

Progress: [██░░░░░░░░] 25%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 3. Tutor Onboarding | TBD | - | - |
| 4. Classroom Builder | TBD | - | - |
| 5. Student Discovery and Subscriptions | TBD | - | - |
| 6. Direct Messaging | TBD | - | - |
| Phase 04-classroom-builder P00 | 72s | 1 tasks | 3 files |
| Phase 04-classroom-builder P01 | 20min | 3 tasks | 4 files |
| Phase 04-classroom-builder P03 | 20min | 4 tasks | 6 files |
| Phase 05-student-discovery-and-subscriptions PP00 | 94s | 2 tasks | 6 files |
| Phase 05-student-discovery-and-subscriptions PP01 | 125s | 2 tasks | 4 files |
| Phase 05-student-discovery-and-subscriptions PP02 | 52s | 2 tasks | 3 files |
| Phase 05-student-discovery-and-subscriptions PP03 | 98s | 2 tasks | 3 files |
| Phase 06-direct-messaging P06-01 | 6min | 3 tasks | 5 files |
| Phase 07-student-onboarding PP01 | 3 | 2 tasks | 6 files |
| Phase 07-student-onboarding PP02 | 10 | 2 tasks | 14 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Carried forward from Phase 1 (still valid):

- Stack: React Native / Expo SDK 54 + Supabase — decided, not up for debate
- Auth: email/password only, expo-sqlite session storage, URL polyfill required
- Navigation: Expo Router with 5-tab bottom navigator
- theme.ts is the single source of truth for all design tokens — no hardcoded colors in components
- WindowedFlatList wraps FlatList with windowing defaults; keyExtractor must be provided by consumers
- expo-sqlite localStorage chosen over AsyncStorage for Supabase session storage
- RLS (SELECT auth.uid()) subquery pattern applied to all user-scoped policies
- handle_new_user() SECURITY DEFINER trigger auto-creates profile on auth.users INSERT
- lazy: false removed from Tabs screenOptions (caused tab unresponsiveness on physical device)

Pivot decisions:

- Product pivoted from Duolingo quiz engine to Skool-like tutor marketplace
- First tutor: Sharone at NWU Potchefstroom, R180/month
- v1.0 is UI-first — payments deferred to v1.1
- Phase 2 quiz engine work (02-01 through 02-03) deprioritized; data foundation may be reused or removed
- Build approach: UI screens and navigation first, Supabase wiring second
- [Phase 04-classroom-builder]: Used it.todo() stubs with no imports/mocks for wave-0 test scaffolding so jest recognizes valid suites immediately
- [Phase 04-classroom-builder]: Used TEXT + CHECK constraint for card_type instead of Postgres enum to avoid migration complexity
- [Phase 04-classroom-builder]: sort_order uses INTEGER DEFAULT 1000 gap strategy — room for insertion without full reindex
- [Phase 04-classroom-builder]: classroom-assets bucket is private; reads via createSignedUrl with 1-hour expiry only
- [Phase 04-classroom-builder]: SectionWithCards wrapper avoids hooks-in-map pattern for card rendering inside section list
- [Phase 04-classroom-builder]: AddCardBottomSheet handles pickers and mutations internally — no onSelectType callback to parent
- [Phase 04-classroom-builder]: Storage file removed before DB row delete in useDeleteCard to prevent orphaned files
- [Phase 05-P00]: subscriptions.status uses TEXT + CHECK constraint matching Phase 4 card_type pattern
- [Phase 05-P00]: classrooms/classroom_sections/classroom_cards each got a public authenticated SELECT policy alongside tutor-scoped policies — Postgres OR logic applies
- [Phase 05-P01]: useAllClassrooms uses tutors!inner(profiles!inner(email)) join — fallback is tutors!inner(user_id) only if FK names differ
- [Phase 05-P01]: useSubscribe closes over userId from auth store at call time — correct behavior on logout
- [Phase 05-P02]: ClassroomCard uses standalone container (not wrapping ui/Card.tsx) to support TouchableOpacity as outermost element
- [Phase 05-P02]: LockedContentOverlay uses COLORS.surface at full opacity as a standalone row — UI-SPEC rgba(0.85) applies only when overlaying other content
- [Phase 05-P03]: Button component uses title prop (not children) — adapted plan code to match actual Button.tsx interface
- [Phase 05-P03]: subscribe-confirm receives price_cents as query string param and parses with parseInt — keeps screen-to-screen contract simple
- [Phase 06-direct-messaging]: [Phase 06-01]: messages table uses UUID PKs with ON DELETE CASCADE FKs to classrooms and profiles
- [Phase 06-direct-messaging]: [Phase 06-01]: Four RLS policies (subscriber read/insert, tutor read/insert) using (SELECT auth.uid()) subquery pattern
- [Phase 07-P00]: student_profiles uses profiles(id) as PK (1-to-1, mirrors tutors pattern)
- [Phase 07-P00]: subject_tags shared between tutors and students — single source of truth for tags
- [Phase 07-P00]: classroom_subject_tags junction replaces classrooms.subjects TEXT[] as source of truth; subjects column retained for backward compatibility
- [Phase 07-student-onboarding]: useStudentProfile uses maybeSingle() not single() — new users have no student_profiles row; single() throws PGRST116
- [Phase 07-student-onboarding]: useAllClassrooms tag filtering uses two-step query (fetch classroom_subject_tags IDs then .in()) — avoids ambiguous nested !inner joins with existing tutors!inner
- [Phase 07-student-onboarding]: pendingStudentOnboarding check runs before setLoading(false) in both getUser path and onAuthStateChange — prevents root guard flash for incomplete-onboarding students
- [Phase 07-student-onboarding]: TagBubbleSelect is shared between step-4-subjects (DB tags) and step-5-help-type (hardcoded) via unified {id,label} interface
- [Phase 07-student-onboarding]: Root guard pendingStudentOnboarding check uses !inAuth to prevent redirect loop inside onboarding flow
- [Phase 07-student-onboarding]: step-6-test-date sets both onboarding_complete:true (DB) and setPendingStudentOnboarding(false) (Zustand) before router.replace tabs

### Pending Todos

- Confirm email for ofc.johandp@gmail.com (Supabase email confirmation pending)
- Fix tabs not responding on physical device (lazy: false removed — needs retesting)
- New Supabase schema needed for marketplace tables (tutors, classrooms, sections, cards, subscriptions, messages)

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-04-08T15:29:21.995Z
Stopped at: Completed 07-student-onboarding-P02-PLAN.md
Resume: Run /gsd:plan-phase 3
