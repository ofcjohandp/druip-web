# Phase 6: Direct Messaging - Research

**Researched:** 2026-04-06
**Domain:** React Native chat UI + Supabase schema + TanStack Query patterns
**Confidence:** HIGH — all findings are derived directly from the existing codebase, established migration patterns, and locked CONTEXT.md decisions.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** "Message tutor" button added to classroom-detail, visible only to subscribers (isSubscribed check, Phase 5 D-18 pattern).
- **D-02:** New non-tab route `/(tabs)/dm-chat`, registered as `href: null` in `_layout.tsx`. `classroomId` passed as param.
- **D-03:** Non-subscribers do NOT see "Message tutor" button — conditional render, not disabled/opacity.
- **D-04:** Manage Classroom screen gets a "Messages" section listing all subscribed students.
- **D-05:** Same `/(tabs)/dm-chat` route for both tutor and student. Adapted by checking current user vs. tutor role: if current user is tutor, show student messages; if student, show tutor messages.
- **D-06:** Unread indicator on subscriber rows is Claude's discretion — keep simple.
- **D-07:** Pull-to-refresh only. No Supabase Realtime. Messages fetched via TanStack Query on mount and on refresh.
- **D-08:** Chronological order (oldest top, newest bottom). Auto-scroll to bottom on load and after send.
- **D-09:** Single-line TextInput expanding to ~3 lines max at bottom of screen. Send button right. Clears on send.
- **D-10:** Student passes `classroomId` only. `dm-chat` derives `tutorId` from classroom data.
- **D-11:** iMessage-style bubbles. Current user right (COLORS.accent, white text). Other party left (COLORS.surface, COLORS.text).
- **D-12:** Timestamp below each bubble (COLORS.textMuted, caption size 12px).
- **D-13:** No avatars per bubble.
- **D-14:** `messages` table: `id UUID PK`, `classroom_id UUID FK → classrooms.id`, `sender_id UUID FK → profiles.id`, `content TEXT NOT NULL`, `created_at TIMESTAMPTZ DEFAULT now()`.
- **D-15:** No `recipient_id`. Conversation is classroom-scoped. Two-party thread = all messages for a classroom where sender_id is either current user or the other party.
- **D-16:** RLS: subscriber can read/insert (active subscription check), tutor can read/insert (classroom ownership check).
- **D-17:** Migration file: `supabase/migrations/{timestamp}_add_messages_table.sql`. Next sequential number is 00012.
- **D-18:** `useMessages(classroomId, otherUserId)` hook. Query key: `['messages', classroomId, otherUserId]`.
- **D-19:** `useSendMessage` mutation. On success, invalidates `['messages', classroomId, otherUserId]`.
- **D-20:** `useClassroomSubscribers(classroomId)` hook. Query key: `['subscribers', classroomId]`.

### Claude's Discretion

- Empty state for chat screen when no messages exist ("Start the conversation…")
- Loading and error states for message fetch and send
- Keyboard avoidance behaviour (KeyboardAvoidingView or equivalent)
- Exact padding, border-radius on bubbles (use RADII and SPACING tokens)
- Whether to show a "sending…" optimistic state or just wait for confirmation
- Unread indicator style on tutor's subscriber list

### Deferred Ideas (OUT OF SCOPE)

- Supabase Realtime live updates — deferred to v1.1
- Push notifications for new messages — out of scope v1.0
- Image/file attachments — text only
- Read receipts / message status — future phase
- Typing indicators — future phase
- Global DM inbox tab — deferred
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MSG-01 | Subscribed student can send a direct message to the tutor | D-01, D-02, D-07, D-09, D-19 — button on classroom-detail, dm-chat screen, useSendMessage hook |
| MSG-02 | Tutor can reply to student messages | D-04, D-05, D-19 — subscriber list on manage-classroom, shared dm-chat route, same useSendMessage hook |
| MSG-03 | Both parties can view full message history in a chat-style screen | D-07, D-08, D-11, D-12, D-18 — useMessages hook, FlatList with bubbles, chronological order |
</phase_requirements>

---

## Summary

