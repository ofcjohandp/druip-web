# Phase 1: Foundation - Research

**Researched:** 2026-04-06
**Domain:** Expo SDK 55 + Expo Router v3 + Supabase + EAS Build/Update
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** First screen: Druip logo + tagline + single CTA "Try a lesson". No account gate, no tutorial, no carousel.
- **D-02:** Sample lesson uses exact same question card UI as real lessons. No demo-mode indicator.
- **D-03:** 5 questions in sample lesson (hardcoded seed data). No skip option.
- **D-04:** Post-sample: full-screen sign-up prompt (not modal). Shows score + celebration + CTA "Create account".
- **D-05:** Sign-up prompt tone is friendly, progress-framing. Secondary option to proceed is acceptable but not visually dominant.
- **D-06:** No auto-advance to sign-up. User must tap CTA.
- **D-07:** Three goal cards: Chill (1/day), Steady (2/day), Focused (3/day). No time-based framing.
- **D-08:** Goal selection is single-tap card. No confirmation step. Tapping advances to app shell immediately.
- **D-09:** Selected goal stored in user profile table in Supabase. Default is Steady (2/day).
- **D-10:** Background `#FFFFFF`. Surface cards `#FAFAF8`. No dark mode for MVP.
- **D-11:** Accent: soft coral/peach (~`#FF6B6B`, warm not cool).
- **D-12:** Border radius: 16px cards, 24px bottom sheets/modals, 12px buttons.
- **D-13:** Typography: system fonts — SF Pro on iOS, Roboto on Android. No custom font import for MVP.
- **D-14:** Spacing: min 16px inside cards, 24px between major sections.
- **D-15:** 5 tabs (DASH-04): Home · Study · Progress · Notes · Profile. Exact order.
- **D-16:** Tab bar: rounded icons, system icon library (@expo/vector-icons). Active state uses accent color.
- **D-17:** All tabs render immediately after auth — no lazy loading at nav level.
- **D-18:** expo-sqlite session storage (not AsyncStorage). Import `react-native-url-polyfill/auto` before Supabase initializes.
- **D-19:** On offline launch with no valid session: navigate to login screen. No crash, no blank screen. Subtle offline notice on login.
- **D-20:** Authenticated users bypass onboarding entirely — `Stack.Protected` routes guard both onboarding flow and sample lesson entry.
- **D-21:** Content hierarchy: `modules → topics → lessons → sections → questions`. All with `is_published`, `created_at`, `updated_at`.
- **D-22:** `lessons` table includes `lesson_type` (enum), `xp_reward` (integer), `order` (integer).
- **D-23:** Sequential unlock is topic-level via `order` field. Cross-topic unlock via `topics.requires_topic_id` (nullable FK).
- **D-24:** RLS enabled on all public tables before first user. Authenticated users read published content; users read/write only their own progress rows.
- **D-25:** supabase-js pinned to v2.49.9+ (SEED-03).

### Claude's Discretion

- EAS build profile configuration details (development/staging/production)
- Exact SQL for RLS policies beyond the rules above
- FlatList windowing config values (SEED-06) — use Expo defaults unless there's a reason to override
- Notification permission timing (AUTH-08) — implement the hook but keep the trigger point flexible
- Loading skeleton design and exact animation timing
- Error state copy and styling

### Deferred Ideas (OUT OF SCOPE)

