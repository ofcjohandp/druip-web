# Technology Stack: Druip

**Project:** Druip — Duolingo-style study app for South African university students
**Domain:** Cross-platform mobile (iOS + Android), gamified learning, Supabase backend
**Researched:** 2026-04-06
**Overall confidence:** HIGH (all major claims verified against official docs and GitHub issues)

---

## 1. Expo SDK Version

**Use Expo SDK 55 (current stable as of April 2026).**

SDK 55 ships with React Native 0.83 and React 19.2. It is the current production-ready release. SDK 56 (RN 0.85) is planned for Q2 2026 but is not yet stable — do not wait for it.

**Critical: The New Architecture is mandatory in SDK 55.** There is no opt-out. The `newArchEnabled` config option has been removed. This is not a problem for a greenfield project — design for it from day one. All `expo-*` packages in the SDK fully support the New Architecture.

### Managed Workflow vs. Bare Workflow

**Use the Managed Workflow.** Bare workflow is no longer the escape hatch it once was. Since Expo introduced Config Plugins, you can hook into native build configuration through `app.json` / `app.config.ts` without ever touching `ios/` or `android/` directories. For Druip's requirements (auth, database, realtime, gamification UI), every dependency you will need has a Config Plugin. The Managed Workflow also means EAS Build works without custom native build pipelines.

Only switch to Bare if you need a native module with no Config Plugin and no Expo-compatible alternative. That scenario is unlikely for an MVP.

### Setup

```bash
npx create-expo-app@latest druip --template blank-typescript
```

The default template in SDK 55 ships with a `/src` directory structure. Keep it — it is the officially recommended layout (see section 7).

---

## 2. Supabase Client Setup in React Native

### Current Recommended Approach (SDK 55 / supabase-js v2.49.9+)

The official Expo docs changed the session storage approach in late 2025. **Do not use `@react-native-async-storage/async-storage` for session persistence.** The current recommended approach uses `expo-sqlite`'s localStorage shim, which is faster, synchronous-compatible, and avoids the class of bugs that plagued AsyncStorage-based auth.

Install:
```bash
npx expo install @supabase/supabase-js react-native-url-polyfill expo-sqlite
```

`lib/supabase.ts`:
```ts
import 'react-native-url-polyfill/auto';
import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Environment Variables

Use the `EXPO_PUBLIC_` prefix. Expo statically replaces these at build time (they are not truly secret — treat the publishable key accordingly).

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

The `sb_publishable_xxx` format is Supabase's new key format. Use it over the legacy `anon` key for new projects. **Never use the `service_role` key client-side.**

### Known Gotchas

**1. The `ws`/`stream` module crash (RESOLVED)**
Supabase-js v2.49.8 and earlier crashed React Native apps due to a Node.js-only `ws` WebSocket module being bundled even when Realtime was disabled. Fixed in v2.49.9. Keep supabase-js at v2.49.9 or later — verify `package.json` does not pin to an older version.

**2. Session lost when starting app offline (OPEN BUG)**
When `autoRefreshToken: true` and the app launches without internet, `startAutoRefresh()` attempts a token refresh, fails, and clears the stored session. The user is silently logged out.

Workaround: wrap the AppState listener call conditionally on network availability, or disable it entirely and call refresh manually when connectivity is restored. The issue affects the `@react-native-async-storage` path specifically — the `expo-sqlite` localStorage path may behave differently, but treat offline launch as an untested risk until confirmed. See [GitHub Discussion #36906](https://github.com/orgs/supabase/discussions/36906).

**3. `AuthSessionMissingError` on logout across devices**
If the same user is signed in on two platforms (e.g., web + mobile), signing out on one and then calling `supabase.auth.signOut()` on the other throws `AuthSessionMissingError`. Use `supabase.auth.getUser()` instead of `supabase.auth.getSession()` when checking session validity — `getUser()` makes a network call to verify against the server and handles this case correctly.

**4. Parameter-less RPC calls fail with PGRST202**
When calling a Postgres function with no parameters via `supabase.rpc('function_name')`, supabase-js may serialize the body incorrectly. Pass an explicit empty object: `supabase.rpc('function_name', {})` as a workaround.

**5. URL polyfill must be imported first**
`react-native-url-polyfill/auto` must be the first import in `lib/supabase.ts` (or imported at the app entry point before supabase initializes). Supabase uses the `URL` class internally — without the polyfill, subtle failures occur in auth flows.

---

## 3. Navigation: Expo Router

**Use Expo Router (not React Navigation directly).**

Expo Router is built on top of React Navigation, so you do not lose anything by choosing it. You gain file-based routing, automatic deep linking, and `Stack.Protected` for auth guards — all without manual route registration.

For Druip specifically, Expo Router's `Stack.Protected` API (available since SDK 53, stable in SDK 55) is purpose-built for the auth gate pattern: protect the entire authenticated stack declaratively in the root layout.

```tsx
// src/app/_layout.tsx
<Stack.Protected guard={!!session}>
  {/* authenticated routes */}
