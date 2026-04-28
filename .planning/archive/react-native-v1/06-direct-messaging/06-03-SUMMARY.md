---
phase: 06-direct-messaging
plan: "03"
subsystem: messaging
tags: [expo-router, react-native, chat-ui, tanstack-query, screens]
dependency_graph:
  requires: [useMessages hook (06-02), useSendMessage hook (06-02), useClassroomSubscribers hook (06-02), useTutorUserId hook (06-02), MessageBubble component (06-02), ChatInput component (06-02), SubscriberRow component (06-02), messages table (06-01)]
  provides: [dm-chat screen, dm-chat route registration, student Message tutor entry point, tutor Messages section entry point]
  affects: [classroom-detail.tsx (student DM access), manage-classroom.tsx (tutor DM access)]
tech_stack:
  added: []
  patterns: [Expo Router href:null hidden route, KeyboardAvoidingView platform-specific behavior, FlatList with RefreshControl + scrollToEnd, role detection via URL param presence]
key_files:
  created:
    - src/app/(tabs)/dm-chat.tsx
  modified:
    - src/app/(tabs)/_layout.tsx
    - src/app/(tabs)/classroom-detail.tsx
    - src/app/(tabs)/manage-classroom.tsx
decisions:
  - isTutor role detected via presence of studentId param (not database lookup) — simpler and avoids extra query
  - useTutorUserId called with undefined when user is tutor so it is disabled via enabled guard in hook
  - hasUnread hardcoded to false for v1.0 — unread dot infrastructure in SubscriberRow exists for future wiring
  - Messages section added inside the sections-present branch of manage-classroom (not in empty state) — tutor sees it once they have content
metrics:
  duration: ~5min
  completed: "2026-04-06"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 3
requirements_completed: [MSG-01, MSG-02, MSG-03]
---

# Phase 06 Plan 03: Screen Wiring Summary

**dm-chat screen wired with useMessages/useSendMessage/MessageBubble/ChatInput, registered as href:null route, with subscriber-only "Message tutor" button on classroom-detail and a Messages section listing subscribers on manage-classroom.**

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create dm-chat screen and register route | c28610c | dm-chat.tsx, _layout.tsx |
| 2 | Add DM entry points to classroom-detail and manage-classroom | 0e88716 | classroom-detail.tsx, manage-classroom.tsx |

## What Was Built

### Task 1: dm-chat Screen + Route Registration

**dm-chat.tsx** — full chat screen for both student and tutor roles:
- Accepts `classroomId` (always) and `studentId` (tutor-only) via `useLocalSearchParams`
- Role detection: `isTutor = !!studentId` — no DB lookup needed
- Student path: resolves tutor's auth user id via `useTutorUserId(classroom.tutor_id)`
- Tutor path: `otherUserId = studentId` directly from params
- FlatList with `keyExtractor={(item) => item.id}`, `onContentSizeChange` auto-scroll, `RefreshControl` with `tintColor={COLORS.accent}`
- `KeyboardAvoidingView` with `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`
- Empty state: "No messages yet" heading + role-appropriate body copy
- Send error inline: "Couldn't send. Try again."
- Back button with `accessibilityLabel="Go back"`, `accessibilityRole="button"`
- All colors from COLORS tokens, all spacing from SPACING tokens — zero hardcoded hex

**_layout.tsx** — added `<Tabs.Screen name="dm-chat" options={{ title: 'Messages', href: null }} />` after subscribe-confirm. All 5 original tabs unchanged.

### Task 2: DM Entry Points

**classroom-detail.tsx** — inside `isSubscribed` branch, wrapped subscribedIndicator in a fragment and added:
```
<Button variant="secondary" title="Message tutor" onPress={() => router.push(`/(tabs)/dm-chat?classroomId=${id}`)} />
```
Non-subscribers see no change — subscribe CTA is untouched.

**manage-classroom.tsx** — imported `useClassroomSubscribers` and `SubscriberRow`, added hook call `const { data: subscribers = [] } = useClassroomSubscribers(classroomId)`, and added a Messages section below the sections/add-section content:
- "Messages" heading (14px semibold COLORS.textMuted — matches sectionsHeading pattern)
- "No subscribers yet." empty state
- `SubscriberRow` per subscriber navigating to `/(tabs)/dm-chat?classroomId=X&studentId=Y`
- All styles use COLORS/SPACING tokens only

## Decisions Made

- `isTutor` determined by `!!studentId` param presence — avoids DB lookup and matches RESEARCH simpler approach
- `useTutorUserId` called with `undefined` when user is tutor — hook's `enabled` guard disables it cleanly
- `hasUnread={false}` for v1.0 — unread dot infrastructure in SubscriberRow is ready, wiring deferred
- Messages section placed inside the sections-present branch (not empty state) so tutor always sees it once classroom has content

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- `hasUnread={false}` hardcoded on all SubscriberRow instances in manage-classroom.tsx. The unread dot UI exists in SubscriberRow but is not wired to message data. This is intentional per D-06 (Claude's discretion for v1.0 simplicity). The unread state computation (last message sender != tutor) can be added in a future plan without changing the component interface.

## Self-Check

- [x] src/app/(tabs)/dm-chat.tsx exists and exports `DmChatScreen`
- [x] src/app/(tabs)/_layout.tsx contains `name="dm-chat"` with `href: null`
- [x] src/app/(tabs)/classroom-detail.tsx contains `title="Message tutor"` inside isSubscribed branch
- [x] src/app/(tabs)/manage-classroom.tsx imports `useClassroomSubscribers` and `SubscriberRow`
- [x] manage-classroom.tsx contains "Messages" heading and "No subscribers yet." empty state
- [x] grep -r "dm-chat" src/app/ returns matches in all 4 expected files
- [x] No hardcoded hex colors in dm-chat.tsx (grep confirmed)
- [x] Full test suite: 27 suites, 25 passed + 92 todo — green
- [x] Commits c28610c and 0e88716 verified

## Self-Check: PASSED
