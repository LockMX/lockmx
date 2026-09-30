# Project brief

Consolidates the requirements gathered so far (initial brainstorming and the owner's answers). Items marked "to verify" come from unverified secondary sources and must be confirmed at the official source before they drive a decision.

## Objective

Build the online store of LockMX, a motocross products business. The client's reference site is linoswarehouse.pt.

Catalog at launch: a few tyres and the flagship product, racks for carrying equipment (helmets, clothing) inside closed vans such as the Mercedes Sprinter. The catalog is small.

The owner is the only developer. The project is a real commercial delivery for a client.

## Functional requirements

- Landing page and institutional content.
- Product catalog with product search.
- Shopping cart.
- Customer area (account, orders, invoices). Passwordless: registration and login with name and email plus a one-time code sent by email (see `customer-accounts-and-consent.md`).
- Buying requires an account (no guest checkout). This way the customer can always access the information about their orders (items, prices, quantities, shipping costs), change the delivery address and change the invoicing data. A first-time buyer registers inside the checkout with the emailed code.
- Landing page contact form, protected with Cloudflare Turnstile and rate limits (no double opt-in). The sender gets a confirmation email and the client gets a notification email.
- No marketing emails at launch. A welcome email is sent once, after the registration code is confirmed, and it stays strictly transactional.
- Admin panel for the client to manage the catalog: add, remove and edit products, prices and stock, and manage orders. Protected by a role check on the server, not by shared credentials.
- Languages: PT-PT and EN from the start.
- Payment methods requested: MB WAY, Multibanco (entity and reference), bank card, bank transfer (IBAN) and possibly Stripe.
- Invoicing through software certified by the Portuguese tax authority (AT), with an API, issuing the invoice when the payment is confirmed.
- Legal pages: privacy policy, cookie policy, terms and conditions, and the electronic complaints book.
- Transactional emails from the client's own domain (`@lockmx.com`, being created), sent through Resend, with PT-PT and EN templates for each moment (welcome, registration, login code, order confirmation, and so on).
- Analytics: Google Analytics 4 only, loaded after cookie consent.

## Non-functional requirements

- Security as a priority: personal data and payments are involved.
- Idempotency for payments and order creation.
- The same item must never be sold twice (stock reservation and concurrency control).
- Full observability: error tracking, structured logs, uptime monitoring, backups and an audit trail for orders, stock and price changes.
- The client owns or can take over every account (repository, hosting, database, domain, payment provider, invoicing).

## Business rules already discussed

- Consumer withdrawal right (14 days, Decree-Law 24/2014) applies to pre-fabricated goods. The exception for goods made to the consumer's specification depends on how each product is actually produced (stock versus made to order). Model this per product and have the legal text reviewed by a lawyer. To verify at the official source.
- Shipping cost must be visible before checkout. Zones and costs are still to be discussed with the client. Tyres and racks may need different shipping profiles.

## Constraints and status

- Legal texts (privacy, cookies, terms) and their legal review are handled by the client.

- Brand identity exists; the files are pending from the client. The design system is built around it, with Claude Design.
- Emails: the `@lockmx.com` mailboxes are being created on AWS. Sending domain for the shop: `@lockmx.com`, validated in Resend by the owner afterwards.
- Costs of third-party services (email, bot protection, database, hosting) are paid by the client.
- Shipping: not yet discussed with the client.
- Stack decided so far: Next.js, pnpm monorepo, a single web app with the backend inside Next.js, Drizzle (PostgreSQL). See `AGENTS.md`.

## Open questions

- Payment provider: does a single provider cover MB WAY, Multibanco and cards? Verify and compare fees at the official sources.
- Invoicing provider: compare the certified options and their APIs at the official sources.
- Authentication: proposed in ADR 0003 (Better Auth, passwordless customers, strong second method for admins).
- Delivery fallback for the code, and DNS records for a domain shared by mailboxes and Resend: see `customer-accounts-and-consent.md`.
- Database provider and hosting.
- Cookie consent management: a paid platform or a self-built solution.
- Image storage for product photos.
- Shipping zones, costs and carriers.

## Outcome

Feeds the ADRs in `docs/decisions/` and the first spec, `docs/specs/001-technical-foundation.md`.
