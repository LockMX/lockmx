# Checklist: shop home connected to Shopify

Repeats what spec 005 (`../specs/005-shop-home.md`) built: the shop product shapes and example data, the carousel of featured products, the shop listings with their filters, the connection to a Shopify store through the Storefront API (sections, listings, featured products) and the search suggestions with their rate limit. Decisions: `../decisions/0014-shopify-headless-commerce.md`, `../decisions/0016-search-rate-limit.md`. How the store itself is set up: `../integrations/shopify-setup.md`.

**Not finished:** T18 of the spec waits for the supplier. Whether products imported through Shopify Collective come back like the store's own products, and one real order of such a product, are not checked. Step 6 does not pin the image host to the store for that reason.

All paths are inside `apps/web/` unless they start with `docs/` or `.github/`.

## Prerequisites

- The technical foundation, internationalization, the design system and the public site shell (`00-foundation.md` to `03-public-site.md`).
- A Shopify store with:
  - EUR, the default language PT-PT and English published and added to the market the store sells in. Without that, the API offers only `PT_PT` and every answer under `EN` is in Portuguese.
  - The Headless sales channel and a storefront with the Storefront API permissions `unauthenticated_read_product_listings` (products and collections), `unauthenticated_read_product_inventory` (stock) and `unauthenticated_read_content` (the menu), nothing more, and its **private** access token, not the public one. The token and the domain `<name>.myshopify.com` are handed over outside the repository.
  - A collection per section of the shop, with an English handle (`modular-supports`), not the default `frontpage` collection renamed. Supplier products are sorted into them by automated conditions (product type or vendor), since Collective does not import collections.
  - A collection with the handle exactly `featured`: the products of the carousel.
  - A menu with the handle `shop` (Content > Menus) whose top-level items link to the section collections, in the order the shop shows them.
  - Products published to the Headless channel, with photographs and titles in both languages.
- A hosting provider with a firewall that can rate-limit one path (ADR 0016: Vercel).

## Steps

