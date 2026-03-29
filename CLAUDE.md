# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MyLibrary** is a gamified personal reading ecosystem combining a Java 21/Spring Boot 4 REST API backend with a React Native/Expo mobile app. The project is organized as a monorepo with clear separation between backend and mobile.

## Backend Architecture

### Module Organization

The backend uses a **domain-driven, module-based structure** where each feature domain is a self-contained package:

```bash
src/main/java/com/gabriel/mylibrary/
├── books/              # Book CRUD, specs for advanced filtering
├── categories/         # Tags/categories for books
├── saga/               # Book series management
├── readingSession/     # Session logging → triggers gamification
├── readingGoal/        # Annual reading targets with progress
├── streak/             # Daily reading habit tracking
├── achievement/        # 16-badge system, auto-evaluated
├── stats/              # Analytics: DNA, heatmap, velocity, year-in-review
├── leaderboard/        # Global top-100 rankings by 5 metrics × 3 periods
├── auth/               # JWT + multi-device refresh tokens
├── user/               # User profiles
├── common/             # Shared exceptions, specs, config
├── LibraryController.java  # Root health check
└── MylibraryApplication.java  # Spring Boot entry point
```

### Layering Pattern

Each module follows **Controller → Service → Repository → Entity** with DTOs:

- **Controller** (`*Controller.java`): HTTP endpoints, request/response serialization
- **Service** (`*Service.java`): Business logic, orchestration
- **Repository** (`*Repository.java`): Spring Data JPA + Specification queries
- **Entity** (`*Entity.java`): JPA-mapped domain objects
- **DTOs** (`dtos/` folder): MapStruct-mapped request/response objects
- **Mappers** (`mappers/` folder): MapStruct mappers (`@Mapper`)
- **Specifications** (`*Specification.java`): Criteria API for dynamic queries

### Key Technologies

| Layer | Tech | Notes |
| --- | --- | --- |
| Language | Java 21 | Virtual Threads, Records, Pattern Matching available |
| Framework | Spring Boot 4.0.5 | Auto-config, DI, AOP |
| ORM | JPA/Hibernate + Criteria API | Dynamic queries via Specifications |
| Mapping | MapStruct 1.6.3 | DTO ↔ Entity with `@Mapper` |
| Security | Spring Security + JJWT 0.11.5 | Bearer token, multi-device refresh |
| Database | PostgreSQL (prod), H2 (dev/test) | Configured via environment vars |
| Build | Maven 3.9+ | Wrapper included (`./mvnw`) |

### Configuration

Environment variables (`.env` file):

```.env
DB_URL=jdbc:postgresql://localhost:5432/mylibrary
DB_USER=postgres
DB_PASS=<password>
JWT_SECRET=<256-bit-key>
```

These are injected via `springboot3-dotenv` into `application.properties`. No hardcoded secrets.

## Development Commands

### Build & Dependencies

```bash
# Build (clean compile + package)
./mvnw clean install

# Skip tests if iterating quickly
./mvnw clean install -DskipTests

# Resolve dependency tree
./mvnw dependency:tree
```

### Running

```bash
# Development mode (hot reload via spring-boot-devtools)
./mvnw spring-boot:run

# Production build (creates target/mylibrary-*.jar)
./mvnw clean package -DskipTests
```

### Testing

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=BookServiceTest

# Run specific test method
./mvnw test -Dtest=BookServiceTest#testFindById
```

### Docker

```bash
# Build multi-stage image
docker build -t mylibrary-api .

# Run with env file
docker run -p 8080:8080 --env-file .env mylibrary-api
```

## Common Development Tasks

### Adding a New Endpoint

1. Create DTOs in `src/main/java/.../feature/dtos/` (request/response)
2. Add MapStruct mapper in `src/main/java/.../feature/mappers/`
3. Implement endpoint in `*Controller.java`
4. Call service method; service orchestrates repository + business logic
5. Test with `api.http` (REST Client for VS Code)

### Advanced Filtering on a Module

Use **Specifications (Criteria API)** for dynamic queries:

- See `BookSpecification.java` as a template
- Build predicates in `*Specification` class
- Call `repository.findAll(specification)` from service
- Controller accepts filter params and builds spec dynamically

### Gamification Triggers

When a `ReadingSession` is created:

- `ReadingSessionService` auto-evaluates **Streak** (currentStreak, bestStreak, totalReadingDays)
- **Achievement Engine** checks all 16 badges (auto-awarded)
- No explicit trigger needed; it's transactional

### Multi-Device JWT Refresh

Each device stores a separate `RefreshToken` entity. On login:

- New `RefreshToken` created per device
- Client stores access + refresh token
- On expiry, refresh endpoint validates `RefreshToken` and issues new access token
- Logout invalidates a specific device's `RefreshToken`

## Important Constraints & Conventions

1. **Multi-tenant isolation**: All queries filtered by `userId` automatically (Spring Security context)
2. **One goal per year**: `ReadingGoal` enforces 1 active goal per year per user (409 Conflict on duplicate)
3. **DTO conversion**: Always map Entity ↔ DTO at controller boundary; services work with entities
4. **JPA transaction scope**: Each service method is `@Transactional` by default; lazy loading safe within method scope
5. **Validation**: Use `@Valid` + `@NotNull`, `@NotBlank`, etc. on DTOs; Jackson respects them

## Testing Notes

- `spring-boot-starter-data-jpa-test`, `spring-boot-starter-security-test`, etc. are in scope
- H2 database is used for testing (auto-configured)
- Tests should focus on service layer and repository contracts
- No integration test infrastructure (Testcontainers) yet — see README roadmap

## Mobile Architecture

React Native + Expo 54 with TypeScript, Reanimated 4 for animations, Expo Router 6 for file-based routing. Separate from backend concerns but communicates via REST API at `http://localhost:8080`.

## API Testing

Use `backend/api.http` (VS Code REST Client extension) or Postman collection in `backend/postman/` to test endpoints. Base URL: `http://localhost:8080`, authentication: `Authorization: Bearer <token>`.

## Deployment

- **Docker**: Multi-stage Dockerfile optimizes build cache. See `backend/Dockerfile`
- **Database migrations**: Currently using `spring.jpa.hibernate.ddl-auto=update` (see roadmap for Flyway)
- **Logs**: Configured to `app.log` on disk

## Notes for Future Instances

- This is an actively developed personal project with a clear roadmap
- Core gamification engine (streaks, achievements, leaderboard) is complete and stable
- Mobile app UI is still a work-in-progress
- Focus areas from README: push notifications, Flyway migrations, integration tests, Redis caching, Swagger/OpenAPI docs
