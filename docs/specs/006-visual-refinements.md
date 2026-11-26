# 006. Visual refinements: motion, section titles and footer

- Status: done on 2026-11-26 (approved by the owner on 2026-11-26)
- Idea: `../ideas/visual-refinements.md`
- Decisions: `../decisions/0009-styling-design-tokens-tailwind.md`, `../decisions/0013-e2e-test-runner.md`

## Objective

Give the public site a motion language of its own and fix two places that read badly. After this spec:

- the yellow bar that marks the current page fills from the left and leaves to the right, in the header, the footer and the language switcher, and the same bar fills under a link on hover;
- colour changes on hover fade instead of jumping;
- the large cards of the shop sections and the small product cards lock onto the pointer with corner brackets; on a device without hover they do it each time they come into view;
- changing page crossfades;
- the "Destaques" and shop sections of the landing page each have a visible title with a line above it;
- the footer leads with a large logo and the brand line, with the credits at the end.

## Out of scope

- Any new page, product data or change to Shopify.
- A 3D tilt, a light that follows the pointer, animated icons, text revealed word by word (idea, "Left out").
- Moving or animating content as the page scrolls, other than the cards of decision 5.
- The language switcher of the footer: it is removed, not restyled (decision 7).
- A new production dependency. Everything is CSS, the platform and React.

## Sources

- Next.js 16.3.6 bundled docs, read 2026-11-26:
  - `01-app/02-guides/view-transitions.md`: the App Router supports React's `ViewTransition` without configuration and without installing a React canary; navigations are transitions, so a `ViewTransition` animates on navigation; without browser support the site works and does not animate; the `::view-transition` overlay captures the pointer unless `pointer-events: none` is set; reduced motion is handled with a rule on the `::view-transition-*` pseudo-elements; "Anchoring the header" keeps a part of the page out of the crossfade.
  - `01-app/03-api-reference/02-components/link.md`, `transitionTypes`: a list of types passed to `addTransitionType` for the navigation, so a `ViewTransition` can animate differently by type.
- The prototype of the idea (2026-11-26): durations and curves to start from. Not a source of truth; values are tuned on the real pages.
- Read at the start of the task that needs them, cited in the task notes: React's `ViewTransition` reference (T8); MDN on `IntersectionObserver` and the `hover` media feature (T5); WCAG 2.3.3 and the technique for links that open a new window (T4, T8).

## Decisions taken with the owner (2026-11-26)

1. **The bar between pages.** When the current page changes, the bar under the old link empties towards the right; once it is gone, the bar under the new link fills from the left. The same in the header, the footer and the language switcher.
2. **Hover.** A link's colour fades in and out. In the footer and the language switcher the bar fills from the left on hover and leaves to the right. The buttons of the hero and the shop button of the header fade their colours too.
3. **Section titles.** "Destaques" becomes the title of the featured section, with "Escolhidos para ti" above it ("Featured", "Picked for you"); the eyebrow "Produtos" goes. The large cards get the visible title "Loja" with "Explora por secção" above it ("Shop", "Browse by section").
4. **Card motion.** Option A of the idea, Lock-in, as shown in the prototype. Large cards: four yellow brackets lock onto the corners with a short overshoot, the photo zooms and the arrow moves forward. Small cards (featured, and through `ProductCard` every shop listing): the brackets lock onto the image and the image zooms. A combination with the yellow bar of option C was tried and dropped by the owner: too busy.
5. **Devices without hover.** The card effect plays each time a card comes into view while scrolling, as many times as it comes into view.
6. **Page transition.** A crossfade when the page changes. Changing a filter or the search of a listing does not animate.
7. **Footer.** Logo at the centre, three to four times its current width, with "Lock it, send it!" large under it; the link columns; a line; the social icons; "LockMX © {year}. Todos os direitos reservados."; "Desenvolvido por Ricardo Rato", where the name links to `https://www.ricardorato.dev` in a new tab. The last lines are stacked and centred. The language switcher leaves the footer: it is always in the header.
8. **Motion rule.** The current rule of `../design/foundations.md` ("Quick and mechanical", at most `--duration-slow`, "Fades and slides only") is relaxed for this spec as a trial. The owner decides the durations on the finished result, and T9 writes the rule that comes out of it.

