# Checklists

Per-module procedures, written from what was actually done in this project, to serve as a base for future projects. Each checklist must allow repeating the module without consulting anything else.

A checklist is created or updated when the module is finished, not before. All new checklists are written in English.

## Planned modules

Technical foundation (from pnpm to folder structure), customer area, cart, payments, backend, database, invoicing certified by the Portuguese tax authority (AT), admin panel, emails, i18n, cookies and analytics.

## Files

- `00-foundation.md`: technical foundation (pnpm monorepo, typecheck, unit tests, commit convention, CI). Replaces the foundation part of the legacy checklist.
- `01-i18n.md`: internationalization with PT-PT and EN (locale in the URL, negotiation, dictionaries, switcher, lint rule). Replaces the i18n part of the legacy checklist.
- `02-design-system.md`: design system (tokens as the only Tailwind theme, contrast and theme guards, fonts, brand assets, component conventions, test strategy and doubles, browser check).
- `nextjs-project-checklist.md`: legacy checklist, in Portuguese, from a simpler Next.js project. Still the reference for the modules not yet redone (database, server actions), and removed when the last of them is replaced. Do not follow it without confirming each step against the current documentation.

## Template

```md
# Checklist: <module>

## Prerequisites
## Steps
Each step with the exact command or file and the expected result.
## Common errors
## Verification
How to confirm the module is correct.
```
