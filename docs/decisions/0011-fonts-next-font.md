# 0011. Fonts: self-hosted through next/font

- Status: accepted
- Date: 2026-10-08

## Context

The design system uses three families: Geist (body and UI), Geist Mono (SKUs, order numbers, codes) and Barlow Condensed (display: headlines, buttons, prices). Geist and Geist Mono are already loaded in `app/[lang]/layout.tsx`. The imported `tokens/fonts.css` loads all three with a CSS `@import` from `fonts.googleapis.com`, which makes every visitor's browser contact Google. For a site with personal data and a pending cookie consent decision, that is an avoidable third-party request.

Barlow Condensed is a stand-in chosen by the design tool for the logo's custom slanted lettering; the client has not supplied a font file. It is not a variable font in the Next.js font data: weights 100 to 900, styles normal and italic (checked in `next/dist/compiled/@next/font/dist/google/font-data.json`, 2026-10-07), so weights must be listed.

## Decision

- Load the three families with `next/font/google`, which downloads the font files at build time and serves them from the site's own domain, so the browser makes no request to Google (Next.js docs, `components/font.md`).
- Barlow Condensed: only the italic style at weights 700, 800 and 900, subset `latin`, since the design uses it only as heavy italic caps (buttons 700, headings and prices 800, display 900). Any other weight or style is added only when a component needs it.
- Fonts are exposed as CSS variables on `<html>` and consumed by the tokens (`--font-display`, `--font-sans`, `--font-mono`).
- The stand-in status is recorded in `docs/design/`. If the client supplies the real lettering, it replaces Barlow Condensed through `next/font/local` without touching components.

## Alternatives considered

- Keep the Google Fonts `@import`: rejected (third-party request).
- Load no display font and use Geist only: loses the main brand typographic trait.

## Consequences

- No runtime request to Google Fonts. The font files are fetched at build time.
- A build without network access to Google Fonts fails; CI needs it.

## Sources

- Next.js bundled docs 16.3.6, `apps/web/node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md` (2026-10-07): `weight`, `style`, `subsets`, `display`, `variable`.
- Imported `tokens/fonts.css`, `tokens/typography.css`, `readme.md`, 2026-10-07.
