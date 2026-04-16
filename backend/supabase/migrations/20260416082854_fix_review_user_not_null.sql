-- Phase 1.1: Set user_id NOT NULL in club_book_reviews
-- First remove orphaned rows (safe, no real data yet)
DELETE FROM club_book_reviews WHERE user_id IS NULL;
ALTER TABLE club_book_reviews
  ALTER COLUMN user_id SET NOT NULL;
