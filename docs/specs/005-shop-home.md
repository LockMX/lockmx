# 005. Shop: connection to Shopify and shop-style home

- Status: approved (owner, 2026-10-11); amendment 1 proposed on 2026-10-13, not approved; phase B waits for prerequisites 2 to 5
- Idea: `../ideas/shop-style-home.md`, `../ideas/landing-focus-and-shop-route.md`
- Decisions: `../decisions/0014-shopify-headless-commerce.md`, `../decisions/0013-e2e-test-runner.md`, `../decisions/0010-icons-lucide.md`

## Objective

Start the shop. After this spec the landing page has the shape of a shop home: a search bar in the hero, a "Destaques" section with a carousel of featured products right after the hero, and one card per product type. The sections are built first with example data, so the owner and the client can judge the look; then the same sections read products from Shopify through one server module, without a component changing.

This is the first of the shop specs. Product pages, category pages, the cart, the checkout hand-over and customer accounts each come in a later spec; this one gives them the Shopify client and the product data shapes.

## Out of scope

- Product pages, category pages, search results, cart, checkout, accounts, order emails. Later shop specs.
- Publishing anything of this. The sections stay in development: `COMING_SOON` covers the whole site, and if the landing page is launched before the shop is connected, they are hidden for that launch (T8).
- Any write to Shopify. This spec only reads products and collections.
- A database of ours, an admin panel, webhooks.
- Changing the sections spec 004 built (hero text, "Porquê", buy block, complements, contact). The owner decided on 2026-10-11 to leave the page as it is and add the shop sections; the final order is settled after the layout is discussed with the client.
- The open points of ADR 0014 that this spec does not touch: Collective, MB WAY, invoicing, the checkout domain. They are closed by the spec that depends on each.

## Prerequisites (owner and client)

Phase A (T1 to T4) needs only the first one. Phase B (T5 to T8) is blocked until all are true.

1. **Carousel design.** Done on 2026-10-11: the owner designed it in the Claude Design project and it was read from there (read-only), as the storefront kit was. What it defines and where it differs from this spec is in "Carousel design" below.
2. **A Shopify store** the frontend can read: the client's store or a development store. Not verified: whether one exists today.
3. **The Headless channel** installed on that store with one storefront, and its Storefront API permissions set to read products and collections.
4. **The private access token** of that storefront, given to the developer outside the repository, and the store domain (`<name>.myshopify.com`).
5. **At least one collection of featured products** and a few products with images, in PT-PT and EN, so the reads can be checked against real data.

## Sources

Read on 2026-10-11 unless another date is given. A value marked "to confirm" is read again at the official source by the task that uses it.

- Storefront API reference, https://shopify.dev/docs/api/storefront :
  - GraphQL only, POST to `https://{store_name}.myshopify.com/api/{version}/graphql.json`.
  - Private access is for servers: header `Shopify-Storefront-Private-Token`, plus `Shopify-Storefront-Buyer-IP` with the buyer's address on requests that come from buyer traffic; requests not tied to a buyer, such as a build, do not need it.
  - Public access (`X-Shopify-Storefront-Access-Token`) is for browsers, where the buyer can see the token. This spec does not use it.
  - Without a token, products, collections, search and the cart can be read, with a query complexity limit of 1,000; tags, metafields, menus and customers need a token.
  - No fixed limit of requests per minute for buyer traffic; automated traffic is limited; a request that looks malicious gets `430`.
  - `@inContext` takes a country (prices) and a language (translated content).
