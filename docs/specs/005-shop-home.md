# 005. Shop: connection to Shopify and shop-style home

- Status: approved (owner, 2026-10-11); amendment 1 approved (owner, 2026-10-13); amendment 2 approved (owner, 2026-10-13) and implemented; amendment 3 (phase B rewritten) approved with changes (owner, 2026-11-18); in progress (2026-11-25): every task is done except T18, which waits for the supplier and Collective
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
2. **A Shopify store** the frontend can read: the client's store or a development store. Not verified: whether one exists today. On 2026-10-14 none exists; how to create it, and why a client transfer store rather than a dev store, is in `../integrations/shopify-setup.md`.
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

### Phase B: real data (blocked on prerequisites 2 to 5; replaced by amendment 3 once approved)

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

## Amendment 1 (approved by the owner, 2026-10-13)

From `../ideas/landing-focus-and-shop-route.md`. T9 depends on no answer of the client; T10 and T11 need none either, since the content they show is the example data of phase A.

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

### Details (owner, 2026-10-13)

- The header on a narrow screen: the logo at the left; at the right the menu button and, to its left, the cart and a shop icon in place of the shop button. Measured at 320 px: 288 px between the gutters, the logo takes about 115 px and three 40 px buttons 120 px, which leaves 53 px for the gaps. The language switcher (about 54 px) does not fit beside them, so on a narrow screen it moves into the menu (owner, 2026-10-13: "if it does not fit, it moves"). The icon set has no shop icon; `store` is added in T11.
- The racks card keeps the label "Sistema modular".
- The `h1` of `/shop` is "Loja" and of `/cart` "Carrinho". The text of the empty cart is proposed in T11.

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

## Amendment 2 (approved by the owner, 2026-10-13)

After the owner showed amendment 1 to the client. The client wants the landing page directed at selling: the shop comes back to the landing page, right after the hero, and the explanation of the modular system goes back to a route of its own. The contact form becomes optional, and contact gets a simple page. The client gave https://teammxag57.com as the reference for the organization (a Shopify store).

### The reference (read 2026-10-13)

- Home: a hero, then a carousel of new products, then rows of large cards with a photograph behind the text, each leading to a collection.
- Collection page (`/collections/pneus`): the name of the collection, a column of filter groups with counts (availability, product type, brand, size, price, colour, tyre dimension), a sort control, a grid of small product cards, pagination. On a narrow screen the filters open from a button.
- Contact page (`/pages/contatos`): the email and a telephone under the title, then "Redes Sociais", then a short form.
- Footer: columns of links, then the social icons.

It is the reference for the organization, not for content: no text, product, price or image comes from it.

### What it replaces

- **Decision 12** (landing page: system, "Porquê", contact) and **decision 13** (`/modular-system` removed). Both reversed.
- **Decision 14**: the shop home is the landing page again; `/shop` becomes the product listing.
- The "Catálogo / Categorias" heading of the type cards, and the label "Sistema modular" on the racks card ("Details" of amendment 1).
- The contact section of the landing page: replaced by the page `/contact`.
- Spec 006 (contact form): on hold.
- T8: with the shop as the landing page, hiding the shop leaves the home with the hero alone. See open point 6.

### Decisions (owner, 2026-10-13)

17. **Landing page:** hero; "Produtos / Destaques" with the carousel, as it is; then large cards, one per section of the shop, at first "Suportes LockMX" and "Pneus", each with the place for a background image. No "Catálogo / Categorias" heading.
18. **A large card opens the shop on that section:** filters at the left, products at the right, in small cards like the ones of "Destaques".
19. **`/modular-system` comes back** as the page that explains the system, and now holds "Porquê LockMX" too.
20. **`/contact`** is a simple page, reached from the header and the footer: a subsection "E-mail" with the address, and a subsection "Redes Sociais" with the Instagram icon leading to the LockMX page.
21. **Navigation:** Início, Sistema modular, Merchandise, Contactos. "Merchandise" opens the shop on the LockMX merchandise.
22. **Footer:** the email and the Instagram icons under the logo.
23. **Contact form:** optional for the client. Spec 006 goes on hold; if it is built, it lives on `/contact`.

### Proposed, where the request leaves room (approved with the amendment)

