-- =============================================================================
-- V2__create_book_categories.sql
-- Creates the book_categories @ElementCollection table expected by BookEntity,
-- migrating data from the old books_categories/categories schema, then drops
-- the obsolete tables.
-- =============================================================================

-- Create the new book_categories table as expected by BookEntity
CREATE TABLE book_categories (
  book_id  UUID        NOT NULL,
  category VARCHAR(80) NOT NULL,
  CONSTRAINT fk_book_categories_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
CREATE INDEX idx_book_categories_category ON book_categories (category);

-- Migrate existing data from the old schema (books_categories JOIN categories)
INSERT INTO book_categories (book_id, category)
SELECT bc.book_id, c.name
FROM books_categories bc
JOIN categories c ON c.id = bc.category_id
WHERE c.name IS NOT NULL
ON CONFLICT DO NOTHING;

-- Drop old tables (order matters due to FK)
DROP TABLE IF EXISTS books_categories;
DROP TABLE IF EXISTS categories;
