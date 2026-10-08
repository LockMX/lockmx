# Foundations

Roles and usage rules. Values are in `apps/web/src/styles/tokens.css`; how a token becomes a utility is in `README.md`. Source for the rules: the imported `readme.md` and `guidelines/` of the design system project (read 2026-10-07 and 2026-10-08), corrected by the findings of spec 003.

## Colour

Three brand colours come from the logo: Lock Yellow (`--lmx-yellow`), black (`--lmx-black`) and white (`--lmx-white`). Neutrals are a carbon grey scale (`--lmx-ink-*`). Components use the semantic tokens below, not the palette, unless a rule here names a palette step.

| Group | Tokens | Use |
|---|---|---|
| Surfaces | `--surface-page`, `--surface-card`, `--surface-subtle`, `--surface-sunken` | Light surfaces: shop, customer area and admin content. |
| | `--surface-inverse`, `--surface-inverse-raised` | Black surfaces: header, hero, footer, admin sidebar. |
| | `--surface-accent` | Yellow surface. At most one accent section or card per page. |
| | `--surface-backdrop` | The scrim behind a dialog or drawer. The only translucent surface. |
| Text | `--text-strong`, `--text-body`, `--text-muted`, `--text-subtle` | On light surfaces, from headings down to secondary notes. |
| | `--text-inverse`, `--text-inverse-muted` | On inverse surfaces. |
| | `--text-on-accent` | On yellow. Always black. |
| | `--text-accent` | Eyebrows, the required marker, link hover. A dark amber, not the brand yellow. |
| Borders | `--border-subtle` | Card outlines and dividers. |
| | `--border-default` | Stronger dividers. Not a control boundary. |
| | `--border-control` | The boundary of inputs, selects and textareas. |
| | `--border-strong` | Hovered cards, focused inputs, checkbox and radio outlines. |
| | `--border-inverse` | Dividers on inverse surfaces. |
| Focus | `--focus-ring`, `--focus-ring-inverse` | See `accessibility.md`. |
| Actions | `--action-primary` with `-hover` and `-press` | Primary button: yellow fill, black label. |
| | `--action-secondary` with `-hover` | Secondary button: black fill, white label. |
| Status | `--status-success`, `--status-danger`, `--status-info`, `--status-warning`, each with `-bg` | State only: stock, order status, validation, toasts. `--status-danger` also has `-hover` and `-press` for the danger button. |

Rules:

- Yellow is an accent and an action colour: primary buttons, active indicators, the slant bar. It is never a text colour on a light surface and never the only focus indicator there.
- Status colours carry state, never decoration, and state is never carried by colour alone: an icon or a text label goes with it.
- No decorative gradients, patterns or textures. The one gradient allowed is the protection gradient under text on full-bleed photography.

## Type

| Family token | Face | Use |
|---|---|---|
| `--font-display` | Barlow Condensed, a stand-in (see `brand.md`) | Headlines, buttons, prices. Italic, uppercase, weights 700 to 900. |
| `--font-sans` | Geist | Running text, labels, UI. |
| `--font-mono` | Geist Mono | SKUs, order numbers, codes. |

| Role | Size tokens | Setting |
|---|---|---|
| Display | `--text-display-sm` to `--text-display-xl` | Display face, italic, uppercase, `--leading-display`, `--tracking-display`. |
| Heading | `--text-heading-sm` to `--text-heading-lg` | Display face, italic, uppercase, `--leading-tight`. |
| Body | `--text-lg`, `--text-md` | Sans, `--weight-regular`, `--leading-body` (running text) or `--leading-snug` (short blocks). |
| UI text | `--text-sm`, `--text-xs` | Sans, `--weight-regular` or `--weight-medium`. |
| Label | `--text-2xs` | Sans, `--weight-semibold`, uppercase, `--tracking-label`. |
| Eyebrow | `--text-xs` | Sans, `--weight-bold`, uppercase, `--tracking-eyebrow`, `--text-accent`. |
| Code | `--text-sm` | Mono, `--weight-medium`. |

Uppercase is applied with CSS. Dictionary strings are written in sentence case.

The display face is loaded only as italic at 700, 800 and 900 (ADR 0011). Another weight or style has to be added to the loader in `layout.tsx` before it is used, or the browser synthesises it.

## Spacing and layout

- Spacing is a 4px scale (`--space-1` and its multiples). Tailwind's numeric spacing utilities multiply `--space-1`, so `gap-3` is `--space-3`.
- The page container is `--container-max` wide with a `--container-pad` gutter; the sticky header is `--header-height` tall. Both the gutter and the header have a mobile value and a desktop value that starts at Tailwind's `sm` breakpoint.
- Components are fluid. Layouts are checked at 320, 768, 1024 and 1440 px.

## Radii

Hard edges: `--radius-xs`, `--radius-sm`, `--radius-md`. `--radius-pill` is only for status badges and counters.

## The slant

The logo's forward-leaning underline bar is the signature motif. It appears as a bar skewed by `--slant` (hero accents, the active tab underline, order progress) and as a parallelogram clipped by `--slant-cut` (hero buttons, merchandising tags). One or two per view.

## Elevation

Borders do the work: a card has a `--border-subtle` outline and no shadow. `--shadow-sm`, `--shadow-md` and `--shadow-lg` are for layers that float over the page: menus, toasts, drawers, dialogs. `--shadow-focus` and `--shadow-focus-danger` are glows around a focused input; they add to the focus indicator and never replace it.

## Motion

Quick and mechanical. `--duration-fast` for colour changes, `--duration-base` for controls, `--duration-slow` for drawers and image zoom, with `--ease-out` (or `--ease-in-out` for movement that starts and ends at rest). Fades and slides only. `globals.css` removes transitions and animations when the reader asks for reduced motion.

## Stacking

`--z-header`, `--z-overlay`, `--z-dialog`, `--z-toast`, in that order. No other z-index values.

## Iconography

Lucide, through `lucide-react` (ADR 0010), added by the first task that renders an icon (spec 003, T4). Icons are decorative by default; a control with only an icon gets its accessible name from a prop. No emoji, no symbol characters used as icons, no icon fonts.

## Imagery

- The brand mockups are dark, high-contrast and warm-lit. They stay out of `public/` until a page uses one (spec 003, decision 6).
- Product photography is expected on a clean light grey ground, evenly lit. None exists yet.
- Until a real photo exists, a product shows a neutral placeholder (icon and label), never an invented illustration.

## Content tone

All visible text goes through i18n, PT-PT first and EN second.

- European Portuguese vocabulary: telemóvel, carrinha, encomenda, morada, palavra-passe.
- The customer is addressed as "tu"; the brand speaks as "nós".
- Direct and practical. Headlines are short and imperative; everything else is factual.
- Commerce copy is exact: the price format is produced by the `Price` component from the locale, tax and shipping are stated before payment, and nothing is promised that the backend does not guarantee. Legal wording comes from `../compliance/`, not from here.
- Authentication copy explains the passwordless flow and never reveals whether an email has an account.
- No emoji, no rows of exclamation marks.
