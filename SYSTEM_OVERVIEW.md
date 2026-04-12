# My Library — System Architecture & Implementation Overview

## 1. Technical Stack

### Backend (Java/Spring Boot)

- **Runtime:** Java 21 LTS
- **Framework:** Spring Boot 4 (`@EnableScheduling`)
- **ORM:** JPA / Hibernate 6 (DDL auto-update, formatted SQL logging)
- **Database:** PostgreSQL (managed, env-based config: `DB_URL`, `DB_USER`, `DB_PASS`)
- **Security:** Stateless JWT + Refresh Token per device, BCrypt password hashing
- **DTO Mapping:** MapStruct for Entity-to-DTO conversion
- **Email:** JavaMailSender + Thymeleaf HTML templates (SMTP/TLS)
- **Error Handling:** Global `@ControllerAdvice` with structured `ErrorResponse` (status, error, message, path, timestamp, fieldErrors)
- **Project Structure:** Layered pattern (`Controller` → `Service` → `Repository` → `Entity`) organized by domain packages

### Frontend (React Native/Expo)

- **Framework:** Expo SDK 54 (Managed Workflow), React 19, React Native 0.81
- **Routing:** Expo Router 6 (File-based navigation with typed routes)
- **Styling:** Tailwind CSS via NativeWind 4, dark mode via `dark:` prefix
- **State Management:** Jotai 2 (atoms: auth, session, theme) + TanStack Query v5 (server state/caching)
- **Animations:** React Native Reanimated 4
- **Charts:** react-native-gifted-charts
- **Icons/UI:** Expo Vector Icons, React Native SVG, Expo Linear Gradient
- **Auth Storage:** Expo Secure Store (JWT tokens), AsyncStorage (preferences)
- **Networking:** Axios (HTTP with JWT interceptor + auto-refresh) + Socket.io-client
- **Media:** Expo Image Picker, Expo File System, Expo Image
- **Device:** Expo Device (device identification), Expo Haptics

---

## 2. Base Architecture

### Base Entity (Backend)

All entities extend `BaseEntity`:

- `id` (UUID, auto-generated)
- `createdAt` (LocalDateTime, immutable via `@PrePersist`)
- `updatedAt` (LocalDateTime, auto-updated via `@PreUpdate`)

### Custom Exceptions

| Exception                       | HTTP Status | Usage                        |
| ------------------------------- | ----------- | ---------------------------- |
| `ResourceNotFoundException`     | 404         | Resource not found           |
| `ResourceConflictException`     | 409         | Duplicate/conflict violation |
| `UnauthorizedException`         | 401         | Invalid credentials/token    |
| `ForbiddenException`            | 403         | Permission denied            |
| `UnprocessableContentException` | 422         | Invalid business logic state |

### Common Enums

| Enum                   | Values                                                               |
| ---------------------- | -------------------------------------------------------------------- |
| `BookStatus`           | `TO_READ`, `READING`, `COMPLETED`, `DROPPED`                         |
| `GoalVisibility`       | `PUBLIC`, `PRIVATE`                                                  |
| `BookClubStatus`       | `ACTIVE`, `INACTIVE`, `SUSPENDED`                                    |
| `BookClubMemberRole`   | `ADMIN`, `MODERATOR`, `MEMBER`                                       |
| `BookClubMemberStatus` | `ACTIVE`, `INACTIVE`, `BANNED`                                       |
| `InviteStatus`         | `PENDING`, `ACCEPTED`, `DECLINED`                                    |
| `XpType`               | `PAGES_READ`, `BOOK_COMPLETED`, `DAILY_STREAK`, `ACHIEVEMENT_EARNED` |

### Security Configuration

