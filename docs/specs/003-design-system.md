# 003. Design system

- Status: in progress
- Idea: `../ideas/project-brief.md`
- Decisions: `../decisions/0009-styling-design-tokens-tailwind.md`, `../decisions/0010-icons-lucide.md`, `../decisions/0011-fonts-next-font.md`, `../decisions/0008-i18n-native-next.md`, `../decisions/0004-unit-test-runner.md`

## Objective

Turn the design system created in Claude Design (project "LockMX Design System") into production code and documentation, so every later page (marketing, shop, customer area, admin) is built from the same tokens and components. After this spec: the design tokens are the single source of truth in the app, fonts and brand assets are self-hosted, `docs/design/` documents the system, and the 22 primitives exist as accessible, tested, i18n-ready TypeScript components.

## Out of scope

- The three UI kits (`ui_kits/storefront`, `account`, `admin`): proposals, used as input to the spec of each surface (marketing and shop, customer area, admin). No screens are built here.
- The Claude Design tooling files: `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`, `*.card.html`, `thumbnail.html`, `guidelines/*.html` (specimen cards). They are read as reference; the content that matters is rewritten as Markdown in `docs/design/`.
- A dark theme. The design system defines light surfaces plus a black inverse surface; the dark mode block in the current `globals.css` is removed, not extended.
- A component documentation site (Storybook or similar).
- Money storage, calculation and tax rules (shop spec). `Price` here only formats an amount in integer cents that it is given.
- Real product photography, the client's real display lettering, and final copy.

## Current state (verified 2026-10-07)

- `apps/web/src/app/globals.css` is the `create-next-app` scaffold (`--background`, `--foreground`, a `prefers-color-scheme: dark` block, `font-family: Arial`). Tailwind 4.3.3 through `@tailwindcss/postcss`. No design tokens, no components besides `language-switcher.tsx`.
- `app/[lang]/layout.tsx` loads Geist and Geist Mono with `next/font/google` and exposes `--font-geist-sans` and `--font-geist-mono`.
- `apps/web/AGENTS.md` says tokens are defined "in `docs/design/`". This spec fixes that divergence (T3): the CSS lives in the app, the documentation in `docs/design/`.
- The client's identity pack (PNG, mockups, `.ai`, `.eps`, 50 MB) lives in `logo/` at the repository root, git-ignored (`/logo/`), for local consultation only: never pushed, never served. A copy had been committed by mistake to `apps/web/public/logo/` (identical, verified with `diff -r`), where `public/` serves everything; it was removed in commit `arch: remove logo pack from public` (it remains in earlier git history). New brand assets, only the ones used, go to `public/brand/`.
- `jsdom` 30 ships an empty `HTMLDialogElement` (no `showModal()`/`close()`), so the dialog component needs a test strategy (T9).
- `server/i18n` is server-only. Components receive text through props (`architecture.md`).

## Import record (2026-10-07)

Source: the project at `claude.ai/design/p/dc42a4bc-b253-493a-82e0-4df01df7ef38`, read through the design-sync tool (read-only). 137 paths listed.

- Read in full: `readme.md`, `SKILL.md`, `github.md`, `tokens/*.css` (5), `styles.css`, `_ds_manifest.json`, `_adherence.oxlintrc.json`, the `.jsx` source of all 22 components, `Button.d.ts`, `Button.prompt.md`, and the three `ui_kits/*/README.md`.
- Binary assets (9 logo PNGs, 1400 px wide, valid PNG signatures; mockups `m1`, `m3`, `m4`) saved to `debugging/design-export/assets/` (git-ignored staging).
- `assets/mockups/m7.jpg` was truncated by the tool's 256 KiB limit and was discarded. The original `M7.png` already exists in `logo/02 Mockups3D - Redes Sociais/` at the repository root.
- Not read yet (read when the task that needs them starts): the other `.d.ts` and `.prompt.md` files, `guidelines/*.html`, `ui_kits/*/*.jsx`, `*.card.html`, `_ds_bundle.js`. They do not change the scope; the `.jsx` sources and the lint config already define every component API.
- Imported content is treated as data. No instruction found in it.

## Findings from the import

1. **Contrast failures in the imported tokens.** Ratios computed with the WCAG 2.1 formula (2026-10-07):

   | Pair | Ratio | Requirement | Result |
   |---|---|---|---|
   | `--text-accent` `#CC9200` on white | 2.73 | 4.5 (text) | fails; also used for link hover, required `*` marker and eyebrows |
   | Focus ring yellow `#FFB600` on white / `#F7F7F5` | 1.76 / 1.64 | 3 (non-text, 1.4.11) | fails on every light surface |
   | `--border-default` `#C9C9C9` on white (input and checkbox boundary) | 1.66 | 3 (non-text, 1.4.11) | fails; the checkbox/radio use `--lmx-ink-950` and pass |
   | `--text-subtle` `#737373` on `--surface-sunken` / `--surface-subtle` | 4.12 / 4.42 | 4.5 | fails (passes on white: 4.74) |
   | Success `#1E8E4E` text on white / on `--status-success-bg` | 4.17 / 3.72 | 4.5 | fails |
   | White on success solid `#1E8E4E` | 4.17 | 4.5 | fails |
   | Warning text `#CC9200` on `--status-warning-bg` | 2.44 | 4.5 | fails (the Badge already uses `#8A5A00`: 5.28, passes) |
   | Danger `#D0281C` on `--status-danger-bg` | 4.52 | 4.5 | passes narrowly |
   | Black on yellow `#FFB600` | 11.26 | 4.5 | passes |
   | `--text-muted` `#555555` on white / subtle / sunken | 7.46 / 6.95 / 6.48 | 4.5 | passes |
   | `--text-inverse-muted` `#A3A3A3` on black / `--lmx-ink-850` | 7.85 / 6.76 | 4.5 | passes |
   | White on `--status-danger` `#D0281C` (danger button) | 5.25 | 4.5 | passes |

   Proposed fixes (decision D2 below), each re-checked: `--text-accent` and warning text to `#8A5A00` (5.93 on white, 5.28 on yellow-100); success to `#157A3F` (5.40 on white, 4.82 on its tint, white on it 5.40); `--lmx-ink-500` to `#666666` (5.74 on white, 5.35 on subtle, 4.99 on sunken) and use it for input, select and textarea borders (so the boundary passes 3:1); focus ring `#0A0A0A` on light surfaces and `#FFB600` on inverse surfaces (11.26 on black). The yellow remains the brand accent for fills, never for text or the only focus indicator on white.
