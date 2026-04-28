# Phase 9: UI Overhaul - Research

**Researched:** 2026-04-08
**Domain:** React Native design system, Expo SDK 54, expo-font, react-native-reanimated 4.x, celebration animation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Deep warm amber or terracotta as primary, electric coral as accent (replacing #FF6B6B), off-white/cream surfaces, near-black text. Yoco/Superbalist direction.
- **D-02:** `theme.ts` remains single source of truth. Token names preserved where possible (`COLORS.accent`, `COLORS.surface`, etc.). New tokens added alongside.
- **D-03:** Add `COLORS.accentSecondary` (celebration/highlights) and `COLORS.card` (distinct from surface for card backgrounds).
- **D-04:** Custom display font loaded via `expo-font` in `app/_layout.tsx`. Font used for headings and feature titles only — body stays system fonts.
- **D-05:** `TYPOGRAPHY` tokens in `theme.ts`: heading sizes (32, 24, 20), body (16, 14), caption (12). Weights: 800 display, 600 section, 400 body. No ad-hoc fontSize in screen files.
- **D-06:** All shared components in `src/features/ui/`. New: `Input`, `Tag`, `Avatar`.
- **D-07:** Every screen-level inline button/input/card migrated to shared components.
- **D-08:** `Button` gains `loading` prop (ActivityIndicator) and optional `icon` prop (Ionicons left of title). Existing `variant` API unchanged.
- **D-09:** `Card` gains optional `elevated` prop (shadow) and `pressable` prop (scale animation). Non-breaking.
- **D-10:** Auth screens get branded header zone: logo/wordmark, brand color block or illustration, above the form.
- **D-11:** Onboarding: progress indicator redesigned (pill/bar replacing dots), selection list items get styled active states.
- **D-12:** Home/discovery: section headers with personality, ClassroomCard upgraded (tutor avatar, subject tag pills, price badge).
- **D-13:** DM chat: message bubbles with brand palette, student vs tutor visually differentiated. Input bar with rounded container.
- **D-14:** Tab bar stays Expo Router `<Tabs>` with Ionicons. Updated: `tabBarActiveTintColor`, `tabBarStyle`, `tabBarLabelStyle`.
- **D-15:** Screen headers standardized: consistent height, fontWeight, accent-colored or visually anchored.
- **D-16:** Press feedback: `Pressable` + scale-down (0.97) via `react-native-reanimated`. Replaces `activeOpacity: 0.8` pattern.
- **D-17:** Celebration on subscribe-confirm: confetti or scale-pop animation.
- **D-18:** All other animations minimal — no complex transitions in Phase 9.

### Claude's Discretion

- Exact hex values within the amber/terracotta direction
- Specific font family (research which Google Font fits brand best)
- Shadow elevation values for `Card elevated`
- Whether `expo-linear-gradient` is used for hero sections or flat color blocks suffice
- Exact confetti/celebration implementation

### Deferred Ideas (OUT OF SCOPE)

- Dark mode
- Custom tab bar component with animations
- Page transition animations (shared element, hero transitions)
- Push notification UI
- In-app illustration system
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UI-01 | Update `theme.ts` with new color palette, TYPOGRAPHY tokens, and COLORS.card / COLORS.accentSecondary | Color token analysis; current token inventory documented below |
| UI-02 | Load custom display font via `expo-font` in `app/_layout.tsx` | Font loading pattern confirmed; font recommendation: Syne_800ExtraBold |
| UI-03 | Create `Input`, `Tag`, `Avatar` shared components in `src/features/ui/` | Existing inline TextInput patterns catalogued; migration targets documented |
| UI-04 | Extend `Button` with `loading` and `icon` props | Current Button API documented; Reanimated press pattern confirmed |
| UI-05 | Extend `Card` with `elevated` and `pressable` props | Shadow values documented; Reanimated scale pattern confirmed |
| UI-06 | Redesign auth screens (`sign-in.tsx`, `sign-up.tsx`) with branded header zone | Inline style fragmentation fully catalogued |
| UI-07 | Redesign all 6 onboarding steps — new progress bar, styled selection list items | step-2-university representative pattern read; all 6 steps share same shell |
| UI-08 | Redesign Home/discovery screen and `ClassroomCard` component | Current ClassroomCard has standalone container — migration path clear |
| UI-09 | Redesign `classroom-detail.tsx`, `manage-classroom.tsx`, `classroom-settings.tsx` | Header pattern repeated; all use same back-button row |
| UI-10 | Redesign `dm-chat.tsx`, `MessageBubble`, `ChatInput` | Current bubble and input patterns read; brand color swap straightforward |
| UI-11 | Redesign `profile.tsx` and `pdf-viewer.tsx` | Minimal screens; header standardization is primary work |
| UI-12 | Subscribe-confirm celebration moment | Confetti recommendation: `react-native-confetti-cannon` — no new peer deps needed |
</phase_requirements>

---

## Summary

Phase 9 is a pure visual layer change — no schema changes, no navigation restructure, no new data queries. Every screen already imports `COLORS`, `SPACING`, and `RADII` from `src/features/ui/theme.ts`, so the token replacement strategy (change values in one file, all screens update) is sound and low-risk. The main work falls into three categories: (1) updating the design system tokens and adding new ones, (2) building three new shared components and extending two existing ones, and (3) migrating inline styles and ad-hoc patterns screen by screen.

Reanimated 4.1.7 is already installed. The press-scale animation pattern is straightforward — `useSharedValue(1)` + `useAnimatedStyle` + `withSpring` on `Pressable`'s `onPressIn`/`onPressOut`. The decision to use `Pressable` (not `TouchableOpacity`) for animated elements is correct — `TouchableOpacity` cannot host an `Animated.View` scale transform cleanly.

The celebration moment for subscribe-confirm should use `react-native-confetti-cannon` (no additional peer deps beyond core RN Animated). Both `react-native-fast-confetti` (requires `@shopify/react-native-skia`) and `react-native-simple-confetti` (requires `react-native-svg`) introduce new native modules that are not installed. `react-native-confetti-cannon` uses the old RN `Animated` API but works without any native module beyond React Native itself — acceptable for a one-shot celebration moment.

**Primary recommendation:** Update `theme.ts` first (all other tasks depend on it), then extend shared components, then migrate screens wave by wave (auth → onboarding → home/discovery → detail/manage → chat/profile → subscribe-confirm last with confetti).

---

## Standard Stack

### Core (already installed — no new installs for most of Phase 9)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-font | ~14.0.11 | Custom font loading with splash-screen gate | Official Expo SDK package; already in package.json |
| react-native-reanimated | ~4.1.1 (installed: 4.1.7) | Press scale animations | Already installed Phase 8; SDK 54 compatible |
| @expo/vector-icons (Ionicons) | bundled with Expo | Icons in Button `icon` prop, headers | Already used everywhere |

### New Install Required

| Library | Version | Purpose | Install Command |
|---------|---------|---------|-----------------|
| @expo-google-fonts/syne | 0.4.2 | Display font: Syne_800ExtraBold for headings | `npx expo install @expo-google-fonts/syne` |
| react-native-confetti-cannon | 1.5.2 | One-shot celebration on subscribe-confirm | `npm install react-native-confetti-cannon` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @expo-google-fonts/syne | @expo-google-fonts/space-grotesk | Space Grotesk is clean but narrower weight range for display; Syne_800ExtraBold has more presence at large sizes |
| @expo-google-fonts/syne | @expo-google-fonts/fraunces | Fraunces is optical-size serif — beautiful but reads editorial, not energetic; wrong energy for this brand |
| react-native-confetti-cannon | react-native-fast-confetti | fast-confetti needs @shopify/react-native-skia (not installed, native module) — adds 5MB+ |
| react-native-confetti-cannon | react-native-simple-confetti | simple-confetti needs react-native-svg (not installed) — unnecessary dep for one moment |
| react-native-confetti-cannon | Custom Reanimated scale-pop only | Viable fallback — if confetti-cannon has compat issues on RN 0.81, remove it and do scale-pop + accent flash only |

**Installation:**
```bash
npx expo install @expo-google-fonts/syne
npm install react-native-confetti-cannon
```

**Version verification (run before planning):**
- `npm view @expo-google-fonts/syne version` → 0.4.2
- `npm view react-native-confetti-cannon version` → 1.5.2 (last published ~2020, pure RN Animated, no native module)

---

## Architecture Patterns

### Recommended Project Structure (no changes to structure — additions only)

```
src/features/ui/
├── theme.ts           # UPDATE — new tokens, TYPOGRAPHY export, COLORS.card, COLORS.accentSecondary
├── Button.tsx         # EXTEND — loading + icon props; replace TouchableOpacity with Pressable + Reanimated
├── Card.tsx           # EXTEND — elevated + pressable props
├── Input.tsx          # NEW — wraps TextInput with label, error, themed styling
├── Tag.tsx            # NEW — subject tag pill (replaces inline tag Views everywhere)
├── Avatar.tsx         # NEW — circular image or initials fallback
└── WindowedFlatList.tsx  # unchanged
```

### Pattern 1: Press Scale Animation (D-16)

**What:** Replace all `TouchableOpacity activeOpacity={0.8}` interactive elements with `Pressable` + Reanimated scale.
**When to use:** Every tappable element in shared components (`Button`, `Card pressable`, `ClassroomCard`). Not needed for nav links or destructive confirms.

```typescript
// Source: https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/animating-styles-and-props/
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

// Inside component:
const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

// JSX:
<Pressable
  onPressIn={() => { scale.value = withSpring(0.97); }}
  onPressOut={() => { scale.value = withSpring(1); }}
  onPress={onPress}
>
  <Animated.View style={[styles.base, animatedStyle]}>
    {/* content */}
  </Animated.View>
</Pressable>
```

**Key detail:** `withSpring` default config (damping: 10, stiffness: 100) produces a perceptible but quick snap at 0.97 scale. No config override needed for this use case.

### Pattern 2: Font Loading Gate in `_layout.tsx` (D-04)

**What:** `useFonts` from `expo-font` blocks splash screen until font is ready.
**When to use:** Root layout only. Font used via `fontFamily: 'Syne_800ExtraBold'` in TYPOGRAPHY.display.

```typescript
// Source: https://docs.expo.dev/develop/user-interface/fonts/
import { useFonts, Syne_800ExtraBold } from '@expo-google-fonts/syne';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();  // already in layout

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Syne_800ExtraBold });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <AppProviders>...</AppProviders>;
}
```

**Critical detail:** The existing `_layout.tsx` already calls `SplashScreen.preventAutoHideAsync()` and hides via `isLoading` from `useAuthStore`. The `useFonts` gate must be merged with the existing `isLoading` condition: `if (!fontsLoaded || isLoading) return null`. Do not have two competing splash-screen hide calls.

### Pattern 3: TYPOGRAPHY Token System (D-05)

**What:** Add `TYPOGRAPHY` export to `theme.ts` with pre-composed style objects.

```typescript
// theme.ts addition
export const TYPOGRAPHY = {
  display: { fontFamily: 'Syne_800ExtraBold', fontSize: 32, lineHeight: 38 },
  heading: { fontFamily: 'Syne_800ExtraBold', fontSize: 24, lineHeight: 30 },
  subheading: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
} as const;
```

**Usage:** `<Text style={[TYPOGRAPHY.display, { color: COLORS.text }]}>` — spread onto Text styles.

### Pattern 4: New Color Palette (D-01, D-03)

Recommended hex values (Claude's discretion per CONTEXT.md):

```typescript
export const COLORS = {
  // Primary surfaces
  background: '#FBF8F4',    // warm off-white/cream — not pure white
  surface: '#F5F0E8',       // slightly warmer/darker than background
  card: '#FFFFFF',          // cards pop against surface background

  // Brand
  primary: '#C4622D',       // deep terracotta (warm amber-orange)
  accent: '#FF4D30',        // electric coral — replaces soft #FF6B6B
  accentSecondary: '#FFB347', // warm amber gold — celebrations, highlights

  // Text
  text: '#1A1110',          // near-black with warm undertone
  textMuted: '#8A7E78',     // warm grey — not cold grey
  textOnAccent: '#FFFFFF',  // unchanged

  // UI
  border: '#E8DDD5',        // warm-tinted border
  error: '#D32F2F',         // unchanged
  success: '#388E3C',       // unchanged
} as const;
```

**Token preservation:** `COLORS.accent` key is preserved (value changes). `COLORS.surface`, `COLORS.background`, `COLORS.text`, `COLORS.textMuted`, `COLORS.textOnAccent`, `COLORS.border`, `COLORS.error`, `COLORS.success` keys all preserved. New keys: `COLORS.primary`, `COLORS.accentSecondary`, `COLORS.card`.

### Pattern 5: Confetti on Subscribe-Confirm (D-17)

```typescript
import ConfettiCannon from 'react-native-confetti-cannon';

// Inside subscribe-confirm, after mutation.onSuccess fires:
const [showConfetti, setShowConfetti] = useState(false);

// In onSuccess callback:
setShowConfetti(true);

// In JSX (after the main View):
{showConfetti && (
  <ConfettiCannon
    count={80}
    origin={{ x: width / 2, y: -20 }}
    autoStart
    fadeOut
    colors={[COLORS.accent, COLORS.accentSecondary, COLORS.primary, '#FFFFFF']}
    onAnimationEnd={() => setShowConfetti(false)}
  />
)}
```

**Fallback (if confetti-cannon incompatible with RN 0.81):** On `onSuccess`, trigger a `useSharedValue` that drives a scale-up (1 → 1.05 → 1) on the confirmation view with a COLORS.accentSecondary background flash. Pure Reanimated, zero deps.

### Pattern 6: Card elevated + shadow (D-09)

iOS shadow and Android elevation must both be set:

```typescript
const elevatedStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.10,
  shadowRadius: 8,
  elevation: 4,
};
```

### Anti-Patterns to Avoid

- **Calling `TouchableOpacity` inside `Animated.View`:** The scale transform must wrap via `Pressable` → `Animated.View`. `TouchableOpacity` with `Animated.View` children can produce double-opacity on press.
- **Setting `fontFamily` without loading the font first:** If `useFonts` is not awaited and `null` is not returned, the app crashes with "Unrecognized font family" on cold start.
- **Multiple `SplashScreen.hideAsync()` calls:** The existing layout hides on `isLoading` going false — the font gate must be combined with `&&` not run separately.
- **Using `StyleSheet.create` with dynamic token spread:** `TYPOGRAPHY` tokens cannot be spread inside `StyleSheet.create`. Use them inline or as a separate constant merged at render time: `[TYPOGRAPHY.display, styles.title]`.
- **Hardcoded hex in Switch trackColor:** `sign-up.tsx` line 95 uses `rgba(255, 107, 107, 0.3)` — this must be updated to derive from `COLORS.accent` with opacity. React Native accepts color strings for `trackColor`; compute as a hex with alpha or use the `COLORS.accent + '4D'` pattern (30% opacity in hex = 4D).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Display font loading | Custom font cache logic | `useFonts` from `expo-font` | Handles splash-screen gate, cache, error states, cross-platform |
| Press scale feedback | Manual `Animated.timing` scale | `useSharedValue` + `withSpring` (Reanimated) | Runs on UI thread via worklets; no JS bridge jank |
| Confetti burst | Custom particle system with RN Animated | `react-native-confetti-cannon` | Particle physics is complex; cannon handles spread, fade, gravity |
| Shadow cross-platform | Platform.select with manual elevation | `elevated` prop on `Card` with both `shadowX` and `elevation` props | Consistent one-liner across iOS/Android |

**Key insight:** The TypeScript `as const` pattern on COLORS/TYPOGRAPHY/SPACING prevents accidental token mutation and enables autocompletion — maintain it for all new tokens.

---

## Current Token Inventory (Complete)

### Existing `COLORS` keys (theme.ts)

| Token | Current Value | Change in Phase 9 |
|-------|--------------|-------------------|
| `background` | `#FFFFFF` | Change to warm cream `#FBF8F4` |
| `surface` | `#FAFAF8` | Change to warmer `#F5F0E8` |
| `accent` | `#FF6B6B` | Change to electric coral `#FF4D30` |
| `text` | `#1A1A1A` | Change to warm near-black `#1A1110` |
| `textMuted` | `#9E9E9E` | Change to warm grey `#8A7E78` |
| `textOnAccent` | `#FFFFFF` | Unchanged |
| `border` | `#EBEBEB` | Change to warm tint `#E8DDD5` |
| `error` | `#D32F2F` | Unchanged |
| `success` | `#388E3C` | Unchanged |

**New tokens to add:** `COLORS.primary` (terracotta), `COLORS.accentSecondary` (amber gold), `COLORS.card` (white cards on cream background).

### Existing `RADII` keys — no changes needed

`button: 12`, `card: 16`, `modal: 24` — values stay.

### Existing `SPACING` keys — no changes needed

`xs: 8`, `sm: 12`, `md: 16`, `lg: 24`, `xl: 32` — values stay.

---

## Inline Style Fragmentation Inventory

All hardcoded colors found in `src/`:

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `src/features/onboarding/SampleLessonEngine.tsx` | 109-110 | `#E8F5E9`, `#FFEBEE` hardcoded (correct/wrong feedback) | Add `COLORS.successBg` / `COLORS.errorBg` or use `COLORS.success`/`COLORS.error` with alpha |
| `src/features/study/QuestionCard.tsx` | 106, 111 | Same `#E8F5E9`, `#FFEBEE` hardcoded | Same fix |
| `src/features/classroom/AddCardBottomSheet.tsx` | 302 | `rgba(0,0,0,0.4)` scrim | Add `COLORS.scrim` token or keep as `rgba(0,0,0,0.4)` — acceptable for modal overlay |
| `src/app/(auth)/onboarding/step-3-degree.tsx` | 159 | `shadowColor: '#000'` | Move to `COLORS.shadow` token or keep inline — shadow black is universal convention |
| `src/app/(auth)/sign-in.tsx` | 88, 93 | `#FFF3E0`, `#E65100` offline banner | Replace with `COLORS.warning` / `COLORS.warningText` tokens or reuse `COLORS.accentSecondary` area |
| `src/app/(auth)/sign-up.tsx` | 95-96 | `rgba(255,107,107,0.3)`, `#FFFFFF` in Switch | Update trackColor to use derived opacity from `COLORS.accent` |

**Screens with inline button/input implementations (no shared component):**

| File | Pattern | Action |
|------|---------|--------|
| `sign-in.tsx` | Inline `TouchableOpacity` button + `TextInput` | Replace with `<Button>` + `<Input>` |
| `sign-up.tsx` | Inline `TouchableOpacity` button + `TextInput` | Replace with `<Button>` + `<Input>` |
| `classroom-settings.tsx` | Inline `TouchableOpacity` CTA + `TextInput` fields | Replace with `<Button>` + `<Input>` |
| `ClassroomCard.tsx` | Standalone card container (intentional — see STATE.md decision Phase 05-P02) | Migrate to `<Card pressable>` or keep own container with updated tokens |
| `OnboardingProgress.tsx` | Plain circle dots | Redesign to pill/bar |

**Screens that already use shared `Button` and `Card`:**
`subscribe-confirm.tsx`, `classroom-detail.tsx`, `manage-classroom.tsx`, `profile.tsx`, `step-2-university.tsx` (Button), `dm-chat.tsx` (via ChatInput)

---

## Common Pitfalls

### Pitfall 1: Splash Screen Double-Hide
**What goes wrong:** Adding `useFonts` gate and calling `SplashScreen.hideAsync()` separately from the existing `isLoading` gate causes the splash to hide before auth state is ready (or vice versa).
**Why it happens:** Two `useEffect` calls both call `SplashScreen.hideAsync()` — whichever fires first wins.
**How to avoid:** Single condition: `if (!fontsLoaded || isLoading) return null`. Single `hideAsync()` call triggered when both are ready.
**Warning signs:** Splash disappears too early showing a flash of unstyled content.

### Pitfall 2: Reanimated worklet not compiled
**What goes wrong:** `useAnimatedStyle` callback references a non-worklet function, causing "Tried to synchronously call a non-worklet function" at runtime.
**Why it happens:** Functions passed to `useAnimatedStyle` run on the UI thread — they must only reference worklet-compatible operations.
**How to avoid:** Only call `withSpring`, `withTiming`, arithmetic, and shared value `.value` reads inside `useAnimatedStyle`. No external state reads, no `console.log`.
**Warning signs:** Yellow "Tried to synchronously call" warning on press.

### Pitfall 3: Font family not found on cold start
**What goes wrong:** App crashes with "Unrecognized font family 'Syne_800ExtraBold'" on first launch.
**Why it happens:** Component renders before `useFonts` resolves on a slow network.
**How to avoid:** Guard: `if (!fontsLoaded) return null` in `_layout.tsx` before rendering any tree that uses the font.
**Warning signs:** Crash only on fresh install / cleared cache.

### Pitfall 4: `StyleSheet.create` with spread TYPOGRAPHY tokens
**What goes wrong:** `StyleSheet.create({ title: { ...TYPOGRAPHY.display, color: COLORS.text } })` throws a TypeScript error on `fontFamily` type mismatch.
**Why it happens:** `StyleSheet.create` types infer TextStyle strictly; `as const` TYPOGRAPHY objects have literal types that may not match.
**How to avoid:** Apply TYPOGRAPHY tokens as array styles: `[TYPOGRAPHY.display, { color: COLORS.text }]`. Do not spread into `StyleSheet.create`.
**Warning signs:** TypeScript error on `fontFamily` prop.

### Pitfall 5: ClassroomCard TouchableOpacity + Card pressable duplication
**What goes wrong:** Wrapping `ClassroomCard` in `<Card pressable>` and keeping the outer `TouchableOpacity` creates nested pressables — double-press, inconsistent scale.
**Why it happens:** `ClassroomCard` uses a standalone container (per STATE.md Phase 05-P02 decision) to keep `TouchableOpacity` as the outermost element.
**How to avoid:** Either (a) migrate `ClassroomCard` to use `<Card pressable>` (removing outer `TouchableOpacity`), or (b) apply the Reanimated scale directly in `ClassroomCard`'s own `TouchableOpacity` → `Pressable` migration. Do not do both.
**Warning signs:** Double-tap required or scale fires twice.

### Pitfall 6: react-native-confetti-cannon compatibility
**What goes wrong:** `react-native-confetti-cannon` uses the legacy `Animated` API and was last published ~2020. May produce "useNativeDriver" warning on RN 0.81.
**Why it happens:** Library was written for RN < 0.62 API and some internal paths don't specify `useNativeDriver`.
**How to avoid:** If warning appears, the animation still works — it's a warning not a crash. If it does crash, fall back to pure Reanimated scale-pop (see Pattern 5 fallback above).
**Warning signs:** Yellow "Animated: useNativeDriver was not specified" in dev mode.

---

## Code Examples

### Verified: expo-font with Syne in Expo Router _layout.tsx
```typescript
// Source: https://docs.expo.dev/develop/user-interface/fonts/
import { useFonts, Syne_800ExtraBold } from '@expo-google-fonts/syne';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const [fontsLoaded] = useFonts({ Syne_800ExtraBold });
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  if (!fontsLoaded || isLoading) return null;
  // ... rest of navigator
}
```

### Verified: Reanimated 4 press scale pattern
```typescript
// Source: https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/animating-styles-and-props/
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const scale = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

<Pressable
  onPressIn={() => { scale.value = withSpring(0.97); }}
  onPressOut={() => { scale.value = withSpring(1); }}
  onPress={onPress}
  disabled={disabled}
>
  <Animated.View style={[styles.base, variantStyle, animatedStyle]}>
    <Text style={textStyle}>{title}</Text>
  </Animated.View>
</Pressable>
```

### Verified: Button loading prop pattern
```typescript
// ActivityIndicator inside button replaces title text when loading=true
<Animated.View style={[styles.base, variantStyle, animatedStyle]}>
  {loading ? (
    <ActivityIndicator size="small" color={variant === 'primary' ? COLORS.textOnAccent : COLORS.accent} />
  ) : (
    <>
      {icon && <Ionicons name={icon} size={16} color={textColor} style={styles.icon} />}
      <Text style={textStyle}>{title}</Text>
    </>
  )}
</Animated.View>
```

### Verified: OnboardingProgress pill/bar redesign
```typescript
// Replace circular dots with a segmented bar
<View style={styles.container}>
  {Array.from({ length: totalSteps }, (_, i) => (
    <View
      key={i}
      style={[
        styles.segment,
        i + 1 <= currentStep && styles.segmentActive,
      ]}
    />
  ))}
</View>

// styles:
container: { flexDirection: 'row', gap: 4, marginBottom: SPACING.lg },
segment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: COLORS.border },
segmentActive: { backgroundColor: COLORS.accent },
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `TouchableOpacity activeOpacity` | `Pressable` + Reanimated scale | Reanimated 2+ (2021) | Runs on UI thread, no JS jank |
| `AppLoading` from expo (deprecated) | `useFonts` + manual `SplashScreen.hideAsync` | Expo SDK 47 | `AppLoading` removed; useFonts is current |
| `Animated` API from React Native core | `react-native-reanimated` worklets | 2022+ | Worklets bypass JS bridge; native performance |
| CSS class font loading | `useFonts` hook | Expo-specific | Managed font loading with async gate |

**Deprecated/outdated:**
- `expo-app-loading`: Removed in Expo SDK 47. Using `SplashScreen.preventAutoHideAsync()` + `useFonts` + manual `hideAsync()` is correct.
- `activeOpacity` on `TouchableOpacity` as press feedback: Functional but runs on JS thread; `Pressable` + Reanimated is the current pattern for premium feel.

---

## Open Questions

1. **`expo-linear-gradient` for auth hero section (Claude's discretion)**
   - What we know: `expo-linear-gradient` is a first-party Expo package, not currently installed.
   - What's unclear: Whether a flat brand-color block suffices or gradient adds meaningful brand premium.
   - Recommendation: Start with flat `COLORS.primary` block above auth forms. If it reads flat, add `expo-linear-gradient` in a follow-up iteration. Avoids an extra install for potentially negligible visual impact.

2. **Tutor avatar source for `ClassroomCard`**
   - What we know: ClassroomCard currently shows `tutorEmail` (string). No `profile_photo_url` in the classrooms join.
   - What's unclear: Does the `profiles` table have an avatar/photo column? Phase 9 CONTEXT says `Avatar` component should show tutor avatar in the card.
   - Recommendation: Implement `Avatar` to accept optional `uri` prop with initials fallback. In ClassroomCard, pass `null` uri — initials from `tutorEmail`. Phase 9 should not add a DB query; the avatar is a component-level upgrade.

3. **Switch component brand tinting (sign-up.tsx)**
   - What we know: `Switch` `trackColor` currently uses `rgba(255,107,107,0.3)` for the on-state — must update when accent changes.
   - What's unclear: React Native `Switch` on iOS ignores `thumbColor` for the off state (always white). On Android it respects both colors.
   - Recommendation: `trackColor={{ false: COLORS.border, true: COLORS.accent + '4D' }}` (hex alpha 4D = 30%). Use `thumbColor={isTutor ? COLORS.accent : '#F4F3F4'}` — the `#F4F3F4` is the iOS/Android standard off-thumb color.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| expo-font | Font loading (D-04) | Yes | ~14.0.11 | — (already installed) |
| react-native-reanimated | Press animations (D-16) | Yes | 4.1.7 | — (already installed) |
| @expo-google-fonts/syne | Display font | No | 0.4.2 | Any bold Google Font; fallback to system fontWeight: '800' |
| react-native-confetti-cannon | Subscribe celebration (D-17) | No | 1.5.2 | Custom Reanimated scale-pop |
| @shopify/react-native-skia | react-native-fast-confetti | No | — | Not needed — using confetti-cannon instead |
| react-native-svg | react-native-simple-confetti | No | — | Not needed — using confetti-cannon instead |

**Missing dependencies with no fallback:**
- None — all blocking dependencies are either already installed or have viable fallbacks.

**Missing dependencies with fallback:**
- `@expo-google-fonts/syne`: Install command `npx expo install @expo-google-fonts/syne`. Fallback: system bold font with `fontWeight: '800'`.
- `react-native-confetti-cannon`: Install command `npm install react-native-confetti-cannon`. Fallback: Reanimated scale-pop animation on the confirmation view.

---

## Validation Architecture

> Nyquist validation is enabled (no explicit false in config.json).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 30.x + jest-expo 55 |
| Config file | Check for `jest.config.js` or jest field in `package.json` |
| Quick run command | `npx jest --testPathPattern=features/ui` |
| Full suite command | `npx jest` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Notes |
|--------|----------|-----------|-------|
| UI-01 | COLORS tokens all defined and typed | unit | Snapshot test of exported COLORS object keys |
| UI-02 | Font loads without crash | smoke | Manual device test — font loading is not unit-testable in Jest |
| UI-03 | Input renders with label, error state, themed border | unit | RTL snapshot |
| UI-04 | Button shows ActivityIndicator when loading=true | unit | RTL `getByTestId` or `queryByText` title absent |
| UI-05 | Card elevated adds shadow styles | unit | Snapshot of elevated prop |
| UI-06–UI-12 | Screen visual fidelity | manual | Screenshots; no automated visual regression in this stack |

**Note:** Phase 9 is primarily visual — most requirements are manually validated. Unit tests cover shared component contract (props → rendered output), not pixel-perfect design.

### Wave 0 Gaps

- [ ] `src/features/ui/__tests__/Input.test.tsx` — covers UI-03 (new component)
- [ ] `src/features/ui/__tests__/Button.test.tsx` — covers UI-04 (loading prop)
- [ ] `src/features/ui/__tests__/Card.test.tsx` — covers UI-05 (elevated prop)
- [ ] `src/features/ui/__tests__/Tag.test.tsx` — covers new Tag component
- [ ] `src/features/ui/__tests__/Avatar.test.tsx` — covers new Avatar component

*(Existing screens have no tests — consistent with project pattern for screen-level code)*

---

## Project Constraints (from CLAUDE.md)

- Stack is React Native / Expo + Supabase — decided, not up for debate
- `theme.ts` is the single source of truth for all design tokens — no hardcoded colors in components
- Use `npx expo install` (not `npm install`) for all Expo-ecosystem packages to resolve peer-compatible versions
- Feature structure: `src/features/[feature]/` — all new shared components go in `src/features/ui/`
- No new features, DB changes, or navigation changes in this phase
- Brand must NOT feel like typical edu-tech — no heavy dark UI, no corporate tone

---

## Sources

### Primary (HIGH confidence)
- Expo Font Docs (https://docs.expo.dev/develop/user-interface/fonts/) — `useFonts` pattern, Expo Router integration, splash screen gate
- Reanimated Docs (https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/animating-styles-and-props/) — `useAnimatedStyle` + `withSpring` press pattern
- Direct codebase read — `src/features/ui/theme.ts`, all 14 screen files, all shared components

### Secondary (MEDIUM confidence)
- npm registry (`npm view`) — verified package versions: @expo-google-fonts/syne@0.4.2, react-native-confetti-cannon@1.5.2
- react-native-fast-confetti GitHub README — dependency requirements (Skia) confirmed
- react-native-simple-confetti GitHub — dependency requirements (react-native-svg) confirmed

### Tertiary (LOW confidence)
- WebSearch: confetti-cannon compatibility on RN 0.81 — no direct confirmation found; flagged as LOW with fallback strategy documented

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified via npm registry; reanimated already installed at correct version
- Architecture: HIGH — based on direct codebase read; all patterns verified against official docs
- Color palette: MEDIUM — hex values are Claude's discretion; no official brand guide exists; directionally correct per CONTEXT.md Yoco/Superbalist reference
- Confetti compatibility: LOW — react-native-confetti-cannon last published 2020; RN 0.81 compatibility unverified; fallback strategy documented

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (stable libraries; 30-day validity)
