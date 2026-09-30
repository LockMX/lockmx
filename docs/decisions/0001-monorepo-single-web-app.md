# 0001. Monorepo with a single web app and the backend inside Next.js

- Status: accepted
- Date: 2026-09-30

## Context

LockMX needs a marketing site, a shop, a customer area and an admin panel. They share the brand, the catalog, authentication and the design system. The owner is the only developer. Sensitive data (accounts, payments) is involved, so the server-side boundaries must be explicit.

An earlier suggestion of separate apps (landing, shop, client panel) was dropped: they are the same product seen from different angles, and splitting them adds deployments and coordination without a benefit today.

## Decision

- A pnpm monorepo, with `apps/web` as the only application and `packages/` reserved for code that gains a second real consumer.
- `apps/web` is a single Next.js app. Sections are organized with route groups: `(marketing)`, `(shop)`, `(account)` and `(admin)`.
- The backend lives inside the same Next.js app (Route Handlers and Server Actions), behind a server-only layer that owns data access and integrations.
- A standalone API (`apps/api`) is created only when a concrete need appears, such as a mobile app, public integrations or long-running jobs.

## Alternatives considered

- Several Next.js apps (landing, shop, client panel): rejected, see Context.
- A separate backend from day one (for example NestJS or Python): rejected. The language does not make the system more secure; security comes from design and boundaries. It would add a second deployment with no current requirement.
- A single package at the repository root, without workspaces: rejected to keep a clear place for `apps/api` and shared packages later.

## Consequences

- One repository, one lockfile, one deployment for the site.
- The server boundary must be enforced by convention and tooling (`server-only`, a data access layer, validation in every action), because it lives in the same codebase as the UI.
- Scheduled and background work (for example releasing expired stock reservations, retrying invoicing) does not fit request handlers. It needs a scheduler decision in a later ADR.
- Extracting `apps/api` later means moving the server layer, not rewriting the shop.

## Sources

- pnpm workspaces: https://pnpm.io/workspaces (consulted 2026-09-30).
- Next.js bundled docs for the installed version (16.3.6), read from `apps/web/node_modules/next/dist/docs/01-app/` (2026-09-30):
  - `02-guides/backend-for-frontend.md` (Next.js as a backend for the frontend, with the note that it is not a full backend replacement).
  - `02-guides/data-security.md` (Data Access Layer, `server-only`, environment variables read only in the data access layer, `NEXT_PUBLIC_` exposure).
  - `03-api-reference/03-file-conventions/route-groups.md` (route groups do not appear in the URL).
