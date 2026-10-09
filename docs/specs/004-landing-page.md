# 004. Public site shell and landing page

- Status: draft
- Idea: `../ideas/landing-page.md`
- Decisions: `../decisions/0013-e2e-test-runner.md`, `../decisions/0008-i18n-native-next.md`, `../decisions/0009-styling-design-tokens-tailwind.md`, `../decisions/0001-monorepo-single-web-app.md`

## Objective

Give the site its public face and the frame every later page sits in. After this spec: end-to-end tests run in three browser engines locally and in CI; every public page has a header, a footer with the legal links, a skip link, a canonical address and alternate-language links; unknown addresses and failures show a translated page; the site has a sitemap and a robots file; and `/pt` and `/en` show the landing page (hero, racks, tyres, contact) built only from the components of spec 003.

The spec is valid for every shop option still open in `../ideas/build-vs-shopify.md`: none of them changes the landing page or the shell.

## Out of scope

- The contact form, its emails, Turnstile and rate limits (own spec, after ADR 0005 and the decisions listed in the idea). The contact section shows contact details only.
- Privacy policy, cookie policy and terms of sale (texts come from the client). No personal data is collected and no cookie is set by this spec, so no consent banner and no analytics.
- Products, prices, cart, search, accounts. The header has no cart, search or account entry until the spec that makes them work.
- Sections that state facts only the client can confirm: "Why LockMX" (materials, origin, warranty) and the list of van models. They are added when the client supplies and confirms the content.
- Product photography. No stock or placeholder photograph is published. Sections are designed to work without a photograph and gain one when the client supplies it.
- Security headers (Content-Security-Policy and the others). They need their own decision, because a policy affects fonts, images, analytics and the payment provider.
- Removing the coming soon switch. It stays until launch; turning it off is the owner's action (`../architecture.md`).
- New design system components. If a section needs one, it is raised with the owner first (boundary of spec 003).
- Localized paths: addresses are the same in both locales (spec 002).

## Current state (verified 2026-10-09)

- `app/[lang]/layout.tsx` is the root layout (fonts, `<html lang>`, title and description from the dictionary). `app/[lang]/page.tsx` is a stub with the title and the language switcher. `app/[lang]/coming-soon/page.tsx` is the placeholder.
- `proxy.ts` adds the locale prefix and, with `COMING_SOON=true`, rewrites every page to the placeholder. Its matcher skips `api`, `_next` and any path with a dot, so `/sitemap.xml` and `/robots.txt` are not touched by it.
- No `not-found`, `error`, `global-error`, `sitemap` or `robots` file exists. `next.config.ts` sets only `reactCompiler`.
- Components outside the design system: `components/language-switcher.tsx` and `components/coming-soon.tsx`.
- No end-to-end runner. `apps/web/vitest.config.mts` sets no `include`, so Vitest's default pattern would also match `*.spec.ts` files of an end-to-end folder.
- CI (`.github/workflows/ci.yml`) runs install, lint, typecheck, test and build on `ubuntu-latest`.
- The address the site will be published at is not recorded anywhere in the repository (see Open points).

## Sources

- Next.js bundled docs 16.3.6 (`apps/web/node_modules/next/dist/docs/01-app/`), read 2026-10-09:
  - `02-guides/testing/playwright.md`: run the tests against the production build; `webServer` can start the server.
  - `03-api-reference/03-file-conventions/route-groups.md`: a group does not change the address; two groups must not resolve to the same address.
  - `03-api-reference/03-file-conventions/not-found.md`: `not-found` renders when `notFound()` is thrown in a segment; the root `app/not-found` also handles unmatched addresses; `global-not-found` is experimental and bypasses the layout; a 404 response gets `noindex` automatically.
  - `03-api-reference/03-file-conventions/error.md`: error boundaries are Client Components; `error` does not wrap the layout of its own segment; `global-error` replaces the root layout, defines its own `<html>` and `<body>`, does not get the global styles and cannot export metadata.
  - `03-api-reference/04-functions/generate-metadata.md`: `metadataBase`, `alternates.canonical`, `alternates.languages`, `robots`; a relative address without `metadataBase` is a build error.
  - `03-api-reference/03-file-conventions/01-metadata/sitemap.md` and `robots.md`: `app/sitemap.ts` with `alternates.languages` per entry; `app/robots.ts`; `robots` is cached unless it uses a request-time API.
