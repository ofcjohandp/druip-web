---
phase: 02-study-flow
plan: "03"
subsystem: quiz-engine
tags: [react-native, animated, zustand, tanstack-query, quiz-engine, tdd]
dependency_graph:
  requires: [02-01, 02-02]
  provides: [LessonEngine, QuestionCard, FeedbackPanel, lesson-route-screen, session-store-tests]
  affects: [02-04]
tech_stack:
  added: [react-test-renderer@19.1.0]
  patterns: [animated-spring-slide-up, synchronous-lock-pattern, single-card-render, testID-assertions]
key_files:
  created:
    - src/features/study/QuestionCard.tsx
    - src/features/study/FeedbackPanel.tsx
    - src/features/study/LessonEngine.tsx
    - src/app/lesson/[lessonId].tsx
  modified:
    - __tests__/question-card.test.tsx
    - __tests__/feedback-panel.test.tsx
    - __tests__/study-session-store.test.ts
    - jest.config.js
    - package.json
decisions:
  - "QuestionCard uses testID=option-{index} on TouchableOpacity for reliable RNTL assertions — avoids fragile parent-traversal style checks"
  - "@expo/vector-icons nested under expo/node_modules — added moduleNameMapper in jest.config.js to resolve Ionicons in tests"
  - "FeedbackPanel returns null when isVisible=false (not pointerEvents none) — simpler and test-assertable via toJSON() === null"
  - "LessonEngine useEffect cleanup calls clearSession() on unmount — prevents stale session state on back navigation"
  - "handleAnswer calls useStudySessionStore.getState().lockAnswer() directly (not via hook) — ensures synchronous update without React re-render batching delay"
metrics:
  duration: "~15m"
  completed_date: "2026-04-06"
  tasks_completed: 2
  files_created: 4
  files_modified: 5
---

# Phase 2 Plan 03: Quiz Engine — Question Card, Feedback Panel, Lesson Engine Summary

**One-liner:** Core quiz engine with synchronous answer lock (150ms contract), Animated.spring feedback panel, and LessonEngine orchestrator wiring session store + TanStack Query into a single-card render loop.

## What Was Built

This plan implements the heart of the Druip study flow — where the student actually learns. All interaction contracts from the requirements (150ms lock, dual highlight, manual Continue, progress bar) are implemented here.

### QuestionCard Component (Task 1)

`src/features/study/QuestionCard.tsx`:
- Progress bar at top: 6pt height, `COLORS.accent` fill, `COLORS.surface` track, `borderRadius: 3`, no animation (immediate width update per UI-SPEC)
- Question text: 20pt semibold, `lineHeight: 28`, `marginBottom: SPACING.lg`
- Answer options: `TouchableOpacity` with `disabled={isLocked}`, `activeOpacity: 0.7`, `hitSlop` (STUDY-08)
- Post-lock correct state: `backgroundColor: '#E8F5E9'`, `borderColor: COLORS.success`, `Ionicons checkmark-circle`
- Post-lock wrong selected state: `backgroundColor: '#FFEBEE'`, `borderColor: COLORS.error`, `Ionicons close-circle`
- Unselected wrong options: no style change (remain default surface state per UI-SPEC)
- `testID={option-{index}}` on each option for reliable test assertions

### FeedbackPanel Component (Task 1)

`src/features/study/FeedbackPanel.tsx`:
- `Animated.spring` from off-screen (translateY: 300) to visible (translateY: 0)
- Spring config: `friction: 8`, `tension: 40`, `useNativeDriver: true` (UI-SPEC)
- Panel positioned `absolute`, `bottom: 0`, `borderTopLeftRadius: RADII.modal` (24pt)
- Correct state: "Correct!" — 16pt regular
- Wrong state: "Correct answer: {text}" (14pt semibold) + explanation (14pt muted)
- Continue button: full-width, `backgroundColor: COLORS.accent`, `minHeight: 48` — NO auto-advance (STUDY-06)
- Returns `null` when `isVisible=false` (instant reset via `slideAnim.setValue(300)`)

### LessonEngine Orchestrator (Task 2)

