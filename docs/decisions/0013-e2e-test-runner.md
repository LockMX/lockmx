# 0013. Playwright as end-to-end test runner

- Status: proposed
- Date: 2026-10-09

## Context

Every task ships with tests, written first (`../workflow.md`). Pages in this project are async Server Components: they read the locale and the dictionary on the server. Vitest does not support them (ADR 0004), and the Next.js documentation recommends end-to-end tests for async components. `../architecture.md` therefore lists end-to-end tests as planned and not set up. Until a runner exists, a spec that builds pages (the landing page is the first) cannot follow the test-first rule.

Spec 003 also left gaps that only a real browser closes: no component was checked in Safari or Firefox, and from T7 on the widths 768 and 1024 px were not checked (`../specs/003-design-system.md`, task notes T12).

Constraints: the repository runs Node 24 (`.nvmrc`) with a floor of 22.12 (ADR 0004), uses pnpm from the root, and runs CI on GitHub Actions (`ubuntu-latest`).

## Decision

Use Playwright Test (`@playwright/test`) for end-to-end tests of `apps/web`.

- Development dependency only. It needs owner approval before it is installed, like any dependency.
- Version pinned exactly. 1.64.0 was published on 2026-10-07, two days before this ADR; 1.63.0 (2026-09-04) is the version to install, following the rule used for `lucide-react` in spec 003 (a release at least two weeks old). Dependabot proposes the updates.
- Tests run against the production build, as the Next.js guide recommends: the `webServer` option starts the built app and waits for it, with `reuseExistingServer: !process.env.CI`.
- Browsers: Chromium, Firefox and WebKit projects, plus one mobile viewport. The exact project list is set in the spec that installs it.
- A separate script, `pnpm test:e2e`, from the root. `pnpm test` stays the unit run (Vitest) and stays fast.
- Test files live in `apps/web/e2e/`. `apps/web/vitest.config.mts` sets no `include`, so the Vitest configuration must exclude that folder in the same task; otherwise `pnpm test` would try to run them.

Nothing is installed by this ADR. The first task of the spec that needs it (004, landing page) does the installation, after the versions and the configuration are confirmed against the Playwright documentation on that day.

## Alternatives considered

- Cypress (16.1.1, MIT): supported by a Next.js guide as well. Not chosen because its documentation lists Firefox and Chrome-family browsers only, with no mention of WebKit. Safari is the browser spec 003 could not check, and it is the default on the iPhone, so the runner must cover it.
- Vitest browser mode: not evaluated. It is component testing in a browser, and the gap is whole pages rendered by the server.
- Manual browser checks only, as in spec 003: kept as a complement, but they do not satisfy the test-first rule and are not repeated on every change.

## Consequences

- The definition of done in `../workflow.md` gains `pnpm test:e2e` for tasks that add or change a page. To be edited in the task that installs the runner.
- CI gains two steps: installing the browsers (`playwright install --with-deps`, a download on every run unless cached) and running the tests after the build. CI time grows; how much is measured in that task, not estimated here.
- WebKit in Playwright is the engine, not Safari itself. A check on a real iPhone before launch is still needed.
- Playwright states supported systems of Windows 11+, macOS 14+ and Debian or Ubuntu LTS. Development is on Windows 11 and CI on Ubuntu, both covered.
- Browser binaries are downloaded to the machine cache, outside the repository. Reports and traces (`playwright-report/`, `test-results/`) must be git-ignored.
- Pages behind the `COMING_SOON` switch (`proxy.ts`) are tested with the variable unset; one test covers the switch itself.
- Accessibility checks inside the end-to-end run (for example with `@axe-core/playwright`) are a possible later addition. It would be another dependency and is not decided here.

## Sources

- Next.js bundled docs 16.3.6, `apps/web/node_modules/next/dist/docs/01-app/02-guides/testing/index.md` (async Server Components: end-to-end recommended), `playwright.md` (Chromium, Firefox and WebKit; run against production code; `webServer`) and `cypress.md` (2026-10-09).
- Playwright: https://playwright.dev/docs/intro (Node 22, 24 or 26; supported systems; browsers; mobile emulation) and https://playwright.dev/docs/test-webserver (`webServer`, `reuseExistingServer: !process.env.CI`) (2026-10-09).
- npm registry, `@playwright/test`: latest 1.64.0 published 2026-10-07, 1.63.0 published 2026-09-04, licence Apache-2.0, `engines.node >=20` (https://registry.npmjs.org/@playwright/test, 2026-10-09). The registry and the installation page differ on the minimum Node version; the project runs 24, inside both.
- Cypress: https://docs.cypress.io/app/get-started/why-cypress (Firefox and Chrome-family browsers; the app is free, Cypress Cloud is paid) and the npm registry entry (16.1.1, MIT) (2026-10-09).
