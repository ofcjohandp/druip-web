# Phase 2: Study Flow - Research

**Researched:** 2026-04-06
**Domain:** React Native quiz engine, Zustand v5 session state, TanStack Query v5, Expo Router dynamic routes, Supabase upsert patterns, React Native Animated slide-up panels
**Confidence:** HIGH

---

## Summary

Phase 2 builds a functional study loop on top of a solid Phase 1 foundation. The reference implementation already exists: `SampleLessonEngine.tsx` covers the core question render, lock state, progress bar, and feedback pattern using the exact same design tokens and component primitives that the real engine will use. The primary work is: lifting state from `useState` to a Zustand store, replacing hardcoded questions with TanStack Query, adding the slide-up panel animation and icon feedback, adding the `lesson_attempts` schema migration, writing the Supabase completion write, and building the three new screens (topic list, lesson list, lesson-complete).

The codebase is clean and consistent: `theme.ts` holds all design tokens, `WindowedFlatList` covers all list screens, `useAuthStore` exposes the session, and the Expo Router stack pattern is established. No new packages are required for this phase — everything needed (Zustand v5, TanStack Query v5, `@expo/vector-icons`, `Animated` from React Native core) is already installed.

**Primary recommendation:** Implement the quiz engine as a direct evolution of `SampleLessonEngine` — keep the synchronous lock pattern, add Animated.spring for the panel, extract state to Zustand, and wire Supabase writes using a TanStack Query `useMutation`. No new dependencies. No new design tokens.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Study tab shows a scrollable list of topic cards. Tap a topic → navigates to a lesson list screen for that topic. Tap a lesson → starts the lesson (quiz engine).

**D-02:** Topic cards display: topic name + readiness tier label (Not Started / Learning / Practicing / Ready) + lesson count (e.g. "3 of 8 lessons done"). No progress bar on topic cards — tier label is the primary readiness signal.

**D-03:** Locked lessons (sequential unlock via `lessons.order`) are visible in the lesson list but grayed out with a lock icon. Tapping a locked lesson shows no navigation — visual dead end is sufficient for MVP.

**D-04:** The first lesson in each topic is always unlocked (CONT-04). Completed lessons show a checkmark state. The current (next unlocked) lesson is visually prominent — full opacity, accent border or subtle highlight.

**D-05:** Feedback appears as a slide-up panel from the bottom of the screen (not inline within the question card). This separates the "answer zone" (top) from the "feedback zone" (bottom) clearly.

**D-06:** Correct answers: panel shows brief positive reinforcement text (1 line) + "Continue" button. No auto-advance.

**D-07:** Wrong answers: panel shows "Correct answer: [option text]" + explanation text (CONT-06 guarantee) + "Continue" button. Never auto-advance on wrong (STUDY-06).

**D-08:** Correct answer visual feedback: green background + checkmark icon on the selected option (within 150ms, STUDY-04). No animation beyond the color change for Phase 2 — keep it fast and frictionless.

**D-09:** Full-screen (not a modal/sheet). Shows: XP earned, score summary ("12 of 15 correct"), streak status (current streak count from `profiles.streak_count`). Single primary CTA: "Continue" → returns to the lesson list for the same topic.

**D-10:** Tone: calm celebration — not confetti explosions. Consistent with the "calmer, clearer, more in control" core value.

**D-11:** `lesson_attempts` table does not exist in the current schema — it must be added as part of this phase. Columns: `id`, `user_id`, `lesson_id`, `score`, `total_questions`, `status` (enum: `in_progress` | `completed`), `started_at`, `completed_at`.

**D-12:** On lesson complete, write a `lesson_attempts` row with `status: completed`. Also upsert `user_lesson_progress` with `completed: true`, `score`, `completed_at` (PROG-07 trigger handles readiness recalc — but the trigger is Phase 3; for Phase 2 just write the rows).

**D-13:** Quiz session state lives in Zustand (not React state). Store: `lessonId`, `questions[]`, `currentIndex`, `answers[]`, `score`, `isLocked`. Cleared on lesson exit.

