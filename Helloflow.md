# Hello World Flow — DDD Architecture (NestJS / TypeScript)

> A walkthrough of how an HTTP request travels through all four architectural layers from outside inward, and back out in billing-svc.

---

## Request Flow Diagram

```text
Client / Browser / curl
    │
    ▼
[Inbound Adapter]
src/application/hello/hello.controller.ts (Controller receives GET /hello)
    │
    ▼
[Application Layer - CQRS QueryBus]
src/application/hello/queries/get-hello.handler.ts (GetHelloHandler orchestrates)
    │  ┌────────────────────────────────────────────────────────┐
    ├──► src/domain/repositories/hello.repository.interface.ts (Port)
    │  └────────────────────────────────────────────────────────┘
    │
    ▼
[Outbound Adapter]
src/infrastructure/persistence/repositories/hello.repository.ts (HelloRepository)
    │
    ▼
[Domain Layer - Pure Business Logic]
src/domain/hello/message.model.ts (Message.create)
    │
    ▼
Response ───────────────────────────────────────────────────► Client / Browser
```

---

## Layer-by-Layer Breakdown

### 1. `src/modules/hello.module.ts` & `src/app.module.ts` — Dependency Injection & Wiring Layer
Ties everything together using NestJS dependency injection:
- Registers `HelloController` for routing.
- Registers `GetHelloHandler` to handle `GetHelloQuery`.
- Binds `HELLO_REPOSITORY` symbol to `HelloRepository` adapter.
- Imports `HelloModule` into `AppModule`.

### 2. `src/application/hello/hello.controller.ts` — Inbound Adapter
When a request hits `GET /hello`:
- `HelloController` intercepts it.
- Does **not** access the database or domain directly.
- Dispatches a CQRS query: `this.queryBus.execute(new GetHelloQuery())`.

### 3. `src/application/hello/queries/get-hello.handler.ts` — Use Case / Orchestration
`GetHelloHandler` defines the business workflow:
- Injects `HelloRepositoryInterface` via the port symbol `HELLO_REPOSITORY`.
- Calls `this.helloRepository.getStaticName()`.
- Keeps the application layer decoupled from concrete infrastructure (DB/Stripe/etc).

### 4. `src/infrastructure/persistence/repositories/hello.repository.ts` — Outbound Adapter
`HelloRepository` implements `HelloRepositoryInterface`:
- Returns the raw string `"World"`.
- In production, this would query **PostgreSQL** via TypeORM.

### 5. `src/domain/hello/message.model.ts` — Pure Business Logic
The application layer passes `"World"` to `Message.create(name)`:
- Pure TypeScript value object, framework-agnostic (no NestJS, no ORM decorators).
- Validates the input and applies greeting formatting.
- Returns `"Hello, World from the Domain layer!"`.

---

## Response Path

```text
src/domain/hello/message.model.ts
    └──► src/application/hello/queries/get-hello.handler.ts
              └──► src/application/hello/hello.controller.ts
                        └──► Client / Browser ("Hello, World from the Domain layer!")
```

---

## Console Logs Execution Trace

When calling `GET http://localhost:3000/hello`, the terminal will log in this exact order:

```text
Infrastructure - HelloController Received request for /hello
Application - Query - Handling GetHelloQuery...
Infrastructure - HelloRepo Fetching static name...
Domain - Model - NewMessage...
```

---

## Dependency Rule Audit

> **Dependencies always point inward — business domain never depends on frameworks or databases.**

| File | Layer | Dependencies / Imports | Status |
|---|---|---|---|
| `domain/hello/message.model.ts` | domain/ | Pure TypeScript stdlib only | ✅ Zero framework dependencies |
| `domain/repositories/hello.repository.interface.ts` | domain/ (Port) | Pure TypeScript interface & Symbol | ✅ stdlib only |
| `application/hello/queries/get-hello.handler.ts` | application/ | @nestjs/cqrs + domain/hello + domain/repositories | ✅ Inward to Domain only |
| `infrastructure/persistence/repositories/hello.repository.ts` | infrastructure/ | @nestjs/common + domain/repositories | ✅ Implements domain port |
| `application/hello/hello.controller.ts` | application/ (HTTP) | @nestjs/common + @nestjs/cqrs + queries/ | ✅ Delegates via QueryBus |
| `modules/hello.module.ts` | modules/ | Wires all adapters and handlers | ✅ DI Container setup |

---

## How to Test

1. Start the service:
```bash
npm run start:dev
```
2. In another terminal, make a request:
```bash
curl http://localhost:3000/hello
```
3. Expected output:
```text
Hello, World from the Domain layer!
```