- Getting started with the Storefront API, https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started : the Headless channel creates a storefront with a public and a private token; permissions are set per storefront; at most 100 active storefronts and tokens per shop; private tokens can be rotated.
- API versioning, https://shopify.dev/docs/api/usage/versioning : a version every three months, each supported at least 12 months; a request to an unsupported version is answered by the oldest supported one, and the `X-Shopify-API-Version` response header says which. Latest stable on the day read: `2026-10`, accessible until 2027-10-16.
- `Product` object, https://shopify.dev/docs/api/storefront/latest/objects/Product : `id`, `handle`, `title`, `featuredImage`, `priceRange`, `compareAtPriceRange`, `availableForSale`, `productType`, `vendor`; needs the `unauthenticated_read_product_listings` access; `totalInventory` and metafields need a token. The fields of `Image` were not on the page read: to confirm in T6.
- `Image` object, https://shopify.dev/docs/api/storefront/latest/objects/Image : `url` is `URL!` and takes a `transform` argument; `altText`, `width`, `height`, `id` and `thumbhash` are nullable (`width` and `height` are null when the image is not hosted by Shopify); `src`, `originalSrc` and `transformedSrc` are deprecated. Not on the page: the fields of `ImageTransformInput`. To confirm in T6.
- `MoneyV2` object, https://shopify.dev/docs/api/storefront/latest/objects/MoneyV2 , and `Decimal` scalar, https://shopify.dev/docs/api/storefront/latest/scalars/Decimal : `amount` is `Decimal!`, "a signed decimal number, which supports arbitrary precision and is serialized as a string" (examples `"29.99"`, `"29.999"`); `currencyCode` is `CurrencyCode!`.
- `ProductPriceRange` object, https://shopify.dev/docs/api/storefront/latest/objects/ProductPriceRange : `minVariantPrice` and `maxVariantPrice`, both `MoneyV2!`.
- `Product` object, same page as above, read again: `id`, `handle`, `title`, `priceRange`, `compareAtPriceRange`, `availableForSale`, `productType` and `vendor` are non-null; `featuredImage` and `onlineStoreUrl` are nullable; `totalInventory` is nullable and needs a token. Not on the page: what `compareAtPriceRange` holds for a product without a compare-at price. To confirm in T6 against the store.
- `collection` query, https://shopify.dev/docs/api/storefront/latest/queries/collection : takes `handle` or `id`, returns a nullable `Collection`; `Collection.products` takes `first`, `after`, `sortKey` (default `COLLECTION_DEFAULT`), `reverse` and `filters`.
- `predictiveSearch` query, https://shopify.dev/docs/api/storefront/latest/queries/predictiveSearch : suggestions as the visitor types, for products, collections, pages and articles; `limit` from 1 to 10. Not read: the `search` query. To confirm in T7.
- Languages, https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/markets/multiple-languages : `@inContext(language: ...)` returns translated titles and descriptions; the available languages come from the `localization` object and are set in the shop's Markets settings. Not on the page: the code for Portuguese of Portugal and what is returned when a translation is missing. To confirm in T6 against the store.
- Cart guide, https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage : read only to bound this spec; the cart is a later spec.
- Carousel pattern, https://www.w3.org/WAI/ARIA/apg/patterns/carousel/ : the container is a `region` or `group` with `aria-roledescription="carousel"` and a label without the word "carousel"; each slide is a `group` with `aria-roledescription="slide"`; a rotation control, a native button whose label says what it does, is the first element in the tab sequence of the carousel; rotation stops when anything in the carousel has the keyboard focus or the pointer over it, and does not resume until the visitor activates the control; the slides wrapper has `aria-live="off"` while rotating and `polite` when not.
- WCAG 2.1, 2.2.2 Pause, Stop, Hide (level A), https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html : content that starts moving by itself, lasts more than five seconds and is shown beside other content needs a way to pause, stop or hide it.
- Not read yet, read by the task that needs them: the bundled Next.js docs on data fetching and caching, on `images.remotePatterns` and on environment variables (T5, T6); the `Image` object and the `search` query of the Storefront API (T6, T7); the design of the carousel in the Claude Design project (T2).

## Decisions taken with the owner

1. **Structure** (2026-10-10 and 2026-10-11): search bar inside the hero, under its two actions and as wide as the two together; "Destaques" right after the hero; one card per product type (two at launch, decision 10).
2. **Placeholders** (2026-10-11): example products with name, price and a neutral image, each card with a visible "Exemplo" mark. The search bar is in place for its look and searches nothing until T7.
3. **Launch without the shop** (2026-10-11): the search bar and the shop sections are hidden by hand for that launch and shown again only after the integration is complete. No environment switch.
4. **Carousel** (2026-10-11): automatic, with a pause control. A new design system component, designed in the Claude Design project first.
5. **This is the start of the shop spec** (2026-10-11), so the cards and the search bar are born with the shape of the shop's data.
6. **Addresses** stay in English and equal in both locales (spec 002).
7. **Where an example product card leads** (2026-10-11): the contact section, until the product pages spec exists.
8. **Where the product type cards lead** (2026-10-11): the modular system card leads to `/modular-system`; the others are plain cards without a link until category pages exist.
9. **Catalogue at launch** (owner, 2026-10-11): racks and tyres. Some accessories come later.
10. **Product type cards** (owner, 2026-10-11): only the two types that have products, the others when they exist. The racks are the modular system (its page names the supports for helmets and boots), so the cards are: modular system, leading to `/modular-system`, and tyres, without a link.
11. **Carousel against the rules of the project** (owner, 2026-10-12): the icons `pause`, `play` and `package-open` join the closed set; the buttons are the existing `IconButton`, not a style of their own; the position marker is straight, so the slant stays with the badge of the cards.

