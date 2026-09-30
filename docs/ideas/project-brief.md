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
- Customer area (account, orders, invoices).
- Admin panel for the client to manage the catalog: add, remove and edit products, prices and stock, and manage orders. Protected by a role check on the server, not by shared credentials.
- Languages: PT-PT and EN from the start.
- Payment methods requested: MB WAY, Multibanco (entity and reference), bank card, bank transfer (IBAN) and possibly Stripe.
- Invoicing through software certified by the Portuguese tax authority (AT), with an API, issuing the invoice when the payment is confirmed.
- Legal pages: privacy policy, cookie policy, terms and conditions, and the electronic complaints book.
- Transactional emails from the client's own domain (`@lockmx.com`, being created).
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

- Brand identity exists; the files are pending from the client. The design system is built around it, with Claude Design.
- Emails: the `@lockmx.com` mailboxes are being created.
- Shipping: not yet discussed with the client.
- Stack decided so far: Next.js, pnpm monorepo, a single web app with the backend inside Next.js, Drizzle (PostgreSQL). See `AGENTS.md`.

## Open questions

- Is an account required to buy, or is guest checkout allowed? Affects the order model and the checkout.
- Payment provider: does a single provider cover MB WAY, Multibanco and cards? Verify and compare fees at the official sources.
- Invoicing provider: compare the certified options and their APIs at the official sources.
- Authentication: candidate Better Auth (see the ADR once written).
- Database provider and hosting.
- Cookie consent management: a paid platform or a self-built solution.
- Who writes and reviews the legal texts (privacy, cookies, terms).
- Image storage for product photos.
- Shipping zones, costs and carriers.

## Outcome

Feeds the ADRs in `docs/decisions/` and the first spec, `docs/specs/001-technical-foundation.md`.
