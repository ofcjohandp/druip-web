---
phase: quick
plan: 260514-fop
subsystem: payments, earnings
tags: [paystack, earnings, cleanup, migration]
dependency_graph:
  requires: []
  provides: [paystack-payment-flow, real-earnings-data]
  affects: [note-detail, earnings-page, purchases-table]
tech_stack:
  added: [paystack REST API, HMAC-SHA512 webhook verification]
  patterns: [initializeTransaction/verifyTransaction helper pattern, idempotent purchase recording]
key_files:
  created:
    - druip-web/src/lib/paystack.ts
    - druip-web/src/app/api/paystack/initiate/route.ts
    - druip-web/src/app/api/paystack/callback/route.ts
    - druip-web/src/app/api/paystack/webhook/route.ts
    - .planning/quick/260514-fop-fix-all-open-gaps-delete-dead-payfast-fi/MIGRATION-00021.md
  modified:
    - druip-web/src/app/(app)/notes/[id]/note-detail-client.tsx
    - druip-web/src/app/(app)/earnings/page.tsx
  deleted:
    - druip-web/src/lib/payfast.ts
    - druip-web/src/app/api/payfast/initiate/route.ts
    - druip-web/src/app/api/payfast/notify/route.ts
    - druip-web/src/lib/stitch.ts
    - druip-web/src/app/api/stitch/initiate/route.ts
    - druip-web/src/app/api/stitch/callback/route.ts
    - druip-web/src/app/api/stitch/webhook/route.ts
decisions:
  - Reused payfast_payment_id column as generic external payment reference (no migration needed)
  - 15% platform fee applied consistently in both callback and webhook routes
  - Earnings page kept as client component with useEffect data fetch (no RSC pattern change)
  - Bar chart uses native bucketing logic (no chart library) to preserve design system consistency
metrics:
  completed: "2026-05-14"
  tasks: 4
  files_changed: 12
---

# Quick Plan 260514-fop: Fix All Open Gaps Summary

**One-liner:** Deleted dead PayFast and broken Stitch code, replaced with Paystack ZAR payment flow (initiate/callback/webhook), wired Earnings page to real purchases data, and documented migration 00021 for manual prod application.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Delete dead PayFast code | 54387c1 | Removed payfast.ts, api/payfast/initiate, api/payfast/notify |
| 2 | Build Paystack integration, remove Stitch | ef3cac8 | Created paystack.ts + 3 routes; deleted stitch.ts + 3 routes; updated buy button |
| 3 | Wire Earnings page to real purchases data | 27fe93d | Replaced static BAR_DATA with real Supabase query + dynamic chart |
| 4 | Document migration 00021 | 14c2e63 | MIGRATION-00021.md with copy-paste SQL and dashboard steps |

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all fields wired to real data or show honest empty states (R0 when no purchases exist).

## Manual Steps Required (User Must Do)

**Step 1 - Paystack env vars:**

Add these to `.env.local` (local) and Vercel project environment variables:

```
PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
```

Get keys from: Paystack Dashboard -> Settings -> API Keys and Webhooks

Then in the Paystack Dashboard, add the webhook URL:
- Webhook URL: `https://druip.co.za/api/paystack/webhook`

**Step 2 - Apply migration 00021:**

Run the SQL in `.planning/quick/260514-fop-fix-all-open-gaps-delete-dead-payfast-fi/MIGRATION-00021.md` in the Supabase SQL Editor for project `vpmrgidheamgerimkaox`.

Full instructions are in the migration doc.

## Self-Check: PASSED

All created files confirmed present. All 4 task commits confirmed in git log.
