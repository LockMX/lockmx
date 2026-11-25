# 005. Shop: connection to Shopify and shop-style home

- Status: in progress (2026-11-25): every task is done except T11, which waits for the supplier and Collective. Approved by the owner on 2026-10-11; changed with the owner on 2026-10-13 and 2026-11-18.
- Idea: `../ideas/project-brief.md`
- Decisions: `../decisions/0014-shopify-headless-commerce.md`, `../decisions/0016-search-rate-limit.md`, `../decisions/0013-e2e-test-runner.md`, `../decisions/0010-icons-lucide.md`

## Objective

Start the shop. The landing page is the home of the shop: the hero, a "Destaques" section with a carousel of featured products, and one large card per section of the shop. `/shop` lists every product and `/shop/<section>` the products of one section, with filters and a search bar that suggests sections and products. The header carries a shop button and the cart; `/modular-system` explains the system and `/contact` gives the email address and the social networks.

The products, prices, availability and sections are read from the Shopify store through one server module. Until the store is connected the same pages show example data, marked as such.

This is the first of the shop specs. Product pages, the cart, the checkout hand-over and customer accounts each come in a later spec; this one gives them the Shopify client and the product data shapes.

## Out of scope

- Product pages, cart lines, checkout, accounts, order emails. Later shop specs.
- Any write to Shopify. This spec only reads products, collections and the menu.
- A database of ours, an admin panel, webhooks.

## Sources

Read on 2026-10-11 unless another date is given. What the tasks read later is in their notes.

- Storefront API reference, https://shopify.dev/docs/api/storefront :
  - GraphQL only, POST to `https://{store_name}.myshopify.com/api/{version}/graphql.json`.
  - Private access is for servers: header `Shopify-Storefront-Private-Token`, plus `Shopify-Storefront-Buyer-IP` with the buyer's address on requests that come from buyer traffic; requests not tied to a buyer, such as a build, do not need it.
  - Public access (`X-Shopify-Storefront-Access-Token`) is for browsers, where the buyer can see the token. This spec does not use it.
  - Without a token, products, collections, search and the cart can be read, with a query complexity limit of 1,000; tags, metafields, menus and customers need a token.
  - No fixed limit of requests per minute for buyer traffic; automated traffic is limited; a request that looks malicious gets `430`.
  - `@inContext` takes a country (prices) and a language (translated content).
- Getting started with the Storefront API, https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started : the Headless channel creates a storefront with a public and a private token; permissions are set per storefront; at most 100 active storefronts and tokens per shop; private tokens can be rotated.
- API versioning, https://shopify.dev/docs/api/usage/versioning : a version every three months, each supported at least 12 months; a request to an unsupported version is answered by the oldest supported one, and the `X-Shopify-API-Version` response header says which. Latest stable on the day read: `2026-10`, accessible until 2027-10-16.
- `Product` object, https://shopify.dev/docs/api/storefront/latest/objects/Product : `id`, `handle`, `title`, `priceRange`, `compareAtPriceRange`, `availableForSale`, `productType` and `vendor` are non-null; `featuredImage` and `onlineStoreUrl` are nullable; `totalInventory` is nullable and needs a token; needs the `unauthenticated_read_product_listings` access.
- `Image` object, https://shopify.dev/docs/api/storefront/latest/objects/Image : `url` is `URL!` and takes a `transform` argument; `altText`, `width`, `height`, `id` and `thumbhash` are nullable (`width` and `height` are null when the image is not hosted by Shopify); `src`, `originalSrc` and `transformedSrc` are deprecated.
- `MoneyV2` object, https://shopify.dev/docs/api/storefront/latest/objects/MoneyV2 , and `Decimal` scalar, https://shopify.dev/docs/api/storefront/latest/scalars/Decimal : `amount` is `Decimal!`, "a signed decimal number, which supports arbitrary precision and is serialized as a string" (examples `"29.99"`, `"29.999"`); `currencyCode` is `CurrencyCode!`.
- `ProductPriceRange` object, https://shopify.dev/docs/api/storefront/latest/objects/ProductPriceRange : `minVariantPrice` and `maxVariantPrice`, both `MoneyV2!`.
- `collection` query, https://shopify.dev/docs/api/storefront/latest/queries/collection : takes `handle` or `id`, returns a nullable `Collection`; `Collection.products` takes `first`, `after`, `sortKey` (default `COLLECTION_DEFAULT`), `reverse` and `filters`.
- `predictiveSearch` query, https://shopify.dev/docs/api/storefront/latest/queries/predictiveSearch : suggestions as the visitor types, for products, collections, pages and articles; `limit` from 1 to 10.
- Languages, https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/markets/multiple-languages : `@inContext(language: ...)` returns translated titles and descriptions; the available languages come from the `localization` object and are set in the shop's Markets settings.
- Cart guide, https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage : read only to bound this spec; the cart is a later spec.
- Carousel pattern, https://www.w3.org/WAI/ARIA/apg/patterns/carousel/ : the container is a `region` or `group` with `aria-roledescription="carousel"` and a label without the word "carousel"; each slide is a `group` with `aria-roledescription="slide"`; a rotation control, a native button whose label says what it does, is the first element in the tab sequence of the carousel; rotation stops when anything in the carousel has the keyboard focus or the pointer over it, and does not resume until the visitor activates the control; the slides wrapper has `aria-live="off"` while rotating and `polite` when not.
- WCAG 2.1, 2.2.2 Pause, Stop, Hide (level A), https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html : content that starts moving by itself, lasts more than five seconds and is shown beside other content needs a way to pause, stop or hide it.
- The organization of the shop follows the reference the client gave on 2026-10-13, https://teammxag57.com (a Shopify store): a hero, a carousel of products, rows of large cards leading to collections; collection pages with filters at the left and a grid of small cards; a contact page with the email and the social networks. It is the reference for the organization, not for content: no text, product, price or image comes from it.