## Product data rules

The shapes of T1 follow what the Storefront API returns (see "Sources"), so T6 is a mapping and no component changes.

1. **Money.** Shopify gives a decimal string and a currency code. The DTO keeps whole minor units (`amountCents`) and a required `currencyCode`, which is what `Price` takes. T6 converts the string without passing through a floating-point number; an amount with more decimal places than the currency has is rejected, not rounded, and the product is left out. The frontend never adds, multiplies or discounts.
2. **One price per card.** `price` is `priceRange.minVariantPrice`. `priceVaries` says the maximum differs, so a card can say "from" ("Desde"); the label and whether it is shown are decided in T3.
3. **Compare-at price** is optional in the DTO. T6 leaves it out unless it is greater than the price; what Shopify returns when there is none is confirmed there.
4. **Image** is optional (`featuredImage` is nullable): `url`, and optional `altText`, `width` and `height`. `ProductCard` fills its box, so it does not need the dimensions.
5. **Stock.** Only `availableForSale` is carried. `ProductCard` also has a "low" state; it needs an inventory count (token only) and a threshold nobody decided, so it is not used until the owner sets one.
6. **Product type.** `productType` is free text written by the merchant: it is shown, never used as a key. The product type cards have keys of ours.
7. **Identity.** `id` is Shopify's global id (an opaque string) and `handle` is what a product address will use.
8. **Locale.** Amounts are written for `htmlLang[locale]` (`pt-PT`, `en`), not the route segment.

## Open points

1. **How many products the store has at launch.** The types are known (decision 9), the number is not. With very few, a carousel may be the wrong component and a grid the right one. With the client.
2. **Featured products in Shopify.** Proposal: one collection whose handle is a setting of the site (T6). To confirm with the client, who manages it in the admin.
3. **Product photographs**, with the right to use them. With the client.

## Working branch

`feat/005-shop-home` (owner, 2026-10-11: the spec lives on its own branch). It was created from `feat/004-landing-page` and rebased on `main` on 2026-10-12, after that branch was merged.

## Conventions for every task

The conventions of spec 004 apply unchanged: tests first; pages specified by end-to-end tests in both locales; site components in `components/site/`, strings through props; primitives from `components/ui` only; tokens only; every string in both dictionaries; a visual check at 320, 768, 1024 and 1440 px on the real route; each task ends with `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm test:e2e`.

Added by this spec:

- Everything that talks to Shopify lives in `apps/web/src/server/shopify/`, imports `server-only`, and is the only reader of its environment variables. No token is ever in a `NEXT_PUBLIC_*` variable, in a log, in a test fixture or in a commit.
- Components receive product DTOs with only the fields they render, never a Storefront API response.
- Prices are shown exactly as Shopify returns them (amount and currency), formatted by the `Price` component. The frontend computes no price, discount or total.
- Unit tests never call Shopify: the client takes its `fetch` as a parameter and tests pass a double. End-to-end tests run against example data, so CI needs no store and no token.

## Tasks

### Phase A: the look, with example data

#### T1. Shop product shapes and example data
- Description: define the data the home sections render and one module that supplies it. `lib/shop/product.ts` holds the DTO types: a product summary (id, handle, title, image with its alternative text and dimensions, price and compare-at price as amount and currency, availability, product type) and a product type entry (key, title, address or none). `server/shop/home-catalogue.ts` exports `getFeaturedProducts(locale)` and `getProductTypes(locale)`, the only functions the page calls; in this task they return example data from `server/shop/example-catalogue.ts`, every item flagged as an example. The example titles and prices are in the dictionaries or the module as working data, clearly not the client's catalogue.
- Planned files: `apps/web/src/lib/shop/product.ts`, `apps/web/src/server/shop/home-catalogue.ts`, `apps/web/src/server/shop/example-catalogue.ts`, tests.
- Acceptance criteria: the page can ask for featured products and product types without knowing where they come from; every example item is flagged; the types say what is optional (image, compare-at price).
- Tests: unit tests for the shape of the example data in both locales and for the flag.
- Commit: `feat: add shop product shapes and example data`

