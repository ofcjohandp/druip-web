# Phase 7: Student Onboarding - Research

**Researched:** 2026-04-06
**Domain:** React Native / Expo Router / Supabase — multi-step onboarding flow, profile extension, tag-based marketplace filtering
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ONBD-01 | After sign-up, student is directed to a multi-step onboarding flow before accessing the marketplace | Root navigator guard in `_layout.tsx` must check `onboarding_complete` on `student_profiles`; flag `pendingStudentOnboarding` in Zustand (mirrors existing `pendingTutorOnboarding` pattern) |
| ONBD-02 | Student enters first name, surname, and optionally uploads a profile photo on Screen 1 | Screen 1 in `(auth)/onboarding/` stack; `expo-image-picker` already installed; upload to Supabase Storage `avatars` bucket |
| ONBD-03 | Student selects their university and campus on Screen 2 | Screen 2 with hardcoded university/campus list (MVP — no DB table needed); stored in `student_profiles` as `university TEXT`, `campus TEXT` |
| ONBD-04 | Student selects their degree/programme and year of study on Screen 3 | Screen 3 with free-text degree input + year picker (1–6); stored in `student_profiles` as `degree TEXT`, `year_of_study INTEGER` |
| ONBD-05 | Student selects subject tags (multi-select) from a shared tag library on Screen 4 — tags populated from active tutor classrooms | Requires new `subject_tags` table; Screen 4 renders bubble multi-select; student's selections stored in `student_subject_tags` junction table |
| ONBD-06 | Student selects type of help needed (multi-select) on Screen 5 | Screen 5 with hardcoded help-type options; stored in `student_profiles.help_types TEXT[]` |
| ONBD-07 | Student can optionally add an upcoming test date on Screen 6 (skippable) | Screen 6 with `@react-native-community/datetimepicker` (needs installing via `npx expo install`) or Platform.OS-specific RN `DatePickerIOS`/`DatePickerAndroid` — use `@react-native-community/datetimepicker` |
| ONBD-08 | After completing onboarding, marketplace shows tutors filtered by the student's selected subject tags | `useAllClassrooms` must accept an optional `subjectTagIds` filter; `classrooms` tags must be normalised from `subjects TEXT[]` to FK-based `classroom_subject_tags` junction (or query-time filter on denormalised data) |
</phase_requirements>

---

## Summary

Phase 7 adds a gated 6-screen onboarding flow for new students. The flow runs inside the `(auth)` stack group (consistent with the existing tutor onboarding pattern), is triggered once, guarded by an `onboarding_complete` boolean on a new `student_profiles` table, and ends with a `router.replace('/(tabs)')` into the marketplace.

The two most critical architectural decisions are:

1. **Where to store onboarding data.** The existing `profiles` table holds auth-layer fields (`email`, `is_tutor`, `daily_goal`, `streak_count`, `total_xp`). Adding 8+ student-specific columns there would pollute it. The cleanest approach — consistent with the `tutors` table split in Phase 3 — is a new `student_profiles` table with a 1-to-1 FK to `profiles(id)`. This keeps the profiles table lean and mirrors the established pattern.

2. **How subject tags are stored and filtered.** Classrooms currently store `subjects TEXT[]` (free text, set by tutors). For the tag-based marketplace filter to work, both sides must reference the same normalised tag records. This requires a `subject_tags` table (id, name, slug) and a `classroom_subject_tags` junction table (classroom_id, tag_id). Students select from this tag library; their selections go in a `student_subject_tags` junction table. The marketplace query then filters classrooms whose tags intersect the student's selected tags. This is a schema migration concern that must happen before the UI screens.

The navigation guard pattern is already established: `pendingTutorOnboarding` in `useAuthStore` blocks the root guard from routing to `/(tabs)`. The same pattern applies here with a `pendingStudentOnboarding` flag, derived from fetching `student_profiles.onboarding_complete` after sign-in.

