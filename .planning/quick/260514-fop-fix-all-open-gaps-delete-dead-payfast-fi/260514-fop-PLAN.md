---
type: quick
slug: 260514-fop
title: Fix all open gaps — delete dead PayFast, replace Stitch with Paystack, wire Earnings
status: ready
autonomous: true
files_modified:
  - druip-web/src/lib/payfast.ts
  - druip-web/src/lib/config.ts
  - druip-web/src/lib/constants.ts
  - druip-web/src/app/api/payfast/initiate/route.ts
  - druip-web/src/app/api/payfast/notify/route.ts
  - druip-web/src/lib/stitch.ts
  - druip-web/src/app/api/stitch/initiate/route.ts
  - druip-web/src/app/api/stitch/callback/route.ts
  - druip-web/src/app/api/stitch/webhook/route.ts
  - druip-web/src/lib/paystack.ts
  - druip-web/src/app/api/paystack/initiate/route.ts
  - druip-web/src/app/api/paystack/callback/route.ts
  - druip-web/src/app/api/paystack/webhook/route.ts
  - druip-web/src/app/(app)/notes/[id]/note-detail-client.tsx
  - druip-web/src/app/(app)/earnings/page.tsx
user_setup:
  - service: paystack
    why: "Payment processing for note purchases (replaces Stitch)"
    env_vars:
      - name: PAYSTACK_SECRET_KEY
        source: "Paystack Dashboard -> Settings -> API Keys & Webhooks -> Secret Key (use TEST key for now, sk_test_...)"
      - name: PAYSTACK_PUBLIC_KEY
        source: "Paystack Dashboard -> Settings -> API Keys & Webhooks -> Public Key (pk_test_...)"
    dashboard_config:
      - task: "Add webhook endpoint pointing to /api/paystack/webhook"
        location: "Paystack Dashboard -> Settings -> API Keys & Webhooks -> Webhook URL"
  - service: supabase
    why: "Apply migration 00021 (seller_applications table) to production"
    dashboard_config:
      - task: "Run migration SQL (provided in Task 4 below) in SQL Editor"
        location: "Supabase Dashboard -> project vpmrgidheamgerimkaox -> SQL Editor -> New query"
---

<objective>
Close all four open gaps from the 2026-05-07 audit:
1. Delete dead PayFast code (denied provider, never wired).
2. Replace the failing Stitch integration entirely with Paystack.
3. Wire the Earnings page to real Supabase `purchases` data (currently 100% hardcoded R0).
4. Provide the migration 00021 SQL for the user to run manually in Supabase prod.

Purpose: The buy flow currently points at a broken Stitch integration, the Earnings page lies to sellers with placeholder data, and dead PayFast files clutter the codebase. After this plan the purchase flow works end to end on Paystack test keys and sellers see their real earnings.
Output: Paystack payment routes + lib, dead files removed, real Earnings page, migration instructions.
</objective>

<context>
@.planning/STATE.md
@CLAUDE.md
@druip-web/src/lib/stitch.ts
@druip-web/src/app/api/stitch/initiate/route.ts
@druip-web/src/app/api/stitch/callback/route.ts
@druip-web/src/app/api/stitch/webhook/route.ts
@druip-web/src/app/(app)/earnings/page.tsx
@druip-web/src/app/(app)/notes/[id]/note-detail-client.tsx
@druip-web/src/components/druip/ui.tsx

<interfaces>
<!-- Extracted from codebase — executor should use these directly, no exploration needed. -->

`purchases` table columns (confirmed from stitch callback/webhook inserts):
  - id
  - listing_id (uuid)
  - buyer_id (uuid)
  - seller_id (uuid)
  - amount_paid (numeric, rands)
  - platform_fee (numeric, rands)
  - seller_amount (numeric, rands)
  - payfast_payment_id (text — reused as the generic external payment reference column; do NOT rename)
  - payment_status (text — 'paid' on success)
  - created_at (timestamptz, default now())

NOTE: the constraints doc mentioned `amount`/`status` but the live schema uses
`amount_paid`/`payment_status`. Use the LIVE column names above.

