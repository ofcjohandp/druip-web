# Phase 10: UI Polish — Context

**Gathered:** 2026-04-09
**Status:** Ready for planning
**Source:** Device testing feedback from Johan

<domain>
## Phase Boundary

Fix font rendering, screen header zones, and component contrast issues found during first real device test. No new features — polish only. Every change is a fix or refinement, not an addition.

</domain>

<decisions>
## Implementation Decisions

### Typography Fix (LOCKED)
- Remove `fontWeight` from all TYPOGRAPHY tokens that already specify `fontFamily` — mixing both causes React Native to fail finding the correct font variant, producing stretched/distorted text
- TYPOGRAPHY.subheading, body, bodySmall, label, caption all use Nunito variants — `fontWeight` must be dropped from these (the named font handles weight)
- TYPOGRAPHY.display and heading use Syne_800ExtraBold — no fontWeight needed there either
- Where screens or components need bold body text, they must reference `TYPOGRAPHY.label` (Nunito_600SemiBold) or `TYPOGRAPHY.subheading` (Nunito_700Bold) instead of adding fontWeight inline

### Screen Header Zones (LOCKED)
- Home tab: already has top padding via SafeAreaView + scroll — verify breathing room is adequate, adjust paddingTop if needed
- Study tab: "Browse Classrooms" / section title slams into top of screen — needs a dedicated header zone above the FlatList. Add a fixed header row with title "Study" or greeting, consistent with other tabs
- Profile tab: already has card layout from top — verify no clipping
- All tabs must have consistent top padding so content never touches the status bar

### Tag Component Contrast (LOCKED)  
- Tag.tsx `pillDefault` uses `backgroundColor: COLORS.card` — on dark card backgrounds (ClassroomCard uses COLORS.card too), tags are invisible
- Fix: change Tag `pillDefault` background to `COLORS.surface` (slightly lighter than card) and border to `COLORS.border` — creates visible contrast
- Tag selected state stays as-is (accent color border + tinted bg)

### ClassroomCard Polish (LOCKED)
- Price badge already works (orange, readable)
- Avatar ring: add a subtle border ring around the avatar circle in accent color for visual pop
- Card shadow: add a subtle border (`borderWidth: 1, borderColor: COLORS.border`) instead of shadow (shadows don't render well on dark backgrounds in RN)

### Study Screen Header (LOCKED)
- Add a simple top header area above the FlatList content: bold "Study" title + current date, matching Home screen style
- Consistent left padding with the rest of the content

### Font Fallback Safety (LOCKED)
- Any StyleSheet that uses `fontWeight` alongside a `fontFamily` string must be audited and the `fontWeight` removed
- Exception: inline styles on native Text components where no fontFamily is set (system font) — those can keep fontWeight

### Claude's Discretion
- Exact paddingTop values for header zones (match device safe area)
- Whether Study header shows a greeting or just a static "Study" label
- Minor spacing tweaks discovered during implementation

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `src/features/ui/theme.ts` — COLORS, TYPOGRAPHY, RADII, SPACING tokens — single source of truth
- `src/features/ui/Tag.tsx` — current Tag implementation with contrast bug
- `src/features/ui/Button.tsx` — Button component (verify no fontWeight conflicts)
- `src/features/ui/Card.tsx` — Card component

### Screens to Fix
- `src/app/(tabs)/study.tsx` — missing header zone
- `src/app/(tabs)/index.tsx` — home screen (verify padding)
- `src/app/(tabs)/profile.tsx` — profile student card

### Font Loading
- `src/app/_layout.tsx` — where Syne + Nunito are loaded via useFonts

</canonical_refs>

<specifics>
## Device Test Evidence

Screenshots from Johan's device showed:
1. "Morning, Test" and "Browse Classrooms" text appeared stretched/distorted — confirmed fontFamily + fontWeight conflict in TYPOGRAPHY tokens
2. Study tab: "Browse Classrooms" section title appeared at the very top of the screen with no header or breathing room
3. Profile screen looked good — student card concept is correct
4. Home screen dark theme, orange accents, and layout looked right overall
5. ClassroomCard rendered correctly with avatar, subject tags, bio, price badge

</specifics>

<deferred>
## Deferred

- Haptic feedback on tab press (expo-haptics) — nice-to-have, defer to v1.1
- Animated tab bar transitions — defer
- Additional screen polish beyond the 3 identified screens — defer to real user feedback

</deferred>

---

*Phase: 10-ui-polish*
*Context gathered: 2026-04-09*