- **Addresses.** `/shop` lists every product; `/shop/racks`, `/shop/tyres` and `/shop/merchandise` list one section each. In English in both locales, like every path (spec 002). The shop button of the header keeps leading to `/shop`; the header keeps the cart.
- **Sections of the shop** are keys of ours (`racks`, `tyres`, `merchandise`), mapped to Shopify collections in phase B. Merchandise has no large card on the landing page: the owner named two.
- **Example data.** The listing uses the example catalogue, with a few merchandise examples added and flagged like the others. Nothing of it is the client's catalogue.
- **Filters.** A filter is only real when the catalogue has the data behind it (in Shopify: product type, vendor, tags, metafields). Built now: the sections of the shop as links ("Todos", "Suportes LockMX", "Pneus", "Merchandise") and availability (in stock, sold out), which the example data has. Brand, size and price wait for the catalogue. See open point 3. The filters are a plain form sent with GET, so they work without script, and the server does the filtering: the address carries the choice.
- **No sort control and no pagination** until the number of products asks for them.
- **Search bar.** At the top of the listing. It still searches nothing (T7).
- **Large cards.** A site component, not a change to `Card`: a link with the title over a placeholder surface, and a `next/image` behind the title once a photograph exists. The placeholder is a surface of the design system, not an image: no stock or placeholder photograph is published (spec 004).
- **Heading order.** The cards section keeps an `h2` for assistive technology only ("Loja"), so the page has no gap between the `h1` and the card titles.
- **Hero.** Primary action "Ver a loja" to `/shop`; secondary "Conhece o sistema" to `/modular-system`.
- **`/modular-system`:** restored from the commit before T9 (`5fb00f2`), with "Porquê LockMX" after the parts; its closing action leads to `/contact`.
- **`/contact`:** `h1` "Contactos", one sentence, "E-mail" and "Redes Sociais" as `h2`. The title "Pronto para arrumar a carrinha?" goes with the section that had it. In the sitemap, like `/modular-system`.
- **Navigation labels:** "Contactos" / "Contact", "Merchandise" in both.

### Open points

Answered by the owner on 2026-10-13: (1) the glyph as an icon of ours; (2) the page is `https://www.instagram.com/lockmx_modularsystem`; (3) section and availability only, the rest with the real catalogue. Points 4 and 6 stay open; point 5 was measured in T14 and fits.