**D-14:** Questions are fetched via TanStack Query keyed by `lessonId`. Fetch all questions for the lesson upfront (no lazy loading per question).

### Claude's Discretion

- Exact slide-up panel animation (spring vs timing, height)
- Positive reinforcement copy for correct answers ("Nice!" / "Correct!" etc.)
- Study tab screen component names and file paths (follow `src/features/{feature}/` pattern)
- Lesson list screen layout detail beyond what's specified above
- Loading and empty states for topic list and lesson list
- `hitSlop` values for touch targets (STUDY-08)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed tightly within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STUDY-01 | Single-question-at-a-time flow with progress bar | SampleLessonEngine pattern — `(currentIndex + (isLocked ? 1 : 0)) / total` formula already proven |
| STUDY-02 | Progress bar advances on every answer, never shrinks | Same formula — bar only ever increases as `currentIndex` and `isLocked` can only go forward |
| STUDY-03 | Maximum 4 answer options per question stacked vertically | `questions.options` JSONB field; render loop over `question.options.slice(0, 4)` |
| STUDY-04 | Answer lock + color/icon feedback within 150ms | Synchronous `setState` in one press handler; derived styles from render — zero async gap |
| STUDY-05 | Correct answer highlighted green on wrong selection | `getOptionStyle` guard: `if (index === correctOptionIndex) → correct style`; applies to both correct and selected-wrong cases |
| STUDY-06 | Explanation panel + manual Continue on wrong answer | Slide-up panel conditional; no auto-advance wiring; Continue button only exits panel |
| STUDY-07 | Lesson-complete screen with XP, streak, score, CTA | New screen at `src/app/lesson-complete.tsx`; reads `profiles.streak_count` + lesson `xp_reward` |
| STUDY-08 | Minimum 44×44pt touch targets | `minHeight: 48` on all tappable elements + `hitSlop` on icon-only elements |
| STUDY-09 | Android keyboard handling configuration | `KeyboardAvoidingView behavior="height"` + `softwareKeyboardLayoutMode: "resize"` in app.config.js — relevant to any text-input screens added |
| CONT-06 | Explanation required before question can publish | Postgres CHECK constraint on `questions` table + TypeScript guard before marking `is_published: true` |
</phase_requirements>

---

## Standard Stack

### Core (all already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | 5.0.12 | Quiz session state (`lessonId`, `questions`, `currentIndex`, `answers`, `score`, `isLocked`) | Installed in Phase 1; `useAuthStore` establishes the pattern to replicate |
| TanStack Query | 5.96.2 | Fetch all lesson questions upfront; `useMutation` for lesson attempt write | Installed in Phase 1; official stack choice in CLAUDE.md |
| React Native `Animated` | (RN core) | Slide-up feedback panel using `Animated.spring` + `translateY` | Built into React Native; `useNativeDriver: true` runs on native thread |
| `@expo/vector-icons` Ionicons | (Expo SDK 54 bundle) | `checkmark-circle` and `close-circle` icons on answer options | Installed; used by `_layout.tsx` tab icons; already the icon library of record |
| Expo Router | 6.0.23 | Dynamic route segments `[topicId]` and `[lessonId]`; `router.replace` for lesson-complete back-nav | Installed; established routing pattern in Phase 1 |
| Supabase JS | 2.101.1 | Insert `lesson_attempts`, upsert `user_lesson_progress`, read `profiles` for streak | Installed; pinned above v2.49.9 minimum (SEED-03) |

### No new installations required

