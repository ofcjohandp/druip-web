---
phase: 10-ui-polish
plan: "01"
subsystem: ui
tags: [fonts, typography, style-fix, react-native]
dependency_graph:
  requires: []
  provides: [font-conflict-free-styles]
  affects: [all-screens, all-feature-components]
tech_stack:
  added: []
  patterns: [fontFamily-replaces-fontWeight, TYPOGRAPHY-token-alignment]
key_files:
  created: []
  modified:
    - src/features/ui/Button.tsx
    - src/features/ui/Avatar.tsx
    - src/features/study/QuestionCard.tsx
    - src/features/study/FeedbackPanel.tsx
    - src/features/study/TopicCard.tsx
    - src/features/study/LessonListItem.tsx
    - src/features/student/ClassroomCard.tsx
    - src/features/student/LockedContentOverlay.tsx
    - src/features/classroom/SectionRow.tsx
    - src/features/classroom/StudentCardRenderer.tsx
    - src/features/classroom/AddCardBottomSheet.tsx
    - src/features/onboarding/SampleLessonEngine.tsx
    - src/app/lesson-complete.tsx
    - src/app/sign-up-prompt.tsx
    - src/app/index.tsx
    - src/app/(tabs)/study/[topicId].tsx
    - src/app/(tabs)/progress.tsx
    - src/app/(tabs)/notes.tsx
    - src/app/(tabs)/manage-classroom.tsx
    - src/app/(tabs)/_layout.tsx
    - src/app/(auth)/create-classroom.tsx
    - src/app/(auth)/goal-selection.tsx
    - src/app/(auth)/tutor-profile.tsx
    - src/app/(auth)/onboarding/step-2-university.tsx
    - src/app/(auth)/onboarding/step-3-degree.tsx
    - src/app/(auth)/onboarding/step-6-test-date.tsx
decisions:
  - "Display-sized text (fontSize 28-48, formerly fontWeight 700) mapped to Syne_800ExtraBold — matches TYPOGRAPHY.display/heading intent"
  - "Heading-sized score text in sign-up-prompt (fontSize 24) mapped to Syne_800ExtraBold — consistent with TYPOGRAPHY.heading"
  - "Tab bar label fontWeight 500 replaced with fontFamily Nunito_600SemiBold — SemiBold reads cleanly at caption size"
  - "SectionRow nameInput and sectionName both fixed — TextInput accepts fontFamily on both iOS and Android"
  - "ClassroomCard price badge: fontWeight 600 on inline style conflicted with TYPOGRAPHY.caption fontFamily — replaced with fontFamily Nunito_600SemiBold"
  - "manage-classroom messagesHeading: TYPOGRAPHY.bodySmall spread sets Nunito_400Regular, fontWeight 600 overrides it incorrectly — replaced with fontFamily Nunito_600SemiBold"
metrics:
  duration: "4min"
  completed_date: "2026-04-09T08:07:42Z"
  tasks_completed: 2
  files_modified: 26
---

# Phase 10 Plan 01: Font Conflict Fix Summary

**One-liner:** Removed all 36 fontFamily+fontWeight conflicts across 26 files by replacing bare `fontWeight` with named Nunito/Syne `fontFamily` variants.

## What Was Done

In React Native, setting both `fontFamily` (e.g. `Nunito_400Regular`) and `fontWeight` on the same style object causes the OS to fail font variant lookup and fall back to the system font — producing the stretched/wrong-weight text Johan observed on device for "Morning, Test" and section titles.

This plan audited every `fontWeight` occurrence in `src/` and applied two rules:

- **Rule A** (fontWeight with no fontFamily): Added the correct named font variant and removed fontWeight.
- **Rule B** (fontWeight with fontFamily on same object): Removed fontWeight — the named variant already encodes it.

## Task 1: Feature Components (12 files, 17 conflicts fixed)

