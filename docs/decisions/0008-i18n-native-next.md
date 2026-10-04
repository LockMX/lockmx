# 0008. Internationalization with the native Next.js pattern

- Status: proposed
- Date: 2026-10-04

## Context

The site is published in PT-PT and EN only (`ideas/project-brief.md`). All visible text goes through i18n (`AGENTS.md`). The Next.js documentation bundled with the installed version (16.3.6) describes a library-free approach: one dictionary per locale, a `[lang]` root segment, locale negotiation in `proxy.ts` from the `Accept-Language` header, and `generateStaticParams` for static rendering. It also lists third-party libraries (`next-intl`, `lingui`, `tolgee` and others) without comparing them.

Choices already made by the owner for this decision: locale in the URL path, always prefixed (`/pt/...`, `/en/...`); first-visit locale from `Accept-Language`, with PT as fallback; no cookie to remember the choice, so this does not depend on the open cookie consent decision.

## Decision

Use the pattern from the Next.js guide, with no i18n library:

- Locales `pt` and `en` as URL segments. The `<html lang>` attribute is `pt-PT` for `pt` and `en` for `en`.
- Typed dictionaries (one TypeScript module per locale, the Portuguese one defining the type), loaded on the server, read in Server Components through the locale root parameter (`next/root-params`).
- Locale negotiation in `proxy.ts` with `@formatjs/intl-localematcher` and `negotiator`, the two packages the guide uses for this. They parse `Accept-Language` and match it to the supported locales. Writing this by hand means handling quality values and region fallbacks (`pt-BR` to `pt`), where mistakes are easy.
- Number, currency and date formatting with the platform `Intl` API, with the locale as argument.

## Alternatives considered

- A library such as `next-intl`: ready-made message formatting (plurals, rich text) and helpers. Not chosen for now because it adds a production dependency and its own conventions before the project has content that needs them. Not evaluated against its documentation in this ADR. If plural or rich-text needs outgrow `Intl` and plain strings, a new ADR evaluates the libraries and supersedes this one. Moving later is contained, since components read text from one place.
- Locale in a cookie or a domain per language: not chosen. A cookie links this work to the open consent decision, and domains need hosting decisions that are still open.

## Consequences

- Two small production dependencies (`@formatjs/intl-localematcher`, `negotiator`), approved with the spec.
- Plurals and interpolation are written by hand per message until a real need appears.
- Every page and layout lives under `app/[lang]`. `proxy.ts` is also where later specs (authentication) add their own checks, so it is kept small and tested.
- Dictionary type safety is by TypeScript plus a test that both locales have the same keys.

## Sources

- Next.js bundled docs 16.3.6, `apps/web/node_modules/next/dist/docs/01-app/02-guides/internationalization.md`, `03-api-reference/04-functions/next-root-params.md`, `03-api-reference/03-file-conventions/proxy.md` (2026-10-04).