Phase 6 adds a 1-on-1 text messaging channel between a subscribed student and their tutor. The architecture is straightforward: one new Supabase table (`messages`), three new TanStack Query hooks, three new React Native components, one new screen, and targeted additions to two existing screens.

All patterns for this phase already exist in the codebase. The Supabase migration structure, RLS policy shape, TanStack Query hook pattern, non-tab route registration, and navigation passing params are all established and can be followed exactly. The chat bubble UI is the only genuinely new visual pattern — everything else is a direct analogue of Phase 4/5 work.

The main pitfall to watch for is the RLS policy for the `messages` table. Prior phases hit an infinite recursion bug (00011) when querying `tutors` inside a policy that touches `classrooms`. The messages policy can sidestep this entirely by using the same safe `classrooms.tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid())` subquery pattern established in 00007, or the even safer `USING (true)` for tutor SELECT as in 00011.

**Primary recommendation:** Follow existing migration and hook patterns precisely. The chat bubble component is new, but every data, navigation, and state pattern has a working prior-phase analogue.

---

## Standard Stack

### Core (all established — no new dependencies)

| Library | Version | Purpose | Already in Project |
|---------|---------|---------|-------------------|
| `@supabase/supabase-js` | v2.49.9+ | Supabase client for INSERT + SELECT | Yes — `src/lib/supabase.ts` |
| `@tanstack/react-query` | v5 | `useQuery` + `useMutation` for messages | Yes |
| `expo-router` | SDK 55 bundled | `useLocalSearchParams`, `router.push`, `href: null` | Yes |
| React Native core | SDK 55 | `FlatList`, `TextInput`, `KeyboardAvoidingView`, `RefreshControl` | Yes |
| `@expo/vector-icons` Ionicons | bundled | `arrow-back` icon in header | Yes |

### No new packages required.

All components are handcrafted from React Native core. No third-party chat UI library is needed or desired — the UI-SPEC specifies custom bubble components using existing design tokens.

---

## Architecture Patterns

### Recommended File Structure (new files only)

```
src/
├── app/(tabs)/
│   └── dm-chat.tsx                     # New screen (non-tab, href: null)
├── features/messaging/
│   ├── MessageBubble.tsx               # Single bubble component
│   ├── ChatInput.tsx                   # Input bar + Send button
│   ├── SubscriberRow.tsx               # Tutor's subscriber list row
│   ├── useMessages.ts                  # TanStack Query read hook
│   ├── useSendMessage.ts               # TanStack Query mutation hook
│   └── useClassroomSubscribers.ts      # Subscriber list hook
└── types/database.ts                   # ADD messages table type
```

### Migration file

```
supabase/migrations/00012_messages_table.sql
```

Next sequential number after `00011_fix_tutors_rls_recursion.sql` is `00012`.

---

### Pattern 1: Non-Tab Route Registration

Follows the same pattern as `classroom-detail` and `subscribe-confirm`.

```typescript
// src/app/(tabs)/_layout.tsx — add alongside existing href: null screens
<Tabs.Screen
  name="dm-chat"
  options={{ title: 'Messages', href: null }}
/>
```

### Pattern 2: TanStack Query Read Hook

Follows `useClassroomDetail` / `useMySubscriptions` pattern exactly.

```typescript
// src/features/messaging/useMessages.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';

export function useMessages(classroomId: string | undefined, otherUserId: string | undefined) {
  const session = useAuthStore((s) => s.session);
  const currentUserId = session?.user?.id;

  return useQuery({
    queryKey: ['messages', classroomId, otherUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('classroom_id', classroomId!)
        .in('sender_id', [currentUserId!, otherUserId!])
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!classroomId && !!otherUserId && !!currentUserId,
  });
}
```

### Pattern 3: TanStack Query Mutation Hook

Follows `useSubscribe` pattern exactly.

```typescript
// src/features/messaging/useSendMessage.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';

export function useSendMessage(classroomId: string, otherUserId: string) {
  const queryClient = useQueryClient();
  const session = useAuthStore((s) => s.session);
  const senderId = session?.user?.id;

  return useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase
        .from('messages')
        .insert({ classroom_id: classroomId, sender_id: senderId!, content });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', classroomId, otherUserId] });
    },
  });
}
```

