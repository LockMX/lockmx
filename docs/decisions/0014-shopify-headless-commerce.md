# 0014. Shopify as the commerce backend, behind our own frontend (headless)

- Status: accepted
- Date: 2026-10-09

## Context

Three options were compared for the client: a fully custom shop (Option A: our own database, authentication, payments, emails and admin panel), a hosted Shopify store with a theme (Option B), and our own Next.js frontend with Shopify as the commerce backend (Option C).

One supplier of the client has a Shopify store and proposed that LockMX resell its products with the supplier shipping to the end customer and managing its own stock. The client wants that model for the complementary products, because it removes their stock and order handling from LockMX. The main product stays the racks for vans.

A cart and a checkout belong to one system, so the complementary products cannot be on Shopify while the racks are sold through a separate custom checkout: a customer who wants both would pay twice, in two checkouts, with two accounts, two order histories and two invoicing integrations. If Shopify is used for the extras, the racks are Shopify products too, and the custom database, authentication, payment and admin work of Option A is not built.

## Decision

Decided by the owner with the client in a meeting on 2026-10-09: Option C.

- The whole site is the Next.js application in `apps/web`, built with the design system of spec 003: landing page, catalogue, product pages and cart.
- Shopify holds the catalogue (the racks included), stock, orders, customers, checkout and payments. The frontend reads and writes through the Storefront API, with tokens from the Headless channel.
- The checkout and the sign-in screen are Shopify's hosted pages, styled with the options the plan gives (a logo, colours and a font from Shopify's list). This was accepted by the client.
- Supplier products are sold through Shopify Collective where the supplier is eligible. Other suppliers are handled as ordinary LockMX products.
- The catalogue, stock and orders are managed by the client in the Shopify admin. No admin panel is built.

## Not yet verified

The decision was taken knowing these are open. Each is closed in the idea or spec of the shop, before code depends on it.

- That products imported through Collective are returned by the Storefront API when published to the Headless channel. It follows from how publishing works and no page read contradicts it, but Shopify does not state it. To be proven in the client's store with the supplier: one imported product read through the API and one real order (spec 005, T11).
- That the supplier meets the Collective requirements (`../integrations/shopify-setup.md`, "Supplier products").
- MB WAY on Shopify Payments is in early access and not available to every merchant. The Multibanco rate is not published.
- Whether the plan's product limits (3 options per product) fit the racks, and whether a fitment finder is needed.
- VAT on the subscription, and that the certified invoicing integration works for orders from a headless storefront.
- Closed since: languages through the Storefront API work with `@inContext(language:)` on the operation, `PT_PT` and `EN` (spec 005, T8 and T9 notes, checked against the store on 2026-11-24). The checkout cannot run on our own domain: a subdomain such as `checkout.lockmx.com` is pointed at Shopify (`../integrations/shopify-setup.md`, "Checkout domain and launch").

## Alternatives considered

- Option A, custom shop: full control of checkout and of the payment provider (lower MB WAY and Multibanco fees with a Portuguese provider), but stock, orders, payments, accounts and the admin panel are built and maintained by one developer, and the supplier model the client wants would need its own integration with each supplier.
- Option B, hosted Shopify store with a theme: least development, but the design system of spec 003 would be redone as a theme and the frontend work would not be used.

## Consequences

- Fixed cost, VAT excluded (1 EUR = 1.1225 USD, ECB reference rate of 2026-10-02): Shopify Basic 19 EUR per month billed annually or 27 EUR monthly; frontend hosting on Vercel Pro (20 USD, about 18 EUR); certified invoicing 7 to 11 EUR. About 44 to 56 EUR per month in total. The API and the Headless channel add nothing to the Shopify plan (no "API only" plan exists; Basic allows one headless storefront). Payment fees are Shopify's: on Basic, 1.8% + 0.30 EUR for standard online cards and 1.3% + 0.30 EUR for MB WAY.
- Collective requires Shopify Payments, so a separate Portuguese payment provider is not used.
- The checkout is not ours: the cart's `checkoutUrl` sends the buyer to Shopify's web checkout. Below Plus, its styling is a logo, a colour palette and fonts chosen from a list; the design system stops at the cart. Customer accounts use Shopify's hosted sign-in (Customer Account API).
- What Option A would have built is not ours: the project has no database, authentication or transactional email of its own. The ADRs written for it were withdrawn on 2026-11-25 (`README.md`, "Withdrawn decisions").
- ADR 0001, 0007 and 0012 are unchanged: the frontend is still ours and hosted by us.
- Security rules in `AGENTS.md` still apply to what remains ours: the Storefront API private token is a secret read only in the server layer; prices, stock and totals always come from Shopify, never from the browser; any webhook from Shopify is verified by its signature.
- Lock-in: catalogue, orders and customers live on Shopify. Leaving means migrating that data and building what Option A planned.

## Sources

Read 2026-10-09 unless another date is given.

- Shopify pricing, Portugal: https://www.shopify.com/pt/precos (plans, "create headless storefronts", Shopify Payments rates, third-party gateway fee; MB WAY rate read 2026-10-06); European version: https://www.shopify.com/pricing.
- Storefront API and headless: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api, https://shopify.dev/docs/storefronts/headless/bring-your-own-stack, https://shopify.dev/docs/api/storefront#rate-limits, https://shopify.dev/docs/api/usage/limits, https://shopify.dev/docs/api/storefront/latest/objects/Cart, https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api, https://apps.shopify.com/headless.
- Starter plan not available to new stores: https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/shopify-starter-plan. Checkout styling: https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/checkout-style.
- Shopify Payments in Portugal: https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries/portugal/payment-methods, `/local-payment-methods/mb-way`, `/local-payment-methods/multibanco`.
- Shopify Collective: the pages listed in `../integrations/shopify-setup.md`, "Supplier products".
- Invoicing: Moloni plans https://www.moloni.pt/planos/ and Shopify integration https://www.moloni.pt/plugins/shopify/; InvoiceXpress plans https://invoicexpress.com/planos-precos/ and Shopify plugin https://plugins.invoicexpress.com/shopify/ (read 2026-10-02).
- Vercel pricing: https://vercel.com/pricing (2026-09-30).
- ECB euro reference rate (USD), 2026-10-02: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html
