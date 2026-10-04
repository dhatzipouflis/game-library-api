# 🎮 Game Library API

[![CI](https://github.com/dhatzipouflis/game-library-api/actions/workflows/ci.yml/badge.svg)](https://github.com/dhatzipouflis/game-library-api/actions/workflows/ci.yml)

A NestJS backend for managing a global video-game catalog, personal user libraries, live PC game deals, and automated price-drop alerts.

The project started as a CRUD API and has progressively evolved into a more realistic backend system with authentication, role-based authorization, external API integrations, background scheduling, email notifications, database migrations, automated testing, CI, and a one-command local development bootstrap.

---

## ✨ Features

### 🔐 Authentication & Authorization

- User registration
- Login with either username or email
- JWT Bearer authentication
- Password hashing with bcrypt
- `USER` and `ADMIN` roles
- Role-based authorization through NestJS guards and decorators
- Admin-only catalog management and RAWG import operations
- Local admin account automatically created by the development seed

### 🎮 Global Game Catalog

`Game` represents the shared catalog of games available in the application.

Authenticated users can:

- list catalog games
- retrieve a game by ID

Admins can additionally:

- create catalog games manually
- update catalog games
- delete catalog games
- import games from RAWG

The catalog is persisted in PostgreSQL through TypeORM.

### 📚 Personal Game Library

Users can add existing catalog games to their personal library.

The relationship is modeled explicitly through the `UserGame` entity:

```text
User 1 ─────< UserGame >───── 1 Game
```

Features include:

- view the current user's library
- add a catalog game
- remove a game
- prevent duplicate `(userId, gameId)` entries
- automatically remove related library entries when a user or game is deleted

### 🌐 RAWG Integration

RAWG is used as the external metadata provider for the global game catalog.

Admins can:

- search RAWG by game title
- import a RAWG game into the local catalog

Imported metadata includes:

- RAWG ID
- title
- primary genre
- primary platform
- release date
- image URL
- Metacritic score

The RAWG response is mapped into the application's own domain model before persistence.

Imported RAWG IDs are unique, preventing the same RAWG game from being imported twice.

### 💰 CheapShark Integration

CheapShark provides live PC game pricing and deals.

Authenticated users can:

- search CheapShark by title
- request live deals for a game already present in the local catalog

For local catalog deal lookups, the application:

1. loads the local game
2. searches CheapShark using its title
3. prefers an exact case-insensitive title match
4. falls back to the first CheapShark result
5. loads game details and store information
6. maps store IDs to readable store names
7. converts prices to numbers
8. sorts deals from cheapest to most expensive

Returned deal information includes:

- store
- current price
- retail price
- savings percentage
- CheapShark redirect URL
- Steam App ID when available
- historical cheapest price

CheapShark pricing is fetched live and is intentionally **not persisted** because it is volatile.

### 🔔 Price Drop Alerts

Users can create price alerts for games that already exist in their personal library.

Each alert stores:

- user
- game
- target price
- active state
- triggered state
- last notified price
- last checked timestamp

The background monitor runs **every hour**.

```text
Active alerts
     ↓
Group by game
     ↓
Fetch live CheapShark deals once per unique game
     ↓
Select cheapest deal
     ↓
Compare current price with each user's target
     ↓
Send email when notification rules are satisfied
```

Notification behavior:

- an email is sent when the current price is at or below the target
- the same price does not generate duplicate notifications
- a further price drop can trigger another email
- if the price rises above the target, the alert is re-armed
- changing the target price also re-arms the alert

Admins can manually trigger the monitor through an API endpoint for development/testing.

### 📧 Email Notifications

Email delivery is implemented with Nodemailer over SMTP.

For local development, Mailpit provides a safe local SMTP server and browser inbox:

- SMTP: `localhost:1025`
- Mailpit UI: `http://localhost:8025`

The email service also supports optional SMTP username/password credentials for a real SMTP provider.

### ✅ Validation & Error Handling

The API uses a global `ValidationPipe` with:

- `whitelist: true`
- `forbidNonWhitelisted: true`
- `transform: true`

A global exception filter returns a consistent error shape:

```json
{
  "statusCode": 404,
  "message": "Game with id 999 was not found",
  "path": "/games/999",
  "timestamp": "2026-10-04T18:00:00.000Z"
}
```

Unexpected exceptions are logged and exposed as a generic `500 Internal server error`.

---

## 🛠️ Tech Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js 24+ |
| Language | TypeScript 6 |
| Framework | NestJS 12 |
| Database | PostgreSQL 17 |
| ORM | TypeORM |
| Authentication | JWT / Passport |
| Password hashing | bcrypt |
| Validation | class-validator / class-transformer |
| HTTP integrations | `@nestjs/axios` / Axios |
| Game metadata | RAWG API |
| Game deals | CheapShark API |
| Scheduling | `@nestjs/schedule` |
| Email | Nodemailer |
| Local SMTP | Mailpit |
| API documentation | Swagger / OpenAPI |
| Testing | Vitest |
| Coverage | V8 |
| Linting | Oxlint |
| Formatting | Prettier |
| Containerization | Docker / Docker Compose |
| CI | GitHub Actions |

The project uses native ESM (`"type": "module"`) and TypeScript `NodeNext` module resolution.

---

## 🏗️ Project Structure

```text
game-library-api/
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── scripts/
│   └── setup-local.mjs
│
├── src/
│   ├── auth/
│   │   ├── decorators/
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── users/
│   │   ├── entities/
│   │   ├── enums/
│   │   ├── repositories/
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   │
│   ├── games/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── interfaces/
│   │   ├── repositories/
│   │   ├── games.controller.ts
│   │   ├── games.service.ts
│   │   └── games.module.ts
│   │
│   ├── user-games/
│   │   ├── entities/
│   │   ├── repositories/
│   │   ├── user-games.controller.ts
│   │   ├── user-games.service.ts
│   │   └── user-games.module.ts
│   │
│   ├── integrations/
│   │   ├── rawg/
│   │   │   ├── interfaces/
│   │   │   ├── rawg.controller.ts
│   │   │   ├── rawg.service.ts
│   │   │   ├── rawg-import.service.ts
│   │   │   └── rawg.module.ts
│   │   │
│   │   └── cheapshark/
│   │       ├── interfaces/
│   │       ├── cheapshark.controller.ts
│   │       ├── cheapshark.service.ts
│   │       ├── game-deals.controller.ts
│   │       ├── game-deals.service.ts
│   │       └── cheapshark.module.ts
│   │
│   ├── price-alerts/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── repositories/
│   │   ├── price-alerts.controller.ts
│   │   ├── price-alerts.service.ts
│   │   ├── price-alert-monitor.service.ts
│   │   └── price-alerts.module.ts
│   │
│   ├── email/
│   │   ├── email.service.ts
│   │   └── email.module.ts
│   │
│   ├── common/
│   │   └── filters/
│   │
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── data-source.ts
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── test/
├── .env.example
├── .nvmrc
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 🧠 Domain Model

```text
┌──────────┐
│   User   │
└────┬─────┘
     │
     ├──────────────< UserGame >──────────────┐
     │                                        │
     │                                        ▼
     │                                    ┌───────┐
     │                                    │ Game  │
     │                                    └───┬───┘
     │                                        │
     └────────────< PriceAlert >───────────────┘
```

### `User`

Stores:

- username
- unique email
- password hash
- role
- creation timestamp

New users are created with the `USER` role by default.

### `Game`

Stores:

- title
- genre
- optional platform
- optional RAWG ID
- optional image URL
- optional release date
- optional Metacritic score
- creation timestamp

Both `title` and `rawgId` are unique when present.

### `UserGame`

Represents ownership of a catalog game inside a user's personal library.

The `(userId, gameId)` pair is unique.

### `PriceAlert`

Represents one user's target price for one game.

The `(userId, gameId)` pair is unique.

---

## 🔐 Roles & Permissions

| Operation | USER | ADMIN |
| --- | :---: | :---: |
| Register / login | ✅ | ✅ |
| Browse catalog | ✅ | ✅ |
| View game details | ✅ | ✅ |
| Add/remove games from own library | ✅ | ✅ |
| Search CheapShark | ✅ | ✅ |
| View live deals | ✅ | ✅ |
| Manage own price alerts | ✅ | ✅ |
| Create catalog games | ❌ | ✅ |
| Update catalog games | ❌ | ✅ |
| Delete catalog games | ❌ | ✅ |
| Search RAWG | ❌ | ✅ |
| Import RAWG games | ❌ | ✅ |
| Manually run all price alerts | ❌ | ✅ |

---

## 📡 API Endpoints

Except for registration and login, the API routes below require JWT authentication.

### Authentication

```http
POST /auth/register
POST /auth/login
```

Login accepts either username or email through the `identifier` field.

Example:

```json
{
  "identifier": "admin@gamelibrary.local",
  "password": "LocalAdmin123!"
}
```

### Global Game Catalog

```http
GET    /games
GET    /games/:id
POST   /games
PATCH  /games/:id
DELETE /games/:id
```

`POST`, `PATCH`, and `DELETE` require the `ADMIN` role.

`GET /games` currently returns catalog games ordered by ID ascending:

```json
{
  "data": [],
  "meta": {
    "total": 0
  }
}
```

### Personal Library

```http
GET    /library
POST   /library/:gameId
DELETE /library/:gameId
```

The authenticated user is taken from the JWT; no user ID is accepted from the client.

### RAWG Integration

```http
GET  /integrations/rawg/games?search=Elden%20Ring
POST /integrations/rawg/games/:rawgId/import
```

Both endpoints require the `ADMIN` role.

RAWG search currently requests up to 10 results from the provider.

### CheapShark Integration

```http
GET /integrations/cheapshark/games?title=Elden%20Ring
GET /games/:id/deals
```

CheapShark prices are returned in USD.

### Price Alerts

```http
GET    /price-alerts
PUT    /price-alerts/:gameId
DELETE /price-alerts/:gameId
POST   /price-alerts/check-now
```

Create or update an alert:

```json
{
  "targetPrice": 29.99
}
```

`targetPrice` must be greater than or equal to `0.01` and may contain at most two decimal places.

`POST /price-alerts/check-now` is admin-only.

---

## 📖 Swagger

Swagger/OpenAPI documentation is available at:

```text
http://localhost:3000/api
```

In non-production environments the application automatically opens Swagger after startup.

Protected routes can be tested from Swagger using the **Authorize** button and a JWT Bearer token.

---

## 🚀 Local Development

### Prerequisites

Install:

- Git
- Node.js 24+
- npm
- Docker
- Docker Compose

The repository includes an `.nvmrc`, so with `nvm`:

```bash
nvm use
```

### 1. Clone the repository

```bash
git clone https://github.com/dhatzipouflis/game-library-api.git
cd game-library-api
```

### 2. Run the local bootstrap

```bash
npm run setup:local
```

The bootstrap script:

1. verifies Node.js 24+
2. verifies Docker and Docker Compose
3. creates `.env` from `.env.example` if `.env` does not exist
4. runs `npm ci`
5. starts PostgreSQL and Mailpit
6. waits until PostgreSQL is ready
7. runs all TypeORM migrations
8. creates or updates the local admin account

If an `.env` file already exists, it is preserved.

### 3. Configure RAWG

The generated `.env` contains:

```env
RAWG_API_KEY=replace_with_your_rawg_api_key
```

Replace it with a valid RAWG API key before using the RAWG endpoints.

The rest of the application can still be developed locally with the provided environment template.

### 4. Start the API

```bash
npm run start:dev
```

Local services:

| Service | Address |
| --- | --- |
| API | `http://localhost:3000` |
| Swagger | `http://localhost:3000/api` |
| PostgreSQL | `localhost:5432` |
| Mailpit SMTP | `localhost:1025` |
| Mailpit inbox | `http://localhost:8025` |

### Default Local Admin

`.env.example` contains development-only admin credentials:

```env
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_EMAIL=admin@gamelibrary.local
SEED_ADMIN_PASSWORD=LocalAdmin123!
```

The seed is safe to run repeatedly. If the configured admin already exists, its role is set to `ADMIN` and its password is updated to the configured seed password.

> These credentials are for local development only. Do not use them in a real environment.

### Reset the Local Database

To remove the PostgreSQL volume and start with a clean database:

```bash
docker compose down -v
npm run setup:local
```

---

## ⚙️ Environment Variables

| Variable | Purpose | Local example |
| --- | --- | --- |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | PostgreSQL username | `gamelibrary` |
| `DB_PASSWORD` | PostgreSQL password | `gamelibrary` |
| `DB_NAME` | PostgreSQL database | `gamelibrary` |
| `PORT` | API port | `3000` |
| `NODE_ENV` | Runtime environment | `development` |
| `JWT_SECRET` | JWT signing secret | local placeholder |
| `JWT_EXPIRES_IN_SECONDS` | JWT lifetime | `3600` |
| `RAWG_API_KEY` | RAWG authentication key | user supplied |
| `RAWG_BASE_URL` | RAWG API base URL | `https://api.rawg.io/api` |
| `CHEAPSHARK_BASE_URL` | CheapShark API base URL | `https://www.cheapshark.com/api/1.0` |
| `CHEAPSHARK_USER_AGENT` | User-Agent sent to CheapShark | `GameLibraryAPI/1.0` |
| `SMTP_HOST` | SMTP host | `localhost` |
| `SMTP_PORT` | SMTP port | `1025` |
| `SMTP_SECURE` | Enable secure SMTP transport | `false` |
| `EMAIL_FROM` | Email sender | `Game Library <no-reply@gamelibrary.local>` |
| `SMTP_USER` | Optional SMTP username | not required by Mailpit |
| `SMTP_PASS` | Optional SMTP password | not required by Mailpit |
| `SEED_ADMIN_USERNAME` | Local admin username | `admin` |
| `SEED_ADMIN_EMAIL` | Local admin email | `admin@gamelibrary.local` |
| `SEED_ADMIN_PASSWORD` | Local admin password | development-only value |

Never commit real secrets. `.env` and local environment override files are ignored by Git.

---

## 🐳 Docker

Docker Compose currently runs the local infrastructure only:

```text
Docker Compose
├── PostgreSQL 17
└── Mailpit
```

The NestJS API itself runs on the host through:

```bash
npm run start:dev
```

PostgreSQL includes a Docker healthcheck using `pg_isready`.

---

## 🗄️ Database & Migrations

TypeORM schema synchronization is disabled:

```text
synchronize: false
```

Schema changes are managed explicitly through migrations.

Current migration history includes:

- initial `User`, `Game`, and `UserGame` schema
- RAWG metadata fields on `Game`
- `PriceAlert` table and relations

Commands:

```bash
npm run migration:generate -- src/database/migrations/MigrationName
npm run migration:run
npm run migration:revert
```

Generated migrations should always be reviewed before execution.

### Local Admin Seed

The development admin can also be seeded manually:

```bash
npm run seed:admin
```

This command builds the project first and then runs the compiled seed.

---

## 🧪 Testing

The main automated test suite uses Vitest.

Run tests once:

```bash
npm test -- --run
```

Run in watch mode:

```bash
npm run test:watch
```

Run coverage:

```bash
npm run test:coverage
```

Coverage uses the V8 provider and includes services, guards, strategies, and exception filters.

Minimum CI thresholds:

| Metric | Threshold |
| --- | ---: |
| Lines | 75% |
| Functions | 75% |
| Branches | 75% |
| Statements | 75% |

The unit tests mock external systems rather than making real calls to RAWG, CheapShark, SMTP, or the database.

Covered areas include:

- authentication
- password hashing/login behavior
- JWT strategy
- JWT guard
- role guard
- users service
- games service
- personal library service
- RAWG service
- RAWG import mapping
- CheapShark service
- local game deal orchestration
- price alert management
- scheduled price alert behavior
- duplicate notification prevention
- email service
- global exception filter

A starter E2E scaffold/configuration also exists in the repository, but comprehensive end-to-end API coverage remains future work.

---

## 🔄 Continuous Integration

GitHub Actions runs CI on:

- pushes to `main`
- pushes to `feature/**`
- pull requests targeting `main`

The pipeline uses Node.js 24 and PostgreSQL 17.

```text
Checkout
   ↓
npm ci
   ↓
Lint
   ↓
Build
   ↓
Run migrations
   ↓
Unit tests + coverage
   ↓
PR coverage report / HTML coverage artifact
```

The CI workflow:

- starts a PostgreSQL service container
- waits for PostgreSQL health
- runs Oxlint
- builds the NestJS application
- applies TypeORM migrations
- executes the coverage suite
- posts coverage information on pull requests
- uploads the generated coverage report as a workflow artifact

---

## 🧩 Architecture & Design Decisions

### Feature-Based NestJS Modules

The codebase is split by application capability rather than by technical layer alone.

Examples:

- `AuthModule`
- `GamesModule`
- `UserGamesModule`
- `RawgModule`
- `CheapSharkModule`
- `PriceAlertsModule`
- `EmailModule`

### Repository Abstractions

Database operations are wrapped behind repository contracts and injection tokens.

This keeps business services focused on application rules and makes them straightforward to unit test with mocks.

### External APIs Are Not Domain Models

RAWG and CheapShark have provider-specific interfaces and services.

Their response structures are mapped before being used by the rest of the application.

### Live vs Persistent External Data

RAWG metadata can be explicitly imported into the catalog and persisted.

CheapShark pricing remains live and is not stored as catalog state.

### User Identity Comes From JWT

Personal library and price-alert operations derive the user ID from the authenticated token rather than accepting it from the request body.

### Scheduled Work Reuses Application Services

The price monitor reuses the same deal orchestration used by the HTTP API and groups alerts by unique game before making external requests.

### Explicit Error Boundary

External provider failures are converted into `502 Bad Gateway` responses, while the global exception filter provides a consistent application-level error contract.

---

## 🔁 NestJS ↔ .NET Concept Mapping

| NestJS / Node.js | Comparable .NET concept |
| --- | --- |
| Controller | ASP.NET Core Controller |
| Provider / Service | Application Service |
| Dependency Injection | Built-in .NET DI |
| Repository contract | Repository interface |
| Injection token | DI service registration |
| TypeORM Entity | EF Core Entity |
| TypeORM Migration | EF Core Migration |
| ConfigService | `IConfiguration` / Options |
| Guard | Authorization policy / middleware |
| Exception Filter | Exception filter / middleware |
| `HttpService` | `HttpClient` |
| `@Cron()` scheduled service | `BackgroundService` / hosted service |
| DTO validation decorators | Data Annotations / FluentValidation-style validation |

---

## 🔄 Example Application Flow

A typical end-to-end local flow is:

```text
1. Login as seeded admin
        ↓
2. Search RAWG
        ↓
3. Import a game into the global catalog
        ↓
4. Login/register as a normal user
        ↓
5. Add that catalog game to the user's library
        ↓
6. View live CheapShark deals
        ↓
7. Create a target-price alert
        ↓
8. Hourly scheduler checks prices
        ↓
9. Price reaches target
        ↓
10. Email appears in Mailpit
```

For local testing, an admin can trigger step 8 immediately:

```http
POST /price-alerts/check-now
```

---

## 📜 Useful npm Scripts

| Command | Purpose |
| --- | --- |
| `npm run setup:local` | Bootstrap a fresh local environment |
| `npm run start:dev` | Start NestJS in watch mode |
| `npm run start:debug` | Start in debug/watch mode |
| `npm run build` | Compile the application |
| `npm run start:prod` | Run the compiled application |
| `npm run lint` | Run Oxlint |
| `npm run format` | Format source/tests with Prettier |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run migration:generate -- ...` | Generate a TypeORM migration |
| `npm run migration:run` | Apply migrations |
| `npm run migration:revert` | Revert the latest migration |
| `npm run seed:admin` | Create/update the local admin |

---

## 🛣️ Possible Future Improvements

- email verification
- forgot/reset-password flow
- Redis caching for external API responses
- BullMQ-based background jobs and email processing
- application health checks
- structured logging, tracing, and observability
- API rate limiting
- comprehensive integration and end-to-end tests
- Dockerize the NestJS API itself
- Kafka-based asynchronous integration events

---

## 🙏 External Services

This project integrates with:

- **RAWG Video Games Database** for game metadata
- **CheapShark** for live PC game deals
- **Mailpit** for local email testing

---

## 📌 Project Goal

The goal of the project is to progressively evolve a simple CRUD backend into a realistic, testable backend application while practicing production-oriented concepts across the NestJS ecosystem:

- modular architecture
- authentication and authorization
- relational data modeling
- repository abstractions
- schema migrations
- external service integrations
- scheduled background processing
- email notifications
- error handling
- automated testing
- CI
- reproducible local development
