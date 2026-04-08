-- Phase 8: Add flashcard card_type (RICH-01, RICH-03)
-- Extends the CHECK constraint to accept 'flashcard' without touching existing rows.

ALTER TABLE classroom_cards
  DROP CONSTRAINT IF EXISTS classroom_cards_card_type_check;

ALTER TABLE classroom_cards
  ADD CONSTRAINT classroom_cards_card_type_check
  CHECK (card_type IN ('text', 'pdf', 'image', 'link', 'flashcard'));
