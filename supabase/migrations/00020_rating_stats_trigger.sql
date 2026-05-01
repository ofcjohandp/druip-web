ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

CREATE OR REPLACE FUNCTION update_listing_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_listing_id UUID;
BEGIN
  target_listing_id := COALESCE(NEW.listing_id, OLD.listing_id);
  UPDATE listings
  SET
    avg_rating = (SELECT ROUND(AVG(score)::NUMERIC, 2) FROM ratings WHERE listing_id = target_listing_id),
    rating_count = (SELECT COUNT(*) FROM ratings WHERE listing_id = target_listing_id)
  WHERE id = target_listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rating_stats_trigger ON ratings;
CREATE TRIGGER rating_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW EXECUTE FUNCTION update_listing_rating_stats();