2. **Raw values inside components** that the lint config of the design system itself forbids: Button danger hover `#B3221A` and press `#961C15`, Badge `#8A5A00`, white `#fff` in Price, Toast, Tooltip, ProductCard and Tabs, backdrop `rgba(10,10,10,0.62)`, focus-danger `rgba(208,40,28,.18)`, many `px` sizes (36/44/54 heights, 20 px checkbox, 40x22 switch). Each becomes a token or a Tailwind scale value (T1).
3. **Hardcoded Portuguese strings in components**: Dialog and Toast "Fechar", DataTable "Sem resultados.", ProductCard stock labels and "Adicionar", CartLine "Remover" and "Qtd.", QuantityStepper "Diminuir"/"Aumentar", SearchBar placeholder and "Procurar". They become required props supplied by the page from the dictionaries (T4 to T11).
4. **Icons from `window.lucide`** loaded by CDN script: replaced by `lucide-react` (ADR 0010).
5. **Fonts from the Google Fonts CSS `@import`**: replaced by `next/font` (ADR 0011).
6. **Behavior gaps**: SearchBar suggestion list has no `role="listbox"`/`combobox` semantics and closes with a 150 ms timeout on blur; Tooltip appears on focus but is not linked with `aria-describedby` and is not dismissible with Escape; Dialog has no focus trap or focus return; DataTable rows are clickable `<tr>` without keyboard access; Tabs has no arrow-key navigation or `aria-controls`; Radio and Checkbox hide the native input with `width: 0`. Each is fixed in the corresponding task.
7. **The imported `.jsx` and `.d.ts` pairs** are rewritten as one `.tsx` file per component with an exported props type; they are not copied.

## Sources

- Tailwind CSS theme variables, https://tailwindcss.com/docs/theme, 2026-10-07: namespaces, `@theme inline`, `--color-*: initial`.
- Next.js bundled docs 16.3.6 (`apps/web/node_modules/next/dist/docs/01-app/`), 2026-10-07: `03-api-reference/02-components/font.md` (`next/font/google`, `variable`, `weight`, `style`, `subsets`). To read before the task that uses them: `03-api-reference/02-components/image.md` (T2, brand images), `02-guides/` testing guide for Vitest (T4).
- WCAG 2.1 success criteria 1.4.3 (contrast minimum), 1.4.11 (non-text contrast), 2.1.1, 2.4.7, 4.1.2: https://www.w3.org/TR/WCAG21/. The conformance level to meet is AA; to be quoted from the source in `docs/design/` (T3).
- WAI-ARIA Authoring Practices for dialog, tabs, combobox, switch and tooltip patterns: https://www.w3.org/WAI/ARIA/apg/patterns/. Read per component at the start of its task and cited in the task notes.
- MDN `<dialog>`, `showModal()`: https://developer.mozilla.org/docs/Web/HTML/Element/dialog. Read at T9.
- Lucide for React: https://lucide.dev/guide/packages/lucide-react (ADR 0010).
- Design system project files, 2026-10-07 (see Import record).

Anything not listed (exact versions, API details) is confirmed against the official documentation at the moment of the task, and the source is added to the task notes in this spec.

## Dependencies

Needs owner approval (workflow: new production dependencies).

- Production: `lucide-react` (ADR 0010), approved by the owner on 2026-10-08.
- Development: none planned. Component tests use the existing Vitest, Testing Library and jsdom. If keyboard-interaction tests need `@testing-library/user-event`, it is added in the task that needs it, with justification.

## Decisions taken at approval (2026-10-08)

1. **Display font.** Barlow Condensed is accepted for now. The owner will ask the client which typeface the logo uses; if the real one is identified or supplied, it replaces Barlow Condensed through `next/font/local` (ADR 0011) without changing components.
2. **Contrast fixes.** The token values in Finding 1 are approved. Any other value must be re-checked before it is used.
3. **Icons.** `lucide-react` approved (ADR 0010).
4. **Price input.** `Price` takes integer cents (`amountCents`, and `compareAtCents`). A non-integer or negative value is rejected at the type and runtime level. Storage, calculation and tax stay in the shop spec; the cents contract is the shared one.
5. **Branch.** `feat/003-design-system`, with the commits listed below.
6. **Brand assets.** Only what is used is served: the 9 logo PNGs go to `public/brand/logo/`. The mockups stay in the git-ignored staging folder until a page needs one (no speculative assets).

## Decisions taken during implementation (2026-10-08)

Asked of the owner after T3, before the first component task.

7. **Font sizes outside the scale.** The imported components use sizes that are not tokens (buttons 15, 17 and 20 px, input 15 px, toast 13 px, dialog title 26 px, price 32 px). Each is set to the nearest size token; no size tokens are added. The task notes record each substitution.
8. **Units.** Type, spacing and layout tokens are in `rem`. Radii, shadows and the slant cut stay in `px`.
9. **Links.** The underline uses the text colour. The yellow underline is used only on inverse surfaces.
10. **Logo typeface.** The owner reported "Rushdriver italic". It is not used: no licensed file exists (see `docs/design/brand.md`). Decision 1 stands.

## Working branch

`feat/003-design-system`. Tasks are committed in order. Merge with "rebase and merge" after an explicit request to open the pull request.

## Conventions for every component task

