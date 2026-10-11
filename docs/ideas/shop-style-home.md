# Shop-style home page

## Objective

How might we give the landing page the shape of an online shop home (search, featured products, product types) now, so the owner and the client can judge the final look, without publishing anything that is not real?

For the owner and the client, who decide the look of the page before the shop exists; and, after the shop is connected, for the visitor who arrives to buy.

Raised by the owner on 2026-10-10 and refined on 2026-10-11, after seeing the landing page of spec 004. The shop is Shopify behind this frontend (ADR 0014) and has no idea or spec yet; this idea is the first piece of it and stays in development until the shop is connected.

## Criteria

1. The landing page gains, in page order: a search bar inside the hero, under its two actions and as wide as the two together; a "Destaques" section right after the hero, with a carousel of featured products; and a section with one card per product type.
2. Everything is built from the design system. The carousel is a new component: it is designed in the Claude Design project and imported here, as the storefront kit was, and enters `docs/design/components.md` before a page uses it.
3. Until the catalogue exists, the products are examples: name, price and a neutral image, each card carrying a visible "Exemplo" mark. The example data lives in one module that the shop spec replaces with data read from Shopify; no component knows the difference.
4. The search bar is in place for its look only. It searches nothing until the shop spec gives it a destination.
5. **Nothing of this is published before the shop is connected.** If the client decides to launch the landing page as a marketing page first, the search bar and the shop sections are hidden for that launch and shown again only after the integration with Shopify is complete (owner, 2026-10-11).
6. The rules of spec 004 keep applying: every string in both dictionaries, tokens only, one `h1`, WCAG 2.1 AA, no sideways scroll from 320 px, tests in three browser engines and one mobile viewport.
7. Addresses stay in English and equal in both locales (spec 002; the owner confirmed `/modular-system` on 2026-10-11).

## Options

### How the placeholders are kept from the public

| Option | Assessment |
|---|---|
| Hidden by hand before a launch without the shop | Decided by the owner on 2026-10-11. No extra code now. The risk is forgetting one of the pieces, so the spec gives the hiding a single place: one constant or one prop in the page that composes the sections, and a test for each state. |
| A switch in the environment, like `COMING_SOON` | Proposed and not taken. It would make a launch a change of one value, at the cost of a second switch to maintain. |

Whatever the mechanism, `COMING_SOON` still covers the whole site until launch, so the placeholders are not public today.

### What the product cards show

| Option | Assessment |
|---|---|
| Examples with a visible mark | Decided by the owner on 2026-10-11. Shows the final card (`ProductCard` exists since spec 003) and cannot be mistaken for an offer. |
| Neutral cards without name or price | Safest, but does not show the final look, which is the purpose. |
| Realistic examples without a mark | Rejected: an invented price that reaches the public is a commercial statement the project forbids. |

### How the carousel moves

Not decided. The owner asked whether an automatic carousel still allows moving it by hand.

- It does: an automatic carousel has the arrows, the swipe and the keyboard of a manual one, and also advances by itself.
- What it adds is an obligation: content that moves by itself for more than five seconds needs a way to pause or stop it (WCAG 2.2.2, to be read at the official source when the component is designed), and it should stop while it has the focus or the pointer and under reduced motion.
- Proposal: manual first (arrows, swipe, keyboard, scroll snap). Automatic movement can be added later as a prop of the same component, with the pause control, if the look asks for it.

### Product types

Decided by the owner on 2026-10-11: four cards, from the types the client's copy names: modular system, tyres, parts, accessories. As placeholders, hidden together with "Destaques". The modular system card can already lead to `/modular-system`; the others have no destination until the shop has category pages.

### Where the work goes

| Option | Assessment |
|---|---|
| Part of the shop spec, as its first tasks | The sections are the home of the shop and get their real data there. Proposed. |
| A spec of its own, before the shop idea | Faster to start, but builds the carousel and the cards without knowing the shape of Shopify's data, and may have to be redone. |

## Hidden assumptions

- That the look can be judged with example products. If the real catalogue is small (a handful of products), a carousel may be the wrong component and a plain grid the right one. To check with the client: how many products at launch.
- That the client has product photographs in time. Without them the cards show the neutral image, and the section loses most of its effect.
- That a search bar in the hero is worth its place with a small catalogue. To check after the catalogue is known.
- That `ProductCard` as built in spec 003 fits what Shopify returns (variants, price ranges, availability). To check in the shop idea.

## Not doing

- Publishing example products, prices or a search that searches nothing.
- Reading from Shopify, the cart, product pages, category pages: the shop spec.
- Automatic movement of the carousel in the first version.
- A new address or navigation entry for the shop: there is nothing behind it yet.

## Open questions

For the owner:

- Manual or automatic carousel (see above).
- Whether this is built as the first tasks of the shop spec or as its own spec.
- The design of the carousel in the Claude Design project: who starts it and when.

For the client:

- How many products at launch, and which are featured.
- Product photographs, with the right to use them.
- Whether the landing page is launched before the shop.

## Outcome

None yet. Spec 004 records that these sections were asked for and not built (task notes of T6a).
