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
| `app/[lang]/(marketing)` | exists | The public pages and their shell: the layout (skip link, header, `main`, footer), the landing page (the home of the shop), `modular-system`, `contact`, `shop` and `shop/[category]` (the listings), `cart`, `privacy-policy`, `terms` and `returns` (the policy texts), the placeholder legal pages (`company`, `cookies`), `not-found`, `error` and a catch-all route that sends unknown addresses to `not-found`. The shop is here and not in a `(shop)` group, which would need a second copy of the layout (spec 005, T6). |
| `app/[lang]/coming-soon` | exists | The placeholder page, outside the group, so without the shell. |
| `app/api/` | exists | Route Handlers, outside `[lang]` and skipped by the proxy. `search/route.ts` gives the suggestions of the shop's search bar; its rate limit is a firewall rule of the hosting (ADR 0016). |
| `app/global-error.tsx`, `app/sitemap.ts`, `app/robots.ts` | exist | The error page of last resort, with its own `<html>`; the sitemap and the robots file. |
| `proxy.ts` | exists | Sends a request without a supported locale prefix to `/<locale>/...`. While `COMING_SOON` is `true`, shows the placeholder at every page address, with `X-Robots-Tag: noindex`. Kept small: later specs add their own checks here. |
| `components/` | exists | Reusable components. Receive text and data through props, never read dictionaries themselves. |
| `components/ui/` | exists | Design system primitives, one folder per group: `core`, `forms`, `surfaces`, `commerce`, `data`. See `design/components.md`. |
| `components/site/` | exists | The parts of the public site: skip link, header and its menu for narrow screens, navigation, footer, the crossfade between pages (`page-transition.tsx`), error and not-found views, the focus helper for section links, the parts of the shop (`product-grid.tsx` and `product-summary-card.tsx`, `shop-filters.tsx`, `shop-search.tsx` with `use-shop-suggestions.ts`, the browser side of the search suggestions), and `sections/` with the sections of the landing page (among them `featured-products.tsx`, the carousel of "Destaques", and `shop-sections.tsx`, one large card per section of the shop) and of the modular system page. They import primitives from `components/ui` only. |
| `styles/` | exists | `tokens.css`, the design tokens and single source of truth for visual values, with the contrast and theme guard tests. Wired into Tailwind by `app/globals.css`. |
| `lib/i18n/` | exists | Locale configuration, locale negotiation from `Accept-Language`, path switching. No server dependencies. |
| `server/i18n/` | exists | Typed dictionaries (`messages/pt.ts` defines the shape, `messages/en.ts` follows it), `getMessages(locale)` and `getCurrentLocale()`. |
| `lib/site/` | exists | What the public site knows about itself, without server dependencies: the public paths and the sitemap built from them, the section ids of the landing page, the legal pages, the contact address, the shape of a policy text (`policy-document.ts`). |
| `server/site/` | exists | `site-url.ts`, the only reader of `SITE_URL`; the builder of page metadata (canonical address and language alternates); the placeholder shared by the legal pages; `policies/`, the policy texts, one file per locale. |
| `lib/shop/` | exists | What the shop is, without server dependencies: `product.ts` (the shapes the components take, `ProductSummary`, `Money` in whole minor units, `ShopSectionEntry`, the availability values), `listing-filters.ts` (the availability filter read from the address), `search.ts` (what a search is, the `ShopSuggestion` shape, the address of a search listing). |
| `server/shopify/` | exists | `config.ts`, the only reader of `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_PRIVATE_ACCESS_TOKEN` (neither set: the store is not connected), with the pinned Storefront API version; `client.ts`, the only module that knows the endpoint and the private token header, returning typed data or a typed error (network, HTTP, GraphQL, invalid answer), every read cached for 5 minutes; `catalogue.ts`, the reads of the shop (the sections from the store's `shop` menu, a collection's products, every product), in the page's language, mapped to the shop's shapes; `search.ts`, the store's search (suggestions and products); `money.ts`, Shopify's amounts as whole minor units. |
| `server/shop/` | exists | What the shop pages ask for, without knowing the source: `shop-listing.ts` (sections and listings, and the search of the whole shop), `home-catalogue.ts` (the `featured` collection) and `search-suggestions.ts` (the suggestions of the search bar). They read the store when it is connected and the example data (`example-catalogue.ts`) only when it is not; a connected store that fails gives empty states. `listing-page.tsx` is the listing shared by `/shop` and `/shop/[category]`. |
| `server/` (other modules) | planned | Server-only layer, see below. |
| `lib/` (other modules) | planned | Code shared by server and client that has no server dependencies (for example validation schemas). |
| `test/` | exists | Test setup (`setup.ts`), the alias smoke test, shared doubles and the empty stand-in for `server-only`, which only Next.js resolves. Unit tests live next to the code they cover. |