## Decisions taken with the owner

1. **The landing page is the home of the shop** (2026-10-13; every section since 2026-11-24): hero; "Produtos / Destaques" with the carousel; then one large card per section of the shop, each with the section's image. No "Catálogo / Categorias" heading. The hero leads to `/shop` ("Ver a loja") and to `/modular-system` ("Conhece o sistema").
2. **A large card opens the shop on that section** (2026-10-13): filters at the left, products at the right, in small cards like the ones of "Destaques".
3. **The sections come from the store, not from the code** (2026-11-18). A menu of the store with the handle `shop` (Content > Menus) lists the sections, in the client's order. Each top-level item that links to a collection is a section: its address is `/shop/<collection handle>`, its name is the collection's title in the page's language (`@inContext`; menu item titles are not among Shopify's translatable resources, collection titles are), its image the collection's image. A section added, renamed, reordered or removed in the admin changes the site with no code change. Only `featured` ("Destaques") is a fixed handle. `/shop` lists every product published to the channel. Nested menu items (subsections) are not read (open point 3).
4. **Supplier products are sorted by automated collections in the client's store** (2026-11-18). Shopify Collective imports a supplier's products with their title, description, media, variants, vendor, category and product type, but "Collections, tags, metafields, and discount codes aren't imported from a supplier's store". So each section is a collection whose conditions match the products (for supplier products, "Product type is equal to ..." or "Vendor is equal to ...", kept in sync by Collective), and new or retyped products move by themselves. Creating a collection for a new section and adding it to the `shop` menu is admin work done once per section, not code. What cannot be automatic: a supplier reorganising its own collections without changing its product types.
5. **Example data only while the store is not connected** (2026-10-11 and 2026-11-18): example products with name, price and a neutral image, each card with a visible "Exemplo" mark, shown only when the Shopify variables are not set (development, CI, the "coming soon" deployment). Once they are set, the site never shows example data, also when Shopify fails (empty state instead). The launch checklist requires the variables.
6. **No switch to hide the shop** (2026-11-18). The shop is the landing page: the launch is with the whole shop, not the landing page alone.
7. **The product cards lead to `/contact`** until the product pages spec, which comes right after this one. The content of those pages (name, description, photographs, variants, price, stock) is the store's; the layout is the site's.
8. **Carousel** (2026-10-11 and 2026-10-12): automatic, with a pause control, designed in the Claude Design project first. Against the rules of the project: the icons `pause`, `play` and `package-open` join the closed set; the buttons are the existing `IconButton`, not a style of their own; the position marker is straight, so the slant stays with the badge of the cards.
9. **Header** (2026-10-13): a shop button in the primary style and the cart, both to the left of the language switcher. On a narrow screen the shop button becomes a `store` icon and the language switcher moves into the menu.
10. **The cart** is its header entry and an empty state until the cart spec; it keeps no lines, prices or totals of its own.
11. **Navigation** (2026-10-13): Início, Sistema modular, Merchandise, Contactos. "Merchandise" opens `/shop/merchandise`, a fixed handle the owner creates in the store (a shortcut the client asked for). The footer also links to the shop.
12. **Footer** (2026-10-13): the email and the Instagram icons under the logo.
13. **`/modular-system`** (2026-10-13) explains the system and holds "Porquê LockMX" too; its closing action leads to `/contact`.
14. **`/contact`** (2026-10-13) is a simple page, reached from the header and the footer: a subsection "E-mail" with the address, and a subsection "Redes Sociais" with the Instagram icon leading to the LockMX page.
15. **Addresses** stay in English and equal in both locales (spec 002). Handles of sections are in English; product handles may stay in Portuguese (owner, 2026-11-24).

