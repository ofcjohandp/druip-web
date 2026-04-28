# Phase 3: Tutor Onboarding - Research

**Researched:** 2026-04-06
**Domain:** React Native / Expo Router / Supabase — tutor identity, classroom creation, conditional navigation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** "I want to teach" toggle appears on existing sign-up screen (`src/app/(auth)/sign-up.tsx`), below email/password fields. One additional UI element — no new screen for intent capture.

**D-02:** Toggle is optional (off by default). Students proceed to goal-selection as before. Tutors who toggle skip goal-selection entirely.

**D-03:** After a tutor signs up (toggle on), navigate directly to classroom creation — skip `/(auth)/goal-selection`. No welcome/intermediate screen.

**D-04:** Classroom creation screen is a standalone screen (not a tab). Route: `/(auth)/create-classroom` or similar, navigates into `/(tabs)` after successful creation.

**D-05:** Single scrollable form with all fields on one screen: classroom name, subjects, bio, monthly price. Single "Create classroom" CTA. No multi-step flow.

**D-06:** Price field defaults to R180 (pre-filled, editable). Currency label "R" shown inline as prefix. No currency picker — South African Rand only for v1.0.

**D-07:** Subjects use a free-text tag input: type subject name, tap "Add" (or return), tag appears below. Multiple tags. Tags removable via ✕ chip.

**D-08:** All fields required except bio. "Create classroom" button disabled until name, at least one subject, and price are filled. Bio is optional.

**D-09:** Classroom settings is a dedicated screen accessible from Profile tab. Reuses same fields pre-filled. Same "Save changes" CTA.

**D-10:** Changes save on CTA tap (not inline/autosave). No unsaved-changes confirmation for MVP.

**D-11:** Tutors see the same 5-tab nav as students. Profile tab content is conditionally different: if tutor, shows "My Classroom" card as primary element with links to classroom settings.

**D-12:** Non-tutor users see the Profile tab as today (placeholder). Conditional rendering based on whether user has a tutor record in Supabase.

### Claude's Discretion

- Exact toggle component style (switch vs checkbox vs tap-to-select card) — UI-SPEC resolves this: React Native `Switch`
- Sign-up screen layout adjustment for new toggle (spacing, label copy)
- Classroom creation screen header title and nav button style
- Exact tag chip styling (border, remove icon size, wrapping layout) — UI-SPEC resolves this
- Profile screen layout for the tutor My Classroom card (icon, arrow, description text) — UI-SPEC resolves this
- Loading and error states for classroom creation form

### Deferred Ideas (OUT OF SCOPE)

None recorded — discussion stayed within Phase 3 scope. Classroom sections and material cards are Phase 4.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TUTR-01 | User can toggle "I want to teach" during sign-up to register as a tutor | Modify sign-up.tsx: add `isTutor` boolean state + React Native `Switch`; conditional router.replace path after signUp |
| TUTR-02 | Tutor can create a classroom with name, subject(s), bio, and monthly price | New screen `/(auth)/create-classroom.tsx`; Supabase insert to `classrooms` table; `tutors` table or `is_tutor` flag on `profiles` |
| TUTR-03 | Tutor can set a subscription price (default R180/month) | Price TextInput pre-filled with "180"; numeric keyboard; "R" prefix inline |
| TUTR-04 | Tutor can edit classroom details (name, bio, price, subjects) after creation | New screen `classroom-settings.tsx`; Supabase update; pre-fill from query; "Save changes" CTA |
</phase_requirements>

---

## Summary

Phase 3 is a well-scoped data + navigation task. The codebase is clean and all required patterns already exist. The work is: (1) add a toggle to sign-up, (2) create two new screens, (3) modify the profile screen, (4) add two Supabase tables with RLS, and (5) wire the navigation conditional. No new libraries are needed — the entire stack is already installed.

The most important architectural question is **where to store the tutor flag**: on `profiles` as an `is_tutor` boolean column, or as a separate `tutors` table. Given Phase 4 (classroom sections) and Phase 5 (student discovery), a separate `tutors` table is preferred because tutors will accumulate tutor-specific fields (payout info, verification status in v2) that don't belong on `profiles`. The `profiles` table gets an `is_tutor` denormalised boolean for fast conditional rendering without an extra query.

