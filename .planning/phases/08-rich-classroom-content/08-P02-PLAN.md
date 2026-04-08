---
phase: 08-rich-classroom-content
plan: P02
type: execute
wave: 2
depends_on:
  - 08-P00
files_modified:
  - src/features/classroom/FlashCard.tsx
  - src/features/classroom/StudentCardRenderer.tsx
  - src/app/(tabs)/pdf-viewer.tsx
  - src/app/(tabs)/classroom-detail.tsx
  - src/features/classroom/__tests__/FlashCard.test.tsx
  - src/features/classroom/__tests__/StudentCardRenderer.test.tsx
autonomous: true
requirements:
  - RICH-01
  - RICH-02
  - RICH-04

must_haves:
  truths:
    - "Student can tap a flashcard and see it flip to reveal the back face"
    - "Student can tap a PDF card and a full-screen in-app PDF viewer opens"
    - "Student sees section cards rendered inside subscribed classrooms on the classroom-detail screen"
    - "Text, link, image, flashcard, and PDF card types all render without crashing"
  artifacts:
    - path: "src/features/classroom/FlashCard.tsx"
      provides: "Reanimated v4 flip animation component"
      exports: ["FlashCard"]
    - path: "src/features/classroom/StudentCardRenderer.tsx"
      provides: "card_type dispatcher for student view"
      exports: ["StudentCardRenderer"]
    - path: "src/app/(tabs)/pdf-viewer.tsx"
      provides: "Full-screen WebView PDF screen"
      contains: "WebView"
    - path: "src/app/(tabs)/classroom-detail.tsx"
      provides: "Per-section card rendering for subscribers"
      contains: "StudentCardRenderer"
  key_links:
    - from: "StudentCardRenderer.tsx"
      to: "pdf-viewer screen"
      via: "router.push('/(tabs)/pdf-viewer?url=...')"
      pattern: "router\\.push.*pdf-viewer"
    - from: "StudentCardRenderer.tsx"
      to: "FlashCard component"
      via: "card_type === 'flashcard'"
      pattern: "card_type.*flashcard"
    - from: "classroom-detail.tsx"
      to: "StudentCardRenderer"
      via: "SectionWithStudentCards component"
      pattern: "StudentCardRenderer"
    - from: "pdf-viewer.tsx"
      to: "react-native-webview"
      via: "WebView source={{ uri: decodedUrl }}"
      pattern: "WebView.*source"
---

<objective>
Build the student-facing card rendering layer: a `FlashCard` component with a 60fps Reanimated v4 flip animation, a `StudentCardRenderer` that dispatches on card_type, a full-screen `pdf-viewer` screen powered by react-native-webview, and wiring of all these into the existing `classroom-detail` screen.

Purpose: RICH-01 (flip flashcards), RICH-02 (view PDFs), RICH-04 (students see all card types).
Output: Three new files + classroom-detail updated. Tests pass for FlashCard and StudentCardRenderer.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/08-rich-classroom-content/08-P00-SUMMARY.md

@src/app/(tabs)/classroom-detail.tsx
@src/features/classroom/useClassroomCards.ts
@src/features/ui/theme.ts
@src/features/classroom/__tests__/FlashCard.test.tsx
@src/features/classroom/__tests__/StudentCardRenderer.test.tsx
</context>

<interfaces>
<!-- FlashCard props — kept minimal for MVP -->
```typescript
interface FlashCardProps {
  front: string;
  back: string;
}
```

<!-- StudentCardRenderer props -->
```typescript
interface StudentCardRendererProps {
  card: CardRowWithSignedUrl; // from useClassroomCards.ts
}
// CardRowWithSignedUrl = Database['public']['Tables']['classroom_cards']['Row'] & { signedUrl?: string }
```

<!-- pdf-viewer screen receives search params -->
```typescript
// src/app/(tabs)/pdf-viewer.tsx
const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
// url is encodeURIComponent-encoded — always decodeURIComponent before passing to WebView
```