## Product data rules

The shapes of T1 follow what the Storefront API returns (see "Sources"), so reading from Shopify is a mapping and no component changes.

1. **Money.** Shopify gives a decimal string and a currency code. The DTO keeps whole minor units (`amountCents`) and a required `currencyCode`, which is what `Price` takes. The string is converted without passing through a floating-point number; an amount with more decimal places than the currency has is rejected, not rounded, and the product is left out. The frontend never adds, multiplies or discounts.
2. **One price per card.** `price` is `priceRange.minVariantPrice`. `priceVaries` says the maximum differs, so a card can say "from" ("Desde"); whether it is shown is decided with the product pages (T3 notes).
3. **Compare-at price** is optional in the DTO, and left out unless it is greater than the price (T9 notes).
4. **Image** is optional (`featuredImage` is nullable): `url`, and optional `altText`, `width` and `height`. `ProductCard` fills its box, so it does not need the dimensions.
5. **Stock.** Only `availableForSale` is carried. `ProductCard` also has a "low" state; it needs an inventory count (token only) and a threshold nobody decided, so it is not used until the owner sets one.
6. **Product type.** `productType` is free text written by the merchant: it is shown, never used as a key.
7. **Identity.** `id` is Shopify's global id (an opaque string) and `handle` is what a product address will use.
8. **Locale.** Amounts are written for `htmlLang[locale]` (`pt-PT`, `en`), not the route segment.

## Open points

1. **The supplier and Collective** (T11): country, currency, Shopify Payments, and whether they accept to join Collective as a supplier. If they cannot, their products are created as LockMX products (`../integrations/shopify-setup.md`, "Supplier products").
2. **How many products** the supplier's catalogue has: from about 250 products a listing needs pagination, and the filters may need product type and brand.
3. **Sections for supplier products:** which sections the client wants, and whether subsections (nested menu items) are needed; the supplier's product types decide whether automated collections can sort them (question 6 in `../integrations/shopify-setup.md`).
4. **Filters** beyond section and availability, with the real catalogue.

## Still open

- **T11 waits for the supplier** (open point 1): Shopify Payments is active in the client's store (owner, 2026-11-25), the owner is talking to the supplier. The site has no cart yet (decision 7), so the "one real order" needs a checkout address made outside the site, for example a cart created once from the developer's machine, which needs a Storefront permission to write carts that the storefront does not have now (read-only by design). To decide with the owner when T11 starts; otherwise the order waits for the cart spec.
- After this spec: the product pages spec (decision 7), then the cart and checkout hand-over.
- **The shop joins the sitemap with the product pages spec** (owner, 2026-11-25): `/shop`, its sections and the product pages, read from the store. It was left out while it could show example products; at launch the store is connected and shows only its own products (decision 5), so that reason no longer holds. The details are settled in that spec.
- **What the product pages spec starts from** (gathered 2026-11-25): it begins with an idea in `../ideas/`, as `../README.md` sets out.
  - The page's content is the store's (name, description, photographs, variants, price, stock), the layout the site's (decision 7). Prices only as Shopify returns them, per variant.
  - What changes when it exists: the product cards stop leading to `/contact` (decision 7, `ProductSummaryCard`), and a product suggestion of the search bar stops leading to `/shop?q=<title>` (T10 notes).
  - Decided there: whether a card says "Desde" for a product whose price varies (`priceVaries`, carried and unused, T3 notes).
  - Addresses: the structure in English, product handles may stay in Portuguese (decision 15). Collection handles come back translated under `EN` when the translation app translates them (T8 notes); whether product handles do too is not checked.
  - The sitemap: `/shop`, its sections and the product pages (above). The end-to-end test that keeps `/shop` out of it (`e2e/shop-listing.spec.ts`) changes then.
  - Still open from this spec: pagination past 250 products (open point 2); whether supplier products come back like the store's own (T11).
  - Out of it: the cart and the checkout hand-over, the spec after. Writing a cart needs a Storefront permission the storefront does not have (read-only by design).

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

