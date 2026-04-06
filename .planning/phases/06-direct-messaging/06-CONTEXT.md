# Phase 6: Direct Messaging - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

1-on-1 DM between a subscribed student and their tutor. Both parties can send text messages and scroll through the full message history in a chat-style screen. Entry point for students is inside the classroom detail. Entry point for tutors is inside the Manage Classroom screen.

No push notifications, no group chat, no media attachments — text only for v1.0.

</domain>

<decisions>
## Implementation Decisions

### DM Entry Point — Student Side
- **D-01:** A "Message tutor" button is added to the classroom detail screen (`src/app/(tabs)/classroom-detail.tsx`), visible **only to subscribers** (isSubscribed check, same pattern as D-18 from Phase 5).
- **D-02:** Tapping "Message tutor" navigates to a new non-tab route `/(tabs)/dm-chat` (registered as `href: null` in `_layout.tsx`), passing `classroomId` as a param. Same navigation pattern as `classroom-detail` and `subscribe-confirm`.
- **D-03:** Non-subscribers do NOT see the "Message tutor" button — DM access is a subscriber-only benefit.

### DM Entry Point — Tutor Side
- **D-04:** Inside the Manage Classroom screen (`src/app/(tabs)/manage-classroom.tsx`), a "Messages" section lists all students who have subscribed to the classroom. Each row shows the student's name and navigates to the shared chat thread.
- **D-05:** Tutor navigates to the same `/(tabs)/dm-chat` route, passing `classroomId` + `studentId` as params. The route adapts: if the current user is the tutor, it shows the student's messages; if the current user is the student, it shows the tutor's messages.
- **D-06:** Unread message count or "new message" indicator on student rows in the tutor's message list is **Claude's discretion** — keep it simple for v1.0.

### Chat Screen Behaviour
- **D-07:** Pull-to-refresh only — no Supabase Realtime subscriptions. Messages are fetched via TanStack Query on screen mount and on pull-to-refresh. No live updates in v1.0.
- **D-08:** Messages are displayed in chronological order (oldest at top, newest at bottom). The list auto-scrolls to the bottom on initial load and after sending a message.
- **D-09:** Text input is a `TextInput` at the bottom of the screen (single-line, expands to ~3 lines max). Send button to the right. Tapping Send posts the message and clears the input.
- **D-10:** "Message tutor" from classroom-detail passes `classroomId`. The `dm-chat` screen derives the `tutorId` from the classroom data. The student does not need to pass `tutorId` explicitly.

### Chat Bubble Visual Style
- **D-11:** iMessage-style bubbles: current user's messages on the right (background: `COLORS.accent`, text: white), other party's messages on the left (background: `COLORS.surface`, text: `COLORS.text`).
- **D-12:** Each bubble shows message text and a small timestamp below it (`COLORS.textMuted`, small font size).
- **D-13:** No avatars per bubble — keep it clean for 1-on-1 context. Sender identity is implied by bubble side.

### Supabase Schema
- **D-14:** New table `messages`: `id UUID PK`, `classroom_id UUID FK → classrooms.id`, `sender_id UUID FK → profiles.id`, `content TEXT NOT NULL`, `created_at TIMESTAMPTZ DEFAULT now()`.
- **D-15:** No `recipient_id` column — the conversation is classroom-scoped (only the tutor and the subscribing student exchange messages within that classroom). All messages in a classroom thread between the same two parties share the same `classroom_id`.
- **D-16:** RLS policies:
  - **Subscriber can read**: `sender_id = auth.uid()` OR (student has active subscription to `classroom_id`)
  - **Subscriber can insert**: student has active subscription to `classroom_id`
  - **Tutor can read/insert**: `classroom_id` belongs to the tutor's classroom (`classrooms.tutor_id = auth.uid()`)
- **D-17:** Migration file: `supabase/migrations/{timestamp}_add_messages_table.sql`

