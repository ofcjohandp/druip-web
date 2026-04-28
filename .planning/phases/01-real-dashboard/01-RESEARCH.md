# Phase 1: real-dashboard — Research

**Researched:** 2026-04-09
**Domain:** Next.js 14 Server Components + Supabase SSR data fetching
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Repurpose large bento card as "Continue Learning spotlight" — query the student's most recently accessed subscribed classroom, show it with a "Go to Classroom" button
- **D-02:** If the student has no subscriptions, hide this card entirely (no empty state for it — just omit)
- **D-03:** "Tutors of the Week" queries the `tutors` table ordered by `created_at DESC`, limit 4
- **D-04:** If no tutors exist in DB, show the Stitch empty state from `empty_state_no_students/code.html`
- **D-05:** Streak subtext wired to real `profiles.streak_count` — "Start your streak today!" for 0, "You're on a {N}-day streak. Keep going!" for > 0
- **D-06:** Streak bento stat card shows real `profiles.streak_count` (replaces hardcoded `12`)
- **D-07:** Continue Learning section queries `subscriptions` joined with `classrooms` for the current user
- **D-08:** No subscriptions → show the Stitch empty state from `empty_state_no_subscriptions/code.html`
- **D-09:** All empty states MUST match the Stitch screen designs exactly — icon, heading text, and CTA button from the corresponding Stitch HTML file

### Claude's Discretion

- Data fetching approach: keep as async Server Component, add parallel queries with `Promise.all` for performance
- Loading/suspense boundaries: add Suspense wrappers where appropriate
- TypeScript types: use Supabase generated types from `src/types/database.ts` if it exists, otherwise inline
- Error handling: if a query fails, show the empty state rather than crashing

### Deferred Ideas (OUT OF SCOPE)

- Real live sessions / "Join Room" functionality — requires a sessions concept in the DB
- Progress tracking within classrooms (the progress % shown in Continue Learning cards) — Phase 5
- "View All" buttons routing — Phase 4 (student-discovery) will build the browse page
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DASH-01 | Home dashboard shows real subscribed classrooms (empty state if none) | `subscriptions` table confirmed with FK to `classrooms`; RLS policy exists for student reads |
| DASH-02 | Home dashboard shows real streak count from user profile | `profiles.streak_count` column confirmed — integer, default 0 |
| DASH-03 | Home dashboard shows real tutors from DB (empty state if none) | `tutors` table confirmed; RLS allows all authenticated users to read all tutor rows |
| DASH-04 | Dashboard greeting uses real user name from auth | Already implemented — `user.user_metadata?.full_name?.split(" ")[0]`; no change needed |
</phase_requirements>

---

## Summary

Phase 1 is a pure data-wiring phase. The dashboard page (`druip-web/src/app/(dashboard)/home/page.tsx`) already works as an async Server Component with auth and the `createClient()` pattern. The only job is replacing three hardcoded datasets — streak count, subscribed classrooms, and tutors — with real Supabase queries, and rendering proper empty states when the DB returns nothing.

All three target tables (`profiles`, `subscriptions`, `classrooms`, `tutors`) exist in the database with correct RLS policies. The `subscriptions` table uses `student_id` (not `user_id`) as the FK to `profiles.id`. The `subscriptions` table has no `updated_at` column — only `subscribed_at` — so the "most recently accessed" spotlight card must order by `subscribed_at DESC` instead. The tutors table has a confirmed public-read policy (migration 00011) that allows any authenticated user to read all tutor rows.

No new packages are required. No schema changes are needed. The Stitch empty state designs are confirmed and the exact copy/tokens are locked in `01-UI-SPEC.md`.

**Primary recommendation:** Wire all three queries in `Promise.all` inside the existing Server Component, then conditionally render the spotlight card, Continue Learning cards (or empty state), and Tutors grid (or empty state) from the query results.

---

## Standard Stack

