---
phase: 05-student-discovery-and-subscriptions
plan: P03
type: execute
wave: 2
depends_on:
  - 05-P01
  - 05-P02
files_modified:
  - src/app/(tabs)/index.tsx
  - src/app/(tabs)/classroom-detail.tsx
  - src/app/(tabs)/subscribe-confirm.tsx
autonomous: true
requirements:
  - DISC-01
  - DISC-02
  - DISC-03
  - DISC-04
  - SUB-01
  - SUB-02
  - SUB-03

must_haves:
  truths:
    - "Home tab shows 'Your Classrooms' section (when subscribed) above 'Browse Classrooms' list"
    - "Tapping a ClassroomCard navigates to classroom detail screen"
    - "Non-subscriber sees section names with lock icon and a Subscribe CTA showing the price"
    - "Subscribed student sees sections unlocked and the 'You're subscribed' indicator"
    - "Tapping Subscribe CTA navigates to subscribe-confirm screen"
    - "Confirming subscription writes to Supabase and returns to detail screen showing unlocked content"
    - "Cancelling on confirm screen navigates back without writing anything"
  artifacts:
    - path: "src/app/(tabs)/index.tsx"
      provides: "Home/Discovery screen — replaces placeholder"
      contains: "useAllClassrooms"
    - path: "src/app/(tabs)/classroom-detail.tsx"
      provides: "Classroom detail with locked/unlocked content"
      contains: "useClassroomDetail"
    - path: "src/app/(tabs)/subscribe-confirm.tsx"
      provides: "Subscription confirmation screen"
      contains: "useSubscribe"
  key_links:
    - from: "src/app/(tabs)/index.tsx"
      to: "src/features/student/useAllClassrooms.ts"
      via: "import { useAllClassrooms }"
      pattern: "useAllClassrooms"
    - from: "src/app/(tabs)/classroom-detail.tsx"
      to: "src/features/student/useClassroomDetail.ts"
      via: "import { useClassroomDetail }"
      pattern: "useClassroomDetail"
    - from: "src/app/(tabs)/subscribe-confirm.tsx"
      to: "src/features/student/useSubscribe.ts"
      via: "import { useSubscribe }"
      pattern: "useSubscribe"
    - from: "src/app/(tabs)/classroom-detail.tsx"
      to: "src/features/student/useMySubscriptions.ts"
      via: "isSubscribed = subscriptions.some(s => s.classroom_id === id && s.status === 'active')"
      pattern: "isSubscribed"
---

<objective>
Build the three screens that deliver the complete student discovery and subscription flow.

Purpose: This is the visible layer of Phase 5. All screens are thin — they import hooks from P01 and components from P02 and render. No Supabase calls in screen files.

Output: index.tsx (discovery), classroom-detail.tsx, subscribe-confirm.tsx.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/05-student-discovery-and-subscriptions/05-CONTEXT.md
@.planning/phases/05-student-discovery-and-subscriptions/05-UI-SPEC.md
@.planning/phases/05-student-discovery-and-subscriptions/05-P01-SUMMARY.md
@.planning/phases/05-student-discovery-and-subscriptions/05-P02-SUMMARY.md

<interfaces>
<!-- Hooks available from P01 -->
```typescript
// useAllClassrooms() → { data: ClassroomWithTutor[], isLoading, isError }
// ClassroomWithTutor = ClassroomRow & { tutors: { user_id: string; profiles: { email: string } } }

// useClassroomDetail(classroomId: string | undefined)
// → { data: ClassroomDetail, isLoading, isError }
// ClassroomDetail = ClassroomRow & { classroom_sections: SectionRow[] }

// useMySubscriptions() → { data: SubscriptionRow[] }
// SubscriptionRow = { id, student_id, classroom_id, subscribed_at, status: 'active'|'cancelled' }

// useSubscribe() → mutation object: { mutate, isPending, isError }
// mutate({ classroomId: string })
```

<!-- Components from P02 -->
```typescript
// ClassroomCard: { id, name, tutorEmail, subjects, bio, priceCents } — navigates to detail
// LockedContentOverlay: { sectionName } — renders lock icon + muted section name
```

<!-- Theme tokens (no hardcoded values) -->
```typescript
COLORS.background, COLORS.surface, COLORS.accent, COLORS.text, COLORS.textMuted,
COLORS.border, COLORS.success
SPACING.xs (8), SPACING.sm (12), SPACING.md (16), SPACING.lg (24), SPACING.xl (32)
RADII.button (12), RADII.card (16)
```

