# 🎮 Game Library API

A backend API for managing a global video-game catalog, personal user libraries, live game deals, and automated price-drop alerts.

Built with **NestJS, TypeScript, TypeORM, PostgreSQL, Docker, JWT authentication, RAWG, CheapShark, scheduled jobs, and email notifications**.

The project is also a hands-on exploration of the Node.js / NestJS ecosystem, applying backend concepts that map naturally to ASP.NET Core and enterprise backend development.

---

## ✨ Features

### Authentication & Authorization

- User registration and login
- Login with username or email
- JWT authentication
- Password hashing with bcrypt
- Role-based access control
- `USER` and `ADMIN` roles
- Admin-only catalog and integration operations

### Global Game Catalog

- Authenticated users can browse the global game catalog
- Admins can create, update, and delete games
- TypeORM persistence with PostgreSQL
- Database migrations
- Repository abstraction with dependency injection tokens

### Personal Game Library

- Users can add existing catalog games to their personal library
- Users can remove games from their library
- Explicit `UserGame` relation between users and games
- Duplicate library entries are prevented
- Admin users can also maintain their own personal library

### RAWG Integration

- Search games through the RAWG Video Games Database API
- Admin-only game import
- External RAWG responses are mapped into the application's own domain model
- Imported metadata includes title, genre, platform, release date, Metacritic score, and image URL
- `rawgId` is stored to prevent duplicate imports

### CheapShark Integration

- Search CheapShark games
- Retrieve live game deals from multiple stores
- Map store IDs to readable store names
- Sort deals by lowest price
- Return retail price, savings percentage, and redirect URL
- Pricing data is fetched live instead of being persisted in the database

### Price Drop Alerts

- Users can create a price alert for games in their personal library
- Alerts store a user-defined target price
- Scheduled background job checks active alerts every hour
- CheapShark is queried once per unique game instead of once per user alert
- Email notification is sent when the current price reaches the target
- Duplicate notifications at the same price are prevented
- A new notification can be sent if the price drops further
- Alerts are re-armed if the price rises above the target again
- Admins can manually trigger an alert check for testing

### Email

- SMTP-based email service using Nodemailer
- Local email testing through Mailpit
- SMTP configuration is environment-based and can later be replaced by a real email provider

### API Quality

- Swagger / OpenAPI documentation
- DTO-based request validation
- Global validation pipeline
- Centralized exception handling
- Environment-based configuration
- External API timeout/error handling
- Consistent REST-style responses

### Testing & CI

- Unit testing with Vitest
- Mocked repositories and external HTTP dependencies
- Tests for authentication, JWT, RBAC, game catalog logic, personal libraries, RAWG, CheapShark, price alerts, scheduled monitoring, duplicate notification prevention, and email
- Coverage thresholds enforced in CI
- GitHub Actions pipeline for linting, building, migrations, tests, and coverage reporting

---

## 🛠️ Tech Stack

| Area              | Technology                          |
| ----------------- | ----------------------------------- |
| Runtime           | Node.js                             |
| Language          | TypeScript                          |
| Framework         | NestJS                              |
| Database          | PostgreSQL                          |
| ORM               | TypeORM                             |
| Authentication    | JWT / Passport / bcrypt             |
| Validation        | class-validator / class-transformer |
| HTTP Integrations | `@nestjs/axios` / Axios             |
| Game Metadata     | RAWG API                            |
| Game Deals        | CheapShark API                      |
| Scheduling        | `@nestjs/schedule`                  |
| Email             | Nodemailer                          |
| Local SMTP        | Mailpit                             |
| API Documentation | Swagger / OpenAPI                   |
| Testing           | Vitest                              |
| Containerization  | Docker / Docker Compose             |
| CI                | GitHub Actions                      |

---

## 🏗️ Architecture

The application follows a feature-based modular structure.

```text
src/
├── auth/
├── users/
├── games/
├── user-games/
├── integrations/
│   ├── rawg/
│   └── cheapshark/
├── price-alerts/
├── email/
├── common/
├── database/
├── app.module.ts
└── main.ts
```

### Domain Model

```text
User
 │
 ├───────────────< UserGame >───────────────┐
 │                                           │
 │                                           ▼
 │                                         Game
 │                                           │
 └──────────────< PriceAlert >───────────────┘
```

`Game` represents the **global catalog**.

`UserGame` represents a game that a specific user has added to their **personal library**.

A game is stored once in the global catalog and can belong to many user libraries.

---

## 🌐 External Integrations

### RAWG

RAWG is used as the metadata provider for the global game catalog.

```text
Admin
  ↓
RAWG Search
  ↓
RAWG Game
  ↓
Mapping Layer
  ↓
Game Domain Model
  ↓
PostgreSQL
```

RAWG data is not exposed directly as the application's domain model. External API responses are mapped before being persisted.

A RAWG API key is required.

### CheapShark

CheapShark is used for live PC game pricing and deals.

```text
Local Game
   ↓
Game title
   ↓
CheapShark
   ↓
Live deals
   ↓
Store / price / savings / deal link
```

Deal data is intentionally fetched live rather than stored permanently because pricing is volatile.

---

## 🔔 Price Alert Flow

