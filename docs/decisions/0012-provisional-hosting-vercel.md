# 0012. Provisional hosting of the placeholder page on Vercel

- Status: accepted (2026-11-26)
- Date: 2026-10-08

## Context

The site needs a public address before the shop exists. The request for AWS SES production access asks for the website of the sender, and the owner wants to submit it now with `https://www.lockmx.com`. The placeholder (the logo and "coming soon") is the route `/<locale>/coming-soon`. With `COMING_SOON=true` in the deployment's environment, the proxy shows it at every page address, so `main` can receive the real pages as they are built without publishing them (`docs/architecture.md`, Internationalization).

This ADR covers where the placeholder runs. Hosting of the whole site is ADR 0007.

The owner hosts other projects on Vercel at no cost, on the Hobby plan, and proposed the same here.

## Decision

- Host the placeholder on Vercel and point `www.lockmx.com` to it, on the Hobby plan, as ADR 0007 decides for the whole site (owner, 2026-11-26).
- Vercel's fair use guidelines say: "Hobby teams are restricted to non-commercial personal use only. All commercial usage of the platform requires either a Pro or Enterprise plan." Commercial usage includes "Receiving payment to create, update, or host the site" and "Advertising the sale of a product or service". LockMX is a client's business built as paid work, so the placeholder falls under this definition even though it sells nothing yet. The owner accepts that risk; a paid plan is considered after the shop is launched (ADR 0007).
- Nothing in the code depends on Vercel. Moving to another host means deploying the same Next.js app there and changing the DNS record.

## Alternatives considered

- A Pro team from the start (20 USD per month per developer seat), or a written answer from Vercel support that the placeholder is acceptable on Hobby: not chosen by the owner. The risk of Hobby stays: the documentation lists policy violations among the reasons an account or deployment can be paused, and a paused site at the address given to AWS, on the owner's personal account, is a risk for both. How strictly the rule is enforced was not verified.
- AWS Amplify now: not chosen. Official support for Next.js 16 was not found (ADR 0007), and testing it would delay the SES request.
- A static page on another host: not chosen. It would be a second thing to build and then throw away; the placeholder is already the app's home route.

## Consequences

- The SES request can be submitted as soon as the domain answers.
- No hosting cost until a paid plan is chosen.
- The site becomes public. The deployment must have `COMING_SOON=true`, which hides pages but not API routes: nothing that handles personal data or payments is merged into `main` before its own spec and decisions, switch or no switch.

## To verify at deployment

- The Vercel project settings for this monorepo (root directory `apps/web`, pnpm, Node 22.12 or later per ADR 0004), in the current Vercel documentation.
- That the account or team is owned by the client or can be transferred (project brief: the client owns or can take over every account).
- The DNS records for `www.lockmx.com` and the apex, without touching the MX and SES records already in place (`docs/` SES notes).
- Whether a "coming soon" page is enough for the SES production access review. Not verified.

## Sources

- Vercel fair use guidelines, commercial usage: https://vercel.com/docs/limits/fair-use-guidelines (page last updated 2026-09-14, consulted 2026-10-08).
- Vercel Hobby plan: https://vercel.com/docs/plans/hobby (page last updated 2026-09-14, consulted 2026-10-08): free, "non-commercial, personal use only", Pro developer seats at 20 USD per user per month, viewer seats free, Pro trial.
- ADR 0007 (`0007-application-hosting.md`) and its sources.
