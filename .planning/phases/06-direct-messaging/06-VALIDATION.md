---
phase: 6
slug: direct-messaging
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (jest-expo) |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npx jest --testPathPattern="06\|messages\|dm-chat" --passWithNoTests` |
| **Full suite command** | `npx jest --passWithNoTests` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern="06\|messages\|dm-chat" --passWithNoTests`
- **After every plan wave:** Run `npx jest --passWithNoTests`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-00-01 | 00 | 0 | MSG-01 | — | N/A | stub | `npx jest --testPathPattern="useMessages" --passWithNoTests` | ❌ W0 | ⬜ pending |
| 06-00-02 | 00 | 0 | MSG-02 | — | N/A | stub | `npx jest --testPathPattern="useSendMessage" --passWithNoTests` | ❌ W0 | ⬜ pending |
| 06-00-03 | 00 | 0 | MSG-03 | — | N/A | stub | `npx jest --testPathPattern="useClassroomSubscribers" --passWithNoTests` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/features/messaging/__tests__/useMessages.test.ts` — stubs for MSG-01, MSG-03
- [ ] `src/features/messaging/__tests__/useSendMessage.test.ts` — stubs for MSG-01, MSG-02
- [ ] `src/features/messaging/__tests__/useClassroomSubscribers.test.ts` — stubs for MSG-02, MSG-03

*Existing jest-expo infrastructure covers all phase requirements — no new installs needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Chat bubble renders iMessage style on physical device | MSG-03 | React Native styling cannot be fully unit-tested | Run on Expo Go, verify bubble tail and color per UI-SPEC |
| Pull-to-refresh triggers message reload | MSG-01 | Gesture interaction requires manual test | Pull down in dm-chat, verify FlatList re-renders with latest messages |
| Unread dot appears on SubscriberRow when student sends last message | MSG-02 | Heuristic computed from message data, manual verification on device | Subscribe as student, send message, switch to tutor view, verify dot appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