All packages needed for Phase 2 are already present. `npx expo install` is only needed if a new native package is introduced — it is not in this phase.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── (tabs)/
│   │   ├── study.tsx                      # Replace placeholder — renders TopicListScreen
│   │   └── study/
│   │       └── [topicId].tsx              # Lesson list for a topic
│   ├── lesson/
│   │   └── [lessonId].tsx                 # Quiz engine screen (outside tabs — full-screen)
│   └── lesson-complete.tsx                # Results screen (outside tabs — full-screen)
├── features/
│   └── study/
│       ├── useStudySessionStore.ts        # Zustand store for active quiz session
│       ├── useLessonQuestions.ts          # TanStack Query hook — fetch questions by lessonId
│       ├── useTopics.ts                   # TanStack Query hook — fetch topics for module
│       ├── useLessons.ts                  # TanStack Query hook — fetch lessons for topic
│       ├── useCompleteLesson.ts           # TanStack Query useMutation — write lesson_attempts + upsert progress
│       ├── LessonEngine.tsx               # Core quiz engine component (wraps session store)
│       ├── QuestionCard.tsx               # Single question + options render
│       ├── FeedbackPanel.tsx              # Slide-up animated panel
│       ├── TopicCard.tsx                  # Topic card for Study tab list
│       └── LessonListItem.tsx             # Lesson row with lock/complete/current states
```

### Route placement rationale

The quiz engine (`lesson/[lessonId].tsx`) and lesson-complete screen live **outside** `(tabs)/` because they are full-screen experiences that should hide the tab bar. `src/app/_layout.tsx` must add `Stack.Screen` entries for both, matching the existing pattern used for `sample-lesson` and `sign-up-prompt`.

The Study tab drill-down (`study/[topicId].tsx`) lives **inside** `(tabs)/` and keeps the tab bar visible, consistent with D-01.

### Pattern 1: Zustand Quiz Session Store

Modeled directly on `useAuthStore.ts` from Phase 1:

```typescript
// src/features/study/useStudySessionStore.ts
import { create } from 'zustand';
import { Database } from '@/types/database';

type Question = Database['public']['Tables']['questions']['Row'];

interface StudySessionState {
  lessonId: string | null;
  questions: Question[];
  currentIndex: number;
  answers: (number | null)[];   // selected option index per question
  score: number;
  isLocked: boolean;
  // actions
  initSession: (lessonId: string, questions: Question[]) => void;
  lockAnswer: (selectedIndex: number, isCorrect: boolean) => void;
  advance: () => void;
  clearSession: () => void;
}