- One folder per component group under `apps/web/src/components/ui/<group>/` (`core`, `forms`, `surfaces`, `commerce`, `data`), one `.tsx` per component and its test next to it. Public imports go through `components/ui/index.ts` (added in T4 and extended per task); nothing outside imports a component's internal file.
- Server Component by default. `"use client"` only for components with state or effects (SearchBar, QuantityStepper when uncontrolled, Switch, Checkbox when uncontrolled, Tabs, Dialog, Toast, Tooltip, DataTable with row click). Native HTML state is preferred to React state where possible.
- Styling follows ADR 0009: Tailwind classes resolving to tokens; no inline `style` for visual rules, no hex, no raw `px` outside the token file.
- Props follow the imported API (names, variants, sizes) unless a finding above says otherwise, and extend the matching native element props (`React.ComponentProps<"button">`) so `aria-*`, `name`, `form` and `ref` work. `style` is not a prop; `className` is accepted for layout only.
- Every visible string and every accessible name (`aria-label`, `title`, `alt`) is a prop. No default Portuguese or English text inside a component. Components never read dictionaries.
- Accessibility acceptance for each interactive component: operable with the keyboard alone, visible focus that meets 3:1 on the surface it sits on, correct role and name, disabled and invalid states exposed to assistive technology, no information conveyed by colour alone, `prefers-reduced-motion` respected for transitions of more than opacity or colour.
- Tests (written first) cover: rendering of each variant and size, accessible roles and names, keyboard behavior, controlled and uncontrolled use where both exist, disabled/loading/invalid states, and that no text comes from inside the component.
- Responsive: components are fluid; the 32 px container gutter and 72 px header from the tokens are desktop values (stored in `rem` since decision 8). Mobile values (16 px gutter below the `sm` breakpoint, 56 px header) are defined in T1 and verified at 320, 768, 1024 and 1440 px in the visual check of each task.
- Visual check (not committed): a temporary route under `app/[lang]/` renders the component variants; it is run with `pnpm dev`, inspected, and deleted before the commit. No specimen route is kept in the repository.

## Tasks

### T1. Tokens, fonts and global styles
- Description: create `apps/web/src/styles/tokens.css` with the design tokens (colour, typography, spacing, radii, slant, shadows, motion, z-index, container, header) using the values of Finding 1 for the contrast-fixed tokens, plus the mobile container gutter and header height. Map them into Tailwind with `@theme inline` under explicit namespaces, resetting the default colour palette. Colour text tokens are mapped as `--color-text-strong` etc. to avoid the `--text-*` font-size namespace. Add a `base` layer: `box-sizing`, body colours and font, link style, `::selection`, focus-visible rule (dark ring on light surfaces, yellow on inverse), `prefers-reduced-motion`. Load Barlow Condensed (italic 700, 800, 900) with `next/font/google` next to the existing fonts and expose `--font-display`. Replace the scaffold `globals.css` (remove the dark-mode block and the Arial rule). Add the contrast guard test.
- Planned files: `apps/web/src/styles/tokens.css`, `apps/web/src/app/globals.css`, `apps/web/src/app/[lang]/layout.tsx`, `apps/web/src/styles/contrast.test.ts`.
- Acceptance criteria: every token in the imported manifest exists in `tokens.css` (renamed or fixed ones are listed in `docs/design/` at T3); no default Tailwind colour utility is generated (`bg-red-500` does not exist); the colour tokens do not shadow font-size utilities (`text-sm` still sets a size); the page renders Geist, Geist Mono and Barlow Condensed from the site's own origin (no request to `fonts.googleapis.com` or `fonts.gstatic.com` in the network panel); `pnpm build` passes.
- Tests: `contrast.test.ts` parses `tokens.css` and asserts the ratios of the pairs in Finding 1 (4.5 for text, 3 for non-text), computed with the WCAG formula, so a future token change that breaks contrast fails the test. Written first, fails against the imported values, passes with the fixed ones.
- Commit: `feat: add design tokens and fonts`

### T2. Brand assets and Logo
- Description: copy the 9 cropped logo PNGs to `apps/web/public/brand/logo/` (`lockup-*`, `lockup-wide-*`, `wordmark-*` in `black-yellow`, `white-yellow`, `black-white`) from `debugging/design-export/assets/logo/` (the mockups are not copied, see decision 6). Build the `Logo` component with `next/image`: `variant` (`lockup`, `wide`, `wordmark`), `tone` (`dark`, `light`, `mono`) mapped to the file, intrinsic width and height from the file so there is no layout shift, `alt` required. Record in `docs/design/` (T3) that the logo is never redrawn or recoloured, and that the source pack in `public/logo/` should leave `public/` (separate decision, not changed here).
- Planned files: `apps/web/public/brand/logo/*.png`, `apps/web/src/components/ui/core/logo.tsx`, `logo.test.tsx`.
- Acceptance criteria: `git status` shows the new files as tracked candidates (not ignored, checked with `git check-ignore`); the 9 variants render with the right `src`, `width`, `height` and the given `alt`; no file in `public/brand/` is larger than needed (logos at most 1400 px wide as imported).
- Tests: each variant/tone resolves to the expected file; `alt` is required (type test); the rendered image has width and height attributes.
- Commit: `feat: add brand assets and logo component`

### T3. Design documentation
- Description: write `docs/design/` in English: `README.md` (index, how the design is consumed, where the token CSS is, how to add a token or component), `foundations.md` (colour roles and usage rules, type scale and roles, spacing, radii, slant motif, elevation, motion, layout, iconography, imagery, content tone for PT-PT and EN), `accessibility.md` (the AA target, the verified contrast table from Finding 1 with the final values, focus rules, motion), `components.md` (inventory with group, props summary, state coverage and the i18n rule, updated by each component task), `brand.md` (logo usage, variants, minimum sizes, assets and their location, the stand-in font status). Content comes from the imported `readme.md` and guidelines, with corrections from the findings; values are referenced to `tokens.css`, not copied. Fix the divergence in `apps/web/AGENTS.md` (tokens CSS in `src/styles/`, docs in `docs/design/`), update `docs/README.md` (the `design/` row is now real), `docs/architecture.md` (`styles/`, `components/ui/`) and `docs/decisions/README.md` if it indexes ADRs.
- Planned files: `docs/design/*.md`, `apps/web/AGENTS.md`, `docs/README.md`, `docs/architecture.md`.
- Acceptance criteria: every token, component and path named in the docs exists; no hex value is duplicated except in the contrast table; the docs state the source and date of each external claim (WCAG criteria quoted from W3C).
- Tests: no tests (documentation).
- Commit: `docs: add design system documentation`