</Stack.Protected>
<Stack.Protected guard={!session}>
  {/* login / onboarding */}
</Stack.Protected>
```

Deep linking matters for a gamification app (share a challenge, open a streak reminder notification). Expo Router generates this for free from your file structure — React Navigation requires explicit manual configuration.

**When React Navigation directly makes sense:** You have deeply non-standard navigation logic (e.g., a wizard that skips files dynamically at runtime based on server data). For Druip's MVP, that case does not apply.

---

## 4. State Management

**Use TanStack Query v5 for server state + Zustand for client state. Do not use Redux.**

This is the 2025/2026 community standard for React Native apps of this scope. The responsibilities are cleanly separated:

| Concern | Library | Why |
|---------|---------|-----|
| Server data (questions, progress, leaderboards) | TanStack Query v5 | Caching, background refetch, loading/error states, stale-while-revalidate — eliminates 80% of data-fetching boilerplate |
| Client-only state (active quiz session, streak counter in memory, modal visibility, theme) | Zustand | Minimal API, no boilerplate, works well with React Native's component tree |
| Auth state | Supabase's own `onAuthStateChange` + Zustand to expose to the component tree | Keeps auth logic co-located with Supabase |

Install:
```bash
npx expo install @tanstack/react-query zustand
```

TanStack Query does not need a separate fetch layer — call `supabase.from(...)` directly inside `queryFn`. Example:

```ts
const { data: questions } = useQuery({
  queryKey: ['module', moduleId, 'questions'],
  queryFn: () =>
    supabase.from('questions').select('*').eq('module_id', moduleId).throwOnError(),
  staleTime: 1000 * 60 * 5, // 5 minutes
});
```

For Druip's gamification layer (XP, streaks, badges), Zustand holds in-session state that does not need to round-trip to the server on every render.

---

## 5. Offline Support

**Verdict: Implement lightweight offline support for read access. Do not build a full offline-first sync architecture for MVP.**

### The Reality for South African University Students

Mobile data costs and network reliability on South African campuses are real constraints. Students will encounter dead spots. The question is: what breaks, and how badly?

For an MVP targeting one university, one course, one module — the dataset is small and bounded. Exam questions and course content change infrequently. This makes read caching viable without full sync infrastructure.

### Recommended Approach: TanStack Query + MMKV persister

TanStack Query's `persistQueryClient` with an MMKV persister gives you cached query results across app restarts at almost no architectural cost. Students can open the app offline and see their last-loaded questions, their progress, their leaderboard position — all from cache.

```bash
npx expo install react-native-mmkv @tanstack/query-persist-client-core @tanstack/query-sync-storage-persister
```

Configure once in your query client setup:

```ts
import { MMKV } from 'react-native-mmkv';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/query-persist-client-core';