#### T2. Carousel component
- Description: read the carousel designed in the Claude Design project (prerequisite 1) and build `components/ui/surfaces/carousel.tsx` to it, following the APG carousel pattern and WCAG 2.2.2 as cited in "Sources". Automatic rotation with a pause and play button that comes first in the tab order; rotation stops on keyboard focus inside and on pointer hover, and under reduced motion it does not start; previous and next buttons; swipe and scroll on touch; the slides wrapper is `aria-live="off"` while rotating and `polite` when stopped. Every label comes through props. Any icon the closed set lacks (pause, play, chevrons) is asked first. `docs/design/components.md` gets the component.
- Planned files: `apps/web/src/components/ui/surfaces/carousel.tsx` and test, `apps/web/src/components/ui/index.ts`, `docs/design/components.md`.
- Acceptance criteria: operable with keyboard, pointer and touch; never moves for a visitor who asked for reduced motion; no slide that is off screen is reachable with Tab; no sideways scroll of the page at 320 px.
- Tests: unit tests for roles, labels, the rotation control, stop on focus and hover, previous and next, reduced motion (with a fake timer); written first.
- Commit: `feat: add carousel component`

#### T3. Featured products section
- Description: `components/site/sections/featured-products.tsx`: a named region ("Destaques") right after the hero, with the carousel of `ProductCard`s from `getFeaturedProducts`. A card of an example product shows the "Exemplo" mark (a `Badge`). A card leads to the contact section (decision 7). With no products the section is not rendered.
- Planned files: the section and its test, `apps/web/src/app/[lang]/(marketing)/page.tsx`, dictionaries, `apps/web/e2e/shop-home.spec.ts`.
- Acceptance criteria: the section follows the hero in both locales; every example card carries the mark; prices are formatted by `Price`; the heading order of the page still skips no level.
- Tests: unit tests for the section (heading, one card per product, the mark, nothing with an empty list); end-to-end for its place in the page and the carousel controls, in both locales and on the mobile project.
- Commit: `feat: add featured products section`

#### T4. Product type cards and the hero search bar
- Description: `components/site/sections/product-types.tsx`: one card per entry of `getProductTypes`, after "Destaques"; a card with an address is a link, one without is a plain card (decisions 8 and 10). The hero gains an optional search slot under its actions, as wide as the two actions together, filled with `SearchBar`; in this task it has no suggestions and its submission leads nowhere, which is recorded in the task notes as the state T7 ends.
- Planned files: the section and its test, `apps/web/src/components/site/sections/hero.tsx` and test, the page, dictionaries, `apps/web/e2e/shop-home.spec.ts`.
- Acceptance criteria: two cards in both locales; the modular system card leads to `/modular-system`; the search bar has a label from the dictionaries and does not break the hero at 320 px; the hero still works without the search slot.
- Tests: unit tests for the cards (link or not) and for the hero with and without the slot; end-to-end for both in the page.
- Commit: `feat: add product type cards and hero search bar`

### Phase B: real data (blocked on prerequisites 2 to 5)

#### T5. Shopify Storefront API client
- Description: `server/shopify/config.ts` reads and validates `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` and `SHOPIFY_STOREFRONT_API_VERSION` (pinned to a stable version, `2026-10` on the day this was written). `server/shopify/client.ts` exports one function that posts a GraphQL document to the versioned endpoint with the private token header, takes `fetch` as a parameter, returns typed data or a typed error (network, HTTP status, GraphQL errors), and reports when the `X-Shopify-API-Version` response header differs from the pinned version. It never logs the token or a full request. The buyer IP header is added by the task that first makes a request on behalf of a buyer; reads for a cached page do not need it. `.env.example` gets the three names without values. Whether the variables are required at build time is decided here, after reading the bundled Next.js docs, so that CI keeps building without a store.
- Planned files: `apps/web/src/server/shopify/config.ts`, `client.ts`, tests, `apps/web/.env.example`, `docs/architecture.md`.
- Acceptance criteria: a missing or malformed variable gives a clear error that names the variable and not its value; no secret in any log line; the client is the only module that knows the endpoint and the headers.
- Tests: unit tests with a `fetch` double for the request (address, headers, body), each error kind and the version warning; a test that the error text never contains the token.
- Commit: `feat: add shopify storefront client`