### Core (already installed — no installs needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/ssr` | installed | Server-side Supabase client for Next.js App Router | Used in `src/lib/supabase/server.ts` already |
| `@supabase/supabase-js` | installed | Supabase query builder | Core client |
| `next` | installed | App Router, Server Components, async data fetching | Project stack |
| `tailwindcss` | installed | Stitch design tokens | All UI tokens already in `tailwind.config.ts` |

No additional packages required for this phase.

---

## Architecture Patterns

### Existing Project Structure

```
druip-web/src/
├── app/
│   ├── (auth)/           # sign-in, sign-up routes
│   ├── (dashboard)/
│   │   └── home/
│   │       └── page.tsx  # TARGET — this is the only file being changed
│   ├── globals.css       # kinetic-gradient, frosted-glass, no-scrollbar defined here
│   └── layout.tsx
└── lib/
    └── supabase/
        ├── server.ts     # createClient() for Server Components
        └── client.ts     # client-side client (not used in this phase)
```

### Pattern 1: Parallel Supabase queries in a Server Component

The dashboard is an `async` Server Component. All queries run in `Promise.all` before the component returns JSX. This is the correct pattern for this codebase — no TanStack Query, no client-side fetching for this phase.

```typescript
// Source: CONTEXT.md + confirmed by reading page.tsx
const [profileResult, subscriptionsResult, tutorsResult] = await Promise.all([
  supabase
    .from("profiles")
    .select("streak_count")
    .eq("id", user.id)
    .single(),
  supabase
    .from("subscriptions")
    .select("*, classrooms(*)")
    .eq("student_id", user.id)          // IMPORTANT: column is student_id, not user_id
    .order("subscribed_at", { ascending: false }),  // IMPORTANT: no updated_at column on subscriptions
  supabase
    .from("tutors")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(4),
]);
```

### Pattern 2: Error → empty state (no crash)

Per D-09 and the interaction contract: if a query returns an error, treat its result as an empty array / null and render the empty state. Never surface a raw error to the user.

```typescript
const streakCount = profileResult.error ? 0 : (profileResult.data?.streak_count ?? 0);
const subscriptions = subscriptionsResult.error ? [] : (subscriptionsResult.data ?? []);
const tutors = tutorsResult.error ? [] : (tutorsResult.data ?? []);
```

### Pattern 3: Conditional render for spotlight card (D-02)

The spotlight card is omitted entirely when subscriptions is empty — it does not get an empty state. Only the bento grid layout changes.

```typescript
// When subscriptions.length > 0: render md:grid-cols-3 bento with spotlight + streak
// When subscriptions.length === 0: render just the streak card (single column or full-width)
```

### Anti-Patterns to Avoid

- **Querying `subscriptions.eq("user_id", ...)` — wrong column:** The FK column is `student_id`, not `user_id`. Using `user_id` returns an empty array with no error (silent RLS-style fail).
- **Ordering subscriptions by `updated_at` — column does not exist:** Use `subscribed_at` instead.
- **Rendering a loading skeleton indefinitely:** Suspense boundaries should have fallback skeletons at the same dimensions as live content, but the Server Component renders synchronously — skeletons only appear during streaming if Suspense is added.
- **Importing `src/types/database.ts`:** This file does not exist yet. Inline types or use `typeof subscriptionsResult.data[number]` patterns.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Supabase FK join | Manual two-query join | `.select("*, classrooms(*)")` PostgREST syntax | PostgREST resolves FK relationships automatically; `subscriptions → classrooms` FK confirmed in migration 00007 |
| Tutor name display | Separate profile query | `.select("*, profiles(full_name, email)")` | `tutors.user_id` FK to `profiles.id` confirmed in migration 00008; PostgREST resolves it |
| Auth check | Custom token validation | `supabase.auth.getUser()` + `if (!user) redirect("/sign-in")` | Already in page.tsx; same pattern works for all new queries in the same request |

---

