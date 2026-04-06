# Phase 5: Student Discovery and Subscriptions - Research

**Researched:** 2026-04-06
**Domain:** React Native / Expo Router — student-facing discovery, detail, and subscription UI; Supabase schema extension
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Home tab is the primary discovery screen. Students see all classrooms immediately on open.
- **D-02:** Subscribed classrooms appear at the TOP of Home tab ("Your Classrooms" section), above the browse list. No separate tab.
- **D-03:** `src/app/(tabs)/index.tsx` (placeholder) is REPLACED with the full discovery/home screen.
- **D-04:** Classroom cards are a vertical list (not grid). Each card shows: tutor name, classroom name, subject tags, price, short bio excerpt.
- **D-05:** "Your Classrooms" section is highlighted/distinct from the browse list below it.
- **D-06:** Detail page shows: tutor name, classroom name, subjects, bio, price, section names only (no card content to non-subscribers).
- **D-07:** Non-subscriber sees section names with a lock icon overlay. Card content hidden. Visual indicator makes it clear subscribing unlocks content.
- **D-08:** Subscribe CTA shows "Subscribe · R180/month". Taps navigate to subscribe confirmation screen.
- **D-09:** Subscribe confirmation is a dedicated SCREEN (not modal). Shows: classroom name, tutor name, price. Has "Subscribe" confirm + "Maybe later" cancel.
- **D-10:** On confirm, subscription recorded in Supabase (no payment gateway). Student navigated back to classroom detail, which now shows full content.
- **D-11:** Confirmation screen copy is calm and low-pressure — consistent with Druip brand.
- **D-12:** New `subscriptions` table: `id`, `student_id` (FK → profiles.id), `classroom_id` (FK → classrooms.id), `subscribed_at`, `status` (default `active`). RLS: student reads/creates own; tutors read subscriptions to their classroom.
- **D-13:** `classrooms` table needs a public SELECT policy so any authenticated user can browse all classrooms.
- **D-14:** `useAllClassrooms` hook — query key `['classrooms']`.
- **D-15:** `useClassroomDetail` hook — query key `['classroom-detail', classroomId]`.
- **D-16:** `useMySubscriptions` hook — query key `['subscriptions', userId]`.
- **D-17:** `useSubscribe` mutation — inserts subscription, invalidates both `['subscriptions', userId]` and `['classroom-detail', classroomId]`.
- **D-18:** Subscription status checked client-side: `subscriptions` array contains matching row. No server-side gate for v1.0.

### Claude's Discretion

- Exact classroom card visual design (spacing, shadow, border radius — follow existing theme tokens)
- Empty state for discovery screen when no classrooms exist
- Loading and error states for all hooks
- Lock icon style and locked-content overlay design
- Section header styling on the detail page
- Navigation back from detail/confirmation screens

### Deferred Ideas (OUT OF SCOPE)

- Real payment processing (Stripe / PayFast) — v1.1
- Subscription cancellation flow — v1.1
- Search/filter on discovery screen — future phase
- Classroom ratings/reviews — future phase
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DISC-01 | Student can browse all available tutor classrooms on a discovery screen | `useAllClassrooms` hook + new public SELECT RLS on `classrooms`; replaces index.tsx |
| DISC-02 | Student can view a classroom detail page (tutor name, subjects, bio, price, section preview) | `useClassroomDetail` hook joining `classrooms` + `classroom_sections`; new detail route |
| DISC-03 | Non-subscriber sees a locked preview of classroom content with subscribe CTA | Client-side subscription check (D-18); lock icon + locked-content overlay component |
| DISC-04 | Subscribe button displays the monthly price (e.g. "Subscribe · R180/month") | `price_cents` field already exists; format as `R${price_cents / 100}/month` |
| SUB-01 | Student can tap subscribe and see a confirmation screen (UI placeholder — no real payment in v1.0) | New dedicated screen at `subscribe-confirm`; Expo Router stack push |
| SUB-02 | Subscribed student gets full access to all sections and cards in the classroom | `useClassroomDetail` fetches sections + cards; conditional rendering based on subscription status |
| SUB-03 | Student can view a list of all their subscribed classrooms | "Your Classrooms" section at top of home screen; `useMySubscriptions` drives it |
</phase_requirements>

