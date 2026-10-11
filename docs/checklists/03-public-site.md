# Checklist: public site shell and landing page

Repeats what spec 004 (`../specs/004-landing-page.md`) built: end-to-end tests, the address of the site and page metadata, the shell of every public page (skip link, header with a menu for narrow screens, footer), the not-found and error pages, sitemap and robots, the landing page, the modular system page and the placeholder legal pages. Decisions: `../decisions/0013-e2e-test-runner.md`.

**Not finished:** the company information and policy pages (T7 of the spec) wait for the client's data and texts. Steps 11 and the last line of "Verification" describe the placeholders that stand in for them; the site cannot be launched with them.

All paths are inside `apps/web/` unless they start with `docs/` or `.github/`.

## Prerequisites

- The technical foundation (`00-foundation.md`), internationalization (`01-i18n.md`) and the design system (`02-design-system.md`).
- The canonical origin of the site, decided with the owner (`https://lockmx.com`).
- The client's copy and the owner's decisions on each new icon, image and component: a page never invents them.

## Steps

1. **End-to-end runner.** `pnpm add -D --filter web @playwright/test@<version>`, pinned exactly, at a version published at least two weeks before. `pnpm --filter web exec playwright install`. `playwright.config.ts`: projects `chromium`, `firefox`, `webkit` and `mobile` (iPhone 12); `timeout` 60 s and `expect.timeout` 10 s; one worker and two retries in CI; a `webServer` array with the production build on port 3100 (`COMING_SOON=false`) and the same build on port 3101 (`COMING_SOON=true`), both with `SITE_URL`. Root script `pnpm test:e2e`. `vitest.config.mts` excludes `e2e/**`. `.gitignore` gets the Playwright report folders. Expected: `pnpm test:e2e` builds, starts both servers and runs `e2e/*.spec.ts`.
2. **CI.** `.github/workflows/ci.yml`: `SITE_URL` in the job environment, `pnpm --filter web exec playwright install --with-deps`, `pnpm test:e2e`, and the report uploaded on failure with `actions/upload-artifact` pinned to a commit.
3. **Site address.** `src/server/site/site-url.ts`: `parseSiteUrl` and `getSiteUrl()` read `SITE_URL`, the only place that does. In production it must be an `https` origin, or the build fails; otherwise it falls back to `http://localhost:3000`. `.env.example` gets `SITE_URL=`. Set it in the hosting environment before deploying.
4. **Page metadata.** `src/app/[lang]/layout.tsx`: `metadataBase: getSiteUrl()` and the title template `%s | LockMX`. `src/lib/site/public-paths.ts`: `publicPaths`, `localizedPath`, `languageAlternates`, `buildSitemap`. `src/server/site/page-metadata.ts`: `buildPageMetadata({ locale, path, title?, description })` gives each page its canonical address and its `pt-PT`, `en` and `x-default` alternates. Tests: `e2e/metadata.spec.ts`.
5. **Shell.** `src/app/[lang]/(marketing)/layout.tsx` composes `components/site/skip-link.tsx`, `site-header.tsx`, `<main id="main" tabIndex={-1}>` and `site-footer.tsx`, and passes them every string. `globals.css`: `html { scroll-padding-top: var(--header-height); }`, so a link into the page stops below the sticky header. The coming soon page stays outside the group and has no shell. Tests: `e2e/shell.spec.ts`.
6. **Header menu for narrow screens.** `components/site/site-header-navigation.tsx` (client): one navigation landmark with an `IconButton` (`menu`, `x` when open; `aria-expanded`, `aria-controls`) and the list. The list is hidden with `display` below `md` until the button opens it. It closes on Escape, on a link, on a change of page and when a `resize` finds the screen at `md` or wider. `SiteNavigationLink` in `site-navigation.tsx` is the link shared with the footer.
7. **Language switcher.** `components/language-switcher.tsx` shows `PT` and `EN` (`localeCodes` in `src/lib/i18n/config.ts`), with the name of the language after the code for assistive technology only; the language in use is bold and underlined.
8. **Not-found and error pages.** `(marketing)/not-found.tsx`; `(marketing)/[...rest]/page.tsx` calling `notFound()`, because without a root `app/not-found` an unknown address would not reach it; `(marketing)/error.tsx` (client, uses `retry`), which gets its text from `components/site/error-messages.tsx`, a provider the layout fills; `src/app/global-error.tsx` with its own `<html>` and the two texts of `src/lib/i18n/global-error-messages.ts`. Tests: `e2e/not-found.spec.ts`.
9. **Sitemap and robots.** `src/app/sitemap.ts` (`buildSitemap(getSiteUrl())`) and `src/app/robots.ts`. In `src/proxy.ts`, the rewrite to the placeholder sets `X-Robots-Tag: noindex`. Tests: `e2e/seo.spec.ts`, which uses the server on port 3101 for the header.
10. **Landing page and modular system page.** Sections in `components/site/sections/`: `section.tsx` (a named region with eyebrow and heading, `tabindex="-1"`), `hero.tsx`, `benefits.tsx`, `buy.tsx`, `complements.tsx`, `contact.tsx`, `modular-system.tsx`. `(marketing)/page.tsx` composes the landing page; `(marketing)/modular-system/page.tsx` the system page, whose path is in `publicPaths`. Section ids and their addresses: `src/lib/site/sections.ts`. Contact address: `src/lib/site/contact.ts`. `components/site/section-focus.tsx`, mounted by the layout, moves the focus to the section a link leads to. Images go in `public/brand/` at the size they are used, with `next/image`, dimensions and an alternative text. Tests: `e2e/landing.spec.ts`, `e2e/modular-system.spec.ts`.
11. **Placeholder legal pages.** `src/lib/site/legal-pages.ts` lists `/company`, `/privacy`, `/cookies` and `/terms`; each route under `(marketing)/` uses `src/server/site/pending-legal-page.tsx`, which shows `components/site/pending-page-view.tsx` and sends `noindex`. The footer lists them before the Complaints Book link. They are not in `publicPaths`. Tests: `e2e/legal-pages.spec.ts`.
12. **Dictionaries.** Every string and accessible name above is in `src/server/i18n/messages/pt.ts` and `en.ts`.
13. **Docs.** Update `docs/architecture.md` and the spec.

