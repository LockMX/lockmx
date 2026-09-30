# Build from scratch versus Shopify

Prepared to support a decision with the client. All figures come from the official pages consulted on 2026-09-30 unless marked otherwise. Nothing here is a recommendation to choose one side: it lists what each option costs and covers, and what is still unknown.

How to read it:

- **Verified**: seen on an official page during this research.
- **Secondary**: from a blog or comparison site. Treat as indicative only.
- **Not verified**: not found, or not researched. Must be confirmed before the client commits.
- Prices are in the currency of the source page (EUR for Shopify, Moloni and InvoiceXpress; USD for Vercel, Resend, Sentry, Supabase, Neon). They are not converted. Whether VAT is included is stated only where the source says so.

## Objective

Give the client a factual comparison between:

- **Option A, custom build**: a Next.js application with its own database, payments, emails and admin panel, as currently documented in `docs/decisions/`.
- **Option B, Shopify**: a hosted Shopify store with themes, apps and the certified invoicing integration.

## The requirements being compared

From `project-brief.md`: small catalog (a few tyres and the flagship racks for vans), customer accounts required to buy, passwordless sign-in by emailed code, PT-PT and EN, MB WAY, Multibanco, cards and possibly bank transfer, invoices from AT-certified software, an admin panel for the client, contact form, legal pages, GA4 after consent, and no marketing emails at launch.

## Coverage by requirement

| Requirement | Shopify | Custom build |
|---|---|---|
| Customer accounts, passwordless by email code | Verified: new customer accounts sign in with an email address and a one-time 6-digit code, with no password. Whether an account can be required to buy: not verified. | Planned (ADR 0003, Better Auth email codes). Account required to buy: decided. |
| PT-PT and EN | Verified: up to 20 languages on Basic, Grow and Advanced. Price of the translation tool (Translate & Adapt) not verified; CSV import is free. | Planned, built by us (messages, routes, emails). |
| Card payments | Verified: Shopify Payments is available in Portugal (Visa, Mastercard, Amex, Maestro, UnionPay; Apple Pay, Google Pay, Shop Pay). | Through a payment provider, for example Stripe. |
| MB WAY | Verified with a caveat: available through Shopify Payments in Portugal, but the help page says it is in early access and not available to all merchants. Requires an eligible business type. | Stripe supports it (official pricing page). |
| Multibanco | Verified: requires Shopify Payments; customers have up to 7 days to pay; the customer must check out with an email address. | Stripe supports it (official pricing page). |
| Bank transfer (IBAN) | Not verified. | Not designed yet. |
| AT-certified invoices | Verified: InvoiceXpress offers a free Shopify plugin (the service itself is a paid subscription). Moloni lists the e-commerce integration in its Flex and Pro plans. Both issue the invoice automatically when the order is paid (per their own pages). | Through the provider's API, built by us. |
| Admin panel, stock and orders | Included with the platform (not researched in detail in this session). | Built by us: catalog, prices, stock, orders, with two-factor for admins. |
| Stock never sold twice | Platform concern (not verified in this session). | Built by us: reservation and atomic updates. |
| Vehicle-specific product choice (racks per van model) | Not verified. May be solvable with variants, or may need an app. | Fully custom. |
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
| Application hosting (Vercel) | 20 USD per month per seat on Pro | The free Hobby plan is "for personal, non-commercial use", so a shop needs Pro. Pro includes a 20 USD usage credit and 1 TB of data transfer. |
| Database | Neon: about 6 to 19 USD per month (illustration) or Supabase Pro from 25 USD per month | The Neon range uses an assumed smallest compute of 0.25 CU (not verified) and 8 to 24 hours of activity per day. Real cost must be measured. Supabase: 25 USD per organization, or about 10 USD per extra project in an existing organization. See ADR 0006. |
| Transactional email (Resend) | Free: 0 USD, 3,000 emails per month, 100 per day. Pro: 20 USD for 50,000 per month | Login codes, welcome, order and contact emails all count. The 100-per-day limit could block logins on a busy day, which matters because buying requires a code. Pro removes the daily limit. |
| Error monitoring (Sentry) | Developer: 0 USD (1 user, 5,000 errors per month). Team: 26 USD per month billed annually | Free tier is enough to start. |
| Bot protection (Turnstile) | Free: up to 20 widgets, unlimited challenges | Verified on the Cloudflare plans page. |
| Uptime monitoring, backups beyond the database plan | Not researched | |