```text
User adds game to personal library
                ↓
User creates target price alert
                ↓
        PriceAlert persisted
                ↓
       Scheduled hourly check
                ↓
          CheapShark API
                ↓
     Current price <= target?
          ┌─────┴─────┐
          │           │
         No          Yes
          │           │
          │        Send email
          │           │
          └──────> Save alert state
```

The monitor groups alerts by game so multiple users tracking the same title do not cause duplicate CheapShark requests.

---

## 🔐 Roles

### USER

A normal authenticated user can:

- browse the global catalog
- maintain a personal game library
- view live CheapShark deals
- create and manage price alerts

### ADMIN

An admin can perform all normal user operations plus:

- create, update, and delete catalog games
- search and import games through RAWG
- manually trigger the price-alert monitor

---

## 📡 Main API Endpoints

### Authentication

```http
POST /auth/register
POST /auth/login
```

### Global Catalog

```http
GET    /games
GET    /games/:id
POST   /games
PATCH  /games/:id
DELETE /games/:id
```

`POST`, `PATCH`, and `DELETE` are admin-only.

### Personal Library

```http
GET    /library
POST   /library/:gameId
DELETE /library/:gameId
```

### RAWG

```http
GET  /integrations/rawg/games?search=Elden%20Ring
POST /integrations/rawg/games/:rawgId/import
```

RAWG integration endpoints are admin-only.

### CheapShark

```http
GET /integrations/cheapshark/games?title=Elden%20Ring
GET /games/:id/deals
```

### Price Alerts

```http
GET    /price-alerts
PUT    /price-alerts/:gameId
DELETE /price-alerts/:gameId
POST   /price-alerts/check-now
```

`POST /price-alerts/check-now` is admin-only.

---

## 📖 Swagger

When the application is running, Swagger documentation is available at:

```text
http://localhost:3000/api
```

JWT-protected routes can be tested directly through Swagger using the **Authorize** button.

---

## 📧 Local Email Testing

Mailpit is used during local development.

SMTP:

```text
localhost:1025
```

Mailpit inbox:

```text
http://localhost:8025
```

No real emails are sent when using the local Mailpit configuration.

---

## 🚀 Local Development

### Prerequisites

Make sure the following are installed:

- Node.js 24+
- npm
- Docker
- Docker Compose
- Git

If you use `nvm`:

````bash
nvm use

## ⚙️ Environment Variables

Example:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=gamelibrary
DB_PASSWORD=gamelibrary
DB_NAME=gamelibrary

PORT=3000
NODE_ENV=development

JWT_SECRET=replace_with_a_local_secret
JWT_EXPIRES_IN_SECONDS=3600

RAWG_API_KEY=your_rawg_api_key
RAWG_BASE_URL=https://api.rawg.io/api

CHEAPSHARK_BASE_URL=https://www.cheapshark.com/api/1.0
CHEAPSHARK_USER_AGENT=GameLibraryAPI/1.0

SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
EMAIL_FROM=Game Library <no-reply@gamelibrary.local>
````

Secrets must not be committed to Git. Use `.env.example` as the template and keep `.env` ignored.

---

## 🗄️ Database Migrations

TypeORM migrations are used instead of automatic schema synchronization.

```bash
npm run migration:generate -- src/database/migrations/MigrationName
npm run migration:run
npm run migration:revert
```

Generated migrations should always be reviewed before being executed.

---

## 🧪 Testing

Run all tests:

```bash
npm test -- --run
```

Run coverage:

```bash
npm run test:coverage
```

The project uses mocked dependencies in unit tests, so CI does not need to call RAWG, CheapShark, Mailpit, or a real SMTP provider.

---

## 🔄 CI

GitHub Actions validates changes through:

```text
Install dependencies
        ↓
Lint
        ↓
Build
        ↓
Run database migrations
        ↓
Unit tests + coverage
        ↓
Coverage report
```

Coverage thresholds are enforced to prevent untested changes from being merged.

---

## 💡 Backend Concepts Practiced

| NestJS / Node.js       | Comparable .NET concept           |
| ---------------------- | --------------------------------- |
| Controller             | ASP.NET Core Controller           |
| Provider / Service     | Application Service               |
| Dependency Injection   | Built-in .NET DI                  |
| Repository abstraction | Repository + interface            |
| Injection token        | Interface/service registration    |
| TypeORM Entity         | EF Core Entity                    |
| TypeORM Migration      | EF Core Migration                 |
| ConfigService          | `IConfiguration` / Options        |
| Guard                  | Authorization middleware / policy |
| Exception Filter       | Exception middleware/filter       |
| `HttpService`          | `HttpClient`                      |
| Scheduled task         | Hosted/background service         |

---

## 🛣️ Possible Future Improvements

- Email verification
- Forgot/reset password flow
- Redis caching for external API responses
- BullMQ for background jobs and email processing
- Health checks and observability
- Rate limiting
- Integration / end-to-end tests
- Kafka-based asynchronous events

---

## 🙏 External APIs

Game metadata is provided by **RAWG Video Games Database**.

Live PC pricing and deals are provided by **CheapShark**.

---

## 📌 Project Goal

The goal of this project is not only to build a game library API, but to progressively evolve a simple CRUD backend into a more realistic backend system with:

- authentication and authorization
- relational data modeling
- external service integrations
- background processing
- notifications
- testing and CI
- production-oriented architecture
