---
phase: 10-ui-polish
plan: "03"
subsystem: ui
tags: [tag-contrast, classroom-card, avatar-ring, border, dark-theme]
dependency_graph:
  requires: []
  provides: [tag-contrast-fix, classroom-card-border, avatar-accent-ring]
  affects: [src/features/ui/Tag.tsx, src/features/student/ClassroomCard.tsx]
tech_stack:
  added: []
  patterns: [COLORS.surface for tag pills on dark cards, borderWidth/borderColor instead of shadow on dark backgrounds, accent-colored avatar ring]
key_files:
  modified:
    - src/features/ui/Tag.tsx
    - src/features/student/ClassroomCard.tsx
decisions:
  - Tag pillDefault uses COLORS.surface (#152232) — darker than COLORS.card (#1C2F42), creating visible contrast when tags render on ClassroomCards
  - ClassroomCard drop shadow removed; replaced with borderWidth:1 + borderColor:COLORS.border — shadows render poorly against dark backgrounds
  - Avatar wrapped in 48x48 View with 2px COLORS.accent border ring — 4px larger than avatar (40px) to show ring on all sides
metrics:
  duration: "2min"
  completed: "2026-04-09"
  tasks_completed: 2
  files_modified: 2
---

# Phase 10 Plan 03: Tag Contrast + ClassroomCard Polish Summary

Tag pills on dark ClassroomCards now use COLORS.surface background for contrast, shadow replaced with border, and avatar wrapped in accent ring.

## What Was Done

### Task 1: Tag contrast fix (src/features/ui/Tag.tsx)

Changed `pillDefault.backgroundColor` from `COLORS.card` to `COLORS.surface`:

- Before: `backgroundColor: COLORS.card` (#1C2F42) — same color as ClassroomCard background, invisible
- After: `backgroundColor: COLORS.surface` (#152232) — darker than card, creates visible contrast

`pillSelected` unchanged (accent color is correct).

### Task 2: ClassroomCard border + avatar ring (src/features/student/ClassroomCard.tsx)

**Change A — Shadow replaced with border on card style:**
- Removed: `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, `elevation`
- Added: `borderWidth: 1`, `borderColor: COLORS.border`

**Change B — Avatar wrapped in accent ring:**
- Avatar in JSX wrapped in `<View style={styles.avatarRing}>`
- New `avatarRing` StyleSheet entry: 48x48, borderRadius 24, borderWidth 2, borderColor COLORS.accent, centered content

## Verification Results

**Tag.tsx — no hardcoded hex values:**
- `pillDefault`: `backgroundColor: COLORS.surface`, `borderColor: COLORS.border`
- `pillSelected`: `backgroundColor: COLORS.accent + '1A'`, `borderColor: COLORS.accent`
- No `#` hex literals

**ClassroomCard.tsx — shadow removed, avatarRing present:**
- No `shadowColor`, `shadowOffset`, `shadowOpacity` in file
- `avatarRing` style present at line 89
- `borderWidth: 1` on card style at line 81
- No `#` hex literals (former `'#000'` in shadowColor is gone)

**TypeScript:** exits 0, zero errors.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- src/features/ui/Tag.tsx: FOUND and modified
- src/features/student/ClassroomCard.tsx: FOUND and modified
- TypeScript: clean
- No hardcoded hex values in either file
- avatarRing style and JSX wrapper both present
