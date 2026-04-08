---
phase: 09-ui-overhaul
plan: "01"
subsystem: design-system
tags: [theme, typography, fonts, design-tokens]
dependency_graph:
  requires: []
  provides: [COLORS-12-tokens, TYPOGRAPHY-6-levels, Syne_800ExtraBold-font-gate]
  affects: [all-screens-importing-theme.ts, src/app/_layout.tsx]
tech_stack:
  added: ["@expo-google-fonts/syne@0.4.2"]
  patterns: [useFonts-hook, font-gate-merged-with-auth-gate, array-style-typography]
key_files:
  created: []
  modified:
    - src/features/ui/theme.ts
    - src/app/_layout.tsx
    - package.json
decisions:
  - "TYPOGRAPHY tokens must be used as array styles [TYPOGRAPHY.display, {color}] — not spread in StyleSheet.create"
  - "Font gate merged with auth gate: single SplashScreen.hideAsync() gated by both fontsLoaded && !isLoading"
  - "COLORS retains all prior keys; 3 new tokens added (primary, card, accentSecondary)"
metrics:
  duration: "4min"
  completed: "2026-04-08"
  tasks_completed: 2
  files_modified: 3
---

# Phase 9 Plan 1: Design System Foundation Summary

Established complete design system tokens in theme.ts and wired Syne_800ExtraBold font loading into the root layout gate — enabling all Wave 2+ plans to reference COLORS.primary, TYPOGRAPHY.display, etc. without creating them.

## What Was Built

### Task 1: Design tokens overhaul + font package install

`src/features/ui/theme.ts` now exports 4 objects:

- **COLORS** (12 keys): all prior keys preserved, values updated to warm cream/terracotta palette; 3 new keys added — `primary` (#C4622D deep terracotta), `card` (#FFFFFF), `accentSecondary` (#FFB347 warm amber)
- **TYPOGRAPHY** (6 levels): `display`, `heading` (both use Syne_800ExtraBold), `subheading`, `body`, `bodySmall`, `caption`
- **RADII** (3 keys): unchanged
- **SPACING** (5 keys): unchanged

`@expo-google-fonts/syne` installed via `npx expo install`.

### Task 2: Font loading gate in root layout

`src/app/_layout.tsx` now loads `Syne_800ExtraBold` before rendering any screens. The existing auth-loading splash gate was merged (not duplicated) with the font gate:

- Single `SplashScreen.hideAsync()` call, gated by `fontsLoaded && !isLoading`
- Guard: `if (!fontsLoaded || isLoading) return null`
- All auth logic (session, pendingTutorOnboarding, pendingStudentOnboarding) untouched

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 55a6b71 | feat(09-01): install @expo-google-fonts/syne and overhaul design tokens |
| 2 | 4690efe | feat(09-01): wire Syne font loading gate into root layout |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. This plan only modifies static token constants and a font loading hook. No UI rendering, no data sources.

## Self-Check: PASSED

- `src/features/ui/theme.ts` — FOUND, exports COLORS (12 keys), TYPOGRAPHY (6 keys), RADII, SPACING
- `src/app/_layout.tsx` — FOUND, contains useFonts, single SplashScreen.hideAsync, merged gate
- `package.json` — FOUND, contains @expo-google-fonts/syne
- Commits 55a6b71, 4690efe — FOUND in git log
