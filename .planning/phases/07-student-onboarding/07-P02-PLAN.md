---
phase: 07-student-onboarding
plan: P02
type: execute
wave: 2
depends_on:
  - P01
files_modified:
  - src/features/onboarding/universities.ts
  - src/features/onboarding/helpTypes.ts
  - src/features/onboarding/OnboardingProgress.tsx
  - src/features/onboarding/TagBubbleSelect.tsx
  - src/app/(auth)/onboarding/_layout.tsx
  - src/app/(auth)/onboarding/step-1-profile.tsx
  - src/app/(auth)/onboarding/step-2-university.tsx
  - src/app/(auth)/onboarding/step-3-degree.tsx
  - src/app/(auth)/onboarding/step-4-subjects.tsx
  - src/app/(auth)/onboarding/step-5-help-type.tsx
  - src/app/(auth)/onboarding/step-6-test-date.tsx
  - src/app/(auth)/_layout.tsx
  - src/app/(auth)/sign-up.tsx
  - src/app/_layout.tsx
autonomous: true
requirements:
  - ONBD-01
  - ONBD-02
  - ONBD-03
  - ONBD-04
  - ONBD-05
  - ONBD-06
  - ONBD-07
  - ONBD-08

must_haves:
  truths:
    - "A newly signed-up non-tutor student lands on step-1-profile, not goal-selection or tabs"
    - "Student can enter first name, surname, and optionally pick a profile photo on step 1"
    - "Student can select university and campus from a hardcoded list on step 2"
    - "Student can enter degree and select year of study on step 3"
    - "Student can multi-select subject tags (bubble UI) from the subject_tags table on step 4"
    - "Student can multi-select help types on step 5"
    - "Student can optionally pick an upcoming test date on step 6 or skip"
    - "After completing step 6, onboarding_complete is set to true and student lands on tabs"
    - "Returning students who completed onboarding bypass the flow entirely"
    - "Tutors bypass student onboarding entirely"
  artifacts:
    - path: "src/app/(auth)/onboarding/_layout.tsx"
      provides: "Stack navigator for 6 onboarding screens"
      contains: "Stack"
    - path: "src/app/(auth)/onboarding/step-1-profile.tsx"
      provides: "Name + photo screen (ONBD-02)"
      contains: "first_name"
    - path: "src/app/(auth)/onboarding/step-4-subjects.tsx"
      provides: "Tag bubble multi-select screen (ONBD-05)"
      contains: "TagBubbleSelect"
    - path: "src/app/(auth)/onboarding/step-6-test-date.tsx"
      provides: "Optional date picker + finish (ONBD-07)"
      contains: "onboarding_complete"
    - path: "src/features/onboarding/TagBubbleSelect.tsx"
      provides: "Reusable multi-select bubble component"
      contains: "TouchableOpacity"
    - path: "src/app/_layout.tsx"
      provides: "Root guard extended with pendingStudentOnboarding"
      contains: "pendingStudentOnboarding"
  key_links:
    - from: "src/app/(auth)/sign-up.tsx"
      to: "src/app/(auth)/onboarding/step-1-profile.tsx"
      via: "router.replace for non-tutors"
      pattern: "onboarding/step-1-profile"
    - from: "src/app/_layout.tsx"
      to: "src/app/(auth)/onboarding/step-1-profile.tsx"
      via: "root guard redirect when pendingStudentOnboarding is true"
      pattern: "pendingStudentOnboarding"
    - from: "src/app/(auth)/onboarding/step-6-test-date.tsx"
      to: "src/features/onboarding/useUpsertStudentProfile.ts"
      via: "sets onboarding_complete: true then router.replace('/(tabs)')"
      pattern: "onboarding_complete.*true"
---

<objective>
Build all 6 onboarding UI screens, shared components, and wire the navigation guard so new students flow through onboarding before reaching the marketplace.

Purpose: This is the core user-facing deliverable of Phase 7. Every screen collects a slice of the student profile, saves it progressively via the hooks from P01, and the final screen completes onboarding. The root guard and sign-up redirect ensure the flow is mandatory for non-tutors.

Output: 6 screen files, 4 shared component/constant files, updated auth layout, updated sign-up redirect, updated root guard.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/07-student-onboarding/07-RESEARCH.md
@.planning/phases/07-student-onboarding/07-P00-SUMMARY.md
@.planning/phases/07-student-onboarding/07-P01-SUMMARY.md

