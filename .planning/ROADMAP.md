# Roadmap: Druip

**Milestone:** MVP — NWU Potchefstroom Physiotherapy
**Target:** Working app in hands of first real students
**Phases:** 5

---

## Phases

- [ ] **Phase 1: Foundation** — Project scaffolding, Supabase schema + RLS, auth + onboarding flow, navigation shell
- [ ] **Phase 2: Study Flow** — Core lesson loop: Topics → Lessons → Sections → Questions → Feedback → Lesson complete
- [ ] **Phase 3: Progress and Dashboard** — Readiness scoring, weak areas, progress tracking, full home dashboard
- [ ] **Phase 4: Gamification and Notes** — Streaks with freeze, XP system, notes creation and browsing
- [ ] **Phase 5: Content Pipeline and Production Readiness** — AI-assisted content pipeline, NWU physio module seed, production hardening

---

## Phase Details

### Phase 1: Foundation

**Goal:** A new or returning user can open the app, complete a sample lesson before signing up, create an account, set a daily goal, and land on a functional navigation shell — with the entire Supabase schema, RLS policies, and project configuration in place.

**Depends on:** Nothing (first phase)

**Requirements covered:**
AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, DASH-04, SEED-02, SEED-03, SEED-05, SEED-06

**Success criteria:**
- [ ] A new user can open the app, complete a 5-question sample lesson without an account, and is then prompted to sign up — reachable within 2 minutes of first open.
- [ ] A user can register with email and password only; re-opening the app restores their session without re-authentication.
- [ ] A returning authenticated user lands on the home tab, not the onboarding flow; an unauthenticated user lands on the onboarding flow.
- [ ] The app shows a login screen (not a crash or blank screen) when launched offline with no valid session.
- [ ] The bottom tab bar shows exactly 5 tabs; the full Module → Topic → Lesson → Section content hierarchy is defined in the database schema with `is_published`, `xp_reward`, `lesson_type`, and sequential unlock fields present on the correct tables; RLS is enabled on every public table.

**Plans:** 3/4 plans executed

Plans:
- [x] 01-01-PLAN.md — Project scaffold: Expo SDK 55 init, dependencies, EAS config, Expo Router file structure, Jest + Wave 0 test stubs
- [x] 01-02-PLAN.md — Supabase schema: content hierarchy tables, user tables, RLS policies, Supabase client + TypeScript types, db push
- [ ] 01-03-PLAN.md — Auth and onboarding: play-first landing, sample lesson, sign-up prompt, email/password auth, goal selection, Stack.Protected routing
- [x] 01-04-PLAN.md — Navigation shell: 5-tab navigator with icons, theme constants, Button/Card/WindowedFlatList UI primitives

**UI hint**: yes

---

### Phase 2: Study Flow

**Goal:** A student can navigate to a lesson, move through questions one at a time with immediate color and icon feedback, see explanations for wrong answers, and land on a lesson-complete screen that shows XP earned and streak status.

**Depends on:** Phase 1

**Requirements covered:**
STUDY-01, STUDY-02, STUDY-03, STUDY-04, STUDY-05, STUDY-06, STUDY-07, STUDY-08, STUDY-09, CONT-06

**Success criteria:**
- [ ] A student can start a lesson and move through 10–20 questions, one at a time, with a progress bar at the top that advances on every answer and never shrinks.
- [ ] Tapping an answer locks the interface within 150ms: the selected option shows green + checkmark or red + X; on a wrong answer, the correct option is also highlighted green; only the selected wrong option shows red.
- [ ] A feedback panel appears after every answer — wrong answers show "Correct answer:" plus the explanation text; the student must tap "Continue" to advance (no auto-advance on wrong answers).
- [ ] Completing the final question takes the student to a lesson-complete screen showing XP earned, a score summary (e.g. "12 of 15 correct"), and a single primary CTA.
- [ ] All tappable elements meet the 44×44pt minimum touch target; questions without an explanation field cannot be published (`is_published` blocked at the data layer).

