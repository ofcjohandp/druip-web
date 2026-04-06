# Requirements: Druip

**Defined:** 2026-04-06
**Core Value:** A student opens Druip and feels calmer, clearer, and more in control — not confused, overloaded, or lost.

---

## v1 Requirements

### Authentication & Onboarding

**AUTH-01** — A new user can complete a 5-question sample lesson before being prompted to create an account. The lesson must be reachable within 2 minutes of first app open with zero prior configuration.

**AUTH-02** — A user can create an account using email and password only. No additional fields (university, student number, year of study) are collected at sign-up.

**AUTH-03** — A user's session persists across app restarts. Re-opening the app does not require re-authentication when a valid session exists.

**AUTH-04** — The Supabase client uses `expo-sqlite`'s localStorage shim (not AsyncStorage) for session storage. The `react-native-url-polyfill/auto` import appears before any Supabase initialization.

**AUTH-05** — The app handles a failed session refresh on offline launch gracefully: the user sees a login screen rather than a crash or a blank screen.

**AUTH-06** — A returning user who is already authenticated lands on the home dashboard, not the onboarding flow.

**AUTH-07** — The onboarding sequence presents exactly three daily goal options (Casual: 1 lesson/day, Regular: 2 lessons/day, Intense: 3 lessons/day) as selectable cards before the first lesson. No slider or text input is used.

**AUTH-08** — Push notification permission is requested only after the user completes their first full lesson and has seen the lesson-complete screen. It is never requested on the first screen after sign-up.

---

### Content Structure

**CONT-01** — All content is organized in a four-level hierarchy: Module → Topics → Lessons → Sections. A student navigates downward through this hierarchy to reach study content.

**CONT-02** — Each lesson has a `lesson_type` of `standard`, `practice`, or `challenge`. Only standard lessons are required for v1; the type field is present in the schema to avoid a future migration.

**CONT-03** — Each lesson has an XP reward value. The default is 10 XP. This value is configurable per lesson in the content seed data.

**CONT-04** — Lessons support sequential unlocking: a lesson can require a previous lesson to be completed before it becomes available. The first lesson in each topic is always unlocked.

**CONT-05** — All content (modules, topics, lessons, sections, questions) has an `is_published` boolean flag. Unpublished content is invisible to students even if it exists in the database.

**CONT-06** — Every question has an `explanation` field. Explanations must be authored for all questions before content goes live. Questions without explanations are blocked from publishing.

**CONT-07** — All AI-assisted content (questions, summaries, explanations) must pass through a human review step before `is_published` is set to `true`. No raw AI-generated content reaches a student without explicit approval.

**CONT-08** — The NWU Potchefstroom physiotherapy module is fully seeded with content — at minimum one complete topic with lessons, sections, and questions — before the first student account is created.

---

### Study Flow

**STUDY-01** — A student can start a lesson and move through questions one at a time. The lesson presents 10–20 questions per session. The total question count is visible as a progress bar at the top of the screen.

**STUDY-02** — The session progress bar advances on every question answered, regardless of whether the answer was correct or incorrect. The bar never shrinks.

**STUDY-03** — Each question displays a maximum of 4 answer options stacked vertically. All options have identical visual weight before the student taps.

**STUDY-04** — When a student taps an answer option, the interface locks immediately — no further option selection is possible. Color and icon feedback (green + checkmark for correct, red + X for incorrect) appears on the selected option within 150ms of the tap.

**STUDY-05** — When the student selects a wrong answer, the correct answer is also highlighted in green so both are visible simultaneously. Only the selected wrong option shows red — other unselected wrong options remain visually neutral.

**STUDY-06** — A feedback panel appears after every answer. For correct answers it shows brief positive reinforcement. For wrong answers it shows "Correct answer:" with the right option and the question's explanation text (1–3 sentences). The student must manually tap "Continue" to advance — the session never auto-advances after a wrong answer.

**STUDY-07** — When the final question in a lesson is answered and the student taps "Continue", they are taken to a lesson-complete screen. This screen shows XP earned, streak status, a score summary (e.g. "12 of 15 correct"), and a single primary CTA to continue or return home.

**STUDY-08** — All tappable elements within the study flow have a minimum touch target of 44x44 points (iOS) / 48x48dp (Android). `hitSlop` is used where visual size is smaller than the minimum.