### Pattern 4: Supabase Migration (RLS Policy Shape)

Follows `00007_subscriptions.sql` pattern. The critical safe subquery pattern (using `SELECT auth.uid()` instead of `auth.uid()` directly) is already established across the codebase. Avoid querying `tutors` inside the `messages` RLS policy to prevent the recursion bug that required `00011`.

```sql
-- supabase/migrations/00012_messages_table.sql

CREATE TABLE messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  sender_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Subscriber can read messages in classrooms they are actively subscribed to
-- (covers both their own sent messages and received messages from the tutor)
CREATE POLICY "subscriber can read classroom messages"
  ON messages FOR SELECT
  USING (
    sender_id = (SELECT auth.uid())
    OR classroom_id IN (
      SELECT classroom_id FROM subscriptions
      WHERE student_id = (SELECT auth.uid()) AND status = 'active'
    )
  );

-- Subscriber can send messages in classrooms they are actively subscribed to
CREATE POLICY "subscriber can insert classroom messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND classroom_id IN (
      SELECT classroom_id FROM subscriptions
      WHERE student_id = (SELECT auth.uid()) AND status = 'active'
    )
  );

-- Tutor can read messages in their own classrooms
-- Using classrooms table directly (not tutors table) to avoid potential recursion
CREATE POLICY "tutor can read own classroom messages"
  ON messages FOR SELECT
  USING (
    classroom_id IN (
      SELECT id FROM classrooms
      WHERE tutor_id IN (
        SELECT id FROM tutors WHERE user_id = (SELECT auth.uid())
      )
    )
  );

-- Tutor can send messages in their own classrooms
CREATE POLICY "tutor can insert own classroom messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND classroom_id IN (
      SELECT id FROM classrooms
      WHERE tutor_id IN (
        SELECT id FROM tutors WHERE user_id = (SELECT auth.uid())
      )
    )
  );
```

### Pattern 5: Screen Param Navigation (Student Side)

```typescript
// classroom-detail.tsx — inside isSubscribed block
router.push(`/(tabs)/dm-chat?classroomId=${id}`);
```

### Pattern 6: Screen Param Navigation (Tutor Side)

```typescript
// manage-classroom.tsx — inside subscriber row onPress
router.push(`/(tabs)/dm-chat?classroomId=${classroomId}&studentId=${student.id}`);
```

### Pattern 7: dm-chat Screen Param Extraction and Role Detection

The screen determines its role by comparing `auth.uid()` against the classroom's `tutor_id`.

```typescript
// src/app/(tabs)/dm-chat.tsx
const { classroomId, studentId } = useLocalSearchParams<{
  classroomId: string;
  studentId?: string;
}>();
const { data: classroom } = useClassroomDetail(classroomId);
const session = useAuthStore((s) => s.session);
const currentUserId = session?.user?.id;

// Determine other party
const isTutor = classroom?.tutor_id && /* lookup tutors.user_id matches currentUserId */
const otherUserId = studentId ?? classroom?.tutor_id;
```

**Important:** `classrooms.tutor_id` references `tutors.id` (not `auth.users.id`). To check if the current user is the tutor, you need to compare `auth.uid()` against `tutors.user_id` for the tutor record. The classroom data from `useClassroomDetail` does not include the tutor's `auth.uid()` — only the tutor FK (`tutors.id`). A join or a separate hook is needed to resolve whether `auth.uid()` is the tutor.

**Simpler approach (recommended for v1.0):** Since `studentId` param is only passed when the tutor navigates, use the presence of `studentId` in params to determine role:
- `studentId` present in params → current user is the tutor; `otherUserId = studentId`
- `studentId` absent in params → current user is the student; `otherUserId` = classroom's tutor user_id (requires resolving via `tutors` join)