#### T6. Featured products and product types from Shopify
- Description: `server/shopify/products.ts` reads the featured collection and maps it to the product summary of T1, with `@inContext` for the locale; `home-catalogue.ts` uses it when the Shopify variables are set and the example data otherwise. Read first: the `Image` object, the language codes and the behaviour for a missing translation, and the bundled docs on caching and on `images.remotePatterns`. The handle of the featured collection is a setting of the site (open point 2). A failed read shows the section's error or empty state, never a broken page.
- Planned files: `apps/web/src/server/shopify/products.ts` and test, `home-catalogue.ts`, `apps/web/next.config.ts`, the sections if they need an error state, `docs/architecture.md`.
- Acceptance criteria: with the variables set, the cards show the store's products, in the language of the page, with Shopify's prices; without them, the example data, still marked; a Shopify failure does not take the landing page down.
- Tests: unit tests for the mapping from a recorded response shape to the DTO, for both locales, for a product without image and for the failure path. The check against the real store is manual and recorded in the task notes with its date.
- Commit: `feat: read featured products from shopify`

#### T7. Search suggestions
- Description: give the hero search bar its behaviour. Read first the `predictiveSearch` and `search` queries. A Route Handler or Server Action of ours takes the text, validates it on the server (length, characters), asks Shopify and returns suggestion DTOs; the token stays on the server. The destination of a submitted search (a results page) belongs to the catalogue spec; until it exists, choosing a suggestion leads to what the suggestion is, and the task notes say what a plain submission does. A rate limit for this endpoint is raised here: it is the first endpoint of ours a visitor can call repeatedly.
- Planned files: decided in the task, inside `apps/web/src/server/shopify/` and `apps/web/src/app/`; the hero section; dictionaries; tests.
- Acceptance criteria: input is validated on the server; nothing from the browser is trusted beyond the search text; an empty or failed search shows the bar's empty state.
- Tests: unit tests for validation and mapping; end-to-end with example suggestions.
- Commit: `feat: add search suggestions`

#### T8. Hiding the shop sections, architecture and checklist
- Description: give the manual hiding of decision 3 one place: a single constant in the module that composes the landing page decides whether the search slot, "Destaques" and the product types are rendered, with a test for each state, so a launch without the shop is one line and cannot forget a piece. Update `docs/architecture.md` (`server/shopify/`, `server/shop/`, `lib/shop/`), write `docs/checklists/04-shop-home.md` from what was done, and set this spec to `done`.
- Planned files: the landing page, its end-to-end tests, `docs/architecture.md`, `docs/checklists/04-shop-home.md`, `docs/checklists/README.md`, this spec.
- Acceptance criteria: with the constant off, the page is the page of spec 004 and no example product, price or search bar is in the HTML; every path named in the docs exists.
- Tests: end-to-end for both states.
- Commit: `feat: add switch for the shop sections of the landing page`

## Amendment 1 (proposed 2026-10-13, not approved)

From `../ideas/landing-focus-and-shop-route.md`. Nothing below is implemented until the owner approves it. T9 depends on no answer of the client; T10 and T11 need none either, since the content they show is the example data of phase A.

### What it replaces

- **Objective.** The landing page presents the modular system and leads to contact; the shop home is `/shop`.
- **Decision 1** (structure of the landing page). The search bar, "Destaques" and the product type cards move to `/shop`.
- **Decisions 8 and 10** (where the type cards lead). `/modular-system` is removed, so neither card has a destination until category pages exist.
- **Out of scope, "changing the sections spec 004 built".** T9 changes them.
- **T7** gives its behaviour to the search bar of `/shop`, not of the hero.
- **T8**: the single constant hides the shop as a whole: the routes of T10 and T11 answer not found, and the header and the footer lose their shop entries. With it off, no example product, price, search bar or cart is in the HTML of any page.

### Decisions (owner, 2026-10-13)

12. The landing page is: hero, modular system, "Porquê LockMX" ending with a "Fala connosco" button, contact with the title "Pronto para arrumar a carrinha?", footer.
13. `/modular-system` is removed, without a redirect: the site was never public.
14. The shop is at `/shop`: search bar, "Destaques", "Categorias" with two large cards (racks, tyres).
15. The header gets a shop button in the primary style and the cart, both to the left of the language switcher; the footer links to the shop.
16. The cart is its header entry and an empty state until the cart spec; it keeps no lines, prices or totals of its own.

