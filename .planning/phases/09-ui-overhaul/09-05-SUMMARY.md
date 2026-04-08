---
phase: 09-ui-overhaul
plan: "05"
subsystem: ui-screens
tags: [design-system, typography, messaging, tab-bar, profile, pdf-viewer]
dependency_graph:
  requires: [09-01, 09-02]
  provides: [full-app-design-system-migration]
  affects: [manage-classroom, classroom-settings, dm-chat, profile, pdf-viewer, tab-bar]
tech_stack:
  added: []
  patterns: [TYPOGRAPHY-array-styles, Pressable-replace-TouchableOpacity, Avatar-in-profile, ChatInput-pill-container, MessageBubble-tail-radii]
key_files:
  created: []
  modified:
    - src/app/(tabs)/_layout.tsx
    - src/app/(tabs)/manage-classroom.tsx
    - src/app/(tabs)/classroom-settings.tsx
    - src/app/(tabs)/dm-chat.tsx
    - src/app/(tabs)/profile.tsx
    - src/app/(tabs)/pdf-viewer.tsx
    - src/features/messaging/MessageBubble.tsx
    - src/features/messaging/ChatInput.tsx
decisions:
  - "Tab bar background changed from COLORS.background (cream) to COLORS.card (white) for visual anchor against cream pages"
  - "classroom-settings replaced all inline TextInput/TouchableOpacity with Input/Button shared components"
  - "ChatInput replaced Button Send with Ionicons send icon + Pressable — pill-shaped container with borderRadius:24"
  - "MessageBubble sent bubble uses COLORS.primary (terracotta) not COLORS.accent — deeper brand color for own messages"
  - "profile.tsx uses useAuthStore email as Avatar name source — no separate profile name field in DB for MVP"
metrics:
  duration: "~8min"
  completed: "2026-04-08"
  tasks_completed: 2
  files_modified: 8
---

# Phase 9 Plan 5: Remaining Screens and Tab Bar Migration Summary

Full-app design system migration completed — all 8 remaining files migrated to TYPOGRAPHY tokens, shared components, and brand palette, with tab bar updated to white background and coral active tint.

## What Was Built

### Task 1: manage-classroom, classroom-settings, tab bar

**_layout.tsx:**
- `tabBarStyle.backgroundColor` changed from `COLORS.background` (cream) to `COLORS.card` (white) — creates visual anchor
- Added `tabBarLabelStyle` with `fontSize: TYPOGRAPHY.caption.fontSize` (12px) and `fontWeight: '500'`
- `tabBarActiveTintColor: COLORS.accent` (was already set; confirmed correct)
- Added `TYPOGRAPHY` import

**manage-classroom.tsx:**
- Added `TYPOGRAPHY` import
- `headerTitle` style: replaced `fontSize:20, fontWeight:'600'` with `...TYPOGRAPHY.subheading`
- `errorText`, `emptyHeading`, `emptyBody`, `messagesHeading`, `messagesEmpty`: all replaced with TYPOGRAPHY tokens
- `Button` component was already in use — no changes needed to action buttons

**classroom-settings.tsx** (full rewrite):
- Replaced all `<TextInput>` form fields with `<Input>` component (name, bio, price fields)
- Replaced inline `<TouchableOpacity>` CTA with `<Button variant="primary" loading={...}>` — loading state handled by Button
- Replaced back button `TouchableOpacity` with `Pressable` (44x44 hit area)
- Header title: `...TYPOGRAPHY.subheading`
- Field labels: `...TYPOGRAPHY.bodySmall`
- Removed `RADII` import (no longer needed — Input handles its own radius)

### Task 2: DM chat, profile, pdf-viewer

**MessageBubble.tsx:**
- Sent bubble: `backgroundColor: COLORS.primary` (terracotta), `borderBottomRightRadius: 4` tail
- Received bubble: `backgroundColor: COLORS.card` (white), `borderBottomLeftRadius: 4` tail, `borderWidth:1, borderColor: COLORS.border`
- Both: `maxWidth: '78%'`, `borderRadius: 16`
- Text styles use `...TYPOGRAPHY.body`, timestamp uses `...TYPOGRAPHY.caption`

**ChatInput.tsx** (full rewrite):
- Replaced Button + TextInput layout with pill-container pattern
- Outer wrapper: `COLORS.background`, `borderTopWidth:1`, `borderTopColor: COLORS.border`
- Inner container: `COLORS.card`, `borderRadius: 24`, `borderWidth:1`, `borderColor: COLORS.border`
- Send button: Ionicons `send` icon, `color: COLORS.accent` (active) or `COLORS.textMuted` (disabled)

**dm-chat.tsx:**
- Added `TYPOGRAPHY` import
- `headerTitle`: `...TYPOGRAPHY.subheading`
- `errorText`, `emptyHeading`, `emptyBody`: TYPOGRAPHY tokens applied

**profile.tsx** (full rewrite):
- Added `Avatar` component — renders with `userEmail` as name source (initial letter fallback)
- Added profile card section with `Avatar size={64}` and email/role display
- Title: `...TYPOGRAPHY.heading`
- Sign-out replaced with `<Button variant="ghost">` component
- `Card pressable onPress` used for classroom card (no nested TouchableOpacity)
- All text styles use TYPOGRAPHY tokens

**pdf-viewer.tsx:**
- Added `TYPOGRAPHY` import
- `headerTitle`: `...TYPOGRAPHY.subheading`
- `errorText`: `...TYPOGRAPHY.body`

## Commits

| Task | Commit  | Description |
|------|---------|-------------|
| 1    | 8f40723 | feat(09-05): migrate manage-classroom, classroom-settings, tab bar to design system |
| 2    | d20ab80 | feat(09-05): redesign DM chat, profile, and pdf-viewer with design system tokens |

## Deviations from Plan

### Auto-fixed Issues

None — all changes matched plan exactly.

**Minor implementation note:** ChatInput's send button was replaced with `Ionicons send` icon + `Pressable` rather than keeping the `Button` component. This matches the plan's D-13 spec exactly (plan explicitly specified Ionicons `send` icon with Pressable). No deviation.

## Known Stubs

None. All screens are fully wired with live data. No placeholder text or unconnected data sources introduced.

## Self-Check: PASSED