### Data Fetching Pattern
- **D-18:** `useMessages(classroomId, otherUserId)` hook — fetches all messages for the classroom where `sender_id` is either the current user or `otherUserId`. Query key: `['messages', classroomId, otherUserId]`.
- **D-19:** `useSendMessage` mutation — inserts a new message row. On success, invalidates `['messages', classroomId, otherUserId]`.
- **D-20:** `useClassroomSubscribers(classroomId)` hook — fetches all students with an active subscription to a given classroom (used in the tutor's message list). Query key: `['subscribers', classroomId]`.

### Claude's Discretion
- Empty state for the chat screen when no messages exist ("Start the conversation…")
- Loading and error states for message fetch and send
- Keyboard avoidance behaviour (KeyboardAvoidingView or equivalent)
- Exact padding, border-radius on bubbles (use RADII and SPACING tokens)
- Whether to show a "sending…" optimistic state or just wait for confirmation
- Unread indicator style on the tutor's subscriber list

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/REQUIREMENTS.md` §Direct Messaging — MSG-01, MSG-02, MSG-03
- `.planning/ROADMAP.md` §Phase 6 — Phase goal, success criteria, dependency on Phase 5

### Codebase Files to Read Before Implementing
- `src/app/(tabs)/_layout.tsx` — Add `dm-chat` route as `href: null`; do NOT change existing tab order
- `src/app/(tabs)/classroom-detail.tsx` — Add "Message tutor" button for subscribers (D-01, D-03)
- `src/app/(tabs)/manage-classroom.tsx` — Add Messages section for tutor (D-04, D-05)
- `src/app/(tabs)/subscribe-confirm.tsx` — Reference for non-tab screen pattern (params + navigation)
- `src/features/student/useMySubscriptions.ts` — Reference for subscription check pattern (D-03)
- `src/features/student/useClassroomDetail.ts` — Reference for TanStack Query + Supabase pattern
- `src/features/ui/theme.ts` — COLORS.accent, COLORS.surface, COLORS.textMuted, SPACING, RADII — all new components MUST use these
- `src/types/database.ts` — ADD messages type here after migration
- `src/lib/supabase.ts` — Single Supabase client import point

### Prior Phase Context
- `.planning/phases/05-student-discovery-and-subscriptions/05-CONTEXT.md` — D-12 to D-18 (subscriptions schema, RLS patterns, client-side subscription check)
- `.planning/phases/04-classroom-builder/04-CONTEXT.md` — D-15 to D-17 (Supabase mutation patterns, RLS policy conventions)

### Project Stack Reference
- `CLAUDE.md` §Technology Stack — Supabase React Native known issues, RLS patterns, TanStack Query setup

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/features/ui/Button.tsx` — Use for Send button and "Message tutor" CTA
- `src/features/ui/theme.ts` — COLORS, SPACING, RADII tokens for bubble styling
- `src/features/student/useMySubscriptions.ts` — Reuse for isSubscribed check in classroom-detail
- `src/features/student/useClassroomDetail.ts` — Reference for hook pattern; reuse to get tutorId in dm-chat screen
- `src/app/(tabs)/subscribe-confirm.tsx` — Reference for non-tab screen with params pattern

### Established Patterns
- Non-tab screens registered with `href: null` in `src/app/(tabs)/_layout.tsx`
- Navigation with `router.push('/(tabs)/screen-name?param=value')`
- TanStack Query: `useQuery` for reads, `useMutation` + `queryClient.invalidateQueries` for writes
- Supabase RLS: `auth.uid()` subquery, SELECT policy on public table + INSERT policy scoped to owner
- TEXT + CHECK constraint for status columns (not Postgres enums) — see Phase 4 pattern
- All components in `src/features/{feature}/` — no logic in `src/app/` route files

### Integration Points
- `src/app/(tabs)/classroom-detail.tsx` — Add subscriber-only "Message tutor" button
- `src/app/(tabs)/manage-classroom.tsx` — Add "Messages" section listing subscribers
- `src/app/(tabs)/_layout.tsx` — Register `dm-chat` as hidden route
- `src/types/database.ts` — Add `messages` table type after migration
- Supabase: new `messages` table + RLS policies + migration file

</code_context>

<specifics>
## Specific Ideas

- Chat screen should feel like iMessage/WhatsApp — not a forum or ticket system. Bubbles, not rows.
- "Message tutor" button placement on classroom detail: below the subscribe button (or in place of it if already subscribed), so the student's primary CTA always lives in the same spot.
- The tutor's message list on manage-classroom should feel like a contact list, not a settings panel — student names as tappable rows, no heavy visual weight.

</specifics>

<deferred>
## Deferred Ideas

- Supabase Realtime live updates — deferred to v1.1 (too much complexity + New Architecture risk for v1.0)
- Push notifications for new messages — out of scope for v1.0 (confirmed in PROJECT.md)
- Image/file attachments in DMs — out of scope for v1.0 (text only)
- Read receipts / message status (sent, delivered, read) — future phase
- Typing indicators — future phase
- Global DM inbox tab replacing an existing tab — deferred (single tutor + small user base makes per-classroom access sufficient for v1.0)

</deferred>

---

*Phase: 06-direct-messaging*
*Context gathered: 2026-04-06*
