# Phase 5: Student Discovery and Subscriptions - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

A student can find a tutor's classroom, see what is inside it, and subscribe (UI placeholder — no real payment in v1.0) to unlock full access. Students can also view all their subscribed classrooms in one place.

Entry point: Home tab (currently a placeholder). Exit point: student has subscribed to a classroom and can access it from the Home tab.

No real payment processing — subscribe button is a UI placeholder only. No DMs — that is Phase 6. This phase is student-facing discovery and subscription flow only.

</domain>

<decisions>
## Implementation Decisions

### Navigation — Where Discovery Lives
- **D-01:** The Home tab becomes the primary discovery screen. Students see all available classrooms immediately on opening the app. Simple and direct — no extra navigation layer.
- **D-02:** Subscribed classrooms appear at the top of the Home tab, prominently highlighted (e.g. "Your Classrooms" section above the browse list). Discovery and access live in one place — no separate tab for subscriptions.
- **D-03:** The current `src/app/(tabs)/index.tsx` (placeholder "Your dashboard will appear here") is replaced with the full discovery/home screen.

### Discovery Screen Layout
- **D-04:** Classroom cards are displayed as a vertical list (not a grid). Each card shows: tutor name, classroom name, subject tags, price, and a short bio excerpt. List is scrollable.
- **D-05:** A "Your Classrooms" section appears at the top when the student has active subscriptions — highlighted/distinct from the browse list below it.

### Classroom Detail Page
- **D-06:** Classroom detail shows: tutor name, classroom name, subjects, bio, price, and a preview of section names (section titles only — no card content visible to non-subscribers).
- **D-07:** Non-subscriber sees section names with a lock icon overlay. Card content within sections is hidden (not previewed). Visual indicator makes it clear that subscribing unlocks the content.
- **D-08:** Subscribe CTA button shows the price: "Subscribe · R180/month". Tapping it navigates to the subscribe confirmation screen.

### Subscribe Confirmation
- **D-09:** Subscribe confirmation is a dedicated screen (not a modal). It shows: classroom name, tutor name, price, and a clear "Subscribe" confirm button + "Maybe later" cancel/back option.
- **D-10:** On confirm, the subscription is recorded in Supabase (UI placeholder — no payment gateway). Student is navigated back to the classroom detail, which now shows full unlocked content.
- **D-11:** The confirmation screen copy should feel calm and low-pressure, consistent with the Druip brand — not pushy upsell copy.

### Supabase Schema
- **D-12:** New table `subscriptions`: `id`, `student_id` (FK → profiles.id), `classroom_id` (FK → classrooms.id), `subscribed_at`, `status` (default `active`). RLS: student can read/create their own subscriptions; tutors can read subscriptions to their classroom.
- **D-13:** `classrooms` table is already queryable — add a public SELECT policy so non-authenticated or non-tutor users can browse all classrooms (required for discovery).

### Data Fetching Pattern
- **D-14:** `useAllClassrooms` hook — fetches all classrooms with tutor name, subjects, price for the discovery list. Query key: `['classrooms']`.
- **D-15:** `useClassroomDetail` hook — fetches a single classroom with full details + section names (no cards). Query key: `['classroom-detail', classroomId]`.
- **D-16:** `useMySubscriptions` hook — fetches the current student's subscriptions. Query key: `['subscriptions', userId]`.
- **D-17:** `useSubscribe` mutation — inserts a new subscription row and invalidates both subscriptions and classroom-detail queries.
- **D-18:** Student's subscription status is checked client-side: if `subscriptions` contains a row matching `classroomId` + `student_id`, they are a subscriber. No server-side gate for v1.0.

### Claude's Discretion
- Exact classroom card visual design (spacing, shadow, border radius — follow existing theme tokens)
- Empty state for discovery screen when no classrooms exist
- Loading and error states for all hooks
- Lock icon style and locked-content overlay design
- Section header styling on the detail page
- Navigation back from detail/confirmation screens

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/REQUIREMENTS.md` §Student Discovery — DISC-01, DISC-02, DISC-03, DISC-04
- `.planning/REQUIREMENTS.md` §Subscriptions — SUB-01, SUB-02, SUB-03
- `.planning/ROADMAP.md` §Phase 5 — Phase goal, success criteria, dependency on Phase 4

### Codebase Files to Read Before Implementing
- `src/app/(tabs)/index.tsx` — REPLACE with discovery/home screen
- `src/app/(tabs)/_layout.tsx` — Read to understand tab navigator setup; do NOT modify tab structure
- `src/features/tutor/useClassroom.ts` — Reference for TanStack Query + Supabase pattern (single classroom)
- `src/features/classroom/useClassroomSections.ts` — Reference for section query pattern
- `src/features/ui/theme.ts` — All new components MUST use these tokens (no hardcoded values)
- `src/types/database.ts` — ADD subscriptions type here; classrooms type already exists
- `src/lib/supabase.ts` — Single Supabase client import point

### Prior Phase Context
- `.planning/phases/04-classroom-builder/04-CONTEXT.md` — D-15 to D-19 (Supabase schema and query patterns for classrooms, sections, cards)
- `.planning/phases/03-tutor-onboarding/03-CONTEXT.md` — D-11 to D-12 (tutor vs student conditional rendering in Profile tab)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/features/ui/theme.ts` — COLORS, SPACING, RADII tokens; all new UI must use these
- `src/features/ui/Button.tsx` — Standard button component; use for Subscribe CTA
- `src/features/ui/Card.tsx` — May be reusable for classroom cards in the discovery list
- `src/features/tutor/useClassroom.ts` — Pattern for classroom queries; `useAllClassrooms` should follow same structure

### Established Patterns
- TanStack Query for all server data: `useQuery` with `queryKey` + `queryFn`, `useMutation` for writes
- Supabase client from `src/lib/supabase.ts` — never create a new client
- Auth state from `useAuthStore` (Zustand) — `session.user.id` for current user
- TypeScript types from `src/types/database.ts` — add `subscriptions` table types here

### Integration Points
- `src/app/(tabs)/index.tsx` — Replace this file entirely with the new Home/Discovery screen
- `src/types/database.ts` — Add `Subscription` row/insert types
- Supabase `classrooms` table — needs a public SELECT RLS policy for anonymous browse
- Supabase `subscriptions` table — new table required (migration)

</code_context>

<specifics>
## Specific Ideas

- Subscribe confirmation copy should feel calm, not pushy — consistent with "student opens Druip and feels calmer, clearer, more in control"
- "Your Classrooms" section at top of Home tab when subscribed — student always lands on their classroom
- Price displayed as "Subscribe · R180/month" on CTA — clear and direct

</specifics>

<deferred>
## Deferred Ideas

- Real payment processing — v1.1 (Stripe or PayFast integration)
- Subscription cancellation flow — v1.1 (after real payments exist)
- Search/filter on discovery screen — future phase
- Classroom ratings/reviews — future phase

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-student-discovery-and-subscriptions*
*Context gathered: 2026-04-06*