<!-- classroom-detail.tsx subscription guard — already implemented -->
```typescript
const isSubscribed = subscriptions.some(
  (s) => s.classroom_id === id && s.status === 'active'
);
// Subscribed view currently renders: <Text>{section.name}</Text> per section
// Phase 8: replace with SectionWithStudentCards component that fetches + renders cards
```

<!-- Reanimated v4 imports — confirmed available after P00 -->
```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
```
</interfaces>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: FlashCard component + tests</name>
  <files>
    src/features/classroom/FlashCard.tsx,
    src/features/classroom/__tests__/FlashCard.test.tsx
  </files>
  <behavior>
    - On mount: front face text is visible; back face text is not visible to the user
    - After one press: back face text becomes visible; front face text is hidden
    - After two presses: front face is visible again (toggle behaviour)
    - Component does not throw when front or back is an empty string
  </behavior>
  <action>
Create `src/features/classroom/FlashCard.tsx`:

```typescript
// src/features/classroom/FlashCard.tsx
// Reanimated v4 flip card — RICH-01
// Source: https://docs.swmansion.com/react-native-reanimated/examples/flipCard/
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADII } from '@/features/ui/theme';

interface FlashCardProps {
  front: string;
  back: string;
}

export function FlashCard({ front, back }: FlashCardProps) {
  const isFlipped = useSharedValue(false);

  const frontAnim = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      {
        rotateY: withTiming(
          `${interpolate(Number(isFlipped.value), [0, 1], [0, 180])}deg`,
          { duration: 400 }
        ),
      },
    ],
    backfaceVisibility: 'hidden',
  }));

  const backAnim = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      {
        rotateY: withTiming(
          `${interpolate(Number(isFlipped.value), [0, 1], [180, 360])}deg`,
          { duration: 400 }
        ),
      },
    ],
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }));

  return (
    <TouchableOpacity
      onPress={() => {
        // Toggle outside animated style — never mutate isFlipped.value inside useAnimatedStyle
        isFlipped.value = !isFlipped.value;
      }}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel="Flashcard — tap to flip"
    >
      <View style={styles.container}>
        <Animated.View style={[styles.face, frontAnim]}>
          <Text style={styles.text}>{front}</Text>
          <Text style={styles.hint}>Tap to flip</Text>
        </Animated.View>
        <Animated.View style={[styles.face, styles.backFace, backAnim]}>
          <Text style={styles.text}>{back}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 160,
    position: 'relative',
  },
  face: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backFace: {
    backgroundColor: COLORS.accent,
  },
  text: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
});
```

Replace FLASH-02a and FLASH-02b `it.todo` stubs in `FlashCard.test.tsx` with real tests. Mock `react-native-reanimated` at the top of the test file using `jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'))`. Use `@testing-library/react-native` `render` + `fireEvent.press` to assert the component renders `front` text initially and toggles on press.
  </action>
  <verify>
    <automated>npx jest --testPathPattern="FlashCard" --passWithNoTests</automated>
  </verify>
  <done>
    - FlashCard.tsx exports FlashCard component
    - Both FLASH-02 tests pass (not todo)
    - { perspective: 1000 } is the first transform in both animated style objects (Android safety)
    - isFlipped.value is toggled in onPress, never inside useAnimatedStyle
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: StudentCardRenderer + PdfViewer screen + classroom-detail wiring</name>
  <files>
    src/features/classroom/StudentCardRenderer.tsx,
    src/app/(tabs)/pdf-viewer.tsx,
    src/app/(tabs)/classroom-detail.tsx,
    src/features/classroom/__tests__/StudentCardRenderer.test.tsx
  </files>
  <behavior>
    - 'text' card: renders card.content as a Text element
    - 'link' card: renders a TouchableOpacity that calls Linking.openURL(card.content) on press
    - 'image' card: renders an Image with source={{ uri: card.signedUrl }}
    - 'pdf' card with signedUrl: renders a TouchableOpacity that calls router.push('/(tabs)/pdf-viewer?url=ENCODED_URL&title=ENCODED_TITLE')
    - 'pdf' card without signedUrl: renders a disabled/loading state (not a crash)
    - 'flashcard' card: renders FlashCard with front=card.content and back=card.title
    - Unknown card_type: renders null (no crash)
  </behavior>
  <action>
