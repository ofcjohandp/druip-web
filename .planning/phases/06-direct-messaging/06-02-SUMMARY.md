---
phase: 06-direct-messaging
plan: "02"
subsystem: messaging
tags: [tanstack-query, hooks, components, chat-ui, react-native]
dependency_graph:
  requires: [messages table (06-01), profiles table, subscriptions table, tutors table, useAuthStore, theme.ts, Button.tsx]
  provides: [useMessages hook, useSendMessage hook, useClassroomSubscribers hook, useTutorUserId hook, MessageBubble component, ChatInput component, SubscriberRow component]
  affects: [06-03-PLAN.md (dm-chat screen and screen wiring)]
tech_stack:
  added: []
  patterns: [TanStack Query useQuery pattern, TanStack Query useMutation + invalidateQueries pattern, iMessage-style bubble alignment, StyleSheet.create with theme tokens only]
key_files:
  created:
    - src/features/messaging/useMessages.ts
    - src/features/messaging/useSendMessage.ts
    - src/features/messaging/useClassroomSubscribers.ts
    - src/features/messaging/useTutorUserId.ts
    - src/features/messaging/MessageBubble.tsx
    - src/features/messaging/ChatInput.tsx
    - src/features/messaging/SubscriberRow.tsx
  modified: []
decisions:
  - useMessages filters by both classroom_id and sender_id IN [currentUser, otherUser] providing double protection alongside RLS
  - useTutorUserId added as standalone hook to resolve tutors.user_id from tutors.id (Pitfall 2 — FK indirection)
  - useClassroomSubscribers joins profiles!student_id(id, email) in single query to avoid N+1 subscriber name lookups
  - MessageBubble uses borderBottomRightRadius:4 / borderBottomLeftRadius:4 per iMessage tail convention
  - ChatInput maxHeight:72 prevents layout shift on Android multiline expansion (Pitfall 4)
  - All components use COLORS/SPACING/RADII tokens exclusively — zero hardcoded hex values
metrics:
  duration: ~8min
  completed: "2026-04-06"
  tasks_completed: 2
  tasks_total: 2
  files_created: 7
  files_modified: 0
requirements_completed: [MSG-01, MSG-02, MSG-03]
---

# Phase 06 Plan 02: Messaging Hooks and Components Summary

**Four TanStack Query hooks (useMessages, useSendMessage, useClassroomSubscribers, useTutorUserId) and three React Native components (MessageBubble, ChatInput, SubscriberRow) — complete data and presentation layer for the DM feature, ready for Plan 03 screen wiring.**

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create TanStack Query hooks | 9c6136c | useMessages.ts, useSendMessage.ts, useClassroomSubscribers.ts, useTutorUserId.ts |
| 2 | Create UI components | c8fdffc | MessageBubble.tsx, ChatInput.tsx, SubscriberRow.tsx |

## What Was Built

### Task 1: TanStack Query Hooks

**useMessages(classroomId, otherUserId)**
- Fetches messages filtered by `classroom_id` AND `sender_id IN [currentUserId, otherUserId]`
- Orders by `created_at` ascending (oldest at top, newest at bottom per D-08)
- Query key: `['messages', classroomId, otherUserId]`
- Enabled guard: `!!classroomId && !!otherUserId && !!currentUserId`

**useSendMessage(classroomId, otherUserId)**
- Mutation that inserts `{ classroom_id, sender_id: session.user.id, content }` — sender_id always from auth store, never from params (T-01 mitigation)
- On success, invalidates `['messages', classroomId, otherUserId]` to refresh the chat

**useClassroomSubscribers(classroomId)**
- Fetches active subscriptions with `profiles!student_id(id, email)` join in one query (Pitfall 5 fix)
- Filters `status = 'active'` only
- Query key: `['subscribers', classroomId]`

**useTutorUserId(tutorId)**
- Resolves `tutors.user_id` from `tutors.id` — the critical FK indirection fix from RESEARCH.md Pitfall 2
- Returns the auth user id (`profiles.id`) needed as `otherUserId` on the student side of `useMessages`
- Query key: `['tutor-user-id', tutorId]`

### Task 2: UI Components

**MessageBubble**
- iMessage-style: `alignSelf: 'flex-end'` + `COLORS.accent` for outgoing, `alignSelf: 'flex-start'` + `COLORS.surface` for incoming
- `maxWidth: '75%'` prevents full-width bubbles
- `borderBottomRightRadius: 4` (outgoing), `borderBottomLeftRadius: 4` (incoming) — bubble tail effect
- Timestamp in 12px `COLORS.textMuted` below bubble text
- `accessibilityLabel` on bubble View per UI-SPEC

**ChatInput**
- `TextInput` with `maxHeight: 72` (3 lines per Pitfall 4 fix), `multiline`, `maxLength: 2000`
- `Button` with `title="Send"` and `variant="primary"` — disabled when `!text.trim() || isSending`
- Clears input (`setText('')`) immediately on send
- `accessibilityLabel="Message input"` on TextInput

**SubscriberRow**
- `TouchableOpacity` with `minHeight: 52` (44pt+ touch target)
- Student name in 14px `COLORS.text`, right-aligned 8px `COLORS.accent` unread dot when `hasUnread`
- `accessibilityRole="button"` and descriptive `accessibilityLabel`

## Decisions Made

- useTutorUserId is a standalone hook rather than extending useClassroomDetail — keeps classroom detail shape stable and follows single-responsibility principle (resolves RESEARCH.md open question 1)
- ChatInput clears input text optimistically on send (before mutation confirms) — simpler UX than waiting for confirmation, error recovery handled by Plan 03 screen
- SubscriberRow accepts `hasUnread: boolean` as prop — computation of unread state is delegated to the screen/consumer, not baked into the row component

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All hooks and components are fully implemented. Data connections will be wired in Plan 03 (dm-chat screen).

## Self-Check

- [x] src/features/messaging/useMessages.ts exists and exports `useMessages`
- [x] src/features/messaging/useSendMessage.ts exists and exports `useSendMessage`
- [x] src/features/messaging/useClassroomSubscribers.ts exists and exports `useClassroomSubscribers`
- [x] src/features/messaging/useTutorUserId.ts exists and exports `useTutorUserId`
- [x] src/features/messaging/MessageBubble.tsx exists and exports `MessageBubble`
- [x] src/features/messaging/ChatInput.tsx exists and exports `ChatInput`
- [x] src/features/messaging/SubscriberRow.tsx exists and exports `SubscriberRow`
- [x] No hardcoded hex colors in any messaging file (grep confirmed)
- [x] Commits 9c6136c and c8fdffc verified

## Self-Check: PASSED
