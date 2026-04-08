---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 09-04-PLAN.md
last_updated: "2026-04-08T19:43:08.785Z"
last_activity: 2026-04-08
progress:
  total_phases: 9
  completed_phases: 6
  total_plans: 38
  completed_plans: 34
  percent: 89
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-06)

**Core value:** A student opens Druip, finds their tutor's classroom, and has everything they need to pass their test in one place.
**Current focus:** Phase 09 — ui-overhaul

## Current Position

Phase: 09 (ui-overhaul) — EXECUTING
Plan: 5 of 6
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
| Phase 08-rich-classroom-content PP00 | 5min | 2 tasks | 7 files |
| Phase 08-rich-classroom-content PP01 | 8min | 2 tasks | 5 files |
| Phase 08-rich-classroom-content PP02 | 2min | 2 tasks | 6 files |
| Phase 09-ui-overhaul P01 | 4min | 2 tasks | 3 files |
| Phase 09-ui-overhaul P02 | 5min | 2 tasks | 5 files |
| Phase 09 P03 | 4min | 2 tasks | 9 files |
| Phase 09-ui-overhaul P09-04 | 8min | 2 tasks | 5 files |

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
- [Phase 08-P00]: Plain literal CardType union replaces conditional mapped type — stays correct until supabase gen types is re-run post-migration
- [Phase 08-P00]: babel.config.js left unchanged — babel-preset-expo handles reanimated plugin automatically in SDK 54, manual addition causes duplicate plugin crash
- [Phase 08-P01]: content column maps to flashcard front face; title column repurposed as back face — intentional column reuse, no migration needed
- [Phase 08-P01]: CardListItem preview shows card.content (front face) for flashcard cards to avoid leaking the answer in the tutor list
- [Phase 08-P02]: { perspective: 1000 } first in both Reanimated transforms — Android safety
- [Phase 08-P02]: isFlipped toggled in onPress only, never inside useAnimatedStyle — prevents infinite render loop
- [Phase 08-P02]: decodeURIComponent applied to url param in pdf-viewer before WebView — prevents 404 from double-encoding
- [Phase 09-ui-overhaul]: TYPOGRAPHY tokens used as array styles [TYPOGRAPHY.display, {color}] — not spread in StyleSheet.create
- [Phase 09-ui-overhaul]: Font gate merged with auth gate: single SplashScreen.hideAsync() gated by fontsLoaded && !isLoading
- [Phase 09-ui-overhaul]: Button uses Pressable + Animated.View (not TouchableOpacity) — Reanimated scale replaces activeOpacity pattern
- [Phase 09-ui-overhaul]: Card background changed from COLORS.surface to COLORS.card (white) so cards pop against cream background
- [Phase 09-ui-overhaul]: All hooks (useSharedValue, useAnimatedStyle) called unconditionally in Card — pressable wrapper applied conditionally in JSX
- [Phase 09]: heroZone uses COLORS.primary (terracotta) with paddingTop:60 for status bar breathing room and 24px bottom radius on auth screens
- [Phase 09]: OnboardingProgress segmented pill bar replaces circular dots: height:4, borderRadius:2, flex:1 segments with gap:4
- [Phase 09-ui-overhaul]: ClassroomCard uses standalone Pressable + Reanimated scale (withSpring 0.97) — not Card pressable wrapper — per Phase 05-P02 decision to avoid nested pressables
- [Phase 09-ui-overhaul]: react-native-confetti-cannon installed via npm --legacy-peer-deps fallback (expo install fails due to react-dom peer conflict)

### Pending Todos

- Confirm email for ofc.johandp@gmail.com (Supabase email confirmation pending)
- Fix tabs not responding on physical device (lazy: false removed — needs retesting)
- New Supabase schema needed for marketplace tables (tutors, classrooms, sections, cards, subscriptions, messages)

### Blockers/Concerns

None.

### Roadmap Evolution

- Phase 9 added: UI Overhaul — full visual redesign, design system, all screens

## Session Continuity

Last session: 2026-04-08T19:43:08.782Z
Stopped at: Completed 09-04-PLAN.md
Resume: /gsd-plan-phase 9
