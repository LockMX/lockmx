# Build from scratch versus Shopify

Prepared to support a decision with the client. All figures come from the official pages consulted on 2026-09-30 and 2026-10-02 unless marked otherwise. Nothing here is a recommendation to choose one side: it lists what each option costs and covers, and what is still unknown.

How to read it:

- **Verified**: seen on an official page during this research.
- **Secondary**: from a blog or comparison site. Treat as indicative only.
- **Not verified**: not found, or not researched. Must be confirmed before the client commits.
- Prices are in the currency of the source page (EUR for Shopify, Moloni and InvoiceXpress; USD for Vercel, Resend, Sentry, Supabase, Neon). They are not converted. Whether VAT is included is stated only where the source says so.

## Objective

Give the client a factual comparison between:

- **Option A, custom build**: a Next.js application with its own database, payments, emails and admin panel, as currently documented in `docs/decisions/`.
- **Option B, Shopify**: a hosted Shopify store with themes, apps and the certified invoicing integration.
- **Option C, headless** (added 2026-10-09): our own Next.js frontend with Shopify as the commerce backend. It has its own section below; the tables before it compare A and B only.

## The requirements being compared

From `project-brief.md`: small catalog (a few tyres and the flagship racks for vans), customer accounts required to buy, passwordless sign-in by emailed code, PT-PT and EN, MB WAY, Multibanco, cards and possibly bank transfer, invoices from AT-certified software, an admin panel for the client, contact form, legal pages, GA4 after consent, and no marketing emails at launch.

## Coverage by requirement

| Requirement | Shopify | Custom build |
|---|---|---|
| Customer accounts, passwordless by email code | Verified: new customer accounts sign in with an email address and a one-time 6-digit code, with no password. Verified: an account can be required to buy, with the setting "Require customers to sign in to their account before checkout" (Settings, Checkout). Side effects: accelerated checkouts such as Apple Pay are hidden in the cart, and customers can only use an email address to check out. The page does not say whether the setting depends on the plan. | Planned (ADR 0003, Better Auth email codes). Account required to buy: decided. |
| PT-PT and EN | Verified: up to 20 languages on Basic, Grow and Advanced. Price of the translation tool (Translate & Adapt) not verified; CSV import is free. | Planned, built by us (messages, routes, emails). |
| Card payments | Verified: Shopify Payments is available in Portugal (Visa, Mastercard, Amex, Maestro, UnionPay; Apple Pay, Google Pay, Shop Pay). | Through a payment provider, for example Stripe. |
| MB WAY | Verified with a caveat: available through Shopify Payments in Portugal, but the help page says it is in early access and not available to all merchants. Requires an eligible business type. | Stripe supports it (official pricing page). |
| Multibanco | Verified: requires Shopify Payments; customers have up to 7 days to pay; the customer must check out with an email address. | Stripe supports it (official pricing page). |
| Bank transfer (IBAN) | Verified: manual payment methods, including bank transfer, are supported. The order stays unpaid until the merchant marks it as paid by hand, the payment instructions are shown on the confirmation page, and no third-party transaction fee applies. Reconciliation is manual. | Not designed yet. |
| AT-certified invoices | Verified: InvoiceXpress offers a free Shopify plugin (the service itself is a paid subscription). Moloni lists the e-commerce integration in its Flex and Pro plans. InvoiceXpress describes automatic invoice creation when the order is paid; the Moloni page read describes issuing certified invoices and syncing stock, without stating the payment trigger. | Through the provider's API, built by us. |
| Admin panel, stock and orders | Included with the platform (not researched in detail in this session). | Built by us: catalog, prices, stock, orders, with two-factor for admins. |
| Stock never sold twice | Platform concern (not verified in this session). | Built by us: reservation and atomic updates. |
| Vehicle-specific product choice (racks per van model) | Verified limits: a product can have up to 3 options and up to 2,048 variants, so a product with options such as van model, length and height fits without an app if it needs no more than 3 options. A "choose your van" finder is a different feature and would normally need an app: listings found on the Shopify App Store start at about 5 to 20 USD per month, with one at 250 USD per month and up (listing prices seen through a web search, not read on the listings themselves). Whether the racks need a finder is a product decision. | Fully custom. |
| Checkout customization | Basic plan has basic checkout customization (per the plan page); full checkout customization is listed only for Plus (2,100 EUR per month and up). | Full control. |
| Contact form with bot protection | Not researched. | Planned with Cloudflare Turnstile. |
| GA4 with consent | Not researched. | Planned, built by us. |
| Legal pages, complaints book link | Content is the same in both cases and is handled by the client. | Same. |