1. **Shapes.** `src/lib/shop/product.ts`: `Money` (whole minor units and an ISO 4217 code), `ProductImage`, `ProductSummary` (only what a card shows, with `isExample`), `ShopSectionEntry`, the availability values `in` and `out`. No server dependency, so the browser can import it.
2. **Example data.** `src/server/shop/example-catalogue.ts`: products translated in the module, covering a reduced price, a price that varies, a product not for sale, no image, and a few per example section. Every example has `isExample: true`, which the card shows as an "Exemplo" badge.
3. **Carousel and sections.** `src/components/ui/surfaces/carousel.tsx` (scroll snap, slides per view by container queries, a pause control first, APG behaviour on keyboard focus); `src/components/site/sections/featured-products.tsx` hides itself without products; `src/components/site/sections/shop-sections.tsx`, one large card per section. Every string through props from the dictionaries. Tests: `e2e/shop-home.spec.ts`.
4. **Listings.** `src/app/[lang]/(marketing)/shop/page.tsx` and `shop/[category]/page.tsx` render `src/server/shop/listing-page.tsx`. Filters travel in the address (`src/lib/shop/listing-filters.ts`, form sent with GET, unknown values ignored) and the server filters. `ProductGrid` shows an empty result in a status region. Tests: `e2e/shop-listing.spec.ts`.
5. **Store connection.** `.env.example` gets `SHOPIFY_STORE_DOMAIN=` and `SHOPIFY_PRIVATE_ACCESS_TOKEN=`; the real values go in `.env.local` and the hosting environment only, never in a `NEXT_PUBLIC_*` variable. `src/server/shopify/config.ts` is the only reader: both unset gives `null` (not connected), one without the other, a domain that is not `<name>.myshopify.com` or a token with spaces throws a message naming the variable, never its value. Read at request time, so a build needs neither. The API version is the constant `SHOPIFY_API_VERSION`, the latest stable version on the day (https://shopify.dev/docs/api/usage/versioning), changed only with the queries reviewed.
6. **Client.** `src/server/shopify/client.ts`: `storefrontQuery(config, request, fetchFn = fetch)` posts to `https://<domain>/api/<version>/graphql.json` with the header `Shopify-Storefront-Private-Token`, a 10 s timeout, `cache: "force-cache"` and `next: { revalidate: REVALIDATE_SECONDS }` (300). It returns the data or a typed error (`network`, `http`, `graphql`, also for partial data with errors, `invalid-response`) and warns when Shopify answers with another version. Every module of `src/server/shopify/` imports `server-only`; `vitest.config.mts` aliases it to `src/test/server-only.ts`. Tests pass a `fetch` double, never the network.
7. **Money.** `src/server/shopify/money.ts`: `parseMoney` turns the decimal string into minor units by its digits, never through a float; trailing zeros are accepted, more significant decimals than the currency has are rejected and the product is left out.
8. **Catalogue.** `src/server/shopify/catalogue.ts`: every query carries `@inContext(language: $language, country: $country)` on the operation, with `PT_PT` or `EN` by locale and country `PT`. `readSections` reads the menu `SECTIONS_MENU` (`shop`) and keeps the top-level items that link to a collection, with the collection's title and image. `readCollectionProducts` and `readAllProducts` read one page of `PAGE_SIZE` (250) products. `toProductSummary` keeps a compare-at price only when it is greater than the price and every variant costs the same. A failed read gives `null` and logs the kind of error only.
9. **Source choice.** `src/server/shop/shop-listing.ts` (`getShopSections`, wrapped in `React.cache`, `findShopSection`, `getShopProducts`) and `src/server/shop/home-catalogue.ts` (`getFeaturedProducts`, the collection `FEATURED_COLLECTION`) read the store when `getShopifyConfig()` gives a config and the examples only when it gives `null`. A connected store that fails gives an empty listing or hides "Destaques", never examples. A handle that is not a section gives not found. Tests: `server/shop/connected-store.test.ts` and the tests beside each module.
10. **Images.** `next.config.ts`: `images.remotePatterns` with `https://cdn.shopify.com/s/files/**` and no `search`, since Shopify's addresses carry `?v=`.
11. **Search.** `src/lib/shop/search.ts` (a search is 2 to 100 characters, spaces collapsed, control characters removed; `shopSearchPath`), `src/server/shopify/search.ts` (`predictiveSearch` for `SUGGESTION_LIMIT` suggestions, `search` for the listing), `src/server/shop/search-suggestions.ts` (validates first, then the store or the examples), `src/app/api/search/route.ts` (`GET`, reads `q` and `lang`, 400 for a language the site does not have). The browser side, `src/components/site/use-shop-suggestions.ts`, waits `SUGGESTION_DELAY_MS` (250) after the last key, cancels the request before, and treats a 429 or any failure as no suggestion. The text is sent in lower case, so the cache is shared by case variants.
12. **Rate limit.** In the hosting firewall, the rule of ADR 0016: path equals `/api/search` and method `GET`, fixed window of 60 s, 100 requests, key IP, default action (429). Create it with the Log action first and switch it to Rate Limit once the log shows it matches. It cannot be tested locally or in CI.
13. **End-to-end on example data.** `playwright.config.ts` sets `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_PRIVATE_ACCESS_TOKEN` to empty strings on the test server, so CI needs no store and a developer's `.env.local` does not leak into the run.
14. **Dictionaries and docs.** Every string in `src/server/i18n/messages/pt.ts` and `en.ts`. Update `docs/architecture.md` and the spec.

## Common errors

- An answer in the wrong language: `@inContext` was put on a field. It goes on the operation (`query Name($language: LanguageCode) @inContext(language: $language) { ... }`).
- Every answer in Portuguese under `EN`: English is not published or not added to the store's market. A single product title in Portuguese is a missing translation: Shopify falls back to the default language.
- A section name that does not change with the language: it is the menu item's title, which Shopify does not translate. Use the collection's title.
- A section address that differs per language: the translation app translated the collection handle (`suportes-modulares` and `modular-supports`). Leave the English handle equal in both languages.
- "Destaques" is empty although the store has a featured collection: its handle is not exactly `featured` (a collection created as "Destaques" gets `destaques`). The redirect of an old handle works in the Online Store only.
- A section at `/shop/frontpage`: the default home page collection was renamed instead of creating a new one.
- `first cannot exceed 250`: a connection gives at most 250 nodes. More products need pagination, which this module does not have.
- A reduced price shown on a product that has none: Shopify returns a compare-at price of `"0.0"` when there is none. Keep it only when greater than the price.
- Every page waits for Shopify on each request: a POST to `fetch` is cached only with `cache: "force-cache"` set explicitly, and only a 200 answer is stored.
- The end-to-end run shows the store's products, or fails locally and passes in CI: the Shopify variables of `.env.local` reached the test server. Set them to empty strings in `playwright.config.ts` (step 13); Next.js reads `process.env` before the `.env` files.
- A unit test fails on `server-only`: the Vitest alias of step 6 is missing.
- A product image is refused by `next/image`: its host or path is not in `remotePatterns`, or the pattern pins a `search` (step 10).
- The search shows fewer suggestions than the store has: the list filters the server's answer again in the browser. The store already tolerates typing errors and matches any word; show its answer as given (`SearchBar` with `filter={false}`).

## Verification

Run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm test:e2e` (on example data). Then, on `pnpm build` and `pnpm start` with `SITE_URL` and the two Shopify variables set:

| Request | Expected |
|---|---|
| `/pt`, `/en` | "Destaques" with the products of `featured`, titles in the page's language, Shopify's prices, no "Exemplo" mark; one large card per item of the `shop` menu |
| `/pt/shop` | Every product published to the Headless channel; the filters list the sections in the menu's order |
| `/en/shop/<section handle>` | The section's products, named by the collection's English title |
| `/pt/shop/no-such-section` | 404 |
| `/pt/shop?q=<a word of a title>` | The products that match, the text kept in the field |
| `/api/search?q=<two letters>&lang=en` | 200 with suggestions from the store |
| `/api/search?q=a&lang=pt` | 200 with no suggestion |
| `/api/search?q=ab&lang=fr` | 400 |

Then without the Shopify variables: `/pt` and `/pt/shop` show the example products, each marked "Exemplo". With a wrong token: `/pt` and `/pt/shop` load with no "Destaques", no section cards and an empty listing; every `/pt/shop/<section handle>` gives 404, because the sections come from the menu read, which failed. The log names the kind of error only, never the token.

After the first deployment that serves `/api/search`, check in the firewall log that the rate limit rule matches.

By eye, at 320, 768, 1024 and 1440 px: the carousel, the section cards and the listings, with no sideways scroll.