## Server layer

Everything that is not presentation lives in `server/`, separated from the UI:

- Every module in `server/` imports `server-only`, so importing it from a client component fails the build.
- Data access goes through `server/shopify/` and `server/shop/`. Components never call Shopify directly.
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
- The privacy policy (`/privacy-policy`), the terms (`/terms`) and the return policy (`/returns`) are indexed and in the sitemap. Their text is data in `server/site/policies/` (one file per policy and locale, read through `policies.ts`; the PT file a translation of the EN one, a test keeps their structure equal), rendered by `components/site/policy-document-view.tsx`. The repository is the source of the policy texts: they are changed there, not in the generator they came from. The other legal pages are placeholders with `noindex` until the client delivers their content (T7 of the spec). The site cannot be launched with them.

## Shop

Decided in `decisions/0014-shopify-headless-commerce.md` and `0016-search-rate-limit.md`, specified in `specs/005-shop-home.md`; how to repeat it is in `checklists/04-shop-home.md`.

- Shopify is the source of the products, prices, availability and sections; the site reads them through the Storefront API with a private token and writes nothing. Only `server/shopify/` talks to Shopify and reads its variables.
- The sections of the shop are the collections of the store's `shop` menu, in its order; `featured` ("Destaques") is the one collection the code names. A section is changed in the Shopify admin, not in code.
- Without the Shopify variables the shop shows the example data, marked "Exemplo"; with them it never does, also when Shopify fails (empty states instead).
- Prices are shown as Shopify returns them; the frontend computes no price, discount or total. A product card leads to `/contact` until the product pages exist.
- Pages refresh on a time basis: every Storefront read is cached for 5 minutes. There are no webhooks yet.
- `/shop` and its sections are not in the sitemap yet (`lib/site/public-paths.ts`).

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
| Vitest as unit test runner | `decisions/0004-unit-test-runner.md` | accepted |
| Internationalization with the native Next.js pattern | `decisions/0008-i18n-native-next.md` | accepted |
| Styling with design tokens consumed through Tailwind | `decisions/0009-styling-design-tokens-tailwind.md` | accepted |
| Icons with lucide-react | `decisions/0010-icons-lucide.md` | accepted |
| Fonts self-hosted through next/font | `decisions/0011-fonts-next-font.md` | accepted |
| Application hosting | `decisions/0007-application-hosting.md` | accepted |
| Provisional hosting of the placeholder page on Vercel | `decisions/0012-provisional-hosting-vercel.md` | accepted |
| Playwright as end-to-end test runner | `decisions/0013-e2e-test-runner.md` | accepted |
| Shopify as the commerce backend, headless | `decisions/0014-shopify-headless-commerce.md` | accepted |
| Rate limit of the search suggestions in the hosting firewall | `decisions/0016-search-rate-limit.md` | accepted |

Withdrawn decisions, and why, are listed in `decisions/README.md`. Cookie consent management is still open (no ADR yet).