1. **The Instagram icon.** The installed Lucide (1.48.0) has no brand icons: no `instagram` file exists in the package. Options: the Instagram glyph drawn as an icon of ours, outside Lucide (an exception to ADR 0010, after reading Meta's brand rules); or the word "Instagram" as a link with a generic icon. Ask first: it is a new icon.
2. **The address of the LockMX Instagram page.** Not found by search; not guessed.
3. **Which filters** beyond section and availability, and from when.
4. **Background images** of the large cards: from the client.
5. **Whether the header fits** "Merchandise" beside the other entries, the shop button, the cart and PT/EN at 1024 px: measured in T14; if it does not, it is raised.
6. **Launch.** With the shop as the landing page, a launch before Shopify is connected has almost nothing to show. Whether the launch now waits for phase B is the owner's and the client's call.

### Tasks

#### T12. Modular system page and contact page
- Description: restore `/modular-system` (page, path constant, sitemap entry, strings, end-to-end file) from the commit before T9, and render `Benefits` after the parts with its action leading to `/contact`. Add `/contact` as decision 20 describes, with the email as a `mailto:` link; the Instagram link follows open points 1 and 2 and is left out until they are answered. Delete the `Contact` section component and the section ids `system`, `why` and `contact`.
- Acceptance criteria: both pages in both locales, each with one `h1`, its own title and canonical address, in the sitemap; no sideways scroll at 320 px.
- Tests: unit tests for the sections and paths; end-to-end for the content and the head of both pages.
- Commit: `feat: add modular system and contact pages`

#### T13. Shop listing
- Description: `/shop` and `/shop/[category]` render one listing: the name of the section as `h1`, the search bar, the filters and the grid of product cards from `server/shop/`. An unknown section answers not found. The bundled docs on dynamic segments, `generateStaticParams` and `searchParams` are read first.
- Acceptance criteria: each section shows only its products; the availability filter narrows the grid and survives a reload; every card carries "Exemplo"; an empty result says so; the filters are usable with the keyboard and at 320 px; the browser decides nothing (the server reads the address and filters).
- Tests: unit tests for the filtering and the example data; end-to-end for the three sections, the filter and the unknown address.
- Commit: `feat: add shop listing with filters`

#### T14. Landing page as the shop home, navigation and footer
- Description: the landing page as decision 17, with the large cards leading to the listings; the hero actions as proposed; the navigation of decision 21; the footer with the contact icons under the logo; "Sistema modular" and "Contactos" marked as the current page on their pages. `ProductTypes` gives way to the large cards.
- Acceptance criteria: the order of decision 17 in both locales; one `h1`; the header without sideways scroll and without a wrapped entry at 320, 768, 1024 and 1440 px; every link of the header and the footer leads to a page that exists.
- Tests: unit tests for the cards, the header and the footer; end-to-end for the landing page, the navigation and the widths.
- Commit: `feat: make the landing page the shop home`

## Amendment 3 (proposed 2026-11-17, approved with changes by the owner, 2026-11-18)

Phase B (T5 to T8) was written before amendment 2 and no longer fits the site: T6 reads the product types, which T14 removed; T8 hides a search slot and type cards the landing page no longer has; nothing reads the `/shop` listings, their sections and filters, or merchandise. This amendment replaces T5 to T8 with T15 to T19. Phase A, amendments 1 and 2, the product data rules and the conventions stay.

### What changed since phase B was written

- **The store (owner, 2026-11-17).** The client signed up at shopify.com (path B of `../integrations/shopify-setup.md`); nothing is set up yet, and the set-up is done by the owner with the client. The developer joins as a collaborator.
- **Two kinds of products.** The client's own products (LockMX racks and tyres), created and managed by the client in the Shopify admin; and resale of the whole catalogue of a contact's existing Shopify store, the supplier shipping to the customer. The resale is meant to go through Shopify Collective (ADR 0014): the supplier's products are imported into the LockMX store by Shopify and kept in sync, not copied by us. Whether the supplier is eligible is not known yet.
- **What the site reads** is the same for both kinds: products published to the Headless channel. That Collective products reach a headless storefront this way is inferred, not stated by Shopify (ADR 0014, "Not yet verified"); T18 proves it.

### Decisions (approved by the owner, 2026-11-18)

The owner approved the amendment on 2026-11-18 and changed decisions 24, 25 and 27 as below. They follow what Shopify does with supplier products (read 2026-11-18, sources in `../integrations/shopify-setup.md`): Collective imports a supplier's products with their title, description, media, variants, vendor, category and product type, and can keep them in sync, but **"Collections, tags, metafields, and discount codes aren't imported from a supplier's store"**. The supplier's sections never reach the LockMX store; they are rebuilt there once, by rules.

24. **The sections come from the store, not from the code.** A menu of the store with the handle `shop` (Content > Menus) lists the sections, in the client's order. Each top-level item that links to a collection is a section: its address is `/shop/<collection handle>`, its name is the collection's title in the page's language (`@inContext`; menu item titles are not among Shopify's translatable resources, collection titles are), its image the collection's image. A section added, renamed, reordered or removed in the admin changes the site with no code change. Only `featured` ("Destaques") stays a fixed handle. `/shop` lists every product published to the channel. This replaces the fixed `racks`, `tyres` and `merchandise` keys of amendment 2 and answers open point 2 of the spec. Nested menu items (subsections) are not read in this spec (open point 4).
25. **The example data only while the store is not connected:** when the Shopify variables are not set (development, CI, the "coming soon" deployment), with its "Exemplo" mark. Once they are set, the site never shows example data, also when Shopify fails (empty state instead). The launch checklist requires the variables.
26. **No switch to hide the shop (old T8 is dropped).** The shop is the landing page since amendment 2: the launch is with the whole shop, not the landing page alone.
27. **Supplier products are sorted by automated collections in the client's store.** `/shop` shows the whole store, the client's products and the supplier's. Each section is a collection whose conditions match the products (for supplier products, "Product type is equal to ..." or "Vendor is equal to ...", kept in sync by Collective), so new or retyped products move by themselves. Creating a collection for a new section and adding it to the `shop` menu is admin work done once per section, not code. What cannot be automatic: a supplier reorganising its own collections without changing its product types.
28. **The product cards keep leading to `/contact`** (decision 7) until the product pages spec, which comes right after this one. The content of those pages (name, description, photographs, variants, price, stock) is the store's; the layout is the site's.

### Open points

1. **Prerequisites 2 to 5** of this spec, now in the order of `../integrations/shopify-setup.md` ("Next steps").
2. **The supplier and Collective:** country, currency, Shopify Payments, and whether they accept to join Collective as a supplier. If they cannot, their products are created as LockMX products (`shopify-setup.md`, "Supplier products").
3. **How many products** the supplier's catalogue has: from about 250 products a listing needs pagination, and the filters of amendment 2 (open point 3) may need product type and brand.
4. **Sections for supplier products:** which sections the client wants, and whether subsections (nested menu items) are needed; the supplier's product types decide whether automated collections can sort them (question 6 in `shopify-setup.md`).