### T4. Core: Icon, Button, IconButton, Badge
- Description: `Icon` with a closed map of Lucide icons actually used (names from the imported kits: search, shopping-cart, user, truck, package, receipt, mail, lock, key-round, pencil, trash-2, plus, minus, x, check, arrow-right, arrow-left, chevron-down, image, loader-circle, circle-check, circle-alert, info, bell), decorative by default. `Button` (variants primary, secondary, outline, outline-inverse, ghost, danger; sizes sm, md, lg; `slanted`, `iconLeft`, `iconRight`, `fullWidth`, `loading`) as a real `<button>` with `type="button"` default, `aria-busy` and non-activatable while loading, `disabled` styling; a link variant (`<Button asChild>` is not added; a `ButtonLink` using `next/link` shares the same classes so navigation is an `<a>`). `IconButton` (required `label` becomes the accessible name and tooltip, optional `count` badge announced in the label). `Badge` (tones, soft/solid, pill/slant, dot) with text always present so state is not colour-only. Install `lucide-react` after confirming its React 19 support, default `aria-hidden` and tree-shaking in its documentation; add the entry to `components/ui/index.ts`.
- Planned files: `apps/web/src/components/ui/core/{icon,button,button-link,icon-button,badge}.tsx` and tests, `components/ui/index.ts`, `apps/web/package.json`, `pnpm-lock.yaml`.
- Acceptance criteria: variants/sizes render with token classes only; focus ring visible on light and on inverse backgrounds; loading button is not clickable and announces busy; icon-only buttons fail the type check without `label`; the slanted shape does not clip the focus ring (outline is on a wrapper or uses `drop-shadow`, verified visually).
- Tests: roles and names; click and keyboard activation (Enter, Space); disabled and loading do not fire `onClick`; `ButtonLink` renders an anchor with `href`; badge text rendered; no inline style attributes.
- Commit: `feat: add core ui components`

### T5. Forms: Field, Input, Textarea, Select
- Description: a shared `Field` wrapper (label, required marker, hint, error) wiring `htmlFor`, `aria-describedby` and `aria-invalid`, with the error announced politely and not by colour alone (icon plus text). `Input` (sizes, `iconLeft`, `suffix`, native `type`), `Textarea`, `Select` (native `<select>`, custom chevron, options array) as Server Components using native attributes; borders use the fixed 3:1 token. The required marker and the word for "required" come from props (`requiredLabel`).
- Planned files: `apps/web/src/components/ui/forms/{field,input,textarea,select}.tsx` and tests.
- Acceptance criteria: label click focuses the control; error and hint are linked by `aria-describedby`; invalid state exposes `aria-invalid`; disabled controls are not focusable; focus and error states are visible without colour (border width or icon); sizes match the token heights.
- Tests: label association, describedby/invalid wiring, controlled and uncontrolled values, disabled, option rendering, required marker text from props.
- Commit: `feat: add form field components`

### T6. Forms: Checkbox, Radio, Switch, QuantityStepper
- Description: `Checkbox` and `Radio` keep the real native input (visually styled with `peer` classes, not `width: 0`), so focus, form submission and group semantics are native; `Radio` is a `fieldset` with `legend` and a `card` variant. `Switch` uses `role="switch"` on a checkbox input or a button with `aria-checked`, label-linked. `QuantityStepper` (min, max, size) with a numeric input, decrease and increase buttons whose accessible names come from props, value announced via `aria-live`, clamped to min and max.
- Planned files: `apps/web/src/components/ui/forms/{checkbox,radio,switch,quantity-stepper}.tsx` and tests.
- Acceptance criteria: operable with Space/arrow keys per native behavior; checked state visible without colour (check mark / dot shape); the stepper never emits a value outside `[min, max]`; typing a non-number is rejected.
- Tests: toggling, group selection and arrow-key movement, disabled, controlled and uncontrolled, clamping, accessible names from props.
- Commit: `feat: add choice and quantity components`

### T7. Forms: SearchBar
- Description: `SearchBar` as a `role="search"` form with an accessible combobox for suggestions (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, listbox with options), arrow-key navigation, Enter to select or submit, Escape to close, no blur timeout (selection uses click on the option and `onPointerDown` guarded correctly). Suggestions are supplied by the parent (no data fetching in the component). Placeholder, submit label, listbox label and "no results" text are props. Follows the APG combobox pattern (to read at task start and cite here).
- Planned files: `apps/web/src/components/ui/forms/search-bar.tsx` and test.
- Acceptance criteria: fully keyboard operable; screen reader gets the number of suggestions announced via a live region (text from props); suggestions close on Escape and blur without losing a click.
- Tests: typing filters via the supplied list, arrow/Enter/Escape behavior, `onSubmit` and `onSelect` payloads, ARIA attributes update.
- Commit: `feat: add search bar`

### T8. Surfaces: Card, Tabs, Tooltip, Toast
- Description: `Card` (variants outlined, raised, subtle, inverse, accent; padding; `interactive` renders a real link or button wrapper, never a clickable `div`; `as` limited to a safe set). `Tabs` with `role="tablist"`, roving `tabindex`, arrow/Home/End keys, `aria-controls`/`aria-labelledby` and a `TabPanel`; underline variant with the slant indicator and a segmented variant. `Tooltip` linked by `aria-describedby`, shown on hover and focus, dismissed with Escape, never the only carrier of essential information. `Toast` with `role="status"` (`role="alert"` for danger), close button name from props, no auto-dismiss under the time needed to read (duration is a prop; a toast with an action does not auto-dismiss), and a `Toaster` viewport region.
- Planned files: `apps/web/src/components/ui/surfaces/{card,tabs,tooltip,toast}.tsx` and tests.
- Acceptance criteria: tabs follow the APG tabs pattern; tooltip meets WCAG 1.4.13 (dismissible, hoverable, persistent); the interactive card has one focus target; toast tone is conveyed by icon and text, not colour alone.
- Tests: tab keyboard navigation and ARIA wiring; tooltip show/hide on focus, hover, Escape; toast roles per tone and close callback; card renders link or button when interactive.
- Commit: `feat: add surface components`