`listings` table (relevant cols): id, title, price (numeric, rands), seller_id, status ('published')

Stitch lib signature being replaced (src/lib/stitch.ts):
  createPaymentRequest({ amountRands, externalReference, redirectUri }) -> { id, url }
  getPaymentStatus(paymentRequestId) -> status string

Buy button current call (note-detail-client.tsx ~line 257):
  router.push(`/api/stitch/initiate?listing_id=${listing.id}`)

Supabase service client pattern (used in stitch callback/webhook):
  import { createClient as createServiceClient } from '@supabase/supabase-js'
  createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

Supabase server client pattern (used in stitch initiate):
  import { createClient } from '@/lib/supabase/server'  // await createClient()

ui.tsx exports available for Earnings page: Button, Chip, Avatar, NoteCard, IconButton, ListRow, Input, Skeleton, Toast, BlobBg
Earnings page also imports: Shell from '@/components/druip/shell', Icon from '@/components/druip/icons'

Design system: custom cream/sage/gold inline CSS vars only (var(--sage), var(--gold), var(--charcoal), etc). NO Tailwind. NO blue. Next.js 14 params syntax only (no async params).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Delete all dead PayFast code</name>
  <files>
    druip-web/src/lib/payfast.ts (delete),
    druip-web/src/lib/config.ts (delete),
    druip-web/src/lib/constants.ts (delete),
    druip-web/src/app/api/payfast/initiate/route.ts (delete),
    druip-web/src/app/api/payfast/notify/route.ts (delete)
  </files>
  <action>
    PayFast was denied as a payment provider and none of this code is wired into any live flow.
    Delete these five files and the now-empty `druip-web/src/app/api/payfast/` directory (including its `initiate/` and `notify/` subdirectories).

    Verified before planning: `grep -rn "lib/payfast|lib/config|lib/constants|api/payfast" src/` returns ONLY references from within the payfast routes themselves — no live code imports `PLATFORM_FEE` (config.ts), `SA_UNIVERSITIES`/`SA_DEGREES` (constants.ts), or anything from payfast.ts. They are safe to delete.

    After deleting, re-run the grep to confirm zero remaining references. If the grep surfaces any reference outside the deleted files, STOP and report it — do not delete a file that something live depends on.
  </action>
  <verify>
    <automated>cd druip-web && ! test -d src/app/api/payfast && ! test -f src/lib/payfast.ts && ! test -f src/lib/config.ts && ! test -f src/lib/constants.ts && grep -rn "lib/payfast\|lib/config\|lib/constants\|api/payfast" src/ ; test $? -eq 1</automated>
  </verify>
  <done>All five PayFast files and the api/payfast directory are deleted; grep for their import paths across src/ returns nothing.</done>
</task>

