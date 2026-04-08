---
phase: 9
slug: ui-overhaul
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-08
---

# Phase 9 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

## Nyquist Compliance Note

Phase 9 is a **visual token-migration refactor** -- no new behavioral logic, no new API endpoints, no new data transformations. The work consists of:
1. Changing color/typography token values in theme.ts
2. Creating presentational components (Input, Tag, Avatar) with no business logic
3. Migrating inline styles to use shared tokens and components

**Rationale for manual-only validation:** There are no testable input/output behaviors to assert. `npx tsc --noEmit` catches type errors from token migrations. Visual review on simulator catches rendering regressions. Writing behavioral tests for "button renders with correct background color" would test React Native's style system, not application logic. This phase is nyquist-compliant via type checking + visual checkpoint (Plan 06, Task 2).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest (via Expo / React Native) |
| **Config file** | `jest.config.js` or `package.json#jest` |
| **Quick run command** | `npx expo run:ios --no-build` (visual) or `npx tsc --noEmit` (type check) |
| **Full suite command** | `npx jest --passWithNoTests` |
| **Estimated runtime** | ~30 seconds (type check) |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit` to catch type errors from new TYPOGRAPHY/COLORS tokens
- **After each wave:** Visual review on simulator -- check theme tokens applied, no white screens, navigation intact

---

## Validation Architecture (from RESEARCH.md)

Phase 9 is a visual-only refactor -- no new DB tables, no new API calls. Validation focuses on:

1. **Type safety** -- New `TYPOGRAPHY` export and new `COLORS` tokens are typed; no `any` types
2. **No regressions** -- All existing screens still render (no import breakage)
3. **Font load gate** -- `useFonts` result merged with existing `isLoading` gate in `_layout.tsx`
4. **Token completeness** -- No hardcoded hex values remain in migrated screens
5. **Component API compatibility** -- `Button` and `Card` extensions are non-breaking (optional props only)

---

## Wave Checkpoints

| Wave | Checkpoint | Command |
|------|-----------|---------|
| 1 | Font package installed, theme tokens updated | `npx tsc --noEmit` |
| 2 | Shared components extended | `npx tsc --noEmit` + visual check |
| 3 | Auth + onboarding + tab screens migrated | Visual review on simulator |
| 4 | Final audit: all screens pass, no hardcoded colors | `grep -r "#[0-9A-Fa-f]\{6\}" src/app src/features` returns only theme.ts |
