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
| `app/[lang]/` | exists | Root segment for the locale (`pt` or `en`). Holds the root layout and every page. |
| `app/[lang]/(marketing)`, `(shop)`, `(account)`, `(admin)` | planned | Route groups, one per site section, inside `[lang]`. |
| `proxy.ts` | exists | Sends a request without a supported locale prefix to `/<locale>/...`. Kept small: later specs add their own checks here. |
| `components/` | exists | Reusable components. Receive text and data through props, never read dictionaries themselves. |
| `components/ui/` | exists | Design system primitives, one folder per group (`core` now; `forms`, `surfaces`, `commerce`, `data` planned). See `design/components.md`. |
| `styles/` | exists | `tokens.css`, the design tokens and single source of truth for visual values, with the contrast and theme guard tests. Wired into Tailwind by `app/globals.css`. |
| `lib/i18n/` | exists | Locale configuration, locale negotiation from `Accept-Language`, path switching. No server dependencies. |
| `server/i18n/` | exists | Typed dictionaries (`messages/pt.ts` defines the shape, `messages/en.ts` follows it), `getMessages(locale)` and `getCurrentLocale()`. |
| `server/` (other modules) | planned | Server-only layer, see below. |
| `lib/` (other modules) | planned | Code shared by server and client that has no server dependencies (for example validation schemas). |
| `test/` | exists | Test setup (`setup.ts`) and the alias smoke test. Unit tests live next to the code they cover. |

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

## Internationalization

Decided in `decisions/0008-i18n-native-next.md`, specified in `specs/002-i18n.md`.

- Two locales, `pt` and `en`, always in the URL path (`/pt/...`, `/en/...`). `<html lang>` is `pt-PT` for `pt`.
- First visit: `proxy.ts` picks the locale from `Accept-Language`, falling back to `pt`. An unsupported language prefix (`/fr`) is replaced by the resolved locale. The redirect is temporary and varies on `Accept-Language`. No cookie is used.
- Every visible string comes from a dictionary. Pages read it with `getMessages(await getCurrentLocale())` and pass strings to components as props. ESLint (`react/jsx-no-literals`) rejects literal text in JSX; attribute strings (`alt`, `aria-label`) are a review point.
- The proxy matcher skips `api`, `_next` and any path with a dot. Next.js turns an escaped dot in a matcher into any character, so the pattern uses `[.]`; a test guards it.
- No top-level route may be named like a language code (two or three letters).

## Design system

Decided in `decisions/0009-styling-design-tokens-tailwind.md`, `0010-icons-lucide.md` and `0011-fonts-next-font.md`, specified in `specs/003-design-system.md`, documented in `design/`.

- Visual values exist only in `styles/tokens.css`. Components use Tailwind utilities that resolve to those tokens; Tailwind's default palette and scales are switched off.
- Fonts are loaded in `app/[lang]/layout.tsx` with `next/font` and served from the site's own origin.
- Brand assets that a page uses are in `public/brand/`. The client's identity pack is in `logo/` at the repository root, git-ignored and never served.

## How code is tested

- Unit and integration tests run with Vitest in a jsdom environment (`apps/web/vitest.config.mts`), through `pnpm test`.
- Component tests clean the DOM after each test through `src/test/setup.ts`.
- Vitest does not support async Server Components. Plain modules and synchronous components are unit tested; pages are covered later by end-to-end tests (planned, not yet set up).
- CI runs lint, typecheck, test and build on every pull request and on pushes to `main`.

## Decisions

| Choice | ADR | Status |
|---|---|---|
| Monorepo with a single web app, backend inside Next.js | `decisions/0001-monorepo-single-web-app.md` | accepted |
| Drizzle ORM with PostgreSQL | `decisions/0002-orm-drizzle-postgresql.md` | accepted |
| Authentication with Better Auth | `decisions/0003-authentication-better-auth.md` | proposed |
| Vitest as unit test runner | `decisions/0004-unit-test-runner.md` | accepted |
| Internationalization with the native Next.js pattern | `decisions/0008-i18n-native-next.md` | accepted |
| Styling with design tokens consumed through Tailwind | `decisions/0009-styling-design-tokens-tailwind.md` | accepted |
| Icons with lucide-react | `decisions/0010-icons-lucide.md` | accepted |
| Fonts self-hosted through next/font | `decisions/0011-fonts-next-font.md` | accepted |
| Transactional email with Resend | `decisions/0005-transactional-email-resend.md` | proposed |
| Database provider | `decisions/0006-database-provider.md` | proposed |
| Application hosting | `decisions/0007-application-hosting.md` | proposed |
| Provisional hosting of the placeholder page on Vercel | `decisions/0012-provisional-hosting-vercel.md` | proposed |

Payment provider and cookie consent management are still open (no ADR yet).
