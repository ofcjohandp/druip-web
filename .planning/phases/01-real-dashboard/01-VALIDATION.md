---
phase: 1
slug: real-dashboard
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-09
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — next build used as integration check |
| **Config file** | none |
| **Quick run command** | `cd druip-web && npx tsc --noEmit 2>&1 | tail -20 && npx next build 2>&1 | tail -20` |
| **Full suite command** | `cd druip-web && npx tsc --noEmit 2>&1 | tail -20 && npx next build 2>&1 | tail -20` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd druip-web && npx tsc --noEmit 2>&1 | tail -20 && npx next build 2>&1 | tail -20`
- **After every plan wave:** Run `cd druip-web && npx tsc --noEmit 2>&1 | tail -20 && npx next build 2>&1 | tail -20`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | DASH-01, DASH-02, DASH-03, DASH-04 | T-1-01 / T-1-02 | RLS enforces student_id = auth.uid(); auth guard redirects unauthenticated users | build | `cd druip-web && npx tsc --noEmit 2>&1 \| tail -20 && npx next build 2>&1 \| tail -20` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework install needed — `next build` and `tsc --noEmit` serve as the integration check for this phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Empty states render correctly for new user | DASH-01, DASH-03 | Visual correctness cannot be verified by build check | Sign in as user with no subscriptions; verify empty state headings and CTAs match UI-SPEC |
| Streak shows 0 for new user | DASH-02 | Visual correctness | Sign in as new user; verify streak card shows "0" not "12" |
| Real tutor names appear in grid | DASH-03 | Requires seeded data | Seed tutors table; verify grid shows real names |
| Greeting uses real name | DASH-04 | Visual correctness | Sign in; verify first name appears in greeting |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [ ] Feedback latency < 1s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