### T9. Surfaces: Dialog
- Description: `Dialog` on the native `<dialog>` with `showModal()` (focus trap, Escape, inert background, top layer for free), controlled by `open`, returns focus to the opener, closes on backdrop click, labelled by its title and described by its description, scroll lock on the page while open. Close button name, title and description are props. Because jsdom 30 has no `showModal()`, tests install a minimal test double for `showModal`/`close` in the test setup (a documented helper in `src/test/`) and assert state and ARIA; the real focus-trap and top-layer behavior is verified manually in a browser (recorded in the task notes) since it cannot be proven in jsdom.
- Planned files: `apps/web/src/components/ui/surfaces/dialog.tsx`, test, `apps/web/src/test/dialog-polyfill.ts` (or equivalent).
- Acceptance criteria: opens with focus on the first focusable element, Tab does not leave the dialog, Escape and the close button call `onClose`, focus returns to the opener; verified in a real browser at 320 and 1440 px; backdrop uses a token, not rgba literals.
- Tests: open/close via prop, `onClose` on Escape (`cancel` event) and backdrop click, ARIA labelling, title/description from props.
- Commit: `feat: add dialog`

### T10. Commerce: Price, ProductCard, CartLine
- Description: `Price` takes integer cents (`amountCents`, optional `compareAtCents`) and formats with `Intl.NumberFormat` using the locale prop (`pt-PT` renders `349,00 €`; the project shows "IVA incluído" through the `note` prop), with the strikethrough compare-at price exposed to assistive technology as "was/now" text from props (`compareAtLabel`), so the discount is not colour-only. `ProductCard`: an `<article>` with one link on the title that covers the card (the image is decorative or has meaningful `alt` from props), stock state as a `Badge` with text from props (`stockLabel`, `stock` in/low/out), a add-to-cart button whose name includes the product (`addLabel` plus title) and is disabled when out of stock, a placeholder when there is no image, image via `next/image` with sizes. `CartLine`: image, title, meta, `QuantityStepper`, remove button, line total, compact variant; labels from props. No cart logic: callbacks only.
- Planned files: `apps/web/src/components/ui/commerce/{price,product-card,cart-line}.tsx` and tests.
- Acceptance criteria: `pt-PT` and `en` output verified with `Intl` for 34900, 123450 and 0 cents; out-of-stock cards cannot be added; a keyboard user reaches title link, then the add button, in that order; no price is computed from a quantity inside `Price` (CartLine receives the line total from the caller, since totals are computed on the server per the project rules).
- Tests: formatting in both locales from cents (34900, 123450, 0, 1), rejection of non-integer and negative cents, compare-at text, stock states, disabled add, accessible names, placeholder when no image, compact CartLine.
- Commit: `feat: add commerce components`

### T11. Data: DataTable
- Description: `DataTable<Row>` generic and typed: semantic `<table>` with `<caption>` (prop), `<th scope>`, column definitions (`key`, `label`, `align`, `width`, `mono`, `render`), dense variant, empty state text from props, loading state (skeleton rows) and error state slot. Row navigation is a link in a designated cell (never a click handler on `<tr>`), so it is keyboard and screen reader accessible; row hover tint is CSS. Horizontal scroll container is focusable when it overflows.
- Planned files: `apps/web/src/components/ui/data/data-table.tsx` and test.
- Acceptance criteria: header cells are associated with data cells; empty, loading and error states each render a meaningful message with a role/status; the table remains usable at 320 px through horizontal scroll with a visible focus.
- Tests: columns and rows rendering, alignment, custom `render`, empty and loading states, caption, row link.
- Commit: `feat: add data table`

### T12. Design system checklist and status
- Description: write `docs/checklists/02-design-system.md` in English from what T1 to T11 did (token wiring, fonts, brand assets, component conventions, test strategy including the dialog double, the contrast guard), update `docs/checklists/README.md`, and set this spec to `done`. `docs/design/components.md` is verified against the code.
- Planned files: `docs/checklists/02-design-system.md`, `docs/checklists/README.md`, ADR files, this spec.
- Acceptance criteria: each step names the exact command or file and matches the repository; every component in `components.md` exists and is exported from `components/ui/index.ts`.
- Tests: no tests (documentation).
- Commit: `docs: add design system checklist`

## Task notes

Sources consulted and deviations from the plan, recorded when each task was done.

### T1 (2026-10-08)

