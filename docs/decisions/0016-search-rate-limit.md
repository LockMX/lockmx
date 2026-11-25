# 0016. Rate limit of the search suggestions in the hosting firewall

- Status: accepted (owner, 2026-11-24), while the site is hosted on Vercel (ADR 0012, still proposed). The numbers of the rule were set by the owner with spec 005, T17. The owner created the rule in the Vercel project on 2026-11-25; whether it fires is checked by hand after the first deployment that serves `/api/search`.
- Date: 2026-11-24

## Context

The search bar of the shop asks `GET /api/search` for suggestions while the visitor types (spec 005, T17). It is the first endpoint of ours that a visitor can call many times a minute, and each call is a request to the Shopify Storefront API made with the private token. A limit per address of origin caps what one script can send through it.

The browser sends a request only after a pause of 250 ms in typing and cancels the one before, so a person typing a word sends one or two requests and a search of several words two to five. Answers are cached for 5 minutes by what is sent (lower case), so repeated texts do not reach Shopify again.

ADR 0015 put the limit of the contact form in the Vercel Web Application Firewall, with no code or storage of ours. The contact form is on hold (spec 006, owner, 2026-10-13), so the one rate limiting rule of the Hobby plan is free.

## Decision

The limit is a rate limiting rule of the Vercel Web Application Firewall, as in ADR 0015. No counter, no code and no dependency in this repository.

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

## Alternatives considered

| Option | Why not |
|---|---|
| One rule for `/api/search` and `/api/contact` together | One counter and one limit for both: 3 in 10 minutes would make the search useless, 100 a minute would leave the form almost unlimited. Not needed while the form is on hold. |
| A counter in code (DynamoDB, Upstash, Supabase) | The reasons of ADR 0015: a new dependency, account or processor for what the hosting already gives. |
| Calling Shopify from the browser with a public token | No endpoint of ours to limit, but a second token in the page and Shopify's limits for public tokens were not verified. Not researched further. |
| No limit | The endpoint would let a script use our token at will. |

## Consequences

- This takes the single rule of the Hobby plan. If the contact form is built (spec 006), the site needs two rules, which Hobby does not allow (Pro allows 40). The commercial use question of ADR 0012 is separate and still open; neither blocks this task.
- What ADR 0015 says of the firewall applies here too: the rule exists only where it is published, counters are per region, people behind one address share the limit, and it cannot be tested locally or in CI. It is checked by hand after publishing, first with the Log action.
- If the hosting changes (ADR 0007), the limit has to be rebuilt before the move.

## Sources

- Vercel WAF rate limiting, https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting (page last updated 2026-08-28, read 2026-11-24): on Hobby and Pro, fixed window from 10 seconds to 10 minutes, keys IP and JA4 digest; 1 rule per project on Hobby, 40 on Pro; 1,000,000 allowed requests included on Hobby, usage-based on Pro; the default action answers 429; counters per region.
- ADR 0015 (`0015-contact-form-rate-limit.md`), for the conditions on path and method (Vercel WAF custom rules page, read 2026-10-13).
- Spec 005, T17 notes, for the behaviour of the search bar and the cache.
