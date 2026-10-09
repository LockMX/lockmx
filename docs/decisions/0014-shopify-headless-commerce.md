# 0014. Shopify as the commerce backend, behind our own frontend (headless)

- Status: accepted
- Date: 2026-10-09

## Context

`../ideas/build-vs-shopify.md` compared a fully custom shop (Option A), a hosted Shopify store (Option B) and our own Next.js frontend with Shopify as the commerce backend (Option C).

One supplier of the client has a Shopify store and proposed that LockMX resell its products with the supplier shipping to the end customer and managing its own stock. The client wants that model for the complementary products, because it removes their stock and order handling from LockMX. The main product stays the racks for vans.

A cart and a checkout belong to one system, so the complementary products cannot be on Shopify while the racks are sold through a separate custom checkout (same file, "One shop or two").

## Decision

Decided by the owner with the client in a meeting on 2026-10-09: Option C.

- The whole site is the Next.js application in `apps/web`, built with the design system of spec 003: landing page, catalogue, product pages and cart.
- Shopify holds the catalogue (the racks included), stock, orders, customers, checkout and payments. The frontend reads and writes through the Storefront API, with tokens from the Headless channel.
- The checkout and the sign-in screen are Shopify's hosted pages, styled with the options the plan gives (a logo, colours and a font from Shopify's list). This was accepted by the client.
- Supplier products are sold through Shopify Collective where the supplier is eligible. Other suppliers are handled as ordinary LockMX products.
- The catalogue, stock and orders are managed by the client in the Shopify admin. No admin panel is built.

## Not yet verified

The decision was taken knowing these are open. Each is closed in the idea or spec of the shop, before code depends on it.

- That products imported through Collective are returned by the Storefront API when published to the Headless channel. It follows from how publishing works and no page read contradicts it, but Shopify does not state it. To be proven in a trial store with the client's supplier: one imported product read through the API and one real order.
- That the supplier meets the Collective requirements: a store in Portugal, in EUR, with Shopify Payments, enrolled as a supplier.
- MB WAY on Shopify Payments is in early access and not available to every merchant. The Multibanco rate is not published.
- Whether the plan's product limits (3 options per product) fit the racks, and whether a fitment finder is needed.
- Languages through the Storefront API, the domain the checkout and sign-in pages are served from, VAT on the subscription, and that the certified invoicing integration works for orders from a headless storefront.

## Alternatives considered

- Option A, custom shop: full control of checkout and of the payment provider (lower MB WAY and Multibanco fees with a Portuguese provider), but stock, orders, payments, accounts and the admin panel are built and maintained by one developer, and the supplier model the client wants would need its own integration with each supplier.
- Option B, hosted Shopify store with a theme: least development, but the design system of spec 003 would be redone as a theme and the frontend work would not be used.

## Consequences

- Fixed cost: Shopify Basic (19 EUR per month billed annually, 27 EUR monthly), plus frontend hosting and certified invoicing, about 44 to 56 EUR per month in total; payment fees are Shopify's (figures and sources in the idea file).
- Collective requires Shopify Payments, so a separate Portuguese payment provider is not used. The research on ifthenpay, Stripe and Mollie in the idea file is no longer a pending decision.
- Earlier decisions to revisit, each in its own ADR update. Nothing is superseded by this file alone:
  - ADR 0003 (Better Auth): customer accounts and sign-in are Shopify's (Customer Account API), and the admin is the Shopify admin. Better Auth has no remaining use unless a need outside Shopify appears.
  - ADR 0002 (Drizzle, PostgreSQL) and ADR 0006 (database provider): the shop needs no database of ours. A database is justified only by something Shopify does not hold, to be named before one is created.
  - ADR 0005 (Resend): login codes and order emails are sent by Shopify. Resend remains a candidate only for the contact form.
  - ADR 0007 and 0012 (hosting): unchanged, the frontend is still hosted by us.
  - ADR 0001: unchanged, with the commerce backend outside the application.
- `../ideas/project-brief.md` lists requirements written for the custom build (an admin panel built by us, stock reservation, idempotent payment webhooks, audit trail). Shopify now covers them; the brief is updated when the shop idea is written.
- Security rules in `AGENTS.md` still apply to what remains ours: the Storefront API private token is a secret read only in the server layer; prices, stock and totals always come from Shopify, never from the browser; any webhook from Shopify is verified by its signature.
- Lock-in: catalogue, orders and customers live on Shopify. Leaving means migrating that data and building what Option A planned.
- Spec 004 (public shell and landing page) is unaffected. The shop gets its own idea and spec.

## Sources

All in `../ideas/build-vs-shopify.md`, sections "Option C", "Does it solve the supplier problem?" and "One shop or two" (Shopify pricing, shopify.dev and Shopify help pages, read 2026-10-09).