<!-- Navigation pattern from manage-classroom.tsx -->
```typescript
import { router, useLocalSearchParams } from 'expo-router';
router.push(`/(tabs)/classroom-detail?id=${classroomId}`);
router.back();
const { id } = useLocalSearchParams<{ id: string }>();
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Home/Discovery screen (index.tsx replacement)</name>
  <files>src/app/(tabs)/index.tsx</files>
  <read_first>
    - src/app/(tabs)/index.tsx — read current file (will be fully replaced)
    - src/app/(tabs)/profile.tsx — reference for SafeAreaView + ScrollView screen structure
    - .planning/phases/05-student-discovery-and-subscriptions/05-UI-SPEC.md — Screen 1 contract (exact structure)
    - .planning/phases/05-student-discovery-and-subscriptions/05-CONTEXT.md — D-01, D-02, D-03, D-04, D-05
  </read_first>
  <action>
Replace `src/app/(tabs)/index.tsx` entirely. The current file is a placeholder — delete all existing content.

Structure (per UI-SPEC Screen 1):

```typescript
import { SafeAreaView, ScrollView, View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useAllClassrooms } from '@/features/student/useAllClassrooms';
import { useMySubscriptions } from '@/features/student/useMySubscriptions';
import { ClassroomCard } from '@/features/student/ClassroomCard';
import { COLORS, SPACING } from '@/features/ui/theme';