The second key point is **the navigation flow for the `/(auth)/create-classroom` route**. This screen is placed inside the `(auth)` Stack group during creation but must navigate to `/(tabs)` on success. After success, the root navigator's `session && !inTabs` guard in `_layout.tsx` already handles routing into tabs when a session exists — but it fires on `session` change, not on classroom creation. The `router.replace('/(tabs)')` call from `create-classroom.tsx` is the correct approach and is consistent with how `goal-selection.tsx` works today.

**Primary recommendation:** Use `is_tutor` boolean on `profiles` (fast read for conditional rendering) + a separate `tutors` table for tutor-specific data + a `classrooms` table. Two Supabase migrations. Four new/modified files in the app layer.

---

## Standard Stack

All packages are already installed. No new dependencies required for Phase 3.

### Core (already in package.json)
| Library | Version | Purpose |
|---------|---------|---------|
| expo | ~54.0.33 | SDK — React Native managed workflow |
| expo-router | ~6.0.23 | File-based navigation — Stack + Tabs |
| @supabase/supabase-js | ^2.101.1 | Database, auth, RLS |
| zustand | ^5.0.12 | Client state (auth session, tutor flag in memory) |
| @tanstack/react-query | ^5.96.2 | Server state — classroom data fetching |
| @expo/vector-icons (Ionicons) | bundled | Icon library used in tab bar — `school`, `chevron-forward`, `close` |

**No new packages.** React Native's built-in `Switch` component handles the toggle. `TextInput`, `ScrollView`, `KeyboardAvoidingView` handle the form. All component primitives exist.

---

## Architecture Patterns

### New File Map

```
src/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx          MODIFY — add create-classroom screen
│   │   ├── sign-up.tsx          MODIFY — add isTutor toggle + conditional nav
│   │   └── create-classroom.tsx NEW — classroom creation form
│   └── (tabs)/
│       ├── profile.tsx          MODIFY — conditional tutor "My Classroom" card
│       └── classroom-settings.tsx NEW — edit classroom details
├── features/
│   └── tutor/                   NEW feature folder
│       ├── useClassroom.ts      NEW — TanStack Query hook: fetch classroom by tutor_id
│       ├── useCreateClassroom.ts NEW — mutation hook: insert tutors row + classrooms row
│       ├── useUpdateClassroom.ts NEW — mutation hook: update classrooms row
│       └── SubjectTagInput.tsx  NEW — tag chip input component
└── types/
    └── database.ts              MODIFY — add tutors + classrooms table types
```

### Pattern 1: Tutor Flag in Sign-Up

The `handleSignUp` function currently calls `supabase.auth.signUp()` then routes to `goal-selection`. Extend with an `isTutor` state boolean and a conditional route:

```typescript
// src/app/(auth)/sign-up.tsx — key change only
const [isTutor, setIsTutor] = useState(false);

const handleSignUp = async () => {
  // ... existing validation ...
  const { error: signUpError } = await supabase.auth.signUp({ email, password });
  setLoading(false);
  if (signUpError) {
    setError(signUpError.message);
  } else if (isTutor) {
    router.replace('/(auth)/create-classroom');
  } else {
    router.replace('/(auth)/goal-selection');
  }
};
```