## Recurring monthly costs, fixed part

Excludes payment fees (next section), development, and items common to both options (domain, the mailboxes on AWS, cookie consent tool, legal texts).

### Shopify (Verified, official Portuguese pricing page)

| Plan | Monthly billing | Annual billing |
|---|---|---|
| Basic | 27 EUR | 19 EUR per month |
| Grow | 74 EUR | 56 EUR per month |
| Advanced | 384 EUR | 289 EUR per month |
| Plus | from 2,100 EUR | not listed |

Not included and not quantified: paid apps (for example vehicle fitment or translations, if needed), a custom domain purchased through Shopify, and whether the page prices include VAT (not stated in what was read).

### Custom build (Verified)

| Item | Cost | Notes |
|---|---|---|
| Application hosting (Vercel) | 20 USD per month per seat on Pro | The free Hobby plan is restricted to non-commercial personal use. Commercial use is any deployment used for the financial gain of anyone involved in producing it, including a paid developer, or that requests or processes payments (Vercel fair use guidelines). A shop is commercial, so it needs Pro. Pro includes a 20 USD usage credit and 1 TB of data transfer. AWS alternatives are compared in `../decisions/0007-application-hosting.md`: Lightsail costs 5 to 12 USD per month but puts server operations on the owner and client; Amplify is pay as you go but its documented Next.js support stops at version 15, and this project uses 16. |
| Database | Neon: about 6 to 19 USD per month (illustration) or Supabase Pro from 25 USD per month | The Neon range uses the smallest compute, 0.25 CU (verified: 1 GB of RAM, shared compute), at 0.106 USD per compute-unit hour, for 8 to 24 hours of activity per day. Real activity must still be measured. Supabase: 25 USD per organization, or about 10 USD per extra project in an existing organization. See ADR 0006. |
| Transactional email (Resend) | Free: 0 USD, 3,000 emails per month, 100 per day. Pro: 20 USD for 50,000 per month | Login codes, welcome, order and contact emails all count. The 100-per-day limit could block logins on a busy day, which matters because buying requires a code. Pro removes the daily limit. |
| Error monitoring (Sentry) | Developer: 0 USD (1 user, 5,000 errors per month). Team: 26 USD per month billed annually | Free tier is enough to start. |
| Bot protection (Turnstile) | Free: up to 20 widgets, unlimited challenges | Verified on the Cloudflare plans page. |
| Uptime monitoring, backups beyond the database plan | Not researched | |

Hosting on AWS Lightsail (2 GB at 12 USD) instead of Vercel Pro (20 USD) would save about 8 USD per month, at the price of more operations work (see ADR 0007). Fixed-cost range for the custom build, before invoicing and development: about **26 USD** at the low end (Vercel 20 + Neon about 6, free email and monitoring) to about **65 USD** at the high end (Vercel 20 + Supabase 25 + Resend Pro 20). Mixed currencies, not converted.

### Invoicing software, needed in both options

Both options need AT-certified invoicing software. Prices excluding VAT, annual billing where stated.

- **Moloni**: mOn 3.50 EUR, Base 6.49 EUR, Flex 10.90 EUR, Pro 15.90 EUR per month. **API access is only in Flex and Pro**, and the e-commerce integration is listed in Flex and Pro. So the cheap Base plan is not enough for either option. The Shopify integration is a paid app made by Webinfor, with support from Moloni. The page read does not state its price or the plan it needs, so it must be confirmed with the provider.
- **InvoiceXpress**: the plans page lists X3 at 3 EUR for 3 documents, X10 at 7 EUR for 10 documents, X100 at 20 EUR for 100 documents per month, with API access on all plans. The Shopify plugin page lists different plans and prices (XS 6 EUR for 5 documents, S 12 EUR for 20 documents, M 24 EUR for 500 documents) and says the plugin is free. The two official pages disagree, so the exact plan and price must be confirmed with the provider.

Conclusion: invoicing costs about the same in both options, roughly 7 to 11 EUR per month plus VAT for a small volume. It is not a difference between A and B.

### Total fixed monthly cost per option

Sum of the fixed costs above, including the certified invoicing that both options need. Excludes VAT, payment fees, development, and items common to both options. Dollar amounts converted at the European Central Bank reference rate of 2026-10-02 (1 EUR = 1.1225 USD).

