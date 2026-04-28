---
phase: 09-ui-overhaul
plan: "03"
subsystem: auth-onboarding
tags: [auth, onboarding, typography, design-system, branded-header, pill-progress]
dependency_graph:
  requires: [09-01, 09-02]
  provides: [branded-auth-screens, pill-progress-indicator, onboarding-design-system-migration]
  affects:
    - src/app/(auth)/sign-in.tsx
    - src/app/(auth)/sign-up.tsx
    - src/features/onboarding/OnboardingProgress.tsx
    - src/app/(auth)/onboarding/step-1-profile.tsx
    - src/app/(auth)/onboarding/step-2-university.tsx
    - src/app/(auth)/onboarding/step-3-degree.tsx
    - src/app/(auth)/onboarding/step-4-subjects.tsx
    - src/app/(auth)/onboarding/step-5-help-type.tsx
    - src/app/(auth)/onboarding/step-6-test-date.tsx
tech_stack:
  added: []
  patterns:
    - branded-heroZone-header-block
    - TYPOGRAPHY-array-styles
    - accent-tint-selection-state
    - segmented-pill-progress-bar
key_files:
  created: []
  modified:
    - src/app/(auth)/sign-in.tsx
    - src/app/(auth)/sign-up.tsx
    - src/features/onboarding/OnboardingProgress.tsx
    - src/app/(auth)/onboarding/step-1-profile.tsx
    - src/app/(auth)/onboarding/step-2-university.tsx
    - src/app/(auth)/onboarding/step-3-degree.tsx
    - src/app/(auth)/onboarding/step-4-subjects.tsx
    - src/app/(auth)/onboarding/step-5-help-type.tsx
    - src/app/(auth)/onboarding/step-6-test-date.tsx
decisions:
  - "heroZone uses COLORS.primary (terracotta) with paddingTop:60 for status bar breathing room and 24px bottom radius"
  - "Switch off-thumb uses literal '#F4F3F4' (standard iOS/Android platform value) — not a design token violation"
  - "step-2-university list items use flexDirection:row to support inline Ionicons checkmark-circle icon"
  - "step-3-degree keeps raw TextInput for degree search (custom autocomplete dropdown) — fontSize:16 acceptable at component level"
metrics:
  duration: "~4min"
  completed: "2026-04-08"
  tasks_completed: 2
  files_modified: 9
---

# Phase 9 Plan 3: Auth and Onboarding Design System Migration Summary

Migrated auth screens (sign-in, sign-up) and all 6 onboarding steps to the Wave 1-2 design system — branded terracotta hero zones on auth screens, shared Input/Button components replacing inline TextInput/TouchableOpacity, TYPOGRAPHY tokens on all screen titles and subtitles, and a segmented pill progress bar replacing circular dots.

## What Was Built

### Task 1: sign-in.tsx and sign-up.tsx redesigned with branded headers and shared components

**sign-in.tsx:**
- Added `heroZone` block above the form: `COLORS.primary` (#C4622D terracotta) background, `paddingTop: 60`, 24px bottom radius, `TYPOGRAPHY.display` brand name "Druip", subtitle "Learn from the best"
- Replaced both `<TextInput>` elements with `<Input label="Email">` and `<Input label="Password">`
- Replaced `<TouchableOpacity>` submit button with `<Button loading={loading} disabled={!isOnline}>`
- Replaced hardcoded `#FFF3E0`/`#E65100` offline banner with `COLORS.accentSecondary + '33'` background and `COLORS.primary` text
- All title/error text replaced with TYPOGRAPHY tokens

**sign-up.tsx:**
- Same heroZone structure, subtitle "Join your tutor's classroom"
- Both `<TextInput>` fields replaced with `<Input>`
- `<TouchableOpacity>` submit replaced with `<Button loading={loading}>`
- Switch `trackColor` updated from `rgba(255,107,107,0.3)` to `COLORS.accent + '4D'`; `thumbColor` off-state set to `'#F4F3F4'` (standard platform value)
- All title/subtitle/toggle text replaced with TYPOGRAPHY tokens

### Task 2: OnboardingProgress pill bar + all 6 steps migrated

**OnboardingProgress.tsx:**
- Replaced circular dot implementation with segmented pill bar
- Each segment: `flex: 1`, `height: 4`, `borderRadius: 2`, `backgroundColor: COLORS.border`
- Active segments (i+1 <= currentStep): `backgroundColor: COLORS.accent`
- Container: `flexDirection: 'row'`, `gap: 4`, `paddingHorizontal: SPACING.lg`
- `styles.dot` and `styles.dotActive` removed entirely

**step-1-profile.tsx:**
- Replaced both `<TextInput>` fields with `<Input label="First name">` / `<Input label="Last name">`
- Title/subtitle replaced with `TYPOGRAPHY.heading` / `TYPOGRAPHY.body` tokens
- Photo placeholder text updated to `TYPOGRAPHY.caption`

**step-2-university.tsx:**
- TYPOGRAPHY import added; title/subtitle replaced with tokens
- List items restructured as `flexDirection: 'row'` with inline `<Ionicons name="checkmark-circle">` on selected items
- Selected state: `COLORS.accent + '1A'` background, `COLORS.accent` border (replaces solid accent fill)
- Stale `title`/`subtitle` style entries removed

**step-3-degree.tsx, step-4-subjects.tsx, step-5-help-type.tsx, step-6-test-date.tsx:**
- TYPOGRAPHY import added to all four files
- Screen title replaced with `[TYPOGRAPHY.heading, { color: COLORS.text }]`
- Screen subtitle replaced with `[TYPOGRAPHY.body, { color: COLORS.textMuted }]`
- Stale `title`/`subtitle` style entries removed

## Commits

| Task | Commit  | Description |
|------|---------|-------------|
| 1    | a40bd76 | feat(09-03): redesign sign-in and sign-up with branded hero zones and shared components |
| 2    | e5d107f | feat(09-03): replace dots with pill bar in OnboardingProgress and migrate all 6 onboarding steps to design system |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All changes are visual migrations of existing functional screens. No data sources, no placeholder content.

## Self-Check: PASSED

- `src/app/(auth)/sign-in.tsx` — FOUND, contains heroZone, TYPOGRAPHY.display, Input, Button imports
- `src/app/(auth)/sign-up.tsx` — FOUND, contains heroZone, TYPOGRAPHY.heading, Input, Button, COLORS.accent Switch
- `src/features/onboarding/OnboardingProgress.tsx` — FOUND, contains styles.segment, styles.segmentActive, no dots
- `src/app/(auth)/onboarding/step-1-profile.tsx` — FOUND, Input components, TYPOGRAPHY.heading
- `src/app/(auth)/onboarding/step-2-university.tsx` — FOUND, COLORS.accent selection state, Ionicons checkmark
- `src/app/(auth)/onboarding/step-3-degree.tsx` — FOUND, TYPOGRAPHY import and tokens
- `src/app/(auth)/onboarding/step-4-subjects.tsx` — FOUND, TYPOGRAPHY tokens
- `src/app/(auth)/onboarding/step-5-help-type.tsx` — FOUND, TYPOGRAPHY tokens
- `src/app/(auth)/onboarding/step-6-test-date.tsx` — FOUND, TYPOGRAPHY tokens
- Commits a40bd76, e5d107f — FOUND in git log
- TypeScript: no new errors introduced (pre-existing Ionicons type declaration errors unchanged)
- Hardcoded colors #FFF3E0, #E65100, rgba(255,107,107): none found in auth/onboarding
- Dots (dotActive, styles.dot) in OnboardingProgress: none found
