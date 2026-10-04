# Checklist: technical foundation

Repeats the setup done in spec 001 (`../specs/001-technical-foundation.md`): a pnpm monorepo with one Next.js app, typecheck, unit tests, enforced commit convention and CI. Versions below are the ones used on 2026-10; confirm each step against the current official documentation before repeating it.

## Prerequisites

- Node.js 22.12 or later (Vitest 5 requirement). `.nvmrc` pins the line used locally and in CI (`24`).
- pnpm at the version in `packageManager` (root `package.json`).
- A Git repository.

## Steps

1. **Monorepo.** Root `package.json` (`"private": true`, `"packageManager"`), `pnpm-workspace.yaml` with `apps/*` and `packages/*`, one `pnpm-lock.yaml`. Expected: `pnpm install` from the root installs every workspace.
2. **Web app.** `apps/web` created with `create-next-app` (TypeScript, ESLint, Tailwind, React Compiler, `src/`, App Router, `@/*` alias). Expected: `pnpm dev` serves http://localhost:3000, `pnpm build` and `pnpm lint` pass.
3. **Root scripts.** Root `package.json` scripts `dev`, `build`, `lint`, `typecheck`, `test`, each running `pnpm --filter web <script>`.
4. **Typecheck.** `apps/web/package.json`: `"typecheck": "tsc --noEmit"`. Expected: `pnpm typecheck` passes, and fails after adding `const x: number = "a"` to a file (remove it afterwards).
5. **Unit tests.** From the root: `pnpm add -D --filter web vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom`, plus `@types/node@^22` so the Vitest peer dependency is met. Create `apps/web/vitest.config.mts` with the React plugin, `resolve.tsconfigPaths: true` and `test.environment: "jsdom"`. Add `"test": "vitest run"` to `apps/web/package.json`. Add `src/test/smoke.test.ts`, importing through `@/`. Expected: `pnpm test` passes, and fails with "Failed to resolve import" when the alias in the test is broken. `pnpm peers check` reports no issues.
6. **Commit hook.** From the root: `pnpm add -D -w husky @commitlint/cli`, script `"prepare": "husky"`, run `pnpm run prepare`. Create `.husky/commit-msg` containing `pnpm exec commitlint --edit "$1"`. Expected: `git config core.hooksPath` prints `.husky/_`.
7. **Commit rules.** `commitlint.config.js` with `type-enum` (`feat`, `arch`, `fix`, `refactor`, `docs`), lower-case type and subject, no trailing full stop, header up to 72 characters, `footer-empty` (rejects trailers) and a local `ascii-only` rule (no built-in rule restricts the character set). Expected: `printf 'feat: add thing' | pnpm exec commitlint` exits 0; an unknown type, an uppercase subject, a `Co-Authored-By` trailer and an emoji each exit non-zero with a message naming the rule.
8. **CI.** `.nvmrc` with the Node line, `.github/workflows/ci.yml` with `actions/checkout`, `actions/setup-node` (`node-version-file: .nvmrc`), `pnpm/setup` (pnpm 11 and later, reads `packageManager`, `cache: true`, `install: false`), then `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. Top-level `permissions: contents: read` and a `concurrency` group with `cancel-in-progress`. Expected: the workflow is green on a pull request.
9. **Branch protection (GitHub setting, owner action).** After the first green run, require pull requests and the CI check on `main`, and allow only "rebase and merge".
10. **Docs.** Root `README.md`, `docs/architecture.md`, and the commands recorded in `docs/workflow.md` and `AGENTS.md`.

## Common errors

- `pnpm peers check` reports an unmet `@types/node`: Vitest 5 wants `^22` or `>=24`. Raise `@types/node`.
- Vite warns that `vite-tsconfig-paths` is no longer needed: use `resolve.tsconfigPaths: true` instead of the plugin.
- Commits rejected by the hook: read the rule name in brackets in the commitlint output.
- A fresh clone has no hook: run `pnpm install` (it runs `prepare`).

## Verification

From a clean clone, in this order, all must pass: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. Then `git commit` with a message that breaks the convention must be rejected.