**STUDY-09** — Any screen containing a text input (notes, onboarding) uses `KeyboardAvoidingView` with `behavior="height"` on Android and includes `"softwareKeyboardLayoutMode": "resize"` in `app.json`. All such screens are tested on a physical Android device before release.

---

### Readiness & Progress

**PROG-01** — Each topic shows a readiness tier using named labels, not a raw percentage as the primary display. The four tiers are: Not Started (0%), Learning (1–49%), Practicing (50–79%), Ready (80–100%). The percentage is shown as secondary information only.

**PROG-02** — The readiness score per topic is calculated from four weighted components: lesson completion rate (30%), average quiz score (35%), recency decay factor (20%), and streak consistency factor (15%).

**PROG-03** — Readiness scores decay over time using an Ebbinghaus-inspired exponential function. A topic not reviewed in 14 days decays toward 50% of its peak score. Decay is recalculated nightly via a scheduled Supabase database function.

**PROG-04** — The readiness display always shows per-topic breakdown. A single aggregate "module readiness %" is never the only readiness metric shown to the student.

**PROG-05** — Weak areas are surfaced when a topic tag has less than 70% accuracy across 3 or more responses. Three severity tiers are used: Critical (below 40%), Moderate (40–59%), Watch (60–69%). A maximum of 10 weak areas are shown at once.

**PROG-06** — The progress screen shows each topic's readiness tier and a count of lessons completed vs. total lessons available (e.g. "8 of 12 lessons done"). It does not show a single aggregate course percentage.

**PROG-07** — Every `lesson_attempt` that transitions to `completed` status automatically triggers an upsert to `user_lesson_progress` and a recalculation of the relevant topic's readiness score via a Postgres trigger.

---

### Notes

**NOTES-01** — A student can create a note from within any lesson or from any question's feedback panel. Notes created in this context are automatically tagged with the current topic.

**NOTES-02** — The feedback panel for wrong answers includes a subtle "Add a note" prompt. Tapping it opens the note editor pre-filled with the topic name. The prompt is secondary to the explanation — it does not obscure feedback content.

**NOTES-03** — Notes support free-text entry with lightweight Markdown (bold, bullet list). No WYSIWYG toolbar is shown. A minimal formatting shortcut bar (Bold, Bullet) is acceptable.

**NOTES-04** — A student can view their notes from two locations: the topic detail screen (showing only notes tagged to that topic) and a global notes list (all notes, searchable by text).

**NOTES-05** — Notes are stored locally first and synced to Supabase when connectivity is available. A note created offline is not lost when the student closes the app.

**NOTES-06** — A student can delete their own notes. Notes cannot be shared or viewed by other users.

---

### Gamification

**GAME-01** — A student's streak represents the number of consecutive calendar days on which they completed at least one lesson. Completing any single lesson on a given day satisfies the streak requirement for that day.

**GAME-02** — Every new account is granted 2 streak freezes at the point of account creation. A streak freeze preserves the streak through one missed day and is consumed automatically when a day is missed and a freeze is available.

**GAME-03** — The streak counter and flame icon are visible on the home screen at all times. When today's lesson has not yet been completed, the flame displays in a cool/muted color state. After today's lesson is completed, it transitions to a warm/active state.

**GAME-04** — When a lesson is completed and the streak increments, the streak number shows a brief "pop" animation. The animation is no longer than 500ms and does not block the student from continuing.

**GAME-05** — Streak freeze inventory is visible in the student's profile screen. The count of remaining freezes is shown.

**GAME-06** — XP is awarded upon lesson completion at the rate defined in the lesson's `xp_reward` field. Total XP is stored in the student's profile and displayed in the progress/stats screen.

**GAME-07** — Streak-related notifications (if enabled) use approach-framing language only. Example: "Your 15-day streak is waiting for you." Shame-framing language ("You're about to lose your streak") is not used anywhere in the app.

---

### Dashboard

**DASH-01** — The home screen shows the streak counter, the daily goal progress indicator (e.g. "1 of 2 lessons done today"), and a primary CTA button ("Continue" or "Start studying") as the dominant elements. The CTA is the most visually prominent element on the screen.

**DASH-02** — The home screen shows a scrollable list of topic cards. Each card shows: topic name, readiness tier label, and a visual indicator distinguishing completed vs. in-progress topics.

**DASH-03** — The home screen does not show cumulative statistics (total XP, total questions answered, all-time records), leaderboards, or full mastery breakdowns. These exist behind a dedicated Progress tab.

