# Checklists

Per-module procedures, written from what was actually done in this project, to serve as a base for future projects. Each checklist must allow repeating the module without consulting anything else.

A checklist is created or updated when the module is finished, not before. All new checklists are written in English.

## Planned modules

Product pages, cart and checkout hand-over, cookies and analytics.

## Files

- `00-foundation.md`: technical foundation (pnpm monorepo, typecheck, unit tests, commit convention, CI).
- `01-i18n.md`: internationalization with PT-PT and EN (locale in the URL, negotiation, dictionaries, switcher, lint rule).
- `02-design-system.md`: design system (tokens as the only Tailwind theme, contrast and theme guards, fonts, brand assets, component conventions, test strategy and doubles, browser check).
- `03-public-site.md`: public site (Playwright in three engines and CI, site address and page metadata, shell with skip link, header menu and footer, not-found and error pages, sitemap and robots, landing page, placeholder legal pages). The company page and the cookie policy are still to come.
- `03a-policy-texts.md`: the policy texts (privacy, terms, returns): where they live, how to change them, and how to import and translate a new one, with `policy-texts-import.py`, the converter from a Termly HTML export.
- `04-shop-home.md`: shop home connected to Shopify (product shapes and example data, featured products carousel, listings and filters, Storefront API client, sections from the store's menu, search suggestions and their rate limit). The check of supplier products through Collective is still to come.

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
