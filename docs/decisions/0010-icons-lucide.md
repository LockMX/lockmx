# 0010. Icons: lucide-react

- Status: accepted
- Date: 2026-10-08

## Context

The design system picked Lucide as its icon set (2px stroke, round caps), because the repository has no icon set. In the imported project the `Icon` component renders icons from `window.lucide`, loaded from a CDN script (`unpkg.com/lucide@0.468.0`). A third-party script loaded at runtime from a CDN is not acceptable for a shop that handles payments and personal data (supply chain and availability), and it does not work with server rendering.

## Decision

Use the `lucide-react` package (new production dependency, needs owner approval) and import only the icons used, by name, in the `Icon` component. `Icon` takes a name from a closed set defined in code, not an arbitrary string, so the bundle contains only those icons and a typo fails the type check.

Icons are decorative by default (`aria-hidden`). An icon that carries meaning on its own gets an accessible name through its parent control (`aria-label` on the button), not through the icon.

## Alternatives considered

- Keep the CDN script: rejected (see Context).
- Inline SVG subset written by hand: no dependency, but about 25 hand-maintained paths and no upstream fixes. Acceptable fallback if the owner does not approve the dependency.
- Another set (Heroicons, Phosphor): not evaluated; Lucide was the design system's choice and its stroke style matches the display type.

## Consequences

- One small production dependency (ISC licence according to the Lucide site).
- Adding an icon is a one-line change in the icon map.

## Sources

- Lucide guide for `lucide-react`: https://lucide.dev/guide/packages/lucide-react (2026-10-07): tree-shaken named imports, size, colour and stroke width props, ISC licence. The page does not state the `aria-hidden` default or React 19 support; both are confirmed in the package documentation and tests at install time (spec 003, T4) before the dependency is added.
- Imported `components/core/Icon.jsx` and `readme.md` (Iconography), 2026-10-07.