export default function HomeScreen() {
  const { data: classrooms = [], isLoading, isError } = useAllClassrooms();
  const { data: subscriptions = [] } = useMySubscriptions();

  // Compute subscribed and unsubscribed classroom lists
  const subscribedIds = new Set(subscriptions.filter(s => s.status === 'active').map(s => s.classroom_id));
  const subscribedClassrooms = classrooms.filter(c => subscribedIds.has(c.id));
  const browseClassrooms = classrooms.filter(c => !subscribedIds.has(c.id));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* "Your Classrooms" section — D-02, D-05 — only shown when subscriptions exist */}
        {subscribedClassrooms.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccentBar} />
              <Text style={styles.sectionLabel}>Your Classrooms</Text>
            </View>
            {subscribedClassrooms.map(c => (
              <ClassroomCard
                key={c.id}
                id={c.id}
                name={c.name}
                tutorEmail={c.tutors?.profiles?.email ?? ''}
                subjects={c.subjects}
                bio={c.bio}
                priceCents={c.price_cents}
              />
            ))}
            <View style={styles.divider} />
          </>
        )}

        {/* "Browse Classrooms" section — D-04 */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccentBar} />
          <Text style={styles.sectionLabel}>Browse Classrooms</Text>
        </View>

        {isLoading && (
          <ActivityIndicator size="large" color={COLORS.accent} style={styles.loader} />
        )}

        {isError && !isLoading && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateBody}>Couldn't load classrooms. Pull down to refresh.</Text>
          </View>
        )}

        {!isLoading && !isError && browseClassrooms.length === 0 && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateHeading}>No classrooms yet</Text>
            <Text style={styles.stateBody}>Check back soon — tutors are setting up their classrooms.</Text>
          </View>
        )}

        {!isLoading && !isError && browseClassrooms.map(c => (
          <ClassroomCard
            key={c.id}
            id={c.id}
            name={c.name}
            tutorEmail={c.tutors?.profiles?.email ?? ''}
            subjects={c.subjects}
            bio={c.bio}
            priceCents={c.price_cents}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, marginBottom: SPACING.sm },
  sectionAccentBar: { width: 4, height: 16, backgroundColor: COLORS.accent, marginRight: SPACING.xs, borderRadius: 2 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },
  loader: { marginTop: SPACING.xl },
  stateContainer: { alignItems: 'center', marginTop: SPACING.xl, paddingHorizontal: SPACING.lg },
  stateHeading: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs, textAlign: 'center' },
  stateBody: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center' },
});
```

NOTE on tutors join: `c.tutors?.profiles?.email` handles the case where the nested join returns null (e.g., FK name mismatch). If the join consistently returns null, the executor must inspect the Supabase relationship cache and adjust the select string in useAllClassrooms — this is not a screen-level fix.
  </action>
  <verify>
    <automated>grep "useAllClassrooms\|useMySubscriptions" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/app/(tabs)/index.tsx" | wc -l</automated>
    Expect: 2

    <automated>grep "Your Classrooms\|Browse Classrooms" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/app/(tabs)/index.tsx" | wc -l</automated>
    Expect: 2

    <automated>grep "#" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/app/(tabs)/index.tsx"</automated>
    Expect: 0 matches
  </verify>
  <done>
    - index.tsx imports useAllClassrooms, useMySubscriptions, ClassroomCard
    - "Your Classrooms" section renders only when subscribedClassrooms.length > 0
    - "Browse Classrooms" section always renders (with loading/error/empty states)
    - No hardcoded hex colors
  </done>
</task>

<task type="auto">
  <name>Task 2: Classroom detail screen + Subscribe confirmation screen</name>
  <files>
    src/app/(tabs)/classroom-detail.tsx
    src/app/(tabs)/subscribe-confirm.tsx
  </files>
  <read_first>
    - src/app/(tabs)/classroom-detail.tsx — check if file exists (likely does not); create fresh
    - src/app/(tabs)/subscribe-confirm.tsx — check if file exists; create fresh
    - src/app/(tabs)/profile.tsx — header with back button pattern (arrow-back, 44x44 touch target)
    - src/features/ui/Button.tsx — Button component props (variant="primary"|"ghost", onPress, disabled, children)
    - .planning/phases/05-student-discovery-and-subscriptions/05-UI-SPEC.md — Screen 2 + Screen 3 contracts
    - .planning/phases/05-student-discovery-and-subscriptions/05-CONTEXT.md — D-06, D-07, D-08, D-09, D-10, D-11, D-18
  </read_first>
  <action>
**1. Create src/app/(tabs)/classroom-detail.tsx**

Imports:
```typescript
import { SafeAreaView, ScrollView, View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useClassroomDetail } from '@/features/student/useClassroomDetail';
import { useMySubscriptions } from '@/features/student/useMySubscriptions';
import { LockedContentOverlay } from '@/features/student/LockedContentOverlay';
import { Button } from '@/features/ui/Button';
import { COLORS, SPACING, RADII } from '@/features/ui/theme';
```

Screen body:
```typescript
export default function ClassroomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: classroom, isLoading, isError } = useClassroomDetail(id);
  const { data: subscriptions = [] } = useMySubscriptions();

  // D-18: client-side subscription check
  const isSubscribed = subscriptions.some(
    (s) => s.classroom_id === id && s.status === 'active'
  );

  const priceLabel = classroom
    ? `Subscribe · R${classroom.price_cents / 100}/month`
    : 'Subscribe';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header row — back button + title */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Classroom</Text>
      </View>

      {isLoading && (
        <ActivityIndicator size="large" color={COLORS.accent} style={styles.loader} />
      )}

      {isError && !isLoading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Couldn't load this classroom. Go back and try again.</Text>
        </View>
      )}

      {classroom && !isLoading && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Classroom name */}
          <Text style={styles.classroomName}>{classroom.name}</Text>

          {/* Tutor — using tutor_id as fallback display until join is confirmed */}
          <Text style={styles.tutorName}>by {classroom.tutor_id}</Text>

          {/* Subject tags */}
          <View style={styles.tagsRow}>
            {classroom.subjects.map((subject) => (
              <View key={subject} style={styles.tag}>
                <Text style={styles.tagText}>{subject}</Text>
              </View>
            ))}
          </View>

          {/* Bio */}
          {classroom.bio ? (
            <Text style={styles.bio}>{classroom.bio}</Text>
          ) : null}

          {/* Price */}
          <Text style={styles.price}>R{classroom.price_cents / 100}/month</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Sections heading */}
          <Text style={styles.sectionsHeading}>Sections</Text>

          {/* Section list — D-07: lock icon for non-subscribers */}
          {(classroom.classroom_sections ?? []).map((section) =>
            isSubscribed ? (
              <View key={section.id} style={styles.sectionRow}>
                <Text style={styles.sectionName}>{section.name}</Text>
              </View>
            ) : (
              <LockedContentOverlay key={section.id} sectionName={section.name} />
            )
          )}

          <View style={{ height: SPACING.xl }} />

          {/* Subscribe CTA — D-08 — or subscribed indicator — D-10 */}
          {isSubscribed ? (
            <View style={styles.subscribedIndicator}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.subscribedText}>You're subscribed</Text>
            </View>
          ) : (
            <Button
              variant="primary"
              onPress={() =>
                router.push(`/(tabs)/subscribe-confirm?id=${id}&name=${encodeURIComponent(classroom.name)}&price=${classroom.price_cents}`)
              }
            >
              {priceLabel}
            </Button>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginLeft: SPACING.sm },
  loader: { marginTop: SPACING.xl },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  errorText: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center' },
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xl },
  classroomName: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  tutorName: { fontSize: 14, color: COLORS.textMuted, marginTop: SPACING.xs },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.sm },
  tag: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADII.button, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm, marginRight: SPACING.xs, marginBottom: SPACING.xs },
  tagText: { fontSize: 14, color: COLORS.textMuted },
  bio: { fontSize: 16, color: COLORS.text, marginTop: SPACING.sm, lineHeight: 24 },
  price: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginTop: SPACING.sm },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },
  sectionsHeading: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted, marginBottom: SPACING.sm },
  sectionRow: { backgroundColor: COLORS.surface, borderRadius: RADII.button, padding: SPACING.sm, marginBottom: SPACING.xs },
  sectionName: { fontSize: 14, color: COLORS.text },
  subscribedIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs },
  subscribedText: { fontSize: 14, color: COLORS.textMuted },
});
```

**2. Create src/app/(tabs)/subscribe-confirm.tsx**

This screen receives params: `id` (classroomId), `name` (classroom name), `price` (price_cents as string).

Per D-09: dedicated screen (not modal). Per D-11: calm copy, no urgency words.

```typescript
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSubscribe } from '@/features/student/useSubscribe';
import { Button } from '@/features/ui/Button';
import { COLORS, SPACING } from '@/features/ui/theme';