---

## Summary

Phase 5 is a student-facing UI phase built on an already-complete tutor side. The codebase is in good shape: TanStack Query + Supabase patterns are established, theme tokens are locked, and the component library (Button, Card) is reusable. The primary work is: (1) a Supabase migration for the `subscriptions` table and a public SELECT policy on `classrooms`, (2) three new TanStack Query hooks, (3) three new screens (Home/Discovery, Classroom Detail, Subscribe Confirm), and (4) two new feature components (ClassroomCard, LockedContentOverlay).

The most important architectural decision confirmed by codebase inspection: the existing `classrooms` table only has a tutor-scoped SELECT policy ("tutor can read own classroom"). A new migration must add a policy allowing any authenticated user to SELECT all classrooms — otherwise DISC-01 fails at the RLS layer silently (returns empty array, not an error). This is the single most common pitfall for this phase.

The Expo Router navigation pattern for the detail and confirmation screens uses the tabs-nested stack approach — new screens registered in `_layout.tsx` with `href: null` to hide them from the tab bar, then navigated to via `router.push('/(tabs)/classroom-detail?id=X')`. This is the same pattern already used for `manage-classroom` and `classroom-settings`.

**Primary recommendation:** Write the migration first, verify the RLS policy with a direct Supabase query, then build UI on confirmed data access.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tanstack/react-query` | v5 (already installed) | `useAllClassrooms`, `useClassroomDetail`, `useMySubscriptions`, `useSubscribe` | Established project pattern — all server data goes through TanStack Query |
| `zustand` | already installed | Read `session.user.id` from `useAuthStore` | Established pattern for auth state |
| `expo-router` | already installed | New screens + stack navigation | Project navigation standard |
| `supabase-js` | v2.49.9+ (already installed) | Supabase queries and mutation | Single client from `src/lib/supabase.ts` |
| `@expo/vector-icons` (Ionicons) | already installed | Lock icon, chevron, back button | Used throughout existing screens |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-native` core primitives | SDK 54 | ScrollView, FlatList, SafeAreaView, TouchableOpacity | All new screens |
| `src/features/ui/Button` | project | Subscribe CTA, "Maybe later" cancel | Use for all primary and ghost CTAs |
| `src/features/ui/Card` | project | Classroom cards in discovery list | Wraps each classroom in the browse list |
| `src/features/ui/theme` | project | COLORS, SPACING, RADII tokens | All new components — no hardcoded values |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Stack screens inside tabs | Separate modal stack | Modal stack adds complexity; existing codebase uses `href: null` screens in tabs — stay consistent |
| FlatList for discovery | ScrollView with .map() | FlatList is better for long lists; for MVP classroom count (likely 1-10), ScrollView is fine — matches existing patterns |

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   └── (tabs)/
│       ├── index.tsx                    # REPLACED — new Home/Discovery screen
│       ├── classroom-detail.tsx         # NEW — classroom detail page (href: null)
│       └── subscribe-confirm.tsx        # NEW — subscription confirmation screen (href: null)
├── features/
│   └── student/                         # NEW feature folder
│       ├── __tests__/
│       │   ├── useAllClassrooms.test.ts
│       │   ├── useClassroomDetail.test.ts
│       │   ├── useMySubscriptions.test.ts
│       │   └── useSubscribe.test.ts
│       ├── ClassroomCard.tsx            # NEW — discovery list card component
│       ├── LockedContentOverlay.tsx     # NEW — lock icon + locked sections UI
│       ├── useAllClassrooms.ts          # NEW — query: all classrooms + tutor + subjects + price
│       ├── useClassroomDetail.ts        # NEW — query: single classroom + sections (+ cards if subscribed)
│       ├── useMySubscriptions.ts        # NEW — query: current user's subscriptions
│       └── useSubscribe.ts             # NEW — mutation: insert subscription row
└── types/
    └── database.ts                      # ADD subscriptions table types