- Playwright: https://playwright.dev/docs/intro and https://playwright.dev/docs/test-webserver (2026-10-09), as cited in ADR 0013.
- `../compliance/site-information-and-complaints.md` (2026-10-08): what the footer and the company page must show.
- Not read yet, read at the start of the task that needs them and cited in the task notes: the Playwright pages on configuration, projects, CI and browser caching (T1); the bundled `layout.md`, `page.md` and the metadata getting-started page (T2, T3); WCAG 2.4.1 (bypass blocks) and the APG landmark guidance (T3); the bundled `image.md` again (T6); the storefront UI kit of the design system (T3 and T6, see Open points).

Anything not listed is confirmed against the official documentation at the moment of the task, and the source is added to the task notes.

## Dependencies

- Development: `@playwright/test`, pinned exactly, at a version published at least two weeks before the day of T1 (1.63.0 on 2026-10-09). Approved by the owner with ADR 0013 on 2026-10-09.
- Production: none. Any other dependency is asked first.

## Open points

Each needs an answer before the task named. Nothing is filled in on assumption.

1. **Storefront UI kit** (before T3). The visual input for the header, footer and sections is `ui_kits/storefront` in the Claude Design project. It was not read for this spec: the tool that reads the project is used from `/design-sync`, which the owner starts. Until it is read, the sections follow the idea file. Where the kit differs, the difference goes to the owner.
2. **Site address** (before T2). The canonical origin, for example whether the site is served at `lockmx.com` or another domain, with or without `www`. It is configuration, not code, but the tests and the production value need it.
3. **Copy** (before T6 is merged). T6 is built with working copy in PT-PT and EN written from `../ideas/project-brief.md`, stating no fact the brief does not state. The client approves or replaces it before `COMING_SOON` is turned off.
4. **Company data** (before T7): company name, registered address, commercial registry number, tax number, telephone, the physical address for complaints, the arbitration centre if any. T7 cannot start without them.
5. **Primary action of the hero** (before T6): proposed, a link to the contact section.
6. **Address structure** (before T3): proposed, the landing page is the home (`/pt`, `/en`) and the shop gets its own path later. It decides the navigation labels.
7. **Error page text** (before T4): see the choice in T4.

## Working branch

`feat/004-landing-page`. Tasks are committed in order. The pull request is opened on explicit request, and merged with "rebase and merge".

## Conventions for every task

- Tests first. A page (async Server Component) is specified by an end-to-end test in `apps/web/e2e/`, written first and seen failing. A synchronous component and a plain module keep their Vitest test next to the file.
- End-to-end tests find elements by role and accessible name, in both locales. They assert behaviour and structure (landmarks, headings, links, attributes), not styling.
- Site components live in `apps/web/src/components/site/`, receive every string through props and never read dictionaries. Design system primitives are imported from `components/ui` only.
- Tokens only: no hex, no raw `px`, no inline `style`.
- Every visible string and accessible name is in both dictionaries.
- The visual check of each task is done at 320, 768, 1024 and 1440 px, on the real route, and the task notes say what was and was not checked.
- Each task ends with `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` and, from T1 on, `pnpm test:e2e`.

## Tasks

