# 0006. Database provider

- Status: proposed
- Date: 2026-09-30

## Context

The database is PostgreSQL accessed with Drizzle (ADR 0002). It holds customers, orders, payments references, stock and invoice references, so recoverability matters more than raw performance. The catalog and traffic are small. The client pays for the service and must be able to own or take over the account. The owner is the only developer and knows Supabase well.

The application will only use the database as PostgreSQL: authentication is Better Auth (ADR 0003), so Supabase Auth, Storage and its Data API are not needed. Nothing in the code should depend on a provider-specific feature, so the choice stays reversible (a standard dump and restore moves the data).

Hosting of the Next.js app is a separate decision. One fact already verified for it: Vercel supports Node.js 24.x (default), 22.x and 20.x, so it meets the Node 22.12 minimum from ADR 0004. Node 20 is being deprecated there on 2026-10-01.

## Options (facts from the official pages, consulted 2026-09-30)

| | Supabase | Neon | AWS RDS for PostgreSQL |
|---|---|---|---|
| Model | Fixed monthly plan per project | Pay as you go, per compute hour and per GB of storage | Pay per instance hour, plus storage and backup storage |
| Entry price | Pro from 25 USD per month (includes a Micro compute and 8 GB) | Launch: 0.106 USD per compute-hour and 0.35 USD per GB-month, no monthly minimum | On demand per instance hour; a 12-month free tier exists for new AWS accounts (750 hours of Single-AZ instances and 20 GB) |
| Free plan | 500 MB, no backups, paused after one week of inactivity, so not usable for production | 0.5 GB, compute suspends after 5 minutes idle, restore window of 6 hours; projects inactive for 90 days or more are subject to deletion from 2026-10-05 | Free tier only for the first 12 months |
| Backups and recovery | Pro: daily backups kept 7 days. Point-in-time recovery is an add-on at 100 USD per month per 7-day window | Paid plans: 1 day of history by default, configurable up to 7 days (Launch) or 30 days (Scale), with instant restore. A longer window costs more storage | Automated backups and snapshots included, cost grows with retention. Multi-AZ available at higher price |
| European regions | Frankfurt, Ireland, London, Paris, Zurich, Stockholm | Frankfurt, London | Several European regions (not itemized here) |
| Serverless connections | Use the pooler in transaction mode for serverless; prepared statements must be disabled in that mode | Not verified in this session | Not verified in this session; connection limits and pooling are the team's responsibility |
| Branching for tests | Exists (not verified here) | Documented: branches carry the parent's data and are used to test schema changes and destructive queries | Not a built-in feature |
| Operations effort for one developer | Low | Low | Highest: networking, security groups, patching windows, monitoring |

## Assessment

- The Free plans of Supabase and Neon are not for production. Supabase Free has no backups and pauses; Neon Free keeps only 6 hours of history.
- Recovery granularity is the main difference. Supabase Pro gives daily backups, and point-in-time recovery costs 100 USD per month extra. Neon gives instant restore inside a history window of up to 7 days on Launch, paid through storage. For an online shop, being able to recover to a minute before a bad migration or deletion is worth more than a fixed monthly price, although a daily backup may be acceptable if the client accepts up to a day of possible data loss and the payment and invoicing providers hold their own records.
- Supabase is the choice with the lowest learning cost for the owner and a predictable price. Its extra features are not used.
- AWS RDS fits if the client wants everything in their own AWS account, since the mailboxes are already on AWS, but it has the highest effort and cost predictability is lower for a small workload. Not recommended for a solo developer at this size unless the client requires it.
- Other providers (for example Railway, Render, DigitalOcean, Scaleway, Aiven) were not evaluated.

## Decision (proposed)

Shortlist Supabase Pro and Neon Launch, keeping the code provider-neutral. Leaning: Neon Launch, for the finer recovery window and usage-based cost, unless the checks below show a problem. Supabase Pro stays the fallback if the owner prefers the familiar tool and the fixed price. Decide after the verification below.

## To verify before accepting

- Neon: whether compute on the Launch plan scales to zero and the resulting cold-start delay on the first request (it would affect login and checkout); connection pooling and the Drizzle driver to use; how long the history window is on Launch at our expected data size and its cost.
- Supabase: exact backup and recovery options on Pro, how to keep tables out of the Data API (row level security or schema exposure) since it is not used, and pooler settings with Drizzle.
- Both: the data processing agreement, the processor entry for the privacy inventory, and how the account is owned by the client or transferred to them.
- Drizzle: the driver and connection settings for the chosen provider (ADR 0002 lists the driver as open).
- The estimated monthly cost for this workload, which the client pays.

## Consequences

- Schema changes go through Drizzle migrations only, never through a provider dashboard.
- Integration tests in CI use a PostgreSQL service container, independent of the provider, so branching is not a deciding factor.
- Production migrations are applied deliberately (they need explicit authorization) and never automatically from a pull request.

## Sources

- Supabase pricing: https://supabase.com/pricing; regions: https://supabase.com/docs/guides/platform/regions; connections: https://supabase.com/docs/guides/database/connecting-to-postgres (2026-09-30).
- Neon pricing: https://neon.com/pricing; regions: https://neon.com/docs/introduction/regions; history retention and branching: https://neon.com/docs/introduction/branching (2026-09-30).
- Amazon RDS for PostgreSQL pricing: https://aws.amazon.com/rds/postgresql/pricing/ (2026-09-30).
- Vercel supported Node.js versions: https://vercel.com/docs/functions/runtimes/node-js/node-js-versions (2026-09-30).