export const useStudySessionStore = create<StudySessionState>((set, get) => ({
  lessonId: null,
  questions: [],
  currentIndex: 0,
  answers: [],
  score: 0,
  isLocked: false,
  initSession: (lessonId, questions) =>
    set({ lessonId, questions, currentIndex: 0, answers: new Array(questions.length).fill(null), score: 0, isLocked: false }),
  lockAnswer: (selectedIndex, isCorrect) =>
    set((s) => ({
      isLocked: true,
      answers: s.answers.map((a, i) => (i === s.currentIndex ? selectedIndex : a)),
      score: isCorrect ? s.score + 1 : s.score,
    })),
  advance: () =>
    set((s) => ({ currentIndex: s.currentIndex + 1, isLocked: false })),
  clearSession: () =>
    set({ lessonId: null, questions: [], currentIndex: 0, answers: [], score: 0, isLocked: false }),
}));
```

**Key invariant:** `lockAnswer` is called synchronously in the press handler — no async gap, satisfying the 150ms requirement (STUDY-04).

### Pattern 2: TanStack Query — Questions Fetch

```typescript
// src/features/study/useLessonQuestions.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useLessonQuestions(lessonId: string) {
  return useQuery({
    queryKey: ['lesson-questions', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          sections!inner(lesson_id)
        `)
        .eq('sections.lesson_id', lessonId)
        .eq('is_published', true)
        .order('order', { ascending: true })
        .throwOnError();
      return data ?? [];
    },
    enabled: !!lessonId,
    staleTime: 5 * 60 * 1000,  // 5 min — questions don't change between sessions
  });
}
```

**Important:** Use `.throwOnError()` so TanStack Query catches Supabase errors properly. Without it, errors appear in the response object and `isError` never fires.

### Pattern 3: Questions join via sections

Questions belong to `sections`, not directly to `lessons`. The fetch must join through sections: `sections(lesson_id)` with `.eq('sections.lesson_id', lessonId)`. This is a join filter pattern in supabase-js — the inner join ensures only questions whose section belongs to the target lesson are returned.

Alternatively, fetch lesson sections first, collect `section_id`s, then fetch questions with `.in('section_id', sectionIds)`. Both work; the single join query is preferred.

### Pattern 4: TanStack Query useMutation — Lesson Complete Write

```typescript
// src/features/study/useCompleteLesson.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useCompleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ lessonId, userId, score, total }: {
      lessonId: string; userId: string; score: number; total: number;
    }) => {
      // 1. Insert lesson_attempts row
      await supabase.from('lesson_attempts').insert({
        user_id: userId,
        lesson_id: lessonId,
        score,
        total_questions: total,
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      }).throwOnError();

      // 2. Upsert user_lesson_progress (D-12)
      await supabase.from('user_lesson_progress').upsert({
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        score,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,lesson_id' }).throwOnError();
    },
    onSuccess: (_, { lessonId }) => {
      // Invalidate so lesson list refreshes completion states
      queryClient.invalidateQueries({ queryKey: ['user-lesson-progress'] });
    },
  });
}
```

### Pattern 5: Slide-Up Feedback Panel Animation

```typescript
// Inside FeedbackPanel component
const slideAnim = useRef(new Animated.Value(300)).current; // start off-screen

useEffect(() => {
  if (isVisible) {
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,  // required — animates transform, not layout
    }).start();
  } else {
    slideAnim.setValue(300); // reset instantly on dismiss
  }
}, [isVisible]);

// In render:
<Animated.View style={[styles.panel, { transform: [{ translateY: slideAnim }] }]}>
  ...
</Animated.View>
```

**Critical:** Use `transform: [{ translateY }]` not `marginTop` or `bottom`. Only transform and opacity can use `useNativeDriver: true` — layout properties cannot.

### Pattern 6: Route Registration for Non-Tab Screens

New routes outside `(tabs)` must be registered in `src/app/_layout.tsx`:

```typescript
// Add to Stack in RootNavigator:
<Stack.Screen name="lesson/[lessonId]" options={{ headerShown: false }} />
<Stack.Screen name="lesson-complete" options={{ headerShown: false }} />
```

And for the nested tab route, add to the tabs `_layout.tsx`:

```typescript
<Tabs.Screen name="study/[topicId]" options={{ title: 'Lessons', tabBarIcon: ... }} />
```

### Pattern 7: Lesson Complete Navigation

Per D-09, use `router.replace` (not `router.push`) so back-swipe does not return to a completed lesson session:

```typescript
// On lesson-complete "Continue" tap:
router.replace(`/(tabs)/study/${topicId}`);
```

Pass `topicId` to lesson-complete screen via route params or Zustand (Zustand is simpler since the session store already has the `lessonId`; fetch `topic_id` from the lesson record in the query cache).

### Anti-Patterns to Avoid

- **Using FlatList for the question card:** Confirmed in SEED-06 and CONTEXT.md — single card render only. FlatList introduces scroll state and re-render overhead that breaks the immediate feedback contract.
- **Using `marginTop` / `bottom` in Animated.spring:** Cannot use `useNativeDriver: true` with layout properties. Always use `transform: [{ translateY }]` for slide-up panels.
- **Calling `setIsLocked` after an async operation:** Any async gap between tap and lock state set can exceed 150ms. Lock must be set synchronously in the press handler before any awaits.
- **Forgetting `.throwOnError()` on Supabase queries:** Without it, Supabase errors land in the `error` property of the return value, not as thrown exceptions — TanStack Query's `isError` state never fires.
- **`router.push` to lesson-complete:** Back gesture returns to active lesson session, which is in a completed/invalid state. Use `router.replace`.
- **Hardcoding option array length:** `questions.options` is JSONB and could theoretically have any length. Render only the first 4 (STUDY-03): `question.options.slice(0, 4)`.
- **Reading streak from Zustand auth store:** `useAuthStore` holds `Session`, not `Profile`. Streak lives in the `profiles` table — fetch it separately with a TanStack Query hook using the session `user.id`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| FlatList windowing config | Custom FlatList wrapper | `WindowedFlatList` (already built in Phase 1) | SEED-06 config already applied; missing windowing = JS thread freezes on long lesson lists |
| State management for quiz session | `useReducer` or deeply nested `useState` | Zustand store (`useStudySessionStore`) | Zustand's synchronous `set` is critical for the 150ms lock requirement; `useReducer` dispatch is also sync but adds boilerplate with no benefit |
| Animation | Manual `setInterval` position updates | `Animated.spring` with `useNativeDriver: true` | Native driver moves animation to the UI thread — JS thread stalls (e.g., Supabase writes) cannot affect animation smoothness |
| Supabase error handling | `try/catch` around every query | `.throwOnError()` on all Supabase calls | Single-line change; ensures TanStack Query's error state machine works correctly |
| Touch target padding | Wrapper Views | `hitSlop` prop | No layout impact; adds tap area without changing visual size |

---

## Data Layer — New Migration Required

**lesson_attempts table must be created in Phase 2.** This is the only schema change this phase.

```sql
-- 00004_lesson_attempts.sql
CREATE TYPE lesson_attempt_status_enum AS ENUM ('in_progress', 'completed');

CREATE TABLE lesson_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  status lesson_attempt_status_enum NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lesson_attempts_user_id ON lesson_attempts(user_id);
CREATE INDEX idx_lesson_attempts_lesson_id ON lesson_attempts(lesson_id);
CREATE INDEX idx_lesson_attempts_user_lesson ON lesson_attempts(user_id, lesson_id);

CREATE TRIGGER set_lesson_attempts_updated_at
  BEFORE UPDATE ON lesson_attempts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

RLS for `lesson_attempts` must follow the same `auth.uid()` subquery pattern used on all other user-scoped tables:

```sql
ALTER TABLE lesson_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own lesson attempts"
  ON lesson_attempts FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own lesson attempts"
  ON lesson_attempts FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));
```

**CONT-06 enforce at DB layer:** Add a CHECK constraint or trigger to prevent `is_published = true` on questions with `explanation IS NULL`:

```sql
ALTER TABLE questions
  ADD CONSTRAINT questions_explanation_required_when_published
  CHECK (is_published = FALSE OR explanation IS NOT NULL);
```

This is a non-breaking change on existing data (all questions currently have `is_published = false`).

**`src/types/database.ts` must be updated** to add `lesson_attempts` Row/Insert/Update types and the new `lesson_attempt_status` enum.

---

## Questions Data Shape

The existing `questions` table stores options as `JSONB`. Based on the migration:

```sql
options JSONB NOT NULL DEFAULT '[]'::jsonb
```

The TypeScript type is `Json` (the existing generic). At query time, `options` arrives as `string[] | null` (when seeded with string arrays). The question card must cast: `(question.options as string[]).slice(0, 4)`. This is a known pattern with Supabase JSONB — always cast the JSONB column to the expected type before use.

---

## Common Pitfalls

### Pitfall 1: useNativeDriver incompatible with layout properties
**What goes wrong:** `Animated.spring(...).start()` throws a warning and falls back to JS thread, causing jank during Supabase writes.
**Why it happens:** `useNativeDriver: true` only supports transform and opacity. Setting it on `height`, `padding`, `marginTop`, or `bottom` is silently degraded on older RN versions or throws on newer.
**How to avoid:** Animate `transform: [{ translateY: value }]` exclusively. Position the panel absolutely at the bottom of the screen; `translateY` slides it in.
**Warning sign:** Yellow "useNativeDriver is not supported" console warning.

### Pitfall 2: 150ms feedback contract broken by async state
**What goes wrong:** Tapping an answer triggers a Supabase call or TanStack Query mutation before the UI lock state is set, causing a 200–400ms delay before color feedback appears.
**Why it happens:** Async operations yield the JS thread; `setState` batched after an await fires on the next frame.
**How to avoid:** Call `useStudySessionStore.getState().lockAnswer(...)` synchronously at the top of the press handler — before any async calls. Only trigger Supabase writes in `useEffect` or after navigation.
**Warning sign:** Answer tap → visible 1-2 frame delay before color change.

### Pitfall 3: Questions not joining through sections correctly
**What goes wrong:** `useLessonQuestions` returns 0 results even though questions exist in the database.
**Why it happens:** Questions belong to `sections`, not directly to `lessons`. A query on `questions` filtered by `lesson_id` fails because that column doesn't exist on `questions`.
**How to avoid:** Use the join pattern: `.select('*, sections!inner(lesson_id)').eq('sections.lesson_id', lessonId)`. Alternatively fetch `section_id`s from the sections query first, then `.in('section_id', ids)`.
**Warning sign:** Empty `data` array with no Supabase error.

### Pitfall 4: router.push to lesson-complete allows back-swipe to dead session
**What goes wrong:** Student completes lesson → taps Continue → lands on lesson-complete → swipes back → returns to quiz engine at `isLastQuestion` state with no `handleContinue` action available.
**Why it happens:** `router.push` keeps the quiz screen in the navigation stack.
**How to avoid:** Always `router.replace` when navigating to lesson-complete. Clear the Zustand session store in a `useEffect` cleanup on the lesson screen unmount.
**Warning sign:** Back gesture from lesson-complete returns to quiz screen.

### Pitfall 5: JSONB options cast
**What goes wrong:** `question.options.map(...)` throws TypeScript error "Property 'map' does not exist on type 'Json'".
**Why it happens:** The database type for JSONB is the generic `Json` union type — TypeScript doesn't know it's a string array.
**How to avoid:** Cast at the usage site: `(question.options as string[]).slice(0, 4).map(...)`. This is the established pattern when Supabase types are generated from schema rather than RPC return types.

### Pitfall 6: Tab bar visible during quiz engine
**What goes wrong:** The quiz screen renders with the bottom tab bar visible, eating into the question card vertical space and showing navigation elements that distract from focus.
**Why it happens:** If the lesson route is placed inside `(tabs)/`, Expo Router shows the tab navigator's tab bar.
**How to avoid:** Place `lesson/[lessonId].tsx` and `lesson-complete.tsx` **outside** `(tabs)/` in the root `app/` directory, and register them as `Stack.Screen` entries in `_layout.tsx`.

---

## Code Examples

### Answer option with icon feedback
```typescript
// Source: SampleLessonEngine.tsx + UI-SPEC.md Interaction Contracts
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';

function AnswerOption({ option, index, isLocked, selectedOption, correctIndex, onPress }) {
  const isCorrect = index === correctIndex;
  const isSelected = index === selectedOption;
  const isWrong = isSelected && !isCorrect;

  const showCorrect = isLocked && isCorrect;
  const showWrong = isLocked && isWrong;

  return (
    <TouchableOpacity
      style={[
        styles.option,
        showCorrect && styles.optionCorrect,
        showWrong && styles.optionWrong,
      ]}
      onPress={() => onPress(index)}
      disabled={isLocked}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={styles.optionText}>{option}</Text>
      {showCorrect && (
        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
      )}
      {showWrong && (
        <Ionicons name="close-circle" size={20} color={COLORS.error} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.card,
    marginBottom: SPACING.sm,
    minHeight: 48,
  },
  optionCorrect: { backgroundColor: '#E8F5E9', borderWidth: 2, borderColor: COLORS.success },
  optionWrong: { backgroundColor: '#FFEBEE', borderWidth: 2, borderColor: COLORS.error },
  optionText: { fontSize: 16, color: COLORS.text, flex: 1 },
});
```

### Lesson-complete screen data fetch
```typescript
// Read streak_count from profiles for the authenticated user
function useLessonCompleteData(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('streak_count, total_xp')
        .eq('id', userId)
        .single()
        .throwOnError();
      return data;
    },
    enabled: !!userId,
  });
}
```

### Route params for lesson-complete screen
```typescript
// Navigate to lesson-complete after final question:
router.replace({
  pathname: '/lesson-complete',
  params: {
    score: String(score),
    total: String(questions.length),
    lessonId,
    topicId,  // needed for CTA back-navigation
    xpReward: String(lesson.xp_reward),
  },
});