**Primary recommendation:** New `student_profiles` table + `subject_tags` + junction tables; 6-screen flow in `(auth)/onboarding/`; Zustand flag for gate; tag-filtered `useAllClassrooms` hook variant.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-router | ~6.0.23 | Onboarding screen routing within `(auth)` group | Already installed; Stack navigator pattern used for tutor flow |
| @supabase/supabase-js | ^2.101.1 | DB reads/writes for student_profiles and subject_tags | Already installed; all data persistence goes through this |
| @tanstack/react-query | ^5.96.2 | Query hooks for subject_tags and student profile reads | Already installed; established pattern for all server state |
| zustand | ^5.0.12 | `pendingStudentOnboarding` flag in useAuthStore | Already installed; established pattern for session-adjacent state |
| expo-image-picker | ~17.0.10 | Profile photo selection on Screen 1 | Already installed; already used in AddCardBottomSheet |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-native-community/datetimepicker | latest (via `npx expo install`) | Date picker for Screen 6 (upcoming test date) | Only for Screen 6; not currently installed |
| react-native Image | built-in | Display selected profile photo preview | No extra install needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@react-native-community/datetimepicker` | Plain TextInput (date string) | TextInput avoids a native dependency; datetimepicker is the correct UX for date entry on mobile. Use datetimepicker. |
| `student_profiles` new table | Add columns to `profiles` | Columns on `profiles` pollute the auth-layer table; separate table mirrors Phase 3 `tutors` split |
| normalised `subject_tags` table | Keep `subjects TEXT[]` on classrooms | Free-text array cannot drive filtered queries reliably; normalised tags are required for ONBD-08 |

**Installation (new packages only):**
```bash
npx expo install @react-native-community/datetimepicker
```

All other packages already in `package.json`. [VERIFIED: codebase grep]

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── (auth)/
│       └── onboarding/           # 6-screen Stack (new)
│           ├── _layout.tsx       # Stack.Screen declarations, headerShown: false
│           ├── step-1-profile.tsx
│           ├── step-2-university.tsx
│           ├── step-3-degree.tsx
│           ├── step-4-subjects.tsx
│           ├── step-5-help-type.tsx
│           └── step-6-test-date.tsx
├── features/
│   └── onboarding/               # feature slice (new)
│       ├── useStudentProfile.ts  # TanStack Query hook: read student_profiles
│       ├── useUpsertStudentProfile.ts  # mutation: create/update student_profiles
│       ├── useSubjectTags.ts     # TanStack Query hook: read subject_tags
│       ├── useStudentSubjectTags.ts    # mutation: write student_subject_tags
│       └── OnboardingProgress.tsx      # optional progress indicator component
```

### Pattern 1: Multi-screen onboarding in `(auth)` Stack (mirrors tutor create-classroom)

**What:** Each onboarding step is a separate screen in a nested Stack under `(auth)/onboarding/`. Navigation is `router.push('/(auth)/onboarding/step-2-university')` from each step's CTA. Final step calls `router.replace('/(tabs)')` and sets `onboarding_complete = true` in Supabase.

**When to use:** Always — this is consistent with how `create-classroom.tsx` works today. The `(auth)` stack already has `animation: 'slide_from_right'` which gives the correct feel for a forward-moving flow.

**Example — screen-to-screen navigation:**
```typescript
// Source: mirrors src/app/(auth)/create-classroom.tsx pattern
const handleNext = async () => {
  await upsertStudentProfile.mutateAsync({ first_name, last_name });
  router.push('/(auth)/onboarding/step-2-university');
};
```

**Example — final screen completion:**
```typescript
// Source: mirrors create-classroom.tsx router.replace('/(tabs)') pattern
const handleComplete = async () => {
  await upsertStudentProfile.mutateAsync({
    upcoming_test_date: testDate ?? null,
    onboarding_complete: true,
  });
  useAuthStore.getState().setPendingStudentOnboarding(false);
  router.replace('/(tabs)');
};
```

### Pattern 2: Root guard — blocking tabs until onboarding complete

**What:** Add `pendingStudentOnboarding: boolean` to `useAuthStore`. After sign-in/sign-up, the auth listener must fetch `student_profiles.onboarding_complete` and set this flag. The existing guard in `_layout.tsx` already checks `pendingTutorOnboarding` — extend it with the same OR logic.

**When to use:** Both for new sign-ups (no `student_profiles` row yet) and existing users who never completed onboarding.