export default function SubscribeConfirmScreen() {
  const { id, name, price } = useLocalSearchParams<{ id: string; name: string; price: string }>();
  const mutation = useSubscribe();

  const priceCents = parseInt(price ?? '0', 10);
  const priceDisplay = `R${priceCents / 100}/month`;
  const classroomName = decodeURIComponent(name ?? '');

  function handleSubscribe() {
    if (!id) return;
    mutation.mutate(
      { classroomId: id },
      {
        onSuccess: () => {
          // D-10: navigate back to detail screen after subscribing
          router.back();
        },
      }
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header — back button + title */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscribe</Text>
      </View>

      {/* Centred content — D-09 layout */}
      <View style={styles.body}>
        <Text style={styles.classroomName}>{classroomName}</Text>
        <Text style={styles.price}>{priceDisplay}</Text>
        {/* D-11: calm copy, no exclamation marks, no urgency */}
        <Text style={styles.copy}>
          You'll get full access to all sections and materials in this classroom.
        </Text>

        <Button
          variant="primary"
          onPress={handleSubscribe}
          disabled={mutation.isPending}
          accessibilityRole="button"
        >
          Subscribe
        </Button>

        <Button
          variant="ghost"
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          Maybe later
        </Button>
      </View>
    </SafeAreaView>
  );
}
```

Add `import Ionicons from '@expo/vector-icons/Ionicons'` to both files.

Styles for subscribe-confirm:
```typescript
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginLeft: SPACING.sm },
  body: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.lg },
  classroomName: { fontSize: 28, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.xs },
  price: { fontSize: 20, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.md },
  copy: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.lg, lineHeight: 24 },
});
```
  </action>
  <verify>
    <automated>grep "useClassroomDetail\|useMySubscriptions\|isSubscribed" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/app/(tabs)/classroom-detail.tsx" | wc -l</automated>
    Expect: 3

    <automated>grep "useSubscribe\|mutation.isPending" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/app/(tabs)/subscribe-confirm.tsx" | wc -l</automated>
    Expect: 2

    <automated>grep "Maybe later\|You'll get full access" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/app/(tabs)/subscribe-confirm.tsx" | wc -l</automated>
    Expect: 2 (exact copy from UI-SPEC Copywriting Contract)

    <automated>grep "#" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/app/(tabs)/classroom-detail.tsx"</automated>
    Expect: 0 matches

    <automated>grep "#" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/app/(tabs)/subscribe-confirm.tsx"</automated>
    Expect: 0 matches

    <automated>npx jest 2>&1 | tail -5</automated>
    Expect: full suite passes (no new failures introduced)
  </verify>
  <done>
    - classroom-detail.tsx: shows locked sections (LockedContentOverlay) for non-subscribers; shows unlocked section names for subscribers; Subscribe CTA shows price per D-08; "You're subscribed" indicator for subscribers
    - subscribe-confirm.tsx: shows classroom name, price, calm copy, Subscribe button, "Maybe later" button; Subscribe button disabled when mutation.isPending; navigates back on success
    - Both files use only theme tokens — no hardcoded hex
    - Full jest suite passes
  </done>
</task>

</tasks>

<verification>
After both tasks:
1. `grep "useAllClassrooms" src/app/(tabs)/index.tsx` — 1 match
2. `grep "isSubscribed" src/app/(tabs)/classroom-detail.tsx` — at least 2 matches (definition + conditional render)
3. `grep "mutation.isPending" src/app/(tabs)/subscribe-confirm.tsx` — 1 match
4. `grep "Maybe later" src/app/(tabs)/subscribe-confirm.tsx` — 1 match (exact copy)
5. `grep "You'll get full access" src/app/(tabs)/subscribe-confirm.tsx` — 1 match (exact copy)
6. `npx jest` exits 0 — full suite passes
</verification>

<success_criteria>
- All 3 screens are complete and importable
- Home tab shows discovery list and subscribed classrooms section (D-01, D-02, D-03)
- Classroom detail shows locked sections with Subscribe CTA (DISC-03, DISC-04)
- Subscribe confirmation is a dedicated screen with calm copy (SUB-01)
- Subscription written to Supabase on confirm, screen returns to detail (SUB-02)
- jest full suite still green
</success_criteria>

<output>
After completion, create `.planning/phases/05-student-discovery-and-subscriptions/05-P03-SUMMARY.md`
</output>