### Review of the owner (2026-11-26)

- Decision 1 and 2, amended: the header links also fill their bar on hover. The footer links no longer mark the current page with the bar, only on hover (their weight still marks it). The language switcher keeps both.
- Decision 5, amended: the earlier answer was ambiguous. On a device without hover the card effect plays when the card is tapped, not when it comes into view: the tap locks the card, and the link is followed once the effect has played (`--duration-lock`). Under reduced motion the link is followed at once. `ActivateInView` became `ActivateOnTap`.
- The trial durations stay as they are (T9 records them): `--duration-fade` 240 ms, `--duration-bar` and `--delay-bar` 260 ms, `--duration-lock` 360 ms with `--ease-lock`, `--duration-page` 240 ms.
- Open point 1: no shake. The title turning yellow as the card locks stays.
- The footer gets a Facebook icon beside Instagram; the address is a placeholder until the client gives it (ADR 0010, update of 2026-11-26).
- The crossfade over the footer and the header links that cannot be clicked during it are accepted.

## Open points

1. ~~Option A in the prototype also gives the title and the arrow of a large card a short shake as the brackets lock.~~ Closed on the review of 2026-11-26: no shake.

## Working branch

`feat/006-visual-refinements`, from `main` on 2026-11-26.

## Conventions for every task

The conventions of specs 004 and 005 apply: tests first; site components in `components/site/`, strings through props; primitives from `components/ui`; tokens only; every string in both dictionaries; a visual check at 320, 768, 1024 and 1440 px on the real route; each task ends with `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm test:e2e`.

Added by this spec:

- Every effect is CSS (transitions, keyframes, pseudo-elements). A script only sets a state (`data-active`, the transition), never a computed style.
- Under reduced motion every effect becomes an instant change of state, through the existing rule in `globals.css`, extended where it does not reach (the `::view-transition-*` pseudo-elements).
- A state is never shown by motion or by yellow alone: the current page keeps `aria-current`, a hovered card keeps its border change.
- New durations and curves are tokens in `styles/tokens.css`, never values inside a component.

## Tasks

