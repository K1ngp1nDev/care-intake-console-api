# Care Intake Console API

NestJS API for a synthetic outpatient intake and triage workflow. It provides JWT auth, patient and appointment endpoints, intake submission, triage suggestions, follow-up generation, analytics, and Swagger docs for the Angular frontend.

## Stack

- NestJS 11
- JWT
- Swagger
- class-validator
- Prisma schema plus demo-first runtime store

## Run

```bash
npm install
npm run prisma:generate
npm run start:dev
```

Swagger is available at `/api/docs`.