The cleanest resolution for `otherUserId` on the student side: query the tutor's `profiles.id` via a join. The `useClassroomDetail` hook returns `tutor_id` (which is `tutors.id`, not `profiles.id`). The `tutors` table has `user_id` which maps to `auth.users.id`. The `profiles` table has `id` which equals `auth.users.id`. So: `tutors.user_id === profiles.id`. The student can pass `classroom.tutor_id` to resolve the tutor's profile via `tutors.user_id`. However, the `messages` table uses `sender_id → profiles.id`, and `profiles.id = auth.users.id`. This means `otherUserId` for the student view should be the tutor's `profiles.id` (= `tutors.user_id`).

**Conclusion:** Extend `useClassroomDetail` to join `tutors(user_id)` so the student gets the tutor's `auth.uid()`-equivalent directly. Or add a small `useTutorUserId(tutorId)` hook that fetches `tutors.user_id` given `tutors.id`. The latter is cleaner and avoids widening the `useClassroomDetail` response shape.

### Pattern 8: MessageBubble Component

```typescript
// src/features/messaging/MessageBubble.tsx
interface MessageBubbleProps {
  content: string;
  createdAt: string;
  isCurrentUser: boolean;
}
// Alignment: alignSelf 'flex-end' | 'flex-start'
// Background: COLORS.accent | COLORS.surface
// Text color: COLORS.textOnAccent | COLORS.text
// Border radius: RADII.card (16) with opposing corner at 4px
// Max width: '75%'
// Timestamp: 12px, COLORS.textMuted, below bubble text
```

### Pattern 9: Keyboard Avoidance

Existing `manage-classroom.tsx` already uses `KeyboardAvoidingView` with `Platform.OS === 'ios' ? 'padding' : 'height'`. Use the same pattern.

### Pattern 10: FlatList Auto-Scroll to End

```typescript
const flatListRef = useRef<FlatList>(null);
// On initial load and after send:
flatListRef.current?.scrollToEnd({ animated: true });
```

Use `onContentSizeChange` on the FlatList to auto-scroll on new data:

```typescript
<FlatList
  ref={flatListRef}
  data={messages}
  onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
  keyExtractor={(item) => item.id}
  ...
/>
```

### Anti-Patterns to Avoid

- **Hooks inside .map():** Use the `SectionWithCards` wrapper pattern from Phase 4. If subscriber rows need per-row query state, create a `SubscriberRowWithUnread` wrapper component.
- **Hardcoded colors:** All bubble colors must come from `COLORS.*` tokens — no hex literals.
- **Using `auth.uid()` directly in RLS USING clauses:** Always wrap in `(SELECT auth.uid())` subquery — this is the established codebase pattern that prevents repeated auth lookups.
- **Querying `tutors` table recursively in RLS:** The `00011` migration fixed exactly this. The `messages` policy queries `classrooms` then `tutors`, which is the same chain — monitor carefully. If recursion occurs, the fallback is to store tutor `user_id` in the `classrooms` table directly or use `USING (true)` for authenticated users and rely on application-level scoping.
- **Using `npm install` for Expo-ecosystem packages:** Always use `npx expo install` to get peer-compatible versions.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pull-to-refresh | Custom polling | `RefreshControl` prop on `FlatList` | Built into React Native; handles native spinner |
| Keyboard avoidance | Custom keyboard listener | `KeyboardAvoidingView` (already in manage-classroom.tsx) | Platform-correct behavior with zero boilerplate |
| Auto-scroll to latest | Custom scroll calculation | `FlatList.scrollToEnd()` + `onContentSizeChange` | Native scroll API handles all edge cases |
| Timestamp formatting | Custom date logic | `new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })` | Built-in JS; sufficient for v1.0 |
| Unread detection | Complex server-side tracking | Heuristic: last message sender !== tutor | Per D-06 discretion; simplest working approach |

---

## Common Pitfalls

