---
phase: 4
slug: classroom-builder
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest (via Expo/React Native test setup) |
| **Config file** | jest.config.js (or package.json jest field) |
| **Quick run command** | `npx jest --testPathPattern=classroom` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=classroom`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 1 | CLASS-01 | — | N/A | manual | `npx jest --testPathPattern=useClassroomSections` | ❌ W0 | ⬜ pending |
| 4-01-02 | 01 | 1 | CLASS-02 | — | N/A | manual | `npx jest --testPathPattern=useClassroomSections` | ❌ W0 | ⬜ pending |
| 4-01-03 | 01 | 1 | CLASS-03 | — | N/A | manual | `npx jest --testPathPattern=useClassroomSections` | ❌ W0 | ⬜ pending |
| 4-02-01 | 02 | 2 | CARD-01 | — | N/A | manual | `npx jest --testPathPattern=useClassroomCards` | ❌ W0 | ⬜ pending |
| 4-02-02 | 02 | 2 | CARD-02 | — | N/A | manual | `npx jest --testPathPattern=useClassroomCards` | ❌ W0 | ⬜ pending |
| 4-02-03 | 02 | 2 | CARD-03 | — | N/A | manual | `npx jest --testPathPattern=useClassroomCards` | ❌ W0 | ⬜ pending |
| 4-02-04 | 02 | 2 | CARD-04 | — | N/A | manual | `npx jest --testPathPattern=useClassroomCards` | ❌ W0 | ⬜ pending |
| 4-02-05 | 02 | 2 | CARD-05 | — | N/A | manual | `npx jest --testPathPattern=useClassroomCards` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npx expo install expo-document-picker expo-image-picker` — required before any file card code
- [ ] `supabase/migrations/00006_classroom_sections_cards.sql` — sections + cards tables + RLS
- [ ] Supabase Storage bucket `classroom-assets` created (private) — manual dashboard step
- [ ] TypeScript types regenerated: `supabase gen types typescript --project-id <id> > src/types/database.ts`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PDF upload produces signed URL readable on device | CARD-03 | Requires physical device + Supabase Storage | Pick PDF → confirm card appears with title → tap card → confirm PDF opens |
| Image upload stores and displays correctly | CARD-04 | Requires physical device + camera/gallery | Pick image → confirm thumbnail visible in card list |
| Section reorder persists after app restart | CLASS-02 | Requires live Supabase round-trip | Reorder sections → kill app → reopen → confirm order unchanged |
| Optimistic update rolls back on network error | CLASS-02, CARD-05 | Requires simulated network failure | Disable network → attempt delete → confirm UI rolls back |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