## Common errors

- The build fails with "SITE_URL": the variable is missing in a production build (step 3). Set it locally in `.env.local`, in CI and in the hosting environment.
- An unknown address under a locale shows the default Next.js 404 instead of the translated one: the catch-all route of step 8 is missing.
- An error boundary that calls `reset`: in this Next.js version the prop is `retry`. Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`.
- A test passes alone and times out with the four projects in parallel: raise `timeout` and `expect.timeout` (step 1), do not add waits.
- The skip link shows a sliver in WebKit: hide it with `-top-1 -translate-y-full`, and bring it back on focus.
- The menu stays open after the screen becomes wide, on mobile WebKit only: the `change` event of `matchMedia` did not fire there; ask `matchMedia(...).matches` on `resize` (step 6). In the test, check the closed state before resizing again: two quick resizes can reach the page as one.
- The focus does not follow a section link now and then, on WebKit: the listener was attached in a passive effect and missed a click made right after hydration. Use a layout effect (step 10). A section link followed from another page needs the same focus on a change of path.
- `getByRole` does not find an element hidden with `display: none`: use a plain locator to read its attributes.
- `pnpm test:e2e` ends at once with exit code -1073740791 on Windows: the runner crashed before any test. Run it again.
- A shell heredoc with an apostrophe in it fails on Git Bash: write the file with an editor or a script file.

## Verification

Run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm test:e2e` (it includes the production build). Then, on `pnpm build` and `pnpm start` with `SITE_URL` set:

| Request | Expected |
|---|---|
| `/pt`, `/en` | 200, one `h1`, header, footer, canonical link to itself |
| `/pt/modular-system` | 200, title `Sistema modular | LockMX`, header link marked as current |
| `/pt/no-such-page` | 404, translated page inside the shell |
| `/sitemap.xml` | Both home pages and both modular system pages, absolute, no placeholder |
| `/robots.txt` | `Allow: /` and the sitemap address |
| `/pt` with `COMING_SOON=true` | The placeholder, with `X-Robots-Tag: noindex` |
| `/pt/privacy` | 200, "Em implementação", `noindex`, not in the sitemap |

By eye, at 320, 768, 1024 and 1440 px: the header (menu button below 768 px, links from there up), the landing page and the modular system page, with no sideways scroll.