The `handle_new_user()` SECURITY DEFINER trigger already creates a `profiles` row on `auth.users` INSERT. The `is_tutor` flag on `profiles` is NOT set by the trigger (trigger doesn't know intent at sign-up time) — it is set by the `useCreateClassroom` mutation when the tutor saves their classroom. This means: if a user toggles "I want to teach" but abandons the create-classroom screen, they land in tabs without a classroom — the profile screen will show the non-tutor view, which is fine for MVP.

### Pattern 2: Supabase Write — Create Classroom

The classroom creation must: (1) upsert `is_tutor = true` on `profiles`, (2) insert a row into `tutors`, (3) insert a row into `classrooms` linking to the tutor. This should be a single Supabase transaction or done sequentially with error handling.

```typescript
// src/features/tutor/useCreateClassroom.ts
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';

export function useCreateClassroom() {
  const session = useAuthStore((s) => s.session);

  return useMutation({
    mutationFn: async (data: {
      name: string;
      subjects: string[];
      bio: string;
      price_cents: number;
    }) => {
      const userId = session?.user?.id;
      if (!userId) throw new Error('Not authenticated');

      // Step 1: mark profile as tutor
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_tutor: true })
        .eq('id', userId);
      if (profileError) throw profileError;

      // Step 2: insert tutor record
      const { data: tutor, error: tutorError } = await supabase
        .from('tutors')
        .insert({ user_id: userId })
        .select('id')
        .single();
      if (tutorError) throw tutorError;

      // Step 3: insert classroom
      const { data: classroom, error: classroomError } = await supabase
        .from('classrooms')
        .insert({
          tutor_id: tutor.id,
          name: data.name,
          subjects: data.subjects,
          bio: data.bio,
          price_cents: data.price_cents,
          is_published: true,
        })
        .select('id')
        .single();
      if (classroomError) throw classroomError;

      return classroom;
    },
  });
}
```

Note: `price_cents` — store price as integer cents (R180 = 18000) to avoid floating point issues. The UI shows "180" (a string), converted to `parseInt(price) * 100` before writing.

### Pattern 3: Fetch Classroom for Pre-Fill (Settings Screen)

```typescript
// src/features/tutor/useClassroom.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';

export function useClassroom() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['classroom', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*, tutors!inner(user_id)')
        .eq('tutors.user_id', userId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
```

### Pattern 4: Conditional Profile Screen

```typescript
// src/app/(tabs)/profile.tsx — key pattern
import { useProfile } from '@/features/study/useProfile';
import { useClassroom } from '@/features/tutor/useClassroom';

// Read is_tutor from profiles row — useProfile already fetches profiles
// If is_tutor is true, show My Classroom card; else show existing placeholder
```

`useProfile` in `src/features/study/useProfile.ts` already fetches from `profiles`. The planner should check whether it returns `is_tutor` — once the column exists and is in the type, it will. No new query hook needed for the flag itself.

### Pattern 5: SubjectTagInput Component

```typescript
// src/features/tutor/SubjectTagInput.tsx — key structure
// State: inputValue (string) + tags (string[])
// "Add" pressed or return key: push inputValue to tags, clear inputValue
// Chip ✕ pressed: filter tag out of array
// Renders: TextInput row + wrapping View with tag chips (flexDirection: 'row', flexWrap: 'wrap')
```

### Pattern 6: Auth Layout — Register New Screen

```typescript
// src/app/(auth)/_layout.tsx — add create-classroom
<Stack.Screen name="create-classroom" />
```

The `create-classroom` screen sits inside the `(auth)` Stack. After successful creation, `router.replace('/(tabs)')` exits the auth stack. The root navigator guard (`session && !inTabs` in `_layout.tsx`) will not interfere because a session already exists at this point.

### Anti-Patterns to Avoid

- **Do not add `create-classroom` as a tab screen.** It is a one-time flow screen accessed from the auth stack.
- **Do not store price as a float.** Use integer cents: `price_cents INTEGER` in Supabase. Display as `price_cents / 100`.
- **Do not store subjects as a JSON string.** Use a Postgres `TEXT[]` array column — Supabase handles array serialization cleanly and this makes Phase 5 subject filtering queries straightforward.
- **Do not query tutor status inline in the profile screen component.** Put the conditional fetch in `useClassroom` with `enabled: !!userId` — the query returns `null` for non-tutors and the profile screen reads the result.
- **Do not hard-code `/(auth)/create-classroom` as a navigation destination in `_layout.tsx` root navigator guard.** The root guard only knows about `session` — it does not gate on classroom creation. The flow from sign-up to create-classroom to tabs happens entirely via explicit `router.replace()` calls in the screen components, which is correct.

---

## Supabase Schema

### New Tables Required

```sql
-- Migration 1: Add is_tutor to profiles

ALTER TABLE profiles
ADD COLUMN is_tutor BOOLEAN NOT NULL DEFAULT false;

-- Migration 2: tutors table

CREATE TABLE tutors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS: tutors
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor can read own row"
  ON tutors FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "tutor can insert own row"
  ON tutors FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Migration 3: classrooms table

CREATE TABLE classrooms (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id     UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  subjects     TEXT[] NOT NULL DEFAULT '{}',
  bio          TEXT,
  price_cents  INTEGER NOT NULL DEFAULT 18000,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: classrooms
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor can read own classroom"
  ON classrooms FOR SELECT
  USING (
    tutor_id IN (
      SELECT id FROM tutors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "tutor can insert own classroom"
  ON classrooms FOR INSERT
  WITH CHECK (
    tutor_id IN (
      SELECT id FROM tutors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "tutor can update own classroom"
  ON classrooms FOR UPDATE
  USING (
    tutor_id IN (
      SELECT id FROM tutors WHERE user_id = auth.uid()
    )
  );
```

Note: Phase 5 (student discovery) will need a public SELECT policy on `classrooms` for browsing published classrooms. That policy is NOT added here — it belongs to Phase 5. For Phase 3, only the tutor needs to read/write their own classroom.

### TypeScript Type Additions (database.ts)

```typescript
// Add to Database['public']['Tables']
tutors: {
  Row: {
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
  };
  Insert: { user_id: string };
  Update: Partial<{ updated_at: string }>;
};
classrooms: {
  Row: {
    id: string;
    tutor_id: string;
    name: string;
    subjects: string[];
    bio: string | null;
    price_cents: number;
    is_published: boolean;
    created_at: string;
    updated_at: string;
  };
  Insert: Omit<Database['public']['Tables']['classrooms']['Row'], 'id' | 'created_at' | 'updated_at'>;
  Update: Partial<Database['public']['Tables']['classrooms']['Insert']>;
};

// Modify profiles Row:
// Add: is_tutor: boolean;
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Toggle UI | Custom toggle component | React Native built-in `Switch` — already handles track/thumb color props, accessibility, and touch state |
| Icon for classroom card / remove chip | SVG or custom icon | `@expo/vector-icons` Ionicons — already installed, used in tab bar |
| Form keyboard handling | Manual scroll offset calculation | `KeyboardAvoidingView` — already used in sign-up.tsx |
| Supabase array column serialization | JSON.stringify/parse on subjects array | Supabase `TEXT[]` — PostgREST handles array serialization natively |
| Client state for classroom data | Zustand store | TanStack Query — classrooms are server state, not client state |

**Key insight:** This phase requires zero new dependencies. All patterns are already established in the codebase. The work is wiring, not invention.

---

## Common Pitfalls

### Pitfall 1: `/(auth)/_layout.tsx` Missing the New Screen Registration

**What goes wrong:** `create-classroom` screen is created as a file but not registered in `_layout.tsx`. Expo Router throws a "route not found" error at runtime.

**Why it happens:** The auth layout `Stack` must explicitly list screens (it does — see `sign-in`, `sign-up`, `goal-selection`). A new file in the folder is not auto-registered.

**How to avoid:** Add `<Stack.Screen name="create-classroom" />` to `src/app/(auth)/_layout.tsx` before any navigation attempt.

**Warning signs:** Error "Unable to find screen `create-classroom` in the navigator's children" when the tutor toggle path fires.

---

### Pitfall 2: Root Navigator Guard Intercepts the Tutor Flow

**What goes wrong:** After `supabase.auth.signUp()` resolves, `onAuthStateChange` fires, which sets `session` in the auth store. The root `_layout.tsx` guard sees `session && !inTabs` and calls `router.replace('/(tabs)')` — overriding the `router.replace('/(auth)/create-classroom')` call from sign-up.

**Why it happens:** The `useEffect` in `RootNavigator` runs on every `session` change. If `router.replace('/(auth)/create-classroom')` and the session update happen in the same tick (or close to it), the guard may fire and redirect to tabs before the tutor can fill in their classroom.

**How to avoid:** The fix is to set a "pending tutor onboarding" flag before navigating to `create-classroom`, and have the root navigator guard skip its redirect if that flag is set. A simple Zustand boolean (`pendingTutorOnboarding`) in the auth store works. Set it to `true` before `router.replace('/(auth)/create-classroom')` and clear it after `router.replace('/(tabs)')` in create-classroom.

Alternative (simpler): Check in the root guard: `const inAuth = segments[0] === '(auth)'` — the guard already only fires on `!inTabs`, so `(auth)` routes are already excluded from the `!session && inTabs` branch. But the `session && !inTabs` branch WILL fire when session exists and user is on `(auth)/create-classroom`. Need to add an exception: `if (session && !inTabs && segments[1] !== 'create-classroom')`.

**Warning signs:** App jumps from sign-up directly to tabs, bypassing classroom creation, even when toggle is on.

---

### Pitfall 3: Price Stored as Float

**What goes wrong:** Price input value "180" is parsed with `parseFloat()` and stored as `180.0` (NUMERIC or FLOAT column in Supabase). Floating-point arithmetic errors emerge in Phase 5 when displaying/calculating subscription amounts.

**Why it happens:** Monetary values stored as floats are a classic footgun.

**How to avoid:** Store as `INTEGER price_cents`. Convert: `parseInt(priceInput, 10) * 100` on write. Display: `(price_cents / 100).toString()` on read (no decimals needed for ZAR in v1.0).

---

### Pitfall 4: Subjects Stored as JSON String Instead of Array

**What goes wrong:** `subjects` field stored as `TEXT` with JSON.stringify, or as a stringified comma-separated list. Phase 5 subject-based filtering queries become painful.

**Why it happens:** Developer defaults to string storage for arrays.

**How to avoid:** `TEXT[]` Postgres column. Supabase PostgREST passes arrays natively as JSON arrays in the body and serializes them correctly. TypeScript type: `subjects: string[]`.

---

### Pitfall 5: Tutor Check Requires Two Round-Trips

**What goes wrong:** Profile screen first fetches `profiles` to get `is_tutor`, then — if true — fetches `classrooms`. User sees a flash of the non-tutor profile screen before the classroom card appears.

**Why it happens:** Sequential async fetches without pre-existing knowledge of tutor status.

**How to avoid:** `useProfile` already fetches the `profiles` row. Once `is_tutor` is in the type, the profile screen can read it synchronously from the cached query result. No second fetch needed until the user taps "My Classroom". Use TanStack Query's `staleWhileRevalidate` — `is_tutor` will be in the cache after the first fetch.

---

### Pitfall 6: `npx expo install` vs `npm install` for Expo-Ecosystem Packages

**What goes wrong:** Any accidental `npm install` of an Expo-ecosystem package (e.g., a future addition) pulls the wrong peer version and causes version conflict warnings or crashes.

**Why it happens:** npm resolves independently; Expo's version compatibility matrix is baked into `npx expo install`.

**How to avoid:** Always use `npx expo install` for Expo-ecosystem packages. Not applicable for Phase 3 (no new packages) but worth noting for the planner.

---

## Code Examples

### React Native Switch for Toggle

```typescript
// Source: React Native core docs — Switch component
import { Switch, View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADII } from '@/features/ui/theme';

<View style={styles.toggleCard}>
  <View style={styles.toggleLabels}>
    <Text style={styles.toggleLabel}>I want to teach</Text>
    <Text style={styles.toggleSubLabel}>Create a classroom for your students</Text>
  </View>
  <Switch
    value={isTutor}
    onValueChange={setIsTutor}
    trackColor={{ false: COLORS.border, true: 'rgba(255, 107, 107, 0.3)' }}
    thumbColor={isTutor ? COLORS.accent : '#FFFFFF'}
  />
</View>
```

### Button with ActivityIndicator (Loading State)

The existing `Button.tsx` accepts `title` as a string — it cannot render an `ActivityIndicator` inside. The create-classroom and settings screens need a loading state that replaces the button text with a spinner. Options:
1. Extend `Button.tsx` to accept an optional `loading` prop that swaps text for `ActivityIndicator`.
2. Use `TouchableOpacity` + inline style directly in the form screen (matching the sign-up.tsx pattern).

The sign-up screen already uses option 2 (inline TouchableOpacity). For consistency, the classroom creation form should do the same rather than modifying `Button.tsx`. This is a decision point for the planner — both are valid. Recommendation: extend `Button.tsx` with a `loading` prop for reusability across Phase 4/5.

```typescript
// Extended Button.tsx loading prop pattern
import { ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

// Inside render:
{loading
  ? <ActivityIndicator size="small" color={COLORS.textOnAccent} />
  : <Text style={textStyle}>{title}</Text>
}
```

### KeyboardAvoidingView + ScrollView for Form

```typescript
// Pattern from sign-up.tsx — extend for create-classroom
import { KeyboardAvoidingView, ScrollView, Platform } from 'react-native';

<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
  <ScrollView
    contentContainerStyle={{ padding: SPACING.lg, paddingBottom: SPACING.xl }}
    keyboardShouldPersistTaps="handled"
  >
    {/* form fields */}
  </ScrollView>
</KeyboardAvoidingView>
```

Note: `keyboardShouldPersistTaps="handled"` is important — without it, tapping the "Add" subject button while the keyboard is open dismisses the keyboard before the tap registers.

### Supabase Pattern — Select with Join for Classroom

```typescript
// Fetch classroom via tutors join — confirmed pattern from Supabase PostgREST docs
const { data, error } = await supabase
  .from('classrooms')
  .select('*, tutors!inner(user_id)')
  .eq('tutors.user_id', userId)
  .single();
```

### RLS Pattern (established in project)

```sql
-- Confirmed pattern from existing migrations (per CONTEXT.md code_context)
-- Uses auth.uid() subquery — same pattern as existing profile policies

CREATE POLICY "tutor can update own classroom"
  ON classrooms FOR UPDATE
  USING (
    tutor_id IN (
      SELECT id FROM tutors WHERE user_id = auth.uid()
    )
  );
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `AsyncStorage` for session | `expo-sqlite localStorage` | Already applied in this project — do not regress |
| `getSession()` for auth check | `getUser()` for server-side validation | Already applied in `useAuthStore.ts` |
| Tabs with `lazy: false` | Tabs without `lazy: false` | Already applied — do not re-add (caused unresponsiveness on device) |

---

## Environment Availability

Step 2.6: SKIPPED — Phase 3 is purely code + Supabase schema changes. No new external CLI tools, services, or runtimes are required. All dependencies already installed.

---

## Validation Architecture

Test framework: jest-expo (detected in package.json devDependencies). Config likely via jest-expo preset.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Notes |
|--------|----------|-----------|-------------------|-------|
| TUTR-01 | Toggle sets isTutor state; routes to create-classroom when true | Unit (component) | `jest --testPathPattern sign-up` | Test conditional router.replace path |
| TUTR-02 | Classroom creation writes to Supabase; navigates to tabs | Integration | `jest --testPathPattern useCreateClassroom` | Mock Supabase client |
| TUTR-03 | Price defaults to "180"; price field accepts numeric input | Unit (component) | `jest --testPathPattern create-classroom` | Assert defaultValue |
| TUTR-04 | Classroom settings pre-fills from fetched data; save calls update | Integration | `jest --testPathPattern useUpdateClassroom` | Mock useClassroom hook return |

### Quick Run Command
```bash
npx jest --testPathPattern "(sign-up|create-classroom|useCreateClassroom|useUpdateClassroom)"
```

### Full Suite Command
```bash
npx jest
```

### Wave 0 Gaps
- [ ] `src/features/tutor/__tests__/useCreateClassroom.test.ts` — covers TUTR-02
- [ ] `src/features/tutor/__tests__/useUpdateClassroom.test.ts` — covers TUTR-04
- [ ] `src/app/(auth)/__tests__/sign-up.test.tsx` — covers TUTR-01 toggle path
- [ ] `src/app/(auth)/__tests__/create-classroom.test.tsx` — covers TUTR-03 price default

---

## Project Constraints (from CLAUDE.md)

These are hard rules the planner must not violate:

| Constraint | Source | Implication for Phase 3 |
|------------|--------|------------------------|
| Stack is React Native / Expo + Supabase — not up for debate | CLAUDE.md §Constraints | No new navigation or state libraries |
| `theme.ts` is the single source of truth for design tokens | CLAUDE.md §Technology Stack | All new components import from `src/features/ui/theme.ts` — no hardcoded colors |
| `src/lib/supabase.ts` is the single point of Supabase client initialization | CLAUDE.md §Technology Stack | No new Supabase clients. Import from `@/lib/supabase` |
| Supabase types live in `src/types/database.ts` | CLAUDE.md §Technology Stack | Add `tutors` and `classrooms` types here; update `profiles` Row |
| Screen files in `src/app/` are thin route wrappers — business logic in `src/features/` | CLAUDE.md §Technology Stack | Create `src/features/tutor/` for hooks and components |
| Use `npx expo install` (not `npm install`) for Expo-ecosystem packages | CLAUDE.md §Technology Stack | Not applicable Phase 3 (no new packages), but worth enforcing |
| RLS uses `auth.uid()` subquery pattern | CLAUDE.md (STATE.md decisions) | All new table policies follow this exact pattern |
| `handle_new_user()` trigger auto-creates profile row | CLAUDE.md (STATE.md decisions) | Do NOT create profile row manually in sign-up flow |
| `lazy: false` must NOT be in Tabs screenOptions | CLAUDE.md (STATE.md decisions) | Do not add `classroom-settings` as a tab screen |

---

## Open Questions

1. **Root navigator guard and create-classroom route**
   - What we know: `_layout.tsx` redirects to `/(tabs)` when `session && !inTabs`. Create-classroom lives in `(auth)`, which is `!inTabs`.
   - What's unclear: Does the `onAuthStateChange` event fire before or after `router.replace('/(auth)/create-classroom')` resolves? If before, the guard fires and overrides the redirect.
   - Recommendation: Add a Zustand `pendingTutorOnboarding` flag or add `segments[1] !== 'create-classroom'` exception in the root guard. Planner should decide which — the flag is more explicit and testable.

2. **`useProfile` hook — does it need to return `is_tutor`?**
   - What we know: `src/features/study/useProfile.ts` fetches from `profiles`. Once `is_tutor` is added to the column and the database type, it will be in the returned row.
   - What's unclear: Whether `useProfile` selects `*` or specific columns. If specific columns, `is_tutor` needs to be added to the select.
   - Recommendation: Planner should read `useProfile.ts` and confirm the select scope before creating the plan. If `select('*')`, no change needed.

3. **Classroom settings route: tabs or modal/pushed stack?**
   - What we know: D-09 says it's a dedicated screen accessible from Profile tab. UI-SPEC says `src/app/(tabs)/classroom-settings.tsx` with a back arrow shown.
   - What's unclear: Whether this is a Tab in the Tabs navigator (hidden via `href: null`) or a Stack screen pushed from within the tabs group.
   - Recommendation: Use a stack screen pushed from the profile tab — not a tab with `href: null`. Expo Router supports nested stacks inside tab screens. The back arrow behavior is cleaner with a push navigation. Route: `/(tabs)/classroom-settings` as a Stack.Screen pushed via `router.push`.

---

## Sources

### Primary (HIGH confidence)
- Existing codebase — `src/app/(auth)/sign-up.tsx`, `src/app/_layout.tsx`, `src/app/(auth)/_layout.tsx`, `src/features/auth/useAuthStore.ts`, `src/features/ui/theme.ts`, `src/features/ui/Button.tsx`, `src/features/ui/Card.tsx`, `src/lib/supabase.ts`, `src/types/database.ts`
- `.planning/phases/03-tutor-onboarding/03-CONTEXT.md` — all locked decisions
- `.planning/phases/03-tutor-onboarding/03-UI-SPEC.md` — component contracts and copywriting
- `.planning/STATE.md` — accumulated decisions from Phases 1 and 2
- React Native core docs — `Switch` component (built-in, well-established)

### Secondary (MEDIUM confidence)
- Supabase PostgREST array column handling (`TEXT[]`) — consistent with documented behavior, not independently verified via Context7 for this specific session

### Tertiary (LOW confidence)
- Root navigator guard race condition (session vs router.replace timing) — inferred from code reading, not empirically tested on the physical device

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed in package.json
- Architecture patterns: HIGH — all based on existing codebase patterns
- Supabase schema: HIGH — follows established RLS pattern from project
- Navigation flow: MEDIUM — root guard timing (Pitfall 2) is inferred, not tested
- Pitfalls: MEDIUM-HIGH — most are derived from code reading; root guard timing is LOW

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable stack — 30 days)
