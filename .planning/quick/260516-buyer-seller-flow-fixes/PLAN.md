---
slug: buyer-seller-flow-fixes
date: 2026-05-16
status: in-progress
goal: Close 5 critical security gaps in the buyer-seller flow found in Opus 4.7 audit
---

# Quick Task: Buyer-Seller Flow Security Fixes

## Tasks

- [ ] Fix sell/page.tsx — filter listings count to published only (personal notes bypass)
- [ ] Create /api/listings/route.ts — server-side listing creation with seller verification
- [ ] Update sell-client.tsx — call /api/listings instead of direct Supabase insert
- [ ] Fix notes/[id]/page.tsx — strip file_urls from listing prop sent to client
- [ ] Write migration 00023 — seller_applications RLS WITH CHECK to block self-approval
- [ ] Delete admin seed endpoints (seed-demo, seed-real-listing)
- [ ] Commit and update STATE.md