### Where the spec stands (2026-11-25)

- T15, T16 and T17 are done. The store set-up of prerequisites 2 to 5 is done (`../integrations/shopify-setup.md`, check of 2026-11-25); the search rule of ADR 0016 is created in Vercel.
- T19 is done: `../architecture.md` updated, `../checklists/04-shop-home.md` written, the spec `in progress`.
- **T18 waits for the supplier** (open point 2): Shopify Payments is active in the client's store (owner, 2026-11-25), the owner is talking to the supplier. Open for T18: the site has no cart yet (decision 28), so the "one real order" needs a checkout address made outside the site, for example a cart created once from the developer's machine, which needs a Storefront permission to write carts that the storefront does not have now (read-only by design). To decide with the owner when T18 starts; otherwise the order waits for the cart spec.
- After this spec: the product pages spec (decision 28), then the cart and checkout hand-over.
- **The shop joins the sitemap with the product pages spec** (owner, 2026-11-25): `/shop`, its sections and the product pages, read from the store. It was left out while it could show example products (old T8, dropped by decision 26); at launch the store is connected and shows only its own products (decision 25), so that reason no longer holds. The details are settled in that spec.

### Tasks

#### T15. Shopify Storefront API client
- Replaces T5, with the same description, files, acceptance criteria and tests. It needs no store: every test uses a `fetch` double. The API version is the latest stable one on the day of the task, read again at the source.
- Commit: `feat: add shopify storefront client`
- Notes (2026-11-24, done):
  - Differences from T5, owner's store set-up: the token variable is `SHOPIFY_PRIVATE_ACCESS_TOKEN`, the name the owner gave it in `.env.local`. The API version is a constant in `config.ts` (`2026-10`), not a variable: the queries are written and tested against it, so a new version is a reviewed change; the client warns when Shopify answers with another one.
  - Neither variable set gives `null` (not connected, decision 25); one without the other, a malformed domain or a token with spaces fails with a message naming the variable, never its value. The variables are read when called, so `next build` and CI need none.
  - The client posts to `https://<domain>/api/<version>/graphql.json` with `Shopify-Storefront-Private-Token`, a 10 s timeout, and returns data or `network`, `http`, `graphql` (also when partial data comes with errors) or `invalid-response`. No buyer IP header: these reads are for cached pages.
  - Vitest maps `server-only` to an empty module (`src/test/server-only.ts`); Next.js resolves it itself.
  - Checked against the store on 2026-11-24 with a read-only query from the owner's machine: `lockmx.myshopify.com` answers with version 2026-10, languages `EN` and `PT_PT`, the `shop` menu with one collection item, the collection `suportes-modulares` with image, two products. Findings for T16: `@inContext` goes on the operation (`query Name @inContext(language: EN)`), not on a field; **the collection handle is translated** (`modular-supports` in English) when the translation app translates it, so the section address differs per locale unless the English handle is left equal; menu item titles come back untranslated, as expected (decision 24 uses the collection title).

