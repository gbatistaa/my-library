# My Library — System Architecture & Implementation Overview

## 1. Technical Stack

### Backend (Java/Spring Boot)

- **Runtime:** Java 21 LTS
- **Framework:** Spring Boot 4
- **ORM:** JPA / Hibernate 6
- **Database:** PostgreSQL (Managed)
- **Security:** Standard JWT + Refresh Token logic.
- **DTO Mapping:** MapStruct for efficient Entity-to-DTO conversion.
- **Project Structure:** Layered pattern (`Controller` → `Service` → `Repository` → `Entity`).

### Frontend (React Native/Expo)

- **Framework:** Expo SDK 54 (Managed Workflow)
- **Routing:** Expo Router (File-based navigation).
- **Styling:** Tailwind CSS via **NativeWind**.
- **State Management:** **Jotai** (Atom-based global state) and **TanStack Query** (v5) for server state/caching.
- **Icons/UI:** Lucide Icons, Expo Blur (Glassmorphism), Reanimated for micro-animations.

---

## 2. Complete Domain Map (Entities, Services, Controllers, and Repositories)

The backend is structured into domain packages. Here is the exhaustive list of modules to provide complete context:

### 1. User (`com.gabriel.mylibrary.user`)

- **Entities:** `UserEntity` (Core user data, profile, XP, level)
- **Services:** `UserService` (Manages user profiles and state)
- **Repositories:** `UserRepository`
- **Controllers:** `UserController`
- **Projections:** `UserSummary`, `UserProfileProjection`

### 2. Auth & Tokens (`com.gabriel.mylibrary.auth`)

- **Entities:** `RefreshTokenEntity` (Tracks active refresh tokens)
- **Services:** `AuthService` (Login/Register logic), `JwtService` (Token generation), `RefreshTokenService`
- **Repositories:** `RefreshTokenRepository`
- **Controllers:** `AuthController`, `RefreshTokenController`
- **Security:** `JwtAuthenticationFilter`, `SecurityConfig`

### 3. Books (`com.gabriel.mylibrary.books`)

- **Entities:** `BookEntity` (Title, Author, Genre, Page Count, Status)
- **Services:** `BookService` (Book lifecycle and searches)
- **Repositories:** `BookRepository`, `BookSpecification` (for dynamic filtering)
- **Controllers:** `BookController`
- **Projections:** `BookSummary`, `BookReadingProjection`

### 4. Reading Session (`com.gabriel.mylibrary.readingSession`)

- **Entities:** `ReadingSessionEntity` (Records reading activity: pages read, time, XP gained on a date)
- **Services:** `ReadingSessionService` (Calculates XP, interacts with StreakService, saves sessions)
- **Repositories:** `ReadingSessionRepository`
- **Controllers:** `ReadingSessionController`

### 5. Achievement (`com.gabriel.mylibrary.achievement`)

- **Entities:** `AchievementEntity` (Badge definitions), `UserAchievementEntity` (User-specific unlocks)
- **Services:** `AchievementService`, `AchievementEvaluator` (Evaluates criteria after sessions)
- **Repositories:** `UserAchievementRepository`
- **Controllers:** `AchievementController`

### 6. Gamification / Experience (`com.gabriel.mylibrary.gamification`)

- **Services:** `ExperienceService` (Centralized engine calculating levels. Formula: Level = sqrt(XP) * constant)

### 7. Streak (`com.gabriel.mylibrary.streak`)

- **Entities:** `StreakEntity` (Tracks consecutive active reading days)
- **Services:** `StreakService` (Evaluates streak extensions and provides daily bonuses)
- **Repositories:** `StreakRepository`
- **Controllers:** `StreakController`

### 8. Reading Goal (`com.gabriel.mylibrary.readingGoal`)

- **Entities:** `ReadingGoalEntity` (User-set goals for reading targets over time)
- **Services:** `ReadingGoalService`
- **Repositories:** `ReadingGoalRepository`
- **Controllers:** `ReadingGoalController`

### 9. Categories (`com.gabriel.mylibrary.categories`)

- **Entities:** `CategoryEntity` (Custom user-defined groupings for books)
- **Services:** `CategoryService`
- **Repositories:** `CategoryRepository`
- **Controllers:** `CategoryController`

### 10. Saga (`com.gabriel.mylibrary.saga`)

- **Entities:** `SagaEntity` (Groupings of books belonging to a series/saga)
- **Services:** `SagaService`
- **Repositories:** `SagaRepository`
- **Controllers:** `SagaController`

### 11. Analytics (`com.gabriel.mylibrary.analytics`)

- *(No Entities - Aggregates data)*
- **Services:** `AnalyticsService` (Provides data for trends, daily aggregates)
- **Controllers:** `AnalyticsController`
- **DTOs:** `DailySessionAggDTO`, `AnalyticsTrendDTO`, `AnalyticsDistributionDTO`

### 12. Stats (`com.gabriel.mylibrary.stats`)

- *(No Entities - Aggregates data)*
- **Services:** `StatsService` (Generates viral shareable data like "Reading DNA" and "Year in Review")
- **Controllers:** `StatsController`
- **DTOs:** `ReadingDnaDTO`, `YearInReviewDTO`, `HeatmapDTO`, `GenreShareDTO`, `VelocityDTO`

---

## 3. Key Feature Flows

### A. The Reading Loop (Session -> XP -> Gamification)

1. User starts a session in the mobile app (Timer).
2. User saves the session → `POST /api/sessions`.
3. Backend (`ReadingSessionService`):
   - Calculates base XP (1 XP = 1 Page).
   - Checks if it's a new day via `StreakService` → Awards 50 Bonus XP if true.
   - Saves `ReadingSessionEntity` with `xpGained`.
   - Delegates to User Service to add `xp` and re-calculate level.
   - Triggers `AchievementEvaluator` asynchronously to check if the session unlocked any new badges (e.g., Marathoner, Streak Multipliers).

### B. Analytics & DNA Loop

1. Backend (`AnalyticsService` and `StatsService`) aggregates data via SQL projections and group-bys (Genres, Languages, Velocity).
2. Frontend fetches `GET /api/stats/dna` or `GET /api/analytics/distribution`.
3. Mobile App renders:
   - **Bento Grid** on Home for Quick Stats.
   - **Charts (Line/Bar/Pie)** in Analytics tab using `react-native-gifted-charts`.
   - **Reading DNA:** A shareable summary screen generated for social media via `react-native-view-shot`.

### C. Gamification Logic

- **Achievements:** Constantly evaluated on user actions. `AchievementEvaluator` checks specific rules based on category (Volume, Diversity, Velocity).
- **XP / Leveling:** `ExperienceService` ensures the leveling curve is progressive. The Mobile App displays a glowing progress ring around the user's avatar calculated as `(currentXP - levelStartXP) / (levelEndXP - levelStartXP)`.

---

## 4. UI Patterns & Best Practices

- **Glassmorphism:** Leveraging `expo-blur` for floating cards over animated backgrounds.
- **Dark Mode:** Native implementation via NativeWind `dark:` prefix.
- **Skeleton Loaders:** Integrated smoothly with React Query's `isLoading` states.
- **DTO Mapping:** MapStruct guarantees all external APIs are clean and secure from internal Entity exposure.