<task type="auto">
  <name>Task 2: Build Paystack payment integration (lib + 3 routes), remove Stitch</name>
  <files>
    druip-web/src/lib/paystack.ts (create),
    druip-web/src/app/api/paystack/initiate/route.ts (create),
    druip-web/src/app/api/paystack/callback/route.ts (create),
    druip-web/src/app/api/paystack/webhook/route.ts (create),
    druip-web/src/lib/stitch.ts (delete),
    druip-web/src/app/api/stitch/initiate/route.ts (delete),
    druip-web/src/app/api/stitch/callback/route.ts (delete),
    druip-web/src/app/api/stitch/webhook/route.ts (delete),
    druip-web/src/app/(app)/notes/[id]/note-detail-client.tsx (modify)
  </files>
  <action>
    Replace the broken Stitch integration with Paystack. Mirror the existing Stitch route structure so the buy flow behaves identically — only the provider changes. Use `process.env.PAYSTACK_SECRET_KEY` (test key for now). Paystack supports ZAR natively; amounts are sent in the smallest unit (rands * 100).

    Reuse the existing `purchases` table columns exactly as the Stitch routes did — in particular keep writing the external payment reference into the `payfast_payment_id` column (do NOT rename the column or add migrations; it is the generic reference column).

    1. `src/lib/paystack.ts` — export two helpers:
       - `initializeTransaction({ amountRands, email, reference, metadata, callbackUrl })`: POST to `https://api.paystack.co/transaction/initialize` with header `Authorization: Bearer ${PAYSTACK_SECRET_KEY}`, JSON body `{ amount: Math.round(amountRands * 100), email, currency: 'ZAR', reference, metadata, callback_url: callbackUrl }`. Return `{ authorization_url, reference }` from `data.data`. Throw with the JSON payload on failure (mirror stitch.ts error style).
       - `verifyTransaction(reference)`: GET `https://api.paystack.co/transaction/verify/${reference}` with the same auth header. Return `data.data` (includes `status`, `amount`, `metadata`). `status === 'success'` means paid.

    2. `src/app/api/paystack/initiate/route.ts` — GET handler, mirror the Stitch initiate route:
       - Read `listing_id` from query params; 400 if missing.
       - `createClient()` from `@/lib/supabase/server`; `getUser()`; redirect to `/sign-in` if not authed.
       - Fetch the listing (id, title, price, seller_id) where `status = 'published'`; 404 if not found; 400 if `listing.seller_id === user.id` ("Cannot buy your own listing").
       - Generate a unique `reference` e.g. `druip_${listingId}_${user.id}_${Date.now()}`.
       - Call `initializeTransaction` with `amountRands: Number(listing.price)`, `email: user.email`, `reference`, `metadata: { listing_id: listingId, buyer_id: user.id }`, `callbackUrl: ${baseUrl}/api/paystack/callback`. `baseUrl` = `process.env.NEXT_PUBLIC_APP_URL || \`https://${request.headers.get('host')}\``.
       - On success `NextResponse.redirect(authorization_url)`. On error, log and redirect to `${baseUrl}/notes/${listingId}?payment=error`.

    3. `src/app/api/paystack/callback/route.ts` — GET handler, mirror the Stitch callback route:
       - Paystack appends `?reference=...` (and `trxref`) to the callback URL. Read `reference`; redirect to `/home?payment=error` if missing.
       - Call `verifyTransaction(reference)`. If `status !== 'success'`, redirect to `/home?payment=cancelled`.
       - Create the Supabase service client (`createServiceClient` with `SUPABASE_SERVICE_ROLE_KEY`).
       - Idempotency: check `purchases` for an existing row with `payfast_payment_id = reference`; if found, redirect to `/notes/{that row's listing_id}?payment=success`.
       - Pull `listing_id` and `buyer_id` from the verified transaction's `metadata`.
       - Fetch the listing (seller_id, price). Compute `amountPaid = Number(listing.price)`, `platformFee = amountPaid * 0.15`, `sellerAmount = amountPaid - platformFee` (matches the 15% fee the Stitch routes used).
       - Insert into `purchases`: `{ listing_id, buyer_id, seller_id: listing.seller_id, amount_paid: amountPaid, platform_fee: platformFee, seller_amount: sellerAmount, payfast_payment_id: reference, payment_status: 'paid' }`.
       - Redirect to `${origin}/notes/${listingId}?payment=success`. On any throw, redirect to `/home?payment=error`.

    4. `src/app/api/paystack/webhook/route.ts` — POST handler, mirror the Stitch webhook route:
       - Read the raw request body. Verify the `x-paystack-signature` header: it is an HMAC-SHA512 of the raw body keyed with `PAYSTACK_SECRET_KEY` (`crypto.createHmac('sha512', secret).update(rawBody).digest('hex')`). If it does not match, return 401.
       - Parse the JSON. Only act when `event === 'charge.success'`; otherwise return `{ ok: true }`.
       - Use `data.reference` and `data.metadata` (`listing_id`, `buyer_id`). Same idempotency check on `payfast_payment_id`, same listing lookup, same fee math, same `purchases` insert as the callback. Return `{ ok: true }` in all non-error branches.

    5. `note-detail-client.tsx` — change the buy button handler (~line 257) from
       `router.push(\`/api/stitch/initiate?listing_id=${listing.id}\`)` to
       `router.push(\`/api/paystack/initiate?listing_id=${listing.id}\`)`. No other UI change. Confirm via grep there are no other `stitch` references in this file.

    6. Delete `src/lib/stitch.ts` and the entire `src/app/api/stitch/` directory (initiate, callback, webhook).

    All routes: Next.js 14 syntax — no async `params`, standard `NextRequest`/`NextResponse`.
  </action>
  <verify>
    <automated>cd druip-web && test -f src/lib/paystack.ts && test -f src/app/api/paystack/initiate/route.ts && test -f src/app/api/paystack/callback/route.ts && test -f src/app/api/paystack/webhook/route.ts && ! test -d src/app/api/stitch && ! test -f src/lib/stitch.ts && ! grep -rn "stitch" src/ && npx tsc --noEmit</automated>
  </verify>
  <done>Paystack lib + 3 routes exist and typecheck; all Stitch files deleted; grep for "stitch" across src/ returns nothing; buy button points at /api/paystack/initiate; `npx tsc --noEmit` passes.</done>