**Current guard (src/app/_layout.tsx lines 33-38):**
```typescript
// Source: src/app/_layout.tsx [VERIFIED: codebase read]
if (session && !inTabs && !pendingTutorOnboarding) {
  router.replace('/(tabs)');
} else if (!session && inTabs) {
  router.replace('/');
}
```

**Extended guard with student onboarding:**
```typescript
if (session && !inTabs && !pendingTutorOnboarding && !pendingStudentOnboarding) {
  router.replace('/(tabs)');
} else if (session && !inTabs && pendingStudentOnboarding) {
  router.replace('/(auth)/onboarding/step-1-profile');
} else if (!session && inTabs) {
  router.replace('/');
}
```

**Critical:** The `pendingStudentOnboarding` flag should only apply to non-tutors. Tutors skip student onboarding entirely. Gate check: `if (is_tutor) skip`.

### Pattern 3: Multi-select bubble UI for subject tags (Screen 4 and Screen 5)

**What:** Render all available options as tappable chips/bubbles. Selected items get accent background (`COLORS.accent`) and white text; unselected get surface background and border. State held in local `useState<string[]>` (IDs for tags, string keys for help types).

**When to use:** Screen 4 (subject tags from DB) and Screen 5 (help types from hardcoded list). The existing `SubjectTagInput` in `src/features/tutor/SubjectTagInput.tsx` is a free-text input — not the same pattern. Build a new `TagBubbleSelect` component.

**Example:**
```typescript
// Source: design intent from phase description; pattern is standard RN
function TagBubbleSelect({ options, selected, onToggle }: TagBubbleSelectProps) {
  return (
    <View style={styles.bubblesRow}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt.id);
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => onToggle(opt.id)}
            style={[styles.bubble, isSelected && styles.bubbleSelected]}
            activeOpacity={0.7}
          >
            <Text style={[styles.bubbleText, isSelected && styles.bubbleTextSelected]}>
              {opt.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
```

### Pattern 4: Upsert pattern for progressive profile building

**What:** Each screen mutates only its own fields in `student_profiles`. Use Supabase `upsert` with `onConflict: 'id'` so partial saves accumulate. The row is created on Screen 1 (first save); subsequent screens update it.

**When to use:** All 6 screens.

```typescript
// Source: Supabase upsert pattern [ASSUMED — standard Supabase JS API]
const { error } = await supabase
  .from('student_profiles')
  .upsert(
    { id: userId, first_name, last_name, updated_at: new Date().toISOString() },
    { onConflict: 'id' }
  );
```

### Pattern 5: Marketplace tag filtering in useAllClassrooms

**What:** After onboarding, the Home screen must show classrooms filtered by the student's subject tags. Add an optional `tagIds?: string[]` param to `useAllClassrooms`. When provided, filter classrooms that have at least one matching tag in `classroom_subject_tags`.

**Supabase query:**
```typescript
// Source: Supabase relational filtering docs [ASSUMED — standard pattern]
.from('classrooms')
.select('*, classroom_subject_tags!inner(tag_id)')
.in('classroom_subject_tags.tag_id', tagIds)
```

### Anti-Patterns to Avoid
- **Storing onboarding data directly on `profiles`:** Pollutes the auth-layer table; makes future student-vs-tutor split harder. Use `student_profiles`.
- **Using free-text `subjects TEXT[]` for tag filtering:** Can't do reliable multi-select intersection queries. Must migrate to normalised `subject_tags` + junction tables.
- **Hooks inside `.map()`:** The existing codebase solved this with wrapper components (`SectionWithCards` in Phase 4). If screens need per-item query hooks, use the same wrapper pattern.
- **Hardcoding university/campus list in multiple places:** Define a single `UNIVERSITIES` constant in `src/features/onboarding/universities.ts` and import it in Screen 2.
- **Blocking the entire app on profile fetch at startup:** The `onboarding_complete` check should be a fast `.select('onboarding_complete').eq('id', userId).maybeSingle()` — not a full profile fetch.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date picker on mobile | Custom date input with TextInput + parsing | `@react-native-community/datetimepicker` | Native date picker handles locale, keyboard conflicts, accessibility |
| Image upload to Supabase Storage | Custom multipart/form-data upload | `expo-image-picker` + `supabase.storage.from().upload()` | Already used in AddCardBottomSheet; pattern established |
| Progress indicator (6 steps) | No need to hand-roll | A simple `View` with step dots is sufficient; no library needed | MVP — dots/bar with inline StyleSheet is 10 lines |
| Multi-select tag bubbles | External library | Plain `TouchableOpacity` + `StyleSheet` | The existing chip pattern in `SubjectTagInput` demonstrates the approach; extend it |