### Pitfall 1: RLS Recursion on messages table
**What goes wrong:** A policy like `USING (classroom_id IN (SELECT id FROM classrooms WHERE tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid())))` can trigger infinite recursion (42P17) if `tutors` RLS itself queries `classrooms`.
**Why it happens:** The project hit this exact bug in Phase 5 (fixed by `00011_fix_tutors_rls_recursion.sql` which set `USING (true)` for tutors SELECT).
**How to avoid:** Since `00011` fixed `tutors` to allow all authenticated reads, the chain `classrooms → tutors` no longer loops. Verify the tutors policy is still `USING (true)` before deploying messages RLS. If recursion occurs, restructure tutor identity check to use `classrooms.tutor_id` joined via a security definer function.

### Pitfall 2: classrooms.tutor_id is tutors.id, NOT auth.uid()
**What goes wrong:** The student's dm-chat screen tries to use `classroom.tutor_id` as `otherUserId` in `useMessages`. The messages table stores `sender_id → profiles.id`, and `profiles.id = auth.users.id` — not `tutors.id`. Using `tutors.id` as `sender_id` filter returns no results.
**Why it happens:** `classrooms.tutor_id` is a FK to `tutors.id` (a UUID in the `tutors` table), not the auth user id.
**How to avoid:** Resolve tutor's `profiles.id` (= `auth.users.id`) before calling `useMessages`. Use a `useTutorUserId(tutorId: string)` hook that fetches `SELECT user_id FROM tutors WHERE id = $tutorId`. The result is the value to pass as `otherUserId`.

### Pitfall 3: FlatList keyExtractor missing
**What goes wrong:** React Native FlatList warns and performs poorly without `keyExtractor`.
**Why it happens:** Forgetting to wire the prop.
**How to avoid:** Always pass `keyExtractor={(item) => item.id}`. Messages have UUID PKs — use them directly.

### Pitfall 4: TextInput multiline and Send button layout on Android
**What goes wrong:** On Android, `multiline` TextInput inside a row with a Send button can cause layout shifts as the input grows.
**Why it happens:** Android multiline TextInput height behavior differs from iOS.
**How to avoid:** Set `maxHeight: 72` (3 lines * 24px line height) on TextInput and wrap the row in a View with `alignItems: 'flex-end'` so the Send button stays pinned to the bottom while the input grows upward.

### Pitfall 5: useClassroomSubscribers joining profiles for display names
**What goes wrong:** The subscriber list needs student names. `subscriptions` table only has `student_id` (= `profiles.id`). Without a join, you only have UUIDs.
**Why it happens:** The subscriptions table stores IDs, not denormalised names.
**How to avoid:** In `useClassroomSubscribers`, use a Supabase join: `.select('*, profiles!student_id(email)')` (or `profiles!inner(email)`) to get display data in one query. `profiles.email` is the display fallback since `profiles` does not have a `display_name` column in the current schema.

---

## Database Type Addition

The `src/types/database.ts` file is a manual stub (note at line 1). Add the `messages` table type after migration runs:

```typescript
// In Database['public']['Tables'] — add alongside subscriptions
messages: {
  Row: {
    id: string;
    classroom_id: string;
    sender_id: string;
    content: string;
    created_at: string;
  };
  Insert: {
    classroom_id: string;
    sender_id: string;
    content: string;
  };
  Update: Partial<{ content: string }>;
  Relationships: [];
};
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Realtime subscription for live chat | Pull-to-refresh (D-07) | Eliminates New Architecture Realtime risk; simpler to implement and test |
| recipient_id column | classroom-scoped messages (D-15) | Simpler schema; correct for 1-on-1 tutor/student only |

**Deferred/not applicable:**
- Supabase Realtime: intentionally deferred to v1.1 per D-07. Known risk in New Architecture (CLAUDE.md §Supabase Known Issues).

---

## Environment Availability

Step 2.6: SKIPPED — Phase 6 is purely code and schema changes. No external tools, CLIs, or services beyond the already-verified Supabase project and existing Node/Expo toolchain are required.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | jest-expo (configured in `jest.config.js`) |
| Config file | `jest.config.js` (root) |
| Quick run command | `npx jest src/features/messaging --testPathPattern=messaging` |
| Full suite command | `npx jest` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MSG-01 | `useSendMessage` inserts row with correct classroom_id and sender_id | unit | `npx jest src/features/messaging/__tests__/useSendMessage.test.ts -x` | Wave 0 |
| MSG-01 | `useSendMessage` invalidates `['messages', classroomId, otherUserId]` on success | unit | same file | Wave 0 |
| MSG-02 | `useClassroomSubscribers` returns active subscribers with profile data | unit | `npx jest src/features/messaging/__tests__/useClassroomSubscribers.test.ts -x` | Wave 0 |
| MSG-03 | `useMessages` fetches messages filtered by classroomId + sender_id IN [currentUser, otherUser] | unit | `npx jest src/features/messaging/__tests__/useMessages.test.ts -x` | Wave 0 |
| MSG-03 | `useMessages` orders results by created_at ascending | unit | same file | Wave 0 |

### Sampling Rate

- **Per task commit:** `npx jest src/features/messaging --testPathPattern=messaging`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/features/messaging/__tests__/useMessages.test.ts` — covers MSG-03 (fetch + ordering)
- [ ] `src/features/messaging/__tests__/useSendMessage.test.ts` — covers MSG-01 (insert + invalidate)
- [ ] `src/features/messaging/__tests__/useClassroomSubscribers.test.ts` — covers MSG-02 (subscriber list)