- Sources: https://tailwindcss.com/docs/theme (namespaces, `@theme inline`, resetting a namespace with `initial`); `apps/web/node_modules/tailwindcss/theme.css` 4.3.3 (uses `@theme default inline reference`); `apps/web/node_modules/tailwindcss/dist/lib.d.mts` (`compile`, used by the theme test); `apps/web/node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md` 16.3.6; `font-data.json` of the same package (Barlow Condensed: weights 100 to 900, normal and italic, not variable). The token files were read again from the design system project.
- The theme block is `@theme inline reference`, not `@theme inline`. Many tokens share their name with the Tailwind theme variable (`--radius-sm`, `--text-sm`, `--font-sans`); with `inline` alone Tailwind emits `--radius-sm: var(--radius-sm)`. Confirmed by compiling both forms.
- Added file, not in the plan: `apps/web/src/styles/theme.test.ts`. It compiles `globals.css` with the installed Tailwind and checks the acceptance criteria that can be checked without a browser (no default utilities, colour tokens do not shadow font sizes, no self-referencing variable, focus and reduced-motion rules present).
- Changed file, not in the plan: `apps/web/src/app/[lang]/page.tsx` used `text-3xl`, which no longer exists; it now uses `text-heading-lg`.
- The next/font variable for the display face is `--font-barlow-condensed`; `--font-display` is the token that reads it. Using `--font-display` for both would make the token refer to itself.
- New tokens from Findings 1 and 2: `--lmx-yellow-800`, `--lmx-red-600`, `--lmx-red-700`, `--border-control`, `--focus-ring-inverse`, `--status-danger-hover`, `--status-danger-press`, `--status-warning-text`, `--surface-backdrop`, `--shadow-focus-danger`. The control heights and the checkbox and switch sizes of Finding 2 are Tailwind spacing-scale values (multiples of `--space-1`), so they need no token.
- Inverse surfaces set `data-surface="inverse"` to get the yellow focus ring.
- `box-sizing` is not repeated in the base layer: Tailwind's preflight already sets it.
- The contrast test failed on 18 pairs with the imported values (the pairs of Finding 1) and passes with the approved ones. Every token name of the imported manifest exists in `tokens.css`.
- Verified: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. The built CSS and the served HTML of `/pt` contain no reference to `fonts.googleapis.com` or `fonts.gstatic.com`; the font files are preloaded from `/_next/static/media/`.
- The browser checks were done later: see "Visual check of T1, T2 and T4".
- Open points raised for the owner: `docs/design/README.md`, "Open points".
- Corrected after review, in a separate `fix` commit: (1) `--status-warning` had been moved to the darker text value, which would have darkened the imported solid warning fill (yellow with a black label, `Badge.jsx`) beyond what Finding 1 approved; it keeps its imported value and warning text has its own token. (2) The reset did not cover container widths, drop, inset and text shadows or blur, and a transition without a duration ran on Tailwind's 150ms default; these are now reset or mapped to the motion tokens, with tests.

### T2 (2026-10-08)

- Sources: `apps/web/node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` 16.3.6 (`src`, `alt`, `width` and `height`, `sizes`, `style`); the imported `Logo.jsx`, `Logo.d.ts` and `Logo.prompt.md`.
- The imported `height` and `basePath` props are dropped: size comes from `className`, and the files have one location.
- `sizes` is a required prop, not in the plan. The files are 1400px wide and always displayed smaller; without `sizes` the browser assumes the image is as wide as the viewport.
- The "no inline style" test was replaced by a type check that `style` is not accepted: `next/image` sets its own `style` attribute on the element.
- The note in the task description about the source pack in `public/logo/` is obsolete: it was already removed (see Current state).
- `git check-ignore` confirms `apps/web/public/brand/logo/*.png` is not ignored.
- Rendering in a browser was checked later: see "Visual check of T1, T2 and T4".

### T3 (2026-10-08)

- Sources: https://www.w3.org/TR/WCAG21/ (criteria 1.4.1, 1.4.3, 1.4.11, 2.1.1, 2.4.7, 4.1.2 and conformance requirement 5.2.1, quoted in `docs/design/accessibility.md`); the imported `readme.md` and the `guidelines/` cards for logo, type, slant, elevation and imagery.
- New information from the owner: the logo typeface is "Rushdriver italic". Recorded in `docs/design/brand.md` with the licence status. The display font is unchanged (decision 1 still applies: the font is identified, not supplied or licensed).
- `docs/decisions/README.md` holds no index of ADRs, so it was not changed. The ADR table in `docs/architecture.md` gained 0009 to 0011.

### T4 (2026-10-08)

