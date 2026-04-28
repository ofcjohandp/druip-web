---
phase: 09-ui-overhaul
plan: "02"
subsystem: design-system
tags: [components, button, card, input, tag, avatar, reanimated, design-tokens]
dependency_graph:
  requires: [09-01]
  provides: [Button-v2, Card-v2, Input-component, Tag-component, Avatar-component]
  affects: [all-screens-using-Button, all-screens-using-Card, Wave-3-screen-migrations]
tech_stack:
  added: []
  patterns: [Pressable+Reanimated-scale, ActivityIndicator-loading, Ionicons-icon-prop, elevated-shadow, initials-fallback]
key_files:
  created:
    - src/features/ui/Input.tsx
    - src/features/ui/Tag.tsx
    - src/features/ui/Avatar.tsx
  modified:
    - src/features/ui/Button.tsx
    - src/features/ui/Card.tsx
decisions:
  - "Button uses Pressable + Animated.View (not TouchableOpacity) — Reanimated scale replaces activeOpacity pattern"
  - "Card background changed from COLORS.surface to COLORS.card (white) so cards pop against cream background"
  - "Tag uses COLORS.accent + '1A' string concatenation for 10% opacity selected background — avoids opacity prop"
  - "Avatar initials derived from name.trim().charAt(0).toUpperCase() with '?' fallback for no-name case"
  - "All hooks (useSharedValue, useAnimatedStyle) called unconditionally in Card — pressable wrapper applied conditionally in JSX"
metrics:
  duration: "~5min"
  completed: "2026-04-08"
  tasks_completed: 2
  files_modified: 5
---

# Phase 9 Plan 2: Shared UI Components Summary

Extended Button and Card with new interactive props, and created three new components (Input, Tag, Avatar) — all using design tokens from Plan 01, giving Wave 3 screen migrations a complete, consistent component API.

## What Was Built

### Task 1: Button extended with loading, icon, and Reanimated press

`src/features/ui/Button.tsx` rewrites the press mechanism and adds two optional props:

- **Pressable + Reanimated scale**: `TouchableOpacity` replaced entirely. `useSharedValue(1)` + `withSpring(0.97)` on `onPressIn`, `withSpring(1)` on `onPressOut`. `Animated.View` wraps inner content.
- **`loading?: boolean`**: When true, renders `<ActivityIndicator>` instead of title. Button is disabled during loading. Indicator color matches variant (white on primary, accent on others).
- **`icon?: React.ComponentProps<typeof Ionicons>['name']`**: Renders Ionicons icon at 16px with 6px margin-right, wrapped with title in a row `<View>`.
- **Variant API preserved exactly**: primary/secondary/ghost backgrounds, text colors, disabled opacity — all unchanged. Existing consumers compile without modification.
- **`ButtonProps` interface exported** for downstream typing.

### Task 2: Card extended; Input, Tag, Avatar created

**Card.tsx** (`src/features/ui/Card.tsx`):
- `elevated?: boolean` — adds iOS shadow (`shadowOpacity: 0.10`, `shadowRadius: 8`) + Android `elevation: 4`
- `pressable?: boolean` + `onPress?: () => void` — wraps in `<Pressable>` + `<Animated.View>` with same Reanimated scale pattern as Button
- Background updated from `COLORS.surface` to `COLORS.card` (white) per D-03
- Hooks always called unconditionally; pressable wrapper applied conditionally in JSX

**Input.tsx** (`src/features/ui/Input.tsx`):
- Full typed `InputProps` interface: label, value, onChangeText, placeholder, error, secureTextEntry, keyboardType, autoCapitalize, autoComplete, multiline, numberOfLines, editable
- Optional label above with `TYPOGRAPHY.bodySmall` style
- TextInput with `COLORS.surface` background, `RADII.button` radius, error-conditional border color
- Optional error message below with `TYPOGRAPHY.caption` + `COLORS.error`

**Tag.tsx** (`src/features/ui/Tag.tsx`):
- Pill shape: `paddingVertical: 6`, `paddingHorizontal: SPACING.sm`, `borderRadius: 20`
- Default: `COLORS.card` background, `COLORS.border` border, `COLORS.textMuted` text
- Selected: `COLORS.accent + '1A'` background, `COLORS.accent` border and text
- Optional `onPress` wraps in `<Pressable>`; no Reanimated scale (too small)

**Avatar.tsx** (`src/features/ui/Avatar.tsx`):
- If `uri` truthy: `<Image>` with circular `borderRadius: size/2`
- Fallback: `COLORS.primary` circle with first-letter initials (uppercase), `fontSize: size * 0.4`, white `fontWeight: '600'`
- Default `size` is 40

## Commits

| Task | Commit  | Description |
|------|---------|-------------|
| 1    | 8654cec | feat(09-02): extend Button with loading, icon, and Reanimated press feedback |
| 2    | 06efd27 | feat(09-02): extend Card and create Input, Tag, Avatar components |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All components are fully implemented with complete prop APIs and theme token wiring. No placeholder text, hardcoded empty values, or unconnected data sources.

## Self-Check: PASSED