Fixed-cost range for the custom build, before invoicing and development: about **26 USD** at the low end (Vercel 20 + Neon about 6, free email and monitoring) to about **65 USD** at the high end (Vercel 20 + Supabase 25 + Resend Pro 20). Mixed currencies, not converted.

### Invoicing software, needed in both options

Both options need AT-certified invoicing software. Prices excluding VAT, annual billing where stated.

- **Moloni**: mOn 3.50 EUR, Base 6.49 EUR, Flex 10.90 EUR, Pro 15.90 EUR per month. **API access is only in Flex and Pro**, and the e-commerce integration is listed in Flex and Pro. So the cheap Base plan is not enough for either option.
- **InvoiceXpress**: the plans page lists X3 at 3 EUR for 3 documents, X10 at 7 EUR for 10 documents, X100 at 20 EUR for 100 documents per month, with API access on all plans. The Shopify plugin page lists different plans and prices (XS 6 EUR for 5 documents, S 12 EUR for 20 documents, M 24 EUR for 500 documents) and says the plugin is free. The two official pages disagree, so the exact plan and price must be confirmed with the provider.

Conclusion: invoicing costs about the same in both options, roughly 7 to 11 EUR per month plus VAT for a small volume. It is not a difference between A and B.

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
| Shopify Payments, MB WAY and Multibanco | Not found on the official pages read | Not verified |
| Shopify with a third-party gateway such as Stripe | Shopify adds a transaction fee on top of the gateway fee: 2% Basic, 1% Grow, 0.6% Advanced (Secondary, not confirmed on an official page) | About 3.75 EUR for a standard card |

Notes:

- A secondary source quotes different Shopify Payments rates for Europe (1.9% + 0.25 EUR on Basic). The official Portuguese pricing page figure is used above. Confirm in the Shopify account.
- For a card payment, Shopify Payments on Basic costs 0.3% of the amount plus 0.05 EUR more than Stripe on the custom build. On a 100 EUR order that is 0.35 EUR, and on a 300 EUR order 0.95 EUR. So payment fees are a small difference, not the main one. The figure changes if the custom build uses a different provider, which was not compared.
- Shopify's third-party fee only matters if the client insists on using Stripe inside Shopify. Using Shopify Payments avoids it, but MB WAY availability is uncertain (early access).

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

## What is still unknown (to close before deciding)

1. Can Shopify require an account before buying, and is the code login available on the chosen plan?
2. MB WAY: is it available to this merchant, or only in early access? What are the Shopify Payments rates for MB WAY and Multibanco?
3. Does the vehicle-specific choice of racks work with variants, or does it need a paid app, and at what monthly price?
4. Shopify transaction fee when using Stripe, confirmed on an official page.
5. Is bank transfer (IBAN) supported on Shopify, and how is it reconciled?
6. Shopify prices: are they with or without VAT?
7. InvoiceXpress plan and price (the two official pages disagree), and the Moloni plan needed.
8. Expected order volume and average order value. Fees scale with them, and so does the choice between plans.
9. The owner's development fee and the maintenance estimate for the custom build.
10. The estimated Neon monthly cost for this workload, measured.

## Next step

Take this document to the client. Once the unknowns that matter to them are answered (mainly 1, 2, 3, 8 and 9), record the outcome as an ADR. If the decision is Shopify, the current ADRs 0001 to 0006 and spec 001 are superseded. If it stays custom, the work continues as documented.

## Sources

- Shopify pricing (Portugal): https://www.shopify.com/pt/precos
- Shopify Payments methods in Portugal: https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries/portugal/payment-methods
- Shopify MB WAY: https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods/mb-way
- Shopify Multibanco: https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods/multibanco
- Shopify new customer accounts: https://help.shopify.com/en/manual/customers/customer-accounts/new-customer-accounts
- Shopify languages: https://help.shopify.com/en/manual/international/languages
- Stripe Portugal pricing: https://stripe.com/pt/pricing and https://stripe.com/pt-pt/pricing/local-payment-methods
- Vercel pricing: https://vercel.com/pricing
- Resend pricing: https://resend.com/pricing
- Sentry pricing: https://sentry.io/pricing/
- Cloudflare Turnstile plans: https://developers.cloudflare.com/turnstile/plans/
- Moloni plans: https://www.moloni.pt/planos/
- InvoiceXpress plans: https://invoicexpress.com/planos-precos/ and Shopify plugin: https://plugins.invoicexpress.com/shopify/
- Supabase and Neon: see `../decisions/0006-database-provider.md`.
- Secondary, not official: Shopify third-party gateway fees and Europe card rates, from comparison articles returned by a web search (for example https://trueprofit.io/blog/shopify-payment-fees).
