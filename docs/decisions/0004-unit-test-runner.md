# 0004. Vitest as unit test runner

- Status: accepted
- Date: 2026-09-30

## Context

Every task ships with tests (test first, in the same commit). The project needs a unit and integration test runner for plain TypeScript modules (business logic, pricing, stock, webhook handling) and synchronous components. Pages built as async Server Components are covered by end-to-end tests, because neither candidate supports them, according to the Next.js documentation.

The repository is ESM-first (`"type": "module"` at the root).

## Decision

Use Vitest, configured for `apps/web` following the Next.js guide and confirmed against the Vitest documentation at install time (the current stable major is 5).

Consequence for the toolchain: the minimum Node.js version becomes 22.12, which is above the Next.js minimum of 20.9.0. Local development runs Node 24.15.0.

## Alternatives considered

- Jest with `next/jest`: first-party integration with the Next.js compiler and no extra bundler. Not chosen because ECMAScript Modules support in Jest is still documented as experimental (it needs `--experimental-vm-modules`, and `jest.mock` does not work with ESM). The choice is cheap to reverse, since the two APIs are largely compatible.

## Consequences

- Vite becomes a dev dependency, used only for tests, next to the Next.js build.
- The version floor of Node.js (22.12) applies to local development and CI, and becomes a requirement for the hosting ADR: the chosen host must support it.
- Vitest 5 introduced breaking changes (for example `clearMocks` enabled by default and stricter `vi.mock` placement). The setup in the Next.js guide may predate them, so the configuration is checked against the Vitest documentation when installing.
- Speed benchmarks from blog posts were not used as an argument.

## Sources

- Vitest: https://vitest.dev/guide/why.html, https://vitest.dev/guide/, https://vitest.dev/guide/migration.html (2026-09-30).
- Jest: https://jestjs.io/docs/getting-started, https://jestjs.io/docs/ecmascript-modules (2026-09-30).
- Next.js bundled docs 16.3.6, `apps/web/node_modules/next/dist/docs/01-app/02-guides/testing/` (`index.md`, `jest.md`, `vitest.md`) and `01-app/01-getting-started/01-installation.md` (2026-09-30).
