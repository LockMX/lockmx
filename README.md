# LockMX

Online store for LockMX: motocross products (tyres and racks for carrying equipment inside vans). A single Next.js site covering marketing, shop, customer area and admin panel, in PT-PT and EN.

## Prerequisites

- Node.js 22.12 or later (`.nvmrc` pins the version used locally and in CI).
- pnpm, at the version in `packageManager` in `package.json`.

## Install and run

```bash
pnpm install
pnpm dev
```

The site runs at http://localhost:3000.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the development server. |
| `pnpm build` | Production build. |
| `pnpm lint` | ESLint. |
| `pnpm typecheck` | Next.js type generation, then the TypeScript compiler without emitting. |
| `pnpm test` | Unit tests (Vitest). |

## Documentation

Everything about how the project is specified, decided and built is in [`docs/README.md`](docs/README.md). Rules for contributors and agents are in [`AGENTS.md`](AGENTS.md).