// In lesson-complete.tsx:
const { score, total, lessonId, topicId, xpReward } = useLocalSearchParams<{
  score: string; total: string; lessonId: string; topicId: string; xpReward: string;
}>();
```

---

## Environment Availability

Step 2.6: SKIPPED — Phase 2 is a pure code and SQL migration change. No external CLI tools, databases, or services beyond the already-established Supabase project are introduced. All runtime dependencies (Expo CLI, Supabase project) were confirmed working in Phase 1.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 30 + jest-expo 55 |
| Config file | `jest.config.js` (root) |
| Quick run command | `npx jest --testPathPattern="study" --passWithNoTests` |
| Full suite command | `npx jest` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STUDY-01 | Progress bar formula advances monotonically | unit | `npx jest --testPathPattern="study-session-store"` | ❌ Wave 0 |
| STUDY-02 | Bar never shrinks (currentIndex can only increase) | unit | same | ❌ Wave 0 |
| STUDY-03 | Options capped at 4 even if JSONB has 5+ | unit | `npx jest --testPathPattern="question-card"` | ❌ Wave 0 |
| STUDY-04 | lockAnswer called synchronously in press handler | unit | `npx jest --testPathPattern="study-session-store"` | ❌ Wave 0 |
| STUDY-05 | Both correct + wrong option highlight states | unit | same | ❌ Wave 0 |
| STUDY-06 | No auto-advance — panel stays until Continue tapped | unit | `npx jest --testPathPattern="feedback-panel"` | ❌ Wave 0 |
| STUDY-07 | lesson-complete screen renders XP + score + streak | smoke | `npx jest --testPathPattern="lesson-complete"` | ❌ Wave 0 |
| STUDY-08 | minHeight 48 on answer options | unit | `npx jest --testPathPattern="question-card"` | ❌ Wave 0 |
| CONT-06 | DB CHECK constraint blocks publish without explanation | manual | Supabase SQL test / migration verify | n/a |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern="study" --passWithNoTests`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__tests__/study-session-store.test.ts` — covers STUDY-01, STUDY-02, STUDY-04, STUDY-05 (pure Zustand store logic, no rendering required)
- [ ] `__tests__/question-card.test.tsx` — covers STUDY-03, STUDY-08 (component render with mocked store)
- [ ] `__tests__/feedback-panel.test.tsx` — covers STUDY-06 (visibility and Continue interaction)
- [ ] `__tests__/lesson-complete.test.tsx` — covers STUDY-07 (screen renders with mocked params and profile data)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useState` in component for quiz state | Zustand store (`useStudySessionStore`) | Phase 2 design decision (D-13) | State survives background/foreground without lifting props; clearSession() on unmount keeps it clean |
| Inline feedback below options | Slide-up panel from bottom (D-05) | Phase 2 design decision | Cleaner answer/feedback separation; panel does not shift question content layout |
| `SampleLessonEngine` with `useState` (Phase 1) | Real `LessonEngine` with Zustand + TanStack Query | Phase 2 | `SampleLessonEngine` stays in `features/onboarding/` unchanged — it is the onboarding play-first lesson only |