### To decide in the task, and ask if it is not obvious

- The header at 320 px: proposal, the shop button moves into the menu and the cart stays visible.
- The `h1` of `/shop` and of `/cart`, and the text of the empty cart: new strings, proposed in the task.
- The label of the racks card: "Sistema modular" (today) or "Suportes" (the owner's word on 2026-10-13).

### Tasks

#### T9. Landing page focused on the modular system
- Description: compose the landing page as decision 12. The `ModularSystem` section moves from its page to the landing page, right after the hero, with an `h2` and its parts as `h3`; `Benefits` gains an optional action shown after the list; `Contact` takes the title of the buy block. Removed from the page: the hero search slot's content, "Destaques", the product types, `Buy` and `Complements` (the last two deleted with their strings and tests). The route `/modular-system`, its path constant and its sitemap entry are deleted; the navigation entry and the hero's secondary action lead to the section. `FeaturedProducts`, `ProductTypes` and `HeroSearch` are not deleted: T10 renders them.
- Planned files: `apps/web/src/app/[lang]/(marketing)/page.tsx` and `layout.tsx`, `modular-system/page.tsx` (deleted), `components/site/sections/` (`modular-system`, `benefits`, `buy`, `complements`, tests), `lib/site/sections.ts`, `lib/site/public-paths.ts`, the sitemap, dictionaries, `e2e/landing.spec.ts`, `e2e/shop-home.spec.ts`, spec 004 (a note that its page changed).
- Acceptance criteria: the sections in the order of decision 12, in both locales; one `h1` and no skipped heading level; `/modular-system` answers not found; no price and no product card on the landing page; no sideways scroll at 320 px.
- Tests: unit tests for the changed sections (heading levels, the optional action); end-to-end for the order of the headings, the navigation and the removed address.
- Commit: `feat: focus the landing page on the modular system`

#### T10. Shop home at `/shop`
- Description: a page at `/shop`, inside the same shell, with an `h1`, the search bar (state of T4: it searches nothing), `FeaturedProducts` and `ProductTypes` with large cards. Which route group it lives in is decided here, after reading the bundled docs on route groups and layouts. `HeroSearch` is renamed for what it is now. Page metadata and the sitemap entry follow the constant of T8.
- Planned files: the route, `components/site/` (search, `product-types`), `server/shop/home-catalogue.ts`, `lib/site/public-paths.ts`, dictionaries, `e2e/shop-home.spec.ts`.
- Acceptance criteria: the three blocks in order in both locales; every product card carries "Exemplo"; the page works at 320 px; the carousel behaves as in T3.
- Tests: the end-to-end tests of T3 and T4 moved to the new address; unit tests for the large cards.
- Commit: `feat: add shop home route`

#### T11. Shop and cart in the header and the footer
- Description: the header gets the shop button and the cart (`IconButton`, `shopping-cart`, count hidden at zero); the footer gets a shop link. The cart leads to `/cart`, a page with the empty state and a link to the shop. No cart id, cookie or request to Shopify in this task.
- Planned files: `components/site/site-header.tsx`, `site-header-navigation.tsx`, `site-footer.tsx`, tests, `(marketing)/layout.tsx`, the `/cart` route, dictionaries, end-to-end tests.
- Acceptance criteria: both entries reachable by keyboard and named for assistive technology; the header does not overflow at 320 px; the current page is marked in the navigation.
- Tests: unit tests for the header and footer; end-to-end for the links, at the mobile and desktop widths.
- Commit: `feat: add shop and cart entries to the header`

## Carousel brief

For the Claude Design project. Written so the design answers what T2 needs.

- **What it is:** a row of cards (product cards first) that shows a few at a time and moves to the next ones. The number visible depends on the width: one at 320 px, more as the screen widens.
- **Movement:** advances by itself every few seconds; the interval is part of the design. A pause and play button is always visible and is the first control. It stops while the pointer is over it or the focus is inside it, and does not move at all under reduced motion.
- **Controls:** previous and next buttons, and optionally a position indicator. Their place at 320 px and at 1440 px.
- **States to draw:** rotating, paused, first and last position (or a loop), hover and focus of each control, a single card (no controls needed), an empty row.
- **Surfaces:** on the page surface and on the subtle surface. Tokens of the design system only; the slant motif at most once.
- **Motion:** slides only, with the durations and easings of the design system.

## Carousel design

Read on 2026-10-11 from `components/carousel/` of the Claude Design project (`Carousel.jsx`, `Carousel.d.ts`, `Carousel.prompt.md`, `Carousel Preview.html`), read-only. It is data for T2, not code to copy: it uses inline styles and fixed Portuguese strings.

What it defines:

- One, two, three or four cards per view from 0, 704, 960 and 1216 px of the carousel's own width (screens of 320, 768, 1024 and 1440 px with the shop's gutters). It moves a whole page at a time, every 6 s, with `--duration-slow` and `--ease-in-out`; it loops by default.
- Controls in this order: pause or play, position (a bar with a skewed marker and "n / total"), previous, next. From 704 px they sit on the heading's line, at the right, 40 px each; below that, under the row, 48 px each, with the position bar filling the middle.
- Buttons: card surface with a border at rest; filled black on hover; filled yellow with a black border and the focus ring on keyboard focus; sunken and faded when disabled. Pause and play are never disabled.
- One card: no controls and no rotation. No cards: a message with an icon in place of the row.
- Reduced motion: starts paused and never slides; previous and next change the page at once.
- Accessibility as drawn: a region with `aria-roledescription`, each slide a group with "n de total", slides out of view `aria-hidden` and `inert`, a visually hidden live text with the page, `off` while rotating.
- Touch: a swipe of more than 48 px changes the page.

