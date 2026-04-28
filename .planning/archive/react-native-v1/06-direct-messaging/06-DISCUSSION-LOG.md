> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the discussion.

**Date:** 2026-04-06
**Phase:** 06-direct-messaging
**Mode:** discuss
**Areas analyzed:** DM entry point, Realtime vs refresh, Tutor DM inbox, Chat bubble style

## Assumptions Presented

### DM Entry Point
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| "Message tutor" button on classroom-detail for subscribers | Confident | classroom-detail.tsx already has isSubscribed check; subscribe button lives there |
| Non-tab route pattern (`href: null`) | Confident | classroom-detail and subscribe-confirm both use this pattern in _layout.tsx |

### Realtime vs Refresh
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| Pull-to-refresh for v1.0 | Likely | STATE.md flags Realtime + New Architecture risk; low message volume for v1.0 |

### Tutor DM Inbox
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| Per-classroom subscriber list in manage-classroom.tsx | Likely | manage-classroom.tsx is tutor's primary workspace; single tutor/classroom for v1.0 |

### Chat Bubble Style
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| iMessage-style bubbles | Likely | PROJECT.md "soft, modern brand"; no existing chat pattern to conflict with |

## Corrections Made

No corrections — all assumptions confirmed by user selection of recommended options.

## Gray Areas Selected

User selected all 4 areas for discussion:
- DM entry point ✓
- Realtime vs refresh ✓
- Tutor DM inbox ✓
- Chat bubble style ✓
