# Phase 9: UI Overhaul - Context

**Gathered:** 2026-04-08 (assumptions mode)
**Status:** Ready for planning

<domain>
## Phase Boundary

Full visual redesign of every screen in the app to feel energetic, modern, and distinctly South African — not corporate edu-tech. Covers:
- Design system: `theme.ts` (colors, typography, spacing, radii)
- Shared components: `Button`, `Card`, new `Input`, `Tag`, `Avatar`
- Every screen: auth (sign-in, sign-up), onboarding (6 steps), home/discovery, classroom detail, manage classroom, DM chat, profile, PDF viewer, subscribe confirm, classroom settings

Does NOT include new features, database changes, or navigation architecture changes.
</domain>

<decisions>
## Implementation Decisions

### Design System — Color Palette

- **D-01:** Replace current minimal palette with a richer multi-token Yoco/Superbalist-inspired system: deep warm amber or terracotta as primary, electric coral as accent (replacing soft #FF6B6B), off-white/cream surfaces, near-black text. Brand direction: bold, premium, African warmth — not corporate or pastel.
- **D-02:** `theme.ts` remains the single source of truth. All new tokens added there. No hardcoded colors anywhere else. Token names stay the same where possible (`COLORS.accent`, `COLORS.surface`, etc.) to minimize cascading changes — new tokens added alongside where needed.
- **D-03:** Add a secondary accent token (`COLORS.accentSecondary`) for use in celebration moments and highlights. Add a `COLORS.card` token distinct from `COLORS.surface` to allow card backgrounds to pop against the page background.

### Design System — Typography

- **D-04:** Introduce a custom display font loaded via `expo-font` in `app/_layout.tsx`. Font used for headings and feature titles only — body text stays system fonts (SF Pro / Roboto) for readability and load speed.
- **D-05:** Define `TYPOGRAPHY` tokens in `theme.ts`: heading sizes (32, 24, 20), body (16, 14), caption (12). Font weights: 800 for display headings, 600 for section titles, 400 for body. Applied consistently across all screens — no ad-hoc `fontSize` values in screen files.

### Component Architecture

- **D-06:** All shared components live in `src/features/ui/`. New components added this phase: `Input` (replaces inline `TextInput` implementations in auth and onboarding screens), `Tag` (for subject tags, help-type bubbles), `Avatar` (for tutor/student profile images).
- **D-07:** Every screen-level inline button/input/card implementation migrated to use shared components. `sign-in.tsx`, `sign-up.tsx`, `ClassroomCard.tsx`, and onboarding steps all have inline styles that must be replaced.
- **D-08:** `Button` gains a `loading` prop (renders `ActivityIndicator` inside the button instead of title text) and an optional `icon` prop (renders Ionicons icon to the left of title). Existing `variant` API unchanged.
- **D-09:** `Card` gains an optional `elevated` prop (adds shadow for cards that should visually lift off the surface) and `pressable` prop (wraps in `Pressable` with scale animation). Non-breaking — existing usages unaffected.

### Screen Layout Patterns

- **D-10:** Auth screens (`sign-in.tsx`, `sign-up.tsx`) get a branded header zone: logo or wordmark, brand color block or illustration, above the form. First impression must feel like a product, not a form.
- **D-11:** Onboarding layout structure preserved: fixed header with `OnboardingProgress`, scrollable body, pinned footer `Button`. Visual upgrades only: progress indicator redesigned (pill/bar replacing plain dots), selection list items get styled active states (border, background tint, checkmark).
- **D-12:** Home/discovery screen gets section headers with personality — not plain `<Text>` titles. Classroom cards upgraded: tutor avatar, subject tag pills, price badge. "Your Classrooms" and "Browse" sections visually distinct.
- **D-13:** DM chat: message bubbles styled with brand palette. Student bubbles vs tutor bubbles visually differentiated. Input bar with rounded container.

### Navigation & Visual Identity

- **D-14:** Tab bar stays as Expo Router `<Tabs>` with Ionicons. No custom tab bar component. Updates: `tabBarActiveTintColor` to new accent, `tabBarStyle` background to new surface color, `tabBarLabelStyle` for custom typography.
- **D-15:** Screen headers (back button rows, screen titles) standardized: consistent height, consistent `fontWeight`, accent-colored or visually anchored. No more ad-hoc per-screen header implementations.

### Interaction & Animation

- **D-16:** Press feedback upgraded across all interactive elements: `Pressable` with a scale-down transform (0.97) using `react-native-reanimated` (already installed from Phase 8). Replaces flat `activeOpacity: 0.8` pattern uniformly.
- **D-17:** Celebration moment for subscribe-confirm: simple confetti or scale-pop animation on successful subscription. One moment of delight — students feel rewarded for subscribing.
- **D-18:** All other animations kept minimal — no complex page transitions or gesture systems in this phase. Phase 9 is about visual identity, not interaction redesign.

### Claude's Discretion

- Exact color hex values within the Yoco/Superbalist direction — deep amber/terracotta palette, electric coral accent
- Specific font family choice (research which Google Font / Expo font fits the brand best)
- Shadow elevation values for `Card elevated` prop
- Whether `expo-linear-gradient` is used for any hero sections or if flat color blocks suffice
- Exact confetti/celebration implementation for subscribe-confirm

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `src/features/ui/theme.ts` — Current token definitions; all updates go here first
- `src/features/ui/Button.tsx` — Current Button implementation; will be extended in-place
- `src/features/ui/Card.tsx` — Current Card implementation; will be extended in-place

### Screens in Scope
- `src/app/(auth)/sign-in.tsx` — Auth screen with inline styles to migrate
- `src/app/(auth)/sign-up.tsx` — Auth screen with inline styles to migrate
- `src/app/(auth)/onboarding/step-2-university.tsx` — Representative onboarding pattern
- `src/app/(tabs)/index.tsx` — Home/discovery screen
- `src/app/(tabs)/classroom-detail.tsx` — Classroom detail with section/card rendering
- `src/app/(tabs)/manage-classroom.tsx` — Tutor management screen
- `src/app/(tabs)/dm-chat.tsx` — Direct messaging screen
- `src/app/(tabs)/profile.tsx` — Profile screen
- `src/app/(tabs)/subscribe-confirm.tsx` — Subscribe confirmation + celebration moment
- `src/app/(tabs)/_layout.tsx` — Tab bar configuration

### Components with Inline Style Fragmentation (Must Migrate)
- `src/features/student/ClassroomCard.tsx` — Has own card container, not using shared Card.tsx
- `src/features/classroom/StudentCardRenderer.tsx` — Card-type rendering
- `src/features/onboarding/OnboardingProgress.tsx` — Progress dots to redesign

### Stack Reference
- `CLAUDE.md` §Technology Stack — Expo SDK version, Reanimated already installed

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/features/ui/theme.ts` — All tokens; replace values in-place for global effect
- `src/features/ui/Button.tsx` — Extend with `loading` + `icon` props; variant API stable
- `src/features/ui/Card.tsx` — Extend with `elevated` + `pressable` props; non-breaking
- `react-native-reanimated` — Already installed (Phase 8); use for press animations and celebration moment
- `Ionicons` from `@expo/vector-icons` — Already used everywhere; no icon library change needed

### Established Patterns
- Every screen imports `COLORS`, `SPACING`, `RADII` from `src/features/ui/theme` — single update point for visual tokens
- Expo Router file-based routing — no navigation changes needed for visual work
- `SafeAreaView` + `ScrollView` + `StyleSheet.create` is the established screen shell — preserve it, just style differently

### Integration Points
- `app/_layout.tsx` — Where `expo-font` loading must be added (font load gate)
- `src/app/(tabs)/_layout.tsx` — Tab bar colors updated here via `screenOptions`
- `src/features/ui/` — All new/updated shared components land here

</code_context>

<specifics>
## Specific Ideas

- **Brand direction confirmed:** Yoco/Superbalist energy — deep warm amber or terracotta primary, electric coral accent, off-white/cream surface, near-black text. Bold, premium, African warmth.
- **No dark mode in this phase** — light theme only, designed to feel warm not cold
- **Font must feel bold and confident** — not playful/rounded (that reads as edu-tech). Something with weight.
- **Celebration on subscribe** — one delight moment. Students should feel good when they commit to a tutor.
- **Tab bar active state** should feel distinct and branded — not just a color tint on a grey bar

</specifics>

<deferred>
## Deferred Ideas

- Dark mode — not in scope for Phase 9; adds significant complexity
- Custom tab bar component with animations — defer; standard Expo Router tab bar with updated styles is sufficient
- Page transition animations (shared element, hero transitions) — future phase
- Push notification UI — separate phase
- In-app illustration system — if custom illustrations needed, that's a design asset phase; Phase 9 uses color + typography to create identity

</deferred>

---

*Phase: 09-ui-overhaul*
*Context gathered: 2026-04-08 (assumptions mode)*