#### T16. Listings and featured products from Shopify
- Description: `server/shopify/catalogue.ts` reads, with `@inContext(language)` for the locale: the sections from the `shop` menu and their collections' titles and images (decision 24), the products of a section's collection by handle, every product of the channel for `/shop`, and the `featured` collection. The fixed section keys of `lib/shop/product.ts`, their dictionary labels and `isShopSection` give way to the sections read from the store; a handle that is not in the menu is not found. It maps each product to `ProductSummary` following the product data rules (money conversion, compare-at price, image, availability). `server/shop/home-catalogue.ts` and `server/shop/shop-listing.ts` use it when the Shopify variables are set and the example data otherwise (decision 25); the pages do not change. The availability filter is applied by the API if it offers a filter for it, by the server otherwise. Read first, and record in the task notes: the `collection(handle:)` and `products` queries, the product filters of a collection, the maximum page size, the language codes and the behaviour of a missing translation, the image host for `images.remotePatterns`, and the bundled Next.js docs on caching and revalidation (pages refresh on a time basis; no webhooks in this spec). A failed or empty read shows the listing's empty state or hides "Destaques", never a broken page; an unknown collection is an empty section, not an error page.
- Planned files: `apps/web/src/server/shopify/catalogue.ts` and test, `home-catalogue.ts`, `shop-listing.ts`, `apps/web/next.config.ts`, the listing and section components if they need an error state, `docs/architecture.md`.
- Acceptance criteria: with the variables set, the landing page and the listings show the store's products in the page's language with Shopify's prices and availability; without them, the example data, still marked; a Shopify failure leaves every page working; the frontend computes no price.
- Tests: unit tests for the mapping from recorded response shapes (both locales, a product without image, a compare-at price equal to the price, an amount with too many decimals), for the choice between Shopify and example data, and for the failure path. The check against the real store is manual and recorded with its date.
- Commit: `feat: read the shop listings from shopify`
- Notes (2026-11-24, done):
  - Owner's decisions in the task: every section of the `shop` menu gets a large card on the home page (replaces "racks and tyres only" of amendment 2); the header keeps its "Merchandise" entry to `/shop/merchandise`, a fixed handle the owner creates in the store (the link is a shortcut the client asked for).
  - Read at the source: `@inContext(language:, country:)` with variables on the operation; `PT_PT` and `EN` for the two locales, country `PT`. `first` cannot exceed 250 (the store answered "first cannot exceed 250" on 2026-11-24), so a listing reads one page of up to 250 products; pagination waits for a catalogue that needs it (open point 3). A missing translation comes back in the default language (product titles under `EN` on 2026-11-24). Shopify returns a compare-at price of `"0.0"` when there is none.
  - Mapping: the compare-at price is shown only when it is greater than the price **and** every variant costs the same, because the lowest price and the lowest compare-at price can belong to different variants. Amounts become whole cents from the decimal string (trailing zeros accepted, extra significant decimals rejected and the product left out).
  - Sections come from the menu items that link to a collection, in the menu's order; other items are skipped. The section's title and image are the collection's, translated. A handle that is not a section of the current source is not found (404); a section whose read fails shows the empty listing.
  - Caching: the client asks for `cache: "force-cache"` with `revalidate: 300` (a POST is cached only when asked; only 200 answers are stored), and the sections and product reads are wrapped in `React.cache`, once per request.
  - Images: `images.remotePatterns` allows `https://cdn.shopify.com/s/files/**`, not pinned to this store (Collective images unverified, T18) and with any search, since Shopify addresses carry `?v=`. The large section card shows the collection's image under the `surface-backdrop` token, decorative (`alt=""`).
  - Example data: the end-to-end server sets the two Shopify variables to empty, which wins over a developer's `.env.local` (Next.js reads `process.env` first) and means "not connected", so `pnpm test:e2e` runs on example data as in CI.
  - Checked against the store on 2026-11-24: the `featured` collection read returned nothing because the collection the owner created has the handle `destaques`; it must be `featured` (decision 24).