Pattern: use `it.todo()` stubs (same approach as Phase 4/5 test files — zero imports, jest recognises valid suites immediately).

---

## Open Questions

1. **Resolving tutor's auth user id from classrooms.tutor_id**
   - What we know: `classrooms.tutor_id → tutors.id`, `tutors.user_id = auth.users.id = profiles.id`
   - What's unclear: Whether to extend `useClassroomDetail` to include `tutors(user_id)` join, or create a standalone `useTutorUserId` hook
   - Recommendation: Create a standalone `useTutorUserId(tutorId)` hook. Keeps `useClassroomDetail` shape stable and matches the single-responsibility pattern of other feature hooks.

2. **Unread indicator heuristic (D-06, Claude's discretion)**
   - What we know: UI-SPEC says "last message sender is not the tutor" — show dot
   - What's unclear: Whether to fetch last message per subscriber in `useClassroomSubscribers` or make a separate query
   - Recommendation: Include last message metadata in the `useClassroomSubscribers` query via a subselect or a second query per row. Given v1.0 student count is tiny, a simple approach is to fetch all messages for the classroom and compute last-sender client-side. Flag for revision if subscriber count grows.

---

## Sources

### Primary (HIGH confidence)

- Codebase: `supabase/migrations/00007_subscriptions.sql` — RLS pattern for subscriber-scoped policies
- Codebase: `supabase/migrations/00011_fix_tutors_rls_recursion.sql` — established fix for tutors RLS recursion; confirms tutors table is safe to query from other policies
- Codebase: `src/features/student/useMySubscriptions.ts` — canonical TanStack Query read hook pattern
- Codebase: `src/app/(tabs)/_layout.tsx` — exact `href: null` registration syntax
- Codebase: `src/app/(tabs)/classroom-detail.tsx` — isSubscribed check, header pattern, Button usage
- Codebase: `src/app/(tabs)/manage-classroom.tsx` — KeyboardAvoidingView, Platform.OS, ScrollView body pattern
- Codebase: `src/features/ui/theme.ts` — exact COLORS, SPACING, RADII values
- Codebase: `src/features/ui/Button.tsx` — confirmed `title` prop (not `children`), variants
- Codebase: `src/types/database.ts` — confirmed `profiles.id` = auth user id; `tutors.user_id` = auth user id; schema shapes
- Codebase: `jest.config.js` — test framework and test match patterns

### Secondary (MEDIUM confidence)

- CONTEXT.md decisions D-01 through D-20 — locked by user discussion session

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all tools verified in codebase
- Architecture: HIGH — all patterns have direct prior-phase analogues in the codebase
- Pitfalls: HIGH — tutor_id FK mismatch and RLS recursion are codebase-verified facts, not hypotheses
- Database schema: HIGH — follows exact column/type conventions from existing migrations
- Test infrastructure: HIGH — jest.config.js and it.todo() pattern confirmed from Phase 4/5 test files

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable stack, no external dependencies to expire)
