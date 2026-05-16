# Migration 00022 — purchases and saved_items FK to listings

**Run this in the Supabase dashboard → SQL Editor for project `vpmrgidheamgerimkaox`.**

This fixes the Library page "Purchased" and "Wishlist" tabs — they return 404 because PostgREST cannot resolve the embedded join `listings(*)` without a FK constraint.

```sql
ALTER TABLE purchases
  ADD CONSTRAINT purchases_listing_id_fkey
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;

ALTER TABLE saved_items
  ADD CONSTRAINT saved_items_listing_id_fkey
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
```

**Effect:** After running this, purchased notes will appear in Library → Purchased, and saved notes in Library → Wishlist.
