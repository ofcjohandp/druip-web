-- Adds a `comment` column to ratings, and creates the `payout_requests` table.
-- Run with `npx supabase db push` or apply via the Supabase SQL editor.

-- 1. Reviews: comment column ----------------------------------------------
ALTER TABLE ratings
  ADD COLUMN IF NOT EXISTS comment text;

-- Existing migration already creates UNIQUE (listing_id, buyer_id) so a
-- second review attempt from the same buyer is blocked at the DB level.

-- 2. Payout requests ------------------------------------------------------
CREATE TABLE IF NOT EXISTS payout_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount          numeric NOT NULL CHECK (amount > 0),
  bank_name       text NOT NULL,
  account_number  text NOT NULL,
  account_holder  text NOT NULL,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'paid', 'rejected')),
  paid_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payout_requests_seller_idx
  ON payout_requests (seller_id, created_at DESC);

ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

-- Seller can read their own requests
DROP POLICY IF EXISTS "payouts_owner_read"  ON payout_requests;
DROP POLICY IF EXISTS "payouts_owner_write" ON payout_requests;

CREATE POLICY "payouts_owner_read"
  ON payout_requests FOR SELECT
  USING (auth.uid() = seller_id);

-- Seller can insert their own request rows
CREATE POLICY "payouts_owner_write"
  ON payout_requests FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Updates (mark paid / rejected) are admin-only, performed via the service
-- role from the API, so no public update policy is needed.