**1. Create `src/features/classroom/StudentCardRenderer.tsx`:**

```typescript
// src/features/classroom/StudentCardRenderer.tsx
// Student-facing card renderer — dispatches on card_type (RICH-04)
import { Text, TouchableOpacity, Image, View, Linking, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { COLORS, SPACING, RADII } from '@/features/ui/theme';
import { FlashCard } from './FlashCard';
import type { Database } from '@/types/database';

type CardRow = Database['public']['Tables']['classroom_cards']['Row'];
type CardRowWithSignedUrl = CardRow & { signedUrl?: string };

interface StudentCardRendererProps {
  card: CardRowWithSignedUrl;
}

export function StudentCardRenderer({ card }: StudentCardRendererProps) {
  switch (card.card_type) {
    case 'text':
      return (
        <View style={styles.textCard}>
          <Text style={styles.textContent}>{card.content}</Text>
        </View>
      );

    case 'link':
      return (
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => card.content && Linking.openURL(card.content)}
          activeOpacity={0.7}
        >
          <Text style={styles.linkTitle}>{card.title ?? card.content}</Text>
          <Text style={styles.linkUrl} numberOfLines={1}>{card.content}</Text>
        </TouchableOpacity>
      );

    case 'image':
      return card.signedUrl ? (
        <Image
          source={{ uri: card.signedUrl }}
          style={styles.imageCard}
          resizeMode="contain"
          accessibilityLabel={card.title ?? 'Image'}
        />
      ) : null;

    case 'pdf':
      if (!card.signedUrl) {
        return (
          <View style={styles.pdfCard}>
            <Text style={styles.pdfTitle}>{card.title ?? 'PDF'}</Text>
            <Text style={styles.pdfLoading}>Loading...</Text>
          </View>
        );
      }
      return (
        <TouchableOpacity
          style={styles.pdfCard}
          onPress={() =>
            router.push(
              `/(tabs)/pdf-viewer?url=${encodeURIComponent(card.signedUrl!)}&title=${encodeURIComponent(card.title ?? 'PDF')}`
            )
          }
          activeOpacity={0.8}
        >
          <Text style={styles.pdfTitle}>{card.title ?? 'PDF'}</Text>
          <Text style={styles.pdfCta}>Tap to open</Text>
        </TouchableOpacity>
      );

    case 'flashcard':
      return (
        <FlashCard
          front={card.content ?? ''}
          back={card.title ?? ''}
        />
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  textCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  textContent: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  linkCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
  },
  linkUrl: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  imageCard: {
    width: '100%',
    height: 200,
    borderRadius: RADII.card,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  pdfCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pdfTitle: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  pdfCta: {
    fontSize: 13,
    color: COLORS.accent,
    marginLeft: SPACING.sm,
  },
  pdfLoading: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
```

**2. Create `src/app/(tabs)/pdf-viewer.tsx` (RICH-02):**

```typescript
// src/app/(tabs)/pdf-viewer.tsx
// Full-screen WebView PDF viewer. URL passed as encodeURIComponent query param.
import { SafeAreaView, ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { WebView } from 'react-native-webview';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING } from '@/features/ui/theme';

export default function PdfViewerScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  const decodedUrl = url ? decodeURIComponent(url) : '';

  if (!decodedUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No PDF URL provided.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title ? decodeURIComponent(title) : 'PDF'}
        </Text>
      </View>

      {/* WebView renders PDF natively: iOS via WKWebView, Android via Chromium PDF plugin */}
      <WebView
        source={{ uri: decodedUrl }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  webview: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xl,
    padding: SPACING.lg,
  },
});
```

**3. Update `src/app/(tabs)/classroom-detail.tsx`:**

Add a `SectionWithStudentCards` component (mirrors the tutor-side `SectionWithCards` pattern in `manage-classroom.tsx`) that:
- Calls `useClassroomCards(section.id)` for the section
- Maps over cards, renders `<StudentCardRenderer key={card.id} card={card} />`
- Shows an ActivityIndicator while loading