supabase/
└── migrations/
    └── 00007_subscriptions.sql          # NEW — subscriptions table + RLS + classrooms public policy
```

### Pattern 1: TanStack Query hook — `useAllClassrooms`

**What:** Fetches all published classrooms, joining tutor profile name and classroom fields.
**When to use:** Home/Discovery screen on mount.

```typescript
// Follows pattern from src/features/tutor/useClassroom.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useAllClassrooms() {
  return useQuery({
    queryKey: ['classrooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*, tutors!inner(user_id, profiles!inner(email))')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
```

Note: `profiles` only exposes `email` for now (no `display_name` column). Tutor display name is their email or a name field if added in Phase 3. Inspect actual `profiles` table columns before finalizing the join.

### Pattern 2: TanStack Query hook — `useClassroomDetail`

**What:** Fetches a single classroom with all its sections. Cards fetched separately (only shown to subscribers).
**When to use:** Classroom detail screen.

```typescript
export function useClassroomDetail(classroomId: string | undefined) {
  return useQuery({
    queryKey: ['classroom-detail', classroomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*, classroom_sections(*)')
        .eq('id', classroomId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!classroomId,
  });
}
```

### Pattern 3: `useSubscribe` mutation

**What:** Inserts a subscriptions row for the current user, then invalidates both subscriptions and classroom-detail queries.

```typescript
export function useSubscribe() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.session?.user?.id);

  return useMutation({
    mutationFn: async ({ classroomId }: { classroomId: string }) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({ student_id: userId!, classroom_id: classroomId, status: 'active' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, { classroomId }) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', userId] });
      queryClient.invalidateQueries({ queryKey: ['classroom-detail', classroomId] });
    },
  });
}
```

### Pattern 4: Expo Router — new screens registered in `_layout.tsx`

**What:** New detail and confirm screens are added as `href: null` Tabs.Screen entries — they live inside the tab stack but are not visible in the tab bar. This is identical to the existing `manage-classroom` and `classroom-settings` pattern.

```typescript
// In src/app/(tabs)/_layout.tsx — ADD these entries
<Tabs.Screen
  name="classroom-detail"
  options={{ title: 'Classroom', href: null }}
/>
<Tabs.Screen
  name="subscribe-confirm"
  options={{ title: 'Subscribe', href: null }}
/>
```

Navigate with `router.push('/(tabs)/classroom-detail?id=' + classroomId)`.

Receive in the screen with:
```typescript
import { useLocalSearchParams } from 'expo-router';
const { id } = useLocalSearchParams<{ id: string }>();
```

### Pattern 5: Subscription status check (client-side)

**What:** Client-side check — no server-side gate in v1.0. Matches D-18.

```typescript
// Inside classroom detail screen
const { data: subscriptions = [] } = useMySubscriptions();
const isSubscribed = subscriptions.some(
  (s) => s.classroom_id === classroomId && s.status === 'active'
);
```

### Pattern 6: Price display

**What:** `price_cents` stored as integer (18000 = R180). Display as:
```typescript
const priceLabel = `Subscribe · R${classroom.price_cents / 100}/month`;
```

### Anti-Patterns to Avoid

- **Calling hooks inside `.map()`:** The existing codebase solved this with a `SectionWithCards` wrapper component. Apply the same pattern if cards are fetched per-section on the detail screen.
- **Hardcoding colors or spacing:** All new components MUST use `COLORS`, `SPACING`, `RADII` from `src/features/ui/theme.ts`.
- **Creating a second Supabase client:** Import only from `src/lib/supabase.ts`.
- **Checking subscription server-side with RLS guard:** v1.0 is client-side check only (D-18). Do not add RLS to block non-subscribers from reading cards — that blocks the tutor too.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Lock icon | Custom SVG lock component | `Ionicons name="lock-closed-outline"` | Already imported throughout the codebase |
| Price formatting | Custom currency formatter | `R${price_cents / 100}/month` inline | ZAR prices are integers; no decimal edge cases for R180 |
| Subscription status check | Server-side RLS gate | Client-side array check (D-18) | Simpler; v1.0 doesn't need payment verification |
| Loading/error UI | Custom spinner/error components | `ActivityIndicator` + inline error text | Matches existing screen patterns in manage-classroom.tsx |
| Back navigation | Custom back button logic | `router.back()` + Ionicons `arrow-back` | Established pattern in all existing detail screens |

---

## Supabase Schema (Migration 00007)

### New table: `subscriptions`

```sql
-- Phase 5: Student subscriptions (SUB-01, SUB-02, SUB-03)

CREATE TABLE subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  classroom_id  UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  UNIQUE(student_id, classroom_id)
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Student reads/creates own subscriptions
CREATE POLICY "student can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (student_id = (SELECT auth.uid()));

CREATE POLICY "student can create own subscriptions"
  ON subscriptions INSERT
  WITH CHECK (student_id = (SELECT auth.uid()));

-- Tutor reads subscriptions to their classrooms
CREATE POLICY "tutor can read classroom subscriptions"
  ON subscriptions FOR SELECT
  USING (classroom_id IN (
    SELECT id FROM classrooms WHERE tutor_id IN (
      SELECT id FROM tutors WHERE user_id = (SELECT auth.uid())
    )
  ));
```

### Policy addition on `classrooms`

The existing policy only allows tutors to SELECT their own classroom. Discovery requires ALL authenticated users to read ALL published classrooms:

```sql
-- Add to migration 00007
CREATE POLICY "authenticated users can browse published classrooms"
  ON classrooms FOR SELECT
  USING (is_published = true AND auth.uid() IS NOT NULL);
```

CRITICAL: Without this policy, `useAllClassrooms` returns an empty array with no error — a silent failure that is hard to debug.

### TypeScript types to add in `src/types/database.ts`

```typescript
export type SubscriptionStatus = 'active' | 'cancelled';

// Inside Database['public']['Tables']:
subscriptions: {
  Row: {
    id: string;
    student_id: string;
    classroom_id: string;
    subscribed_at: string;
    status: SubscriptionStatus;
  };
  Insert: {
    student_id: string;
    classroom_id: string;
    status?: SubscriptionStatus;
  };
  Update: Partial<{ status: SubscriptionStatus }>;
  Relationships: [];
};
```

Also add `SubscriptionStatus` to the `Enums` block.

---

## Common Pitfalls

### Pitfall 1: Classrooms public SELECT policy missing

**What goes wrong:** `useAllClassrooms` returns `[]` with no error. The discovery screen shows "No classrooms" even when classrooms exist.
**Why it happens:** RLS on `classrooms` currently only allows tutors to read their own rows. Non-tutor users (students) get zero rows — Supabase does not return a 403, it returns an empty result set.
**How to avoid:** Migration 00007 MUST add the public SELECT policy before any UI work begins. Verify with a manual Supabase query or a direct `supabase from classrooms select *` test in the app after migration.
**Warning signs:** Discovery screen renders empty state immediately even with known data in DB.

### Pitfall 2: RLS policy conflict (duplicate SELECT policies)

**What goes wrong:** Adding a public SELECT policy while the tutor-scoped one still exists causes confusion — Postgres applies OR logic across all FOR SELECT policies, so both can coexist. This is fine. However if a future migration tries to DROP the old policy by the wrong name, it silently no-ops.
**How to avoid:** Name the new policy distinctly: `"authenticated users can browse published classrooms"`. Document both policies in the migration comment.

### Pitfall 3: Hooks called inside `.map()` on detail screen

**What goes wrong:** If the detail screen renders sections and tries to call `useClassroomCards(sectionId)` inside a `.map()`, React throws "Rules of Hooks" violation.
**Why it happens:** The same issue solved in Phase 4 with `SectionWithCards` wrapper. Easy to re-introduce when writing new screens.
**How to avoid:** Use the same wrapper component pattern. If cards need to be shown per-section (subscribed view), create a `SectionWithCards` component that calls `useClassroomCards` and is rendered as a list item.

### Pitfall 4: `useLocalSearchParams` returns string — not undefined

**What goes wrong:** `classroomId` from `useLocalSearchParams` is always a string (or string array), never undefined. Passing it directly to a hook that expects `string | undefined` and uses `enabled: !!classroomId` works, but the type must be handled — an empty string `""` is falsy, so the hook won't fire if `id` is missing from params.
**How to avoid:** Destructure with explicit type: `const { id } = useLocalSearchParams<{ id: string }>()`. Guard against `id` being undefined or `""`.

### Pitfall 5: Supabase join syntax for tutor profile name

**What goes wrong:** `classrooms` → `tutors` → `profiles` is a two-hop join. The Supabase JS client `select()` syntax for nested joins can be tricky; incorrect syntax returns null instead of an error.
**How to avoid:** Test the join query in Supabase Studio or Table Editor first. Use `tutors!inner(user_id, profiles!inner(email))` syntax. If `profiles` doesn't have the correct FK relationship configured in Supabase's schema cache, the join will fail.
**Warning signs:** `tutors` field in response is null even though the foreign key exists.

### Pitfall 6: `UNIQUE(student_id, classroom_id)` duplicate insert error

**What goes wrong:** If `useSubscribe` is called twice (double-tap, back navigation, re-mount), Supabase returns a duplicate key violation. The mutation throws, and the UI shows an error.
**How to avoid:** Disable the Subscribe button after mutation fires (`mutation.isPending`). The unique constraint is a safety net — don't rely on it as the only protection.

---

## Code Examples

### Verified Pattern: Query with join (from useClassroom.ts)

```typescript
// Source: src/features/tutor/useClassroom.ts (existing codebase)
const { data, error } = await supabase
  .from('classrooms')
  .select('*, tutors!inner(user_id)')
  .eq('tutors.user_id', userId!)
  .single();
```

### Verified Pattern: Optimistic delete with rollback (from useClassroomSections.ts)

Not needed for Phase 5 (subscriptions are insert-only), but the query invalidation pattern on `onSuccess` is the reference.

### Verified Pattern: Screen navigation with params (from manage-classroom.tsx)

```typescript
// Source: src/app/(tabs)/profile.tsx (existing codebase)
router.push('/(tabs)/manage-classroom');

// For parameterized routes (Phase 5 new pattern):
router.push(`/(tabs)/classroom-detail?id=${classroomId}`);
```

### Verified Pattern: useLocalSearchParams

```typescript
// Expo Router pattern — used in existing lesson screens
import { useLocalSearchParams } from 'expo-router';
const { id } = useLocalSearchParams<{ id: string }>();
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `href: null` screens as separate stack | `href: null` Tabs.Screen within tabs layout | Established Phase 1-4 | New screens follow same pattern — no separate Stack.Navigator needed |
| `getSession()` for auth state | `getUser()` + then `getSession()` | Phase 1 (auth gotcha) | Auth store already handles this — no change needed |

---

## Environment Availability

Step 2.6: SKIPPED — this phase has no new external dependencies. All tools (Expo, Supabase, TanStack Query, Zustand) are already installed and confirmed working from Phase 4.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | jest-expo (jest.config.js present) |
| Config file | `/Users/johanduplessis/Desktop/Claude Code/Druip/jest.config.js` |
| Quick run command | `npx jest --testPathPattern="features/student"` |
| Full suite command | `npx jest` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DISC-01 | `useAllClassrooms` returns all published classrooms | unit | `npx jest --testPathPattern="useAllClassrooms"` | Wave 0 |
| DISC-02 | `useClassroomDetail` returns classroom + sections | unit | `npx jest --testPathPattern="useClassroomDetail"` | Wave 0 |
| DISC-03 | Non-subscriber sees locked state (client-side check) | unit | `npx jest --testPathPattern="useMySubscriptions"` | Wave 0 |
| DISC-04 | Price formatted as "Subscribe · R180/month" | unit | Covered in DISC-02 test (price_cents conversion) | Wave 0 |
| SUB-01 | Confirmation screen renders with correct copy | manual-only | Visual inspection — screen rendering | N/A |
| SUB-02 | `useSubscribe` inserts subscription row | unit | `npx jest --testPathPattern="useSubscribe"` | Wave 0 |
| SUB-03 | `useMySubscriptions` returns user's subscriptions | unit | `npx jest --testPathPattern="useMySubscriptions"` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npx jest --testPathPattern="features/student"`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/features/student/__tests__/useAllClassrooms.test.ts` — covers DISC-01
- [ ] `src/features/student/__tests__/useClassroomDetail.test.ts` — covers DISC-02, DISC-04
- [ ] `src/features/student/__tests__/useMySubscriptions.test.ts` — covers DISC-03, SUB-03
- [ ] `src/features/student/__tests__/useSubscribe.test.ts` — covers SUB-02

Use `it.todo()` stubs pattern established in Phase 4 (see `src/features/tutor/__tests__/useCreateClassroom.test.ts`).

---

## Open Questions

1. **Tutor display name**
   - What we know: `profiles` table has `email` but no `display_name` or `name` column visible in `database.ts`.
   - What's unclear: Phase 3 may have added a name field not yet reflected in the TypeScript types (types are manual stubs, not generated). The classroom detail page needs a human-readable tutor name.
   - Recommendation: Before implementing `useAllClassrooms`, inspect the actual Supabase `profiles` table schema. If no name field exists, display email as fallback or add a `display_name` column in migration 00007.

2. **Cards on detail page for subscribers**
   - What we know: DISC-02 says "section preview" (section names only). D-06 confirms section titles only for non-subscribers. D-10 says subscribed student gets full access.
   - What's unclear: Does "full access" on the classroom detail page mean cards are shown inline on the detail screen, or does subscribing unlock a separate classroom-view screen?
   - Recommendation: Based on D-10 ("navigated back to the classroom detail, which now shows full unlocked content"), cards ARE shown inline on the detail screen for subscribers. Plan the detail screen to conditionally render card content based on `isSubscribed`.

---

## Sources

### Primary (HIGH confidence)

- Codebase inspection — `src/features/tutor/useClassroom.ts`, `src/features/classroom/useClassroomSections.ts` — established TanStack Query + Supabase patterns verified directly
- Codebase inspection — `src/app/(tabs)/_layout.tsx` — `href: null` navigation pattern for hidden stack screens confirmed
- Codebase inspection — `src/features/ui/theme.ts`, `Button.tsx`, `Card.tsx` — reusable UI components confirmed
- Codebase inspection — `supabase/migrations/00005_tutor_tables.sql`, `00006_classroom_sections_cards.sql` — RLS policy patterns and `(SELECT auth.uid())` subquery pattern confirmed
- `05-CONTEXT.md` — all locked decisions read verbatim

### Secondary (MEDIUM confidence)

- Expo Router docs pattern for `useLocalSearchParams` — consistent with existing `lesson` route usage observed in `src/app/lesson/`
- Supabase JS client nested join syntax — consistent with existing `tutors!inner(user_id)` usage in `useClassroom.ts`

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed and in use; no new packages needed
- Architecture: HIGH — patterns copied directly from Phase 4 codebase; no new patterns introduced
- Pitfalls: HIGH — RLS empty-result trap is a known Supabase behavior, verified against existing migration pattern
- Schema: HIGH — subscriptions table design follows same pattern as existing tables; UNIQUE constraint is a standard safety measure

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable stack; no fast-moving dependencies)