## Confirmed Schema (from migrations — HIGH confidence)

### `profiles` table (migration 00002 + 00018)

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | UUID PK | — | References `auth.users(id)` |
| `email` | TEXT | — | |
| `streak_count` | INTEGER | 0 | Confirmed present, default 0 |
| `full_name` | TEXT | NULL | Added in migration 00018 |
| `is_tutor` | BOOLEAN | false | Added in migration 00005 |

**RLS for profiles:** User reads own row (`id = auth.uid()`). Additional policy (migration 00009) allows authenticated users to read profiles of tutors (where `id IN (SELECT user_id FROM tutors)`).

### `subscriptions` table (migration 00007)

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | UUID PK | gen_random_uuid() | |
| `student_id` | UUID | — | FK to `profiles(id)` — NOT `user_id` |
| `classroom_id` | UUID | — | FK to `classrooms(id)` |
| `subscribed_at` | TIMESTAMPTZ | now() | Use this for ordering — no `updated_at` column |
| `status` | TEXT | 'active' | CHECK ('active' or 'cancelled') |

**RLS:** `student_id = auth.uid()` for student reads.

**Critical gotcha:** The column is `student_id`, not `user_id`. The UI-SPEC query suggestion used `user_id` — this is INCORRECT. Use `student_id`.

**Critical gotcha:** No `updated_at` column. The UI-SPEC ordering suggestion used `updated_at` — use `subscribed_at` instead.

### `classrooms` table (migration 00005)

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `tutor_id` | UUID | FK to `tutors(id)` |
| `name` | TEXT | Classroom name for display |
| `subjects` | TEXT[] | Legacy; canonical tags now in `classroom_subject_tags` |
| `bio` | TEXT | Description |
| `price_cents` | INTEGER | Default 18000 (R180) |
| `is_published` | BOOLEAN | Default true |

**RLS for subscriptions → classrooms join:** Authenticated users can read published classrooms (migration 00007). This policy covers the student querying their subscribed classrooms.

### `tutors` table (migration 00005 + 00011)

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID | FK to `auth.users(id)` AND FK to `profiles(id)` (migration 00008) |
| `created_at` | TIMESTAMPTZ | Default now() — use for ordering |
| `updated_at` | TIMESTAMPTZ | |

**RLS:** Migration 00011 replaced recursive policy with `USING (true)` — any authenticated user can read all tutor rows. This is intentional.

**Joining tutors to profiles:** Use `.select("*, profiles(full_name, email)")` — FK `tutors.user_id → profiles.id` exists (migration 00008).

---

## Common Pitfalls

### Pitfall 1: Wrong subscriptions filter column

**What goes wrong:** Query returns empty array with no error. Dashboard looks like new user.
**Why it happens:** Column is `student_id` not `user_id`. Supabase RLS doesn't error on wrong filter column — it just returns zero rows.
**How to avoid:** Use `.eq("student_id", user.id)` — confirmed from migration 00007.
**Warning signs:** Subscriptions query returns `[]` even for a seeded test user.

### Pitfall 2: Wrong subscriptions ordering column

**What goes wrong:** TypeScript error at build time, or runtime PostgREST 400 error.
**Why it happens:** `subscriptions` has no `updated_at` column — only `subscribed_at`. The UI-SPEC data contract mentioned `updated_at`.
**How to avoid:** Use `.order("subscribed_at", { ascending: false })`.
**Warning signs:** Supabase query returns error `{ code: "PGRST116" }` or similar column-not-found error.

### Pitfall 3: Missing TypeScript types file

**What goes wrong:** Importing from `@/types/database` or `@/types/supabase` causes a module-not-found build error.
**Why it happens:** The CONTEXT.md mentions `src/types/database.ts` as a reference, but this file does not yet exist in the codebase (`src/` only has `app/` and `lib/`).
**How to avoid:** Either inline types or generate the file first with `npx supabase gen types typescript --project-id vpmrgidheamgerimkaox > druip-web/src/types/database.ts`. Generating is the correct long-term fix; inlining is acceptable for Phase 1 speed.
**Warning signs:** TypeScript error at compile time about missing module.

