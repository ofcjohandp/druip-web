---
phase: 09-ui-overhaul
plan: "04"
subsystem: student-screens
tags: [classroom-card, home-screen, classroom-detail, subscribe-confirm, confetti, reanimated, avatar, tag]
dependency_graph:
  requires: [09-02]
  provides: [ClassroomCard-v2, home-screen-v2, classroom-detail-v2, subscribe-confirm-v2]
  affects: [src/features/student/ClassroomCard.tsx, src/app/(tabs)/index.tsx, src/app/(tabs)/classroom-detail.tsx, src/app/(tabs)/subscribe-confirm.tsx]
tech_stack:
  added: ["react-native-confetti-cannon@1.5.2"]
  patterns: [Pressable+Reanimated-scale, Avatar-initials-fallback, Tag-pills-horizontal-scroll, ConfettiCannon-on-success, TYPOGRAPHY-array-styles]
key_files:
  created: []
  modified:
    - src/features/student/ClassroomCard.tsx
    - src/app/(tabs)/index.tsx
    - src/app/(tabs)/classroom-detail.tsx
    - src/app/(tabs)/subscribe-confirm.tsx
    - package.json
decisions:
  - "ClassroomCard uses standalone Pressable + Reanimated scale (withSpring 0.97) — not Card pressable wrapper — per Phase 05-P02 decision to avoid nested pressables"
  - "react-native-confetti-cannon installed via npm --legacy-peer-deps fallback (expo install fails due to react-dom peer conflict in this project)"
  - "classroom-detail TouchableOpacity replaced with Pressable for header back button consistency"
  - "Tag component used in classroom-detail subjects row (replacing inline View pills)"
metrics:
  duration: "~8min"
  completed: "2026-04-08"
  tasks_completed: 2
  files_modified: 5
---

# Phase 9 Plan 4: Student Screens Redesign Summary

Redesigned ClassroomCard with Avatar initials, Tag pills, and terracotta price badge using Reanimated scale press; migrated home/discovery, classroom-detail, and subscribe-confirm screens to design system tokens with confetti cannon celebration on successful subscription.

## What Was Built

### Task 1: ClassroomCard redesign

`src/features/student/ClassroomCard.tsx` fully rewritten:

- **Pressable + Reanimated scale**: `TouchableOpacity` removed entirely. `useSharedValue(1)` + `withSpring(0.97)` on `onPressIn`, `withSpring(1)` on `onPressOut`. `Animated.View` wraps the card container.
- **Avatar**: `<Avatar name={tutorEmail} size={40} />` renders tutor initial (first char of email) in a `COLORS.primary` circle — no photo URL available yet, initials fallback activates.
- **Tag pills**: Subjects rendered via `<Tag label={subject} />` in a horizontal `ScrollView`, replacing the inline `View`/`Text` pill rows.
- **Price badge**: `COLORS.primary` (terracotta) background, `COLORS.textOnAccent` white text, `RADII.button` radius, `alignSelf: 'flex-start'` — displays `R{price}/mo`.
- **Card container**: `COLORS.card` (white) background with shadow (`shadowOpacity: 0.10`, `shadowRadius: 8`, `elevation: 4`) — no border, shadow provides visual boundary.
- **Typography**: `TYPOGRAPHY.subheading` for classroom name, `TYPOGRAPHY.caption` for tutor email and price text.
- **Props interface unchanged**: Same `ClassroomCardProps` — zero downstream breakage.

### Task 2: Home, classroom-detail, and subscribe-confirm screens

**index.tsx (home/discovery)**:
- Section headers ("Your Classrooms", "Browse Classrooms") now use `[TYPOGRAPHY.heading, { color: COLORS.text }]` — Syne_800ExtraBold at 24px.
- Empty state and error messages use `TYPOGRAPHY.subheading` / `TYPOGRAPHY.body` with `COLORS.textMuted`.
- Removed `sectionAccentBar` and `sectionLabel` ad-hoc styles entirely.

**classroom-detail.tsx (UI-09)**:
- `TouchableOpacity` back button replaced with `Pressable` (44x44 hit area preserved).
- Classroom name: `TYPOGRAPHY.display` (32px Syne, bold) — most prominent element on screen.
- Tutor attribution: `TYPOGRAPHY.body` + `COLORS.textMuted`.
- Subjects: `<Tag>` components replacing inline pill `View`s, with `flexWrap: 'wrap'` and `gap` spacing.
- Price: `TYPOGRAPHY.subheading` + `COLORS.primary` (terracotta emphasis).
- Sections heading: `TYPOGRAPHY.subheading` + `COLORS.text`.
- Header: `TYPOGRAPHY.heading` for "Classroom" title, `gap: SPACING.sm` layout.

**subscribe-confirm.tsx (D-17)**:
- `ConfettiCannon` fires on `mutation.onSuccess` with 80 particles from top-center.
- Colors: `[COLORS.accent, COLORS.accentSecondary, COLORS.primary, '#FFFFFF']` — coral, amber, terracotta, white.
- `fadeOut` + `onAnimationEnd` clears `showConfetti` state.
- Classroom name: `TYPOGRAPHY.heading` centered.
- Price: `TYPOGRAPHY.subheading` + `COLORS.primary`.
- Body copy: `TYPOGRAPHY.body` + `COLORS.textMuted`.
- `TouchableOpacity` back button replaced with `Pressable`.

## Commits

| Task | Commit  | Description |
|------|---------|-------------|
| 1    | b37bacc | feat(09-04): redesign ClassroomCard with Avatar, Tag pills, price badge, Reanimated press |
| 2    | 2ca93d1 | feat(09-04): redesign home, classroom-detail, subscribe-confirm screens with confetti |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed stateBody style reference removed from StyleSheet**
- **Found during:** Task 2 TypeScript verification
- **Issue:** After removing `stateBody` from `StyleSheet.create`, the error state `<Text style={styles.stateBody}>` still referenced it — TypeScript error TS2339.
- **Fix:** Replaced `styles.stateBody` with inline `[TYPOGRAPHY.body, { color: COLORS.textMuted, textAlign: 'center' }]` — consistent with rest of file.
- **Files modified:** `src/app/(tabs)/index.tsx`
- **Commit:** 2ca93d1 (included in Task 2 commit)

**2. [Rule 3 - Blocking] expo install failed for react-native-confetti-cannon**
- **Found during:** Task 2 package installation
- **Issue:** `npx expo install react-native-confetti-cannon` exited with ERESOLVE due to `react-dom@19.2.5` peer conflict in this project.
- **Fix:** Used `npm install react-native-confetti-cannon --legacy-peer-deps` per plan's stated fallback. Pure RN package — no Expo SDK peer resolution needed.
- **Files modified:** `package.json`, `package-lock.json`
- **Commit:** 2ca93d1

## Known Stubs

None. All components are fully implemented with complete API wiring. ClassroomCard renders Avatar from `tutorEmail` (initials fallback active — no photo URL available in current data model, which is expected). ConfettiCannon is wired to the existing `mutation.onSuccess` callback — no stub logic.

## Self-Check: PASSED
