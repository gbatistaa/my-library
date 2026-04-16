-- =============================================================================
-- V1__init_schema.sql (IDEMPOTENTE)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                UUID         PRIMARY KEY,
  created_at        TIMESTAMP    NOT NULL,
  updated_at        TIMESTAMP,
  name              VARCHAR(100) NOT NULL,
  username          VARCHAR(30)  NOT NULL,
  email             VARCHAR(100) NOT NULL,
  password          VARCHAR(255) NOT NULL,
  birth_date        DATE         NOT NULL,
  profile_pic_path  VARCHAR(512),
  total_experience  BIGINT       NOT NULL DEFAULT 0,
  level             INTEGER      NOT NULL DEFAULT 1,
  current_xp        BIGINT       NOT NULL DEFAULT 0,
  CONSTRAINT uk_users_username            UNIQUE (username),
  CONSTRAINT uk_users_email               UNIQUE (email),
  CONSTRAINT users_username_email_unique  UNIQUE (username, email)
);

-- -----------------------------------------------------------------------------
-- refresh_tokens
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id              UUID         PRIMARY KEY,
  created_at      TIMESTAMP    NOT NULL,
  updated_at      TIMESTAMP,
  token           VARCHAR(512) NOT NULL,
  user_id         UUID         NOT NULL,
  expiration_date TIMESTAMP    NOT NULL,
  device_id       VARCHAR(255) NOT NULL,
  device_name     VARCHAR(255) NOT NULL,
  CONSTRAINT uk_refresh_tokens_token     UNIQUE (token),
  CONSTRAINT uk_refresh_tokens_device_id UNIQUE (device_id),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens (user_id);

