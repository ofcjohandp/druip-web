---
phase: 05-student-discovery-and-subscriptions
plan: P02
type: execute
wave: 1
depends_on:
  - 05-P00
files_modified:
  - src/features/student/ClassroomCard.tsx
  - src/features/student/LockedContentOverlay.tsx
  - src/app/(tabs)/_layout.tsx
autonomous: true
requirements:
  - DISC-01
  - DISC-02
  - DISC-03
  - DISC-04

must_haves:
  truths:
    - "ClassroomCard renders classroom name, tutor name, subject tags, bio excerpt, and price — using only theme tokens"
    - "LockedContentOverlay renders a lock icon + muted section name for non-subscribers"
    - "classroom-detail and subscribe-confirm are registered in _layout.tsx as href:null screens"
  artifacts:
    - path: "src/features/student/ClassroomCard.tsx"
      provides: "Tappable classroom card for discovery list"
      exports: ["ClassroomCard"]
    - path: "src/features/student/LockedContentOverlay.tsx"
      provides: "Lock icon + muted text overlay for sections"
      exports: ["LockedContentOverlay"]
    - path: "src/app/(tabs)/_layout.tsx"
      provides: "Navigation registry for classroom-detail and subscribe-confirm"
      contains: "classroom-detail"
  key_links:
    - from: "src/features/student/ClassroomCard.tsx"
      to: "src/app/(tabs)/classroom-detail.tsx"
      via: "router.push('/(tabs)/classroom-detail?id=' + classroomId)"
      pattern: "classroom-detail"
    - from: "src/app/(tabs)/_layout.tsx"
      to: "src/app/(tabs)/classroom-detail.tsx"
      via: "Tabs.Screen name='classroom-detail' href={null}"
      pattern: "href.*null"
---

<objective>
Build the two reusable UI components and register the two new hidden screens in the tab layout.

Purpose: Screens (P03) import ClassroomCard and LockedContentOverlay directly. Navigation to detail and confirm screens cannot work until they are registered in _layout.tsx. This plan runs parallel to P01 — no dependency between hooks and components.

Output: 2 component files in src/features/student/, updated _layout.tsx.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/05-student-discovery-and-subscriptions/05-CONTEXT.md
@.planning/phases/05-student-discovery-and-subscriptions/05-UI-SPEC.md

<interfaces>
<!-- From src/features/ui/theme.ts — ALL tokens to use -->
```typescript
export const COLORS = {
  background: '#FFFFFF',
  surface: '#FAFAF8',
  accent: '#FF6B6B',
  text: '#1A1A1A',
  textMuted: '#9E9E9E',
  textOnAccent: '#FFFFFF',
  border: '#EBEBEB',
  error: '#D32F2F',
  success: '#388E3C',
} as const;

export const RADII = { button: 12, card: 16, modal: 24 } as const;
export const SPACING = { xs: 8, sm: 12, md: 16, lg: 24, xl: 32 } as const;
```

<!-- From src/features/ui/Button.tsx — use for CTAs -->
Button accepts variant="primary" | "ghost" and onPress, disabled, children props.

<!-- From src/app/(tabs)/_layout.tsx — current registered screens -->
Currently registered with href:null: study/[topicId], classroom-settings
Pattern to add: <Tabs.Screen name="classroom-detail" options={{ title: 'Classroom', href: null }} />
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: ClassroomCard component</name>
  <files>src/features/student/ClassroomCard.tsx</files>
  <read_first>
    - src/features/ui/theme.ts — ALL tokens; no hardcoded values allowed
    - src/features/ui/Card.tsx — may wrap or reference; check if it can be reused
    - src/app/(tabs)/_layout.tsx — confirm href:null pattern before writing navigation call
    - .planning/phases/05-student-discovery-and-subscriptions/05-UI-SPEC.md — ClassroomCard layout spec
  </read_first>
  <action>
Create `src/features/student/ClassroomCard.tsx`.

Props interface:
```typescript
interface ClassroomCardProps {
  id: string;
  name: string;
  tutorEmail: string;       // display as-is for v1.0 (no display_name yet)
  subjects: string[];
  bio: string | null;
  priceCents: number;
}
```

Layout (per UI-SPEC ClassroomCard section):
1. Outer: `TouchableOpacity` with `activeOpacity={0.8}`, `accessibilityRole="button"` — full card tappable
2. Container: `COLORS.surface` background, `RADII.card` (16) border radius, `SPACING.md` (16) internal padding, `SPACING.sm` (12) bottom margin, border 1px `COLORS.border`
3. Row 1: classroom name — fontSize 20, fontWeight '600', color `COLORS.text`
4. Row 2: tutor email — fontSize 14, fontWeight '400', color `COLORS.textMuted`, marginTop `SPACING.xs`
5. Row 3: subject tags — horizontal `ScrollView` (horizontal=true, showsHorizontalScrollIndicator=false) wrapping pill `View` for each subject: `COLORS.surface` background (re-use same), `COLORS.border` border 1px, `RADII.button` (12) radius, paddingVertical `SPACING.xs`, paddingHorizontal `SPACING.sm`, text fontSize 14, color `COLORS.textMuted`, marginRight `SPACING.xs`
6. Row 4: bio excerpt — `numberOfLines={2}`, fontSize 16, fontWeight '400', color `COLORS.textMuted`, marginTop `SPACING.xs`
7. Row 5: price — `R${priceCents / 100}/month` — fontSize 14, fontWeight '600', color `COLORS.text`, marginTop `SPACING.sm`

