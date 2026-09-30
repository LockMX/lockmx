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

## Cost model (official pages, consulted 2026-09-30)

- **Supabase** bills per organization. The plan fee (Pro from 25 USD per month) is charged once per organization and applies to all projects in it, so none is paused. Each project also has its own dedicated Postgres server, billed for compute whether or not it is used. The Pro plan includes 10 USD of compute credits, which cover one project on the Micro size. An additional Micro project costs about 10 USD per month. Example: three Micro projects in one Pro organization cost about 25 + 3 x 10 - 10 = 45 USD per month.
- **Neon** has no monthly minimum on paid plans. Compute is billed per compute-unit hour (0.106 USD on Launch) only while the compute is running. Scale to zero suspends the compute after 5 minutes without queries, and suspended compute incurs no charge. It is mandatory on Free and optional on paid plans. Reactivation takes "a few hundred milliseconds". Storage is billed by size (0.35 USD per GB-month), and the restore window is billed separately (0.20 USD per GB-month). Launch allows up to 100 projects.
- Illustration of the compute formula, with the smallest compute size assumed to be 0.25 CU (not verified): always on for a month (730 hours) is about 19 USD; active 8 hours per day is about 6 USD; 1 CU always on is about 77 USD. Small storage adds cents. Real cost depends on traffic pattern and on the chosen compute size, and must be measured.
- So neither is cheaper in general. Neon is cheaper for a small, intermittent workload and can be many times more expensive if a larger compute stays always on. Supabase is a predictable floor of about 25 USD per organization plus about 10 USD per extra project.
- Ownership: the client pays and must own or take over the account. Projects belonging to the client should live in an organization owned by the client, separate from the owner's personal projects, so billing and ownership stay clean. This means the "several projects under one fee" advantage of Supabase applies only to the owner's own projects, in the owner's own organization.

## Assessment

- The Free plans of Supabase and Neon are not for production. Supabase Free has no backups and pauses; Neon Free keeps only 6 hours of history.
- Recovery granularity is the main difference. Supabase Pro gives daily backups, and point-in-time recovery costs 100 USD per month extra. Neon gives instant restore inside a history window of up to 7 days on Launch, paid through storage. For an online shop, being able to recover to a minute before a bad migration or deletion is worth more than a fixed monthly price, although a daily backup may be acceptable if the client accepts up to a day of possible data loss and the payment and invoicing providers hold their own records.
- Supabase is the choice with the lowest learning cost for the owner and a predictable price. Its extra features are not used.
- AWS RDS fits if the client wants everything in their own AWS account, since the mailboxes are already on AWS, but it has the highest effort and cost predictability is lower for a small workload. Not recommended for a solo developer at this size unless the client requires it.
- Other providers (for example Railway, Render, DigitalOcean, Scaleway, Aiven) were not evaluated.

## Decision (proposed)

Shortlist Supabase Pro and Neon Launch, keeping the code provider-neutral. Leaning: Neon Launch, for the finer recovery window and usage-based cost, unless the checks below show a problem. Supabase Pro stays the fallback if the owner prefers the familiar tool and the fixed price. Decide after the verification below.

## To verify before accepting

- Neon: the smallest compute size and the real monthly cost for our traffic; whether a reactivation of a few hundred milliseconds is acceptable for login and checkout, or scale to zero should be disabled (allowed on paid plans); connection pooling and the Drizzle driver to use.
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
- Supabase billing: https://supabase.com/docs/guides/platform/billing-on-supabase and https://supabase.com/docs/guides/platform/manage-your-usage/compute. Neon plans: https://neon.com/docs/introduction/plans and https://neon.com/docs/introduction/scale-to-zero (2026-09-30).
- Amazon RDS for PostgreSQL pricing: https://aws.amazon.com/rds/postgresql/pricing/ (2026-09-30).
- Vercel supported Node.js versions: https://vercel.com/docs/functions/runtimes/node-js/node-js-versions (2026-09-30).