</task>

<task type="auto">
  <name>Task 3: Wire Earnings page to real purchases data</name>
  <files>druip-web/src/app/(app)/earnings/page.tsx (modify)</files>
  <action>
    The Earnings page is currently 100% hardcoded (R0 everywhere, static BAR_DATA). Wire it to the real `purchases` table for the signed-in seller. Keep the existing layout, components, and cream/sage/gold styling — only replace the data.

    Keep it a client component. On mount, query Supabase from the browser client (`createClient` from `@/lib/supabase/client` — match whatever the rest of the app's client components use; grep a sibling client page if unsure):
      - Get the current user via `supabase.auth.getUser()`.
      - Query `purchases` where `seller_id = user.id`, selecting `seller_amount, payment_status, created_at, listing_id` plus a join to `listings(title)` for the activity feed. Order by `created_at` desc.

    Derive and render real values (no placeholder fallbacks — show R0 / empty states only when there genuinely is no data):
      - **Available balance**: sum of `seller_amount` where `payment_status = 'paid'`. (Cash-out is Phase 9, so for now available == lifetime paid; that is fine.)
      - **Pending**: sum of `seller_amount` where `payment_status` is not `'paid'` (e.g. pending/processing). If the schema only ever has 'paid', this is R0 — that is correct, not a placeholder.
      - **Lifetime**: sum of all `seller_amount` regardless of status.
      - **Chart**: replace static `BAR_DATA`. For the selected range, bucket paid purchases by day (Week = last 7 days Mon–Sun) and sum `seller_amount` per bucket. Compute each bar's `h` as a percentage of the max bucket value (so the tallest bar is 100%, min 4% like the current code's `Math.max(d.h, 4)`). Mark the current day's bar `active`. Month/Year ranges: bucket appropriately (Month = weeks, Year = months) — keep it simple, reuse the same bar component.
      - **"This {range}" total**: sum of `seller_amount` for paid purchases inside the selected range.
      - **Recent activity**: replace the hardcoded empty block. If there are purchases, render a list (use `ListRow` from ui.tsx) — one row per purchase showing the listing title, the date, and `+R {seller_amount}`. If there are zero purchases, keep the existing "No transactions yet." empty state exactly as is.
      - **Sales chip**: "No sales yet" when zero paid purchases; otherwise show e.g. "{n} sales".

    Use a `Skeleton` (from ui.tsx) loading state while the query is in flight. Format all money as `R {value.toFixed(2)}` (or `.toFixed(0)` where the current design uses whole rands — match the existing markup per field).

    Leave the **Cash out** and **Top up** buttons as-is — they stay toasts (payment-out is Phase 9). Do not remove them.

    Next.js 14 syntax. No Tailwind. Inline CSS vars only, matching the existing file.
  </action>
  <verify>
    <automated>cd druip-web && ! grep -n "const BAR_DATA = \[" src/app/\(app\)/earnings/page.tsx && grep -qn "from('purchases')" src/app/\(app\)/earnings/page.tsx && grep -qn "seller_id" src/app/\(app\)/earnings/page.tsx && npx tsc --noEmit</automated>
  </verify>
  <done>Earnings page queries `purchases` filtered by `seller_id`, derives balance/pending/lifetime/chart/activity from real rows, shows a loading skeleton and genuine empty states; static BAR_DATA constant removed; `npx tsc --noEmit` passes.</done>
