---
phase: 02-study-flow
plan: "02"
subsystem: study-navigation
tags: [react-native, expo-router, tanstack-query, topic-browser, lesson-list]
dependency_graph:
  requires: [02-01]
  provides: [TopicCard, LessonListItem, useUserLessonProgress, study-tab-screen, lesson-list-screen, route-registration]
  affects: [02-03, 02-04]
tech_stack:
  added: []
  patterns: [windowed-flat-list, lesson-lock-state-derivation, module-lesson-count-aggregation]
key_files:
  created:
    - src/features/study/TopicCard.tsx
    - src/features/study/LessonListItem.tsx
    - src/features/study/useUserLessonProgress.ts
    - src/features/study/useModuleLessonCounts.ts
    - src/app/(tabs)/study/[topicId].tsx
  modified:
    - src/app/(tabs)/study.tsx
    - src/app/(tabs)/_layout.tsx
    - src/app/_layout.tsx
decisions:
  - "useModuleLessonCounts fetches all module lessons in one query and groups by topic_id client-side — avoids N+1 per-topic queries on the Study tab"
  - "First published module fetched dynamically via useFirstModule hook — no hardcoded module ID; staleTime 1 hour"
  - "getLessonState derives lock state: completed > index-0-current > prev-not-completed-locked > current; single pass through ordered lessons array"
  - "LessonListItem disabled=true for locked state; onPress handler also guards with state check in parent for defense in depth"
metrics:
  duration: "~2m"
  completed_date: "2026-04-06"
  tasks_completed: 2
  files_created: 5
  files_modified: 3
---

# Phase 2 Plan 02: Study Tab Browser + Lesson List Summary

**One-liner:** Study tab topic browser with readiness tiers and lesson count using WindowedFlatList + TopicCard, plus a lesson list screen with lock/complete/current state derivation wired to Supabase user progress data.

## What Was Built

This plan builds the D-01 through D-04 navigation structure students use to enter the study flow: topic list → lesson list → (quiz, handled by Plan 03).

### TopicCard Component (Task 1)

`src/features/study/TopicCard.tsx`:
- Renders topic name (16pt semibold), readiness tier label (14pt muted), and lesson count ("N of M lessons done", 14pt muted) per D-02 and UI-SPEC Topic Card spec
- `getReadinessTier(done, total)` exported separately for reuse in Phase 3 readiness tracking
- Tiers: "Not Started" (0%), "Learning" (1–49%), "Practicing" (50–79%), "Ready" (80–100%)
- `minHeight: 48` on TouchableOpacity (STUDY-08)
- All tokens from `theme.ts` — no hardcoded values

### LessonListItem Component (Task 1)

`src/features/study/LessonListItem.tsx`:
- Four states: `locked`, `completed`, `current`, `unlocked`
- Locked: `disabled={true}`, `opacity: 0.5`, `lock-closed` Ionicons icon in `COLORS.textMuted` (D-03)
- Completed: muted text + `checkmark-circle` Ionicons icon in `COLORS.success`
- Current: full opacity + 2pt left border in `COLORS.accent` (D-04)
- Unlocked: full opacity, no decoration
- `minHeight: 48` on all states (STUDY-08)

### useUserLessonProgress Hook (Task 1)

`src/features/study/useUserLessonProgress.ts`:
- TanStack Query hook fetching `user_lesson_progress` rows for a given userId + lessonIds array
- `enabled: !!userId && lessonIds.length > 0` prevents unnecessary queries
- `staleTime: 60s` — progress data is near-realtime after lesson completion

### Study Tab Screen (Task 2)

`src/app/(tabs)/study.tsx` replaced the placeholder with:
- `useFirstModule` inline hook fetches the first published module (staleTime 1 hour)
- `useTopics(moduleId)` fetches published topics
- `useModuleLessonCounts(moduleId)` fetches all lessons grouped by topic_id in one query
- `useUserLessonProgress` fetches all user progress for the module at once
- WindowedFlatList renders TopicCard for each topic with computed lessonsDone/lessonsTotal
- Loading state: centered ActivityIndicator + "Loading topics..."
- Empty state: "Study content is being prepared" heading + "Check back soon." body (UI-SPEC copywriting)
- `router.push('/(tabs)/study/${topic.id}')` on topic card tap

### useModuleLessonCounts Hook (Task 2)

`src/features/study/useModuleLessonCounts.ts`:
- Fetches all published lessons for a module in one query, returns `Record<topicId, lessonId[]>`
- Avoids N+1 queries (one query vs one per topic)

### Lesson List Screen (Task 2)

`src/app/(tabs)/study/[topicId].tsx`:
- `useLocalSearchParams<{ topicId: string }>()` extracts topicId from route
- `useLessons(topicId)` + `useUserLessonProgress(userId, lessonIds)` data
- `getLessonState` derives state per lesson: completed > first-is-current > locked-if-prev-incomplete > current
- Empty state: "No published lessons yet" heading + "This topic has no published lessons yet." body
- `router.push('/lesson/${lesson.id}?topicId=${topicId}')` on unlocked/completed/current tap
- Locked items: onPress handler guarded by state check; LessonListItem has `disabled=true`

### Route Registration (Task 2)

`src/app/(tabs)/_layout.tsx` — Added `study/[topicId]` screen with `href: null` (hidden from tab bar, only accessible via navigation).

`src/app/_layout.tsx` — Registered `lesson/[lessonId]` and `lesson-complete` screens (both `headerShown: false`) ahead of Plans 03 and 04 creating those files.

## Deviations from Plan

### Auto-added Missing Functionality

**1. [Rule 2 - Missing] Added useModuleLessonCounts helper hook**
- **Found during:** Task 2
- **Issue:** Plan mentioned creating `useModuleLessonCounts` or inlining logic; created as standalone hook for reuse
- **Fix:** Created `src/features/study/useModuleLessonCounts.ts` fetching all module lessons in one query grouped by topic_id
- **Files modified:** `src/features/study/useModuleLessonCounts.ts` (new)
- **Commit:** bc956b5

None other — plan executed as written.

## Verification Results

```
Test Suites: 13 passed, 13 total
Tests:       48 todo, 10 passed, 58 total
Time:        0.49 s
```

All tests pass. `npx jest --passWithNoTests` exits 0.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | 45a18be | feat(02-02): TopicCard + LessonListItem components + useUserLessonProgress hook |
| Task 2 | bc956b5 | feat(02-02): Study tab screen + lesson list screen + route registration |

## Known Stubs

None — all components are fully wired to real data sources. The lesson lock state is computed from live Supabase user_lesson_progress data.

## Self-Check: PASSED