- Dark mode
- Custom font import (Nunito, Poppins)
- Guest mode with local-only progress
- Push notification content and scheduling (AUTH-08 is a hook only in Phase 1)
- Onboarding analytics / funnel tracking
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | 5-question sample lesson before sign-up prompt, reachable within 2 min of first open | Play-first routing pattern with unprotected onboarding screens outside Stack.Protected |
| AUTH-02 | Email/password sign-up only | Supabase `signUp()` with email + password; no OAuth flows |
| AUTH-03 | Session persists across restarts | `persistSession: true` + expo-sqlite localStorage + `autoRefreshToken: true` |
| AUTH-04 | expo-sqlite session storage; URL polyfill before Supabase init | `import 'expo-sqlite/localStorage/install'` + `import 'react-native-url-polyfill/auto'` before client creation |
| AUTH-05 | Graceful offline launch — login screen not crash | Handle `SIGNED_OUT` event defensively; use `getUser()` not `getSession()` |
| AUTH-06 | Authenticated user lands on home tab, not onboarding | `Stack.Protected guard={!!session}` wraps `(tabs)` screen; unauthenticated guard wraps onboarding screens |
| AUTH-07 | Three daily goal cards at onboarding | Three card UI component post sign-up; writes `daily_goal` to `profiles` table |
| AUTH-08 | Notification permission only after first full lesson complete | Implement `expo-notifications` hook; trigger is Phase 2, hook scaffold is Phase 1 |
| CONT-01 | Module → Topic → Lesson → Section hierarchy in DB | Schema tables: `modules`, `topics`, `lessons`, `sections`, `questions` |
| CONT-02 | `lesson_type` field in schema | Postgres enum `lesson_type_enum` (`standard`, `practice`, `challenge`) |
| CONT-03 | XP reward per lesson | `xp_reward INTEGER DEFAULT 10` on `lessons` |
| CONT-04 | Sequential lesson unlocking | `order INTEGER` on `lessons`; `requires_topic_id UUID REFERENCES topics` on `topics` |
| CONT-05 | `is_published` flag on all content tables | `is_published BOOLEAN DEFAULT FALSE` on all content tables |
| DASH-04 | 5-tab bottom bar; no hamburger | `(tabs)/_layout.tsx` with 5 `Tabs.Screen` components |
| SEED-02 | RLS enabled on all public tables before any user | Migration runs `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + policies |
| SEED-03 | supabase-js pinned to v2.49.9+ | `"@supabase/supabase-js": "^2.49.9"` in package.json |
| SEED-05 | `runtimeVersion: fingerprint` + staging channel before production OTA | `app.config.js` policy + `eas.json` channel config |
| SEED-06 | FlatList windowing config on content lists | `windowSize={5}`, `removeClippedSubviews={true}`, `initialNumToRender={5}`, `maxToRenderPerBatch={5}`, stable `keyExtractor` |
</phase_requirements>

---

## Summary

Phase 1 establishes the entire technical foundation: Expo SDK 55 managed project with Expo Router v3, Supabase schema + RLS, authentication with play-first onboarding, and the 5-tab navigation shell. The stack is locked and well-supported.

The most technically nuanced element is the play-first auth routing: unauthenticated users must reach the sample lesson without being redirected, but authenticated users must be redirected past onboarding entirely. Expo Router v3's `Stack.Protected` with inverse guard conditions handles this declaratively without imperative redirects.

The second critical area is the Supabase client setup: `expo-sqlite/localStorage/install` must be imported before `react-native-url-polyfill/auto` which must be imported before the Supabase client is created. Order matters. The `ws`/`stream` crash is fixed in supabase-js v2.49.9 — pinning to this version is non-negotiable.

This is a greenfield project. The patterns established in this phase (file structure, theme constants, query client setup, Zustand slice structure, RLS SQL patterns) become the canonical templates for all subsequent phases.

**Primary recommendation:** Wire auth routing first (Plan 3 can be developed alongside Plan 2), establish `src/lib/supabase.ts` as the single source of truth for the Supabase client, and write all Supabase schema as SQL migrations from day one — not dashboard-only entry.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo | 55.0.11 | SDK + managed workflow | Locked decision — SDK 55 is current stable |
| expo-router | 55.0.10 | File-based navigation | Bundled with Expo SDK 55; provides `Stack.Protected`, deep linking, auth guards |
| @supabase/supabase-js | 2.101.1 (min: 2.49.9) | Backend client | `ws`/`stream` crash fixed at 2.49.9; current is 2.101.1 |
| expo-sqlite | 55.0.13 | localStorage shim for Supabase session | Official Expo recommendation over AsyncStorage for session persistence |
| react-native-url-polyfill | 3.0.0 | URL polyfill for Supabase | Supabase requires URL API; must be imported before client init |
| @tanstack/react-query | 5.96.2 | Server state management | Locked decision; best offline + persistence story |
| zustand | 5.0.12 | Client state management | Locked decision; minimal boilerplate |
| react-native-mmkv | 4.3.0 | Fast key-value storage | Required as TanStack Query MMKV persister; 20x faster than AsyncStorage |
| @expo/vector-icons | 15.1.1 | Tab bar icons | Bundled with Expo; FontAwesome/Ionicons/MaterialIcons available |
| expo-notifications | 55.0.16 | Push notification permission hook scaffold | AUTH-08 requires hook infrastructure |
| @react-native-community/netinfo | 12.0.1 | Network awareness | Required for offline detection + TanStack Query onlineManager |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-constants | (bundled) | Access `expoConfig` in `app.config.js` | Env vars + build channel detection |
| expo-splash-screen | (bundled) | Prevent flash before auth resolves | Keep splash visible until session check completes |
| expo-status-bar | (bundled) | Status bar styling | Light status bar on white backgrounds |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| expo-sqlite localStorage | @react-native-async-storage/async-storage | AsyncStorage has documented offline session-loss bug; expo-sqlite is current official recommendation |
| Zustand | Redux Toolkit | Redux is overbuilt for this scope |
| TanStack Query | SWR | TanStack Query has better offline + persistence story |

**Installation:**

```bash
# Initialize Expo SDK 55 project
npx create-expo-app@latest druip --template expo-template-blank-typescript
cd druip

# IMPORTANT: Always use npx expo install for Expo-ecosystem packages
npx expo install @supabase/supabase-js expo-sqlite react-native-url-polyfill

# State management
npx expo install @tanstack/react-query zustand react-native-mmkv

# Networking + notifications
npx expo install @react-native-community/netinfo expo-notifications