- Stateless sessions (`SessionCreationPolicy.STATELESS`), CSRF disabled
- JWT filter before `UsernamePasswordAuthenticationFilter`
- Token read from `Authorization: Bearer` header or HttpOnly cookie
- CORS origins: `localhost:8081`, `19000`, `19006`, `10.0.2.2:8081` (Android emulator)
- Allowed methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`

### MapStruct Mappers

Each domain has a mapper with methods: `toDto()`, `toEntity()`, `updateEntityFromDto()`, `toSummaryDto()`.
Mappers: `BookMapper`, `CategoryMapper`, `UserMapper`, `RefreshTokenMapper`, `ReadingSessionMapper`, `ReadingGoalMapper`, `SagaMapper`, `BookClubMapper`, `BookClubMemberMapper`.

---

## 3. Complete Domain Map

### 1. Auth & Tokens (`com.gabriel.mylibrary.auth`)

**Entities**:

- `RefreshTokenEntity`: id, token, expirationDate (7d default), deviceId, deviceName, userId. One token per user-device pair.

**Services**:

- `AuthService`: register (create user + tokens + device session), login (validate + tokens), refresh (validate expiry + new access token), logout (delete device token)
- `JwtService`: generateAccessToken (24h), generateRefreshToken (30d), isTokenValid, extractUsername, extractUserId. HMAC-SHA with Base64 secret.
- `RefreshTokenService`: CRUD for refresh tokens, `deleteByUserIdAndDeviceId`, `existsByUserIdAndDeviceId`

**Security**:

- `JwtAuthenticationFilter`: reads token from header/cookie, validates, creates stateless UserEntity stub, sets SecurityContext
- `SecurityConfig`: stateless, CSRF off, JWT filter, CORS

**Controller:** `AuthController` (`/auth`)

| Method | Endpoint         | Description                        |
| ------ | ---------------- | ---------------------------------- |
| POST   | `/auth/register` | Register user with device info     |
| POST   | `/auth/login`    | Login with credentials + device    |
| POST   | `/auth/refresh`  | Refresh access token via device ID |
| DELETE | `/auth/logout`   | Logout user from device            |
| GET    | `/auth/me`       | Get authenticated user summary     |

**DTOs:** `RegisterDTO`, `LoginDTO`, `RefreshRequestDTO`, `AuthResponseDTO` (accessToken), `DeviceInfoDTO`

---

### 2. User (`com.gabriel.mylibrary.user`)

**Entity** — `UserEntity`:

| Field           | Type      | Notes                      |
| --------------- | --------- | -------------------------- |
| name            | String    | Max 100                    |
| username        | String    | Unique, max 30             |
| email           | String    | Unique, max 100            |
| password        | String    | BCrypt hashed, min 8       |
| birthDate       | LocalDate |                            |
| profilePicPath  | String    | Optional                   |
| totalExperience | Long      | Lifetime XP (never resets) |
| level           | Integer   | Starting at 1              |
| currentXp       | Long      | XP towards next level      |

**Relationships:** OneToMany cascade DELETE to: refreshTokens, books, categories, sagas, readingSessions, readingGoals.

**Controller:** `UserController` (`/users`)

| Method | Endpoint      | Description               |
| ------ | ------------- | ------------------------- |
| GET    | `/users`      | List all users            |
| GET    | `/users/{id}` | Get user by ID            |
| POST   | `/users`      | Create user               |
| PATCH  | `/users/{id}` | Update user               |
| PATCH  | `/users/me`   | Update authenticated user |
| DELETE | `/users/{id}` | Delete user               |
| DELETE | `/users/me`   | Delete authenticated user |

**Service:** `UserService` — CRUD + validates username/email uniqueness, hashes password on create/update.

**Projections:** `UserSummary`, `UserProfileProjection`

**DTOs:** `CreateUserDTO`, `UpdateUserDTO`, `UserDTO`

---

### 3. Books (`com.gabriel.mylibrary.books`)

**Entity** — `BookEntity`:

| Field      | Type       | Constraints                          |
| ---------- | ---------- | ------------------------------------ |
| title      | String     | NotBlank, max 100                    |
| author     | String     | NotBlank, max 255                    |
| isbn       | String     | NotBlank, 10-13 chars                |
| pages      | Integer    | Min 1                                |
| pagesRead  | Integer    | Default 0                            |
| rating     | Integer    | 1-5 scale, nullable                  |
| status     | BookStatus | TO_READ, READING, COMPLETED, DROPPED |
| coverUrl   | String     | Optional                             |
| startDate  | LocalDate  | Optional                             |
| finishDate | LocalDate  | Optional                             |
| notes      | String     | Max 1000                             |

**Relationships:** ManyToMany → categories, ManyToOne → saga (optional), ManyToOne → user.
**Unique constraint:** `(user_id, title, author)`. **Indexes:** `(user_id)`, `(saga_id)`, `(user_id, title)`.

**Controller:** `BookController` (`/books`)

| Method | Endpoint            | Description                              |
| ------ | ------------------- | ---------------------------------------- |
| GET    | `/books`            | List books with optional filters         |
| GET    | `/books/search`     | Search by title                          |
| GET    | `/books/authors`    | Authors with book counts                 |
| GET    | `/books/{id}`       | Get single book                          |
| POST   | `/books`            | Create book                              |
| PATCH  | `/books/{id}`       | Update book                              |
| POST   | `/books/{id}/reset` | Reset for re-reading (COMPLETED→READING) |
| DELETE | `/books/{id}`       | Delete book                              |

**Service** — `BookService`:

- `findAll`, `findWithFilters` (via `BookSpecification` for status, minRating, categoryId, author, year), `findByTitle`
- `create`: validates ISBN uniqueness per user, enforces rating for COMPLETED, auto-sets pagesRead=pages for COMPLETED, validates dates, triggers achievement evaluation
- `update`: same validations, detects status changes for XP rewards
- `resetForReread`: COMPLETED → READING, resets rating/pagesRead/finishDate
- `getAuthors`: list authors with book counts

**Projections:** `BookSummary`, `BookReadingProjection`

**DTOs:** `BookDTO`, `CreateBookDTO`, `UpdateBookDTO`, `BookSummaryDTO`, `BookAuthorDTO`, `BookCategoryDTO`

---

### 4. Categories (`com.gabriel.mylibrary.categories`)

**Entity** — `CategoryEntity`:

| Field       | Type   | Notes            |
| ----------- | ------ | ---------------- |
| name        | String | Max 50           |
| description | String | Optional         |
| color       | String | Hex color, max 7 |

**Relationships:** ManyToOne → user. **Unique constraint:** `(user_id, name)`.

**Controller:** `CategoryController` (`/categories`)

| Method | Endpoint           | Description |
| ------ | ------------------ | ----------- |
| GET    | `/categories`      | List all    |
| GET    | `/categories/{id}` | Get by ID   |
| POST   | `/categories`      | Create      |
| PUT    | `/categories/{id}` | Update      |
| DELETE | `/categories/{id}` | Delete      |

**Service:** `CategoryService` — CRUD + validates name uniqueness per user.

**DTOs:** `CategoryDTO`, `CreateCategoryDTO`, `UpdateCategoryDTO`

---

### 5. Saga / Series (`com.gabriel.mylibrary.saga`)

**Entity** — `SagaEntity`:

| Field       | Type   | Notes             |
| ----------- | ------ | ----------------- |
| name        | String | Max 100           |
| description | String | Max 255, optional |
| coverUrl    | String | Optional          |

**Relationships:** OneToMany → books, ManyToOne → user. **Unique constraint:** `(user_id, name)`.
**Methods:** `addBook()` (validates not duplicate), `removeBook()` (validates exists).

**Controller:** `SagaController` (`/sagas`)

| Method | Endpoint                     | Description                  |
| ------ | ---------------------------- | ---------------------------- |
| GET    | `/sagas`                     | List sagas with book counts  |
| GET    | `/sagas/{id}`                | Get saga details             |
| GET    | `/sagas/{id}/books`          | Books in saga                |
| GET    | `/sagas/{id}/progress`       | Progress % (completed books) |
| POST   | `/sagas`                     | Create saga                  |
| PUT    | `/sagas/{id}`                | Update saga                  |
| PATCH  | `/sagas/{id}/books/{bookId}` | Add book to saga             |
| DELETE | `/sagas/{id}`                | Delete saga                  |
| DELETE | `/sagas/{id}/books/{bookId}` | Remove book from saga        |

**Service:** `SagaService` — CRUD + add/remove books + progress calculation.

**DTOs:** `SagaDTO`, `CreateSagaDTO`, `UpdateSagaDTO`

---

### 6. Reading Sessions (`com.gabriel.mylibrary.readingSession`)

**Entity** — `ReadingSessionEntity`:

| Field           | Type    | Notes               |
| --------------- | ------- | ------------------- |
| pagesRead       | Integer | Required            |
| durationSeconds | Long    | Required            |
| xpGained        | Integer | Earned from session |

**Relationships:** ManyToOne → user, ManyToOne → book.

**Controller:** `ReadingSessionController` (`/reading-sessions`)

| Method | Endpoint                          | Description         |
| ------ | --------------------------------- | ------------------- |
| GET    | `/reading-sessions`               | List all sessions   |
| GET    | `/reading-sessions/history`       | Paginated history   |
| GET    | `/reading-sessions/book/{bookId}` | Sessions for a book |
| POST   | `/reading-sessions`               | Create session      |
| DELETE | `/reading-sessions/{id}`          | Delete session      |

**Service** — `ReadingSessionService`:

- `create`: validates pagesRead ≤ book.pages, calculates XP (pagesRead + 50 if new reading day), triggers streak, evaluates achievements, updates book stats
- `getHistory`: paginated session list
- `findAllByBook`: sessions per book

**DTOs:** `ReadingSessionDTO`, `CreateReadingSessionDTO`

---

### 7. Streak (`com.gabriel.mylibrary.streak`)

**Entity** — `StreakEntity`:

| Field            | Type      | Notes                  |
| ---------------- | --------- | ---------------------- |
| lastReadingDate  | LocalDate |                        |
| currentStreak    | Integer   | Days in current streak |
| bestStreak       | Integer   | Lifetime record        |
| totalReadingDays | Integer   | Total days read ever   |

**Relationships:** OneToOne → user.

**Controller:** `StreakController` (`/streak`)

| Method | Endpoint  | Description        |
| ------ | --------- | ------------------ |
| GET    | `/streak` | Get current streak |

**Service** — `StreakService`:

- `getStreak`: returns current/best streak, total days, insight. Auto-creates if doesn't exist.
- `recordActivity`: returns true if first activity of day (new reading day), calculates streak continuity (broken if >1 day gap), updates bestStreak.
- `resetStreak`: scheduled job to reset streaks for inactive users.

**DTO:** `StreakDTO` (currentStreak, bestStreak, totalReadingDays, lastReadingDate, insight)

---

### 8. Reading Goals (`com.gabriel.mylibrary.readingGoal`)

**Entity** — `ReadingGoalEntity`:

| Field         | Type           | Notes            |
| ------------- | -------------- | ---------------- |
| year          | Integer        | Required         |
| targetBooks   | Integer        | Required         |
| targetPages   | Integer        | Optional         |
| targetAuthors | Integer        | Optional         |
| targetGenres  | Integer        | Optional         |
| targetMinutes | Integer        | Optional         |
| visibility    | GoalVisibility | PUBLIC / PRIVATE |

**Relationships:** ManyToOne → user. **Unique constraint:** `(user_id, goal_year)`.

**Controller:** `ReadingGoalController` (`/reading-goals`)

| Method    | Endpoint                         | Description       |
| --------- | -------------------------------- | ----------------- |
| POST      | `/reading-goals`                 | Create goal       |
| GET       | `/reading-goals`                 | List all goals    |
| GET       | `/reading-goals/{year}`          | Get goal by year  |
| GET       | `/reading-goals/{year}/progress` | Detailed progress |
| PUT/PATCH | `/reading-goals/{id}`            | Update goal       |
| DELETE    | `/reading-goals/{id}`            | Delete goal       |

**Service** — `ReadingGoalService`:

- CRUD + validates year uniqueness per user
- `getProgress`: complex calculations including pace (books/week, daily pace), projected finish date (Portuguese), on-track status (90% threshold), streak info, diversity (unique authors/genres), micro-victories (daily pages/minutes), motivational insights (Portuguese)

**DTOs:** `ReadingGoalDTO`, `CreateReadingGoalDTO`, `UpdateReadingGoalDTO`, `ReadingGoalProgressDTO`

---

### 9. Gamification / Experience (`com.gabriel.mylibrary.gamification`)

**`ExperienceService`**:

- `rewardActivity(userId, XpType, amount)`:
  - Level cost formula: `level × 100 XP`
  - `totalExperience`: lifetime accumulator, never resets
  - `currentXp`: resets on level-up with carry-over remainder
  - Handles multi-level-ups in a single reward

**XP Sources**:

| XpType               | Value                    |
| -------------------- | ------------------------ |
| `PAGES_READ`         | 1 XP per page            |
| `BOOK_COMPLETED`     | 100 XP flat              |
| `DAILY_STREAK`       | 50 XP flat               |
| `ACHIEVEMENT_EARNED` | Variable per achievement |

---

### 10. Achievements (`com.gabriel.mylibrary.achievement`)

**Entities**:

- `UserAchievementEntity`: id, code (AchievementDefinition), earnedAt (LocalDate), user (ManyToOne)

**16 Achievement Definitions**:

| Achievement      | Category  | Threshold | XP   | Condition                  |
| ---------------- | --------- | --------- | ---- | -------------------------- |
| `FIRST_BOOK`     | VOLUME    | 1         | 50   | Complete 1st book          |
| `BOOKWORM`       | VOLUME    | 10        | 300  | Complete 10 books          |
| `CENTURION`      | VOLUME    | 100       | 1000 | Complete 100 books         |
| `PAGE_TURNER`    | VOLUME    | 10000     | 500  | Read 10,000 total pages    |
| `IRON_READER`    | VOLUME    | 30        | 350  | 30-day streak              |
| `HABIT_FORMED`   | VOLUME    | 7         | 100  | 7-day streak               |
| `SPEED_DEMON`    | VELOCITY  | 3         | 150  | Complete book in <3 days   |
| `MARATHON`       | VELOCITY  | 180       | 100  | 3+ hour session            |
| `BINGE_READER`   | VELOCITY  | 3         | 200  | 3 books in 1 week          |
| `GENRE_EXPLORER` | DIVERSITY | 5         | 150  | Read in 5 genres           |
| `SAGA_SLAYER`    | DIVERSITY | 1         | 200  | Complete a saga            |
| `NEW_VOICE`      | DIVERSITY | 10        | 200  | Read 10 new authors        |
| `CONTRARIAN`     | DIVERSITY | 1         | 150  | 1-star & 5-star same month |
| `GOAL_CRUSHER`   | GOALS     | 1         | 250  | Exceed yearly goal by 20%  |
| `COMEBACK_KID`   | GOALS     | 14        | 75   | Return after 14+ days      |
| `DNF_ZERO`       | GOALS     | 1         | 300  | No dropped books in year   |

**`AchievementEvaluator`:** Evaluates all 16 definitions on user activity. Transactional, auto-awards XP.

**Controller:** `AchievementController` (`/achievements`)

| Method | Endpoint               | Description                    |
| ------ | ---------------------- | ------------------------------ |
| GET    | `/achievements`        | All achievements with progress |
| GET    | `/achievements/recent` | Last 3 earned                  |

**Service:** `AchievementService` — `getAllWithProgress` (calculates progress 0-1.0 + labels like "5 of 10 books"), `getRecent`.

**DTO:** `AchievementDTO` (code, name, description, category, earned, earnedAt, progress, progressLabel)

---

### 11. Analytics (`com.gabriel.mylibrary.analytics`)

(No entities — aggregates data via SQL projections)

**Controller:** `AnalyticsController` (`/analytics`)

| Method | Endpoint                  | Description                        |
| ------ | ------------------------- | ---------------------------------- |
| GET    | `/analytics/summary`      | Summary stats for period           |
| GET    | `/analytics/trends`       | Trend data (PAGES, TIME, VELOCITY) |
| GET    | `/analytics/distribution` | Genre/language distribution        |
| GET    | `/analytics/heatmap`      | Activity heatmap by year           |

**Service** — `AnalyticsService`:

- `getSummary(userId, period)`: totalPagesRead, totalActiveMinutes, avgPagesPerMinute. Periods: WEEK, MONTH, HALF_YEAR, YEAR, CURRENT_WEEK, CURRENT_MONTH, CURRENT_YEAR.
- `getTrends(userId, metric, period)`: data points with labels/values. Metrics: PAGES (cumulative), TIME, VELOCITY.
- `getDistribution(userId)`: genre percentages and counts.
- `getHeatmap(userId, year)`: daily pages read + session count from Jan 1 to today.

**DTOs**: `AnalyticsSummaryDTO`, `AnalyticsTrendDTO`, `AnalyticsDistributionDTO`, `DailySessionAggDTO`, `HeatmapDTO` (year + `List<DayActivityDTO>`)

---

### 12. Stats (`com.gabriel.mylibrary.stats`)

(No entities — aggregates data)

**Controller:** `StatsController` (`/stats`)

| Method | Endpoint                | Description           |
| ------ | ----------------------- | --------------------- |
| GET    | `/stats/dna`            | Reading DNA profile   |
| GET    | `/stats/heatmap`        | Activity heatmap      |
| GET    | `/stats/velocity`       | Reading speed metrics |
| GET    | `/stats/year-in-review` | Annual summary        |

**Service:** `StatsService` — generates shareable stats: Reading DNA, Year in Review, heatmaps, genre shares, velocity.

**DTOs:** `ReadingDnaDTO` (totalBooksLifetime, totalPagesLifetime, avgRating, completionRate, avgVelocityPagesPerHour, peakReadingHour, avgSessionDurationMin, avgPagesPerSession, genreBreakdown[], topAuthor, uniqueAuthorsRead, dropRate, readerArchetype), `YearInReviewDTO`, `HeatmapDTO`, `GenreShareDTO`, `VelocityDTO`

---

### 13. Book Club (`com.gabriel.mylibrary.bookClub`)

**Entities**:

**`BookClubEntity`**:

| Field       | Type           | Notes                       |
| ----------- | -------------- | --------------------------- |
| name        | String         | Max 100                     |
| description | String         | Optional                    |
| maxMembers  | Integer        | Min 3, optional             |
| status      | BookClubStatus | ACTIVE, INACTIVE, SUSPENDED |

**Relationships:** ManyToOne → admin (UserEntity), OneToMany → members (BookClubMemberEntity).

**`BookClubMemberEntity`**:

| Field  | Type                 | Notes                    |
| ------ | -------------------- | ------------------------ |
| role   | BookClubMemberRole   | ADMIN, MODERATOR, MEMBER |
| status | BookClubMemberStatus | ACTIVE, INACTIVE, BANNED |

**Relationships:** ManyToOne → bookClub, ManyToOne → user. **Unique constraint:** `(book_club_id, user_id)`.

**Additional Entities:** `ClubBookEntity` (selected books for reading list), `ClubBookProgressEntity` (member progress), `ClubBookReviewEntity` (member reviews), `ClubInviteEntity` (invitations with PENDING/ACCEPTED/DECLINED status).

**Controller:** `BookClubController` (`/api/book-clubs`)

| Method | Endpoint                          | Description            |
| ------ | --------------------------------- | ---------------------- |
| GET    | `/api/book-clubs`                 | List clubs (paginated) |
| GET    | `/api/book-clubs/{id}`            | Get club by ID         |
| GET    | `/api/book-clubs/admin/{adminId}` | Clubs managed by user  |
| POST   | `/api/book-clubs`                 | Create club            |
| PUT    | `/api/book-clubs/{id}`            | Update club            |
| DELETE | `/api/book-clubs/{id}`            | Delete club            |

**Controller:** `BookClubMemberController` — member CRUD, join/leave, role management.

**Service:** `BookClubService` — CRUD + auto-assigns admin as ACTIVE member on creation.

**DTOs:** `BookClubDTO`, `CreateBookClubDTO`, `UpdateBookClubDTO`, `BookClubMemberDTO`

---

### 14. Email (`com.gabriel.mylibrary.email`)

**Controller:** `EmailController` (`/email`)

| Method | Endpoint      | Description     |
| ------ | ------------- | --------------- |
| POST   | `/email/send` | Send HTML email |

**Service:** `EmailService` — sends HTML email via Thymeleaf template (`email.html`), SMTP with TLS (port 587).

**DTO:** `EmailRequestDTO` (to, subject)

---

## 4. Key Feature Flows

### A. The Reading Loop (Session → XP → Gamification)

1. User starts a session in the mobile app (Stopwatch or Timer mode).
2. User saves the session → `POST /reading-sessions`.
3. Backend (`ReadingSessionService`):
   - Validates `pagesRead ≤ book.pages`.
   - Calculates XP: `pagesRead` (1 XP per page) + 50 bonus if new reading day via `StreakService.recordActivity()`.
   - Saves `ReadingSessionEntity` with `xpGained`.
   - Delegates to `ExperienceService.rewardActivity()` to add XP and recalculate level (formula: level cost = `level × 100`).
   - Triggers `AchievementEvaluator.evaluate()` to check all 16 achievement definitions.
4. Mobile app shows floating "+X XP" animation (`XpFloatingFeedback`).

### B. Book Status Workflow

```bash
TO_READ → READING → COMPLETED (+100 XP, rating required)
                  ↘ DROPPED
