# Phase 3: Tutor Onboarding - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

A user can toggle "I want to teach" during sign-up, land directly in a classroom creation form, fill in name/subjects/bio/price, and create a published classroom. After creation, the tutor can return to classroom settings via the Profile tab and edit any field.

Entry point: existing sign-up screen. Exit point: tutor is inside the app with a classroom created and accessible from Profile tab.

No classroom sections, no material cards, no student discovery, no subscriptions — those are Phases 4 and 5. This phase is tutor identity and classroom metadata only.

</domain>

<decisions>
## Implementation Decisions

### Sign-up Toggle Placement
- **D-01:** The "I want to teach" toggle appears on the existing sign-up screen (`src/app/(auth)/sign-up.tsx`), below the email/password fields. One additional UI element on the existing screen — no new screen for this intent capture.
- **D-02:** The toggle is optional (off by default). Students who don't toggle proceed to goal-selection as before. Tutors who toggle skip goal-selection entirely.

### Tutor Post-Sign-Up Flow
- **D-03:** After a tutor signs up (toggle on), navigate directly to classroom creation — skip `/(auth)/goal-selection`. No welcome/intermediate screen. Purposeful and fast.
- **D-04:** The classroom creation screen is a standalone screen (not a tab). Route: `/(auth)/create-classroom` or similar one-off route that navigates into `/(tabs)` after successful creation.

### Classroom Creation Form
- **D-05:** Single scrollable form with all fields on one screen: classroom name, subjects, bio, monthly price. Single "Create classroom" CTA at the bottom. No multi-step flow.
- **D-06:** Price field defaults to R180 (pre-filled, editable). Currency label "R" shown inline as prefix. No currency picker — South African Rand only for v1.0.
- **D-07:** Subjects use a free-text tag input: tutor types a subject name, taps "Add" (or presses return), and the tag appears below the input. Multiple tags supported. Tags are removable by tapping an ✕ on each tag chip.
- **D-08:** All fields are required for creation. "Create classroom" button is disabled (or shows inline validation) until name, at least one subject, and price are filled. Bio is optional.

### Classroom Settings (Edit — TUTR-04)
- **D-09:** Classroom settings is a dedicated screen accessible from the Profile tab. It reuses the same fields as creation (name, subjects, bio, price) but pre-filled with current values. Same "Save changes" CTA.
- **D-10:** Changes save on CTA tap (not inline/autosave). No unsaved-changes confirmation needed for MVP.

### Tutor Navigation
- **D-11:** Tutors see the same 5-tab nav as students. The Profile tab content is conditionally different: if the user is a tutor, the Profile screen shows a "My Classroom" card as the primary element, with tappable links to classroom settings and (later) sections.
- **D-12:** Non-tutor users see the Profile tab as today (placeholder "Your profile" screen). The conditional rendering is based on whether the user has a tutor record in Supabase.

### Claude's Discretion
- Exact toggle component style (switch vs checkbox vs tap-to-select card)
- Sign-up screen layout adjustment for the new toggle (spacing, label copy)
- Classroom creation screen header title and nav button style
- Exact tag chip styling (border, remove icon size, wrapping layout)
- Profile screen layout for the tutor My Classroom card (icon, arrow, description text)
- Loading and error states for classroom creation form

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/REQUIREMENTS.md` §Tutor Onboarding — TUTR-01, TUTR-02, TUTR-03, TUTR-04
- `.planning/ROADMAP.md` §Phase 3 — Phase goal, success criteria, dependency on Phase 1

### Codebase Patterns to Reuse
- `src/app/(auth)/sign-up.tsx` — MODIFY this file to add the "I want to teach" toggle. Read before touching — understand current state shape.
- `src/app/(auth)/goal-selection.tsx` — The navigation after sign-up currently always goes here. Tutor path bypasses this screen.
- `src/features/ui/theme.ts` — Single source of truth for COLORS, RADII, SPACING. All new components MUST import from here.
- `src/features/auth/useAuthStore.ts` — Auth session state. The `session.user.id` pattern is used for Supabase writes.
- `src/app/(tabs)/profile.tsx` — MODIFY to show conditional tutor content ("My Classroom" card) based on tutor status.

### Phase 1 Context (locked visual and auth decisions)
- `.planning/phases/01-foundation/01-CONTEXT.md` — D-10 to D-14 (visual identity), D-15 to D-17 (nav shell), D-18 to D-20 (auth/session)

### Project Stack Reference
- `CLAUDE.md` §Technology Stack — Expo SDK, Supabase React Native patterns, Expo Router file-based routing

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `theme.ts` — all design tokens ready. No new tokens needed for Phase 3 UI.
- `goal-selection.tsx` — tap card pattern (card with label + description, single tap to advance). The classroom creation form can use this same card style for any selection states.
- `sign-up.tsx` — existing form pattern (TextInput + TouchableOpacity button + error text). Extend this pattern for classroom creation form fields.
- `useAuthStore` — `session.user.id` available for Supabase writes after sign-up.

### Established Patterns
- Screen files in `src/app/` are thin route wrappers — business logic and state live in `src/features/`.
- Feature grouping: `src/features/{feature}/` contains the Zustand store, query hooks, and feature components.
- Supabase typed with `Database` type — use `src/types/database.ts` for all table types.
- RLS: policies use `auth.uid()` subquery pattern — new tutor/classroom tables need policies.
- `handle_new_user()` SECURITY DEFINER trigger auto-creates profile on auth.users INSERT — tutor flag can be set on the profile row.

### Integration Points
- `src/app/(auth)/sign-up.tsx` — add `isTutor` boolean state + toggle UI; route to create-classroom if tutor, goal-selection otherwise.
- New screen: `src/app/(auth)/create-classroom.tsx` (or similar) — classroom creation form, navigates to `/(tabs)` on success.
- New screen: `src/app/(tabs)/classroom-settings.tsx` (or accessible from profile) — edit classroom details.
- `src/app/(tabs)/profile.tsx` — conditionally render "My Classroom" card for tutors.
- New Supabase tables needed: `tutors` (or `is_tutor` flag on `profiles`), `classrooms` — with RLS policies. Schema migration required.
- `src/types/database.ts` — add tutor and classroom table types.

</code_context>

<specifics>
## Specific Ideas

- No specific references — open to standard approaches for form and navigation patterns.
- The "I want to teach" toggle on sign-up should feel like a gentle option, not a separate product. Same screen, minimal visual weight, below the core fields.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 3 scope. Classroom sections and material cards are Phase 4.

</deferred>

---

*Phase: 03-tutor-onboarding*
*Context gathered: 2026-04-06*
