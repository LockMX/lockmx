# 0009. Styling: design tokens as CSS variables, consumed through Tailwind

- Status: accepted
- Date: 2026-10-08

## Context

The client's visual identity was turned into a design system in Claude Design (project "LockMX Design System", imported 2026-10-07): colour, type, spacing, radii, shadow, motion tokens and 22 React primitives. `apps/web/AGENTS.md` requires that no colour, size or typography is ad hoc and that everything uses design system tokens.

The imported components are written with inline `style` objects and JavaScript hover state (`useState` for hover and press). That cannot be used as is: inline styles cannot express `:hover`, `:focus-visible`, media queries or `prefers-reduced-motion`, they force client components for purely visual behavior, and they bypass the Tailwind setup that already exists in the app (`tailwindcss` 4.3.3, `@tailwindcss/postcss`).

The token names in the design system collide with Tailwind v4 theme namespaces: `--text-*` is the font-size namespace in Tailwind, while the design system uses `--text-strong`, `--text-body` and `--text-muted` as colours next to `--text-md` as a size (Tailwind theme docs, 2026-10-07).

## Decision

- The design system tokens live in one CSS file in the app (`apps/web/src/styles/tokens.css`), as plain custom properties on `:root`, with the names the design system already uses. This file is the single source of truth. `docs/design/` documents how to use them and points to the file; it does not copy the values.
- Tailwind is wired to the tokens with `@theme inline`, mapping each token into a Tailwind namespace under an explicit name (`--color-*`, `--font-*`, `--radius-*`, `--shadow-*`, `--ease-*`, ...). The default Tailwind palette and sizes are reset (`--color-*: initial`), so utilities for colours that are not in the design system do not exist.
- Components are styled with Tailwind utility classes that resolve to tokens. No inline `style` for visual rules, no raw hex values, no raw `px` values.
- Hover, press, focus, disabled and invalid states are CSS (`hover:`, `active:`, `focus-visible:`, `disabled:`, `aria-invalid:`, data attributes). A component is a client component only when it holds interaction state.

## Alternatives considered

- Keep inline styles as imported: rejected for the reasons in Context.
- CSS Modules per component: workable, but it adds a second styling system next to the Tailwind setup that already exists, and utilities are needed anyway for layout.
- A component library (shadcn/ui, Radix Themes): rejected for now. It brings its own visual language that would have to be overridden, and the design system here is already specified. Headless behavior (dialog, tabs) is handled with native elements and ARIA first; a library is reconsidered per component only if a native approach fails a requirement (new ADR).
- Use Tailwind's default theme and add the brand colours on top: rejected. It would leave off-brand colours available to every component.

## Consequences

- One place to change a colour or a radius.
- The token file must keep the colour tokens out of Tailwind's `--text-*` namespace (map them as `--color-text-strong`, etc.).
- The imported `.jsx` components are references to port, not code to copy.

## Sources

- Tailwind CSS theme variables: https://tailwindcss.com/docs/theme (2026-10-07): namespaces, `@theme inline`, resetting a namespace.
- Installed versions checked in `apps/web/package.json` and `node_modules/tailwindcss/package.json` (4.3.3), 2026-10-07.
- Design system project files `readme.md`, `tokens/*.css`, `components/**/*.jsx`, read 2026-10-07.
