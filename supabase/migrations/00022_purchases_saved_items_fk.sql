-- Add FK constraints so PostgREST can resolve embedded joins:
-- purchases?select=listing_id,listings(*) and saved_items?select=listing_id,listings(*)

ALTER TABLE purchases
  ADD CONSTRAINT purchases_listing_id_fkey
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;

ALTER TABLE saved_items
  ADD CONSTRAINT saved_items_listing_id_fkey
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
