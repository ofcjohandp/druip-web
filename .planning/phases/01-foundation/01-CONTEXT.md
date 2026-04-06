# Phase 1: Foundation - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Project scaffold, full Supabase schema + RLS, play-first onboarding (sample lesson before sign-up), email/password auth, daily goal selection, and a 5-tab navigation shell. This phase delivers everything required before the study flow can be built.

No existing code — greenfield. All decisions here are first principles.

</domain>

<decisions>
## Implementation Decisions

### Play-First Onboarding Entry
- **D-01:** First screen shows Druip logo + one-liner tagline + single CTA button "Try a lesson". No account gate, no tutorial, no carousel. One tap to be in a lesson.
- **D-02:** The sample lesson uses the exact same question card UI as real lessons — no "demo mode" indicator or visual distinction. The user sees the real product.
- **D-03:** 5 questions in the sample lesson (hardcoded seed data). No skip option during the lesson.

### Post-Lesson Sign-Up Prompt
- **D-04:** After completing the sample, navigate to a full-screen sign-up prompt (not a modal). Screen shows score (e.g. "You scored 4/5!") + celebration moment + primary CTA "Create account".
- **D-05:** Sign-up prompt tone is friendly and progress-framing, not a hard gate. A secondary option to proceed is acceptable but should not be visually dominant.
- **D-06:** Do not auto-advance to sign-up. User must tap the CTA.

### Daily Goal Selection
- **D-07:** Three goal cards at onboarding: **Chill** (1 lesson/day), **Steady** (2 lessons/day), **Focused** (3 lessons/day). No time-based framing.
- **D-08:** Goal selection is a single-tap card. No confirmation step. Tapping a card advances to the app shell immediately.
- **D-09:** Selected goal is stored in user profile table in Supabase. Default is Steady (2/day) if not set.

### Visual Identity Baseline
- **D-10:** Background: white (`#FFFFFF`). Surface cards: warm off-white (`#FAFAF8` or equivalent). No dark mode for MVP.
- **D-11:** Accent color: soft coral/peach (approx `#FF6B6B` or similar warm tone — exact hex to be refined, but warm not cool).
- **D-12:** Border radius: 16px for cards, 24px for bottom sheets and modals, 12px for buttons.
- **D-13:** Typography: system fonts — SF Pro on iOS, Roboto on Android. No custom font import for MVP.
- **D-14:** Spacing: generous. Minimum 16px padding inside cards. 24px between major sections. No information density — breathing room is the aesthetic.

### Navigation Shell
- **D-15:** 5 tabs (DASH-04): Home · Study · Progress · Notes · Profile. Exact order.
- **D-16:** Tab bar uses rounded icons, system icon library (Expo vector icons). Active state uses accent color.
- **D-17:** All tabs render immediately after auth — no lazy loading at the navigation level. Individual screens handle their own empty/loading states.

### Auth and Session
- **D-18:** expo-sqlite session storage (not AsyncStorage) as required by AUTH-04. Import `react-native-url-polyfill/auto` before Supabase initializes.
- **D-19:** On offline launch with no valid session: navigate to login screen. No crash, no blank screen. Login screen shows a subtle offline notice.
- **D-20:** Authenticated users bypass onboarding entirely — `Stack.Protected` routes guard both the onboarding flow and sample lesson entry.

### Supabase Schema
- **D-21:** Content hierarchy: `modules → topics → lessons → sections → questions`. All with `is_published` flag, `created_at`, `updated_at`.
- **D-22:** `lessons` table includes: `lesson_type` (enum), `xp_reward` (integer), `order` (integer for sequential unlock within topic).
- **D-23:** Sequential unlock is topic-level: lessons within a topic must be completed in order (`order` field). Lessons across topics are unlocked by topic prerequisite in `topics.requires_topic_id` (nullable FK).
- **D-24:** RLS enabled on all public tables before first user (SEED-02). Policies: authenticated users can read published content; users can only read/write their own progress rows.
- **D-25:** supabase-js pinned to v2.49.9+ (SEED-03).

### Claude's Discretion
- EAS build profile configuration details (development/staging/production)
- Exact SQL for RLS policies beyond the rules above
- FlatList windowing config values (SEED-06) — use Expo defaults unless there's a reason to override
- Notification permission timing (AUTH-08) — implement the hook but keep the trigger point flexible for Phase 2 refinement
- Loading skeleton design and exact animation timing
- Error state copy and styling

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Foundation
- `.planning/REQUIREMENTS.md` — Full requirement traceability table; Phase 1 requirements: AUTH-01 through AUTH-08, CONT-01 through CONT-05, DASH-04, SEED-02, SEED-03, SEED-05, SEED-06
- `.planning/ROADMAP.md` §Phase 1 — Phase goal, success criteria, and 4-plan breakdown
- `CLAUDE.md` §Technology Stack — Stack decisions, Supabase React Native gotchas, Expo SDK version, navigation, state management, offline strategy, and recommended package list

### Key Technical Constraints (from CLAUDE.md)
- Expo SDK 55 Managed Workflow
- supabase-js v2.49.9+ (ws/stream crash fix)
- expo-sqlite session storage (not AsyncStorage — offline session loss bug)
- URL polyfill must be imported before Supabase client init
- `npx expo install` (not npm) for all Expo-ecosystem packages
- TanStack Query v5 for server data; Zustand for client state
- Expo Router for navigation (file-based, SDK 55 bundled)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project. No existing components, hooks, or utilities.

### Established Patterns
- None yet. This phase establishes the patterns that all subsequent phases will follow.
- Key patterns to establish here: Supabase client singleton (`src/lib/supabase.ts`), TanStack Query setup, Zustand slice structure, Expo Router file structure, theme constants.

### Integration Points
- This phase creates all integration points. Subsequent phases connect to: Supabase tables (defined here), auth context (defined here), navigation shell (defined here), theme constants (defined here).

</code_context>

<specifics>
## Specific Ideas

- "First screen should feel like picking up a book, not signing up for a service" — minimal friction to the first lesson
- "Soft coral/peach accent — warm not cool. Think calm confidence, not corporate blue."
- Tab order: Home · Study · Progress · Notes · Profile (exactly this order, Home first)
- Goal cards framed as commitment level (Chill / Steady / Focused), not time or lesson counts as the primary label — the lesson count is secondary/descriptive

</specifics>

<deferred>
## Deferred Ideas

- Dark mode — post-MVP, not needed for validation
- Custom font import (e.g. Nunito, Poppins) — can be added in a later phase if the system font doesn't fit the brand
- Guest mode with local-only progress — out of scope; sign-up prompt is the conversion point
- Push notification content and scheduling — AUTH-08 is implemented as a hook but trigger logic is Phase 2+
- Onboarding analytics / funnel tracking — post-validation

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-06*
