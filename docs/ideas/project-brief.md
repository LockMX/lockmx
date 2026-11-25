# Project brief

Consolidates the requirements gathered so far (initial brainstorming and the owner's answers). Items marked "to verify" come from unverified secondary sources and must be confirmed at the official source before they drive a decision.

## Objective

Build the online store of LockMX, a motocross products business. The client's reference site is linoswarehouse.pt.

Catalog at launch: a few tyres and the flagship product, racks for carrying equipment (helmets, clothing) inside closed vans such as the Mercedes Sprinter. The catalog is small.

The owner is the only developer. The project is a real commercial delivery for a client.

The shop is Shopify behind our own Next.js frontend (ADR 0014): catalogue, stock, orders, customers and their accounts, checkout, payments and the account and order emails are Shopify's, and the catalogue and orders are managed in the Shopify admin. The project has no database, authentication or transactional email of its own.

## Functional requirements

- Landing page and institutional content.
- Product catalog with product search.
- Shopping cart.
- Languages: PT-PT and EN from the start.
- Payment methods requested: MB WAY, Multibanco (entity and reference), bank card and bank transfer (IBAN), through Shopify.
- Invoicing through software certified by the Portuguese tax authority (AT).
- Legal pages: privacy policy, cookie policy, terms and conditions, and the electronic complaints book.
- No marketing emails at launch. If they come, electronic marketing to a natural person needs prior and explicit consent (Law 41/2004, art. 13-A; secondary source, to verify).
- Analytics: Google Analytics 4 only, loaded after cookie consent.

## Non-functional requirements

- Security as a priority: personal data and payments are involved.
- The client owns or can take over every account (repository, hosting, domain, Shopify, invoicing).

## Business rules already discussed

- Consumer withdrawal right (14 days, Decree-Law 24/2014) applies to pre-fabricated goods. The exception for goods made to the consumer's specification depends on how each product is actually produced (stock versus made to order). Model this per product and have the legal text reviewed by a lawyer. To verify at the official source.
- Shipping cost must be visible before checkout. Zones and costs are still to be discussed with the client. Tyres and racks may need different shipping profiles.

## Constraints and status

- Legal texts (privacy, cookies, terms) and their legal review are handled by the client.
- Brand identity exists. The design system is built around it, with Claude Design.
- The `@lockmx.com` mailboxes are on AWS (`../integrations/aws-ses-mailboxes.md`).
- Costs of third-party services (Shopify, hosting, invoicing) are paid by the client.

## Open questions

- Hosting of the frontend (ADR 0007).
- Cookie consent management: a paid platform or a self-built solution.
- Shipping zones, costs and carriers.

## Outcome

Feeds the ADRs in `docs/decisions/` and the first spec, `docs/specs/001-technical-foundation.md`.
