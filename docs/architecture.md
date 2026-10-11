# Architecture

The current structure of the repository and the boundaries the code must respect. Choices are explained in the ADRs in `decisions/`; this file does not repeat their reasoning.

Status markers: **exists** means it is in the repository today, **planned** means it is the target structure and is created only when first used. No empty folders are added.

## Repository layout

| Path | Status | Content |
|---|---|---|
| `apps/web/` | exists | The only application: a Next.js site with the backend inside it. |
| `packages/` | exists (workspace glob only) | Receives code only when it gains a second real consumer. |
| `docs/` | exists | Documentation, see `README.md`. |
| `.github/workflows/ci.yml` | exists | CI: install, lint, typecheck, test, build, end-to-end tests. |
| `apps/api/` | planned, only on a concrete need | Standalone API (mobile app, public integrations, long-running jobs). |

pnpm workspace with a single lockfile. Root scripts delegate to `apps/web`. Commands and the definition of done are in `workflow.md`.

## Web app (`apps/web/src`)

| Path | Status | Content |
|---|---|---|
| `app/` | exists | Routes, layouts and composition only. No business logic in pages. |
| `app/[lang]/` | exists | Root segment for the locale (`pt` or `en`). Holds the root layout and every page. |
| `app/[lang]/(marketing)` | exists | The public pages and their shell: the layout (skip link, header, `main`, footer), the landing page, `modular-system`, the placeholder legal pages (`company`, `privacy`, `cookies`, `terms`), `not-found`, `error` and a catch-all route that sends unknown addresses to `not-found`. |
| `app/[lang]/coming-soon` | exists | The placeholder page, outside the group, so without the shell. |
| `app/global-error.tsx`, `app/sitemap.ts`, `app/robots.ts` | exist | The error page of last resort, with its own `<html>`; the sitemap and the robots file. |
| `app/[lang]/(shop)`, `(account)`, `(admin)` | planned | Route groups, one per site section, inside `[lang]`. |
| `proxy.ts` | exists | Sends a request without a supported locale prefix to `/<locale>/...`. While `COMING_SOON` is `true`, shows the placeholder at every page address, with `X-Robots-Tag: noindex`. Kept small: later specs add their own checks here. |
| `components/` | exists | Reusable components. Receive text and data through props, never read dictionaries themselves. |
| `components/ui/` | exists | Design system primitives, one folder per group (`core` now; `forms`, `surfaces`, `commerce`, `data` planned). See `design/components.md`. |
| `components/site/` | exists | The parts of the public site: skip link, header and its menu for narrow screens, navigation, footer, error and not-found views, the focus helper for section links, and `sections/` with the sections of the landing page and of the modular system page. They import primitives from `components/ui` only. |
| `styles/` | exists | `tokens.css`, the design tokens and single source of truth for visual values, with the contrast and theme guard tests. Wired into Tailwind by `app/globals.css`. |
| `lib/i18n/` | exists | Locale configuration, locale negotiation from `Accept-Language`, path switching. No server dependencies. |
| `server/i18n/` | exists | Typed dictionaries (`messages/pt.ts` defines the shape, `messages/en.ts` follows it), `getMessages(locale)` and `getCurrentLocale()`. |
| `lib/site/` | exists | What the public site knows about itself, without server dependencies: the public paths and the sitemap built from them, the section ids of the landing page, the legal pages, the contact address. |
| `server/site/` | exists | `site-url.ts`, the only reader of `SITE_URL`; the builder of page metadata (canonical address and language alternates); the placeholder shared by the legal pages. |
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
- Coming soon switch: with `COMING_SOON=true` in the environment, `proxy.ts` rewrites every page request that has a locale to `/<locale>/coming-soon` (the address in the browser does not change). It is set only in the public deployment until launch (ADR 0012) and left unset in development, where every page is served as it is. The value is read per request; checked on 2026-10-08 with `next start`, on a build made without the variable. It was not checked on Vercel: redeploy after changing it there. The switch hides pages only. Requests the matcher skips (`api`, files) are not covered, so an API route is never protected by it. At launch the variable, the `coming-soon` route, the `ComingSoon` component and its dictionary keys are removed.
- The proxy matcher skips `api`, `_next` and any path with a dot. Next.js turns an escaped dot in a matcher into any character, so the pattern uses `[.]`; a test guards it.
- No top-level route may be named like a language code (two or three letters).

## Public site

Specified in `specs/004-landing-page.md`; how to repeat it is in `checklists/03-public-site.md`.

- The canonical origin comes from `SITE_URL`, read only in `server/site/site-url.ts`. A production build without it fails.
- A page is public when its path is in `publicPaths` (`lib/site/public-paths.ts`): the sitemap and the alternate-language links are built from that list, so they cannot differ.
- Addresses are in English and the same in both locales (`/modular-system`, `/company`).
- A link to a section of the landing page is `/<locale>#<id>`; the layout moves the focus to the section.
- The legal pages are placeholders with `noindex` until the client delivers their content (T7 of the spec). The site cannot be launched with them.

## Design system

Decided in `decisions/0009-styling-design-tokens-tailwind.md`, `0010-icons-lucide.md` and `0011-fonts-next-font.md`, specified in `specs/003-design-system.md`, documented in `design/`.

- Visual values exist only in `styles/tokens.css`. Components use Tailwind utilities that resolve to those tokens; Tailwind's default palette and scales are switched off.
- Fonts are loaded in `app/[lang]/layout.tsx` with `next/font` and served from the site's own origin.
- Brand assets that a page uses are in `public/brand/`. The client's identity pack is in `logo/` at the repository root, git-ignored and never served.

## How code is tested

- Unit and integration tests run with Vitest in a jsdom environment (`apps/web/vitest.config.mts`), through `pnpm test`.
- Component tests clean the DOM after each test through `src/test/setup.ts`.
- Vitest does not support async Server Components. Plain modules and synchronous components are unit tested; pages are covered by end-to-end tests.
- End-to-end tests run with Playwright (`apps/web/playwright.config.ts`, tests in `apps/web/e2e/`), through `pnpm test:e2e`: Chromium, Firefox, WebKit and one mobile viewport, against the production build on port 3100, with `COMING_SOON` off. A second server on port 3101 runs the same build with the switch on. Locally the command builds and starts the app, or reuses a server already on that port; the browsers are installed once with `pnpm --filter web exec playwright install`.
- CI runs lint, typecheck, test, build and the end-to-end tests on every pull request and on pushes to `main`, and uploads the Playwright report when a run fails.

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
| Playwright as end-to-end test runner | `decisions/0013-e2e-test-runner.md` | accepted |
| Shopify as the commerce backend, headless | `decisions/0014-shopify-headless-commerce.md` | accepted |

ADR 0014 puts the shop's data, accounts, checkout and payments on Shopify. ADRs 0002, 0003, 0005 and 0006 and the planned `server/auth`, `server/db`, `server/repositories`, `server/payments` and `server/invoicing` modules above were written for a custom shop and are revisited with the shop idea; until then they are not built.

Cookie consent management is still open (no ADR yet).