# Install EAS CLI and Supabase CLI globally
npm install -g eas-cli@18.5.0
npm install -g supabase@2.84.10
```

**Version verification (confirmed 2026-04-06 against npm registry):**
- `@supabase/supabase-js`: 2.101.1 (current) — minimum pin must be 2.49.9
- `@tanstack/react-query`: 5.96.2
- `zustand`: 5.0.12
- `react-native-mmkv`: 4.3.0
- `expo`: 55.0.11
- `expo-sqlite`: 55.0.13
- `expo-router`: 55.0.10
- `expo-notifications`: 55.0.16
- `@react-native-community/netinfo`: 12.0.1
- `react-native-url-polyfill`: 3.0.0

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/                    # Expo Router file-based routes (thin screens only)
│   ├── _layout.tsx         # Root layout: providers + Stack.Protected auth routing
│   ├── index.tsx           # Landing screen (CTA: "Try a lesson") — PUBLIC
│   ├── sample-lesson.tsx   # 5-question sample — PUBLIC (hardcoded seed data)
│   ├── sign-up-prompt.tsx  # Score + celebration + "Create account" CTA — PUBLIC
│   ├── (auth)/             # Auth screens (unauthenticated only)
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── goal-selection.tsx
│   └── (tabs)/             # Authenticated app shell
│       ├── _layout.tsx     # 5-tab navigator config
│       ├── index.tsx       # Home tab (DASH-01..03 in Phase 3)
│       ├── study.tsx       # Study tab
│       ├── progress.tsx    # Progress tab
│       ├── notes.tsx       # Notes tab
│       └── profile.tsx     # Profile tab
├── features/               # Feature slices: hooks + stores + components
│   ├── auth/
│   │   ├── useAuthStore.ts     # Zustand slice for session state
│   │   ├── useSession.ts       # Hook: wraps Supabase onAuthStateChange
│   │   └── SessionProvider.tsx # Provider: bridges Supabase → Zustand
│   ├── onboarding/
│   │   └── SampleLesson.tsx    # Hardcoded sample question set
│   └── ui/
│       ├── Button.tsx          # Shared button primitive
│       ├── Card.tsx            # Shared card primitive
│       └── theme.ts            # Theme constants (colors, spacing, radii)
├── lib/
│   └── supabase.ts         # SINGLE Supabase client instance (nothing else creates a client)
├── types/
│   └── database.ts         # Generated Supabase TypeScript types
└── providers/
    └── AppProviders.tsx    # Composes QueryClientProvider + SessionProvider
```

### Pattern 1: Supabase Client Initialization

**What:** Single client instance with expo-sqlite localStorage and URL polyfill. Import order is critical.
**When to use:** `src/lib/supabase.ts` — the only file that calls `createClient`.

```typescript
// src/lib/supabase.ts
// CRITICAL: These imports MUST appear before createClient is called.
// Order: localStorage install → URL polyfill → supabase client
import 'expo-sqlite/localStorage/install';
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,       // expo-sqlite localStorage shim
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,   // required for React Native (no URL scheme handling)
  },
});
```

