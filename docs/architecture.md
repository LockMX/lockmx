# Architecture

The current structure of the repository and the boundaries the code must respect. Choices are explained in the ADRs in `decisions/`; this file does not repeat their reasoning.

Status markers: **exists** means it is in the repository today, **planned** means it is the target structure and is created only when first used. No empty folders are added.

## Repository layout

| Path | Status | Content |
|---|---|---|
| `apps/web/` | exists | The only application: a Next.js site with the backend inside it. |
| `packages/` | exists (workspace glob only) | Receives code only when it gains a second real consumer. |
| `docs/` | exists | Documentation, see `README.md`. |
| `.github/workflows/ci.yml` | exists | CI: install, lint, typecheck, test, build. |
| `apps/api/` | planned, only on a concrete need | Standalone API (mobile app, public integrations, long-running jobs). |

pnpm workspace with a single lockfile. Root scripts delegate to `apps/web`. Commands and the definition of done are in `workflow.md`.

## Web app (`apps/web/src`)

| Path | Status | Content |
|---|---|---|
| `app/` | exists | Routes, layouts and composition only. No business logic in pages. |
| `app/(marketing)`, `(shop)`, `(account)`, `(admin)` | planned | Route groups, one per site section. |
| `test/` | exists | Test setup check (`smoke.test.ts`). Unit tests live next to the code they cover once there is code. |
| `server/` | planned | Server-only layer, see below. |
| `lib/` | planned | Code shared by server and client that has no server dependencies (for example validation schemas). |

## Server layer

Everything that is not presentation lives in `server/`, separated from the UI:

- `server/auth`, `server/db`, `server/repositories`, `server/payments`, `server/invoicing` (all planned): authentication, database access, data access, payment provider and invoicing integrations.
- Every module in `server/` imports `server-only`, so importing it from a client component fails the build.
- Data access goes through a data access layer (`server/repositories`). Components never query the database directly.
- Components receive DTOs with only the fields they render, never full entities with internal fields.
- Server Actions and Route Handlers validate input, authenticate and authorize on the server, on every call.
- Environment variables are read only in the server layer. `NEXT_PUBLIC_*` variables are public and never hold secrets.
- Dependencies point inward: business logic knows nothing about the UI or the providers.

Source for these rules: Next.js bundled docs, `apps/web/node_modules/next/dist/docs/01-app/02-guides/data-security.md` (see ADR 0001).

## How code is tested

- Unit and integration tests run with Vitest in a jsdom environment (`apps/web/vitest.config.mts`), through `pnpm test`.
- Vitest does not support async Server Components. Plain modules and synchronous components are unit tested; pages are covered later by end-to-end tests (planned, not yet set up).
- CI runs lint, typecheck, test and build on every pull request and on pushes to `main`.

## Decisions

| Choice | ADR | Status |
|---|---|---|
| Monorepo with a single web app, backend inside Next.js | `decisions/0001-monorepo-single-web-app.md` | accepted |
| Drizzle ORM with PostgreSQL | `decisions/0002-orm-drizzle-postgresql.md` | accepted |
| Authentication with Better Auth | `decisions/0003-authentication-better-auth.md` | proposed |
| Vitest as unit test runner | `decisions/0004-unit-test-runner.md` | accepted |
| Transactional email with Resend | `decisions/0005-transactional-email-resend.md` | proposed |
| Database provider | `decisions/0006-database-provider.md` | proposed |
| Application hosting | `decisions/0007-application-hosting.md` | proposed |

Payment provider and cookie consent management are still open (no ADR yet).