COMPLETED → READING (via /books/{id}/reset — resets rating, pagesRead, finishDate)
```

### C. Analytics & DNA Loop

1. Backend (`AnalyticsService` and `StatsService`) aggregates data via SQL projections and group-bys.
2. Mobile fetches `GET /stats/dna`, `GET /analytics/distribution`, `GET /analytics/trends`, `GET /analytics/heatmap`.
3. Mobile renders:
   - **Bento Grid** on Home for Quick Stats.
   - **Charts (Line/Bar/Pie)** in Analytics tab via `react-native-gifted-charts`.
   - **Activity Heatmap** (year view, pages/sessions per day).
   - **Reading DNA:** shareable summary with archetype, genre breakdown, velocity, drop rate.

### D. Goal Progress Tracking

1. User creates annual goal with multi-criteria targets (books, pages, minutes, authors, genres).
2. `GET /reading-goals/{year}/progress` calculates: pace (books/week), projected finish date, on-track status (90% threshold), diversity metrics, micro-victories, motivational insights (Portuguese).
3. Mobile displays progress card on Home and detailed view in Profile.

### E. Device Session Management

1. Each login/register creates a refresh token per `(userId, deviceId)`.
2. Users can view active devices via `GET /auth/sessions/me`.
3. Users can revoke individual device sessions via `DELETE /auth/sessions/{sessionId}`.

---

## 5. Mobile App — Screens & UI

### Auth Stack (`app/(auth)/`)

| Screen  | Features                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------- |
| `login` | Login/register tabs, password strength meter (5 rules), platform-specific date picker, animated tab switching |

### Main Tabs (`app/(tabs)/`)

| Screen         | Features                                                                                                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index` (Home) | Time-based greeting, XP progress ring, streak badge, currently reading carousel, quick stats bento grid, goal progress card, achievements row, pull-to-refresh                                 |
| `library`      | Full-text search (debounced 500ms), category filter pills, sagas carousel (16:9), books grid (2-col, 2:3), status badges, progress bars, FAB menu (Add Book/Saga/Category)                     |
| `session`      | Dual-mode (Stopwatch + Timer), presets (15/30/45/60 min), custom duration, animated timer ring with gradient, book selection bottom sheet, play/pause/save/discard, recent sessions, XP legend |
| `awards`       | 16 achievements in 4 categories, 2-column grid, progress bars, expandable XP legend, earned/unearned visual states                                                                             |
| `profile`      | Hero header with blur + gradient, XP ring around avatar, edit profile modal, account info card, theme preferences (System/Light/Dark), connected devices list with revoke, logout              |

