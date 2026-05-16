-- Creates purchases, saved_items, and ratings tables
-- These were never formally migrated — run this to set them up in production

CREATE TABLE IF NOT EXISTS purchases (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id         uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_paid        numeric NOT NULL,
  platform_fee       numeric NOT NULL DEFAULT 0,
  seller_amount      numeric NOT NULL DEFAULT 0,
  payfast_payment_id text,
  payment_status     text NOT NULL DEFAULT 'pending',
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS ratings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score       integer NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, buyer_id)
);

-- RLS
ALTER TABLE purchases   ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings     ENABLE ROW LEVEL SECURITY;

-- purchases: buyer and seller can read their own rows; service role inserts on payment
CREATE POLICY "purchases_buyer_read"  ON purchases FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "purchases_seller_read" ON purchases FOR SELECT USING (auth.uid() = seller_id);

-- saved_items: user owns their own rows
CREATE POLICY "saved_items_owner" ON saved_items FOR ALL USING (auth.uid() = user_id);

-- ratings: anyone can read; buyer can insert/update their own
CREATE POLICY "ratings_read"   ON ratings FOR SELECT USING (true);
CREATE POLICY "ratings_write"  ON ratings FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "ratings_update" ON ratings FOR UPDATE USING (auth.uid() = buyer_id);