**Plans:**
1. Study session engine — Build Zustand store for active quiz session (current question index, answers, score, lock state); implement single-card render (no FlatList); connect to lesson questions via TanStack Query
2. Question card and answer UX — Build question card component with 4 stacked answer options, answer lock on tap, 150ms color + icon feedback (green/checkmark, red/X), dual highlight on wrong answer selection
3. Feedback panel and explanation — Build slide-up feedback panel for correct (positive reinforcement) and wrong (explanation text + correct answer highlight) states; manual Continue button; CONT-06 publish gate
4. Lesson-complete screen — Build completion screen with XP display, score summary, streak status indicator, and primary CTA; wire lesson attempt to `lesson_attempts` table with `completed` status

**UI hint**: yes

---

### Phase 3: Progress and Dashboard

**Goal:** A student can see per-topic readiness tiers, weak areas, and lesson completion counts on a dedicated Progress screen, and the home screen shows streak status, daily goal progress, topic cards with readiness tiers, and a dominant CTA.

**Depends on:** Phase 2

**Requirements covered:**
PROG-01, PROG-02, PROG-03, PROG-04, PROG-05, PROG-06, PROG-07, DASH-01, DASH-02, DASH-03, DASH-05, DASH-06

**Success criteria:**
- [ ] The Progress tab shows each topic with a named readiness tier (Not Started / Learning / Practicing / Ready) and a lesson completion count (e.g. "8 of 12 lessons done"); no single aggregate course percentage is shown as the only metric.
- [ ] Weak areas are surfaced with three severity tiers (Critical / Moderate / Watch) when a topic tag has less than 70% accuracy across 3 or more responses; a maximum of 10 weak areas are shown.
- [ ] A Postgres trigger fires on every `lesson_attempt` completion and upserts `user_lesson_progress` and recalculates the topic's readiness score; a nightly scheduled function applies Ebbinghaus-inspired decay.
- [ ] The home screen shows the streak counter, daily goal progress (e.g. "1 of 2 lessons done today"), a scrollable list of topic cards with readiness tier labels, and a dominant "Continue" or "Start studying" CTA; cumulative stats (total XP, all-time records) are not on the home screen.
- [ ] A new user's home screen is never blank — the first topic card and CTA are visible immediately after account creation.

**Plans:**
1. Readiness score engine — Implement four-component readiness formula (lesson completion 30%, quiz score 35%, recency decay 20%, streak consistency 15%); Postgres trigger on `lesson_attempt` completion; nightly decay scheduled function
2. Progress screen — Build Progress tab with per-topic readiness tier cards, lesson count display (done vs. total), weak area detection and severity tier display (max 10 items)
3. Home dashboard — Build Home tab with streak counter + flame icon, daily goal progress indicator, scrollable topic cards with readiness tier and unlock state, dominant CTA button; non-empty state for new users
4. Study tab topic browser — Build Study tab with full topic list, readiness tier labels, unlock state indicators, and drill-down to lesson list

**UI hint**: yes

---

### Phase 4: Gamification and Notes

**Goal:** A student earns XP and sees their streak maintained (or frozen) day to day, sees gamification elements on the home screen and profile, and can create, browse, and delete notes anchored to topics from within lessons and the feedback panel.

**Depends on:** Phase 3

**Requirements covered:**
GAME-01, GAME-02, GAME-03, GAME-04, GAME-05, GAME-06, GAME-07, NOTES-01, NOTES-02, NOTES-03, NOTES-04, NOTES-05, NOTES-06

**Success criteria:**
- [ ] A student's streak increments when they complete at least one lesson on a calendar day; a new account is granted 2 streak freezes that are consumed automatically on a missed day when available; the flame icon shows warm/cool color state based on whether today's lesson is done.
- [ ] When a streak increments, the streak number shows a "pop" animation of no longer than 500ms that does not block the student from continuing; streak freeze inventory is visible in the Profile tab.
- [ ] XP is awarded on lesson completion at the lesson's `xp_reward` value; total XP is visible in the Profile or Progress screen; all streak-related language in the app uses approach framing ("Your streak is waiting for you"), never shame framing.
- [ ] A student can create a note from within any lesson or from the wrong-answer feedback panel; notes are auto-tagged with the current topic; notes support free-text with bold and bullet Markdown shortcuts.
- [ ] Notes are viewable from the topic detail screen (topic-scoped) and the global Notes tab (all notes, searchable); a student can delete their own notes; notes are stored locally first and survive an app close when offline.