### T1. End-to-end test runner
- Description: install `@playwright/test` in `apps/web` after confirming the version rule and the configuration against the Playwright documentation. Add `apps/web/playwright.config.ts`: tests in `e2e/`, `baseURL` on a local port, `webServer` that starts the production build (`reuseExistingServer: !process.env.CI`), projects for Chromium, Firefox, WebKit and one mobile viewport. Add the scripts `test:e2e` (web and root). Exclude `e2e/` from Vitest. Ignore the report and result folders in git. Add the browser installation and the end-to-end run to CI after the build, with the browser download cached if the documentation gives a supported way. Update the definition of done in `docs/workflow.md` and the testing section of `docs/architecture.md`. Write the first tests for behaviour that already exists.
- Planned files: `apps/web/package.json`, `pnpm-lock.yaml`, `package.json`, `apps/web/playwright.config.ts`, `apps/web/e2e/locale-routing.spec.ts`, `apps/web/vitest.config.mts`, `.gitignore`, `.github/workflows/ci.yml`, `docs/workflow.md`, `docs/architecture.md`.
- Acceptance criteria: `pnpm test:e2e` builds, starts the app, runs in the four projects and stops the server; `pnpm test` runs no file from `e2e/`; no report or trace is tracked by git; CI runs the end-to-end step and uploads the report when it fails; the action that installs or caches browsers is pinned to a commit SHA like the others.
- Tests: `/` with `Accept-Language: en` ends at `/en`, and with `pt-PT` at `/pt`; `<html lang>` is `pt-PT` on `/pt` and `en` on `/en`; the language switcher on `/pt` leads to `/en` and marks the current language; `/favicon.ico` is served without a redirect. They pass against the current stub, since the behaviour exists (spec 002 verified it by hand).
- Commit: `arch: add playwright end-to-end tests`

### T2. Site address and page metadata
- Description: read the public origin from an environment variable in the server layer (`SITE_URL`, validated as an absolute `https` address outside development, documented in `.env.example` without a value). Set `metadataBase` in the root layout. Add a function that builds the metadata of a page from its locale, its path, its title and its description: canonical address for the locale, `alternates.languages` for `pt-PT`, `en` and `x-default` (the default locale), and the title template. Use it on the home page.
- Planned files: `apps/web/src/server/site/site-url.ts`, `apps/web/src/server/site/page-metadata.ts`, their tests, `apps/web/src/app/[lang]/layout.tsx`, `apps/web/src/app/[lang]/page.tsx`, `apps/web/.env.example`, `apps/web/playwright.config.ts` (the variable for the test server), `apps/web/e2e/metadata.spec.ts`.
- Acceptance criteria: `/pt` and `/en` each have one `<link rel="canonical">` pointing at themselves and `hreflang` links for both locales and `x-default`, all absolute; a missing or malformed `SITE_URL` fails the production build with a message that names the variable; the variable is read in one module only.
- Tests: unit tests for the address validation and for the metadata builder (paths with and without a trailing segment, both locales), written first; an end-to-end test for the `<head>` links of both home pages.
- Commit: `feat: add site address and page metadata`

### T3. Public shell: header, footer and skip link
- Description: add the route group `app/[lang]/(marketing)/` with a layout that renders a skip link, the header, `<main id>` and the footer, and move the home page into it. The placeholder (`coming-soon`) stays outside the group, without the shell. `SiteHeader`: the logo linking to the home of the locale, the navigation (links to the page sections and to contact), the language switcher; usable at 320 px without a new component (if the navigation does not fit, raise it instead of building a drawer). `SiteFooter`: the navigation, a link to the company information page, the link to the Complaints Book platform (`https://www.livroreclamacoes.pt`, visible on every page, opening the official site), the language switcher, the copyright line with the year. No link to the EU dispute platform. The dictionaries gain the `navigation`, `header` and `footer` messages.
- Planned files: `apps/web/src/app/[lang]/(marketing)/layout.tsx`, `apps/web/src/app/[lang]/(marketing)/page.tsx` (moved), `apps/web/src/components/site/{site-header,site-footer,skip-link}.tsx` and tests, `apps/web/src/server/i18n/messages/{pt,en}.ts`, `apps/web/e2e/shell.spec.ts`.
- Acceptance criteria: each page has exactly one `banner`, one `main`, one `contentinfo` and named `navigation` landmarks; the skip link is the first tab stop, becomes visible on focus and moves focus to the main content; the logo has the alternative text from the dictionary; the Complaints Book link is present in both locales; the footer uses the inverse surface with the yellow focus ring (`data-surface="inverse"`); no horizontal scroll at 320 px; the placeholder page has no header or footer.
- Tests: unit tests for the three components (roles, names, links, `aria-current` on the current navigation item, text only from props), written first; end-to-end tests for the landmarks, the skip link with the keyboard, the footer links and the language switch keeping the path, in both locales and on the mobile project.
- Commit: `feat: add public site shell`

