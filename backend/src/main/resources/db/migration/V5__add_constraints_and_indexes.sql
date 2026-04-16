-- =============================================================================
-- V5__add_constraints_and_indexes.sql
-- Add missing constraints and performance indexes for the book club domain.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- club_books: enforce only one current book per club (partial unique index)
-- The @UniqueConstraint on (club_id, is_current) was semantically wrong:
-- it would block clubs from having more than one non-current book.
-- This partial index correctly allows multiple non-current books while
-- preventing duplicate current books.
-- -----------------------------------------------------------------------------
CREATE UNIQUE INDEX uk_club_books_single_current ON club_books (club_id)
  WHERE is_current = true;

-- -----------------------------------------------------------------------------
-- club_books: composite indexes for frequent queries
-- -----------------------------------------------------------------------------
CREATE INDEX idx_club_books_club_current ON club_books (club_id, is_current);
CREATE INDEX idx_club_books_club_order   ON club_books (club_id, order_index);

-- -----------------------------------------------------------------------------
-- club_book_progress: member_id and club_book_id must always be set
-- (safe to tighten: all rows are created with both values set by the service)
-- -----------------------------------------------------------------------------
ALTER TABLE club_book_progress
  ALTER COLUMN member_id    SET NOT NULL,
  ALTER COLUMN club_book_id SET NOT NULL;

-- -----------------------------------------------------------------------------
-- club_book_progress: one progress record per member per book
-- -----------------------------------------------------------------------------
ALTER TABLE club_book_progress
  ADD CONSTRAINT uk_club_book_progress_member_book UNIQUE (member_id, club_book_id);

-- -----------------------------------------------------------------------------
-- club_book_reviews: review must belong to a club book (can't be orphaned)
-- -----------------------------------------------------------------------------
ALTER TABLE club_book_reviews
  ALTER COLUMN club_book_id SET NOT NULL;

-- -----------------------------------------------------------------------------
-- club_book_reviews: one review per user per club book
-- -----------------------------------------------------------------------------
ALTER TABLE club_book_reviews
  ADD CONSTRAINT uk_club_book_reviews_user_book UNIQUE (user_id, club_book_id);