Replace the subscribed section row block:
```tsx
// Before:
isSubscribed ? (
  <View key={section.id} style={styles.sectionRow}>
    <Text style={styles.sectionName}>{section.name}</Text>
  </View>
)

// After:
isSubscribed ? (
  <SectionWithStudentCards key={section.id} section={section} />
)
```

Add imports at top of classroom-detail.tsx:
```typescript
import { useClassroomCards } from '@/features/classroom/useClassroomCards';
import { StudentCardRenderer } from '@/features/classroom/StudentCardRenderer';
import type { Database } from '@/types/database';
```

Add the local `SectionWithStudentCards` component above the default export:
```typescript
type SectionRow_DB = Database['public']['Tables']['classroom_sections']['Row'];

function SectionWithStudentCards({ section }: { section: SectionRow_DB }) {
  const { data: cards = [], isPending } = useClassroomCards(section.id);
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionName}>{section.name}</Text>
      {isPending ? (
        <ActivityIndicator size="small" color={COLORS.accent} style={{ marginTop: SPACING.xs }} />
      ) : (
        cards.map((card) => (
          <StudentCardRenderer key={card.id} card={card} />
        ))
      )}
    </View>
  );
}
```

Add `ActivityIndicator` to the import from react-native if not already imported.

**4. Replace the it.todo stubs in `StudentCardRenderer.test.tsx`** with real tests. Mock `expo-router` (`jest.mock('expo-router', () => ({ router: { push: jest.fn() } }))`). Mock `react-native-reanimated`. Render `<StudentCardRenderer card={...} />` for each card type and assert the expected output.
  </action>
  <verify>
    <automated>
      npx jest --testPathPattern="StudentCardRenderer|FlashCard" --passWithNoTests
      npx tsc --noEmit 2>&1 | tail -10
    </automated>
  </verify>
  <done>
    - FlashCard.tsx, StudentCardRenderer.tsx, pdf-viewer.tsx all exist
    - classroom-detail.tsx renders SectionWithStudentCards for subscribed sections
    - StudentCardRenderer test stubs replaced with passing tests
    - npx tsc --noEmit passes
  </done>
</task>

</tasks>

<verification>
```bash
# Component tests
npx jest --testPathPattern="FlashCard|StudentCardRenderer"

# New screen exists
ls src/app/\(tabs\)/pdf-viewer.tsx

# classroom-detail imports StudentCardRenderer
grep -n "StudentCardRenderer" src/app/\(tabs\)/classroom-detail.tsx

# TypeScript clean
npx tsc --noEmit
```
</verification>

<success_criteria>
- FlashCard component created with Reanimated v4 flip animation; FLASH-02 tests pass
- StudentCardRenderer handles all 5 card types + unknown types without crashing
- pdf-viewer screen renders WebView with decoded URL from search params
- classroom-detail.tsx renders per-section cards for subscribed students
- No TypeScript errors
</success_criteria>

<threat_model>
- **{ perspective: 1000 } omission on Android**: rotateY without perspective renders invisible on Android. Both frontAnim and backAnim must include it as the first transform item.
- **isFlipped.value mutation inside useAnimatedStyle**: this causes an infinite re-render loop. Only read the value inside the style worklet; toggle it in onPress outside.
- **encodeURIComponent double-encoding**: the pdf-viewer screen must decodeURIComponent(url) before passing to WebView. If omitted, WebView receives a percent-encoded string and 404s.
- **getPublicUrl vs getSignedUrl**: classroom-assets is a private bucket. useClassroomCards already uses getSignedUrl — do not bypass this. StudentCardRenderer trusts the signedUrl from the query result.
- **SectionWithStudentCards inside .map()**: hooks inside .map() are illegal. SectionWithStudentCards is a component (not a function called inline) so the useClassroomCards call is valid — same pattern as the tutor-side SectionWithCards in manage-classroom.tsx.
- **ActivityIndicator import**: classroom-detail.tsx may not already import ActivityIndicator. Add it to the react-native import destructure.
</threat_model>

<output>
After completion, create `.planning/phases/08-rich-classroom-content/08-P02-SUMMARY.md`
</output>