### T1. Shop product shapes and example data
- Description: define the data the shop renders and one module that supplies it. `lib/shop/product.ts` holds the DTO types: a product summary (id, handle, title, image with its alternative text and dimensions, price and compare-at price as amount and currency, availability, product type). `server/shop/example-catalogue.ts` holds example data, every item flagged as an example.
- Acceptance criteria: the page can ask for products without knowing where they come from; every example item is flagged; the types say what is optional (image, compare-at price).
- Tests: unit tests for the shape of the example data in both locales and for the flag.
- Commit: `feat: add shop product shapes and example data`
- Notes (2026-10-11):
  - `lib/shop/product.ts` has the types (`Money`, `ProductImage`, `ProductSummary`), written to "Product data rules". `server/shop/example-catalogue.ts` has example products, translated in the module, covering a reduced price, a price that varies, a product not for sale and no image (none has one, so the cards show the neutral placeholder). The example titles are in the module: they stand in for text that comes from Shopify, already translated.

### T2. Carousel component
- Description: build `components/ui/surfaces/carousel.tsx` to the carousel designed in the Claude Design project, following the APG carousel pattern and WCAG 2.2.2 as cited in "Sources". Automatic rotation with a pause and play button that comes first in the tab order; rotation stops on keyboard focus inside and on pointer hover, and under reduced motion it does not start; previous and next buttons; swipe and scroll on touch; the slides wrapper is `aria-live="off"` while rotating and `polite` when stopped. Every label comes through props. `docs/design/components.md` gets the component.
- Acceptance criteria: operable with keyboard, pointer and touch; never moves for a visitor who asked for reduced motion; no slide that is off screen is reachable with Tab; no sideways scroll of the page at 320 px.
- Tests: unit tests for roles, labels, the rotation control, stop on focus and hover, previous and next, reduced motion (with a fake timer); written first.
- Commit: `feat: add carousel component`
- Notes (2026-10-12):
  - The design (read on 2026-10-11 from `components/carousel/` of the Claude Design project, read-only) shows one to four cards per view from 0, 704, 960 and 1216 px of the carousel's width, moves a whole page every 6 s and loops. Where it differed from the project's rules:

    | Design | Rule | Built |
    |---|---|---|
    | Icons `pause`, `play`, `package-open` | Not in the closed set; a new icon is asked first | Added (decision 8) |
    | Its own button, `CarouselButton` | `IconButton` exists | `IconButton` (decision 8) |
    | Skewed position marker, and the slant badge of each `ProductCard` | The slant at most once | Straight marker (decision 8) |
    | Rotation resumes when the focus or the pointer leaves | APG: after keyboard focus it does not resume until the visitor activates the control | Follows the APG |
    | Cards per view measured with `ResizeObserver` | The server renders before any measure, so the row would jump after hydration | Slides sized in CSS (container queries) |
    | A track moved with `transform` | Scroll snap unless the design needs more | Scroll snap |
    | Fixed Portuguese strings, inline styles | Every string through props; tokens through Tailwind classes | Props and semantic tokens |

  - **Scroll snap, not a moved track.** The design moves a track with `transform`, which needs a computed inline style, and the design system accepts none. The row is a scroll container with snap points at the start of each page; the buttons and the rotation call `scrollTo`, and the page shown is read back from the scroll. Touch needs no code of ours. The slide uses the browser's smooth scroll, so its duration is the browser's and not `--duration-slow`.
  - **Slides per view in CSS**, by container queries at 44, 60 and 76 rem (the design's 704, 960 and 1216 px). The script only reads how many fit, to count pages and to make the slides out of view `inert`; it does that after the first measure, so a page without script keeps every slide reachable.
  - **Position bar:** one segment per page, the current one dark, instead of a marker that slides: a marker needs a computed position.
  - **Buttons** are 48 px at every width (`IconButton` `lg`). The design has 40 px from 704 px; a size per width would mean a class that repeats one the button sets, which the design system forbids.
  - **Follows the APG where the design differs:** keyboard focus coming in stops the rotation and only the control restarts it. A click is not keyboard focus (`:focus-visible`), so it does not stop it.
  - **Left out of the design's props:** `loop` (it always wraps), `defaultPage`, `showIndicator`, `controlsPlacement`, `surface` (the section owns the background), the reduced motion override and `onPageChange`. Nothing uses them.
  - Known limit: a second press on next while the first slide is still moving asks for the same page again.

### T3. Featured products section
- Description: `components/site/sections/featured-products.tsx`: a named region ("Destaques") right after the hero, with the carousel of `ProductCard`s. A card of an example product shows the "Exemplo" mark (a `Badge`). With no products the section is not rendered.
- Acceptance criteria: the section follows the hero in both locales; every example card carries the mark; prices are formatted by `Price`; the heading order of the page skips no level.
- Tests: unit tests for the section (heading, one card per product, the mark, nothing with an empty list); end-to-end for its place in the page and the carousel controls, in both locales and on the mobile project.
- Commit: `feat: add featured products section`
- Notes (2026-10-12):
  - The section is on the subtle surface, with the section id `featured`. The page passes the products, the labels and where a card leads (decision 7).
  - The "Exemplo" mark is a `Badge` over the card, at the top right, on every product flagged as an example; it lets the pointer through, since the card is one link.
  - Stock is "Em stock" or "Esgotado" from `availableForSale` (product data rule 5).
  - **"Desde" is not shown** for a product whose price varies: `ProductCard` has no place for it. `priceVaries` is carried and unused; the label is decided with the product pages, before real products with variants are shown.
  - The controls sit on their own line under the heading of the section, at the right, and not on the heading's line as drawn: the heading belongs to `Section`.
  - On a short viewport (1280 by 720) the carousel can start below the fold, so the end-to-end tests of its controls scroll it into view first.

### T4. Shop and cart in the header and the footer
- Description: the header gets the shop button and the cart (decision 9); the footer gets a shop link. The cart leads to `/cart`, a page with the empty state and a link to the shop (decision 10). No cart id, cookie or request to Shopify in this task.
- Acceptance criteria: both entries reachable by keyboard and named for assistive technology; the header does not overflow at 320 px; the current page is marked in the navigation.
- Tests: unit tests for the header and footer; end-to-end for the links, at the mobile and desktop widths.
- Commit: `feat: add shop and cart entries to the header`
- Notes (2026-10-13):
  - The header has, at the right, the shop link (the primary button with the `store` icon; its name is shown from `lg` up and is always in the link) and the cart (`IconButton` with `shopping-cart`), in `components/site/site-header-actions.tsx` (client, to mark the current page). The footer navigation ends with the shop link.
  - **`IconButton` takes `href`** and is then a link with the same look, as `Card` does: the cart of the header is navigation, and a button that navigates would be the wrong element. Recorded in `docs/design/components.md`.
  - **The header changes from menu button to links at `lg` (64rem), not at `md`.** With the shop, the cart and the language switcher beside the links, the page scrolled sideways at 768 px in Portuguese. Spec 004 had the change at `md`.
  - Below `lg` the language switcher of the header is the last item of the menu; from `lg` up it is in the bar. Both are in the HTML and one is shown at a time. On a narrow screen the menu button is the last thing in the bar but comes before the shop and the cart in the keyboard order, so that its links follow it.
  - `/cart` is a page with the `h1` "Carrinho", the text "O teu carrinho está vazio." and a link to the shop, marked `noindex` and out of the sitemap.

### T5. Modular system page and contact page
- Description: `/modular-system` as decision 13, with `Benefits` after the parts and its action leading to `/contact`. `/contact` as decision 14, with the email as a `mailto:` link.
- Acceptance criteria: both pages in both locales, each with one `h1`, its own title and canonical address, in the sitemap; no sideways scroll at 320 px.
- Tests: unit tests for the sections and paths; end-to-end for the content and the head of both pages.
- Commit: `feat: add modular system and contact pages`
- Notes (2026-10-13):
  - `/contact`: `h1` "Contactos", one sentence, and `ContactChannels` with "E-mail" (`crew@lockmx.com`) and "Redes Sociais" (the Instagram handle, with the icon). The address and the handle are in `lib/site/contact.ts`; the tracking parameter of the share link the owner gave was left out.
  - **`instagram` joins the icon set**, outside Lucide, which ships no brand icons. Recorded in ADR 0010. After the owner saw the pages, the drawing was replaced by the path of Meta's own file (ADR 0010, second update of 2026-10-13); the rules for the glyph could not be read at the source, and the ones secondary summaries give are followed.
  - New size `xl` for `Icon` (2rem) and `IconButton` (3.5rem), used by the two icons of the footer and by the icons of `/contact`. Chosen by the owner.
  - `ghost-inverse` no longer lightens its background on hover: the icon turns yellow, as the links of the inverse surface do. The cause was the variant fixing the text colour, which beat the rule of the links. This also changes the cart and menu buttons of the header and the close button of the toast. Chosen by the owner over a variant for the footer alone.

### T6. Shop listing
- Description: `/shop` and `/shop/[category]` render one listing: the name of the section as `h1`, the search bar, the filters and the grid of product cards from `server/shop/`. An unknown section answers not found.
- Acceptance criteria: each section shows only its products; the availability filter narrows the grid and survives a reload; every example card carries "Exemplo"; an empty result says so; the filters are usable with the keyboard and at 320 px; the browser decides nothing (the server reads the address and filters).
- Tests: unit tests for the filtering and the example data; end-to-end for the sections, the filter and the unknown address.
- Commit: `feat: add shop listing with filters`
- Notes (2026-10-13):
  - Sources read: the bundled `03-file-conventions/route-groups.md`, `dynamic-routes.md` (`params` is a promise) and `page.md` (`searchParams` is a promise; reading it renders the page at request time).
  - **The shop is in the `(marketing)` route group**, which holds the shell: a `(shop)` group would need a second copy of the layout.
  - The page is `server/shop/listing-page.tsx`, shared by `/shop` and `/shop/[category]`; `server/shop/shop-listing.ts` answers with the sections and with the products of a listing.
  - **Filters** (`ShopFilters`): the sections as links, and availability as checkboxes in a form sent with GET, so they work without script. `lib/shop/listing-filters.ts` reads the address and keeps only the values it knows; the server filters. Choosing nothing, or both, shows everything. A filter is only real when the catalogue has the data behind it, so brand, size and price wait for it (open point 4).
  - `ProductGrid` and the carousel share `ProductSummaryCard`. An empty result is said in a status region.
  - No sort control and no pagination until the number of products asks for them; no filter button on a narrow screen: there the filters sit above the grid.

### T7. Landing page as the shop home, navigation and footer
- Description: the landing page as decision 1, with the large cards leading to the listings; the navigation of decision 11; the footer of decision 12; "Sistema modular" and "Contactos" marked as the current page on their pages.
- Acceptance criteria: the order of decision 1 in both locales; one `h1`; the header without sideways scroll and without a wrapped entry at 320, 768, 1024 and 1440 px; every link of the header and the footer leads to a page that exists.
- Tests: unit tests for the cards, the header and the footer; end-to-end for the landing page, the navigation and the widths.
- Commit: `feat: make the landing page the shop home`
- Notes (2026-10-13):
  - `ShopSections` shows the large cards. The cards section has an `h2` "Loja" for assistive technology only, so the page has no gap between the `h1` and the card titles.
  - A large card is a site component, not a change to `Card`: a link with the title over a dark surface. No stock or placeholder photograph is published (spec 004); the image comes from the store (T9 notes).
  - At 1024 px the four navigation entries, the shop button, the cart and PT/EN fit on one line (test and screenshot).

### T8. Shopify Storefront API client
- Description: `server/shopify/config.ts` reads and validates the store domain and the private token. `server/shopify/client.ts` exports one function that posts a GraphQL document to the versioned endpoint with the private token header, takes `fetch` as a parameter, returns typed data or a typed error (network, HTTP status, GraphQL errors), and reports when the `X-Shopify-API-Version` response header differs from the pinned version. It never logs the token or a full request. `.env.example` gets the names without values. It needs no store: every test uses a `fetch` double.
- Acceptance criteria: a missing or malformed variable gives a clear error that names the variable and not its value; no secret in any log line; the client is the only module that knows the endpoint and the headers.
- Tests: unit tests with a `fetch` double for the request (address, headers, body), each error kind and the version warning; a test that the error text never contains the token.
- Commit: `feat: add shopify storefront client`
- Notes (2026-11-24):
  - The variables are `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_PRIVATE_ACCESS_TOKEN`. The API version is a constant in `config.ts` (`2026-10`), not a variable: the queries are written and tested against it, so a new version is a reviewed change; the client warns when Shopify answers with another one.
  - Neither variable set gives `null` (not connected, decision 5); one without the other, a malformed domain or a token with spaces fails with a message naming the variable, never its value. The variables are read when called, so `next build` and CI need none.
  - The client posts to `https://<domain>/api/<version>/graphql.json` with `Shopify-Storefront-Private-Token`, a 10 s timeout, and returns data or `network`, `http`, `graphql` (also when partial data comes with errors) or `invalid-response`. No buyer IP header: these reads are for cached pages.
  - Vitest maps `server-only` to an empty module (`src/test/server-only.ts`); Next.js resolves it itself.
  - Checked against the store on 2026-11-24 with a read-only query from the owner's machine: version 2026-10, languages `EN` and `PT_PT`, the `shop` menu, a collection with image, two products. `@inContext` goes on the operation (`query Name @inContext(language: EN)`), not on a field; **the collection handle is translated** (`modular-supports` in English) when the translation app translates it, so the section address differs per locale unless the English handle is left equal; menu item titles come back untranslated, as expected (decision 3 uses the collection title).

### T9. Listings and featured products from Shopify
- Description: `server/shopify/catalogue.ts` reads, with `@inContext(language)` for the locale: the sections from the `shop` menu and their collections' titles and images (decision 3), the products of a section's collection by handle, every product of the channel for `/shop`, and the `featured` collection. It maps each product to `ProductSummary` following the product data rules. `server/shop/home-catalogue.ts` and `server/shop/shop-listing.ts` use it when the Shopify variables are set and the example data otherwise (decision 5); the pages do not change. A failed or empty read shows the listing's empty state or hides "Destaques", never a broken page.
- Acceptance criteria: with the variables set, the landing page and the listings show the store's products in the page's language with Shopify's prices and availability; without them, the example data, still marked; a Shopify failure leaves every page working; the frontend computes no price.
- Tests: unit tests for the mapping from recorded response shapes (both locales, a product without image, a compare-at price equal to the price, an amount with too many decimals), for the choice between Shopify and example data, and for the failure path. The check against the real store is manual and recorded with its date.
- Commit: `feat: read the shop listings from shopify`
- Notes (2026-11-24):
  - Read at the source: `@inContext(language:, country:)` with variables on the operation; `PT_PT` and `EN` for the two locales, country `PT`. `first` cannot exceed 250 (the store answered "first cannot exceed 250" on 2026-11-24), so a listing reads one page of up to 250 products; pagination waits for a catalogue that needs it (open point 2). A missing translation comes back in the default language. Shopify returns a compare-at price of `"0.0"` when there is none.
  - Mapping: the compare-at price is shown only when it is greater than the price **and** every variant costs the same, because the lowest price and the lowest compare-at price can belong to different variants. Amounts become whole cents from the decimal string (trailing zeros accepted, extra significant decimals rejected and the product left out).
  - Sections come from the menu items that link to a collection, in the menu's order; other items are skipped. The section's title and image are the collection's, translated. A handle that is not a section of the current source is not found (404); a section whose read fails shows the empty listing.
  - Caching: the client asks for `cache: "force-cache"` with `revalidate: 300` (a POST is cached only when asked; only 200 answers are stored), and the sections and product reads are wrapped in `React.cache`, once per request.
  - Images: `images.remotePatterns` allows `https://cdn.shopify.com/s/files/**`, not pinned to this store (Collective images unverified, T11) and with any search, since Shopify addresses carry `?v=`. The large section card shows the collection's image under the `surface-backdrop` token, decorative (`alt=""`).
  - Example data: the end-to-end server sets the two Shopify variables to empty, which wins over a developer's `.env.local` (Next.js reads `process.env` first) and means "not connected", so `pnpm test:e2e` runs on example data as in CI.

### T10. Search suggestions
- Description: give the search bar of the listings its behaviour. A Route Handler takes the text, validates it on the server (length, characters), asks Shopify and returns suggestion DTOs; the token stays on the server. Its rate limit is ADR 0016: it is the first endpoint of ours a visitor can call repeatedly.
- Acceptance criteria: input is validated on the server; nothing from the browser is trusted beyond the search text; an empty or failed search shows the bar's empty state.
- Tests: unit tests for validation and mapping; end-to-end with example suggestions.
- Commit: `feat: add search suggestions`
- Notes (2026-11-24):
  - Owner's decisions in the task: the rate limit is a rule of the Vercel firewall on `/api/search`, 100 requests per minute per IP (ADR 0016); a plain search, and a product suggestion, lead to `/shop?q=<text>`, the listing of the whole shop narrowed to the search, until the product pages exist; a section suggestion leads to its listing.
  - Layers: `lib/shop/search.ts` (what a search is: 2 to 100 characters, spaces collapsed, control characters removed; the `ShopSuggestion` shape; the example matching), `server/shopify/search.ts` (the `predictiveSearch` and `search` queries), `server/shop/search-suggestions.ts` (validation first, then the store or the examples, failure gives nothing), `app/api/search/route.ts` (reads `q` and `lang`, 400 for a language the site does not have), `components/site/use-shop-suggestions.ts` and `shop-search.tsx` (the browser side).
  - A Route Handler and not a Server Action: a search is a read, and the firewall rule needs a fixed path (a Server Action posts to the page's address). Route Handlers are not cached (bundled `01-getting-started/15-route-handlers.md`); the Shopify reads behind it are, for 5 minutes, by what is sent. The text is sent in lower case so that case variants share an entry: the store ignores case (checked: `CABID`, `Cabid`, `SUPORTE`).
  - Read at the source (2026-11-24): `predictiveSearch` takes `limit` from 1 to 10 per type and returns products, collections, queries, pages and articles; `search` returns up to 1,000 results, `first` at most 250, products match partial words. Neither page says whether `@inContext` translates the answer; the store answered in English under `EN`. Both tolerate a typing error (`supotre` found the supports) and match any word (`botas suporte` found both products), so the search bar shows the server's suggestions as given: `SearchBar` gained `filter={false}` for that, and `pending`, so "no suggestions" is not announced before the answer arrives.
  - A product suggestion leads to `/shop?q=<the product's title>`, which is interim, until the product pages exist. The store's search matches any word, so the listing can show other products too. A title that is not a valid search (over 100 characters) gives the text typed instead.
  - The field asks for suggestions only after the visitor changes it: a search listing opens with the text in the field and sends no request.
  - Collections outside the `shop` menu (`featured`, and `merchandise` until it is added to the menu) are found by `predictiveSearch` but have no listing: they are left out.
  - The browser waits 250 ms after the last key, cancels the request before, drops an answer to a text no longer in the field, keeps the last list until the next answer, and treats a 429, a failure or an answer of another shape as no suggestion. A suggestion whose address is not of this site is dropped.
  - The listing reads `q` like `availability`, as untrusted input; a section listing ignores it. The filters form keeps it in a hidden field; "Clear filters" clears it too. An empty result says "Nenhum produto corresponde à pesquisa."
  - Checked against the store on 2026-11-24 (build with the real variables, `next start`): `supotre` under `EN` gives the section and the two products, `dest` and `merch` give nothing, one character gives nothing, an unknown language gives 400; `/pt/shop?q=cabide` lists the hanger only.

### T11. Supplier products through Collective
- Description: no code unless the check finds a difference. When the client's store and the supplier's store are connected through Collective and some supplier products are imported and published to the Headless channel: read them through the client of T8 and T9, and record in the task notes whether they come back like the client's own products (fields, prices, availability, images, translations). Then one real order of a supplier product through the checkout, recorded with its date. Any difference found becomes a task here.
- Acceptance criteria: the two checks are recorded; ADR 0014 "Not yet verified" is updated.
- Tests: unit tests only if a mapping changes.
- Commit: only if code or docs change (`docs: record the collective check`).

### T12. Architecture, checklist and status
- Description: update `docs/architecture.md` (`server/shopify/`, `server/shop/`, `lib/shop/`), write `docs/checklists/04-shop-home.md` from what was done, and set this spec to `done`, or to `in progress` naming what waits for the client or the supplier.
- Commit: `docs: add shop home checklist`
- Notes (2026-11-25): the spec is `in progress`: T11 waits for the supplier (open point 1). The checklist and ADR 0014 are updated when T11 is done.

## Boundaries

- No new production dependency without asking: the client is `fetch`, the carousel is built on the platform (scroll snap).
- A new design system component, icon, token, photograph or factual text about a product or the company is asked first.
- Nothing here is deployed, pushed or opened as a pull request without an explicit request.
