# Components

The inventory of `apps/web/src/components/ui/`. Each component task of spec 003 adds its rows here; a component that is not listed does not exist yet.

## Rules

- **Text comes from the page.** Every visible string and every accessible name (`alt`, `aria-label`, `title`) is a prop. A component holds no Portuguese or English text and never reads a dictionary: the page calls `getMessages()` and passes strings down (`../architecture.md`, Internationalization).
- **Server Component by default.** `"use client"` only where the component holds state or effects.
- **Native elements first.** A link is an `<a>`, an action is a `<button>`, a choice is a real input. Nothing else is clickable.
- **Props** extend the native element's props, so `aria-*`, `name`, `form` and `ref` work. `className` is for layout (size, margin, placement). `style` is not accepted.
- **Tests** are written first and sit next to the component.

## Inventory

| Component | Group | File | Client | Props | States | Text props |
|---|---|---|---|---|---|---|
| `Logo` | core | `core/logo.tsx` | no | `variant` (`lockup`, `wide`, `wordmark`; default `wordmark`), `tone` (`dark`, `light`, `mono`; default `dark`), `sizes` (required), `className`, other `next/image` props except `src`, `width`, `height`, `fill`, `style` | none (static image) | `alt` (required) |

Usage notes for `Logo` are in `brand.md`.
