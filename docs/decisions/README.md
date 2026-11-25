# Decisions (ADRs)

One architecture or technology decision per file. They record the why, so it does not have to be rediscovered later.

File name: `NNNN-<subject>.md`, sequentially numbered (`0001-monorepo-single-web-app.md`).

An ADR that no longer describes the project is deleted, and a row is added to "Withdrawn decisions" below. Numbers are never reused: the table explains the gaps. The last version of a withdrawn ADR stays in git history, at the commit named in the table.

## Template

```md
# NNNN. <Title>

- Status: proposed | accepted
- Date: YYYY-MM-DD

## Context
The problem and the constraints.

## Decision
What was decided.

## Alternatives considered
Each one with the reason it was not chosen.

## Consequences
What becomes easier and what becomes harder.

## Sources
Official documentation consulted, with URL and consultation date.
```

## Withdrawn decisions

| ADR | Decision | Withdrawn | Why | Last version |
|---|---|---|---|---|
| 0002 | Drizzle as ORM, with PostgreSQL | 2026-11-25 | Shopify holds catalogue, customers, accounts and orders, so there is no database of our own (ADR 0014). | `47bcb09` |
| 0003 | Authentication with Better Auth | 2026-11-25 | Shopify holds customers and accounts, so there is no authentication of our own (ADR 0014). | `5ae9661` |
| 0005 | Transactional email with Resend | 2026-11-25 | Shopify sends the account and order emails, and the contact form, its only other use, will not exist. | `4e51ca5` |
| 0006 | Database provider | 2026-11-25 | Shopify holds catalogue, customers, accounts and orders, so there is no database of our own (ADR 0014). | `4bd03bf` |
| 0015 | Rate limit of the contact form in the hosting firewall | 2026-11-25 | There will be no contact form. | `d2f0f10` |
