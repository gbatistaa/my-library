ALTER TABLE club_book_progress
  ADD COLUMN member_progress_status VARCHAR(16) NOT NULL DEFAULT 'READING';