### T1. The yellow bar of links
- Description: in `site-navigation.tsx`, the bar of the current page (`row`) becomes a pseudo-element scaled from 0 to 1 on the horizontal axis: it fills from the left when the link becomes current and empties to the right when it stops being current, the filling one waiting for the emptying one (decision 1). The `column` look (footer) gets the same bar for the current page and for hover, replacing `hover:underline` (decision 2). `language-switcher.tsx` gets the same bar for the current language and for hover, replacing the underline. Link colours fade on hover (`globals.css`, `a`). New tokens for the bar's duration and delay.
- Planned files: `components/site/site-navigation.tsx`, `components/language-switcher.tsx`, `app/globals.css`, `styles/tokens.css`, their tests, `e2e/shell.spec.ts`.
- Acceptance criteria: after a navigation the bar is under the new link only; a hovered footer link shows the bar; under reduced motion the bar appears and disappears at once; the links keep their names and `aria-current`.
- Tests: unit tests keep checking `aria-current` (the markup does not change). End-to-end: after navigating from home to the modular system page, the bar of the old link has width 0 and the new one its full width (computed transform, after the transition); with `reducedMotion: "reduce"` the transition duration is near 0.
- Commit: `feat: animate the yellow bar of links`
- Notes (2026-11-26):
  - The bar is two utilities in `globals.css`: `link-bar` (the bar of `aria-current`, with the wait) and `link-bar-hover` (the bar on hover, no wait, inside `@media (hover: hover)` as Tailwind's `hover:`). The origin flips with the state and only `scale` is animated, so it fills from the left and empties to the right with no script. Tailwind v4 writes `scale` as its own property, so the end-to-end test reads `scale` of `::after`, not `transform`.
  - New tokens: `--duration-bar` (260 ms), `--delay-bar` (the same), and `--duration-fade` (240 ms) for the colour fade of links (`a` in `globals.css`, colour and underline colour). The reduced motion rule now also zeroes `transition-delay` and `animation-delay`; without it the bar of the new page still waited.
  - The Complaints Book link of the footer got the same bar, so the legal column reads as one.
  - The language switcher: hover works as planned, but changing the language changes the `[lang]` segment and the layout is mounted again, so the bar of the new language appears at once instead of waiting and filling (checked in Chromium). Not worked around.

### T2. Colour fades of buttons
- Description: the buttons of the hero and the shop button of the header fade their colours on hover (decision 2). Today they use `transition-colors` at `--duration-fast` (120 ms), too short to be seen; the duration is raised in `button-styles.ts`, for every variant, slanted or not.
- Planned files: `components/ui/core/button-styles.ts`, its tests if a class is asserted.
- Acceptance criteria: hover on the primary, secondary and outline buttons changes colour gradually; pressing still moves the button down at once.
- Tests: none new: a duration cannot be observed in jsdom, and an end-to-end check of a colour mid-transition would be flaky. Checked by eye, stated in the task notes.
- Commit: `feat: fade button colours on hover`
- Notes (2026-11-26): `--duration-fade` (240 ms) on the base classes and on the clipped background of the slanted button; `transition-colors` leaves `translate` out, so pressing still moves at once. Checked in Chromium on the production build: the computed `transition-duration` is 0.24 s, and the hero's primary button went from `rgb(255, 182, 0)` to `rgb(233, 166, 0)` 80 ms into the hover and settled on `rgb(230, 164, 0)` (`--action-primary-hover`).

### T3. Titles of the featured and shop sections
- Description: the featured section gets the eyebrow "Escolhidos para ti" and keeps the title "Destaques" (decision 3). `ShopSections` is built on `Section` with the eyebrow "Explora por secção" and the visible title "Loja", replacing its heading for assistive technology only.
- Planned files: `components/site/sections/featured-products.tsx`, `components/site/sections/shop-sections.tsx`, the landing page, `server/i18n/messages/pt.ts` and `en.ts`, their tests, `e2e/shop-home.spec.ts`.
- Acceptance criteria: both titles are visible in both locales; the page's heading order skips no level; each section is still named by its heading.
- Tests: unit tests for the visible headings and eyebrows; end-to-end for the headings in both locales.
- Commit: `feat: add visible titles to the featured and shop sections`
- Notes (2026-11-26): `ShopSections` is built on `Section`; the eyebrow is `shop.home.sectionsEyebrow`. The end-to-end test went to `e2e/landing.spec.ts`, which already holds the headings of the landing page, not `e2e/shop-home.spec.ts`.

### T4. Footer
- Description: rebuild `site-footer.tsx` to decision 7: the logo (`lockup`, `light`) centred and three to four times today's 12rem, full width on a phone; "Lock it, send it!" large, in the display type, under it; a line; the link columns (navigation and legal, with the complaints book); a line; the social icons; the copyright line and the credits line, stacked and centred. The language switcher and its props leave the footer. The copyright reads "LockMX © {year}. Todos os direitos reservados." ("All rights reserved."), with the year computed as today. The credits read "Desenvolvido por" ("Developed by") and the name, a link to `https://www.ricardorato.dev` with `target="_blank"` and `rel="noopener noreferrer"`, whose accessible name says that it opens a new tab.
- Planned files: `components/site/site-footer.tsx`, `app/[lang]/(marketing)/layout.tsx`, the dictionaries, `site-footer.test.tsx`, `e2e/shell.spec.ts`.
- Acceptance criteria: the legal links and the complaints book are still in the footer (`../compliance/site-information-and-complaints.md`); the logo's `sizes` matches its rendered width; no sideways scroll at 320 px; the credits link opens a new tab and says so to assistive technology.
- Tests: unit tests for the order of the parts, the copyright with the year, the credits link and its attributes, the absence of the language switcher; end-to-end for the footer in both locales.
- Commit: `feat: rebuild the footer around a large logo`
- Notes (2026-11-26):
  - Logo 40rem wide at most (`max-w-160`), the full width of the content below it; `sizes` follows the container padding. The link columns sit together at the centre from `sm` up.
  - WCAG technique G201 (read 2026-11-26, advisory) asks for a warning that assistive technology speaks and a visual one. The credits link has the spoken one (hidden text in the accessible name); the visual one would need a new icon, which this spec's boundaries say to ask for first. Left for the owner.
  - The copyright year is computed in the marketing layout, as before.

### T5. Cards that play their effect in view
- Description: a small client component in `components/ui` that marks its child as active (`data-active`) while at least most of it is in view, on a device without hover only (`(hover: none)`). It sets and removes the attribute each time, so the effect replays on every entry (decision 5). Nothing changes on a device with hover, and nothing renders differently on the server.
- Planned files: `components/ui/` (the component and its test; the exact group decided in the task), `components/ui/index.ts`, `docs/design/components.md`.
- Acceptance criteria: the attribute follows the visibility on a device without hover; it is never set on a device with hover; the component adds no element that changes the layout.
- Tests: unit tests with a stubbed `IntersectionObserver` and `matchMedia` (jsdom has neither).
- Commit: `feat: add in-view activation for cards`
- Notes (2026-11-26): `components/ui/core/activate-in-view.tsx`. MDN, read 2026-11-26: the `IntersectionObserver` callback runs when the visible share crosses a threshold in either direction; `intersectionRatio` is that share; `(hover: none)` is a primary input that cannot hover conveniently. "Most of it" is 60%. The component is a `div` that takes the place of the card's existing wrapper, so it adds no box. Committed before T4.

### T6. Large card motion
- Description: in `ShopSections`, on hover, keyboard focus or `data-active`: four yellow brackets lock onto the corners with a short overshoot, the photo zooms as today and the arrow moves forward; on leaving, the brackets open (decision 4, open point 1). The brackets are decorative (`aria-hidden`).
- Planned files: `components/site/sections/shop-sections.tsx`, `app/globals.css` (keyframes, if needed), `styles/tokens.css`, `shop-sections.test.tsx`, `e2e/shop-home.spec.ts`.
- Acceptance criteria: the effect plays on hover and on keyboard focus; on the mobile project it plays when a card scrolls into view; the card stays one link with the same name; under reduced motion the final state is shown without movement.
- Tests: unit test that the decorations are hidden from assistive technology and the link name is unchanged; end-to-end on the mobile project that a card scrolled into view gets `data-active`.
- Commit: `feat: add lock-in motion to the shop section cards`
- Notes (2026-11-26):
  - The brackets are one decorative element drawn with eight gradient bars (`lock-brackets`), moved in by `inset` with an overshoot curve (`lock-brackets-on`, `--duration-lock` 360 ms, `--ease-lock`). The engaged state is one custom variant, `locked:` (hover, focus inside, or `data-active` above), on a named group, `group/lock`, so a group around the cards never engages all of them.
  - Open point 1: the shake of the title and arrow is not built; for the owner's review.
  - The mobile project (iPhone 12, WebKit) reports `(hover: none)`.

### T7. Small card motion
- Description: in `ProductCard`, on hover, keyboard focus or `data-active`: brackets lock onto the image and the image zooms as today (decision 4). Every product card has it: the featured carousel and the shop listings.
- Planned files: `components/ui/commerce/product-card.tsx`, `components/site/product-summary-card.tsx` (the in-view wrapper of T5), their tests, `docs/design/components.md`.
- Acceptance criteria: as T6; a card out of stock keeps its grey image; the brackets do not cover the badge.
- Tests: as T6, on `ProductCard`.
- Commit: `feat: add lock-in motion to product cards`
- Notes (2026-11-26):
  - The brackets are drawn before the badge, so the badges stay over them; the border change on hover stays, and also shows while the card is active in view.
  - The focus branch of `locked:` is `:focus-within`, not `:has(:focus-visible)`: Playwright WebKit matched the second but did not restyle the brackets. It changes T6 too: a card that takes the focus from a click also locks, which is harmless since the click leads away.
  - On a phone, the featured carousel's own rotation brings cards into view, so their effect plays on each rotation, not only while scrolling (decision 5). For the owner. Moot since the review of 2026-11-26: the effect plays on a tap.

### T8. Page transition
- Description: a crossfade when the page changes, with React's `ViewTransition` (decision 6). The header stays still during the crossfade, so the bar of T1 is seen moving ("Anchoring the header" in the bundled guide). A change of only the query (filters, search) does not animate. The overlay lets the pointer through. Under reduced motion the change is instant (rule on the `::view-transition-*` pseudo-elements in `globals.css`). How the change of page is told from a change of query is decided in the task, from the guide and React's reference, and recorded in the notes.
- Planned files: the marketing layout or a small client component in `components/site/`, `app/globals.css`, `e2e/shell.spec.ts`.
- Acceptance criteria: changing page crossfades in a browser that supports view transitions and works without animation in one that does not; changing a filter does not animate; links stay usable during the transition; nothing moves under reduced motion.
- Tests: end-to-end that navigation still works in the three engines and that a filter change keeps the focus where it was. The animation itself is checked by eye, stated in the notes.
- Commit: `feat: crossfade between pages`
- Notes (2026-11-26):
  - `components/site/page-transition.tsx` wraps the page inside `main` in a `ViewTransition` keyed by the path, with `enter` and `exit` set to the class `page` and `default="none"` (React's reference, read 2026-11-26: a new key is an exit and an enter; `none` turns the other triggers off). A change of the query only keeps the key, so it does not animate and the focus stays. The filter and search forms are plain GET forms, so they reload the page as before; the "clear filters" link is the change of query the end-to-end test uses.
  - The header has `view-transition-name: site-header`, does not animate and stays above the page; `::view-transition` lets the pointer through. As the guide says, a named element is skipped by hit-testing during the transition, so the header links cannot be clicked for those 240 ms (`--duration-page`).
  - Checked by eye in Chromium on the production build: the content crossfades; frames at 150, 350 and 600 ms show the bar leaving the old link and filling under the new one. The rest of the page (the footer included) fades as the root, so a shorter new page shows its footer over the old content for a moment. For the owner.

### T9. Design docs, checklist and status
- Description: after the owner reviews the durations on the finished pages, record the motion rule that comes out of it in `../design/foundations.md` (Motion and The slant: the bar of links and the brackets of cards as the motion signature) and `../design/accessibility.md` (view transitions under reduced motion); update `../design/components.md` (`ProductCard`, `Section`), `../architecture.md` if a folder is added, the checklist `../checklists/03-public-site.md` (footer, motion), and set this spec to `done`. `AGENTS.md` "Current state" names the next spec.
- Commit: `docs: record the motion rules`
- Notes (2026-11-26): the rule is in `foundations.md` (Motion and The slant) and `accessibility.md` (Motion, links that open a new tab); the tokens lost the "trial" comment. `components.md` already had `ProductCard` and `ActivateOnTap`; `Section` lives in `components/site`, outside the inventory, so it is not there. No folder was added, so `architecture.md` does not change. The checklist `03-public-site.md` got steps 14 and 15.

## Boundaries

- No new production dependency, icon or photograph without asking.
- A new design system component (T5) is part of this spec; any other is asked first.
- Nothing is deployed, pushed or opened as a pull request without an explicit request.