**DASH-04** — The app uses a bottom tab bar with exactly 5 tabs: Home, Study, Progress, Notes, Profile. A hamburger menu is not used.

**DASH-05** — When a student with no completed lessons opens the app after account creation, they see a non-empty home screen with the first topic card visible and the CTA directing them to their first lesson. There is no blank or empty-state home screen.

**DASH-06** — The Study tab shows the full topic browser for the enrolled module. Topics display their readiness tier and unlock state. A student can navigate from any topic to its lessons from this tab.

---

### Content Seeding (Admin / Setup)

**SEED-01** — The Supabase project is upgraded to the Pro plan before any real student account is created. Free-tier project pausing must not be possible during the student-facing period.

**SEED-02** — Row Level Security (RLS) is enabled on every table in the public schema before any real user data is written. Every table has at minimum a read policy that restricts access to the authenticated user's own rows.

**SEED-03** — All `supabase-js` usage pins to v2.49.9 or later. The `package.json` does not specify a version older than 2.49.9.

**SEED-04** — The content seeding pipeline produces SQL migration files (not dashboard-only data entry) so that the full module content can be reproduced from source control.

**SEED-05** — The `runtimeVersion` in `app.config.js` is set to `"fingerprint"` policy. OTA updates are deployed to a `staging` channel before being promoted to `production`.

**SEED-06** — All FlatList components used for content lists (topic cards, notes, lesson lists) are configured with `windowSize={5}`, `removeClippedSubviews={true}`, `initialNumToRender={5}`, `maxToRenderPerBatch={5}`, and a stable `keyExtractor`. The active question card inside a study session does not use FlatList — it renders a single card component that swaps on answer.

---

## v2 Requirements

The following requirements are acknowledged and intentionally deferred. They will be re-evaluated after the MVP cohort has been validated.

- **Offline quiz submission** — Answer responses submitted while offline, queued and synced when connectivity returns. Requires WatermelonDB or equivalent sync architecture. Deferred: offline write-conflict resolution adds significant schema complexity.
- **Spaced repetition scheduling (SM-2)** — Adaptive per-card scheduling based on individual response history. Deferred: readiness score provides the signal; scheduling algorithm is the next layer.
- **Exam date countdown** — "Your exam is in 14 days; 3 topics still at low readiness." Deferred: requires calendar input and scheduling integration.
- **Push notifications** — Streak reminders and study prompts. Deferred: core study loop must be validated first.
- **Streak repair window** — Time-limited option to recover a broken streak by completing lessons on the day it breaks. Deferred: streak freeze covers the primary protection case at launch.
- **Peer comparison / institution-scoped leaderboard** — Requires sufficient user density within an institution to be meaningful. Deferred: not meaningful below ~50 concurrent active users.
- **Multi-module / multi-university support** — Single module, single cohort for MVP.
- **Load-shedding-aware offline read mode** — Full TanStack Query MMKV persistence for offline content browsing. Deferred: offline read is architecturally planned (MMKV persister in query client) but not shipped as a guaranteed UX in v1.
- **Notes to flashcard conversion** — Turning pinned note content into quiz-style review cards.
- **Social features** — Study groups, deck sharing, friend streaks. Explicitly out of scope until core loop is validated.

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| OAuth / social login (Google, Apple) | Email/password is sufficient for MVP; OAuth adds redirect handling complexity in React Native |
| Video lesson content | High data cost for SA students; delivery infrastructure overhead not justified for MVP |
| Open-ended / free-text questions | Grading is unsolved; feedback loop breaks without instant evaluation |
| Duolingo-style hearts (lives system) | Research shows it is the most disliked mechanic; creates anxiety, not learning |
| Feature onboarding tours / tooltips | Students skip them universally; they delay the first lesson |
| In-app payments / subscriptions | Validate daily return behaviour before monetising |
| Global / app-wide leaderboards | Rewards free time over effort; demotivates the bottom 80% |
| Multiple universities or courses | Narrow scope is the constraint; quality over breadth |
| Web app / PWA | Students are mobile-first; Expo covers iOS and Android |
| Rich media attachments in notes | Increases data and storage load; text-only notes sufficient for MVP |
| Placement tests / diagnostic assessment | Adds friction to onboarding; start all students at the same entry point |
| Separate native Android and iOS codebases | Expo Managed Workflow handles cross-platform |

---

## Traceability

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