### Modal Screens

| Screen           | Features                                                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `add-book`       | Cover picker (2:3), title/author/pages/ISBN/status, categ-+*ory search+create with color picker, star rating (1-5), notes (1000 char), ISBN validation (10/13) |
| `add-saga`       | Cover picker (16:9), name/description, multi-select book grid (3-col) with checkmarks                                                                          |
| `edit-book/[id]` | All add-book fields pre-populated, reset for re-read option                                                                                                    |
| `edit-saga/[id]` | All add-saga fields pre-populated                                                                                                                              |
| `add-category`   | Category creation with color picker                                                                                                                            |
| `create-goal`    | Annual goal with multi-criteria targets                                                                                                                        |

### Detail Screens

| Screen      | Features                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `book/[id]` | Large cover, title/author/ISBN/status/rating, category tags, progress bar + action button, info cards (dates), notes section, delete |
| `saga/[id]` | Saga cover (2:3), volume count badge, description, horizontal book scroll, delete                                                    |

### Analytics & History

| Screen            | Features                                                                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `analytics`       | Toggle rolling/current period, period filters (7d/30d/6m/1y), summary cards (pages/time/pace), trend charts (pages/time/velocity), distribution breakdown, year heatmap |
| `session-history` | Paginated list of all reading sessions with XP earned                                                                                                                   |