Where it differs from this spec or the project rules, and what T2 does:

| Design | Rule | T2 |
|---|---|---|
| Icons `pause`, `play`, `package-open` | Not in the closed set (`arrow-left` and `arrow-right` are); a new icon is asked first | Added (decision 11) |
| Its own button, `CarouselButton` | `IconButton` exists, with other hover and focus looks | `IconButton` (decision 11) |
| Skewed position marker, and the slant badge of each `ProductCard` | The slant at most once | Straight marker (decision 11) |
| Rotation resumes when the focus or the pointer leaves | APG: after keyboard focus it does not resume until the visitor activates the control | Follows the APG |
| Cards per view measured with `ResizeObserver` | The server renders before any measure, so the row would jump after hydration | Sizes the slides in CSS (container queries, to confirm in the Tailwind docs) |
| A track moved with `transform` | "Boundaries" says scroll snap unless the design needs more | Scroll snap: see the notes of T2 |
| An empty state | T3 does not render the section without products | The component has the empty state; the section still hides itself |
| Fixed Portuguese strings, including the role descriptions | Every string through props, from the dictionaries | Props |
| Inline styles, `--lmx-ink-950` | Tokens through Tailwind classes; no primitive colour in a component | Semantic tokens |

## Task notes

### T1 (2026-10-11)

- `lib/shop/product.ts` has the types (`Money`, `ProductImage`, `ProductSummary`, `ProductTypeEntry`) and the product type keys, written to "Product data rules". `server/shop/example-catalogue.ts` has six example products, translated in the module, covering a reduced price, a price that varies, a product not for sale and no image (none has one, so the cards show the neutral placeholder). `server/shop/home-catalogue.ts` has `getFeaturedProducts` and `getProductTypes`; both are async, because T6 reads from the network.
- The titles of the product types are in the dictionaries (`shop.productTypes`). The example titles are in the module: they stand in for text that will come from Shopify, already translated.
- Not done here: the conversion of Shopify's decimal string to minor units (rule 1). It belongs to T6, where the string first exists.
- `server/shop/` does not import `server-only`: it reads no secret, and the package does not resolve under Vitest. T5 settles how the Shopify modules are protected and still tested.
- Nothing renders these modules yet, so the page is unchanged.
- Verified: `pnpm lint`, `pnpm typecheck`, `pnpm test` (747 tests, 59 files), `pnpm test:e2e` (534 passed, 2 skipped by design).

### T2 (2026-10-12)