**Deprecated within this phase:**
- Placeholder `study.tsx` screen: replaced with `TopicListScreen` backed by `useTopics` query.

---

## Open Questions

1. **Questions per lesson boundary**
   - What we know: questions belong to sections, and sections belong to lessons. A lesson with 3 sections of 5 questions each has 15 total questions — within the 10–20 range specified by STUDY-01.
   - What's unclear: is the 10–20 limit enforced at the data layer, or is the engine expected to paginate/sample?
   - Recommendation: For Phase 2, fetch all published questions for the lesson and present all of them. If a content admin creates a lesson with 25+ questions, the student sees 25+. Add a MAX query limit (`.limit(20)`) as a safety cap — this is a Claude's Discretion area.

2. **`topicId` threading to lesson-complete screen**
   - What we know: lesson-complete CTA navigates back to `/(tabs)/study/[topicId]` (D-09). The `topicId` is not a column on `lessons` directly accessible without a join.
   - What's unclear: whether to pass `topicId` via route params from the quiz screen or do a reverse lookup on the lesson-complete screen.
   - Recommendation: Pass `topicId` as a route param when navigating to the lesson screen (available from the lesson list screen). Thread it through to lesson-complete via params. Avoids an extra query.

3. **`in_progress` attempt on session start**
   - What we know: D-11 defines `status: in_progress | completed`. D-12 only says to write `completed` on finish.
   - What's unclear: whether to insert an `in_progress` attempt at session start (for crash recovery in future phases).
   - Recommendation: For Phase 2, insert only the `completed` row on lesson finish. `in_progress` rows add complexity with no consumer in Phase 2 — defer to Phase 3/4 if session continuity becomes a requirement.

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on Phase 2 |
|-----------|-------------------|
| Stack: React Native / Expo + Supabase — decided, not up for debate | No alternatives considered; all patterns use this stack |
| All components MUST import from `theme.ts` — no hardcoded colors | Every new component imports `COLORS`, `RADII`, `SPACING` from `@/features/ui/theme` |
| Screen files in `src/app/` are thin route wrappers — business logic in `src/features/` | `study.tsx`, `study/[topicId].tsx`, `lesson/[lessonId].tsx`, `lesson-complete.tsx` are wrappers only |
| `WindowedFlatList` for content lists; single card render for active question | Topic list and lesson list use `WindowedFlatList`; quiz engine renders one `QuestionCard` at a time, swapped on advance |
| `src/lib/supabase.ts` is the single Supabase client — nothing else creates a client | All query hooks import `supabase` from `@/lib/supabase` |
| `src/types/database.ts` must be kept in sync — use typed client everywhere | `lesson_attempts` Row/Insert/Update types added here after migration |
| GSD Workflow Enforcement — edits go through GSD commands | Phase 2 executes through 4 plan files under `gsd-execute-phase` |
| Brand: must NOT feel like typical edu-tech — no heavy dark UI, no corporate tone | Calm tone on lesson-complete (D-10); copywriting contract from UI-SPEC enforced |
| Scope: MVP only — no scope creep before validation | Notes entry point (NOTES-02) is Phase 4; not added to feedback panel in Phase 2 |

