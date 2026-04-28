---
phase: 3
slug: tutor-onboarding
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest-expo (detected in package.json devDependencies) |
| **Config file** | jest-expo preset (package.json `jest` key) |
| **Quick run command** | `npx jest --testPathPattern "(sign-up|create-classroom|useCreateClassroom|useUpdateClassroom)"` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~15 seconds (quick) / ~60 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run quick run command
- **After every plan wave:** Run full suite
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | TUTR-01 | — | Toggle sets isTutor state; routes to create-classroom when true | Unit (component) | `npx jest --testPathPattern sign-up` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 1 | TUTR-02 | — | Classroom creation writes to Supabase; navigates to tabs | Integration | `npx jest --testPathPattern useCreateClassroom` | ❌ W0 | ⬜ pending |
| 3-03-01 | 03 | 1 | TUTR-03 | — | Price defaults to "180"; price field accepts numeric input | Unit (component) | `npx jest --testPathPattern create-classroom` | ❌ W0 | ⬜ pending |
| 3-04-01 | 04 | 2 | TUTR-04 | — | Classroom settings pre-fills from fetched data; save calls update | Integration | `npx jest --testPathPattern useUpdateClassroom` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/features/tutor/__tests__/useCreateClassroom.test.ts` — stubs for TUTR-02
- [ ] `src/features/tutor/__tests__/useUpdateClassroom.test.ts` — stubs for TUTR-04
- [ ] `src/app/(auth)/__tests__/sign-up.test.tsx` — stubs for TUTR-01 toggle path
- [ ] `src/app/(auth)/__tests__/create-classroom.test.tsx` — stubs for TUTR-03 price default

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Toggle routes to correct screen on physical device | TUTR-01 | Navigation guard race condition cannot be tested in jest | Sign up with toggle ON, confirm `/(auth)/create-classroom` loads without redirect to tabs |
| Supabase RLS blocks unauthenticated classroom insert | TUTR-02 | RLS is enforced server-side | Use Supabase Studio to attempt unauthenticated insert — expect 401 |
| Classroom settings changes reflected immediately in Profile tab | TUTR-04 | Requires live UI + TanStack Query invalidation | Edit classroom name, navigate to Profile tab, confirm updated name shows |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
