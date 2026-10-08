# Design system

How the LockMX visual identity is used in the code. The system was created in Claude Design (project "LockMX Design System") and imported on 2026-10-07; the import record and its findings are in `../specs/003-design-system.md`.

## Files

| File | Content |
|---|---|
| `foundations.md` | Colour roles, type, spacing, radii, the slant motif, elevation, motion, layout, iconography, imagery and content tone. |
| `accessibility.md` | The conformance target, the verified contrast table, focus and motion rules. |
| `components.md` | Component inventory, conventions and the i18n rule. Updated by each component task. |
| `brand.md` | Logo usage, served assets and the status of the display typeface. |

## Where things live

| What | Where |
|---|---|
| Token values (the single source of truth) | `apps/web/src/styles/tokens.css` |
| Tailwind wiring and base styles | `apps/web/src/app/globals.css` |
| Font loading | `apps/web/src/app/[lang]/layout.tsx` |
| Components | `apps/web/src/components/ui/<group>/` |
| Served brand assets | `apps/web/public/brand/` |
| Guards | `apps/web/src/styles/contrast.test.ts`, `apps/web/src/styles/theme.test.ts` |

These documents describe roles and rules. They name tokens and never repeat their values, so a value changes in one place only. The one exception is the contrast table in `accessibility.md`, which records the colours that were measured.

Decisions behind this setup: `../decisions/0009-styling-design-tokens-tailwind.md`, `../decisions/0010-icons-lucide.md`, `../decisions/0011-fonts-next-font.md`.

## How a token reaches a component

1. `tokens.css` declares the token as a custom property on `:root`, under the design system's own name (`--surface-page`, `--radius-sm`).
2. `globals.css` maps it into a Tailwind theme namespace inside `@theme inline reference`. Every namespace that carries a visual value is reset first (colours, families, sizes, weights, leading, tracking, radii, all shadow kinds, blur, easing, container widths), so Tailwind's defaults generate nothing: `bg-red-500`, `text-xl` and `max-w-md` do not exist. Breakpoints, animations (`animate-spin`), aspect ratios and perspective are left as Tailwind ships them.
3. A component uses the utility: `bg-surface-page`, `rounded-sm`.

| Token group | Utility form | Example |
|---|---|---|
| Palette `--lmx-*` | `<property>-<name>` without the `lmx-` prefix | `bg-yellow-50`, `border-ink-950` |
| Surfaces, borders, actions, status | `<property>-<token name>` | `bg-surface-card`, `border-border-control`, `bg-action-primary`, `text-status-danger` |
| Text colours `--text-strong` ... | `text-text-<name>` | `text-text-muted` |
| Font sizes `--text-sm` ... | `text-<name>` | `text-sm`, `text-display-lg` |
| Families, weights, leading, tracking | `font-<name>`, `leading-<name>`, `tracking-<name>` | `font-display`, `font-semibold`, `leading-body`, `tracking-label` |
| Radii, shadows, easing | `rounded-<name>`, `shadow-<name>`, `ease-<name>` | `rounded-pill`, `shadow-lg`, `ease-out` |
| Spacing | Tailwind's numeric scale on the 4px base token | `p-4` equals `--space-4` |
| Layout | `px-gutter`, `h-header`, `max-w-page` | page container and header |
| Duration, z-index, slant (no Tailwind namespace) | variable shorthand | `duration-(--duration-fast)`, `z-(--z-dialog)`, `skew-x-(--slant)` |

A font-size utility sets only the size. Tailwind's paired line heights went with the reset, so every text style also names a `leading-*`.

A `transition-*` utility without an explicit duration or easing runs on `--duration-fast` and `--ease-out`.

Colour text tokens are mapped under `--color-text-*` because `--text-*` is Tailwind's font-size namespace: `text-text-strong` is a colour and `text-sm` is a size.

Why `reference`: several tokens have the same name as the Tailwind theme variable (`--radius-sm`, `--text-sm`, `--font-sans`). Without it Tailwind also emits the theme variable, which would be `--radius-sm: var(--radius-sm)`. `theme.test.ts` fails if a self-reference appears. Sources: https://tailwindcss.com/docs/theme (2026-10-08) for namespaces, `inline` and the `initial` reset; `apps/web/node_modules/tailwindcss/theme.css` (4.3.3), which uses `@theme default inline reference` itself.

## Rules for components

- Tailwind utilities that resolve to tokens. No inline `style` for visual rules, no hex, no raw `px` outside `tokens.css`.
- States (hover, active, focus, disabled, invalid) are CSS variants, not React state.
- Every visible string and accessible name is a prop. See `components.md`.

## Adding a token

1. Add it to `tokens.css` in the matching group. A colour used for text, a focus indicator or a control boundary gets its pairs added to `contrast.test.ts` first, and the test must fail before the value is right.
2. Map it in `globals.css` if it belongs to a Tailwind namespace, and add the utility to `theme.test.ts`.
3. Describe its role in `foundations.md`. Do not write its value there.

Changing an existing value needs the owner's approval (spec 003, Boundaries).

## Adding a component

Only after it is in an approved spec. Follow "Conventions for every component task" in `../specs/003-design-system.md`: test first, one file per component under its group folder, exported from the `components/ui` entry point (created by T4 of that spec), then a row in `components.md`.

## Changes from the imported system

| Imported | Now | Reason |
|---|---|---|
| `--text-accent`: `--lmx-yellow-700` | `--lmx-yellow-800` (new palette step) | Text contrast, spec 003 Finding 1. |
| Warning text: a raw value in the Badge | `--status-warning-text` (new). `--status-warning` keeps its imported value and is a fill with black text. | Text contrast, spec 003 Findings 1 and 2. |
| `--lmx-green` | darker value | Text contrast, on white and on its tint. |
| `--lmx-ink-500` | darker value | `--text-subtle` on the grey surfaces; control boundary. |
| Inputs bordered with `--border-default` | `--border-control` (new) | 3:1 boundary. `--border-default` is for dividers only. |
| `--focus-ring`: yellow everywhere | dark, plus `--focus-ring-inverse` (new) for inverse surfaces | 3:1 focus indicator on every surface. |
| Raw values inside components | `--lmx-red-600`, `--lmx-red-700`, `--status-danger-hover`, `--status-danger-press`, `--surface-backdrop`, `--shadow-focus-danger` (new) | Spec 003 Finding 2. |
| `--container-pad`, `--header-height`: one value | mobile value, desktop value from the `sm` breakpoint | Responsive rule of spec 003. |
| `--font-*`: literal family names, Google Fonts `@import` | reference the `next/font` variables | ADR 0011. |

Every other token keeps its imported name and value.

## Open points

Each needs an owner decision. Nothing here was changed on assumption.

1. **Display typeface.** The owner reported the logo typeface on 2026-10-08. It cannot be used until a licence that covers a commercial website exists. See `brand.md`.
2. **Units.** The imported type and spacing tokens are in `px`. A font size in `px` does not follow the reader's browser font-size setting; `rem` does. Converting is a change to token values, so it was not done.
3. **Link underline.** The imported link style keeps a yellow underline. On white it measures 1.76:1, and the link text is nearly the colour of body text, so the underline is the only cue. See `accessibility.md`.
4. **`--shadow-focus`.** Kept as imported (a translucent yellow glow). It measures under 3:1 on light surfaces, so it may decorate a focused control but is never the only focus indicator.
5. **Weight 800.** The imported components use weight 800 for headings and prices, and the font is loaded at 800, but the imported tokens have no step between `--weight-bold` and `--weight-black`. The first component that needs it (spec 003, T4 or T10) adds the token.