const storage = new MMKV();
const persister = createSyncStoragePersister({
  storage: {
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
});
```

Set `networkMode: 'offlineFirst'` in the query client defaults so cached data is served immediately before attempting a network fetch.

### When to Use WatermelonDB Instead

WatermelonDB + Supabase sync (Supabase's own blog post covers this pattern) is the right call if:
- The student must submit quiz answers offline and sync later
- Offline write conflicts need resolution
- The dataset grows to tens of thousands of records

For MVP, this adds significant schema maintenance overhead (duplicate models in WatermelonDB + Supabase migrations + sync functions). Defer until the write-offline use case is confirmed as a requirement.

### What Will Not Work Offline

- Auth (session refresh requires network — see gotcha #2 above)
- Submitting quiz answers (requires network to persist to Supabase)
- Realtime leaderboard updates

Design the UI to handle `isOffline` state gracefully: show cached data with a banner, disable submission buttons, queue writes if necessary in a later phase.

---

## 6. Supabase + React Native Known Issues Summary

All verified against GitHub issues and official docs as of April 2026:

| Issue | Status | Action |
|-------|--------|--------|
| `ws`/`stream` module crash | Fixed in supabase-js v2.49.9 | Pin to v2.49.9+ in `package.json` |
| Session lost on offline launch | Open bug, no official fix | Handle `SIGNED_OUT` event defensively; show login screen rather than crashing |
| `AuthSessionMissingError` on multi-device logout | Workaround exists | Use `getUser()` over `getSession()` for session checks |
| Parameter-less RPC PGRST202 | Workaround exists | Pass `{}` explicitly to `rpc()` calls |
| URL polyfill not applied | Developer error | Import `react-native-url-polyfill/auto` before supabase initializes |
| `react-native-safe-area-context` version conflict | Intermittent | Use `npx expo install` (not `npm install`) for all Expo-ecosystem packages — it resolves to the correct peer-compatible version |
| Realtime in New Architecture (SDK 55) | No confirmed breakage as of April 2026 | Test Realtime subscriptions early in development; do not assume it works until verified |

**Rule:** Always use `npx expo install <package>` instead of `npm install` or `yarn add` for any package that touches native code or Expo's dependency tree. Expo's package manager resolves to versions compatible with your current SDK.

---

## 7. Project Structure

Based on the official Expo blog post on folder structure and community patterns for Expo Router + TanStack Query + Zustand apps.

```
druip/
├── src/
│   ├── app/                        # Expo Router: file-based routes only
│   │   ├── _layout.tsx             # Root layout (auth guard, providers)
│   │   ├── (auth)/                 # Unauthenticated route group
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── (tabs)/                 # Authenticated tab navigator
│   │   │   ├── _layout.tsx
│   │   │   ├── home.tsx
│   │   │   ├── study.tsx
│   │   │   └── leaderboard.tsx
│   │   └── quiz/
│   │       └── [sessionId].tsx     # Dynamic quiz session screen
│   │
│   ├── components/                 # Shared, reusable UI components
│   │   ├── ui/                     # Primitives: Button, Card, Badge, etc.
│   │   └── gamification/           # XP bar, streak flame, progress ring
│   │
│   ├── features/                   # Feature slices (co-locate logic with UI)
│   │   ├── quiz/
│   │   │   ├── useQuizSession.ts   # Zustand store slice for active quiz
│   │   │   ├── QuizCard.tsx
│   │   │   └── queries.ts          # TanStack Query hooks for quiz data
│   │   ├── progress/
│   │   │   ├── queries.ts
│   │   │   └── ProgressSummary.tsx
│   │   └── leaderboard/
│   │       ├── queries.ts
│   │       └── LeaderboardRow.tsx
│   │
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client (single export)
│   │   ├── queryClient.ts          # TanStack Query client + MMKV persister
│   │   └── store.ts                # Zustand root store
│   │
│   ├── hooks/                      # App-wide custom hooks (useAuth, useNetwork)
│   ├── providers/                  # React context providers (QueryClientProvider, etc.)
│   ├── constants/                  # Theme colors, spacing, gamification config
│   └── types/                      # Shared TypeScript types / Supabase generated types
│
├── assets/                         # Images, fonts, icons
├── app.json                        # Expo config
├── app.config.ts                   # Dynamic Expo config (if needed)
├── .env                            # EXPO_PUBLIC_* variables (gitignored)
├── .env.example                    # Committed env template
└── package.json
```

**Key decisions in this structure:**

- `src/app/` contains only route files. No business logic. Screen files are thin — they import from `features/`.
- `src/features/` groups everything belonging to a feature: query hooks, Zustand slices, and feature-specific components. This prevents a sprawling flat `components/` folder as the app grows.
- `src/lib/supabase.ts` is the single point of Supabase client initialization. Nothing else creates a client.
- Supabase-generated TypeScript types live in `src/types/database.ts` (generate with `supabase gen types typescript --project-id <id> > src/types/database.ts`). Use these everywhere — they eliminate an entire class of runtime type errors.
- Route groups use parentheses `(auth)`, `(tabs)` — these are Expo Router conventions, not folder name choices.

---

## Recommended Package List

```bash
# Core
npx expo install expo@55 @supabase/supabase-js react-native-url-polyfill expo-sqlite

# Navigation (included with Expo Router in SDK 55)
# expo-router is bundled — no separate install needed

# State management
npx expo install @tanstack/react-query zustand

# Offline persistence
npx expo install react-native-mmkv @tanstack/query-persist-client-core @tanstack/query-sync-storage-persister

# Network awareness (for offline detection)
npx expo install @react-native-community/netinfo
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Navigation | Expo Router | React Navigation directly | Expo Router is a superset; adds deep linking, auth guards, no downside for this project |
| Session storage | expo-sqlite localStorage | @react-native-async-storage/async-storage | AsyncStorage has the offline session-loss bug; expo-sqlite is the current official recommendation |
| Client state | Zustand | Redux Toolkit | Redux is overbuilt for this scope; Zustand has no boilerplate cost |
| Server state | TanStack Query | SWR | TanStack Query has better offline + persistence story; larger ecosystem |
| Local DB (offline writes) | WatermelonDB (deferred) | Realm, SQLite directly | WatermelonDB has native Supabase sync guide; defer until write-offline is confirmed requirement |
| Key-value storage | MMKV | AsyncStorage | MMKV is 20x faster; synchronous API required by TanStack Query persister |

---

## Sources

- [Expo SDK 55 Changelog](https://expo.dev/changelog/sdk-55)
- [Using Supabase — Expo Docs](https://docs.expo.dev/guides/using-supabase/)
- [Supabase Auth with React Native — Supabase Docs](https://supabase.com/docs/guides/auth/quickstarts/react-native)
- [Supabase Expo Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native)
- [supabase-js ws issue — Fixed in v2.49.9](https://github.com/supabase/supabase-js/issues/1434)
- [Supabase auth session lost offline — Open discussion](https://github.com/orgs/supabase/discussions/36906)
- [Expo app folder structure best practices — Expo Blog](https://expo.dev/blog/expo-app-folder-structure-best-practices)
- [Expo Router protected routes](https://docs.expo.dev/router/advanced/protected/)
- [TanStack Query persistQueryClient](https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient)
- [Offline-first React Native with TanStack Query — DEV Community](https://dev.to/fedorish/react-native-offline-first-with-tanstack-query-1pe5)
- [Offline-first with WatermelonDB + Supabase — Supabase Blog](https://supabase.com/blog/react-native-offline-first-watermelon-db)
- [StorageBenchmark: MMKV vs AsyncStorage vs WatermelonDB](https://github.com/mrousavy/StorageBenchmark)
