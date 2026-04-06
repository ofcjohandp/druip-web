---
phase: 01-foundation
plan: "04"
subsystem: ui
tags: [expo-router, ionicons, react-native, theme, flatlist, tabs]

requires:
  - phase: 01-foundation plan 01
    provides: "Expo project scaffold with src/features/, src/app/(tabs)/ directories and placeholder screens"

provides:
  - "theme.ts: COLORS, RADII, SPACING design tokens (D-10 through D-14)"
  - "Button component with primary/secondary/ghost variants and minHeight 48"
  - "Card component with surface background, card radius, md padding"
  - "WindowedFlatList with SEED-06 windowing config (windowSize=5)"
  - "5-tab bottom navigator with Ionicons, accent active tint, lazy=false (DASH-04, D-15, D-16, D-17)"
  - "5 themed placeholder screens with SafeAreaView and theme constants"

affects:
  - "All subsequent phases building screens inside the 5 tabs"
  - "All components using Button, Card, or WindowedFlatList"
  - "Any feature needing design tokens (import from theme.ts)"

tech-stack:
  added: []
  patterns:
    - "theme.ts as single source of truth for all design tokens — no hardcoded colors in components"
    - "WindowedFlatList wrapper pattern for all content lists (not study session question cards)"
    - "SafeAreaView with COLORS.background as standard screen container"
    - "TabIcon helper component pattern for Tabs.Screen tabBarIcon prop"

key-files:
  created:
    - "src/features/ui/theme.ts"
    - "src/features/ui/Button.tsx"
    - "src/features/ui/Card.tsx"
    - "src/features/ui/WindowedFlatList.tsx"
  modified:
    - "src/app/(tabs)/_layout.tsx"
    - "src/app/(tabs)/index.tsx"
    - "src/app/(tabs)/study.tsx"
    - "src/app/(tabs)/progress.tsx"
    - "src/app/(tabs)/notes.tsx"
    - "src/app/(tabs)/profile.tsx"

key-decisions:
  - "WindowedFlatList spreads windowing defaults first then {...props} so consumers can override if needed"
  - "keyExtractor intentionally NOT defaulted in WindowedFlatList — consumers must provide stable UUID-based keys"
  - "lazy: false set on Tabs screenOptions per D-17 — all tabs render immediately after auth"
  - "TabIcon extracted as a small helper component inside _layout.tsx to keep tabBarIcon prop clean"

patterns-established:
  - "Pattern: All color/spacing/radius values come from src/features/ui/theme.ts — never hardcode"
  - "Pattern: Use WindowedFlatList for all content lists; render single Card for active study session question"
  - "Pattern: Screen containers use SafeAreaView with backgroundColor: COLORS.background"

requirements-completed: [DASH-04, SEED-06]

duration: 2min
completed: 2026-04-06
---

# Phase 01 Plan 04: UI Shell Summary

**5-tab Ionicons navigator with coral accent (#FF6B6B), theme.ts design tokens (D-10..D-14), Button/Card/WindowedFlatList primitives, and SafeAreaView-wrapped placeholder screens**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-06T12:38:12Z
- **Completed:** 2026-04-06T12:40:39Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Theme constants file established as single source of truth for all design tokens (D-10 through D-14): COLORS with coral accent #FF6B6B, RADII with 12/16/24px values, SPACING with generous gaps
- Shared UI primitives created: Button (primary/secondary/ghost, minHeight 48), Card (surface bg, card radius, 16px padding), WindowedFlatList (SEED-06 windowing config)
- 5-tab bottom navigator fully wired with Ionicons, COLORS.accent active tint, lazy=false — all tabs render immediately (DASH-04, D-15, D-16, D-17)
- All 5 placeholder tab screens upgraded from raw View to SafeAreaView with theme constants — no hardcoded colors remain

## Task Commits

1. **Task 1: Create theme constants and shared UI primitives** - `c018208` (feat)
2. **Task 2: Build 5-tab bottom navigator with icons and placeholder screens** - `a25b63a` (feat)

## Files Created/Modified

- `src/features/ui/theme.ts` - COLORS, RADII, SPACING design tokens (D-10..D-14)
- `src/features/ui/Button.tsx` - Reusable button with primary/secondary/ghost variants, minHeight 48
- `src/features/ui/Card.tsx` - Card primitive with surface bg, card radius, md padding
- `src/features/ui/WindowedFlatList.tsx` - FlatList wrapper with SEED-06 windowing props
- `src/app/(tabs)/_layout.tsx` - 5-tab navigator with Ionicons, accent tint, lazy=false
- `src/app/(tabs)/index.tsx` - Home placeholder with SafeAreaView + theme
- `src/app/(tabs)/study.tsx` - Study placeholder with SafeAreaView + theme
- `src/app/(tabs)/progress.tsx` - Progress placeholder with SafeAreaView + theme
- `src/app/(tabs)/notes.tsx` - Notes placeholder with SafeAreaView + theme
- `src/app/(tabs)/profile.tsx` - Profile placeholder with SafeAreaView + theme

## Decisions Made

- `WindowedFlatList` spreads windowing defaults before `{...props}` so consumers can override; `keyExtractor` intentionally omitted — callers must provide stable UUID-based keys (prevents silent bugs)
- `lazy: false` applied at `screenOptions` level per D-17 — ensures all 5 tabs mount immediately after auth, no per-tab override needed
- `TabIcon` extracted as a local helper component inside `_layout.tsx` to keep `tabBarIcon` props clean and typed via `IoniconName`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Known Stubs

The following tab screens are intentional placeholders pending full feature implementation:

| File | Stub | Resolved by |
|------|------|-------------|
| `src/app/(tabs)/index.tsx` | "Your dashboard will appear here" | Phase 02+ |
| `src/app/(tabs)/study.tsx` | "Your topics and lessons will appear here" | Phase 02+ |
| `src/app/(tabs)/progress.tsx` | "Your readiness and stats will appear here" | Phase 02+ |
| `src/app/(tabs)/notes.tsx` | "Your study notes will appear here" | Phase 02+ |
| `src/app/(tabs)/profile.tsx` | "Your profile and settings will appear here" | Phase 02+ |

These stubs are intentional per plan design — the tab navigator shell is the deliverable of this plan. Full screen content is the scope of subsequent phases.

## Next Phase Readiness

- Theme tokens, Button, Card, and WindowedFlatList are available for import by any subsequent plan
- 5-tab navigator is the authenticated app shell — Plan 01-03 (auth flow) connects users into this shell
- No blockers. Plans 01-02 (Supabase schema) and 01-03 (auth/onboarding) can proceed independently

---
*Phase: 01-foundation*
*Completed: 2026-04-06*
