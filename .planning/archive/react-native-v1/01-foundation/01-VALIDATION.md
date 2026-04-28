---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + `jest-expo` preset + `@testing-library/react-native` |
| **Config file** | `jest.config.js` (none — Wave 0 creates it) |
| **Quick run command** | `npx jest --testPathPattern="__tests__" --passWithNoTests` |
| **Full suite command** | `npx jest --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern="__tests__" --passWithNoTests`
- **After every plan wave:** Run `npx jest --coverage`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | SEED-05 | — | N/A | unit | `npx jest __tests__/app-config.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | AUTH-03 AUTH-04 | — | persistSession: true; import order enforced | unit | `npx jest __tests__/supabase-client.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | CONT-01..05 SEED-02 | — | RLS enabled; tables exist with correct columns | db-smoke | `supabase db push --dry-run` (manual) | Manual | ⬜ pending |
| 01-03-01 | 03 | 2 | AUTH-01 | — | Public access to landing/sample without session | unit | `npx jest __tests__/landing.test.tsx -x` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 2 | AUTH-02 | — | signUp called with email+password only | unit | `npx jest __tests__/auth.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 2 | AUTH-05 | — | SIGNED_OUT sets session null; no crash | unit | `npx jest __tests__/auth-store.test.ts -x` | ❌ W0 | ⬜ pending |
| 01-03-04 | 03 | 2 | AUTH-06 | — | Authenticated → tabs; unauthenticated → onboarding | unit | `npx jest __tests__/routing.test.tsx -x` | ❌ W0 | ⬜ pending |
| 01-03-05 | 03 | 2 | AUTH-07 | — | Goal screen renders 3 cards; tap updates profile | unit | `npx jest __tests__/goal-selection.test.tsx -x` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 3 | DASH-04 | — | Tab navigator renders exactly 5 tabs | unit | `npx jest __tests__/tabs-layout.test.tsx -x` | ❌ W0 | ⬜ pending |
| 01-04-02 | 04 | 3 | SEED-06 | — | FlatList windowing props present | unit | `npx jest __tests__/flatlist-config.test.tsx -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `jest.config.js` — configure `jest-expo` preset
- [ ] `__tests__/supabase-client.test.ts` — covers AUTH-03, AUTH-04 (import order + persistSession)
- [ ] `__tests__/auth-store.test.ts` — covers AUTH-05 (SIGNED_OUT defensive handling)
- [ ] `__tests__/routing.test.tsx` — covers AUTH-06 (Stack.Protected guard behavior)
- [ ] `__tests__/landing.test.tsx` — covers AUTH-01 (public landing screen access)
- [ ] `__tests__/auth.test.ts` — covers AUTH-02 (sign-up call signature)
- [ ] `__tests__/goal-selection.test.tsx` — covers AUTH-07 (3 goal cards)
- [ ] `__tests__/tabs-layout.test.tsx` — covers DASH-04 (exactly 5 tabs)
- [ ] `__tests__/app-config.test.ts` — covers SEED-05 (runtimeVersion in config)
- [ ] `__tests__/flatlist-config.test.tsx` — covers SEED-06 (FlatList windowing)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All public tables have RLS enabled | SEED-02 | Database introspection; not testable in Jest | Run: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';` — all rows must show `rowsecurity = true` |
| Module → Topic → Lesson → Section → Question hierarchy exists with correct columns | CONT-01..05 | Schema structure; not testable in Jest | Run `supabase db push --dry-run` and inspect migration output; verify `is_published`, `xp_reward`, `lesson_type`, `order` columns present |
| Session persists after app restart on device | AUTH-03 | Requires physical device or simulator restart | Install dev build; sign in; force-close app; reopen — user should land on home tab, not login |
| Offline launch shows login screen, not crash | AUTH-05 | Requires network simulation | Enable airplane mode; force-close app; reopen — should show login screen with offline notice |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
