# 001. Technical foundation

- Status: draft
- Idea: `../ideas/project-brief.md`
- Decisions: `../decisions/0001-monorepo-single-web-app.md`, `../decisions/0002-orm-drizzle-postgresql.md`, `../decisions/0004-unit-test-runner.md`

## Objective

Give the repository the tooling that every later spec relies on: typecheck, unit tests, enforced commit convention, continuous integration and an accurate description of the current architecture. After this spec, "lint, typecheck, tests and build pass" is a command the project can actually run and check automatically.

## Out of scope

Everything that needs an external service or an undecided ADR. Each of these gets its own spec:

- Database, Drizzle setup and schema (needs the database provider ADR).
- Authentication (ADR 0003 is still a proposal).
- i18n routing and dictionaries.
- End-to-end tests (Playwright), once there are real flows to cover.
- Design system and UI.
- `.env.example`: created with the first environment variable, in the spec that introduces it.

## Current state (verified 2026-09-30)

- Next.js 16.3.6, React 19.2.8, TypeScript 5, ESLint 9 with `eslint-config-next`, Tailwind 4, React Compiler enabled. `pnpm lint` and `pnpm build` pass from the root.
- No typecheck script, no test runner, no CI, no commit hooks, no root `README.md`. `apps/web/README.md` is still the `create-next-app` default.
- Local Node is 24.15.0. Next.js requires Node >= 20.9.0; Vitest 5 requires Node >= 22.12.0 (ADR 0004), which becomes the project minimum.

## Sources

- Next.js bundled docs (16.3.6), `apps/web/node_modules/next/dist/docs/01-app/`, 2026-09-30:
  - `02-guides/testing/vitest.md`: manual setup packages (`vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/dom`, `vite-tsconfig-paths`) and `vitest.config.mts`. Vitest does not support async Server Components, so unit tests cover plain modules and synchronous components; pages are covered later by end-to-end tests.
  - `01-getting-started/01-installation.md`: minimum Node.js version 20.9.
- Vitest: https://vitest.dev/guide/ and https://vitest.dev/guide/migration.html, 2026-09-30. Version 5 is the current stable major (requires Vite >= 6.4.0 and Node >= 22.12.0) and changed mock defaults; the Next.js guide may predate it.
- pnpm/action-setup: https://github.com/pnpm/action-setup, 2026-09-30. Version is read from `packageManager`. The page recommends `pnpm/setup@v1` for pnpm 11 and later; confirm which to use in T5.
- Husky: https://typicode.github.io/husky/get-started.html, 2026-09-30.
- commitlint: https://commitlint.js.org/guides/local-setup.html, 2026-09-30. Requires the `commit-msg` hook; the `type-enum` rule sets the allowed types.

Anything not listed here (exact versions, options) is confirmed against the official documentation at the moment of the task, and the source is added to the commit's task notes in this spec.

## Working branch

`feat/001-technical-foundation`. Tasks are committed in order. The pull request is opened at the end, so the CI created in T5 runs on the whole spec. Push and PR need the owner's authorization.

## Tasks

### T1. Typecheck script
- Description: add a `typecheck` script to `apps/web` running the TypeScript compiler without emitting, and a root `typecheck` script that delegates to it.
- Planned files: `apps/web/package.json`, `package.json`.
- Acceptance criteria: `pnpm typecheck` passes from the root and fails when a type error is introduced.
- Tests: no test file. Verified by introducing a deliberate type error, seeing it fail, and removing it.
- Commit: `arch: add typecheck script`

### T2. Unit test runner
- Description: set up Vitest for `apps/web` (ADR 0004), starting from the Next.js guide (config file, jsdom environment, tsconfig paths so `@/` works) and checking each step against the current Vitest 5 documentation, with one smoke test that imports through the `@/` alias to prove the setup. Add `test` scripts to `apps/web` and the root.
- Planned files: `apps/web/package.json`, `apps/web/vitest.config.mts`, one smoke test under `apps/web/src`, `package.json`, `pnpm-lock.yaml`.
- Acceptance criteria: `pnpm test` passes from the root; the smoke test fails if the alias is broken; lint and build still pass.
- Tests: the smoke test itself.
- Dependencies: the packages listed in the Next.js guide, as dev dependencies. Approved by this spec once the owner approves it. Exact versions confirmed at install time.
- Commit: `arch: add vitest unit test runner`

