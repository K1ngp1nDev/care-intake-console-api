# Care Intake Console API

A NestJS backend for a synthetic outpatient **intake and triage** workflow. It powers a coordinator-facing dashboard: patient registration, appointment scheduling, intake submission, AI-style triage suggestions, follow-up task generation, and queue analytics.

> **What it demonstrates:** a clean, modular NestJS service with JWT auth, validated DTOs, Swagger documentation, and a rich analytics endpoint — running entirely on seeded, in-memory demo data with zero external dependencies.

## Stack

- **NestJS 11** — modular controllers/services architecture
- **JWT** authentication (`@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`)
- **Swagger** / OpenAPI docs (`@nestjs/swagger`)
- **class-validator** + **class-transformer** for request validation
- **Prisma schema** (data model reference) plus a deterministic **in-memory demo store** used at runtime

## Setup

```bash
npm install
npm run prisma:generate   # generates the Prisma client used at build time
npm run start:dev         # starts the API in watch mode
```

The server listens on `http://localhost:3000` by default (override with `PORT`).

> **Runs with zero external services.** Despite shipping a Prisma schema, the running app uses a seeded **in-memory store** — no database, no message broker, no third-party API. Restarting the server resets the data to the same deterministic seed.

## Demo credentials

| Field    | Value               |
| -------- | ------------------- |
| Email    | `demo@example.com`  |
| Password | `demo12345`         |

## API docs

Interactive Swagger UI: [`/api/docs`](http://localhost:3000/api/docs). Use the **Authorize** button with the bearer token returned from `auth/login` to call protected endpoints.

## Endpoints

| Method  | Path                       | Description                                                        |
| ------- | -------------------------- | ------------------------------------------------------------------ |
| `POST`  | `/auth/login`              | Authenticate with demo credentials; returns a JWT access token.    |
| `POST`  | `/auth/register`           | Register a new demo user.                                          |
| `GET`   | `/patients`                | List patients.                                                     |
| `POST`  | `/patients`                | Create a patient.                                                  |
| `GET`   | `/appointments`            | List appointments (optional `date` / `status` filters).            |
| `POST`  | `/appointments`            | Create an appointment.                                             |
| `POST`  | `/intakes`                 | Submit an intake for an appointment.                               |
| `GET`   | `/triage`                  | List triage suggestions.                                           |
| `POST`  | `/triage/suggest`          | Generate a triage suggestion for an intake.                        |
| `PATCH` | `/triage/:id/decision`     | Record a clinician decision (accept / edit / reject) on a triage.  |
| `GET`   | `/followups`               | List follow-up tasks.                                              |
| `POST`  | `/followups/generate`      | Generate follow-up tasks from a triage suggestion.                 |
| `GET`   | `/analytics/queue-summary` | Dashboard KPIs, queue distributions, 14-day volume, and due tasks. |
| `GET`   | `/audit`                   | Synthesized operational activity feed (intakes, triage, follow-ups, appointments). |

## Important

This is **synthetic demo data** for a portfolio project. It contains **no real PHI** and provides **no medical advice or claims** — triage summaries are operational/administrative only. It is **not** a production medical system and must not be used for clinical decision-making.
