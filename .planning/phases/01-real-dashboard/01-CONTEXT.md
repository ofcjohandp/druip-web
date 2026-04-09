# Phase 1: real-dashboard - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace all placeholder/hardcoded data on the home dashboard (`druip-web/src/app/(dashboard)/home/page.tsx`) with real Supabase queries and proper empty states. No new DB tables or schema changes — all queries target existing tables (profiles, classrooms, subscriptions, tutors/users with tutor role).

The first name in the greeting already reads from auth — no change needed there.

</domain>

<decisions>
## Implementation Decisions

### Upcoming Session Card (the large bento card)
- **D-01:** Repurpose as "Continue Learning spotlight" — query the student's most recently accessed subscribed classroom, show it in the card with a "Go to Classroom" button
- **D-02:** If the student has no subscriptions, hide this card entirely (no empty state for this specific card — just omit it)

### Tutors of the Week
- **D-03:** Query the `tutors` table (or users with tutor role) ordered by `created_at DESC`, limit 4 — newest tutors surface automatically as new tutors join
- **D-04:** If no tutors exist in DB, show the Stitch empty state design from `empty_state_no_students/code.html` — icon, heading, and CTA routing to browse

### Hero Streak Subtext
- **D-05:** Wire the subtext to real `profiles.streak_count`:
  - streak = 0: "Start your streak today!"
  - streak > 0: "You're on a {N}-day streak. Keep going!"
- **D-06:** The streak number in the bento stat card also replaces hardcoded `12` with real `profiles.streak_count`

### Continue Learning Section
- **D-07:** Query `subscriptions` joined with `classrooms` for the current user, show subscribed classrooms with a progress indicator
- **D-08:** If no subscriptions: show the Stitch empty state from `empty_state_no_subscriptions/code.html` — icon, heading, and CTA routing to browse classrooms

### Empty States General Rule
- **D-09:** All empty states MUST match the Stitch screen designs exactly — use the icon, heading text, and CTA button from the corresponding Stitch HTML file. No custom copy or simplified text.

### Claude's Discretion
- Data fetching approach: keep as async Server Component, add parallel queries with `Promise.all` for performance
- Loading/suspense boundaries: add Suspense wrappers where appropriate
- TypeScript types: use Supabase generated types from `src/types/database.ts` if it exists, otherwise inline
- Error handling: if a query fails, show the empty state rather than crashing

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Dashboard (current implementation)
- `druip-web/src/app/(dashboard)/home/page.tsx` — Current dashboard page; all hardcoded data is here

### Supabase client
- `druip-web/src/lib/supabase/server.ts` — Server-side Supabase client (already used in dashboard)
- `druip-web/src/lib/supabase/client.ts` — Client-side Supabase client

### Stitch design screens
- `stitch_druip_tutor_app_redesign/home_dashboard/code.html` — Home dashboard design (pixel-perfect reference)
- `stitch_druip_tutor_app_redesign/empty_state_no_subscriptions/code.html` — Empty state for no subscriptions
- `stitch_druip_tutor_app_redesign/empty_state_no_students/code.html` — Empty state for no tutors

### Requirements
- `.planning/REQUIREMENTS.md` — DASH-01 through DASH-04 are the requirements for this phase

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `druip-web/src/lib/supabase/server.ts` — `createClient()` already used in dashboard page; same pattern for all new queries
- Auth redirect pattern: `if (!user) redirect("/sign-in")` already in place

### Established Patterns
- Dashboard is a Server Component (`async function HomeDashboard`) — keep it server-side, add parallel Supabase queries
- Tailwind classes are Stitch-sourced design tokens (e.g. `bg-secondary-container`, `text-primary`) — use these exact tokens in empty states
- First name already extracted from `user.user_metadata?.full_name?.split(" ")[0] ?? "Scholar"` — do not change this

### Integration Points
- The `profiles` table must have a `streak_count` column (from RN app schema) — planner should verify this exists before querying
- The `subscriptions` table needs a join to `classrooms` — check schema for FK relationship
- "Tutors" may be stored as users with a role flag or in a dedicated `tutors` table — planner must read the Supabase schema to determine the correct query

</code_context>

<specifics>
## Specific Ideas

- The bento session card transforms into a "spotlight" for the most recent classroom — same visual treatment, different data and button label ("Go to Classroom" not "Join Room")
- Stitch empty states are the source of truth for empty UI — do not deviate from them

</specifics>

<deferred>
## Deferred Ideas

- Real live sessions / "Join Room" functionality — requires a sessions concept in the DB, out of scope for v2.0
- Progress tracking within classrooms (the progress % shown in Continue Learning cards) — Phase 5 concern, use 0% or omit for now
- "View All" buttons routing — Phase 4 (student-discovery) will build the browse page; for now these buttons can be disabled or hidden

</deferred>

---

*Phase: 01-real-dashboard*
*Context gathered: 2026-04-09*