### T3. Record the commands
- Description: update `docs/workflow.md` and the "Commands" section of `AGENTS.md` with the real commands now available (`pnpm dev`, `build`, `lint`, `typecheck`, `test`) and the definition of done for a task.
- Planned files: `docs/workflow.md`, `AGENTS.md`.
- Acceptance criteria: every command mentioned exists and was run once to check it.
- Tests: no tests (documentation).
- Commit: `docs: record typecheck and test commands`

### T4. Commit convention enforcement
- Description: add Husky and commitlint so the convention in `docs/workflow.md` is enforced by a `commit-msg` hook: types `feat`, `arch`, `fix`, `refactor`, `docs`; lowercase imperative subject; no footer or trailers (so no `Co-Authored-By`); ASCII only, so no icons. If the ASCII rule cannot be expressed with commitlint's built-in rules, use the smallest custom rule and document why.
- Planned files: root `package.json` (`prepare` script), `.husky/commit-msg`, `commitlint.config.*`, `pnpm-lock.yaml`.
- Acceptance criteria: a valid message is accepted; an unknown type, an uppercase subject, a trailer and an emoji are each rejected with a clear error. The hook installs automatically on `pnpm install`.
- Tests: run commitlint against a fixed list of valid and invalid messages and record the results in the task notes.
- Commit: `arch: enforce commit convention with husky and commitlint`

### T5. Continuous integration
- Description: add a GitHub Actions workflow that runs on pull requests and on pushes to `main`: checkout, pnpm and Node setup with dependency cache, `pnpm install --frozen-lockfile`, lint, typecheck, test, build. Read-only permissions, and cancel superseded runs on the same ref. Pin the Node version in one place (for example `.nvmrc` or the `engines` field). It must be at least 22.12.0 (Vitest 5, ADR 0004); pick the exact line after checking the Node.js release schedule.
- Planned files: `.github/workflows/ci.yml`, the Node version file or field.
- Acceptance criteria: the workflow file is valid; every step matches a command that passes locally; it runs green on the spec's pull request.
- Tests: the first green run on the pull request is the verification. Until then, the same steps are run locally in the same order.
- Commit: `arch: add github actions ci workflow`
- Owner action after the first green run: enable branch protection on `main` requiring the CI check and pull requests. This is a GitHub setting, not code.

### T6. Root README
- Description: add a root `README.md` (what the project is, prerequisites, install and run commands, link to `docs/README.md`) and replace the `create-next-app` default in `apps/web/README.md` with a short pointer to it.
- Planned files: `README.md`, `apps/web/README.md`.
- Acceptance criteria: following the README from a clean clone works (`pnpm install`, `pnpm dev`).
- Tests: no tests (documentation).
- Commit: `docs: add root readme`

### T7. Architecture document
- Description: create `docs/architecture.md` describing the current structure: monorepo layout, the single web app, the route groups, the server layer and its boundary rules (`server-only`, data access layer, DTOs, validation and authorization in every action, environment variables read only in the server layer), how pages are tested, and a table linking each choice to its ADR. Folders are documented as the target structure and are created only when first used; no empty folders are added.
- Planned files: `docs/architecture.md`, `docs/README.md` (link).
- Acceptance criteria: every statement matches either an ADR or the code; every folder it describes is marked as existing or planned.
- Tests: no tests (documentation).
- Commit: `docs: add architecture document`

### T8. Foundation checklist
- Description: write `docs/checklists/00-foundation.md` in English, from what T1-T7 actually did, replacing the foundation part of the legacy Portuguese checklist (pnpm install, monorepo, typecheck, tests, hooks, CI, structure). The legacy file stays for the modules not yet redone (i18n, database, server actions) and is removed when the last of them is replaced.
- Planned files: `docs/checklists/00-foundation.md`, `docs/checklists/README.md`.
- Acceptance criteria: each step names the exact command or file and the expected result, and matches the repository.
- Tests: no tests (documentation).
- Commit: `docs: add foundation checklist`

## Definition of done

All tasks committed, `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass locally and in CI, and the spec status is `done`.