Navigation on press: `router.push(\`/(tabs)/classroom-detail?id=\${id}\`)`

Import `router` from `expo-router` with `import { router } from 'expo-router'`.

No shadow on the card — border only (per UI-SPEC: "No shadow — border only").
  </action>
  <verify>
    <automated>grep "COLORS\." "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/student/ClassroomCard.tsx" | wc -l</automated>
    Expect: at least 5 (multiple token usages)

    <automated>grep "classroom-detail" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/student/ClassroomCard.tsx"</automated>
    Expect: 1 match (navigation target)

    <automated>grep "#" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/student/ClassroomCard.tsx"</automated>
    Expect: 0 matches (no hardcoded hex colors)
  </verify>
  <done>
    - ClassroomCard renders: name, tutorEmail, subjects (pills), bio (2-line truncated), price
    - Full card is tappable and navigates to /(tabs)/classroom-detail?id={id}
    - Zero hardcoded hex colors — all tokens from theme.ts
    - accessibilityRole="button" on TouchableOpacity
  </done>
</task>

<task type="auto">
  <name>Task 2: LockedContentOverlay component + _layout.tsx update</name>
  <files>
    src/features/student/LockedContentOverlay.tsx
    src/app/(tabs)/_layout.tsx
  </files>
  <read_first>
    - src/app/(tabs)/_layout.tsx — read FULL current file before editing; add to existing, do NOT rewrite
    - src/features/ui/theme.ts — COLORS tokens
    - .planning/phases/05-student-discovery-and-subscriptions/05-UI-SPEC.md — LockedContentOverlay spec
  </read_first>
  <action>
**1. Create src/features/student/LockedContentOverlay.tsx**

Props:
```typescript
interface LockedContentOverlayProps {
  sectionName: string;
}
```

Layout (per UI-SPEC):
- Outer `View`: flexDirection 'row', alignItems 'center', backgroundColor `COLORS.surface`, borderRadius `RADII.button` (12), padding `SPACING.sm`, marginBottom `SPACING.xs`
- Lock icon: `Ionicons name="lock-closed-outline"` size={16} color={`COLORS.textMuted`}, marginRight `SPACING.xs`
  - Import: `import Ionicons from '@expo/vector-icons/Ionicons'`
  - `accessibilityLabel="Locked — subscribe to access"`
- Section name text: fontSize 14, fontWeight '400', color `COLORS.textMuted`, flex 1 (to prevent overflow)

The overlay does NOT use `rgba` — uses `COLORS.surface` directly as the background (the surface token is the warm off-white; the 0.85 opacity in UI-SPEC is for when it overlays other content; here it's a standalone row so use full opacity).

**2. Update src/app/(tabs)/_layout.tsx**

Read the full file first. AFTER the existing `classroom-settings` Tabs.Screen entry (the last href:null entry), ADD these two entries:

```typescript
      <Tabs.Screen
        name="classroom-detail"
        options={{ title: 'Classroom', href: null }}
      />
      <Tabs.Screen
        name="subscribe-confirm"
        options={{ title: 'Subscribe', href: null }}
      />
```

Do NOT change any existing entries. Do NOT add tabBarIcon to the new hidden screens.
  </action>
  <verify>
    <automated>grep "classroom-detail\|subscribe-confirm" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/app/(tabs)/_layout.tsx" | wc -l</automated>
    Expect: 2

    <automated>grep "href.*null" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/app/(tabs)/_layout.tsx" | wc -l</automated>
    Expect: 4 (existing 2 + 2 new)

    <automated>grep "lock-closed-outline" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/student/LockedContentOverlay.tsx"</automated>
    Expect: 1 match

    <automated>grep "#" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/student/LockedContentOverlay.tsx"</automated>
    Expect: 0 matches
  </verify>
  <done>
    - LockedContentOverlay renders lock icon + muted section name using only theme tokens
    - _layout.tsx has classroom-detail and subscribe-confirm registered as href:null
    - No existing _layout.tsx entries modified
  </done>
</task>

</tasks>

<verification>
After both tasks:
1. `grep "classroom-detail\|subscribe-confirm" src/app/(tabs)/_layout.tsx | wc -l` returns 2
2. `grep "#" src/features/student/ClassroomCard.tsx` returns 0 (no hardcoded hex)
3. `grep "#" src/features/student/LockedContentOverlay.tsx` returns 0
4. ClassroomCard.tsx contains `classroom-detail` in the navigation call
5. LockedContentOverlay.tsx contains `lock-closed-outline`
</verification>

<success_criteria>
- ClassroomCard is a complete, tappable, theme-token-only component
- LockedContentOverlay renders lock icon and muted text
- _layout.tsx registers both new screens — navigation to them will work in P03
- No hardcoded colors in either component
</success_criteria>

<output>
After completion, create `.planning/phases/05-student-discovery-and-subscriptions/05-P02-SUMMARY.md`
</output>