-- -----------------------------------------------------------------------------
-- sagas
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sagas (
  id           UUID         PRIMARY KEY,
  created_at   TIMESTAMP    NOT NULL,
  updated_at   TIMESTAMP,
  name         VARCHAR(100) NOT NULL,
  description  VARCHAR(255),
  cover_url    VARCHAR(512),
  user_id      UUID         NOT NULL,
  CONSTRAINT uk_sagas_user_name UNIQUE (user_id, name),
  CONSTRAINT fk_sagas_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sagas_user ON sagas (user_id);

-- -----------------------------------------------------------------------------
-- books
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS books (
  id              UUID         PRIMARY KEY,
  created_at      TIMESTAMP    NOT NULL,
  updated_at      TIMESTAMP,
  google_books_id VARCHAR(32)  NOT NULL,
  title           VARCHAR(255) NOT NULL,
  author          VARCHAR(255) NOT NULL,
  pages           INTEGER      NOT NULL CHECK (pages >= 1),
  isbn            VARCHAR(13),
  cover_url       VARCHAR(512),
  description     VARCHAR(2000),
  published_date  VARCHAR(16),
  publisher       VARCHAR(128),
  language        VARCHAR(16),
  CONSTRAINT uk_books_google_books_id UNIQUE (google_books_id)
);

CREATE INDEX IF NOT EXISTS idx_books_title  ON books (title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books (author);

-- -----------------------------------------------------------------------------
-- book_categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS book_categories (
  book_id  UUID        NOT NULL,
  category VARCHAR(80) NOT NULL,
  CONSTRAINT fk_book_categories_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_book_categories_category ON book_categories (category);

-- -----------------------------------------------------------------------------
-- user_books
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_books (
  id          UUID         PRIMARY KEY,
  created_at  TIMESTAMP    NOT NULL,
  updated_at  TIMESTAMP,
  user_id     UUID         NOT NULL,
  book_id     UUID         NOT NULL,
  status      VARCHAR(16)  NOT NULL,
  rating      INTEGER      CHECK (rating BETWEEN 1 AND 5),
  pages_read  INTEGER      NOT NULL DEFAULT 0 CHECK (pages_read >= 0),
  start_date  DATE,
  finish_date DATE,
  notes       VARCHAR(1000),
  saga_id     UUID,
  CONSTRAINT uk_user_books_user_book UNIQUE (user_id, book_id),
  CONSTRAINT fk_user_books_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_books_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT,
  CONSTRAINT fk_user_books_saga FOREIGN KEY (saga_id) REFERENCES sagas(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_user_books_user        ON user_books (user_id);
CREATE INDEX IF NOT EXISTS idx_user_books_book        ON user_books (book_id);
CREATE INDEX IF NOT EXISTS idx_user_books_user_status ON user_books (user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_books_user_finish ON user_books (user_id, finish_date);
CREATE INDEX IF NOT EXISTS idx_user_books_saga        ON user_books (saga_id);

-- -----------------------------------------------------------------------------
-- reading_sessions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reading_sessions (
  id               UUID      PRIMARY KEY,
  created_at       TIMESTAMP NOT NULL,
  updated_at       TIMESTAMP,
  pages_read       INTEGER   NOT NULL,
  duration_seconds BIGINT    NOT NULL,
  xp_gained        INTEGER   NOT NULL DEFAULT 0,
  user_id          UUID      NOT NULL,
  user_book_id     UUID      NOT NULL,
  CONSTRAINT fk_reading_sessions_user      FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE,
  CONSTRAINT fk_reading_sessions_user_book FOREIGN KEY (user_book_id) REFERENCES user_books(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_user      ON reading_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_book ON reading_sessions (user_book_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_created   ON reading_sessions (created_at);

-- -----------------------------------------------------------------------------
-- reading_goals
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reading_goals (
  id             UUID        PRIMARY KEY,
  created_at     TIMESTAMP   NOT NULL,
  updated_at     TIMESTAMP,
  goal_year      INTEGER     NOT NULL,
  target_books   INTEGER     NOT NULL,
  target_pages   INTEGER,
  target_authors INTEGER,
  target_genres  INTEGER,
  target_minutes INTEGER,
  visibility     VARCHAR(16) NOT NULL DEFAULT 'PRIVATE',
  user_id        UUID        NOT NULL,
  CONSTRAINT uk_reading_goals_user_year UNIQUE (user_id, goal_year),
  CONSTRAINT fk_reading_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reading_goals_user ON reading_goals (user_id);

-- -----------------------------------------------------------------------------
-- streaks
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS streaks (
  id                  UUID      PRIMARY KEY,
  created_at          TIMESTAMP NOT NULL,
  updated_at          TIMESTAMP,
  last_reading_date   DATE,
  current_streak      INTEGER   NOT NULL DEFAULT 0,
  best_streak         INTEGER   NOT NULL DEFAULT 0,
  total_reading_days  INTEGER   NOT NULL DEFAULT 0,
  user_id             UUID      NOT NULL,
  CONSTRAINT uk_streaks_user UNIQUE (user_id),
  CONSTRAINT fk_streaks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- user_achievements
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_achievements (
  id         UUID        PRIMARY KEY,
  created_at TIMESTAMP   NOT NULL,
  updated_at TIMESTAMP,
  code       VARCHAR(50) NOT NULL,
  earned_at  DATE        NOT NULL,
  user_id    UUID        NOT NULL,
  CONSTRAINT uk_user_achievement UNIQUE (user_id, code),
  CONSTRAINT fk_user_achievements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements (user_id);

-- -----------------------------------------------------------------------------
-- book_club
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS book_club (
  id          UUID         PRIMARY KEY,
  created_at  TIMESTAMP    NOT NULL,
  updated_at  TIMESTAMP,
  name        VARCHAR(100) NOT NULL,
  description VARCHAR(512),
  max_members INTEGER,
  status      VARCHAR(16)  NOT NULL,
  admin_id    UUID         NOT NULL,
  CONSTRAINT fk_book_club_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_book_club_admin ON book_club (admin_id);

-- -----------------------------------------------------------------------------
-- book_club_members
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS book_club_members (
  id            UUID        PRIMARY KEY,
  created_at    TIMESTAMP   NOT NULL,
  updated_at    TIMESTAMP,
  role          VARCHAR(16) NOT NULL,
  status        VARCHAR(16) NOT NULL,
  book_club_id  UUID        NOT NULL,
  user_id       UUID        NOT NULL,
  CONSTRAINT uk_book_club_members_club_user UNIQUE (book_club_id, user_id),
  CONSTRAINT fk_book_club_members_club FOREIGN KEY (book_club_id) REFERENCES book_club(id) ON DELETE CASCADE,
  CONSTRAINT fk_book_club_members_user FOREIGN KEY (user_id)      REFERENCES users(id)     ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_book_club_members_club ON book_club_members (book_club_id);
CREATE INDEX IF NOT EXISTS idx_book_club_members_user ON book_club_members (user_id);

-- -----------------------------------------------------------------------------
-- club_invites
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club_invites (
  id           UUID         PRIMARY KEY,
  created_at   TIMESTAMP    NOT NULL,
  updated_at   TIMESTAMP,
  token        VARCHAR(255) NOT NULL,
  accepted_at  TIMESTAMP    NOT NULL,
  expires_at   DATE         NOT NULL,
  status       VARCHAR(16)  NOT NULL,
  book_club_id UUID,
  inviter_id   UUID,
  invitee_id   UUID,
  CONSTRAINT uk_club_invites_inviter_invitee_club UNIQUE (inviter_id, invitee_id, book_club_id),
  CONSTRAINT fk_club_invites_club    FOREIGN KEY (book_club_id) REFERENCES book_club(id) ON DELETE CASCADE,
  CONSTRAINT fk_club_invites_inviter FOREIGN KEY (inviter_id)   REFERENCES users(id)     ON DELETE SET NULL,
  CONSTRAINT fk_club_invites_invitee FOREIGN KEY (invitee_id)   REFERENCES users(id)     ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_club_invites_club    ON club_invites (book_club_id);
CREATE INDEX IF NOT EXISTS idx_club_invites_invitee ON club_invites (invitee_id);

-- -----------------------------------------------------------------------------
-- club_books
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club_books (
  id           UUID      PRIMARY KEY,
  created_at   TIMESTAMP NOT NULL,
  updated_at   TIMESTAMP,
  order_index  INTEGER   NOT NULL,
  is_current   BOOLEAN   NOT NULL,
  started_at   DATE,
  finished_at  DATE,
  current_page INTEGER,
  club_id      UUID      NOT NULL,
  book_id      UUID      NOT NULL,
  CONSTRAINT uk_club_books_club_book UNIQUE (club_id, book_id),
  CONSTRAINT fk_club_books_club FOREIGN KEY (club_id) REFERENCES book_club(id) ON DELETE CASCADE,
  CONSTRAINT fk_club_books_book FOREIGN KEY (book_id) REFERENCES books(id)     ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_club_books_club ON club_books (club_id);
CREATE INDEX IF NOT EXISTS idx_club_books_book ON club_books (book_id);

-- -----------------------------------------------------------------------------
-- club_book_progress
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club_book_progress (
  id            UUID      PRIMARY KEY,
  created_at    TIMESTAMP NOT NULL,
  updated_at    TIMESTAMP,
  current_page  INTEGER   NOT NULL,
  finished_at   DATE,
  member_id     UUID,
  club_book_id  UUID,
  CONSTRAINT fk_club_book_progress_member    FOREIGN KEY (member_id)    REFERENCES book_club_members(id) ON DELETE CASCADE,
  CONSTRAINT fk_club_book_progress_club_book FOREIGN KEY (club_book_id) REFERENCES club_books(id)        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_club_book_progress_member    ON club_book_progress (member_id);
CREATE INDEX IF NOT EXISTS idx_club_book_progress_club_book ON club_book_progress (club_book_id);

-- -----------------------------------------------------------------------------
-- club_book_reviews
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS club_book_reviews (
  id           UUID         PRIMARY KEY,
  created_at   TIMESTAMP    NOT NULL,
  updated_at   TIMESTAMP,
  rating       INTEGER      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text  VARCHAR(2000) NOT NULL,
  club_book_id UUID,
  user_id      UUID,
  CONSTRAINT fk_club_book_reviews_club_book FOREIGN KEY (club_book_id) REFERENCES club_books(id) ON DELETE CASCADE,
  CONSTRAINT fk_club_book_reviews_user      FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_club_book_reviews_club_book ON club_book_reviews (club_book_id);
CREATE INDEX IF NOT EXISTS idx_club_book_reviews_user      ON club_book_reviews (user_id);