#### T17. Search suggestions
- Replaces T7, with the same description, applied to the search bar of the listing (amendment 2 moved it there from the hero). The rate limit of the endpoint follows ADR 0015 and the hosting decision (ADR 0007, ADR 0012), which this task raises if they are still open.
- Commit: `feat: add search suggestions`
- Notes (2026-11-24, done):
  - Owner's decisions in the task: the rate limit is a rule of the Vercel firewall on `/api/search`, 100 requests per minute per IP (ADR 0016), using the one rule of the Hobby plan, free while the contact form is on hold; a plain search, and a product suggestion, lead to `/shop?q=<text>`, the listing of the whole shop narrowed to the search, until the product pages exist; a section suggestion leads to its listing; the structure (handles of sections, routes) is in English, product handles may stay in Portuguese.
  - Layers: `lib/shop/search.ts` (what a search is: 2 to 100 characters, spaces collapsed, control characters removed; the `ShopSuggestion` shape; the example matching), `server/shopify/search.ts` (the `predictiveSearch` and `search` queries), `server/shop/search-suggestions.ts` (validation first, then the store or the examples, failure gives nothing), `app/api/search/route.ts` (reads `q` and `lang`, 400 for a language the site does not have), `components/site/use-shop-suggestions.ts` and `shop-search.tsx` (the browser side).
  - A Route Handler and not a Server Action: a search is a read, and the firewall rule needs a fixed path (a Server Action posts to the page's address). Route Handlers are not cached (bundled `01-getting-started/15-route-handlers.md`); the Shopify reads behind it are, for 5 minutes, by what is sent. The text is sent in lower case so that case variants share an entry: the store ignores case (checked: `CABID`, `Cabid`, `SUPORTE`).
  - Read at the source (2026-11-24): `predictiveSearch` takes `limit` from 1 to 10 per type and returns products, collections, queries, pages and articles; `search` returns up to 1,000 results, `first` at most 250 (the store answered "first cannot exceed 250"), products match partial words. Neither page says whether `@inContext` translates the answer; the store answered in English under `EN` (collection "Modular Supports"). Both tolerate a typing error (`supotre` found the supports) and match any word (`botas suporte` found both products), so the search bar shows the server's suggestions as given: `SearchBar` gained `filter={false}` for that, and `pending`, so "no suggestions" is not announced before the answer arrives.
  - A product suggestion leads to `/shop?q=<the product's title>`, which is interim, until the product pages exist. The store's search matches any word, so the listing can show other products too: the boots support's full title also finds the hanger (checked 2026-11-24). A title that is not a valid search (over 100 characters) gives the text typed instead.
  - The field asks for suggestions only after the visitor changes it: a search listing opens with the text in the field and sends no request.
  - Collections outside the `shop` menu (`featured`, and `merchandise` until it is added to the menu) are found by `predictiveSearch` but have no listing: they are left out.
  - The browser waits 250 ms after the last key, cancels the request before, drops an answer to a text no longer in the field, keeps the last list until the next answer, and treats a 429, a failure or an answer of another shape as no suggestion. A suggestion whose address is not of this site is dropped.
  - The listing reads `q` like `availability`, as untrusted input; a section listing ignores it. The filters form keeps it in a hidden field; "Clear filters" clears it too. An empty result says "Nenhum produto corresponde à pesquisa."
  - Checked against the store on 2026-11-24 (build with the real variables, `next start`): `supotre` under `EN` gives the section and the two products, `dest` and `merch` give nothing, one character gives nothing, an unknown language gives 400; `/pt/shop?q=cabide` lists the hanger only.

#### T18. Supplier products through Collective
- Description: no code unless the check finds a difference. When the client's store and the supplier's store are connected through Collective and some supplier products are imported and published to the Headless channel: read them through the client of T15 and T16, and record in the task notes whether they come back like the client's own products (fields, prices, availability, images, translations). Then one real order of a supplier product through the checkout, recorded with its date. Any difference found becomes a task here.
- Acceptance criteria: the two checks are recorded; ADR 0014 "Not yet verified" is updated.
- Tests: unit tests only if a mapping changes.
- Commit: only if code or docs change (`docs: record the collective check`).

#### T19. Architecture, checklist and status
- Replaces T8 without the switch (decision 26): update `docs/architecture.md` (`server/shopify/`, `server/shop/`, `lib/shop/`), write `docs/checklists/04-shop-home.md` from what was done, and set this spec to `done`, or to `in progress` naming what waits for the client or the supplier.
- Commit: `docs: add shop home checklist`
- Notes (2026-11-25, done):
  - `docs/architecture.md`: a row for `lib/shop/`, the shop parts of `components/site/`, the `server-only` stand-in of `test/`, a "Shop" section with the rules the code follows, and ADR 0016 in the decisions table. The `server/shopify/` and `server/shop/` rows were already up to date (T15 to T17).
  - `docs/checklists/04-shop-home.md` is written from T1 to T17 and says T18 is not done; `docs/checklists/README.md` lists it.
  - The spec is `in progress`: T18 waits for the supplier (open point 2). The checklist and ADR 0014 are updated when T18 is done.

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

### T10 (2026-10-13)

Done before T9, so the shop sections had a page to move to and their end-to-end tests never stopped running.

- `/shop` is `app/[lang]/(marketing)/shop/page.tsx`: it stays in the group that holds the shell, since a second group would need a second copy of the layout. The `(shop)` group named in `apps/web/AGENTS.md` is not created.
- The page: an `h1` "Loja" with the search bar under it, then `FeaturedProducts` and `ProductTypes`, unchanged but for the cards of the types, now with the large padding and a display-size title.
- `HeroSearch` is now `components/site/shop-search.tsx` (`ShopSearch`). The `search` slot of `Hero` was removed with its tests: nothing fills it.
- The strings moved from `home.featured` and `home.productTypes` to `shop.featured` and `shop.categories`; new: `shop.home.*`. The meta description is the client's short description of the site, which is about the shop.
- `/shop` is not in the sitemap and not linked from any page yet (T11). T8 decides when it is.
- The first block is as tall as any section, so at 1280 by 720 the product cards start below the fold. Two end-to-end tests scroll the carousel into view for that reason. Whether the top of the shop should be shorter is a design question for T11.
- Verified: `pnpm lint`, `pnpm typecheck`, `pnpm test` (786 tests, 63 files), `pnpm test:e2e` (626 passed, 2 skipped by design, 16 failed: 12 were the two tests above, fixed; 4 in WebKit, on pages this task did not touch, passed when their files were run again with the fixed ones, 196 passed).

### T9 (2026-10-13)

- The landing page is: hero, modular system (`#system`, on the subtle surface, an `h2` with the four parts as `h3`), "Porquê" ending with "Fala connosco", contact with the title "Pronto para arrumar a carrinha?".
- Deleted: the route `/modular-system` with its path constant, page title and description; `Buy` and `Complements` with their strings; `e2e/modular-system.spec.ts`, whose checks that still apply moved to `landing.spec.ts`.
- The navigation entry "Sistema modular", the hero's second action and the modular system card of the shop lead to `#system`. This differs from the amendment, which left that card without a destination: the section is where the system is presented.
- `Benefits` has an optional `action`. New string: `home.why.action`.
- The hero and the section after it have the same eyebrow, "Sistema modular LockMX". Left as it is; a text for the owner to change if it reads as a repetition.
- Verified: `pnpm lint`, `pnpm typecheck`, `pnpm test` (786 tests, 63 files), `pnpm test:e2e` (602 passed, 2 skipped by design).

### T11 (2026-10-13)

- The header has, at the right, the shop link (the primary button with the new `store` icon; its name is shown from `lg` up and is always in the link) and the cart (`IconButton` with `shopping-cart`), in `components/site/site-header-actions.tsx` (client, to mark the current page). The footer navigation ends with the shop link.
- **`IconButton` takes `href`** and is then a link with the same look, as `Card` does. A change to a design system component made without asking first, because the cart of the header is navigation and a button that navigates would be the wrong element; recorded in `docs/design/components.md`.
- **The header changes from menu button to links at `lg` (64rem), not at `md`.** With the shop, the cart and the language switcher beside the four links, the page scrolled sideways by 40 px at 768 px in Portuguese, and after tightening it "Sistema modular" still broke in two lines. Found by the end-to-end run and by eye. Spec 004 had the change at `md`.
- Below `lg` the language switcher of the header is the last item of the menu; from `lg` up it is in the bar. Both are in the HTML and one is shown at a time. On a narrow screen the menu button is the last thing in the bar but comes before the shop and the cart in the keyboard order, so that its links follow it.
- `/cart` is a page with the `h1` "Carrinho", the text "O teu carrinho está vazio." and a link to the shop, marked `noindex` and out of the sitemap. No cart id, cookie or request to Shopify.
- New strings: `navigation.shop`, `navigation.cart`, `shop.cart.*`.
- The shop is now linked from every page. T8 (the single switch that hides it) has to be done before a launch without the shop.
- Looked at by eye on screenshots of the header at 320, 768, 1024 and 1440 px, and of the cart.
- Verified: `pnpm lint`, `pnpm typecheck`, `pnpm test` (794 tests, 64 files), `pnpm test:e2e` (634 passed, 2 skipped by design).

### T12 (2026-10-13)

- `/modular-system` is back, with "Porquê LockMX" after the parts and its action leading to `/contact`; the strings of the benefits moved from `home.why` to `modularSystem.why`.
- `/contact`: `h1` "Contactos", one sentence, and `ContactChannels` with "E-mail" (`crew@lockmx.com`) and "Redes Sociais" (the Instagram handle, with the icon). Both pages are in the sitemap.
- The address the owner gave for Instagram carried a tracking parameter of the share link; it was left out. The address and the handle are in `lib/site/contact.ts`.
- **`instagram` joins the icon set** (34), drawn with the helper of Lucide, which ships no brand icons. Recorded in ADR 0010. It is the outline Lucide used to ship, not Meta's official asset: the page of Meta that was read does not give the rules for the glyph. Raised with the owner.
- The footer has the email and the Instagram icons under the logo (`IconButton` with `href`).
- The landing page was left as it was in this task, so every commit keeps the site whole; T14 recomposes it.
- The tests were written with the code, not before it.
- Verified: `pnpm lint`, `pnpm typecheck`, `pnpm test` (800 tests, 65 files), and the end-to-end files of the pages, the landing page, the shell and the sitemap in the four projects (426 passed, 2 skipped by design).

### T13 (2026-10-13)

- Sources read: the bundled `03-file-conventions/dynamic-routes.md` (`params` is a promise) and `page.md` (`searchParams` is a promise; reading it renders the page at request time).
- `/shop/[category]` for `racks`, `tyres` and `merchandise`; any other value is not found. The page is `server/shop/listing-page.tsx`, shared with `/shop` (T14).
- The sections of the shop are `shopSections` in `lib/shop/product.ts`; `server/shop/shop-listing.ts` answers with their entries and with the products of a listing. The example catalogue gained a section per product and three merchandise examples (nine in all; the carousel keeps its six).
- Filters (`ShopFilters`): the sections as links, and availability as checkboxes in a form sent with GET. `lib/shop/listing-filters.ts` reads the address and keeps only the values it knows; the server filters. Choosing nothing, or both, shows everything.
- `ProductGrid` and the carousel share `ProductSummaryCard`, taken out of `FeaturedProducts`. An empty result is said in a status region.
- A card leads to `/contact` until product pages exist.
- No sort control, no pagination, no filter button on a narrow screen: there the filters sit above the grid.
- English label of the racks section: "LockMX mounts". Working copy.
- Verified: `pnpm lint`, `pnpm typecheck`, `pnpm test` (830 tests, 69 files), and the end-to-end files of the shop in the four projects (259 passed; one carousel test failed once in Firefox and passed 16 times in a row when repeated).

### T14 (2026-10-13)

- The landing page is: hero, "Produtos / Destaques" with the carousel, and `ShopSections` with the large cards "Suportes LockMX" and "Pneus", each leading to its listing. The cards section has an `h2` "Loja" for assistive technology only.
- A large card is a dark surface with the mark of an image to come. No photograph is used; the client's replace the mark.
- The hero leads to `/shop` ("Ver a loja") and to `/modular-system`. `/shop` is the listing of every product.
- Navigation of the header and the footer: Início, Sistema modular, Merchandise (`/shop/merchandise`), Contactos; the footer also has Loja. At 1024 px the four entries, the shop button, the cart and PT/EN fit on one line (test and screenshot).
- Deleted: `ProductTypes`, the `Contact` section, `getProductTypes`, `sectionHref`, the section ids `system`, `why`, `contact` and `categories`, and the strings `home.contact`, `shop.categories`, `shop.productTypes` and `navigation.why`.
- The search bar is on the listings only, and still searches nothing (T7).
- Verified: `pnpm lint`, `pnpm typecheck`, `pnpm test` (823 tests, 68 files), `pnpm test:e2e` (884 tests: 880 passed, 2 skipped by design, 2 failed on the mobile project because the test counted the language links of the open menu; the test was corrected and its file passed in the four projects, 144 tests). After that a spacing fix in the filters was checked with lint, typecheck, the unit tests and the listing file in Chromium and on the mobile project (92 passed); the whole suite was not run again.
- Seen in Chromium, `/pt` only: the landing page and the contact page at 320 and 1440 px, the racks listing at 320, 1024 and 1440 px, the header at 1024 px. Not looked at: `/en`, 768 px, a real phone, a screen reader.

### After T14: official Instagram glyph and hover (2026-10-13)

- Asked by the owner after seeing the pages. The drawing of T12 is replaced by the path of Meta's own file, from the pack the owner downloaded (ADR 0010, second update of 2026-10-13). The rules for the glyph could not be read at the source; the ones secondary summaries give are followed.
- New size `xl` for `Icon` (2rem) and `IconButton` (3.5rem), used by the two icons of the footer and by the icons of `/contact`. Chosen by the owner over keeping 1.25rem.
- `ghost-inverse` no longer lightens its background on hover: the icon turns yellow, as the links of the inverse surface do. The cause was the variant fixing the text colour, which beat the rule of the links. This also changes the cart and menu buttons of the header and the close button of the toast. Chosen by the owner over a variant for the footer alone.
- Verified: `pnpm lint`, `pnpm typecheck`, `pnpm test` (829 tests, 68 files), and the end-to-end files of the contact page, the shell and the landing page in the four projects. Seen in Chromium, `/pt`: the footer at 320 and 1440 px, at rest and with the pointer on the Instagram icon, `/contact` at 1440 px, and the header with the pointer on the cart.

## Boundaries

- No new production dependency without asking: the client is `fetch`, the carousel is built on the platform (scroll snap) unless the design needs more and the owner approves a library.
- A new design system component, icon, token, photograph or factual text about a product or the company is asked first.
- Nothing here is deployed, pushed or opened as a pull request without an explicit request.
