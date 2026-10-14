# Shopify: setting up the store and connecting the frontend

Guide for the owner and the client, from creating the account to the phase B of `../specs/005-shop-home.md`. Researched on 2026-10-14 unless another date is given. The decision is ADR 0014; the costs and Collective research are in `../ideas/build-vs-shopify.md`.

Each statement says how sure it is: **verified** (official Shopify page read), **community** (forum or third party, not official), **not researched**.

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
- **Collections (a proposal of ours, not a Shopify rule):** one per shop section of the site (`racks`, `tyres`, `merchandise`) and one for the featured products of the landing page carousel, their handles kept as settings of the site. Decided in the amendment of phase B (below). How each collection is filled (by hand or by rules) is the client's choice.
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

**Phase B must be amended before it starts.** It was written before amendment 2 of spec 005: T6 reads "product types", which T14 deleted; T8 hides the search slot and the product types of a landing page that no longer has them; nothing covers the `/shop` listings, their section and availability filters, the large section cards or merchandise. T5 (the client) is unaffected. The amendment needs the owner's approval.

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
| 8 | Amend phase B to amendment 2, then T5 to T8 | Owner | |
| 9 | Taxes, shipping, policies, notifications, invoicing app | Client, accountant | Launch |
| 10 | Shopify Payments, Multibanco, MB WAY request | Client | Launch |
| 11 | Transfer (path A), plan, remove password, checkout subdomain | Client, Owner | Launch |
| 12 | Collective test with the supplier: one product read, one real order | Client, Owner | Supplier products |

## Not researched

Partner sign-up, Markets beyond languages, tax set-up, shipping and carriers, the Customer Account API, webhooks, reading Shopify's policies through the API, the fees of Multibanco and MB WAY, Collective's behaviour in a headless storefront, Shopify and Stripe as data processors in the privacy policy, the sender domain of Shopify's emails (DNS shared with the mail set-up), and cookie consent across our site and Shopify's checkout (still open in `AGENTS.md`).

## Sources (read 2026-10-14)

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