---

## Sources

### Primary (HIGH confidence)
- Codebase direct read: `src/features/onboarding/SampleLessonEngine.tsx` — authoritative reference implementation for quiz engine pattern
- Codebase direct read: `src/features/ui/theme.ts` — all design token values confirmed
- Codebase direct read: `src/types/database.ts` — schema types confirmed; `lesson_attempts` absent, must be added
- Codebase direct read: `supabase/migrations/00001_content_schema.sql` — questions join path through sections confirmed
- Codebase direct read: `supabase/migrations/00002_user_tables.sql` — `user_lesson_progress` upsert target confirmed; `profiles.streak_count` confirmed
- Codebase direct read: `package.json` — all required packages confirmed present; no new installs needed
- `.planning/phases/02-study-flow/02-CONTEXT.md` — all locked decisions D-01 through D-14
- `.planning/phases/02-study-flow/02-UI-SPEC.md` — all visual tokens, interaction contracts, animation spec

### Secondary (MEDIUM confidence)
- [React Native Animations — reactnative.dev](https://reactnative.dev/docs/animations) — `useNativeDriver: true` constraint on transform/opacity confirmed; layout properties incompatible
- [TanStack Query v5 useMutation docs](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation) — `isPending` (not `isLoading`), `onSuccess`/`onError` callback shape confirmed
- [Expo Router URL parameters](https://docs.expo.dev/router/reference/url-parameters/) — `useLocalSearchParams` for dynamic segment values confirmed

### Tertiary (LOW confidence)
- WebSearch: Zustand v5 TypeScript `create<State>()` pattern — consistent with installed `useAuthStore` which already uses this syntax; treated as HIGH in context of codebase confirmation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed installed via `package.json`; all version constraints verified
- Architecture: HIGH — patterns derived directly from existing codebase (SampleLessonEngine, useAuthStore, WindowedFlatList); no speculative choices
- Pitfalls: HIGH — all pitfalls derived from direct code inspection of schema (join path), RN animation constraints (official docs), and Phase 1 established patterns
- Data migration: HIGH — schema read directly; `lesson_attempts` absence confirmed; CHECK constraint pattern for CONT-06 verified against existing migration patterns

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (30 days — stable stack, no fast-moving dependencies)