**Plans:**
1. Streak and freeze system — Implement streak calendar-day logic, auto-freeze consumption on missed day, streak increment trigger on lesson completion, warm/cool flame icon state, pop animation on streak increment
2. XP and profile — Award XP on lesson completion from `xp_reward` field, persist total XP to user profile, display streak freeze inventory and XP in Profile tab; enforce approach-framing copy across all streak-related text
3. Notes creation and editor — Build note editor with free-text + Markdown shortcuts (Bold, Bullet); "Add a note" entry points from lesson screen and wrong-answer feedback panel; auto-populate topic tag; MMKV local-first storage with Supabase sync
4. Notes browsing — Build global Notes tab (searchable list, delete), topic-scoped notes view on topic detail screen; wire online sync; enforce private-only access via RLS policy

**UI hint**: yes

---

### Phase 5: Content Pipeline and Production Readiness

**Goal:** The NWU Potchefstroom physiotherapy module is fully seeded with reviewed, published content via a reproducible SQL migration pipeline, the Supabase project is on Pro, and the app is hardened for first real students.

**Depends on:** Phase 4

**Requirements covered:**
CONT-07, CONT-08, SEED-01, SEED-04

**Success criteria:**
- [ ] At minimum one complete NWU Potchefstroom physiotherapy topic — with lessons, sections, and questions — is seeded and `is_published = true` before any real student account is created.
- [ ] Every piece of seeded content (questions, summaries, explanations) has passed a human review step before `is_published` is set to `true`; no raw AI-generated content is visible to students.
- [ ] All module content can be reproduced from source control: seeding is delivered as SQL migration files, not dashboard-only data entry.
- [ ] The Supabase project is upgraded to Pro before first real student onboarding, eliminating the risk of free-tier project pausing.

**Plans:**
1. AI-assisted content creation pipeline — Build Claude-assisted workflow to draft lessons, section summaries, and questions for NWU physio module; establish human review step (review checklist, `is_published` gate) before any content is approved
2. Content seeding via SQL migrations — Author SQL migration files for the full NWU physio module (at minimum one complete topic); validate all questions have explanation fields; run against staging Supabase project
3. Production hardening — Upgrade Supabase to Pro plan; run RLS audit against all public tables; smoke-test OTA update flow on staging channel; verify `runtimeVersion: "fingerprint"` is active; verify FlatList windowing config; confirm push notification permission is gated behind first lesson completion

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/4 | In Progress|  |
| 2. Study Flow | 0/4 | Not started | - |
| 3. Progress and Dashboard | 0/4 | Not started | - |
| 4. Gamification and Notes | 0/4 | Not started | - |
| 5. Content Pipeline and Production Readiness | 0/3 | Not started | - |

---

## Traceability

All 57 v1 requirements are mapped. (The prompt referenced 50; the final REQUIREMENTS.md contains 57 defined requirement IDs.)