### T4. Not-found and error pages
- Description: a translated not-found page inside the shell, for `notFound()` and for an address under a locale that matches no route; an error page for a failure while rendering a page, with a retry action and a link home; and `global-error` for a failure of the root layout, with its own `<html>` and `<body>`. Confirm in the bundled docs how an unmatched address under `[lang]` reaches the not-found page when the root layout is inside `[lang]`; if it needs a catch-all route that calls `notFound()`, add it. **Choice for the owner (open point 7):** an error boundary is a Client Component and cannot read the server dictionaries. Proposed: the marketing layout passes the few error strings of the current locale to a small client provider, and `error.tsx` reads them from it; `global-error`, which has no layout above it, carries its two short texts for both locales in a module of `lib/i18n/` and picks one from the address. The alternative is to move those strings out of the server dictionaries for both.
- Planned files: `apps/web/src/app/[lang]/(marketing)/not-found.tsx`, `apps/web/src/app/[lang]/(marketing)/error.tsx`, `apps/web/src/app/global-error.tsx`, a catch-all route if needed, `apps/web/src/components/site/error-messages.tsx` (or the chosen alternative) and test, dictionaries, `apps/web/e2e/not-found.spec.ts`.
- Acceptance criteria: `/pt/does-not-exist` and `/en/does-not-exist` answer 404 with the translated page inside the shell and a link home; the page is not indexable; the error page shows no technical detail (only the message and, if present, the digest as a reference); the retry action uses the function the installed version documents; `global-error` renders without the global stylesheet and stays readable.
- Tests: end-to-end for the 404 status, heading and home link in both locales; a unit test for the error view (message, retry callback, home link). The root layout failure cannot be provoked in a test without test-only code, so `global-error` is checked by hand once and recorded in the task notes.
- Commit: `feat: add not-found and error pages`

### T5. Sitemap, robots and no indexing while coming soon
- Description: `app/sitemap.ts` lists every public page once per locale with `alternates.languages`, from one list of public paths that T2's builder and the navigation can share. `app/robots.ts` allows crawling and names the sitemap. While `COMING_SOON` is `true`, `proxy.ts` adds `X-Robots-Tag: noindex` to the rewritten response: the switch is read per request, and `robots.ts` is cached at build time, so the header is the reliable signal.
- Planned files: `apps/web/src/app/sitemap.ts`, `apps/web/src/app/robots.ts`, `apps/web/src/lib/site/public-paths.ts` and tests, `apps/web/src/proxy.ts`, `apps/web/src/proxy.test.ts`, `apps/web/e2e/seo.spec.ts`.
- Acceptance criteria: `/sitemap.xml` and `/robots.txt` are served without a locale redirect and contain absolute addresses from `SITE_URL`; every sitemap entry answers 200; the placeholder response carries the `noindex` header and a normal page does not; `coming-soon` is not in the sitemap.
- Tests: unit tests for the sitemap entries and for the proxy header (written first); end-to-end for both files. The switch itself is tested end to end against a second server started with `COMING_SOON=true`, if the Playwright documentation supports more than one `webServer`; otherwise it stays covered by the proxy unit tests and the task notes say so.
- Commit: `feat: add sitemap and robots`