Source: [Expo — Using Supabase](https://docs.expo.dev/guides/using-supabase/)

### Pattern 2: Play-First Auth Routing (Stack.Protected)

**What:** Landing + sample lesson + sign-up prompt are PUBLIC. Tabs are auth-protected. Onboarding screens (sign-in, sign-up, goal-selection) are visible only to unauthenticated users.
**When to use:** `src/app/_layout.tsx`

```typescript
// src/app/_layout.tsx
// Source: https://docs.expo.dev/router/advanced/authentication/
import { Stack } from 'expo-router';
import { AppProviders } from '@/providers/AppProviders';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { SplashScreenController } from '@/features/auth/SplashScreenController';

export default function RootLayout() {
  return (
    <AppProviders>
      <SplashScreenController />
      <RootNavigator />
    </AppProviders>
  );
}

function RootNavigator() {
  const { session, isLoading } = useAuthStore();

  if (isLoading) return null; // splash screen is shown via SplashScreenController

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* PUBLIC screens — accessible to all users */}
      <Stack.Screen name="index" />
      <Stack.Screen name="sample-lesson" />
      <Stack.Screen name="sign-up-prompt" />

      {/* AUTHENTICATED users only — main app shell */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      {/* UNAUTHENTICATED users only — auth + onboarding */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
```

Key behavior: If a logged-in user tries to access `(auth)/sign-in`, they are redirected to the index (anchor route). If an unauthenticated user tries to access `(tabs)`, they are redirected to index.

Source: [Expo Router Authentication](https://docs.expo.dev/router/advanced/authentication/), [Protected Routes](https://docs.expo.dev/router/advanced/protected/)

### Pattern 3: Auth Store with onAuthStateChange

**What:** Zustand slice that subscribes to Supabase auth events and exposes session state to the component tree.
**When to use:** `src/features/auth/useAuthStore.ts`

```typescript
// src/features/auth/useAuthStore.ts
import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// Call once at app startup (in SessionProvider or AppProviders)
export function initializeAuthListener() {
  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.getState().setSession(session);
    useAuthStore.getState().setLoading(false);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    // SIGNED_OUT fires on offline launch when session refresh fails.
    // D-19: navigate to login — the Stack.Protected guard handles this
    // declaratively when session becomes null.
    useAuthStore.getState().setSession(session);
    useAuthStore.getState().setLoading(false);
  });
}
```

Note: Use `supabase.auth.getUser()` rather than `supabase.auth.getSession()` for validation checks to avoid `AuthSessionMissingError` on multi-device logout.

### Pattern 4: 5-Tab Navigator

**What:** Bottom tab bar with 5 tabs, accent color for active state, system icons.
**When to use:** `src/app/(tabs)/_layout.tsx`

```typescript
// src/app/(tabs)/_layout.tsx
// Source: https://docs.expo.dev/router/advanced/tabs/
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '@/features/ui/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color }: { name: IoniconName; color: string }) {
  return <Ionicons name={name} size={24} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: { backgroundColor: COLORS.background },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Study',
          tabBarIcon: ({ color }) => <TabIcon name="book-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <TabIcon name="bar-chart-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color }) => <TabIcon name="document-text-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="person-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
```

### Pattern 5: Theme Constants

**What:** Single source of truth for design tokens (D-10 through D-14).
**When to use:** `src/features/ui/theme.ts`

```typescript
// src/features/ui/theme.ts
export const COLORS = {
  background: '#FFFFFF',
  surface: '#FAFAF8',
  accent: '#FF6B6B',          // warm coral/peach — exact hex to be refined
  text: '#1A1A1A',
  textMuted: '#9E9E9E',
  textOnAccent: '#FFFFFF',
  border: '#EBEBEB',
  error: '#D32F2F',
  success: '#388E3C',
} as const;

export const RADII = {
  button: 12,
  card: 16,
  modal: 24,
} as const;

export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,   // minimum padding inside cards (D-14)
  lg: 24,   // between major sections (D-14)
  xl: 32,
} as const;
```

### Pattern 6: TanStack Query + AppState Integration

**What:** QueryClient setup with React Native AppState + onlineManager wired for offline detection.
**When to use:** `src/providers/AppProviders.tsx`

```typescript
// src/providers/AppProviders.tsx
import { QueryClient, QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, AppStateStatus, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { initializeAuthListener } from '@/features/auth/useAuthStore';

// Wire network awareness to TanStack Query
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

// Wire app focus to TanStack Query refetch
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeAuthListener();
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

Source: [TanStack Query React Native docs](https://tanstack.com/query/v5/docs/framework/react/react-native)

### Pattern 7: EAS Build Configuration

**What:** Three build profiles (development, staging, production) with OTA channels and runtimeVersion fingerprint.

```javascript
// app.config.js
export default {
  expo: {
    name: 'Druip',
    slug: 'druip',
    version: '1.0.0',
    runtimeVersion: {
      policy: 'fingerprint',   // SEED-05: auto-increments on native changes
    },
    updates: {
      url: 'https://u.expo.dev/<PROJECT_ID>',
    },
    // ... rest of config
  },
};
```

```json
// eas.json
{
  "cli": {
    "version": ">= 18.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "ENVIRONMENT": "development" },
      "ios": { "simulator": true }
    },
    "staging": {
      "channel": "staging",
      "distribution": "internal",
      "env": { "ENVIRONMENT": "staging" }
    },
    "production": {
      "channel": "production",
      "env": { "ENVIRONMENT": "production" }
    }
  },
  "submit": {
    "production": {}
  }
}
```

OTA deployment flow (SEED-05): `eas update --channel staging` → test → `eas channel:edit production --branch <branch>` to promote.

Source: [EAS JSON reference](https://docs.expo.dev/eas/json/), [Runtime versions](https://docs.expo.dev/eas-update/runtime-versions/)

### Pattern 8: FlatList Windowing Configuration (SEED-06)

**What:** Standard windowing config for all content list FlatLists.
**When to use:** Every FlatList rendering topic cards, lesson lists, notes lists.

```typescript
// SEED-06: Apply to all content-list FlatLists
<FlatList
  data={items}
  keyExtractor={(item) => item.id}   // stable key from database UUID
  windowSize={5}
  removeClippedSubviews={true}
  initialNumToRender={5}
  maxToRenderPerBatch={5}
  renderItem={({ item }) => <TopicCard topic={item} />}
/>

// IMPORTANT: The active question card in study sessions does NOT use FlatList.
// It renders a single card component that swaps on answer (Phase 2 concern).
```

### Anti-Patterns to Avoid

- **Creating multiple Supabase clients:** Only `src/lib/supabase.ts` calls `createClient`. Any other file importing and calling `createClient` will create a second client with its own connection pool.
- **Importing URL polyfill after Supabase client:** `react-native-url-polyfill/auto` must be the first import in `supabase.ts`. Order in JS modules matters — put it before all other imports.
- **Using `npm install` instead of `npx expo install`:** Expo's package manager resolves correct peer-compatible versions. `npm install react-native-safe-area-context` often installs an incompatible version.
- **Using AsyncStorage for session storage:** The open bug causes session loss on offline launch. `expo-sqlite` localStorage is the current official fix.
- **Using `getSession()` for auth checks:** Can throw `AuthSessionMissingError` on multi-device logout. Use `getUser()` instead.
- **Placing business logic in `src/app/` route files:** Route files are thin — they import from `src/features/`. Logic in route files cannot be unit tested and makes the file unreadable.
- **Lazy loading at the navigation level (D-17):** All tabs must render immediately after auth. Individual screens handle empty/loading states.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session persistence | Custom SecureStore encryption for session | expo-sqlite localStorage via Supabase client config | expo-sqlite localStorage is the official Supabase + Expo recommendation; Supabase session objects exceed AsyncStorage 2048-byte limit |
| Auth state management | Custom React context with useState | Zustand slice + Supabase onAuthStateChange | Supabase events are already async; Zustand provides a stable store that survives navigation |
| Network detection | Custom fetch polling | `@react-native-community/netinfo` + TanStack Query `onlineManager` | NetInfo handles all platform edge cases; `onlineManager` integrates directly with query invalidation |
| Offline-safe queries | Manual caching with AsyncStorage | TanStack Query with MMKV persister | TanStack Query handles stale-while-revalidate, background refetch, and React lifecycle correctly |
| Tab bar icons | Custom SVG icon components | `@expo/vector-icons` (Ionicons) | Already bundled; extensive icon set; integrates with Expo build pipeline |
| Route protection | `useEffect` + `router.replace()` imperatively | `Stack.Protected` / `Tabs.Protected` with guard prop | Declarative; handles deep links; clears history correctly; avoids flash of protected content |
| TypeScript types for DB | Manual interface definitions | `supabase gen types typescript` | Generated from your actual schema; eliminates entire class of runtime type errors |

**Key insight:** The React Native ecosystem has mature solutions for every common infrastructure problem. Hand-rolled alternatives consistently miss edge cases (device backgrounding, token refresh race conditions, navigation state persistence).

---

## Common Pitfalls

### Pitfall 1: Import Order for Supabase Initialization

**What goes wrong:** App crashes with `ws is not defined` or `stream is not defined`, or URL-related errors on first Supabase call.
**Why it happens:** `react-native-url-polyfill/auto` and `expo-sqlite/localStorage/install` must be executed (as side effects) before any Supabase code runs. JavaScript module evaluation order is deterministic — later imports can't retroactively patch globals for earlier code.
**How to avoid:** `src/lib/supabase.ts` must have these as its first two lines:
```typescript
import 'expo-sqlite/localStorage/install';
import 'react-native-url-polyfill/auto';
```
Then import `createClient`. Nothing else.
**Warning signs:** `TypeError: Cannot read property 'createObjectURL' of undefined`, crashes in `ws` or `stream` modules.

### Pitfall 2: Session Loss on Offline Launch (AUTH-05)

**What goes wrong:** App launches without network, Supabase can't refresh the token, fires `SIGNED_OUT` event, and depending on how auth state is wired, either crashes or shows a blank screen.
**Why it happens:** `onAuthStateChange` fires `SIGNED_OUT` when a session refresh fails — which includes network unavailability. This is a known open bug with no official fix as of April 2026.
**How to avoid:** In the `onAuthStateChange` handler, treat `SIGNED_OUT` defensively — set session to null (which the `Stack.Protected guard={!!session}` handles by routing to sign-in). Add a visible offline notice on the sign-in screen using NetInfo.
**Warning signs:** `AuthSessionMissingError` in logs; blank screen on launch when offline.

### Pitfall 3: runtimeVersion Fingerprint + OTA Update Mismatch

**What goes wrong:** An OTA update is rejected by the runtime because the fingerprint doesn't match the installed build.
**Why it happens:** The `fingerprint` policy calculates a hash of all native dependencies. If you publish an OTA update that changes a native module (e.g., adds `expo-notifications`), the fingerprint changes and existing installs can't receive the update.
**How to avoid:** OTA updates (JS-only changes) are safe with fingerprint. Adding/upgrading native packages requires a new EAS build. The `staging` channel workflow (deploy to staging, verify, promote) catches this before hitting production users.
**Warning signs:** `No compatible update found` in device logs.

### Pitfall 4: Stack.Protected Flash Before Auth Resolves

**What goes wrong:** On app launch, the user briefly sees the protected tabs screen before being redirected to the landing screen (or vice versa).
**Why it happens:** `onAuthStateChange` is async — there's a window between mount and first event where `session` is `null` even for authenticated users.
**How to avoid:** Set `isLoading: true` initially in the auth store. Keep `SplashScreen.preventAutoHideAsync()` active until the first `getSession()` resolves. Only hide the splash screen when `isLoading` becomes `false`. Return null from `RootNavigator` while loading.
**Warning signs:** Flash of landing screen for already-authenticated users.

### Pitfall 5: npx expo install vs npm install

**What goes wrong:** `react-native-safe-area-context` or other Expo-ecosystem packages install at incompatible versions, causing cryptic native module errors.
**Why it happens:** `npm install` fetches the latest version from npm which may not match Expo SDK 55's required peer version. `npx expo install` consults the Expo SDK version manifest and pins to the correct peer version.
**How to avoid:** All Expo-ecosystem package installs must use `npx expo install`. Only use `npm install` for packages that are not Expo-ecosystem (e.g., `zustand`, which has no native code and no Expo peer constraints).

### Pitfall 6: RLS Policies Without Indexes

**What goes wrong:** Supabase queries become slow as the table grows, especially on `user_id` and `is_published` columns.
**Why it happens:** RLS policies run like WHERE clauses on every query. Without an index on `user_id`, a full table scan runs for every authenticated request.
**How to avoid:** Create indexes on all columns referenced in RLS policies:
```sql
CREATE INDEX ON user_lesson_progress (user_id);
CREATE INDEX ON lessons (is_published, topic_id);
CREATE INDEX ON questions (is_published, section_id);
```
**Warning signs:** Slow queries in Supabase dashboard logs; `Seq Scan` in EXPLAIN ANALYZE output.

### Pitfall 7: Hardcoded Sample Lesson Data

**What goes wrong:** Sample lesson questions diverge from real lesson schema as the schema evolves, breaking the sample lesson screen.
**Why it happens:** Sample lesson is hardcoded (D-03) but the question type must match `Section`/`Question` structure used by real lessons.
**How to avoid:** Define the sample lesson data using the same TypeScript types generated from the schema (`Database['public']['Tables']['questions']['Row']`). Even though the data is hardcoded, it must match the real shape.

---

## Supabase Schema Reference

### Content Tables

```sql
-- modules
CREATE TABLE modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- topics
CREATE TYPE lesson_type_enum AS ENUM ('standard', 'practice', 'challenge');

CREATE TABLE topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order INTEGER NOT NULL,
  requires_topic_id UUID REFERENCES topics(id),  -- sequential unlock (D-23)
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- lessons
CREATE TABLE lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  lesson_type lesson_type_enum DEFAULT 'standard',  -- CONT-02
  xp_reward INTEGER DEFAULT 10,                     -- CONT-03
  order INTEGER NOT NULL,                           -- CONT-04 sequential unlock
  is_published BOOLEAN DEFAULT FALSE,               -- CONT-05
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- sections
CREATE TABLE sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  order INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- questions
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,       -- array of {id, text, is_correct}
  explanation TEXT,             -- CONT-06: required before is_published=true
  order INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### User Tables

```sql
-- profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  daily_goal INTEGER DEFAULT 2,   -- D-09: 1=Chill, 2=Steady, 3=Focused
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_lesson_progress (for Phase 2+ completion tracking)
CREATE TABLE user_lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ,
  best_score NUMERIC(5,2),
  attempt_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);
```

### RLS Policies

```sql
-- Enable RLS on all public tables (SEED-02)
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Content: authenticated users can read published rows (D-24)
CREATE POLICY "Authenticated users read published modules"
  ON modules FOR SELECT TO authenticated
  USING (is_published = TRUE);

CREATE POLICY "Authenticated users read published topics"
  ON topics FOR SELECT TO authenticated
  USING (is_published = TRUE);

CREATE POLICY "Authenticated users read published lessons"
  ON lessons FOR SELECT TO authenticated
  USING (is_published = TRUE);

CREATE POLICY "Authenticated users read published sections"
  ON sections FOR SELECT TO authenticated
  USING (is_published = TRUE);

CREATE POLICY "Authenticated users read published questions"
  ON questions FOR SELECT TO authenticated
  USING (is_published = TRUE);

-- Profiles: users manage only their own row (D-24)
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- Progress: users manage only their own rows (D-24)
CREATE POLICY "Users read own progress"
  ON user_lesson_progress FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users upsert own progress"
  ON user_lesson_progress FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users update own progress"
  ON user_lesson_progress FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Performance: index RLS-referenced columns
CREATE INDEX ON user_lesson_progress (user_id);
CREATE INDEX ON user_lesson_progress (lesson_id);
CREATE INDEX ON lessons (topic_id, is_published);
CREATE INDEX ON topics (module_id, is_published);
CREATE INDEX ON sections (lesson_id, is_published);
CREATE INDEX ON questions (section_id, is_published);
```

Source: [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|-----------------|--------------|--------|
| `@react-native-async-storage/async-storage` for Supabase session | `expo-sqlite/localStorage/install` | Supabase + Expo docs updated ~2024 | Fixes offline session loss bug |
| `useRouter()` + `useEffect` for auth redirects | `Stack.Protected` / `Tabs.Protected` with `guard` prop | Expo Router v3 (SDK 55) | Declarative, handles deep links, clears history |
| `auth.getSession()` for session checks | `auth.getUser()` | Supabase recommendation (ongoing) | Avoids `AuthSessionMissingError` on multi-device logout |
| `runtimeVersion: "1.0.0"` hardcoded | `runtimeVersion: { policy: "fingerprint" }` | Expo SDK 50+ | Auto-increments on native changes; no manual version management |
| React Navigation directly | Expo Router | Expo Router GA | File-based routing, deep links, auth guards built-in |
| `npm install` for all packages | `npx expo install` for Expo-ecosystem packages | Ongoing Expo recommendation | Peer version resolution prevents incompatibility crashes |

**Deprecated/outdated:**
- `expo-auth-session` for email/password: Not applicable — use `supabase.auth.signInWithPassword()` directly.
- `@react-native-async-storage/async-storage` for Supabase session: Use expo-sqlite localStorage instead.
- Imperative auth redirect via `router.replace()` in `useEffect`: Use `Stack.Protected` guard instead.

---

## Open Questions

1. **Supabase project URL and anon key**
   - What we know: Environment variables `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are the standard pattern
   - What's unclear: Supabase is transitioning to new publishable key format (`sb_publishable_xxx`); both legacy `anon` key and new format work with current `supabase-js`
   - Recommendation: Use whichever key format the project's Supabase dashboard provides; both work with `createClient`

2. **Exact accent color hex**
   - What we know: D-11 specifies "soft coral/peach (~`#FF6B6B`)" with "exact hex to be refined"
   - What's unclear: `#FF6B6B` was used as a placeholder — final color needs design review
   - Recommendation: Use `#FF6B6B` as the implementation starting point; expose as `COLORS.accent` in theme.ts so it's a single change

3. **EAS project ID for `app.config.js`**
   - What we know: `runtimeVersion: fingerprint` and `updates.url` require an EAS project ID
   - What's unclear: Project has not been initialized with EAS yet — ID is not known
   - Recommendation: Plan 1 (scaffold) must run `eas project:init` to obtain the project ID before `app.config.js` OTA config is complete

4. **Supabase project creation**
   - What we know: A Supabase project needs to exist before Plan 2 (schema migration) can run
   - What's unclear: Project hasn't been created yet
   - Recommendation: Plan 2 begins with `supabase init` and `supabase link --project-ref <ref>`

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All JS tooling | Yes | v25.8.1 | — |
| git | Version control | Yes | 2.53.0 | — |
| npx | Package execution | Yes | 11.11.0 | — |
| eas-cli | EAS builds + OTA | No | 18.5.0 (npm) | Install: `npm install -g eas-cli` |
| supabase CLI | Schema migrations, type gen | No | 2.84.10 (npm) | Install: `npm install -g supabase` |
| expo CLI | Project scaffold | No (use npx) | 55.0.x (via npx) | `npx expo` works without global install |
| Xcode / iOS Simulator | iOS development | Unknown | — | Android-only testing until verified |
| Android SDK | Android development | Unknown | — | iOS-only testing until verified |

**Missing dependencies with no fallback:**
- `eas-cli` — required for SEED-05 (EAS build profiles, OTA channels). Must be installed before Plan 1 can complete EAS configuration.
- `supabase CLI` — required for SEED-02 (schema migrations with RLS). Must be installed before Plan 2.

**Missing dependencies with fallback:**
- iOS Simulator / Android emulator — can test on physical device via Expo Go during development builds.

---

## Validation Architecture

Nyquist validation is enabled (`workflow.nyquist_validation: true`). This project is React Native / Expo — the test infrastructure has specific constraints that differ from web.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest + `@testing-library/react-native` |
| Config file | `jest.config.js` (none — Wave 0 creates it) |
| Quick run command | `npx jest --testPathPattern="__tests__" --passWithNoTests` |
| Full suite command | `npx jest --coverage` |

React Native testing notes:
- Expo Managed Workflow uses the `jest-expo` preset, which must be used instead of plain `jest` preset
- `@testing-library/react-native` v13+ supports async testing of hooks
- Supabase client must be mocked in tests (`jest.mock('@/lib/supabase')`)
- Navigation (`expo-router`) uses `jest-expo` for routing tests

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Landing screen renders "Try a lesson" CTA without requiring auth | Unit | `npx jest __tests__/landing.test.tsx -x` | Wave 0 |
| AUTH-02 | `signUp()` called with email + password; no other fields | Unit | `npx jest __tests__/auth.test.ts -x` | Wave 0 |
| AUTH-03 | `persistSession: true` in supabase client config | Unit | `npx jest __tests__/supabase-client.test.ts -x` | Wave 0 |
| AUTH-04 | Import order: localStorage/install before URL polyfill before createClient | Unit | `npx jest __tests__/supabase-client.test.ts -x` | Wave 0 |
| AUTH-05 | SIGNED_OUT event sets session to null (no crash) | Unit | `npx jest __tests__/auth-store.test.ts -x` | Wave 0 |
| AUTH-06 | Authenticated user: Stack.Protected renders (tabs), not onboarding | Unit | `npx jest __tests__/routing.test.tsx -x` | Wave 0 |
| AUTH-07 | Goal selection screen renders 3 cards; tap updates profile | Unit | `npx jest __tests__/goal-selection.test.tsx -x` | Wave 0 |
| CONT-01..05 | Schema tables + columns exist with correct types | DB smoke | `supabase db push --dry-run` (manual) | Manual |
| SEED-02 | RLS enabled on all public tables | DB smoke | `psql` query against `pg_tables` (manual) | Manual |
| SEED-05 | `runtimeVersion` key exists in app.config.js output | Unit | `npx jest __tests__/app-config.test.ts -x` | Wave 0 |
| SEED-06 | FlatList windowing props present on content lists | Unit | `npx jest __tests__/flatlist-config.test.tsx -x` | Wave 0 |
| DASH-04 | Tab navigator renders exactly 5 tabs | Unit | `npx jest __tests__/tabs-layout.test.tsx -x` | Wave 0 |

Database schema requirements (CONT-01..05, SEED-02) are validated manually via Supabase dashboard / `psql` + SQL introspection — these cannot be automated in Jest.

### Sampling Rate

- **Per task commit:** `npx jest --testPathPattern="__tests__" --passWithNoTests`
- **Per wave merge:** `npx jest --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `jest.config.js` — configure `jest-expo` preset
- [ ] `__tests__/supabase-client.test.ts` — covers AUTH-03, AUTH-04 (import order + config)
- [ ] `__tests__/auth-store.test.ts` — covers AUTH-05 (SIGNED_OUT defensive handling)
- [ ] `__tests__/routing.test.tsx` — covers AUTH-06 (Stack.Protected guard behavior)
- [ ] `__tests__/landing.test.tsx` — covers AUTH-01 (public access to landing screen)
- [ ] `__tests__/goal-selection.test.tsx` — covers AUTH-07 (3 cards + tap behavior)
- [ ] `__tests__/tabs-layout.test.tsx` — covers DASH-04 (5 tabs rendered)
- [ ] `__tests__/flatlist-config.test.tsx` — covers SEED-06 (windowing props)
- [ ] `__tests__/app-config.test.ts` — covers SEED-05 (runtimeVersion key present)
- [ ] Install test dependencies: `npx expo install jest-expo @testing-library/react-native`

---

## Project Constraints (from CLAUDE.md)

The following directives from CLAUDE.md are binding — research recommendations must not contradict them:

| Directive | Source | Constraint Level |
|-----------|--------|-----------------|
| React Native / Expo + Supabase stack | CLAUDE.md §Constraints | LOCKED — not up for debate during MVP |
| Expo SDK 55 Managed Workflow | CLAUDE.md §Technology Stack | LOCKED |
| supabase-js v2.49.9+ | CLAUDE.md §Known Issues | LOCKED — ws/stream crash fix |
| expo-sqlite session storage (not AsyncStorage) | CLAUDE.md §Known Issues | LOCKED — offline session bug |
| URL polyfill before Supabase init | CLAUDE.md §Known Issues | LOCKED — developer error if omitted |
| `npx expo install` for Expo-ecosystem packages | CLAUDE.md §Known Issues | REQUIRED |
| TanStack Query v5 for server data | CLAUDE.md §Technology Stack | LOCKED |
| Zustand for client state | CLAUDE.md §Technology Stack | LOCKED |
| `src/app/` — route files only, no business logic | CLAUDE.md §Project Structure | REQUIRED |
| `src/lib/supabase.ts` — single client instance | CLAUDE.md §Project Structure | REQUIRED |
| `src/types/database.ts` — generated types, use everywhere | CLAUDE.md §Project Structure | REQUIRED |
| No dark mode for MVP | CONTEXT.md D-10 | LOCKED |
| No custom font imports for MVP | CONTEXT.md D-13 | LOCKED |
| No scope creep before validation | CLAUDE.md §Constraints | LOCKED |

---

## Sources

### Primary (HIGH confidence)

- [Expo — Using Supabase](https://docs.expo.dev/guides/using-supabase/) — expo-sqlite localStorage setup, import order, Supabase client config
- [Expo Router — Authentication](https://docs.expo.dev/router/advanced/authentication/) — SessionProvider pattern, Stack.Protected with auth state
- [Expo Router — Protected Routes](https://docs.expo.dev/router/advanced/protected/) — Stack.Protected guard prop, redirect behavior
- [Expo Router — Tabs](https://docs.expo.dev/router/advanced/tabs/) — (tabs)/_layout.tsx, tabBarActiveTintColor, tabBarIcon
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — SQL policy patterns, (SELECT auth.uid()) optimization
- [EAS JSON Reference](https://docs.expo.dev/eas/json/) — build profile channel configuration
- [EAS Update — Runtime Versions](https://docs.expo.dev/eas-update/runtime-versions/) — fingerprint policy configuration
- [TanStack Query — React Native](https://tanstack.com/query/v5/docs/framework/react/react-native) — AppState + onlineManager wiring
- npm registry (verified 2026-04-06) — all package versions confirmed current

### Secondary (MEDIUM confidence)

- [Expo blog — Simplifying auth flows with protected routes](https://expo.dev/blog/simplifying-auth-flows-with-protected-routes) — Stack.Protected code patterns, play-first routing
- [DEV Community — Simplifying Auth with Stack.Protected in Expo Router](https://dev.to/aaronksaunders/simplifying-auth-and-role-based-routing-with-stack-protected-in-expo-router-592m) — Tabs.Protected nested pattern
- [supabase-js ws issue fix](https://github.com/supabase/supabase-js/issues/1434) — confirmed fixed in v2.49.9

### Tertiary (LOW confidence — for awareness only)

- [Supabase auth session lost offline discussion](https://github.com/orgs/supabase/discussions/36906) — no official fix; defensive SIGNED_OUT handling is the current community workaround

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry 2026-04-06
- Expo Router auth pattern: HIGH — verified against official Expo docs and blog post
- Supabase localStorage setup: HIGH — verified against official Expo + Supabase docs
- RLS SQL patterns: HIGH — verified against official Supabase docs
- EAS build/OTA config: MEDIUM — channel configuration verified; fingerprint runtimeVersion syntax confirmed from docs; EAS project ID is unknown (greenfield)
- TanStack Query + Zustand setup: HIGH — verified against official docs

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (30 days — stable ecosystem, no fast-moving breaking changes expected)
