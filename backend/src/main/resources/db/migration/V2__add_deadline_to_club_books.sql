-- Migration to add deadline columns and cleanup club_books table
ALTER TABLE club_books ADD COLUMN deadline DATE;
ALTER TABLE club_books ADD COLUMN deadline_extended_at DATE;
ALTER TABLE club_books DROP COLUMN current_page;