---

## DB Schema

### New Migration: `00012_student_onboarding.sql`

```sql
-- subject_tags: shared between tutors (classroom tagging) and students (onboarding)
CREATE TABLE subject_tags (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT NOT NULL,
  slug  TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE subject_tags ENABLE ROW LEVEL SECURITY;

-- Public read — students and tutors both need to browse tags
CREATE POLICY "anyone authenticated can read subject_tags"
  ON subject_tags FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- classroom_subject_tags: classroom → tag junction
CREATE TABLE classroom_subject_tags (
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  tag_id       UUID NOT NULL REFERENCES subject_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (classroom_id, tag_id)
);

ALTER TABLE classroom_subject_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can read classroom_subject_tags"
  ON classroom_subject_tags FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "tutor can manage own classroom tags"
  ON classroom_subject_tags FOR ALL
  USING (classroom_id IN (
    SELECT id FROM classrooms WHERE tutor_id IN (
      SELECT id FROM tutors WHERE user_id = (SELECT auth.uid())
    )
  ));

-- student_profiles: student-specific onboarding data (1-to-1 with profiles)
CREATE TABLE student_profiles (
  id                  UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  first_name          TEXT,
  last_name           TEXT,
  photo_url           TEXT,
  university          TEXT,
  campus              TEXT,
  degree              TEXT,
  year_of_study       INTEGER CHECK (year_of_study BETWEEN 1 AND 8),
  help_types          TEXT[] NOT NULL DEFAULT '{}',
  upcoming_test_date  DATE,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student can read own profile"
  ON student_profiles FOR SELECT
  USING (id = (SELECT auth.uid()));

CREATE POLICY "student can insert own profile"
  ON student_profiles FOR INSERT
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "student can update own profile"
  ON student_profiles FOR UPDATE
  USING (id = (SELECT auth.uid()));

-- student_subject_tags: student → tag junction
CREATE TABLE student_subject_tags (
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES subject_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, tag_id)
);

ALTER TABLE student_subject_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student can manage own subject tags"
  ON student_subject_tags FOR ALL
  USING (student_id = (SELECT auth.uid()));

-- Triggers
CREATE TRIGGER set_student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Seeding Subject Tags (initial data)

The `subject_tags` table starts empty. Tags need to be populated from existing classroom `subjects TEXT[]` data before Phase 7 is useful. This can be done in a separate migration or a seed script. For MVP with one tutor (Sharone), manually insert her subjects as tags via Supabase dashboard or a seed migration.

### classrooms.subjects migration concern

Classrooms currently store subjects as `TEXT[]` (free text). For ONBD-08, classrooms must have their tags in `classroom_subject_tags`. This requires:
1. Insert existing `subjects[]` values into `subject_tags` (deduplicated by slug)
2. Populate `classroom_subject_tags` from existing classroom `subjects[]` data
3. Optionally deprecate the `subjects TEXT[]` column (leave it for now — Phase 7 scope is additive)

For MVP with Sharone's single classroom, this is a small manual operation. A migration that inserts from existing `subjects` arrays is preferable to a manual step.

---

## Common Pitfalls

### Pitfall 1: Double-routing on sign-up for tutors
**What goes wrong:** After a student completes sign-up, `sign-up.tsx` currently routes non-tutors to `/(auth)/goal-selection`. If we add student onboarding, `goal-selection` must be removed from the path (it's a legacy pre-pivot screen). Routing to onboarding and also triggering `goal-selection` simultaneously will cause a navigation stack conflict.
**Why it happens:** `sign-up.tsx` has an explicit `router.replace('/(auth)/goal-selection')` for non-tutors; the root guard may also fire at the same time.
**How to avoid:** Replace `router.replace('/(auth)/goal-selection')` in sign-up.tsx with `router.replace('/(auth)/onboarding/step-1-profile')` for non-tutors (or let the root guard handle it by setting `pendingStudentOnboarding: true` before navigating anywhere).
**Warning signs:** App navigates to goal-selection then immediately back-flashes to onboarding.

### Pitfall 2: `onboarding_complete` check races with session initialization
**What goes wrong:** `initializeAuthListener` fetches the user session and then sets `isLoading = false`. If the root guard fires before `pendingStudentOnboarding` is resolved (i.e., the `student_profiles` fetch hasn't returned yet), the guard sees `pendingStudentOnboarding = false` and routes to `/(tabs)` prematurely.
**Why it happens:** `initializeAuthListener` doesn't await any profile fetch; it's fire-and-forget for the auth state.
**How to avoid:** Keep `isLoading = true` until both the session AND the onboarding check are resolved. Add a second `setLoading(false)` call after the profile fetch completes. OR use a separate `isOnboardingChecked: boolean` flag so the root guard waits on it. [ASSUMED — pattern not yet established in this codebase; matches Zustand usage elsewhere]
**Warning signs:** On app launch for incomplete-onboarding user, app flashes home screen briefly before redirecting to onboarding.

### Pitfall 3: `maybeSingle()` vs `single()` for new users without a student_profiles row
**What goes wrong:** Calling `.single()` on `student_profiles` for a brand-new user (no row yet) throws a `PGRST116` error — "JSON object requested, multiple (or no) rows returned."
**Why it happens:** `single()` expects exactly one row. New users have no `student_profiles` row until Screen 1 of onboarding saves.
**How to avoid:** Use `.maybeSingle()` which returns `null` instead of an error when no row exists. Check: `if (data === null) → pendingStudentOnboarding = true`.
**Warning signs:** App crashes at startup for freshly signed-up users.

### Pitfall 4: Image upload without Storage bucket
**What goes wrong:** Uploading profile photos to Supabase Storage fails with "bucket not found" if no `avatars` bucket exists.
**Why it happens:** The existing `classroom-assets` bucket (Phase 4) is for classroom content — profile photos need a separate bucket or can share it under a different path prefix.
**How to avoid:** Create an `avatars` bucket in the migration (or via the Supabase dashboard). Set it to public or generate signed URLs as needed. Profile photos are typically public-readable (no signed URLs needed). [ASSUMED — standard Supabase pattern]
**Warning signs:** `StorageApiError: The resource was not found` on upload.

### Pitfall 5: Tag filtering with empty `tagIds` array
**What goes wrong:** If a student skips tag selection (or has zero tags), passing `tagIds = []` to Supabase `.in('...', [])` returns zero classrooms — the marketplace appears empty.
**Why it happens:** Supabase `.in('col', [])` evaluates as `WHERE col IN ()` which always returns false.
**How to avoid:** In `useAllClassrooms`, when `tagIds` is empty or undefined, skip the tag filter and return all classrooms (unfiltered browse mode).
**Warning signs:** Marketplace shows "No classrooms" for students with no tags set.

---

## Code Examples

Verified patterns from codebase:

### Auth store Zustand flag pattern (mirrors pendingTutorOnboarding)
```typescript
// Source: src/features/auth/useAuthStore.ts [VERIFIED: codebase read]
// Add alongside pendingTutorOnboarding:
pendingStudentOnboarding: boolean;
setPendingStudentOnboarding: (pending: boolean) => void;
```

### expo-image-picker usage (established pattern)
```typescript
// Source: src/features/classroom/AddCardBottomSheet.tsx [VERIFIED: codebase read]
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'],
  quality: 0.8,
});
if (result.canceled || !result.assets?.[0]) return;
const asset = result.assets[0];
// asset.uri, asset.fileName, asset.mimeType available
```

### TanStack Query hook structure (established pattern)
```typescript
// Source: src/features/study/useProfile.ts [VERIFIED: codebase read]
export function useSubjectTags() {
  return useQuery({
    queryKey: ['subject_tags'],
    queryFn: async () => {
      const { data } = await supabase
        .from('subject_tags')
        .select('id, name, slug')
        .order('name')
        .throwOnError();
      return data ?? [];
    },
  });
}
```

### Button component interface (existing)
```typescript
// Source: src/features/ui/Button.tsx [VERIFIED: codebase read]
// Button takes `title` prop (not children) — critical to match
<Button title="Continue" onPress={handleNext} variant="primary" />
```

### Theme tokens for bubble UI
```typescript
// Source: src/features/ui/theme.ts [VERIFIED: codebase read]
// Selected bubble: backgroundColor: COLORS.accent, text: COLORS.textOnAccent
// Unselected bubble: backgroundColor: COLORS.surface, borderColor: COLORS.border, text: COLORS.text
// Border radius for chips: RADII.button (12) — matches existing SubjectTagInput chips
```

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `upsert` with `onConflict: 'id'` is the right pattern for progressive profile saves | Architecture Patterns Pattern 4 | Low — upsert is standard Supabase JS; confirmed approach works for 1-to-1 tables |
| A2 | Profile photos should go in a new `avatars` bucket (public) rather than `classroom-assets` | Common Pitfalls Pitfall 4 | Low — if bucket naming differs, only the bucket name changes |
| A3 | `.in('col', [])` returns no rows in Supabase (empty array guard needed) | Common Pitfalls Pitfall 5 | Low — this is documented Supabase/PostgREST behavior |
| A4 | `is_tutor` check should gate student onboarding (tutors skip it) | Architecture Patterns Pattern 2 | Medium — if tutors also need student onboarding, the guard logic needs updating. Confirm with user. |
| A5 | `handle_new_user()` trigger should NOT auto-create `student_profiles` row (leave null until Screen 1) | DB Schema | Medium — auto-creating an empty row changes the `maybeSingle()` → `null` detection. Either approach works but must be consistent. |
| A6 | University/campus list is hardcoded for MVP (no DB table) | Architecture Patterns, ONBD-03 | Low — if the list grows, extract to a table in v2. For MVP with NWU Potchefstroom as the only target, hardcoded is fine. |

---

## Open Questions

1. **Does `goal-selection.tsx` get removed or repurposed?**
   - What we know: It currently receives non-tutor sign-ups. Phase 7 student onboarding replaces this function.
   - What's unclear: Whether the daily goal concept (chill/steady/focused) should be folded into onboarding or dropped entirely given the pivot away from the quiz engine.
   - Recommendation: Drop `goal-selection` from the sign-up redirect path. The screen can remain dormant in the codebase — don't delete files that might have dependencies.

2. **Do tutors need to go through student onboarding?**
   - What we know: Tutors also have accounts and could browse classrooms as students.
   - What's unclear: Whether the product intent is for tutors to only have a tutor experience, or dual-mode.
   - Recommendation: For MVP, tutors skip student onboarding entirely (`is_tutor = true` → bypass). This matches the current pattern where `pendingTutorOnboarding` is mutually exclusive with the tabs route.

3. **Seed subject tags — how?**
   - What we know: `subject_tags` starts empty. The only active tutor (Sharone) has subjects in `classrooms.subjects[]`.
   - What's unclear: Whether this seeding should be in a migration SQL file or done manually via Supabase dashboard.
   - Recommendation: Include a seeding step in the migration that extracts distinct values from `classrooms.subjects` into `subject_tags` and populates `classroom_subject_tags` accordingly. This makes the plan self-contained.

---

## Environment Availability

Step 2.6: No new external services required. `@react-native-community/datetimepicker` is a native module installed via `npx expo install` — no external service dependency.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| expo-image-picker | ONBD-02 (profile photo) | Yes | ~17.0.10 | — |
| Supabase Storage | ONBD-02 (photo upload) | Yes | existing project | — |
| @react-native-community/datetimepicker | ONBD-07 (test date) | No (not in package.json) | — | TextInput with date string (worse UX) |

**Missing dependencies with fallback:**
- `@react-native-community/datetimepicker`: Not installed. Install via `npx expo install @react-native-community/datetimepicker` as Wave 0 task. Fallback (TextInput) is technically viable but provides poor mobile UX for date entry.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo + @testing-library/react-native |
| Config file | package.json (`"test": "jest"`) |
| Quick run command | `npx jest --testPathPattern=onboarding` |
| Full suite command | `npx jest` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ONBD-01 | Root guard routes new student to onboarding when `onboarding_complete = false` | unit | `npx jest --testPathPattern=useAuthStore` | No — Wave 0 |
| ONBD-02 | Screen 1 saves first_name, last_name; photo optional | unit | `npx jest --testPathPattern=step-1-profile` | No — Wave 0 |
| ONBD-03 | Screen 2 renders university list, stores selection | unit | `npx jest --testPathPattern=step-2-university` | No — Wave 0 |
| ONBD-04 | Screen 3 stores degree and year | unit | `npx jest --testPathPattern=step-3-degree` | No — Wave 0 |
| ONBD-05 | Screen 4 renders tag bubbles from subject_tags query | unit | `npx jest --testPathPattern=step-4-subjects` | No — Wave 0 |
| ONBD-06 | Screen 5 multi-select stores help_types | unit | `npx jest --testPathPattern=step-5-help-type` | No — Wave 0 |
| ONBD-07 | Screen 6 is skippable; date stored when set | unit | `npx jest --testPathPattern=step-6-test-date` | No — Wave 0 |
| ONBD-08 | useAllClassrooms filters by student tag IDs | unit | `npx jest --testPathPattern=useAllClassrooms` | No — Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern=onboarding`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/features/onboarding/__tests__/useStudentProfile.test.ts` — covers ONBD-01, ONBD-02
- [ ] `src/features/onboarding/__tests__/useSubjectTags.test.ts` — covers ONBD-05
- [ ] `src/features/student/__tests__/useAllClassrooms.test.ts` — covers ONBD-08 (tag filter branch)
- [ ] Test stubs for all 6 screen components (can use `it.todo()` pattern from Phase 4)

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No — auth is Phase 1, unchanged | — |
| V3 Session Management | No — session handling unchanged | — |
| V4 Access Control | Yes — student_profiles RLS | Supabase RLS `id = (SELECT auth.uid())` pattern |
| V5 Input Validation | Yes — first_name, last_name, degree inputs | Trim + length check on save; no SQL injection risk via parameterised Supabase client |
| V6 Cryptography | No | — |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Student reads another student's profile | Information Disclosure | RLS `id = auth.uid()` on `student_profiles` — enforced at DB layer |
| Student writes to another student's subject tags | Tampering | RLS `student_id = auth.uid()` on `student_subject_tags` |
| Photo URL pointing to another user's avatar | Information Disclosure | Avatars bucket public — acceptable for profile photos; no signed URLs needed |

---

## Sources

### Primary (HIGH confidence)
- `src/features/auth/useAuthStore.ts` — Zustand flag pattern for `pendingTutorOnboarding` [VERIFIED: codebase read]
- `src/app/_layout.tsx` — root guard logic [VERIFIED: codebase read]
- `src/app/(auth)/sign-up.tsx` — sign-up redirect flow [VERIFIED: codebase read]
- `src/features/ui/theme.ts` — COLORS, RADII, SPACING tokens [VERIFIED: codebase read]
- `src/features/ui/Button.tsx` — Button interface uses `title` prop [VERIFIED: codebase read]
- `src/features/tutor/SubjectTagInput.tsx` — chip UI pattern [VERIFIED: codebase read]
- `src/features/classroom/AddCardBottomSheet.tsx` — expo-image-picker usage [VERIFIED: codebase read]
- `supabase/migrations/00005_tutor_tables.sql` — RLS and table split pattern [VERIFIED: codebase read]
- `supabase/migrations/00007_subscriptions.sql` — junction table and TEXT CHECK constraint pattern [VERIFIED: codebase read]
- `package.json` — installed package versions [VERIFIED: codebase read]

### Secondary (MEDIUM confidence)
- Supabase `.maybeSingle()` behaviour — returns null when no row exists (documented Supabase JS API) [ASSUMED — matches documented PostgREST behaviour]
- `.in('col', [])` returning no rows — documented PostgREST behaviour [ASSUMED]

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in package.json; one new install identified
- Architecture: HIGH — all patterns directly mirror existing Phase 3/4/5 code verified in codebase
- DB schema: HIGH — mirrors established migration patterns; RLS patterns copied from existing migrations
- Pitfalls: HIGH — most identified by reading actual code paths (sign-up.tsx, _layout.tsx, useAuthStore.ts)

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable stack — 30 day window)
