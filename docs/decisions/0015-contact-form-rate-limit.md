# 0015. Rate limit of the contact form in the hosting firewall

- Status: accepted (owner, 2026-10-13), while the site is hosted on Vercel (ADR 0012, still proposed). The numbers of the rule are proposed here and approved with spec 006.
- Date: 2026-10-13

## Context

The contact form (spec 006) sends one email to the client for each submission. Cloudflare Turnstile reduces automated submissions; it does not stop a person, or a paid solving service, from sending many. Each submission costs one email of the sending quota (ADR 0005: 100 a day on the free plan of Resend) and lands in the client's inbox. A limit per address of origin caps that.

The project has no database (ADR 0014), so a limit written in our code needs a place for its counters. The owner decided on 2026-10-13 that the sender is told on the screen that the message was received, and gets no email. So there is no limit per recipient to keep, and a limit per address of origin is enough.

## Decision

The limit is a rate limiting rule of the Vercel Web Application Firewall, in front of the application. No counter, no code and no dependency in this repository.

The rule, to be created in the dashboard of the Vercel project by the owner (a change to an external service):

| Field | Value |
|---|---|
| If | request path equals `/api/contact` and method equals `POST` |
| Then | Rate Limit, fixed window |
| Time window | 10 minutes (the longest the Hobby and Pro plans allow) |
| Request limit | 3 |
| Key | IP |
| Action over the limit | Default (429) |

Why 3 in 10 minutes and not 1: the firewall counts requests, not delivered messages. A submission the server refuses (a verification that expired, a field that fails the check) is a request too, and with a limit of 1 the visitor would wait ten minutes to correct it. This is looser than the "3 per hour" first agreed (at most 18 an hour from one address in one region). What bounds the damage beyond it: every request needs a fresh Turnstile token, which is single use, and the daily quota of Resend is a hard ceiling.

The rule is not in the repository: the page on custom rules says `vercel.json` supports only the `challenge` and `deny` actions. This table is its record; `docs/integrations/` gets the setup steps in spec 006.

## Alternatives considered

| Option | Why not |
|---|---|
| Amazon DynamoDB, on demand | Exact "3 per hour" and independent of the hosting, but it needs the AWS SDK (a new production dependency), credentials on the hosting and code to maintain. Chosen first by the owner, then set aside once the acknowledgement email was dropped. It is the fallback if the site leaves Vercel. |
| Supabase, free plan | "Free projects are paused after 1 week of inactivity." A form with little traffic would pause it. |
| Upstash Redis, free tier | A new account, processor and dependency for something the hosting already gives. |
| A counter in the memory of the server | Does not work: each serverless instance has its own memory. |
| No limit, Turnstile only | Turnstile is not a limit (see Context). |

## Consequences

- The limit exists only on Vercel, and only where the rule is published. The page on custom rules says publishing applies the changes "to your production deployment"; whether preview deployments are covered was not verified. If the hosting changes (ADR 0007), the limit has to be rebuilt before the move.
- "Rate limit counters are tracked on a per-region basis", so traffic from several regions can exceed the limit of one.
- A visitor behind a shared address (a company, a mobile carrier) shares the three requests with the others behind it.
- The request over the limit is answered by the firewall, not by our code: the form must treat a 429 it did not write as "too many attempts" (spec 006).
- It cannot be tested locally or in CI. It is verified by hand after the rule is published, first with the Log action, as the Vercel page advises, and the result is recorded in the notes of spec 006.
- Plan limits read: Hobby has 1 rate limiting rule per project and 1,000,000 allowed requests included; Pro has 40 rules and is billed by usage, with a price per region that was not read. Which plan the project is on is the open question of ADR 0012.
- Persistent actions (blocking the address for a time after the limit) are for Pro and Enterprise and are not used.

## Sources

- Vercel WAF rate limiting, https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting (page last updated 2026-08-28, read 2026-10-13): availability on all plans, limits per plan, fixed window, counters per region, the default 429 action.
- Vercel WAF custom rules, https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules (page last updated 2026-09-10, read 2026-10-13): conditions, publishing, the Log action first, `vercel.json` actions, persistent actions.
- Supabase pricing, https://supabase.com/pricing; Amazon DynamoDB on-demand pricing, https://aws.amazon.com/dynamodb/pricing/on-demand/; Upstash Redis pricing, https://upstash.com/pricing/redis (all read 2026-10-13), as recorded in `../ideas/landing-page.md`.
- Next.js bundled docs 16.3.6, `01-app/02-guides/backend-for-frontend.md`, "Rate limiting" (read 2026-10-13): "In addition to code-based checks, enable any rate limiting features provided by your host."