- `components/ui/surfaces/carousel.tsx`, exported from `components/ui`; three icons added (32 in the set); `docs/design/components.md` has the row and the behaviour.
- **Scroll snap, not a moved track.** The design moves a track with `transform`, which needs a computed inline style, and the design system accepts none. The row is a scroll container with snap points at the start of each page; the buttons and the rotation call `scrollTo`, and the page shown is read back from the scroll. Touch needs no code of ours. The slide uses the browser's smooth scroll, so its duration is the browser's and not `--duration-slow`.
- **Slides per view in CSS**, by container queries at 44, 60 and 76 rem (the design's 704, 960 and 1216 px). The script only reads how many fit, to count pages and to make the slides out of view `inert`; it does that after the first measure, so a page without script keeps every slide reachable.
- **Position bar:** one segment per page, the current one dark, instead of a marker that slides: a marker needs a computed position.
- **Buttons** are 48 px at every width (`IconButton` `lg`). The design has 40 px from 704 px; a size per width would mean a class that repeats one the button sets, which the design system forbids.
- **Follows the APG where the design differs:** keyboard focus coming in stops the rotation and only the control restarts it. A click is not keyboard focus (`:focus-visible`), so it does not stop it.
- **Left out of the design's props:** `loop` (it always wraps), `defaultPage`, `showIndicator`, `controlsPlacement`, `surface` (the section owns the background), the reduced motion override and `onPageChange`. Nothing uses them.
- Known limit: a second press on next while the first slide is still moving asks for the same page again.
- Not verified in a browser in this task: no page renders the carousel until T3, whose end-to-end tests run it in the three engines (they pass, see T3). The build does contain its container queries (`@container (min-width:44rem)` found in the built CSS).
- Verified: `pnpm lint`, `pnpm typecheck`, `pnpm test` (773 tests, 60 files), `pnpm test:e2e` (534 passed, 2 skipped by design).

### T3 (2026-10-12)

- `components/site/sections/featured-products.tsx`, composed by the landing page right after the hero, on the subtle surface, with the section id `featured`. The page asks `getFeaturedProducts` and passes the products, the labels and where a card leads (the contact section, decision 7).
- The "Exemplo" mark is a `Badge` over the card, at the top right, on every product flagged as an example; it lets the pointer through, since the card is one link.
- Stock is "Em stock" or "Esgotado" from `availableForSale` (rule 5).
- **"Desde" is not shown** for a product whose price varies: `ProductCard` has no place for it. `priceVaries` is carried and unused; the label is decided with the product pages, before real products with variants are shown.
- The controls sit on their own line under the heading of the section, at the right, and not on the heading's line as drawn: the heading belongs to `Section`.
- New strings: `home.featured.*`, `shop.product.*`, `shop.carousel.*`.
- Spec 004's end-to-end test "states no price" now excludes the featured section; `shop-home.spec.ts` checks that every card there is marked as an example. The page is still behind `COMING_SOON`.
- First run of the carousel in real browsers: pause and resume, previous and next with wrap, cards out of view inert, Tab stopping the rotation, reduced motion starting paused, no sideways scroll at 320 px. Looked at by eye on screenshots at 320, 768 and 1440 px (one, two and four cards).
- Verified: `pnpm lint`, `pnpm typecheck`, `pnpm test` (780 tests, 61 files), `pnpm test:e2e` (602 passed, 2 skipped by design).

### T4 (2026-10-12)

- `components/site/sections/product-types.tsx`, after "Destaques", on the subtle surface, with the section id `categories` and the heading "Categorias": two cards (decision 10). The modular system card is one link to `/modular-system`; tyres is a plain card that says "Em breve", a text added here so the card does not look broken.
- `Hero` has an optional `search` slot under its actions. The slot adds no width of its own and stretches to the width of the two actions (`w-0 min-w-full`); at 320 px the actions wrap and it takes the column.
- `components/site/hero-search.tsx` (client) fills the slot with `SearchBar`. **State T7 ends:** no suggestions, and a submission is prevented, so it leads nowhere and the text stays in the field. Typing announces "Sem sugestões" to assistive technology, which is true.
- New strings: `home.productTypes.*`, `shop.search.*`.
- The tests and the code of this task were written in one pass, not test first.
- Looked at by eye on screenshots at 320 and 1440 px (hero and cards).
- Verified: `pnpm lint`, `pnpm typecheck`, `pnpm test` (788 tests, 63 files), `pnpm test:e2e` (634 passed, 2 skipped by design).
- Phase A is done. Phase B waits for prerequisites 2 to 5.

## Boundaries

- No new production dependency without asking: the client is `fetch`, the carousel is built on the platform (scroll snap) unless the design needs more and the owner approves a library.
- A new design system component, icon, token, photograph or factual text about a product or the company is asked first.
- Nothing here is deployed, pushed or opened as a pull request without an explicit request.
