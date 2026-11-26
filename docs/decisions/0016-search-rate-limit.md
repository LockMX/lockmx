# 0016. Rate limit of the search suggestions in the hosting firewall

- Status: accepted (owner, 2026-11-24), while the site is hosted on Vercel (ADR 0007). The numbers of the rule were set by the owner with spec 005, T10. The owner created the rule in the Vercel project on 2026-11-25; whether it fires is checked by hand after the first deployment that serves `/api/search`.
- Date: 2026-11-24

## Context

The search bar of the shop asks `GET /api/search` for suggestions while the visitor types (spec 005, T10). It is the first endpoint of ours that a visitor can call many times a minute, and each call is a request to the Shopify Storefront API made with the private token. A limit per address of origin caps what one script can send through it.

The browser sends a request only after a pause of 250 ms in typing and cancels the one before, so a person typing a word sends one or two requests and a search of several words two to five. Answers are cached for 5 minutes by what is sent (lower case), so repeated texts do not reach Shopify again.

The project has no database (ADR 0014), so a limit written in our code would need a place for its counters. The Vercel Hobby plan allows one rate limiting rule per project, and this rule uses it.

## Decision

The limit is a rate limiting rule of the Vercel Web Application Firewall, in front of the application. No counter, no code and no dependency in this repository.

The rule, to be created in the dashboard of the Vercel project by the owner (a change to an external service):

| Field | Value |
|---|---|
| If | request path equals `/api/search` and method equals `GET` |
| Then | Rate Limit, fixed window |
| Time window | 60 seconds |
| Request limit | 100 |
| Key | IP |
| Action over the limit | Default (429) |

Why 100 a minute: a person sends a few requests per search, so 100 leaves room for many searches a minute and for several people behind one shared address (a mobile carrier, an office), and still stops a script. The owner raised it from the 60 first proposed (2026-11-24).

Over the limit the firewall answers 429 itself; the search bar treats it, like any failure, as no suggestion. The listing (`/shop?q=`) is a page, not this endpoint, and is not under this rule.

The rule is not in the repository: the page on custom rules says `vercel.json` supports only the `challenge` and `deny` actions. This table is its record.

## Alternatives considered

| Option | Why not |
|---|---|
| A counter in code: Amazon DynamoDB, Upstash Redis or Supabase | DynamoDB needs the AWS SDK (a new production dependency) and credentials on the hosting; Upstash is a new account, processor and dependency for what the hosting already gives; on the Supabase free plan "Free projects are paused after 1 week of inactivity". |
| A counter in the memory of the server | Does not work: each serverless instance has its own memory. |
| Calling Shopify from the browser with a public token | No endpoint of ours to limit, but a second token in the page and Shopify's limits for public tokens were not verified. Not researched further. |
| No limit | The endpoint would let a script use our token at will. |

## Consequences

- This takes the single rule of the Hobby plan; Pro allows 40. The commercial use risk of Hobby is recorded in ADR 0007.
- The limit exists only where the rule is published: the page on custom rules says publishing applies the changes "to your production deployment"; whether preview deployments are covered was not verified.
- "Rate limit counters are tracked on a per-region basis", so traffic from several regions can exceed the limit of one.
- People behind one shared address share the limit.
- It cannot be tested locally or in CI. It is checked by hand after publishing, first with the Log action, as the Vercel page advises.
- Persistent actions (blocking the address for a time after the limit) are for Pro and Enterprise and are not used.
- If the hosting changes (ADR 0007), the limit has to be rebuilt before the move.

## Sources

- Vercel WAF rate limiting, https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting (page last updated 2026-08-28, read 2026-11-24): on Hobby and Pro, fixed window from 10 seconds to 10 minutes, keys IP and JA4 digest; 1 rule per project on Hobby, 40 on Pro; 1,000,000 allowed requests included on Hobby, usage-based on Pro; the default action answers 429; counters per region.
- Vercel WAF custom rules, https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules (page last updated 2026-09-10, read 2026-10-13): conditions on path and method, publishing to the production deployment, the Log action first, `vercel.json` actions, persistent actions.
- Supabase pricing, https://supabase.com/pricing; Amazon DynamoDB on-demand pricing, https://aws.amazon.com/dynamodb/pricing/on-demand/; Upstash Redis pricing, https://upstash.com/pricing/redis (all read 2026-10-13).
- Next.js bundled docs 16.3.6, `01-app/02-guides/backend-for-frontend.md`, "Rate limiting" (read 2026-10-13): "In addition to code-based checks, enable any rate limiting features provided by your host."
- Spec 005, T10 notes, for the behaviour of the search bar and the cache.