`src/features/study/LessonEngine.tsx`:
- `useLessonQuestions(lessonId)` fetches questions via TanStack Query
- `useEffect` inits session when questions load, `clearSession()` on unmount (prevents stale state)
- Single-card render — NO FlatList (SEED-06). Question card swaps when `currentIndex` changes
- `handleAnswer`: calls `useStudySessionStore.getState().lockAnswer()` directly for synchronous lock (150ms contract, STUDY-04)
- `handleContinue`: `router.replace` to `/lesson-complete` on last question (D-09 — no back-swipe to completed session)
- Progress formula: `(currentIndex + (isLocked ? 1 : 0)) / sessionQuestions.length` — monotonically increasing (STUDY-01, STUDY-02)
- `options.slice(0, 4)` + `as string[]` cast for JSONB options field (STUDY-03)
- Loading: `ActivityIndicator` centered in `COLORS.accent`
- Error: "Couldn't load this lesson. Check your connection and try again." (UI-SPEC copywriting)

### Lesson Route Screen (Task 2)

`src/app/lesson/[lessonId].tsx`:
- Thin wrapper — fetches `xp_reward` and `topic_id` from lessons table via TanStack Query
- `useLocalSearchParams` extracts `lessonId` and `topicId` from route params
- `resolvedTopicId` falls back to `lesson.topic_id` if `topicId` not passed in params
- Returns `null` while lesson record loads (LessonEngine handles question-loading state internally)

### Session Store Tests (Task 2)

`__tests__/study-session-store.test.ts` — 8 passing tests replacing TODO stubs:
- `initSession` sets all fields and resets answers array
- Progress fraction is monotonically non-decreasing across lock+advance cycles
- `lockAnswer` sets `isLocked=true` and records selected index
- `lockAnswer` is idempotent (double-tap cannot mutate state)
- Score increments on correct answer, stays flat on wrong
- `advance` increments index and clears lock
- `clearSession` resets all fields to initial values

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added moduleNameMapper for @expo/vector-icons in jest.config.js**
- **Found during:** Task 1 test run
- **Issue:** `@expo/vector-icons/Ionicons` not resolvable by Jest — package is nested inside `expo/node_modules` rather than top-level `node_modules`
- **Fix:** Added `'^@expo/vector-icons(.*)$': '<rootDir>/node_modules/expo/node_modules/@expo/vector-icons$1'` to `moduleNameMapper` in `jest.config.js`
- **Files modified:** `jest.config.js`
- **Commit:** 241acd5

**2. [Rule 3 - Blocking] Installed react-test-renderer@19.1.0**
- **Found during:** Task 1 test run
- **Issue:** `@testing-library/react-native` required `react-test-renderer` as peer dependency — tests failed with "Fix it by running: npm install -D react-test-renderer@19.1.0"
- **Fix:** Installed the missing peer dep
- **Files modified:** `package.json`, `package-lock.json`
- **Commit:** 241acd5

**3. [Rule 2 - Missing] Used testID on TouchableOpacity options for reliable test assertions**
- **Found during:** Task 1 — initial RNTL tests using `getAllByRole('button')` failed (TouchableOpacity doesn't expose as role="button"), then parent-traversal via `getByText(...).parent` returned wrong node depth
- **Fix:** Added `testID={option-{index}}` to each `TouchableOpacity` in QuestionCard; rewrote tests to use `getByTestId`
- **Files modified:** `src/features/study/QuestionCard.tsx`, `__tests__/question-card.test.tsx`
- **Commit:** 241acd5

## Verification Results

```
Test Suites: 13 passed, 13 total
Tests:       38 todo, 20 passed, 58 total
Time:        0.621 s
```

All tests pass. `npx jest --passWithNoTests` exits 0.

- `study-session-store` — 8 passing
- `question-card` — 5 passing
- `feedback-panel` — 5 passing

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | 241acd5 | feat(02-03): QuestionCard + FeedbackPanel components with lock/feedback states |
| Task 2 | 5ab920c | feat(02-03): LessonEngine orchestrator + lesson route screen + session store tests |

## Known Stubs

None — all components are fully implemented and wired to real data sources. The lesson-complete route (`/lesson-complete`) referenced in `handleContinue` is registered in `_layout.tsx` (from Plan 02) and will be built in Plan 04.

## Self-Check: PASSED