| Requirement ID | Description (short) | Phase | Status |
|----------------|---------------------|-------|--------|
| AUTH-01 | Play-first onboarding, lesson before sign-up | Phase 1 | Pending |
| AUTH-02 | Email/password sign-up only | Phase 1 | Pending |
| AUTH-03 | Session persistence across restarts | Phase 1 | Pending |
| AUTH-04 | expo-sqlite session storage, URL polyfill | Phase 1 | Pending |
| AUTH-05 | Graceful offline launch handling | Phase 1 | Pending |
| AUTH-06 | Authenticated user bypasses onboarding | Phase 1 | Pending |
| AUTH-07 | Three daily goal options at onboarding | Phase 1 | Pending |
| AUTH-08 | Notification permission gated after first lesson | Phase 1 | Pending |
| CONT-01 | Module → Topic → Lesson → Section hierarchy | Phase 1 | Pending |
| CONT-02 | Lesson type field in schema | Phase 1 | Pending |
| CONT-03 | XP reward per lesson | Phase 1 | Pending |
| CONT-04 | Sequential lesson unlocking | Phase 1 | Pending |
| CONT-05 | is_published flag on all content tables | Phase 1 | Pending |
| CONT-06 | Explanation required before question can publish | Phase 2 | Pending |
| CONT-07 | Human review gate for AI content | Phase 5 | Pending |
| CONT-08 | Full module seeded before first student | Phase 5 | Pending |
| STUDY-01 | Single-question-at-a-time flow with progress bar | Phase 2 | Pending |
| STUDY-02 | Progress bar advances on every answer | Phase 2 | Pending |
| STUDY-03 | Maximum 4 answer options per question | Phase 2 | Pending |
| STUDY-04 | Answer lock + color/icon feedback within 150ms | Phase 2 | Pending |
| STUDY-05 | Correct answer highlighted on wrong selection | Phase 2 | Pending |
| STUDY-06 | Explanation panel + manual Continue on wrong answer | Phase 2 | Pending |
| STUDY-07 | Lesson-complete screen with XP + CTA | Phase 2 | Pending |
| STUDY-08 | Minimum 44x44pt touch targets | Phase 2 | Pending |
| STUDY-09 | Android keyboard handling configuration | Phase 2 | Pending |
| PROG-01 | Named readiness tiers (Not Started / Learning / Practicing / Ready) | Phase 3 | Pending |
| PROG-02 | Four-component readiness score formula | Phase 3 | Pending |
| PROG-03 | Nightly readiness decay via scheduled function | Phase 3 | Pending |
| PROG-04 | Per-topic readiness breakdown, never aggregate-only | Phase 3 | Pending |
| PROG-05 | Weak area detection with three severity tiers | Phase 3 | Pending |
| PROG-06 | Progress screen shows lessons done vs. total | Phase 3 | Pending |
| PROG-07 | Postgres trigger updates progress on attempt completion | Phase 3 | Pending |
| NOTES-01 | Notes created from within lessons, auto-tagged to topic | Phase 4 | Pending |
| NOTES-02 | "Add a note" prompt in wrong-answer feedback panel | Phase 4 | Pending |
| NOTES-03 | Free-text + lightweight Markdown notes | Phase 4 | Pending |
| NOTES-04 | Notes viewable from topic screen and global notes list | Phase 4 | Pending |
| NOTES-05 | Notes stored locally first, synced when online | Phase 4 | Pending |
| NOTES-06 | Student can delete own notes; notes are private | Phase 4 | Pending |
| GAME-01 | Streak = consecutive calendar days with one completed lesson | Phase 4 | Pending |
| GAME-02 | 2 streak freezes granted at account creation | Phase 4 | Pending |
| GAME-03 | Flame icon with warm/cool color state on home screen | Phase 4 | Pending |
| GAME-04 | Streak number pop animation on increment | Phase 4 | Pending |
| GAME-05 | Streak freeze inventory visible in profile | Phase 4 | Pending |
| GAME-06 | XP awarded on lesson completion, tracked in profile | Phase 4 | Pending |
| GAME-07 | Approach-framing language only in streak notifications | Phase 4 | Pending |
| DASH-01 | Home screen: streak + daily goal + dominant CTA | Phase 3 | Pending |
| DASH-02 | Home screen: topic cards with readiness tier | Phase 3 | Pending |
| DASH-03 | Cumulative stats hidden from home screen | Phase 3 | Pending |
| DASH-04 | Bottom tab bar with 5 tabs; no hamburger menu | Phase 1 | Pending |
| DASH-05 | Non-empty home screen for new users | Phase 3 | Pending |
| DASH-06 | Study tab: full topic browser with unlock state | Phase 3 | Pending |
| SEED-01 | Supabase Pro plan before first real student | Phase 5 | Pending |
| SEED-02 | RLS enabled on all public tables before first user | Phase 1 | Pending |
| SEED-03 | supabase-js pinned to v2.49.9 or later | Phase 1 | Pending |
| SEED-04 | Content seeding via SQL migrations, not dashboard only | Phase 5 | Pending |
| SEED-05 | runtimeVersion fingerprint + staging channel before production OTA | Phase 1 | Pending |
| SEED-06 | FlatList windowing config; single card render in study session | Phase 1 | Pending |

**Coverage:** 57/57 requirements mapped. No orphans.