### T6. Landing page
- Description: replace the stub with the landing page, composed of section components that receive their text through props: hero (the display heading, one sentence, the primary action), racks (what they are and what they are for, from the brief), tyres (a short block), contact (the email address as a link; telephone and address appear when T7 supplies them). One `h1`, section headings in order, each section a named region reachable from the header navigation. Images only from `public/brand/`; a mockup from the identity pack is copied there only if the owner approves its use on the page. Working copy in both dictionaries (open point 3).
- Planned files: `apps/web/src/app/[lang]/(marketing)/page.tsx`, `apps/web/src/components/site/sections/{hero,racks,tyres,contact}.tsx` and tests, dictionaries, `apps/web/e2e/landing.spec.ts`.
- Acceptance criteria: the page renders in both locales with no untranslated string; exactly one `h1`; the header links move to their sections and the focus follows; the primary action is reachable with the keyboard; every image has dimensions and an alternative text or is marked decorative; no horizontal scroll from 320 px; the page states no price, no stock and no fact that is not in the brief.
- Tests: unit tests per section (headings, links, text only from props), written first; end-to-end for the heading structure, the in-page navigation and the contact link, in both locales and on the mobile project.
- Commit: `feat: add landing page`

### T7. Company information page
- Blocked until open point 4 is answered.
- Description: a page linked from the footer of every page with the identification the law requires (`../compliance/site-information-and-complaints.md`, sections 1, 3 and 7): company name, registered address, email, commercial registry data, tax number, telephone, the physical address for complaints, the dispute resolution entity if the client is bound to one, and the Complaints Book link again. The values live in one typed module, not in the dictionaries (they are data, the same in both languages); the labels are translated. The contact section of the landing page reads telephone and address from the same module. The page joins the sitemap.
- Planned files: `apps/web/src/lib/site/company.ts` and test, `apps/web/src/app/[lang]/(marketing)/company/page.tsx`, dictionaries, `apps/web/src/components/site/sections/contact.tsx`, `apps/web/e2e/company.spec.ts`.
- Acceptance criteria: the page is one click from every page; every value shown comes from the client's answer, recorded with its date in the task notes; a missing mandatory value fails a test instead of rendering an empty line.
- Tests: a unit test that every mandatory field is present and non-empty; end-to-end for the footer link and the presence of each labelled value in both locales.
- Commit: `feat: add company information page`

### T8. Architecture, checklist and status
- Description: update `docs/architecture.md` (the `(marketing)` group, `components/site/`, `server/site/`, `lib/site/`, `e2e/`, the error pages, the `noindex` header of the switch) and `apps/web/AGENTS.md` where it lists what exists; write `docs/checklists/03-public-site.md` from what T1 to T7 did and add it to `docs/checklists/README.md`; set this spec to `done`. If T7 is still blocked, the spec stays `in progress` and the checklist says so.
- Planned files: `docs/architecture.md`, `apps/web/AGENTS.md`, `docs/checklists/03-public-site.md`, `docs/checklists/README.md`, this spec.
- Acceptance criteria: every path named exists; each checklist step names the command or file and matches the repository.
- Tests: no tests (documentation).
- Commit: `docs: add public site checklist`

## Boundaries

- Always: the test first, seen failing; the bundled Next.js docs read before each convention is used; tokens and design system components only; every string in both dictionaries; all four widths in the visual check.
- Ask first: any dependency besides `@playwright/test`; a new design system component or token; a change to the address structure; a photograph or mockup on a public page; any text that states a fact about the product or the company.
- Never: invent company data, claims, prices or photographs; collect personal data or set a cookie; link to the EU online dispute resolution platform; put a secret in `SITE_URL` or any `NEXT_PUBLIC_*` variable; turn off `COMING_SOON` in a deployment.

## Definition of done

All tasks committed on `feat/004-landing-page`; `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` and `pnpm test:e2e` pass locally and in CI; the client's copy and company data are in place or the open task is named in the status; the documentation matches the code; and the spec status is `done`.