### Pitfall 4: Spotlight card layout breaks when hidden

**What goes wrong:** The bento grid (`grid-cols-1 md:grid-cols-3`) has a `md:col-span-2` spotlight card. Removing it leaves a visual gap or a single streak card awkwardly placed.
**Why it happens:** CSS Grid does not auto-reflow when a spanning cell is removed.
**How to avoid:** When no subscriptions, switch the grid to a simpler single-cell layout or render the streak card at full width. Do not conditionally hide the `md:col-span-2` element inside a `grid-cols-3` grid.

### Pitfall 5: Tutor display name — `full_name` may be null

**What goes wrong:** Tutor card renders blank name or crashes on `.split(" ")`.
**Why it happens:** `profiles.full_name` was added in migration 00018 (`ADD COLUMN IF NOT EXISTS full_name TEXT`) — existing rows default to NULL.
**How to avoid:** Fall back to `profiles.email` or "Unnamed Tutor" when `full_name` is null.

### Pitfall 6: RLS on profiles blocks streak query for some users

**What goes wrong:** Streak query returns `{ data: null, error: { code: "PGRST116" } }` for a brand-new user.
**Why it happens:** The `handle_new_user` trigger auto-creates a `profiles` row on sign-up, but if the trigger failed (e.g., old accounts created before the trigger existed), the profile row may not exist.
**How to avoid:** Use `.maybeSingle()` instead of `.single()` for the profiles query, and default streak to 0 when data is null.

---

## Code Examples

### Full parallel query block (verified against schema)

```typescript
// Source: Confirmed from migrations 00002, 00005, 00007, 00008
const [profileResult, subscriptionsResult, tutorsResult] = await Promise.all([
  supabase
    .from("profiles")
    .select("streak_count")
    .eq("id", user.id)
    .maybeSingle(),                                     // maybeSingle — profile may not exist for old accounts

  supabase
    .from("subscriptions")
    .select(`
      id,
      subscribed_at,
      classrooms (
        id,
        name,
        bio,
        tutor_id
      )
    `)
    .eq("student_id", user.id)                         // student_id, not user_id
    .eq("status", "active")                            // only active subscriptions
    .order("subscribed_at", { ascending: false }),     // subscribed_at, not updated_at

  supabase
    .from("tutors")
    .select(`
      id,
      created_at,
      profiles (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })
    .limit(4),
]);

const streakCount = profileResult.data?.streak_count ?? 0;
const subscriptions = subscriptionsResult.data ?? [];
const spotlightClassroom = subscriptions[0]?.classrooms ?? null;
const tutors = tutorsResult.data ?? [];
```

### Streak subtext conditional

```typescript
// Source: D-05 (locked decision)
const streakSubtext = streakCount === 0
  ? "Start your streak today!"
  : `You're on a ${streakCount}-day streak. Keep going!`;
```

### Bento grid layout conditional

```typescript
// When spotlightClassroom is null, render streak card full-width (no grid)
// When spotlightClassroom exists, render md:grid-cols-3 with col-span-2 spotlight
{spotlightClassroom ? (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    {/* Spotlight card: md:col-span-2 */}
    {/* Streak card */}
  </div>
) : (
  <div className="mb-12">
    {/* Streak card only, full width or constrained */}
  </div>
)}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Hardcoded mock arrays in JSX | Parallel Supabase queries in `Promise.all` | All data is live; empty states show for new users |
| Fake streak `12` | `profiles.streak_count` from DB | New user sees `0` correctly |
| "Upcoming Session" bento card | "Continue Learning" spotlight card | No sessions concept in DB; spotlight shows subscribed classroom |

---

## Open Questions

