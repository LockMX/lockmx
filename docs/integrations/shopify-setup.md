# Shopify: setting up the store and connecting the frontend

Guide for the owner and the client, from creating the account to the phase B of `../specs/005-shop-home.md`. Researched on 2026-10-14 unless another date is given. The decision is ADR 0014; the costs and Collective research are in `../ideas/build-vs-shopify.md`.

Each statement says how sure it is: **verified** (official Shopify page read), **community** (forum or third party, not official), **not researched**.

## State and next steps (2026-11-17)

**State.** The client has signed up at shopify.com (path B below); the store has no set-up. All the set-up is done by the owner, with the client's data and decisions. The plan (owner, 2026-11-17):

- The client's own products, the LockMX racks and the tyres, are created in the LockMX store and managed there by the client.
- The client also resells the whole catalogue of a contact's existing Shopify store, the supplier shipping to the customer. This is meant to go through Shopify Collective ("Supplier products", path 1): Shopify imports the supplier's products into the LockMX store and keeps them in sync; we do not copy them. If the supplier is not eligible, path 2 of the same section applies.
- Our frontend reads both through the Headless channel. Spec 005 phase B is rewritten for this by amendment 3 (`../specs/005-shop-home.md`), approved with changes on 2026-11-18: the sections of the site come from a menu of the store, and supplier products are sorted by automated collections.

**Next steps, in order.** Steps 1 to 3 can run at the same time.

