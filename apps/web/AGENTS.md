<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Web app rules (LockMX)

These complement the root `AGENTS.md`. The block above is managed by Next.js: do not edit it.

## Version and documentation

- Next.js 16 and React 19 (see `package.json`). Conventions in this version may differ from what you know: confirm in `node_modules/next/dist/docs/` before writing code. Example to verify: the name and format of the proxy file (formerly `middleware.ts`).

## Structure

- `src/app/` only contains routes, layouts and composition. Planned route groups: `(marketing)`, `(shop)`, `(account)` and `(admin)`. Pages contain no business logic.
- Business logic, data access and integrations (database, authentication, payments, invoicing) live in server code separated from the UI and protected with `server-only`.
- Components receive only the data they need (DTOs), never full entities with internal fields.
- The exact structure of `src/` is defined in the technical foundation spec. Until then, do not create new folders outside what the spec defines.

## Server and client

- Server components by default. `"use client"` only when there is interactivity.
- Server Actions and Route Handlers validate input, authenticate and authorize on the server, always.
- Environment variables are read only in the server layer. Keep `.env.example` up to date (without values).

## Interface

- No ad hoc colors, sizes or typography: use the design system tokens (to be defined in `docs/design/`, based on the client's existing visual identity).
- Loading, empty, error and success states in every data view.
- Accessibility: semantic HTML, keyboard navigation and adequate contrast.
- No hardcoded visible text in components: everything goes through i18n (PT-PT and EN).