<interfaces>
From src/features/onboarding/useSubjectTags.ts (P01):
```typescript
export function useSubjectTags(): UseQueryResult<{ id: string; name: string; slug: string }[]>;
```

From src/features/onboarding/useStudentProfile.ts (P01):
```typescript
export function useStudentProfile(): UseQueryResult<StudentProfileRow | null>;
```

From src/features/onboarding/useUpsertStudentProfile.ts (P01):
```typescript
export function useUpsertStudentProfile(): UseMutationResult<StudentProfileRow, Error, Partial<Omit<StudentProfileInsert, 'id'>>>;
```

From src/features/onboarding/useStudentSubjectTags.ts (P01):
```typescript
export function useStudentSubjectTags(): UseQueryResult<string[]>; // tag IDs
export function useSaveStudentSubjectTags(): UseMutationResult<void, Error, string[]>;
```

From src/features/auth/useAuthStore.ts (P01):
```typescript
pendingStudentOnboarding: boolean;
setPendingStudentOnboarding: (pending: boolean) => void;
```

From src/features/ui/theme.ts:
```typescript
export const COLORS = { background, surface, accent, text, textMuted, textOnAccent, border, error, success };
export const RADII = { button: 12, card: 16, modal: 24 };
export const SPACING = { xs: 8, sm: 12, md: 16, lg: 24, xl: 32 };
```

From src/features/ui/Button.tsx:
```typescript
// Button takes `title` prop (not children), `onPress`, `variant` ("primary" | "secondary")
<Button title="Continue" onPress={handleNext} variant="primary" />
```

From src/app/(auth)/_layout.tsx:
```typescript
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="goal-selection" />
      <Stack.Screen name="create-classroom" />
    </Stack>
  );
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create shared components and constants (universities, helpTypes, OnboardingProgress, TagBubbleSelect) + install datetimepicker</name>
  <files>
    src/features/onboarding/universities.ts
    src/features/onboarding/helpTypes.ts
    src/features/onboarding/OnboardingProgress.tsx
    src/features/onboarding/TagBubbleSelect.tsx
  </files>
  <read_first>
    - src/features/ui/theme.ts -- COLORS, RADII, SPACING tokens
    - src/features/tutor/SubjectTagInput.tsx -- existing chip UI pattern for reference
    - package.json -- confirm @react-native-community/datetimepicker is not yet installed
  </read_first>
  <action>
**0. Install datetimepicker**

Run:
```bash
npx expo install @react-native-community/datetimepicker
```

**1. Create src/features/onboarding/universities.ts**

Hardcoded list for MVP (NWU Potchefstroom is the primary target). Define as a single constant — all Screen 2 imports come from here.

```typescript
export interface UniversityOption {
  university: string;
  campuses: string[];
}

export const UNIVERSITIES: UniversityOption[] = [
  {
    university: 'North-West University',
    campuses: ['Potchefstroom', 'Mahikeng', 'Vanderbijlpark'],
  },
  {
    university: 'University of Pretoria',
    campuses: ['Hatfield', 'Groenkloof', 'Mamelodi', 'Onderstepoort', 'Prinshof'],
  },
  {
    university: 'Stellenbosch University',
    campuses: ['Stellenbosch', 'Tygerberg', 'Bellville Park'],
  },
  {
    university: 'University of Cape Town',
    campuses: ['Upper Campus', 'Medical School', 'Hiddingh'],
  },
  {
    university: 'University of the Witwatersrand',
    campuses: ['Braamfontein', 'Parktown', 'Education Campus'],
  },
  {
    university: 'University of KwaZulu-Natal',
    campuses: ['Howard College', 'Westville', 'Pietermaritzburg', 'Medical School'],
  },
  {
    university: 'University of the Free State',
    campuses: ['Bloemfontein', 'QwaQwa', 'South Campus'],
  },
  {
    university: 'University of Johannesburg',
    campuses: ['Auckland Park', 'Doornfontein', 'Soweto'],
  },
];
```

**2. Create src/features/onboarding/helpTypes.ts**

```typescript
export interface HelpTypeOption {
  id: string;
  label: string;
}

export const HELP_TYPES: HelpTypeOption[] = [
  { id: 'understanding', label: 'Understanding content' },
  { id: 'test-prep', label: 'Test preparation' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'exam-prep', label: 'Exam preparation' },
  { id: 'practical-skills', label: 'Practical skills' },
];
```

**3. Create src/features/onboarding/OnboardingProgress.tsx**

Simple step dots — 10 lines of UI. Shows which step the user is on.

```typescript
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '@/features/ui/theme';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, i + 1 <= currentStep && styles.dotActive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.xs, marginBottom: SPACING.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.accent },
});
```

**4. Create src/features/onboarding/TagBubbleSelect.tsx**

Reusable multi-select bubble component for Screen 4 (subject tags) and Screen 5 (help types).

```typescript
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';

