---
phase: 2
slug: study-flow
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30 + jest-expo 55 |
| **Config file** | `jest.config.js` (root) |
| **Quick run command** | `npx jest --testPathPattern="study" --passWithNoTests` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern="study" --passWithNoTests`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | STUDY-01 | — | N/A | unit | `npx jest --testPathPattern="study-session-store"` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 1 | STUDY-02 | — | N/A | unit | `npx jest --testPathPattern="study-session-store"` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 1 | STUDY-04 | — | N/A | unit | `npx jest --testPathPattern="study-session-store"` | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 2 | STUDY-03 | — | N/A | unit | `npx jest --testPathPattern="question-card"` | ❌ W0 | ⬜ pending |
| 2-02-02 | 02 | 2 | STUDY-05 | — | N/A | unit | `npx jest --testPathPattern="question-card"` | ❌ W0 | ⬜ pending |
| 2-02-03 | 02 | 2 | STUDY-08 | — | N/A | unit | `npx jest --testPathPattern="question-card"` | ❌ W0 | ⬜ pending |
| 2-03-01 | 03 | 2 | STUDY-06 | — | N/A | unit | `npx jest --testPathPattern="feedback-panel"` | ❌ W0 | ⬜ pending |
| 2-03-02 | 03 | 2 | CONT-06 | — | DB CHECK blocks is_published=true without explanation | manual | Supabase SQL test / migration verify | n/a | ⬜ pending |
| 2-04-01 | 04 | 3 | STUDY-07 | — | N/A | smoke | `npx jest --testPathPattern="lesson-complete"` | ❌ W0 | ⬜ pending |
| 2-04-02 | 04 | 3 | STUDY-09 | — | N/A | smoke | `npx jest --testPathPattern="lesson-complete"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/study-session-store.test.ts` — stubs for STUDY-01, STUDY-02, STUDY-04, STUDY-05 (pure Zustand store logic, no rendering required)
- [ ] `__tests__/question-card.test.tsx` — stubs for STUDY-03, STUDY-08 (component render with mocked store)
- [ ] `__tests__/feedback-panel.test.tsx` — stub for STUDY-06 (visibility and Continue interaction)
- [ ] `__tests__/lesson-complete.test.tsx` — stub for STUDY-07 (screen renders with mocked params and profile data)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| DB CHECK constraint blocks `is_published=true` without explanation | CONT-06 | Supabase migration — cannot be automated with jest; requires live DB or SQL test | Apply migration, then run: `INSERT INTO questions (explanation, is_published) VALUES (NULL, true)` — should fail with constraint error |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