- Sources: https://lucide.dev/guide/react/getting-started and the Lucide accessibility guide, read through Context7 (tree-shakable named imports; `aria-hidden` by default, removed when the icon gets `aria-label` or a title); the npm registry entry of `lucide-react` (peer dependency `react ^16.5.1 || ^17 || ^18 || ^19`, licence ISC) and `sideEffects: false` in its `package.json`; `apps/web/node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md` 16.3.6; the imported `Icon.jsx`, `Button.jsx`, `IconButton.jsx`, `Badge.jsx`.
- `lucide-react` is pinned to 1.48.0 (published 2026-09-24). The newest release, 1.53.0, was published on the day of the task; a two-week-old version was chosen for a production dependency. Dependabot proposes updates.
- `@testing-library/user-event` 14.6.7 added as a development dependency, as the spec allows: it turns Enter and Space on a focused button into a click the way a browser does, which `fireEvent` does not.
- Added files, not in the plan: `components/ui/class-names.ts` (joins conditional classes), `components/ui/core/button-styles.ts` (the classes `Button` and `ButtonLink` share), their tests and `components/ui/index.test.ts`.
- Changed file, not in the plan: `apps/web/eslint.config.mjs` turns `react/jsx-no-literals` off for `*.test.tsx`, where the literal text is fixture data.
- New tokens (Finding 2): `--weight-extrabold`, `--tracking-caps`, `--slant-cut-sm`. New utilities: `clip-slant`, `clip-slant-sm`.
- Decision 7 substitutions: button text 15, 17, 20 px became `--text-md`, `--text-lg`, `--text-heading-md` (16, 18, 22 px); the slanted badge letter spacing 0.06em became `--tracking-caps` and the 0.01em of the pill was dropped; button icons 16, 18, 20 px became 16, 20, 20; the large icon button icon 22 px became 24; the button border 1.5 px became 2 px; the pill badge side padding 9 px became 8 px.
- Differences from the imported API: `Icon` has a closed `size` (`sm`, `md`, `lg`) and no `color`, `strokeWidth`, `title` or `style`; `IconButton` with `variant="outline"` uses `--border-control` (the imported `--border-default` is under 3:1); the count is part of the accessible name; `Badge` requires children.
- While loading, `Button` sets the native `disabled` attribute, as the import did. An `aria-disabled` button that stays focusable would need a click handler and so a Client Component.
- `Logo` is exported from `components/ui/index.ts` with the T4 components.
- Verified: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`; every class the components use is present in the built CSS.
- The browser checks were done later: see "Visual check of T1, T2 and T4".

### Visual check of T1, T2 and T4 (2026-10-08)

Done in Chrome through the Claude in Chrome extension, on a temporary route under `app/[lang]/` served by `next dev`, deleted afterwards and never committed.

- Fonts: the page loaded Geist, Geist Mono and Barlow Condensed italic 700, 800 and 900. Every request of the page went to `localhost`; none to Google.
- Focus: the ring is dark on the light surface and yellow inside `data-surface="inverse"`, on text links, buttons and icon buttons. The slanted button shows a whole rectangular ring on both surfaces; the cut does not clip it.
- Hover: the outline button fills black with white text; the secondary button goes to `--action-secondary-hover`.
- Sizes: the three button sizes measure 36, 44 and 54 px high.
- Widths: checked at 1440, 1024 and 768 px by resizing the window, and at 320 px in a 320 px wide frame, because the Chrome window on the machine used does not go below 662 px. At 320 px the gutter is 16 px, the header token is 3.5rem and nothing overflows horizontally.
- The nine logo files were not all rendered: four placements were (wordmark dark and light, lockup dark, wide mono).
- Found and fixed: the count of an `IconButton` had a white ring on the inverse surface. The ring now takes the colour of the surface its variant is made for.
- Found, a layout rule and not a defect: a `Logo` sized with `h-* w-auto` is stretched when it is a direct child of a column flex container. Recorded in `docs/design/brand.md`.
- Not checked: the active (pressed) colours, and a screen reader.

### T5 (2026-10-08)

- Sources: the imported `Input.jsx`, `Select.jsx` and `Textarea.jsx`; https://www.w3.org/TR/WCAG21/ criteria 1.4.1 and 1.4.11 (already quoted in `docs/design/accessibility.md`).
- Added file, not in the plan: `components/ui/forms/control-styles.ts`, the box classes the three controls share.
- `Field` gives the control its props through a function child, so one component wires `id`, `aria-describedby`, `aria-invalid` and `required` for any control.
- Differences from the imported API: `label` is required; the error no longer replaces the hint, both are shown; `Select` options are `{ value, label }` objects only; `multiple` is not supported; `inputStyle` and `style` are dropped.
- The required mark is `aria-hidden` with `requiredLabel` as its `title`. The word is not added to the accessible name, because the native `required` attribute is already announced and the two would be read twice.
- Decision 7 substitutions: control text 15 px became `--text-md` (16 px); the large control height 52 px is `h-13` on the spacing scale; hint and error 12 px are `--text-xs`; the label 11 px is `--text-2xs`.
- The focused control shows a 2 px outline in `--focus-ring`, a `--border-strong` border and the `--shadow-focus` glow. The glow alone would not meet 3:1.
- Verified: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- Visual check in Chrome, on a temporary route deleted afterwards: default, required, invalid, disabled, icon and suffix, the three sizes (36, 44 and 52 px), select and textarea at 1440 px; focus on an input, on an invalid input and on a select; Tab skips the disabled input; at 320 px (in a 320 px frame) nothing overflows.
- Not checked: 768 and 1024 px (the layout is one fluid column per field), the controls on an inverse surface, and a screen reader.

### T6 (2026-10-08)

- Sources: https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/, `/radio/`, `/switch/` and `/spinbutton/`, read on 2026-10-08 (the switch pattern: an `input[type="checkbox"]` with the switch role uses the HTML `checked` attribute instead of `aria-checked`; the radio pattern: arrows move focus and selection, one tab stop; the spinbutton pattern: Up and Down change the value, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, editing keys of a text field must keep working); the imported `Checkbox.jsx`, `Radio.jsx`, `Switch.jsx` and `QuantityStepper.jsx`.
- Added file, not in the plan: `components/ui/forms/choice-styles.ts`, the row, label and description classes the checkbox, radio and switch share. Changed file, not in the plan: `forms/field.tsx` exports `FIELD_LABEL_CLASSES`, which the radio legend reuses.
- `Checkbox`, `Radio` and `Switch` are Server Components: the native input holds the state (`defaultChecked`, or `defaultValue` for the group), so none needs React state. The conventions listed them as client components "when uncontrolled"; native state made that unnecessary. `QuantityStepper` is the only Client Component of the task.
- `Switch` is an `<input type="checkbox" role="switch">`, the first of the two forms the task allows: it submits with a form and needs no script. No `aria-checked` is written.
- Differences from the imported API: `label` is required on `Checkbox` and `Switch`, and `legend` and `name` on `Radio`; `onChange` is the native change event, not the new value (a function that wraps it could not be created in a Server Component); `Radio` is a `fieldset` with a `legend`, not a `div role="radiogroup"`; `style` is dropped everywhere; `QuantityStepper` has an editable field (the import showed the number as text) and takes `label`, `decreaseLabel` and `increaseLabel` (Finding 3).
- The description of a checkbox, and the description and `aside` of a radio option, are linked with `aria-describedby` and kept out of the accessible name.
- `QuantityStepper` rules: the field is `type="text"` with `inputMode="numeric"` and the spinbutton role, because `type="number"` accepts `e`, `-` and `.`; a change that is not digits only is discarded; `onChange` fires for a typed number in range and for the clamped value when the field is left; an empty field restores the last value. Home and End are not bound, so they keep moving the caret. At a limit the button is `aria-disabled` and keeps the focus; the native `disabled` attribute is used only when the whole stepper is disabled.
- Corrected after review, in a separate `fix` commit: with a `name`, the visible field was the form control, so Enter on a typed `150` (maximum 20) or on an empty field submitted the draft. The `name` and `form` attributes now go on a hidden input that holds the settled value, Enter settles the draft first, and the field is `aria-invalid` while the draft is out of range (the spinbutton pattern). The tests cover the submitted `FormData`.
- For T10: `onChange` fires on each valid keystroke, so typing 12 emits 1 and then 12. `CartLine` decides whether the caller debounces before a server update.
- Borders: the stepper box and the radio card use `--border-control` (the imported `--border-default` is under 3:1); the checkbox, radio and switch keep the imported dark border.
- Decision 7 and Finding 2 substitutions: the 1.5 px borders became 2 px; label text 15 px became `--text-md`, description 13 px `--text-sm`, the radio `aside` 14 px stays `--text-sm`; the switch thumb 15 px became 14 px (`size-3.5`) inside the 40 by 22 px track; the stepper value 15 px became `--text-md`, its icons 14 and 16 px are both 16 px, and the disabled opacity 0.3 became 0.4, as on `IconButton`; the stepper heights are 32 and 44 px (`h-8`, `h-11`).
- Verified: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- Visual check in Chrome, on a temporary route deleted afterwards. Seen in screenshots at 1440 px and in a 320 px frame: every state of the four components (unchecked, checked, disabled, the three radio layouts, the two stepper sizes, a stepper at its maximum and a disabled one), and the focus ring on a checkbox. Checked with the real keyboard and read from the DOM, because the screenshots stopped working when the browser window went to the background: Space toggles the checkbox and the switch; Tab reaches each radio group once and the arrows move the selection; Enter on the minus button at the minimum changes nothing and the button keeps the focus; Up twice then typing `x7` in the field gives 37 (the letter is discarded); the live region is empty while typing and holds the value after the plus button; the focus outline is 2 px in `--focus-ring` on all of them (inside the box for the stepper parts). Measured: checkbox and radio 20 px, dot 8 px, switch 40 by 22 px with a 14 px thumb, steppers 44 and 32 px high. No horizontal overflow at 320, 768 and 1024 px (frames of those widths).
- Not checked: the focus rings of the switch, radio and stepper as pixels (only their computed outline), the hover and pressed colours, and a screen reader. The components are not made for an inverse surface (their text is dark), so that case was not checked.

### T7 (2026-10-08)

- Sources: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ and its example https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/, read on 2026-10-08 (the field has the combobox role, `aria-autocomplete="list"`, `aria-expanded`, and `aria-controls` while the popup is shown; DOM focus stays on the field and `aria-activedescendant` points at the active option, the only one with `aria-selected="true"`; Down and Up move and wrap; Enter takes the active option; Escape closes the popup; leaving without choosing keeps the typed text); the imported `SearchBar.jsx`.
- Differences from the imported API: `label` is required (the import named the field with its placeholder only), as are `listLabel`, `resultsLabel` and `noResultsLabel`; `submitLabel` and `placeholder` have no default text (Finding 3); suggestions are objects only, not strings; the options are `li role="option"`, not buttons inside list items; `style` is dropped; `onSubmit` no longer prevents the submission, it receives the event and the caller decides; `name` (default `q`) and the native `form` props are new, so the bar works from a Server Component page with `action` alone.
- `resultsLabel` is `{ one, other }` with a `{count}` placeholder, not a function: a function cannot be passed from a Server Component to a Client Component. `one` is used for exactly 1. That is correct for Portuguese and English; another language would need `Intl.PluralRules`.
- Kept from the import: the bar filters the supplied suggestions by label and shows six at most. Changed: the match ignores accents as well as case (`protecao` finds "Proteção"), which the import's `toLowerCase().includes` did not.
- The field is `type="text"`, as in the APG example, not `type="search"`: the browser's own Escape handling of a search field clears the text, and the pattern wants Escape to close the list first. Escape on a closed list does nothing (clearing is optional in the pattern). The optional Alt+Down, Alt+Up, Home and End bindings are not added, so Home and End keep moving the caret.
- The list opens on typing and on the arrows, not on focus (the import opened it on focus).
- The task said to guard `onPointerDown`. The guard is on `mousedown` of the list: preventing its default is what stops the focus from leaving the field. Confirmed in Chrome with a real click: the option is selected and the field keeps the focus.
- The focused box shows the 2 px outline in `--focus-ring` and the glow, like the other controls; the imported yellow border is under 3:1 (Finding 1). The active option has an outline as well as a tint.
- New token: `--z-dropdown` (20, the value in the import), added to `docs/design/foundations.md`.
- Decision 7 and Finding 2 substitutions: the 15 px field text became `--text-md`; the large submit text 20 px became `--text-heading-md`; the letter spacing 0.04em became `--tracking-caps`; the icons 18, 22 and 16 px became 20, 24 and 16 px; the heights are 44 and 60 px (`h-11`, `h-15`); the meta text 13 px became `--text-sm`.
- Verified: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- Visual check in Chrome, on a temporary route deleted afterwards. Seen in a screenshot at 1280 px: both sizes, the focused box, the open list over the content below it, the active option. Done with the real keyboard and mouse and read from the DOM: typing opens the list and the status reads "4 sugestões"; Down twice makes the second option active with a 2 px outline; a click on an option fills the field, closes the list and leaves the focus in the field; Escape closes the list and keeps the text; Tab reaches the submit button, whose outline is inside the box; Enter there navigates to `?q=` with the text. Measured: boxes 44 and 60 px high. No horizontal overflow in a 320 px frame.
- Not checked: the focus ring of the submit button as pixels (the screenshot timed out; only its computed outline), 768 and 1024 px (the bar is one fluid row), hover colours, touch, a screen reader. At 320 px the large size leaves about 97 px for the text: it is meant for wide heroes.

## Boundaries

- Always: tests before code in each task; read the relevant APG pattern and the bundled Next.js docs before the task; tokens only, no raw hex or `px`; every string and accessible name through props; run lint, typecheck, test and build before each commit.
- Ask first: adding any dependency not listed here; changing a token value beyond Finding 1; adding a component not in the 22; keeping a specimen route in the repository.
- Never: copy the imported `.jsx` as is; inline `style` for visual rules; a clickable element that is not a link or a button; hardcoded visible text; load a font, icon or script from a third-party CDN; redraw or recolour the logo.

## Definition of done

All tasks committed on `feat/003-design-system`, `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass locally and in CI, the contrast guard passes, the documentation in `docs/design/` matches the code, and the spec status is `done`.