interface TagBubbleSelectProps {
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function TagBubbleSelect({ options, selected, onToggle }: TagBubbleSelectProps) {
  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt.id);
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => onToggle(opt.id)}
            style={[styles.bubble, isSelected && styles.bubbleSelected]}
            activeOpacity={0.7}
          >
            <Text style={[styles.text, isSelected && styles.textSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  bubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.button,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  text: { fontSize: 14, color: COLORS.text },
  textSelected: { color: COLORS.textOnAccent },
});
```
  </action>
  <verify>
    <automated>ls "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/onboarding/universities.ts" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/onboarding/helpTypes.ts" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/onboarding/OnboardingProgress.tsx" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/onboarding/TagBubbleSelect.tsx" 2>&1</automated>
    Expect: All 4 files listed.

    <automated>grep "@react-native-community/datetimepicker" "/Users/johanduplessis/Desktop/Claude Code/Druip/package.json"</automated>
    Expect: 1 match (package installed).
  </verify>
  <done>
    - universities.ts exports UNIVERSITIES array with SA universities and campuses
    - helpTypes.ts exports HELP_TYPES array with 5 help type options
    - OnboardingProgress.tsx renders step dots using COLORS from theme.ts
    - TagBubbleSelect.tsx renders tappable bubble chips with selected/unselected states
    - @react-native-community/datetimepicker installed via npx expo install
  </done>
</task>

<task type="auto">
  <name>Task 2: Create 6 onboarding screens + onboarding layout + update auth layout, sign-up redirect, and root guard</name>
  <files>
    src/app/(auth)/onboarding/_layout.tsx
    src/app/(auth)/onboarding/step-1-profile.tsx
    src/app/(auth)/onboarding/step-2-university.tsx
    src/app/(auth)/onboarding/step-3-degree.tsx
    src/app/(auth)/onboarding/step-4-subjects.tsx
    src/app/(auth)/onboarding/step-5-help-type.tsx
    src/app/(auth)/onboarding/step-6-test-date.tsx
    src/app/(auth)/_layout.tsx
    src/app/(auth)/sign-up.tsx
    src/app/_layout.tsx
  </files>
  <read_first>
    - src/app/(auth)/_layout.tsx -- current auth Stack screens to add onboarding route
    - src/app/(auth)/sign-up.tsx -- find the non-tutor branch (line ~55: router.replace goal-selection)
    - src/app/_layout.tsx -- current root guard logic (lines 30-38)
    - src/app/(auth)/create-classroom.tsx -- reference screen pattern for onboarding screens (same stack)
    - src/features/ui/Button.tsx -- confirm Button takes title prop
    - src/features/onboarding/useUpsertStudentProfile.ts -- mutation hook interface (from P01)
    - src/features/onboarding/useSubjectTags.ts -- query hook interface (from P01)
    - src/features/onboarding/useStudentSubjectTags.ts -- save mutation interface (from P01)
  </read_first>
  <action>
**1. Create src/app/(auth)/onboarding/_layout.tsx**

```typescript
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="step-1-profile" />
      <Stack.Screen name="step-2-university" />
      <Stack.Screen name="step-3-degree" />
      <Stack.Screen name="step-4-subjects" />
      <Stack.Screen name="step-5-help-type" />
      <Stack.Screen name="step-6-test-date" />
    </Stack>
  );
}
```

**2. Create src/app/(auth)/onboarding/step-1-profile.tsx** (ONBD-02)

Screen collects first_name, last_name, optional profile photo. Uses expo-image-picker for photo (pattern from AddCardBottomSheet). Saves via useUpsertStudentProfile, then navigates to step-2.

- Two TextInput fields: first_name (required), last_name (required)
- TouchableOpacity for photo picker showing a circle placeholder or selected image
- Photo upload: use expo-image-picker launchImageLibraryAsync with mediaTypes: ['images'], quality: 0.8
- If photo selected, upload to Supabase Storage bucket 'avatars' at path `{userId}/profile.jpg`
- Get public URL via supabase.storage.from('avatars').getPublicUrl()
- On "Continue": call upsertStudentProfile.mutateAsync({ first_name, last_name, photo_url })
- Then router.push('/(auth)/onboarding/step-2-university')
- Continue button disabled when first_name or last_name is empty
- Use OnboardingProgress component with currentStep=1, totalSteps=6
- Style: SafeAreaView, KeyboardAvoidingView, same spacing/color pattern as sign-up.tsx

**3. Create src/app/(auth)/onboarding/step-2-university.tsx** (ONBD-03)

- Import UNIVERSITIES from src/features/onboarding/universities.ts
- University selection: ScrollView with TouchableOpacity list items (highlighted when selected)
- When a university is selected, show its campuses as a second list below
- On "Continue": call upsertStudentProfile.mutateAsync({ university, campus })
- Then router.push('/(auth)/onboarding/step-3-degree')
- Continue button disabled when university or campus not selected
- Use OnboardingProgress currentStep=2

**4. Create src/app/(auth)/onboarding/step-3-degree.tsx** (ONBD-04)

- TextInput for degree/programme name (free text, required)
- Year of study picker: row of 6 touchable number bubbles (1-6), selected one gets accent background
- On "Continue": call upsertStudentProfile.mutateAsync({ degree, year_of_study })
- Then router.push('/(auth)/onboarding/step-4-subjects')
- Continue button disabled when degree empty or year not selected
- Use OnboardingProgress currentStep=3

**5. Create src/app/(auth)/onboarding/step-4-subjects.tsx** (ONBD-05)

- Fetch tags via useSubjectTags() hook
- Map tags to TagBubbleSelect options: { id: tag.id, label: tag.name }
- Local state: useState<string[]>([]) for selected tag IDs
- Use TagBubbleSelect component with toggle handler
- On "Continue": call useSaveStudentSubjectTags().mutateAsync(selectedTagIds)
- Then router.push('/(auth)/onboarding/step-5-help-type')
- Continue button disabled when no tags selected (at least 1 required)
- Show loading state while useSubjectTags is loading
- Use OnboardingProgress currentStep=4

**6. Create src/app/(auth)/onboarding/step-5-help-type.tsx** (ONBD-06)

- Import HELP_TYPES from src/features/onboarding/helpTypes.ts
- Use TagBubbleSelect with options mapped from HELP_TYPES
- Local state: useState<string[]>([]) for selected help type IDs
- On "Continue": call upsertStudentProfile.mutateAsync({ help_types: selectedHelpTypes })
- Then router.push('/(auth)/onboarding/step-6-test-date')
- Continue button disabled when no help types selected (at least 1 required)
- Use OnboardingProgress currentStep=5

**7. Create src/app/(auth)/onboarding/step-6-test-date.tsx** (ONBD-07)

- Import DateTimePicker from @react-native-community/datetimepicker
- Optional date picker — user can set a date or skip
- "Skip" button at top right or below date picker — skips straight to completion
- If date selected, show formatted date and a "Clear" option
- On "Finish" or "Skip":
  ```typescript
  await upsertStudentProfile.mutateAsync({
    upcoming_test_date: testDate ? testDate.toISOString().split('T')[0] : null,
    onboarding_complete: true,
  });
  useAuthStore.getState().setPendingStudentOnboarding(false);
  router.replace('/(tabs)');
  ```
- CRITICAL: Set onboarding_complete: true AND setPendingStudentOnboarding(false) — both are needed
- Use OnboardingProgress currentStep=6

**8. Update src/app/(auth)/_layout.tsx**

Add the onboarding route group to the Stack:
```typescript
<Stack.Screen name="onboarding" />
```

Add it after the existing screens (sign-in, sign-up, goal-selection, create-classroom).

**9. Update src/app/(auth)/sign-up.tsx**

Change the non-tutor branch (the `else` block after `} else if (isTutor) {`):

FROM:
```typescript
router.replace('/(auth)/goal-selection');
```

TO:
```typescript
// Set pending student onboarding so root guard keeps user in auth flow
useAuthStore.getState().setPendingStudentOnboarding(true);
router.replace('/(auth)/onboarding/step-1-profile');
```

Also set the session if available (like the tutor branch does):
```typescript
if (signUpData.session) {
  useAuthStore.getState().setSession(signUpData.session);
}
```

**10. Update src/app/_layout.tsx**

Extend the root guard to handle pendingStudentOnboarding. Read pendingStudentOnboarding from useAuthStore:

```typescript
const pendingStudentOnboarding = useAuthStore((s) => s.pendingStudentOnboarding);
```

Add pendingStudentOnboarding to the dependency array of the routing useEffect.

Update the guard logic:
```typescript
useEffect(() => {
  if (isLoading) return;
  const inTabs = segments[0] === '(tabs)';
  const inAuth = segments[0] === '(auth)';

  if (session && !inTabs && !pendingTutorOnboarding && !pendingStudentOnboarding) {
    router.replace('/(tabs)');
  } else if (session && pendingStudentOnboarding && !inAuth) {
    router.replace('/(auth)/onboarding/step-1-profile');
  } else if (!session && inTabs) {
    router.replace('/');
  }
}, [session, isLoading, segments, pendingTutorOnboarding, pendingStudentOnboarding]);
```

CRITICAL: The `pendingStudentOnboarding && !inAuth` check prevents redirect loops — if the user IS already in (auth)/onboarding, don't redirect again. The `!inTabs && !pendingStudentOnboarding` in the first condition prevents routing to tabs when onboarding is pending.
  </action>
  <verify>
    <automated>ls "/Users/johanduplessis/Desktop/Claude Code/Druip/src/app/(auth)/onboarding/step-1-profile.tsx" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/app/(auth)/onboarding/step-6-test-date.tsx" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/app/(auth)/onboarding/_layout.tsx" 2>&1</automated>
    Expect: All 3 files listed.

    <automated>grep -c "pendingStudentOnboarding" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/app/_layout.tsx"</automated>
    Expect: At least 3 (selector, guard condition, dependency array).

    <automated>grep "onboarding/step-1-profile" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/app/(auth)/sign-up.tsx"</automated>
    Expect: 1 match (the redirect).

    <automated>grep "onboarding_complete.*true" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/app/(auth)/onboarding/step-6-test-date.tsx"</automated>
    Expect: 1 match.
  </verify>
  <done>
    - 6 onboarding screens exist in src/app/(auth)/onboarding/
    - Onboarding layout registered in (auth) Stack
    - sign-up.tsx redirects non-tutors to onboarding/step-1-profile (not goal-selection)
    - Root guard blocks tabs when pendingStudentOnboarding is true
    - Root guard redirects to onboarding when session exists + pendingStudentOnboarding
    - step-6-test-date sets onboarding_complete: true and clears pendingStudentOnboarding flag
    - Each screen uses OnboardingProgress to show step position
    - Each screen saves its fields via useUpsertStudentProfile before navigating forward
    - step-4-subjects uses TagBubbleSelect + useSubjectTags + useSaveStudentSubjectTags
    - step-5-help-type uses TagBubbleSelect + HELP_TYPES
    - step-6-test-date uses @react-native-community/datetimepicker
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client -> student_profiles | All writes go through upsert hook; RLS enforces id = auth.uid() |
| client -> Supabase Storage (avatars) | Photo upload to user-scoped path |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-07-09 | Spoofing | step-1-profile photo upload | mitigate | Upload path includes userId: `{userId}/profile.jpg` — other users cannot overwrite |
| T-07-10 | Tampering | sign-up.tsx redirect | accept | Client-side redirect is convenience; server-side RLS is the real gate. Even if user bypasses client redirect, they cannot access other students' data. |
| T-07-11 | Denial of Service | TagBubbleSelect | accept | Tag list is bounded by subject_tags table size (< 100 for MVP); no infinite scroll concern |
| T-07-12 | Input Validation | step-1-profile, step-3-degree | mitigate | first_name/last_name trimmed before save; degree trimmed; year_of_study constrained to 1-6 in UI + CHECK constraint in DB |
</threat_model>

<verification>
After both tasks:
1. All 6 onboarding screens exist in src/app/(auth)/onboarding/
2. (auth)/_layout.tsx includes onboarding route
3. sign-up.tsx non-tutor branch redirects to onboarding (not goal-selection)
4. _layout.tsx root guard includes pendingStudentOnboarding check
5. step-6-test-date sets onboarding_complete: true
6. @react-native-community/datetimepicker is in package.json
</verification>

<success_criteria>
- Complete 6-screen onboarding flow navigable from step 1 to step 6
- Each screen saves its data and navigates forward
- Final screen completes onboarding and routes to tabs
- Root guard prevents tabs access during onboarding
- Tutors are unaffected (pendingTutorOnboarding path unchanged)
- Photo upload, tag selection, date picker all functional
</success_criteria>

<output>
After completion, create `.planning/phases/07-student-onboarding/07-P02-SUMMARY.md`
</output>
