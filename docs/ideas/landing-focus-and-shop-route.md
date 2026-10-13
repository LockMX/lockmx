# Landing page focused on the modular system, and the shop on its own route

## Objective

How might we make the landing page sell the modular system in one read, from "what it is" to "talk to us", and give the shop a home of its own (`/shop`, with a shop button and a cart in the header), without publishing anything that is not real yet?

For the visitor who does not know the brand: the page exists to present the modular system and turn the visit into a contact or a purchase. Every other product is an extra and lives in the shop (owner, 2026-10-13).

Raised by the owner on 2026-10-13, after seeing the landing page with the shop sections of spec 005 (phase A). It reverses part of `shop-style-home.md` and of specs 004 and 005; what it reverses is listed under "What this changes".

## Criteria

1. The landing page is, in order: hero; the modular system (what it is and its parts); "Porquê LockMX", ending with a "Fala connosco" button that leads to the contact section; contact, with the title "Pronto para arrumar a carrinha?"; footer.
2. The landing page has no search bar, no featured products, no product type cards, no black call-to-action band and no "Tudo para motocross" block.
3. `/modular-system` no longer exists: its content is the second section of the landing page. The site was never public (`COMING_SOON`), so nothing links to that address from outside.
4. The shop is at `/shop`, the same address in both locales (spec 002). It holds, in order: the search bar, "Destaques" (the carousel of spec 005), and "Categorias" with one large card per product type, racks and tyres. The sections built by spec 005 move there unchanged.
5. The header shows, to the left of the language switcher, a shop button in the primary (yellow) style and, between the two, the cart with its count. The footer links to the shop.
6. The header stays usable at 320 px (spec 004).
7. Nothing of the shop is public before Shopify is connected (`shop-style-home.md`, criterion 5): the shop button, the cart, the footer link and the shop routes are hidden together with the shop sections, in one place.
8. The cart holds nothing of its own. Lines, prices and totals come from Shopify; until it is connected, the cart is its header entry and an empty state.

## Options

### Where the cart lives

The cart is created and stored by Shopify (`cartCreate`, `cartLinesUpdate`; "retrieve a cart stored on Shopify"), and the purchase continues at the `checkoutUrl` it returns. Its id has the form `<token>?key=<secret>`, and the guide says "Never expose the `secret` part of the ID". Source: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage , read 2026-10-13. Not on the page read: how long a cart lives, and the mutations that add and remove lines; read by the cart spec.

| Option | Assessment |
|---|---|
| Header entry and empty state now, the working cart with Shopify | Proposed. `shopping-cart`, the `IconButton` count, `CartLine` and `QuantityStepper` exist since spec 003. The cart id goes in a cookie the browser script cannot read, handled only by `server/shopify/`. |
| A working cart in the browser now, with example products | Rejected: lines with prices and totals kept in the browser are what `AGENTS.md` forbids, and it would be thrown away. |

### How the racks are sold

Open with the client. The owner expects Shopify (2026-10-13).

| Option | What the "Suportes" card of the shop opens | Assessment |
|---|---|---|
| Cart | The racks the client created in the Shopify admin, each with "add to cart" | The owner's expectation. One way to manage every product (ADR 0014). Depends on the open point of ADR 0014: whether the racks fit the plan's three options per product, and whether the van model must be chosen. |
| Quote, with the catalogue in Shopify | The same list, with prices, and "ask for a quote" in place of "add to cart" | Needs no admin of ours: the products are still read from Shopify. Fits a rack that depends on the van. Needs the contact form. |
| Contact only | A form that asks for the van | No prices shown. Showing them without Shopify would need an admin of ours, which ADR 0014 removed. |

### How much of a shop

The owner's reference is https://motox-change.com/shop/ (read 2026-10-13): 51 products, facets by brand, category, stock, tag, family and size, sorting, grid and list views, wish list, quick view, pagination.

| Option | Assessment |
|---|---|
| Search, "Destaques", two category cards; a list with filters at the left for tyres | Proposed by the owner on 2026-10-13. The filters come from Shopify (`Collection.products` takes `filters`, spec 005 "Sources"), so the list is drawn in phase B. |
| The reference as it is | Too much frame for two product types: wish list, quick view, list view and "my garage" are for a catalogue ten times larger. |

### Where "Destaques" is shown

Shop only (owner's preference, 2026-10-13, to confirm with the client): on the landing page it would put a second goal, buying tyres, between "Porquê" and the contact.

## What this changes

- `shop-style-home.md`: criterion 1 (search bar in the hero, "Destaques" after the hero, type cards on the landing page) and "Not doing: a new address or navigation entry for the shop".
- Spec 005: decisions 1, 8 and 10, and the out-of-scope line "changing the sections spec 004 built". The work of T2 to T4 is kept and moved to `/shop`.
- Spec 004: the page of `/modular-system` (asked by the owner on 2026-10-11), the buy block and the complements block.

## Hidden assumptions

- That text and icons are enough to explain the system. The section is now the heart of the page, so the missing photographs of racks installed in a van weigh more than before.
- That there are enough tyres to justify filters. With a handful, a plain grid is enough.
- That the client accepts a landing page with no product for sale in sight.
- That "more conversion" follows. It cannot be measured: the site has no analytics, and consent management is an open decision.

## Not doing

- Wish list, quick view, list view, "my garage": for a much larger catalogue.
- A working cart, product pages, category lists with filters: phase B and the later shop specs.
- The contact form: its own spec (decisions so far in `landing-page.md`, updated 2026-10-13).
- Measuring conversion: after the decision on cookie consent.

## Open questions

For the client:

- Are the racks bought in the cart, by quote, or both? Do they depend on the van model?
- How many racks and how many tyres at launch, of how many brands and sizes?
- Are the featured products shown only in the shop?
- Photographs of the racks installed in a van, with the right to use them.

For the owner:

- Approval of amendment 1 of spec 005.

## Update (client, through the owner, 2026-10-13)

The client prefers the landing page directed at selling. So the direction of this idea is reversed the day it was built: the shop is the landing page again, right after the hero, the modular system is explained on its own page, and contact is a simple page; the contact form is optional. The reference given is https://teammxag57.com. What stays from this idea: the shop button and the cart in the header, and `/shop` as an address. Recorded as amendment 2 of `../specs/005-shop-home.md`.

Of the open questions below, this answers "featured only in the shop" (they are on the landing page) and leaves open how the racks are sold.

## Outcome

`../specs/005-shop-home.md`, amendment 1 (proposed, 2026-10-13).
