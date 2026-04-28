---
phase: 5
slug: student-discovery-and-subscriptions
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest-expo |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npx jest --testPathPattern="features/student"` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern="features/student"`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-XX-01 | XX | 0 | DISC-01 | — | N/A | unit | `npx jest --testPathPattern="useAllClassrooms"` | Wave 0 | ⬜ pending |
| 05-XX-02 | XX | 0 | DISC-02 | — | N/A | unit | `npx jest --testPathPattern="useClassroomDetail"` | Wave 0 | ⬜ pending |
| 05-XX-03 | XX | 0 | DISC-03 | — | N/A | unit | `npx jest --testPathPattern="useMySubscriptions"` | Wave 0 | ⬜ pending |
| 05-XX-04 | XX | 1 | DISC-04 | — | N/A | unit | `npx jest --testPathPattern="useClassroomDetail"` (price_cents) | Wave 0 | ⬜ pending |
| 05-XX-05 | XX | 1 | SUB-01 | — | N/A | manual-only | Visual inspection — confirmation screen | N/A | ⬜ pending |
| 05-XX-06 | XX | 0 | SUB-02 | — | N/A | unit | `npx jest --testPathPattern="useSubscribe"` | Wave 0 | ⬜ pending |
| 05-XX-07 | XX | 0 | SUB-03 | — | N/A | unit | `npx jest --testPathPattern="useMySubscriptions"` | Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/features/student/__tests__/useAllClassrooms.test.ts` — covers DISC-01
- [ ] `src/features/student/__tests__/useClassroomDetail.test.ts` — covers DISC-02, DISC-04
- [ ] `src/features/student/__tests__/useMySubscriptions.test.ts` — covers DISC-03, SUB-03
- [ ] `src/features/student/__tests__/useSubscribe.test.ts` — covers SUB-02

Use `it.todo()` stubs pattern from Phase 4 (`src/features/tutor/__tests__/useCreateClassroom.test.ts`).