---

## 6. Mobile App — State Management

### Jotai Atoms

| Store   | Atoms                                                                                  |                                                                |
| ------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Auth    | `userAtom` (UserDTO\                                                                   | null), `isLoadingSessionAtom`, `isAuthenticatedAtom` (derived) |
| Session | `pendingSessionBookAtom` (selected book for current session)                           |                                                                |
| Theme   | `themePreferenceAtom` (system/light/dark), `loadThemeAtom` (async loader from storage) |                                                                |

### Key Hooks

| Hook                  | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `useAppTheme()`       | Returns theme mode + colors object, syncs with NativeWind |
| `useProfile()`        | Fetches user profile data                                 |
| `useProfilePicture()` | Handles profile picture upload via image picker           |
| `useColorScheme()`    | Platform-specific color scheme detection                  |

---

## 7. Mobile App — API Services

| Service                 | Key Methods                                                                                                                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authService`           | login, register, fetchMe, hydrateSession, logout                                                                                                                                                |
| `bookService`           | createBook, searchBooks, getAllBooks, getCurrentlyReading, getBookById, resetBookForReread, updateBook, deleteBook                                                                              |
| `sagaService`           | getSagas, createSaga, getSagaById, getSagaBooks, updateSaga, addBookToSaga, removeBookFromSaga, deleteSaga                                                                                      |
| `categoryService`       | getCategories, createCategory                                                                                                                                                                   |
| `readingSessionService` | submitReadingSession, fetchRecentReadingSessions, fetchReadingSessionHistory                                                                                                                    |
| `profileService`        | getStreak, getAchievements, getReadingDna, getGoalProgress, listReadingGoals, createReadingGoal, deleteReadingGoal, getBookAuthors, fetchCurrentUser, getMyDevices, revokeDevice, updateProfile |
| `analyticsService`      | getAnalyticsSummary, getAnalyticsTrends, getAnalyticsDistribution, getAnalyticsHeatmap                                                                                                          |

**API Layer:** Axios instance with JWT interceptor, automatic token refresh, base URL from environment, token stored via Expo Secure Store with device ID.

---

## 8. UI Patterns

- **Glassmorphism:** `expo-blur` for floating cards, gradient overlays on profile header
- **Dark Mode:** NativeWind `dark:` prefix with system/light/dark toggle
- **Color Palette:** Material Design 3 inspired. Primary: #6b38d4 (light) / #A78BFA (dark). Tonal layering (surface, surfaceContainerLow/High)
- **Animations:** Reanimated for micro-animations, pulsing timer ring, floating XP feedback
- **Haptic Feedback:** `expo-haptics` on tab interactions
- **Skeleton Loaders:** Integrated with React Query's `isLoading` states
- **Pull-to-Refresh:** Home screen with data invalidation
- **Empty States:** Helpful messaging with action prompts
