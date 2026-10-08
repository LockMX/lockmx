# Components

The inventory of `apps/web/src/components/ui/`. Each component task of spec 003 adds its rows here; a component that is not listed does not exist yet.

## Rules

- **Text comes from the page.** Every visible string and every accessible name (`alt`, `aria-label`, `title`) is a prop. A component holds no Portuguese or English text and never reads a dictionary: the page calls `getMessages()` and passes strings down (`../architecture.md`, Internationalization).
- **Server Component by default.** `"use client"` only where the component holds state or effects.
- **Native elements first.** A link is an `<a>`, an action is a `<button>`, a choice is a real input. Nothing else is clickable.
- **Props** extend the native element's props, so `aria-*`, `name`, `form` and `ref` work. `className` is for layout (size, margin, placement). `style` is not accepted.
- **Tests** are written first and sit next to the component.
- **Imports.** Code outside `components/ui/` imports from `@/components/ui` (`index.ts`), never from the file of a component.
- **Classes** are joined with `classNames` (`components/ui/class-names.ts`). There is no class merging: a `className` from the caller must not repeat a property the component already sets (size, colour, display).

## Inventory

| Component | Group | File | Client | Props | States | Text props |
|---|---|---|---|---|---|---|
| `Logo` | core | `core/logo.tsx` | no | `variant` (`lockup`, `wide`, `wordmark`; default `wordmark`), `tone` (`dark`, `light`, `mono`; default `dark`), `sizes` (required), `className`, other `next/image` props except `src`, `width`, `height`, `fill`, `style` | none (static image) | `alt` (required) |
| `Icon` | core | `core/icon.tsx` | no | `name` (closed set of 24 Lucide icons), `size` (`sm`, `md`, `lg`; default `md`), `className` | none | none: always decorative |
| `Button` | core | `core/button.tsx` | no | `variant` (`primary`, `secondary`, `outline`, `outline-inverse`, `ghost`, `danger`; default `primary`), `size` (`sm`, `md`, `lg`; default `md`), `slanted`, `fullWidth`, `iconLeft`, `iconRight`, `loading`, native `button` props (`type` defaults to `button`) | hover, active, focus, disabled, loading (`aria-busy`, spinner, not activatable) | `children` |
| `ButtonLink` | core | `core/button-link.tsx` | no | the appearance props of `Button`, `iconLeft`, `iconRight`, `next/link` props (`href` required) | hover, active, focus | `children` |
| `IconButton` | core | `core/icon-button.tsx` | no | `icon`, `variant` (`ghost`, `ghost-inverse`, `outline`, `primary`, `secondary`; default `ghost`), `size` (`sm`, `md`, `lg`; default `md`), `count`, native `button` props | hover, focus, disabled | `label` (required: accessible name and tooltip) |
| `Badge` | core | `core/badge.tsx` | no | `tone` (`neutral`, `accent`, `success`, `danger`, `info`, `warning`, `inverse`; default `neutral`), `variant` (`soft`, `solid`; default `soft`), `shape` (`pill`, `slant`; default `pill`), `dot`, native `span` props | none | `children` (required) |

Usage notes for `Logo` are in `brand.md`.

## Notes per component

- **Icon.** Adding an icon is one import and one line in the map in `core/icon.tsx`. An icon never has a name of its own: the control around it does (ADR 0010).
- **Button.** Navigation uses `ButtonLink`, so it is an anchor; `Button` is only for actions. While `loading` the native `disabled` attribute is set, which is what keeps the button a Server Component; the page changes the label if it wants the wait announced in words. `variant="outline-inverse"` and the `ghost-inverse` icon button belong on an inverse surface.
- **Slanted button.** The background is a clipped pseudo-element, not the button itself, so the focus outline is not cut. It has no visible border, so the outline variants are not meant to be slanted.
- **IconButton.** With a `count` above zero the accessible name is the label followed by the number ("Carrinho 3"), and the number is not read a second time.
- **Badge.** Always has text. `dot` and colour are additions to it.
