# 0003. Authentication with Better Auth

- Status: proposed
- Date: 2026-09-30

## Context

The customer area needs accounts, sessions and password recovery. The admin panel needs a role check on the server and strong protection (two-factor authentication) for admin users. The owner has used Supabase Auth before and is open to a better fit.

## Decision (proposed)

Use Better Auth, with the Drizzle adapter on the project's own PostgreSQL, and its admin plugin for roles. The decision moves to `accepted` after the checks listed under Consequences.

Reasons found in the official documentation:

- The Drizzle adapter stores users, sessions and accounts as tables in our own database, managed by the same migrations. Orders reference customers with ordinary foreign keys.
- The admin plugin provides roles and access control that can back the `(admin)` route group.
- It does not tie the database to a provider.

## Alternatives considered

- Auth.js (NextAuth): a secondary source reports that the Better Auth team took over its maintenance in September 2025 and that its documented pattern predates the Next.js 16 rename of `middleware` to `proxy`. Not verified in the Auth.js documentation.
- Supabase Auth: fewer lines of code, but users live in a schema managed by the provider, which couples the data model and the database provider. Not verified against the Supabase documentation in this session.
- A hand-rolled session implementation as described in the Next.js authentication guide: rejected for the security burden on a store with payments.

## Consequences

- The project owns the emails for verification and password recovery, so the transactional email setup is a dependency (the `@lockmx.com` domain is being created).
- Server-side authorization is enforced on every action, not only in layouts. Proxy checks are optimistic only, per the Next.js guide.
- To verify before accepting, in the current Better Auth documentation:
  - integration with Next.js 16, including the proxy file;
  - two-factor authentication and rate limiting;
  - email and password with verification and recovery;
  - the release status of the version to install.
- Open product question that shapes the data model: is an account required to buy, or is guest checkout allowed?

## Sources

- Better Auth documentation via Context7 (`/better-auth/better-auth`), consulted 2026-09-30: Drizzle adapter, admin plugin with roles and access control.
- Next.js bundled docs, `apps/web/node_modules/next/dist/docs/01-app/02-guides/authentication.md` (optimistic checks in Proxy), consulted 2026-09-30.
- Secondary source, not official: LogRocket, "I tested every major auth library for Next.js in 2026", https://blog.logrocket.com/best-auth-library-nextjs-2026/ (2026-09-30). To be replaced by official sources during verification.
