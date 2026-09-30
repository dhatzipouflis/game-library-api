# 🎮 Game Library API

A RESTful backend API for managing a personal game library, built with **NestJS**, **TypeScript**, **TypeORM**, and **PostgreSQL**.

This project is also a hands-on exploration of the Node.js/NestJS ecosystem, applying backend concepts and architectural patterns familiar from **ASP.NET Core / EF Core**.

## 🚀 Tech Stack

- Node.js
- TypeScript
- NestJS
- TypeORM
- PostgreSQL
- Docker / Docker Compose
- Swagger / OpenAPI
- class-validator
- Vitest

## ✨ Features

- CRUD operations for games
- PostgreSQL persistence
- Dockerized local database
- Repository pattern
- Dependency Injection
- Repository abstraction using injection tokens
- DTO-based request validation
- Global validation pipeline
- Centralized exception handling
- Environment-based configuration
- TypeORM migrations
- Swagger / OpenAPI documentation
- Unit tests with mocked repository dependencies
- Consistent API response and error handling

## 🏗️ Architecture

The application follows a feature-based structure:

```text
src/
├── common/
│   └── filters/
│
├── database/
│   ├── data-source.ts
│   └── migrations/
│
├── games/
│   ├── dto/
│   ├── entities/
│   ├── repositories/
│   ├── games.controller.ts
│   ├── games.service.ts
│   └── games.module.ts
│
├── app.module.ts
└── main.ts