</task>

<task type="auto">
  <name>Task 4: Document migration 00021 for manual prod application</name>
  <files>.planning/quick/260514-fop-fix-all-open-gaps-delete-dead-payfast-fi/MIGRATION-00021.md (create)</files>
  <action>
    The `seller_applications` table (migration 00021) needs to exist in Supabase production. The user runs this manually — produce a clear, copy-paste-ready instruction file.

    Create `MIGRATION-00021.md` in this plan's directory containing:
      - A short header explaining what the table is for (stores seller applications: report_url, status pending/approved/denied, reviewer notes) and why it is needed (the seller-approval gate added in Phase 7c reads/writes this table; without it the apply-to-sell flow errors in prod).
      - Exact step-by-step: Supabase Dashboard -> project `vpmrgidheamgerimkaox` -> SQL Editor -> New query -> paste -> Run.
      - The full SQL block, copied verbatim from `supabase/migrations/00021_seller_applications.sql` (the CREATE TABLE, ENABLE ROW LEVEL SECURITY, and the three RLS policies for select/insert/update).
      - A verification step: after running, in SQL Editor run `select * from seller_applications limit 1;` — it should return an empty result with the column headers visible (not a "relation does not exist" error).
      - A note that this is idempotent-unsafe (plain `CREATE TABLE`), so if it errors with "already exists" the table is already there and no action is needed.

    Do NOT attempt to apply the migration yourself — the user does this in the dashboard. This task only produces the instruction document.
  </action>
  <verify>
    <automated>test -f ".planning/quick/260514-fop-fix-all-open-gaps-delete-dead-payfast-fi/MIGRATION-00021.md" && grep -q "CREATE TABLE seller_applications" ".planning/quick/260514-fop-fix-all-open-gaps-delete-dead-payfast-fi/MIGRATION-00021.md" && grep -q "vpmrgidheamgerimkaox" ".planning/quick/260514-fop-fix-all-open-gaps-delete-dead-payfast-fi/MIGRATION-00021.md"</automated>
  </verify>
  <done>MIGRATION-00021.md exists with the full verbatim SQL, dashboard steps referencing project vpmrgidheamgerimkaox, and a verification query.</done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes in druip-web (no broken imports after deletions).
- `grep -rn "stitch\|payfast" druip-web/src/` returns nothing (all dead/replaced code gone).
- Paystack routes exist: initiate, callback, webhook + src/lib/paystack.ts.
- Buy button on note detail points at `/api/paystack/initiate`.
- Earnings page has no hardcoded `BAR_DATA`; queries `purchases` by `seller_id`.
- MIGRATION-00021.md exists with verbatim SQL and dashboard instructions.
</verification>

<success_criteria>
- All dead PayFast files and the Stitch integration are removed; the codebase has a single payment provider (Paystack).
- The note-detail buy flow initiates a Paystack transaction, and the callback + webhook record a real row in `purchases` with correct 15% fee split.
- The Earnings page shows a seller's real balance, chart, and activity from `purchases` — or honest empty states — never placeholder R0 when data exists.
- The user has a copy-paste-ready MIGRATION-00021.md to apply the `seller_applications` table in prod.
- Project typechecks clean.
</success_criteria>

<output>
After completion, create `.planning/quick/260514-fop-fix-all-open-gaps-delete-dead-payfast-fi/260514-fop-SUMMARY.md`.

Remind the user of the two manual steps they must do (Claude cannot):
1. Add `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` (test keys) to env (local `.env.local` + Vercel project env), and configure the webhook URL in the Paystack dashboard.
2. Run MIGRATION-00021.md in the Supabase SQL Editor for project vpmrgidheamgerimkaox.
</output>