| # | Step | Who | Status |
|---|---|---|---|
| 1 | The client generates a collaborator request code and sends it; the owner creates a Partner account and joins the store as a collaborator | Client, owner | Done (owner's own Partner organization) |
| 2 | Ask the supplier the questions below, before anything is built on Collective | Owner, client | In progress: the owner is talking to the supplier (2026-11-25) |
| 3 | Amendment 3 of spec 005 approved; T15 (Storefront API client) is done without the store | Owner, developer | Done (T15, 2026-11-24) |
| 4 | Store details, EUR, PT-PT default and EN published ("Setting up the store", 1 and 2) | Client, owner | Done: the API answers in EN (collection titles translated; product titles not yet, 2026-11-25) |
| 5 | Section collections, the `featured` collection and the `shop` menu ("Test store set-up" below, part 4) | Owner | Done (2026-11-25): see the check below |
| 6 | The first LockMX products with photographs, in PT and EN, published to Headless | Client, owner | Two test products with photographs (2026-11-25); English titles to do |
| 7 | Headless channel, storefront, read permissions for products and collections; private token and store domain handed to the developer outside the repository | Owner | Done; token in `apps/web/.env.local` |
| 8 | T16 and T17: the site reads the store and suggests searches | Developer | Done (2026-11-24) |
| 9 | Shopify Payments, taxes, shipping, Collective installed as retailer; the supplier connected and its products imported | Client, owner, supplier | Shopify Payments active (owner, 2026-11-25); taxes, shipping and Collective not confirmed; the supplier not connected |
| 10 | T18: supplier products read through our API, and one real order | Owner, developer | Waits for 9 |
| 11 | The rest of "Setting up the store" (policies in Shopify, notifications, invoicing app) and launch | Client, accountant, owner | Later |

**Check of 2026-11-24** (a read-only Storefront API query from the developer's machine, version 2026-10, with the private token of `.env.local`): the store answers as "LockMX", country PT, currency EUR. Two products are published to Headless, product type `Suporte`, vendor `LockMX`. The only collection is "Suportes Modulares" with the handle **`frontpage`**: it is Shopify's default home page collection, renamed, so its address would be `/shop/frontpage`; a new collection is created for the section instead. The available languages are only `PT_PT`: English is not yet published or not yet in the Portugal market. There is no `shop` menu; the default `main-menu` (Início, Catálogo, Contacto) exists. The store domain is still the generated `ita9rf-de.myshopify.com`; Shopify allows choosing a new `myshopify.com` name once (Settings > Domains, pencil icon), the old one redirecting and staying the store's permanent identifier.

**Check of 2026-11-25** (same kind of read-only query): the `shop` menu has two items, "Suportes Modulares" (`modular-supports`, with image; "Modular Supports" under `EN`) and "Merchandise" (`merchandise`, no image and no products yet, so its section card has no photograph and its listing is empty). The `featured` collection has the hanger. Both products have photographs (the hanger 5, the boots support 2); their titles come back in Portuguese under `EN`. Handles of sections are in English, product handles in Portuguese (owner, 2026-11-24). The old handle `destaques` redirects to `featured` in the Online Store only, which the site does not use.

**Questions for the supplier** (Collective requirements, read 2026-10-09 in `../ideas/build-vs-shopify.md`):

1. Is the store established in Portugal and does it sell in EUR?
2. Does it use Shopify Payments, with payouts active, and Shopify Tax, Basic Tax or a tax app (not manual tax)? Is its VAT number verified?
3. Does it accept to join Collective as a supplier, and to ship LockMX orders to the customer?
4. How many products, and do they use metafields (Collective does not carry them)?
5. Who handles returns of its products, and under which conditions? The return policy of the site has to cover them (`../compliance/returns-and-withdrawal.md`).
6. Does every product have a product type (and the same type for products of the same kind)? Its collections are not imported by Collective, so the LockMX sections sort its products by product type or vendor (spec 005, decision 27).

## Test store set-up (2026-11-18)

What the owner does now, in the client's store, so T16 can read real data. Admin paths read on 2026-11-18; Shopify renames menus often, so search the admin when a path differs. Payments, taxes, shipping, invoicing and Collective are not needed to read products and stay in "Setting up the store" below.

**1. Access**
- [ ] The client: Settings > Users (or "Users & permissions") > Security, click the 4-digit collaborator request code to copy it and send it to the owner. A new one: "Generate new code" in the Collaborators section (old codes stop working).
- [ ] The owner: a Shopify Partner account with a passkey or two-step authentication (required for collaborators), then a collaborator request to the store with that code.
- [ ] The client: Settings > Users > filter "Requests", open the request, check the role's permissions (at least products, collections, content/navigation, apps and sales channels, settings), "Accept request".

**2. Store basics** (client's data)
- [ ] Settings > General: legal name, address in Portugal, currency EUR, time zone Lisbon, metric units. The domestic market follows the store's address and currency.
- [ ] Settings > Languages: PT-PT default; English added **and published**. Without publishing, `@inContext(language: EN)` has nothing to return.
- [ ] Settings > Markets: Portugal active, with both languages available in it (the languages available to each country come from Markets).
- [ ] Not now: Shopify Payments, taxes, shipping (needed for orders and for Collective, not for reading products).

**3. Products** (a few real ones are enough to start)
- [ ] Products > Add product: title, description, photographs (the client's, with the right to use them), price in EUR, compare-at price only for a real discount, **product type** filled in (`Suporte`, `Pneu`, ...: the automated collections use it), vendor `LockMX`, variants for sizes or models (up to 3 options), inventory tracked.
- [ ] Status **Active** and, under "Sales channels", **Headless** ticked (after part 5 exists; go back and tick it). A product not published to Headless never reaches the site.
- [ ] One product with a compare-at price, one without photograph and one out of stock, for T16's checks.
- [ ] English: Settings > Languages > Translate (Translate & Adapt app), title, description and options of each product.

**4. Sections** (spec 005, decisions 24 and 27)
- [ ] Products > Collections > Create collection, **automated**, one per section: for example "Suportes" with "Product type is equal to Suporte", "Pneus" with "Product type is equal to Pneu". New products of that type join by themselves. Give each an image (the section card) and translate its title to English.
- [ ] Check each collection's handle (the end of its address; where the admin shows it was not checked): it becomes `/shop/<handle>`. Set it before launch; changing it later changes the site's address.
- [ ] A **manual** collection with the handle `featured` ("Destaques"), with the products to show on the landing page.
- [ ] Content > Menus > add a menu named "Shop", handle **`shop`**; one item per section, each linking to its collection, in the order of the site. Only the top level is read for now.
- [ ] Every collection published to the Headless channel (the collection's "Sales channels").

**5. Headless channel**
- [ ] Install **Headless** (Shopify App Store, by Shopify, free). Then Sales channels > Headless > **Add storefront**.
- [ ] "Storefront API permissions" > Edit: `unauthenticated_read_product_listings` (products and collections), `unauthenticated_read_product_inventory` (stock), `unauthenticated_read_content` (the menu). Save. Nothing about customers or checkouts yet.
- [ ] Copy the **private access token** (sent in the `Shopify-Storefront-Private-Token` header, server only) and the store domain `<name>.myshopify.com`.

**6. What the developer needs, outside the repository**
- [ ] The store domain `<name>.myshopify.com`.
- [ ] The private access token, by a password manager or another private channel, never by email in plain text, chat logs or the repository. It goes in `apps/web/.env.local` (ignored by git) and later in the hosting's variables.
- [ ] The API version is chosen by the developer: **2026-10** is the latest stable today (accessible until 2027-10-16; each version lasts at least 12 months).
- [ ] Confirmation that parts 3 and 4 are done, with the handles of the section collections.

**Common mistakes.** A product or collection not ticked for the Headless channel (it does not appear and there is no error). English not published (the site shows Portuguese in `/en`). The menu with another handle (the site shows no sections). A collection's handle changed after launch (old addresses break). The public token handed over instead of the private one.

## Who owns what

- **The client's company is the account holder** of the store: it signs up Shopify Payments (identity and business checks, bank account for payouts), the VAT number and the billing of the plan. A developer cannot hold these for the client.
- **The developer works as a collaborator.** Collaborators are Shopify Partners; they do not count toward the user limit of the plan, and the store owner sets their permissions. Basic has no staff accounts beyond the owner, so a collaborator is the way in. (Verified, collaborator accounts and pricing page.)
- A Shopify Partner account is free to create (not researched in detail: the sign-up page was not read).

## Two ways to start

| | A. Client transfer store, built by the developer | B. The client signs up directly |
|---|---|---|
| Who creates it | The developer, from the Dev Dashboard of a Partner account | The client, at shopify.com |
| Cost while building | No fee is stated; the developer can create unlimited transfer stores. The client chooses and pays a plan when the store is transferred, and **a transferred store gets no promotions or free trial** | 3 days free, then 1 EUR per month for 3 months, then the plan (Basic 27 EUR monthly or 19 EUR per month billed yearly) |
| Real payments | No: test gateway or Shopify Payments test mode only | Yes, once Shopify Payments is set up |
| Password page | Always on, cannot be removed until transfer | Can be removed at launch |
| Features | Most of the Advanced plan; only free and partner-friendly apps, no custom apps | Those of the chosen plan |
| Handover | Transfer to the client's email; the client accepts within 7 days and picks a plan. Shopify Payments must be off when the transfer is sent | Nothing to hand over; the client sends the developer a 4-digit collaborator request code |

Sources: client transfer stores (read as raw text) and dev stores on shopify.dev; Portuguese pricing page; collaborator accounts (verified).

- **The transfer page contradicts itself** on access after the handover: its text says twice that the developer keeps collaborator access; its status table says a completed transfer leaves "no collaborator relationship" and "You no longer have access to the store." If access is lost, the client gives a collaborator request code, as in path B.

- A **dev store** (as opposed to a transfer store) can never become the real store and cannot be transferred: never build the catalogue on one.
- **Not verified:** whether the Headless channel installs on a transfer store. Transfer stores accept free apps and Headless is free and made by Shopify, but no page says so. It takes minutes to try, and it decides path A.
- **Community:** a password-protected store has been reported to send the `checkoutUrl` back to the password page. This does not block phase B, which only reads products, but a full test order through our frontend may need path B.
- A Shopify Collective test needs a real order with Shopify Payments (verified, Collective testing page, 2026-10-09), so it can only happen on the client's live store.

**Chosen: path B.** The client signed up at shopify.com on or before 2026-11-17 (owner); the store has no setup yet. The trial and the promotional months started then. The developer joins as a collaborator with the client's request code.

**Recommendation:** path A if the Headless channel installs on a transfer store, since nothing is billed to the client before the shop is ready, at the cost of the sign-up promotion; otherwise path B. In both, the client owns the account from the start of real sales.

## Setting up the store (Shopify admin)

In order. "Client" means the decision or data is the client's; "Owner" is the developer.

1. **Store details** (client): legal name, address, VAT number, store currency EUR, time zone Lisbon, unit system.
2. **Languages** (owner, with the client's texts): PT-PT as default, EN added and published. Translations are made with the Translate & Adapt app (by hand or Shopify's automatic translation), by CSV, or through the Admin API. Once a language is published, the checkout and the notification emails are shown in the customer's language. (Verified, languages help page.) Which languages each country sees is set in Markets.
3. **Markets** (client): where the shop sells. Portugal at least; the rest of the EU is a business decision. Not researched beyond the language setting.
4. **Taxes** (client and their accountant): VAT. Collective needs Shopify Tax, Basic Tax or a tax app, not manual tax (verified). Not researched further.
5. **Shipping** (client): zones, rates, carriers. Not researched.
6. **Payments** (client): Shopify Payments needs two-step authentication on the account (verified). Portuguese methods (verified on the help pages):
   - **Multibanco:** merchants in Portugal, customers in Portugal paying in EUR, 0.50 to 99,999 EUR, up to 48 h for approval after activating Shopify Payments, not in test mode. The customer has 7 days to pay or the order is cancelled. A refund needs the customer's IBAN, which Stripe asks for by email, and the processing fee is not refunded. The fee rate is not published on that page.
   - **MB WAY:** "in early access, and isn't available to all eligible merchants"; customers in Portugal, 0.50 to 5,000 EUR, no subscriptions.
   - Cards on Basic: 1.8% + 0.30 EUR online, Amex 3% + 0.30 EUR, international 3% (pricing page).
7. **Policies** (client): refund, privacy, terms of service, shipping and contact, in Settings > Policies, in both languages. They are linked from the checkout. The pages of our own site are separate (spec 004, T7). Not researched: reading them through the Storefront API.
8. **Notifications** (owner, with the client's texts): the order confirmation email carries the information on consumer arbitration centres (Lei 144/2015, art. 18.º n.º 2, "durable medium"; see `../compliance/site-information-and-complaints.md`) and the right of withdrawal.
9. **Checkout branding** (owner): logo, colours and a font from Shopify's list (ADR 0014).
10. **Certified invoicing** (client and accountant): invoices in Portugal must be issued by software certified by the tax authority. Shopify apps found: **Moloni ON** (by Webinfor; free to install, needs a Moloni subscription; no reviews at the time; no support in English) and an **InvoiceXpress** integration announced by the vendor (listing not read). Both from search results, not read on the App Store. Whether they work for orders from a headless storefront is still open (ADR 0014). The accountant should choose.
11. **Customer accounts:** not part of phase B. Not researched in this pass.

## Products

- **By hand** in Products, or **by CSV** (template from Shopify; only Title is required for a new product; variants as extra rows with the same handle and Option1, Option2, Option3 columns; images by public `https://` address, up to 250 per product; UTF-8). **A product can have up to 3 options.** (Verified, CSV help page.) The maximum number of variants was not verified today.
- **Collections (spec 005, amendment 3):** one automated collection per shop section, listed in the `shop` menu, and the manual `featured` collection for the landing page carousel. The site reads the sections from the menu, so new sections need no code. Automated collection conditions (read 2026-11-18): product title, variant title, type, vendor, category, tag, status, price, compare-at price, weight, stock, and metafields marked for it; up to 5,000 such collections per store. Collective does not import a supplier's collections or tags, so its products are sorted by product type or vendor.
- **Translations** of title, description and options for EN, with Translate & Adapt.
- **Publishing:** a product only reaches our frontend when it is published to the Headless channel (sales channel availability on the product). (Verified, Headless management page: the channel supports product publishing.)
- **Metafields** (extra fields such as compatible vans) work, but Collective is incompatible with metafields (verified): imported supplier products would not carry them.
- **Images:** for spec 005 phase B the client's photographs, with the right to use them.

## The Headless channel

1. Install **Headless** from the Shopify App Store (free, made by Shopify). The user doing it needs the staff role and the Apps and channels permission. (Verified.)
2. **Create storefront.** It generates a public and a private access token. (Verified.)
3. **Storefront API permissions:** set them to what phase B reads (products, collections). Permissions are shared by all storefronts of the store. (Verified.)
4. **Hand over the private token** and the store domain (`<name>.myshopify.com`) to the developer outside the repository (spec 005, prerequisite 4). It is a secret: never in a `NEXT_PUBLIC_*` variable, a log, a test or a commit. Rotation: create a new token, update the hosting, delete the old one; the old one works until deleted. (Verified.)

**Limits that disagree:** the pricing page lists "1" headless storefront on Basic, Grow and Advanced and 25 on Plus; the developer docs say a store can have up to 100 active storefronts and tokens. One storefront is all this project needs.

## How the frontend connects (spec 005, phase B)

**Phase B was rewritten by amendment 3 of spec 005** (proposed 2026-11-17, waiting for the owner's approval): it was written before amendment 2 and read "product types", which T14 deleted, and nothing covered the `/shop` listings. The task numbers below are those of phase B; amendment 3 renames them T15 (client), T16 (listings and featured), T17 (search), T18 (Collective check) and T19 (docs).

- **T5:** a server-only client in `apps/web/src/server/shopify/` posts GraphQL to `https://<store>.myshopify.com/api/<version>/graphql.json` with the private token header. The token, the domain and the pinned API version are environment variables of the hosting.
- **T6:** the featured collection and the section collections are read with `@inContext(language: PT | EN)`; prices and stock come only from Shopify. Pages are refreshed on a time basis at first; Shopify webhooks need an app (below) and are left for later.
- **Cart and checkout** (after phase B, a spec of its own): the Cart API (`cartCreate`, `cartLinesUpdate`, `cart`), whose `checkoutUrl` sends the buyer to Shopify's checkout. The cart id has a secret part that is never exposed; server requests on behalf of a buyer send `Shopify-Storefront-Buyer-IP`. The language of the cart, and so of the checkout, is set with `@inContext` on `cartCreate`. (Verified, cart and languages guides.)
- **Not adopted:** Shopify's Hydrogen now offers a way to add it to an existing project and a Next.js template hosted on Vercel (verified, Hydrogen getting started). It would be a new dependency; the plain client of T5 is the plan. Not researched further.
- **Webhooks and the Admin API (later):** since 2026-01-01 new "legacy custom apps" cannot be created in the admin; new apps are made in the Dev Dashboard (community, several Shopify forum threads). To be researched when a task needs webhooks.

## Checkout domain and launch

- Shopify's checkout cannot run on our own domain; the usual setup is a subdomain such as `checkout.lockmx.com` pointed at Shopify. For a storefront not hosted on Shopify, only that subdomain points to Shopify; in Settings > Domains its target is the Online Store and it is the primary domain; the store password is removed. (Verified on Shopify's Hydrogen redirect guide; its redirect theme is Hydrogen-specific.)
- **Consequences:** Shopify's own theme becomes public on that subdomain unless it redirects to our site; links in Shopify's emails and its sitemap use that domain. (Community.)
- DNS changes are the owner's action (Cloudflare). Researched again before launch.

## Supplier products

1. **The supplier has a Shopify store in Portugal, in EUR, and joins Collective:** its products are imported into the LockMX store, the supplier ships and is paid automatically from the LockMX Shopify Payments balance. Requirements and limits in `../ideas/build-vs-shopify.md`; still not verified that imported products are returned to a headless storefront (ADR 0014). Proven only with a real order on the live store.
2. **The supplier has no Shopify, or is not eligible:** its products are created as LockMX products, with the supplier in the Vendor field.
   - **Stock and prices:** kept by hand, or synced from a file the supplier publishes (CSV, XML, FTP, Google Sheets) by an App Store app. Example found: Stockistly Inventory Sync, about 20 USD per month for three feeds with one daily sync (listing only, not tested). Needs the supplier to provide such a feed.
   - **Orders:** the supplier must be told what to ship. By hand, or with Shopify Flow, which is free on Basic (verified). Whether Flow can email a supplier was not verified; its HTTP request action needs Grow or above (verified).
   - The customer's data goes to the supplier: the privacy policy names suppliers as recipients.
3. **LockMX buys and holds stock:** ordinary products, nothing special.

For each supplier the client brings: country, whether it has Shopify, whether it is in Collective, whether it can provide a stock feed, and how it wants orders.

## Checklist

| # | Step | Who | Unblocks |
|---|---|---|---|
| 1 | Choose path A or B; create the Partner account | Owner | |
| 2 | Path A: create a client transfer store and try installing Headless | Owner | Prerequisite 2 |
| 2b | Path B: the client signs up and sends a collaborator code | Client | Prerequisite 2 |
| 3 | Store details, EUR, PT-PT and EN | Client, Owner | |
| 4 | Collections: racks, tyres, merchandise, featured | Owner | Prerequisite 5 |
| 5 | A few real products with images, in PT and EN, published to Headless | Client, Owner | Prerequisite 5 |
| 6 | Headless channel, storefront, permissions | Owner | Prerequisite 3 |
| 7 | Private token and store domain handed over outside the repository | Owner | Prerequisite 4, T5 |
| 8 | Amend phase B to amendment 2 (done: amendment 3, waiting for approval), then T15 to T19 | Owner | |
| 9 | Taxes, shipping, policies, notifications, invoicing app | Client, accountant | Launch |
| 10 | Shopify Payments, Multibanco, MB WAY request | Client | Launch |
| 11 | Transfer (path A), plan, remove password, checkout subdomain | Client, Owner | Launch |
| 12 | Collective test with the supplier: one product read, one real order | Client, Owner | Supplier products |

## Not researched

Partner sign-up, Markets beyond languages, tax set-up, shipping and carriers, the Customer Account API, webhooks, reading Shopify's policies through the API, the fees of Multibanco and MB WAY, Collective's behaviour in a headless storefront, Shopify and Stripe as data processors in the privacy policy, the sender domain of Shopify's emails (DNS shared with the mail set-up), and cookie consent across our site and Shopify's checkout (still open in `AGENTS.md`).

## Sources (read 2026-10-14)

Read 2026-11-18: Collective importing and product policies (https://help.shopify.com/en/manual/online-sales-channels/shopify-collective/retailers/importing-products, `/policies/products`, https://shopify.dev/docs/apps/build/collective/products); automated collections and conditions (https://help.shopify.com/en/manual/products/collections/automated-collections, `/conditions`); menus (https://help.shopify.com/en/manual/online-store/menus-and-links, `/editing-menus`, `/drop-down-menus`; https://shopify.dev/docs/api/storefront/latest/queries/menu); access scopes and authentication headers (https://shopify.dev/docs/api/usage/access-scopes, https://shopify.dev/docs/api/usage/authentication); translatable resources (https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/markets); API versions (https://shopify.dev/docs/api/usage/versioning); markets (https://help.shopify.com/en/manual/markets/getting-started/set-up-markets).


- Pricing, Portugal: https://www.shopify.com/pt/precos
- Storefront API, getting started: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started
- Managing the Headless channel: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/manage-headless-channels
- Cart: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage
- Languages, Storefront API: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/markets/multiple-languages
- Languages, admin: https://help.shopify.com/en/manual/international/languages
- Hydrogen getting started: https://shopify.dev/docs/storefronts/headless/getting-started
- Checkout subdomain: https://shopify.dev/docs/storefronts/headless/hydrogen/migrate/redirect-traffic
- Dev stores: https://shopify.dev/docs/api/development-stores
- Client transfer stores: https://shopify.dev/docs/apps/build/stores/client-transfer-stores (raw text: the same address with `.md`)
- Collaborator accounts: https://help.shopify.com/en/manual/your-account/users/security/collaborator-accounts
- Product CSV: https://help.shopify.com/en/manual/products/import-export/using-csv
- Local payment methods: https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods, `/mb-way`, `/multibanco`
- Collective retailer requirements: https://help.shopify.com/en/manual/online-sales-channels/shopify-collective/retailers/requirements-and-considerations
- Shopify Flow: https://help.shopify.com/en/manual/shopify-flow
- Community, checkout domain: https://community.shopify.com/t/headless-store-checkout-on-primary-domain/265100, https://community.shopify.com/t/headless-shopify-buy-checkout-url-302-redirected-back-to-password-protected-storefront/155182
- Community, custom apps: https://community.shopify.dev/t/starting-january-1-2026-you-will-not-be-able-to-create-new-legacy-custom-apps-this-will-not-impact-any-existing-apps/26798
- Invoicing apps (search results): https://apps.shopify.com/molonion, https://invoicexpress.com/
- Stock sync example: https://apps.shopify.com/stockistly