| Part | Option B: Shopify (Basic plan) | Option A: custom build |
|---|---|---|
| Platform or infrastructure | 19 EUR per month (annual plan billing) or 27 EUR per month (monthly billing) | 26 to 65 USD per month, about 23 to 58 EUR |
| Certified invoicing | 7 to 11 EUR per month | 7 to 11 EUR per month |
| **Total** | **26 to 30 EUR per month with annual billing; 34 to 38 EUR per month with monthly billing** | **About 30 to 69 EUR per month** |
| Not included | Paid apps if needed (for example a van finder, about 5 to 20 USD per month in the listings seen). Grow plan: 37 EUR more per month (annual) or 47 EUR more (monthly) than Basic. | The low end assumes the free Resend and Sentry plans. Real database cost depends on traffic and must be measured. |

Summary: Shopify Basic costs about 26 to 38 EUR per month and the custom build about 30 to 69 EUR per month. The ranges overlap at the low end of the custom build. At the high end the custom build costs 31 to 43 EUR per month more.

## Payment fees

Fees are charged on every sale, so they scale with volume. Example figures below are for one 100 EUR order.

| Method | Fee | On a 100 EUR order |
|---|---|---|
| Stripe, EEA standard card | 1.5% + 0.25 EUR (Verified) | 1.75 EUR |
| Stripe, EEA premium card | 2.8% + 0.25 EUR (Verified) | 3.05 EUR |
| Stripe, MB WAY | 1.5% + 0.25 EUR (Verified) | 1.75 EUR |
| Stripe, Multibanco | 2.95% + 0.25 EUR (Verified) | 3.20 EUR |
| Stripe, dispute | 20 EUR per dispute (Verified) | |
| Shopify Payments, card, Basic plan | 1.8% + 0.30 EUR (Verified, official Portuguese pricing page; Grow 1.6% + 0.30, Advanced 1.5% + 0.30) | 2.10 EUR |
| Shopify Payments, MB WAY | 1.3% + 0.30 EUR on Basic, down to 1% + 0.30 EUR on Plus (Verified, official Portuguese pricing page, read 2026-10-06) | 1.60 EUR on Basic |
| Shopify Payments, Multibanco | Not listed on the official Portuguese pricing page read. Not verified. | |
| Shopify Payments, international card | 2.55% to 3% + 0 EUR depending on the plan (Verified) | |
| Shopify Payments, American Express | 3% + 0.30 EUR on Basic, 2.9% Grow, 2.7% Advanced, 2.55% Plus (Verified) | 3.30 EUR on Basic |
| Shopify with a third-party gateway such as Stripe | Verified on the Shopify pricing page (European version): Shopify adds a transaction fee on top of the gateway fee, 2% on Basic, 1% on Grow and 0.6% on Advanced. The Portuguese page, read again on 2026-10-09, shows the same and 0.2% on Plus. Shopify Payments, Shop Pay and PayPal Express are not charged this fee. | 3.75 EUR for a standard EEA card on Basic (Stripe 1.75 plus 2.00) |
| Stripe, international card | 3.15% + 0.25 EUR, plus 2% if currency conversion is needed (Verified) | |

Notes:

- A secondary source quoted 1.9% + 0.25 EUR for Basic. The official Shopify pricing page shows 1.8% + 0.30 EUR, which is used above.
- For a standard EEA card, Shopify Payments on Basic costs 0.3% of the amount plus 0.05 EUR more than Stripe. On a 100 EUR order that is 0.35 EUR, and on a 300 EUR order 0.95 EUR. For a premium EEA card the order reverses: Shopify's flat 1.8% is cheaper than Stripe's 2.8%. The real difference therefore depends on the mix of cards customers use. For MB WAY, Shopify Basic (1.60 EUR per 100 EUR) is slightly cheaper than Stripe (1.75 EUR).
- Shopify's third-party fee only matters if the client insists on using Stripe inside Shopify. Using Shopify Payments avoids it, but MB WAY is in early access and the Multibanco rate is not confirmed.
- The earlier "0.7% + 0.07 EUR for MB WAY" figure attributed to Shopify was wrong: it is the published ifthenpay rate (see below). It has been removed from the Shopify rows.

### Other providers for the custom build (read 2026-10-06)

Only the custom build can choose its payment provider freely. Shopify Payments is required for MB WAY and Multibanco on Shopify. Per 100 EUR order, standard EEA consumer card:

| Provider | Card | MB WAY | Multibanco | Status |
|---|---|---|---|---|
| Stripe | 1.5% + 0.25 = 1.75 EUR | 1.5% + 0.25 = 1.75 EUR | 2.95% + 0.25 = 3.20 EUR | Verified |
| Mollie | 1.8% + 0.25 = 2.05 EUR (commercial and American Express 2.9% + 0.25) | 1.5% + 0.25 = 1.75 EUR | 2.1% + 0.35 = 2.45 EUR | Verified, official pricing page |
| ifthenpay | 1.5% + 0.20 = 1.70 EUR (consumer, EEA) | 0.7% + 0.07 = 0.77 EUR | 1.5% + 0.20 = 1.70 EUR | Verified, official site. No monthly fee, minimum or lock-in |

Findings and cautions:

- Multibanco and MB WAY are where the providers differ most. ifthenpay is the cheapest of the three on those two methods, roughly half of Stripe's MB WAY cost and about half of its Multibanco cost. On standard cards the three are within 0.35 EUR of each other.
- ifthenpay publishes an API for cards (hosted secure payment page), MB WAY and Multibanco, so card data would not pass through our server. Its callback guide (https://www.ifthenpay.com/docs/en/guides/callback/, read 2026-10-06) describes the success callback as an HTTP GET to our server, authenticated only by an "anti-phishing key" (up to 50 characters, chosen by the merchant) sent as a plain query parameter. No signature, HMAC or IP allowlist is mentioned, and the guide does not recommend checking the amount. Callbacks are retried up to 13 times (8 at 5-minute intervals, then hourly) and may arrive more than once, so processing must be idempotent. This does not meet the signed-webhook rule in `AGENTS.md` as it stands: a shared secret in a URL can leak through logs and proxies, and a leaked key lets anyone forge a "paid" notification. Stripe, by contrast, signs its webhooks. Possible mitigation, not verified: after each callback, confirm the payment with ifthenpay through a server-to-server API call before marking the order paid. Whether such an endpoint exists was not found. This needs a written answer from ifthenpay or a decision recorded in an ADR as an accepted deviation. No Node.js SDK was found (PHP and a browser-focused JavaScript SDK only), so integration would be written against the REST API.
- ifthenpay's card rate is stated for consumer EEA cards. Rates for commercial, American Express and international cards were not seen.
- Reliability evidence is limited. Portal da Queixa (consumer complaints site, read 2026-10-06) shows a 91/100 satisfaction index and a 100% resolution rate, with complaints mostly about unrecognised debits that ifthenpay says come from its merchants' customers' payments. Trustpilot shows 3.5 out of 5 from only 9 reviews (search summary, not read directly). A third-party page claims over 20 years of activity and about 2 billion EUR processed per year (Secondary, unverified). These measure consumer-side complaints, not uptime or merchant-side incident history, which were not found.
- Eupago and Easypay were also found through a web search summary reporting similar rates (Eupago: 0.7% + 0.07 EUR MB WAY, 1.5% + 0.20 EUR cards; Easypay: 1.5% + 0.25 EUR cards). Their official pricing pages could not be read, so these are Secondary and not used. SIBS Pay and Viva Wallet were not researched at the source.
- Using a different provider per method (for example Stripe for cards, ifthenpay for MB WAY and Multibanco) is possible but adds two integrations, two sets of webhooks and two reconciliation reports. That cost is not priced here.

## What Shopify saves in fixed infrastructure, and what it does not

In the custom build the client pays separately for application hosting, the database, email and monitoring. On Shopify these are part of the plan.

- Verified infrastructure that Shopify replaces: hosting (Vercel Pro 20 USD), database (about 6 to 25 USD), email beyond the free tier (0 to 20 USD), monitoring (0 to 26 USD). Roughly **26 to 65 USD per month** in the range above.
- Verified Shopify fixed cost that replaces it: **19 to 27 EUR** on Basic, or 56 to 74 EUR on Grow, before any paid apps.
- So on fixed monthly cost alone, Shopify Basic is at most a few tens of euros per month cheaper than the custom build, and possibly close to equal. It is not a large recurring saving for this size of shop.
- The largest financial differences are elsewhere: the one-off development fee and the ongoing maintenance effort (security updates, dependency upgrades, incident response, fixing bugs in payments and stock), which Shopify absorbs and the custom build does not. Those figures are not in this document: the development fee is the owner's quote, and maintenance needs an hours estimate.

## Non-financial factors

| Factor | Shopify | Custom build |
|---|---|---|
| Time to launch | Shorter: admin, checkout, accounts and stock exist | Longer: everything above is built and tested |
| Experience and brand control | Limited by the theme and the plan (full checkout customization only on Plus) | Complete |
| Responsibility for security, updates, uptime | Mostly the platform | The client and the developer |
| Vendor dependency | High: data, themes and apps live on the platform | Low: standard PostgreSQL and open tools |
| Fit with unusual requirements (van-specific fitment, account required to buy) | Must be checked (see unknowns) | Fits, at development cost |
| Ongoing cost growth | Plan tier and per-sale fees grow with the business | Mostly fixed infrastructure cost plus provider fees |
| Professional value to the developer | Low | High |

The last row is a real factor for the owner and should be stated openly to the client.

## Option C: our own frontend with Shopify as the commerce backend (headless), researched 2026-10-09

Raised by the owner after a brainstorming session on supplier orders. The whole site (landing page, catalogue, product pages, cart) stays a Next.js application built with the design system of spec 003, and reads products and manages the cart through Shopify's Storefront API (GraphQL). Shopify holds the catalogue, stock, orders, customer accounts, checkout and payments. This replaces the planned database, authentication and payment integration of Option A; it does not replace the frontend or its hosting.

### What Shopify charges for this

| Item | Finding | Status |
|---|---|---|
| An "API only" plan | None found. The Storefront API is used from a store on a normal plan. | Verified by absence on the pricing page |
| Starter plan | "The Starter plan isn't available to new stores." So it is not a cheaper entry point. | Verified, Shopify help |
| Minimum plan | Basic: 27 EUR per month, or 19 EUR per month billed annually. The plan table lists "create headless storefronts": 1 on Basic, Grow and Advanced, 25 on Plus. | Verified, Portuguese pricing page |
| Headless channel (the app that issues the Storefront API and Customer Account API tokens) | Free. Made by Shopify. | Verified, App Store listing |
| Storefront API usage | No usage fee is stated on any page read. Requests from real buyers have no fixed per-minute limit; bots are limited; checkout creation is throttled per minute. The limits section does not mention plans. | Verified for limits. "No fee" is by absence, not a statement |
| Payment fees | The same as Option B, by plan (Basic: 1.8% + 0.30 EUR for standard online cards, MB WAY 1.3% + 0.30 EUR). | Verified earlier in this document |
| Third-party gateway fee | 2% on Basic, 1% on Grow, 0.6% on Advanced, 0.2% on Plus. The Portuguese page read today shows the same figures as the European page, which closes the difference noted in the fees table above. | Verified |
| VAT on the subscription | Still not stated. The "VAT" row of the plan table is a tax feature for the shop's sales, not a statement about Shopify's own price. | Not verified |

So the answer to "what do we pay Shopify to use only the API" is: the same subscription and the same payment fees as a normal Shopify store, from 19 to 27 EUR per month on Basic. The API and the Headless channel add nothing to that.

### What stays ours, and what it costs

- The Next.js frontend and its hosting stay. Vercel Pro (20 USD per month) is still needed (ADR 0007). Shopify's own hosting, Oxygen, is described on the Headless listing together with Hydrogen, Shopify's framework; whether it can host a Next.js application was not researched and it is not counted.
- No database of our own for the shop: products, stock, orders and customers live in Shopify. ADR 0002 and ADR 0006 would apply only if something else needs a database.
- Email: login codes and order emails are sent by Shopify. Resend would be needed only for the contact form, inside the free plan, and the 100-per-day risk for login codes disappears.
- Certified invoicing: needed as in A and B. The InvoiceXpress and Moloni integrations act on Shopify orders; that they work the same when the order comes from a headless storefront was not verified.

Fixed monthly cost, same method as the totals table above (1 EUR = 1.1225 USD, VAT excluded):

| Part | Option C |
|---|---|
| Shopify Basic | 19 EUR (annual billing) or 27 EUR (monthly billing) |
| Frontend hosting (Vercel Pro, 20 USD) | about 18 EUR |
| Certified invoicing | 7 to 11 EUR |
| **Total** | **about 44 to 56 EUR per month** |

Option C costs more per month than Option B (26 to 38 EUR), because the frontend hosting is added to the Shopify plan, and sits inside the range of Option A (30 to 69 EUR). What it saves compared with A is development and maintenance of the stock, order, payment, account and admin code, which this document does not price.

### The checkout is not ours

- The cart's `checkoutUrl` sends the buyer to "Shopify's web checkout". The checkout pages are Shopify's, not Next.js pages. (Verified, Storefront API reference.)
- Below Plus, checkout styling is a logo, a colour palette and fonts chosen "from a list". Advanced branding (the Checkout Branding API) is for Plus, from 2,100 EUR per month. (Verified, Shopify help.) The design system's components and its display typeface therefore stop at the cart. Whether the preset list contains Geist or Barlow Condensed was not checked.
- Customer accounts: the Customer Account API uses a "hosted customer authentication system" with passwordless login and single sign-on across custom storefronts, accounts and checkout. The sign-in screen is Shopify's. Our pages can read the customer's orders through the API. (Verified, shopify.dev. The login flow details and any plan requirement were not on the page.)
- The domain the checkout and sign-in pages are served from was not found in the pages read. Not verified.

So "the whole site with our design system" is true for the landing page, catalogue, product pages and cart, and not for sign-in and checkout unless the client pays for Plus.

### Does it solve the supplier problem? Not by itself

The problem: some suppliers say they cannot ship to the end customer, only to LockMX.

- Direct shipping is an agreement with each supplier. No platform, and no API, makes a supplier ship to an address it has refused.
- The mechanism the owner described (supplier ships, supplier is paid automatically, the margin stays with LockMX) is Shopify Collective. It is free ("No setup fees"), and with automatic payments the product cost and shipping are debited from the retailer's Shopify Payments balance and paid to the supplier when it marks the order fulfilled, with "no extra charges". (Verified, Shopify help and App Store listing.)
- Collective connects two Shopify stores. Requirements read today, the same for retailer and supplier: an active Shopify plan; Shopify Payments set up with active payouts; a supported country (Portugal is listed) and currency (EUR is listed); the retailer and the supplier in the same country and using the same currency; Shopify Tax, Basic Tax or a tax app, not manual tax; a verified VAT number; Shopify Network Intelligence activated; possibly identity verification. (Verified.)
- Consequences for LockMX: it helps only with a supplier that has its own Shopify store, has joined Collective, is established in Portugal and sells in EUR. A supplier without Shopify, or in Spain or Germany, cannot be connected this way. Collective also needs Shopify Payments, so a cheaper Portuguese provider such as ifthenpay is out, and MB WAY on Shopify Payments is still "in early access, and isn't available to all eligible merchants" (read again today).
- Collective products in a headless storefront, researched further on 2026-10-09 after the owner reported that one supplier of the client has a Shopify store and proposed this model:
  - An imported product is a product of the retailer's own store. The retailer can change its price, title, description and media; variants cannot be edited and inventory is read-only, always synced from the supplier. (Shopify help, importing and product policy pages; the "managing products" page was read through a search summary only.)
  - The product policy decides where imported products are published: "All channels" (the default), "Specific channels" or "Don't publish". A product is sellable when it is Active and published to a sales channel. (Verified, product policy page.)
  - The Storefront API shows what is published to the channel that owns its token, and Headless is a sales channel. No page read excludes it, and none names it. So Collective products appearing in our own frontend is the expected behaviour by this mechanism, **not a statement by Shopify**. Status: inferred, to be confirmed in a test.
  - Orders: the buyer pays in Shopify's checkout, which is the same checkout for a headless cart. "Orders are created on supplier stores when they're marked as Paid", after a two-minute hold. The page does not restrict where the order comes from. A channel that does not capture payment until fulfilment needs a manual fulfilment request. (Verified.)
  - Limits found: the supplier controls stock and variants; a product is limited to 100 variants (search summary); Collective is incompatible with Managed Markets, pickup in store and metafields; a refund to the customer means cancelling the order in our admin, and the supplier may refuse a cancellation it has already processed; uninstalling the app sets the imported products' inventory to 0.
  - Shipping: by default the checkout shows the supplier's rates. A cart that mixes our products and the supplier's shows one combined rate, or one rate per shipment with split shipping turned on. (Verified, shipping page.)
  - Tax: the retailer charges tax to the customer at its checkout. The supplier can collect B2B tax from the retailer, by default calculated on the cost price. Who issues which invoice is not stated. For Portugal this needs the accountant: LockMX sells to the customer and must issue the certified invoice; the supplier's sale to LockMX is a separate document.
  - How to confirm: Shopify's testing page says to connect with another store (one you own, or one on a free trial) and place an end-to-end order, which is "a real transaction using Shopify Payments". The cheapest proof is a trial store with the Headless channel, the client's supplier connected, one imported product read through the Storefront API and one real order.

### One shop or two

The client's main product is the racks; the supplier products are extras, and the idea is that the extras pay for the Shopify subscription. That does not make Shopify an add-on beside a custom shop:

- A cart and a checkout belong to one system. If the racks are sold through our own database and payment provider (Option A) and the extras through Shopify, a customer who wants both pays twice, in two checkouts, with two accounts, two order histories and two invoicing integrations. Two shops are built and maintained.
- If Shopify is used for the extras, the racks should be Shopify products too. Then there is one cart, one checkout, one account and one invoicing integration, and that is Option C in full: the custom database, authentication, payment and admin work of Option A is not built.
- The racks would then pay Shopify Payments rates instead of the rates of a provider chosen freely (see the fees tables), and the points open for Option B apply to the main product: MB WAY in early access, the Multibanco rate, and whether the racks need more than 3 options or a fitment finder.
- Other suppliers do not condition this. A supplier without Shopify is handled as in any shop: its products are created by hand as LockMX products and shipped by LockMX, or by the supplier under a private agreement. Collective is used only where it exists.

### Not researched for Option C

- Languages through the Storefront API (how PT and EN product texts are requested).
- Whether "require sign-in before checkout" behaves the same from a headless cart.
- The fitment finder: with our own frontend it would be our code reading Shopify data, not an app.
- Lock-in: the frontend is ours, but catalogue, orders and customers are on Shopify. Leaving means migrating that data and building what Option A plans.

### What decides it

1. For each supplier that matters: country, whether it has a Shopify store, whether it is in Collective, and whether its refusal to ship to customers is commercial policy or a missing process. Without this, Collective cannot be counted as a benefit.
2. A test in a trial store: a Collective product of the client's supplier read through the Storefront API, and one real order through the checkout.
3. Whether the client accepts selling the racks through Shopify as well (see "One shop or two").
4. Whether a Shopify-styled sign-in and checkout is acceptable to the client.
5. The points already open for Option B: MB WAY availability for this merchant and the Multibanco rate.

## Research results since the first version (2026-10-02)

1. **Account required to buy:** possible on Shopify, with the side effects listed in the coverage table. The plan dependency is not stated.
2. **MB WAY and Multibanco:** MB WAY is in early access and needs an eligible business type (official help page). The Shopify rates for both are not on the official pages read. Multibanco gives customers up to 7 days to pay.
3. **Vehicle-specific choice:** product limits and app price ranges are in the coverage table. Whether a finder is needed is a product decision.
4. **Third-party gateway fee:** now verified (2%, 1% and 0.6% by plan, 0.2% on Plus; the Portuguese and European pages agree as of 2026-10-09).
5. **Bank transfer:** supported as a manual payment method, with manual reconciliation.
6. **VAT on Shopify prices:** the pricing page does not say. Confirm during the trial.
7. **Invoicing plans:** the exact InvoiceXpress plan and price, and the Moloni plan and Webinfor app price, are still to be confirmed with the providers.
8. **Neon smallest compute:** verified as 0.25 CU, which confirms the illustration. Real traffic is still to be measured.

## Still open (to close before deciding)

For the client and owner:

- Expected order volume and average order value. Fees scale with them, and so does the choice between plans.
- The owner's development fee and the maintenance estimate for the custom build.
- Does the racks product need a "choose your van" finder, or are variants enough?

To confirm in a Shopify trial account or with the providers:

- The Shopify Payments rate for Multibanco, and whether MB WAY is available to this merchant.
- For ifthenpay (or another provider): whether a server-to-server payment status check exists to compensate for the unsigned callback, Banco de Portugal authorisation (a third-party page states licence 8707, not confirmed at the register, which returned an error), rates for commercial, American Express and international cards, and contract terms. Eupago, Easypay and SIBS Pay from their official pages.
- Whether the sign-in requirement depends on the plan.
- VAT on the Shopify subscription.
- The invoicing plan and price (InvoiceXpress, or Moloni with the Webinfor app).
- Measured Neon cost for this workload, if the custom build goes ahead.

## Outcome

Decided on 2026-10-09, after a meeting with the client: Option C. Recorded in `../decisions/0014-shopify-headless-commerce.md`, with the points still to verify.

## Next step (as written before the decision)

Take this document to the client. Once the open points that matter to them are answered (mainly volume, the development fee, the finder and the MB WAY availability), record the outcome as an ADR. If the decision is Shopify (Option B), the current ADRs 0001 to 0006 and spec 001 are superseded. If it is Option C, the frontend work (specs 001 to 003 and the landing page) stands and ADRs 0002, 0003, 0005 and 0006 are revisited. If it stays custom, the work continues as documented.

## Sources

- Shopify pricing (Portugal): https://www.shopify.com/pt/precos (read again 2026-10-09 for the headless storefront row and the third-party fees)
- Option C, read 2026-10-09: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api, https://shopify.dev/docs/storefronts/headless/bring-your-own-stack, https://shopify.dev/docs/api/storefront#rate-limits, https://shopify.dev/docs/api/usage/limits, https://shopify.dev/docs/api/storefront/latest/objects/Cart, https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api, https://apps.shopify.com/headless, https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/shopify-starter-plan, https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/checkout-style
- Shopify Collective, read 2026-10-09: https://apps.shopify.com/collective, https://help.shopify.com/en/manual/online-sales-channels/shopify-collective/retailers/requirements-and-considerations, https://help.shopify.com/en/manual/online-sales-channels/shopify-collective/suppliers/requirements-and-considerations, https://help.shopify.com/en/manual/online-sales-channels/shopify-collective/retailers/payments, https://help.shopify.com/en/manual/online-sales-channels/shopify-collective/retailers/importing-products, https://help.shopify.com/en/manual/online-sales-channels/shopify-collective/retailers/policies/products, https://help.shopify.com/en/manual/online-sales-channels/shopify-collective/retailers/shipping, https://help.shopify.com/en/manual/online-sales-channels/shopify-collective/retailers/managing-collective-orders, https://help.shopify.com/en/manual/online-sales-channels/shopify-collective/retailers/taxes, https://help.shopify.com/en/manual/online-sales-channels/shopify-collective/testing
- Shopify Payments methods in Portugal: https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries/portugal/payment-methods
- Shopify pricing (European version, third-party fee and card rates): https://www.shopify.com/pricing
- Shopify checkout sign-in requirement: https://help.shopify.com/en/manual/checkout-settings/checkout-form-options
- Shopify manual payments: https://help.shopify.com/en/manual/payments/manual-payments
- Shopify variants: https://help.shopify.com/en/manual/products/variants/add-variants
- Neon compute sizes: https://neon.com/docs/manage/computes
- Moloni Shopify integration: https://www.moloni.pt/plugins/shopify/
- InvoiceXpress Shopify plugin article: https://invoicexpress.com/blog/vender-faturar-online-plugin-integracao-shopify/
- Shopify fitment apps (App Store listings seen through a web search): https://apps.shopify.com/make-model-year and https://apps.shopify.com/year-make-model-fitment-search
- Shopify MB WAY: https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods/mb-way
- Shopify Multibanco: https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods/multibanco
- Shopify new customer accounts: https://help.shopify.com/en/manual/customers/customer-accounts/new-customer-accounts
- Shopify languages: https://help.shopify.com/en/manual/international/languages
- Stripe Portugal pricing: https://stripe.com/pt/pricing, https://stripe.com/en-pt/pricing and https://stripe.com/pt-pt/pricing/local-payment-methods
- Mollie pricing: https://www.mollie.com/pricing
- ifthenpay pricing and API documentation: https://ifthenpay.com/, https://ifthenpay.com/docs/en/ and https://www.ifthenpay.com/docs/en/guides/callback/
- ifthenpay complaints: https://portaldaqueixa.com/brands/ifthenpay
- Vercel pricing: https://vercel.com/pricing
- Resend pricing: https://resend.com/pricing
- Sentry pricing: https://sentry.io/pricing/
- Cloudflare Turnstile plans: https://developers.cloudflare.com/turnstile/plans/
- Moloni plans: https://www.moloni.pt/planos/
- InvoiceXpress plans: https://invoicexpress.com/planos-precos/ and Shopify plugin: https://plugins.invoicexpress.com/shopify/
- Supabase and Neon: see `../decisions/0006-database-provider.md`.
- European Central Bank euro reference rate (USD), 2026-10-02: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html
- Secondary, not official: Eupago and Easypay rates from a web search summary (not used), and the 1.9% + 0.25 EUR card rate quoted by a comparison article (contradicted by the official page).