1. **Does `tutors.profiles(full_name)` join work without supabase-generated types?**
   - What we know: The FK relationship exists in migration 00008 (`tutors_user_id_profiles_fkey`). PostgREST resolves FKs automatically.
   - What's unclear: The FK goes `tutors.user_id → profiles.id`. The implicit join syntax `profiles(full_name)` in the select should work.
   - Recommendation: Test early. If PostgREST returns PGRST200 (no relationship), use an explicit join hint: `.select("*, profiles!tutors_user_id_profiles_fkey(full_name, email)")`.

2. **Should the `src/types/database.ts` file be generated in Wave 0 or Wave 1?**
   - What we know: File does not exist. Planner can either inline types or generate them.
   - What's unclear: Generating requires the Supabase CLI and the project ID to be accessible from the dev machine.
   - Recommendation: Generate in Wave 0 task ("Generate Supabase types"). It eliminates a whole class of runtime type errors for all future phases.

---

## Environment Availability

| Dependency | Required By | Available | Notes |
|------------|-------------|-----------|-------|
| Supabase project | All queries | Live | Project ID: `vpmrgidheamgerimkaox`, URL: `https://vpmrgidheamgerimkaox.supabase.co` |
| Next.js dev server | Local dev/test | Available | Part of project |
| Supabase CLI (optional) | Type generation | Unknown — not verified | Only needed for `supabase gen types`; not blocking if types are inlined |

No missing dependencies that block execution.

---

## Validation Architecture

No automated test framework was detected in `druip-web/` (`package.json` has no test script, no jest/vitest config, no test directories). The project has no Nyquist validation infrastructure at this time.

Validation for this phase is manual:

| Req ID | Behavior | Test Method |
|--------|----------|-------------|
| DASH-01 | Subscribed classrooms appear / empty state shown | Sign in as user with subscription; verify card appears. Sign in as new user; verify empty state. |
| DASH-02 | Streak count shows real DB value | Confirm `profiles.streak_count` is 0 for new user; update via Supabase dashboard and refresh. |
| DASH-03 | Tutors grid shows real tutors / empty state | Confirm tutors table has rows; verify grid renders. Delete all rows; verify empty state. |
| DASH-04 | Greeting uses real name | Confirm first name from `user.user_metadata.full_name` is displayed (already implemented). |

**Phase gate:** Manually verify all four success criteria from the roadmap before marking Phase 1 complete.

---

## Sources

### Primary (HIGH confidence)
- `/Users/johanduplessis/Desktop/Claude Code/Druip/supabase/migrations/` — All table schemas verified from source SQL
- `druip-web/src/app/(dashboard)/home/page.tsx` — Current implementation read directly
- `druip-web/src/lib/supabase/server.ts` — `createClient()` pattern confirmed
- `druip-web/tailwind.config.ts` — All design tokens confirmed
- `druip-web/src/app/globals.css` — `kinetic-gradient`, `frosted-glass`, `no-scrollbar` utilities confirmed
- `.planning/phases/01-real-dashboard/01-CONTEXT.md` — Locked decisions
- `.planning/phases/01-real-dashboard/01-UI-SPEC.md` — Component specs and empty state copy

### Secondary (MEDIUM confidence)
- `stitch_druip_tutor_app_redesign/empty_state_no_subscriptions/code.html` — Empty state copy and icon confirmed
- `stitch_druip_tutor_app_redesign/empty_state_no_students/code.html` — Tutor-side Stitch screen; no-tutors empty state adapted per UI-SPEC

---

## Metadata

**Confidence breakdown:**
- Schema facts (column names, FK direction): HIGH — read directly from migration SQL
- Query syntax: HIGH — standard PostgREST/supabase-js patterns
- RLS behaviour: HIGH — read directly from migration SQL
- Pitfalls: HIGH — derived from confirmed schema facts, not assumptions

**Research date:** 2026-04-09
**Valid until:** Stable until schema migrations are added (any new migration could affect this)