| File | Fix |
|------|-----|
| `src/features/ui/Button.tsx` | `text`: fontWeight '600' → fontFamily 'Nunito_600SemiBold' |
| `src/features/ui/Avatar.tsx` | `initialsText`: fontWeight '600' → fontFamily 'Nunito_600SemiBold' |
| `src/features/study/QuestionCard.tsx` | `questionText`: '600' → Nunito_600SemiBold; `optionText`: '400' → Nunito_400Regular |
| `src/features/study/FeedbackPanel.tsx` | `correctText`: '400' → Nunito_400Regular; `wrongHeader`: '600' → Nunito_600SemiBold; `explanationText`: '400' → Nunito_400Regular; `continueButtonText`: '600' → Nunito_600SemiBold |
| `src/features/study/TopicCard.tsx` | `name`: '600' → Nunito_600SemiBold |
| `src/features/study/LessonListItem.tsx` | `name`: '400' → Nunito_400Regular |
| `src/features/student/ClassroomCard.tsx` | inline price badge: fontWeight '600' + TYPOGRAPHY.caption conflict → fontFamily 'Nunito_600SemiBold' |
| `src/features/student/LockedContentOverlay.tsx` | `sectionName`: '400' → Nunito_400Regular |
| `src/features/classroom/SectionRow.tsx` | `sectionName` + `nameInput`: both '600' → Nunito_600SemiBold |
| `src/features/classroom/StudentCardRenderer.tsx` | `linkTitle`: '600' → Nunito_600SemiBold |
| `src/features/classroom/AddCardBottomSheet.tsx` | `title` + `saveButtonText`: both '600' → Nunito_600SemiBold |
| `src/features/onboarding/SampleLessonEngine.tsx` | `questionText` + `continueButtonText`: both '600' → Nunito_600SemiBold |

## Task 2: App Screens (14 files, 19 conflicts fixed)

| File | Fix |
|------|-----|
| `src/app/lesson-complete.tsx` | `xpLabel`: '400' → Nunito_400Regular; `xpValue`: '600' → Nunito_600SemiBold; `scoreText` + `streakText`: '400' → Nunito_400Regular; `continueButtonText`: '600' → Nunito_600SemiBold |
| `src/app/sign-up-prompt.tsx` | `celebration`: '700' → Syne_800ExtraBold; `scoreText`: '600' → Syne_800ExtraBold; `ctaText`: '600' → Nunito_600SemiBold |
| `src/app/index.tsx` | `logo`: '700' → Syne_800ExtraBold; `ctaText`: '600' → Nunito_600SemiBold |
| `src/app/(tabs)/study/[topicId].tsx` | `emptyHeading`: '600' → Nunito_600SemiBold |
| `src/app/(tabs)/progress.tsx` | `title`: '700' → Syne_800ExtraBold |
| `src/app/(tabs)/notes.tsx` | `title`: '700' → Syne_800ExtraBold |
| `src/app/(tabs)/manage-classroom.tsx` | `messagesHeading`: fontWeight '600' conflicts with TYPOGRAPHY.bodySmall spread → fontFamily 'Nunito_600SemiBold' |
| `src/app/(tabs)/_layout.tsx` | `tabBarLabelStyle`: fontWeight '500' → fontFamily 'Nunito_600SemiBold' |
| `src/app/(auth)/create-classroom.tsx` | `title`: '700' → Syne_800ExtraBold; `buttonText`: '600' → Nunito_600SemiBold |
| `src/app/(auth)/goal-selection.tsx` | `title`: '700' → Syne_800ExtraBold; `goalLabel`: '700' → Syne_800ExtraBold |
| `src/app/(auth)/tutor-profile.tsx` | `title`: '700' → Syne_800ExtraBold |
| `src/app/(auth)/onboarding/step-2-university.tsx` | `sectionLabel`: '600' → Nunito_600SemiBold |
| `src/app/(auth)/onboarding/step-3-degree.tsx` | `yearLabel` + `yearText`: both '600' → Nunito_600SemiBold |
| `src/app/(auth)/onboarding/step-6-test-date.tsx` | `clearText`: '600' → Nunito_600SemiBold |

## Verification Results

```
grep -rn "fontWeight" src --include="*.tsx" --include="*.ts"
# Output: (empty — zero matches)

tsc --noEmit
# Output: (clean — zero errors)
```

**Total fontWeight conflicts removed: 36**
**Files modified: 26**
**TypeScript: clean**

## Deviations from Plan

None — plan executed exactly as written. All specific file/line targets matched actual code.

## Known Stubs

None — this plan makes no data changes, only style fixes.

## Self-Check: PASSED

- All 26 modified files exist and were edited
- `grep fontWeight src/` returns zero matches
- `tsc --noEmit` exits clean
