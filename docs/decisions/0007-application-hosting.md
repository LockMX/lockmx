# 0007. Application hosting

- Status: proposed
- Date: 2026-10-02

## Context

The Next.js app (ADR 0001) needs a host that runs server rendering, Server Actions and Route Handlers, supports Node 22.12 or later (ADR 0004), and can be owned or taken over by the client. The shop takes payments, so reliability, security patching and deployment safety matter more than the lowest price. The owner is the only developer. The client already uses AWS for the `@lockmx.com` mailboxes.

## Why not the free plan

Vercel's Hobby plan is free but "restricted to non-commercial personal use only. All commercial usage of the platform requires either a Pro or Enterprise plan" (Vercel fair use guidelines, last updated 2026-09-14). Commercial usage is defined as any deployment used for the financial gain of anyone involved in any part of production, including a paid employee or consultant writing the code. The examples include any method of requesting or processing payment from visitors, and receiving payment to create, update or host the site. An online shop that takes payments, built by a paid developer, is commercial under this definition.

This applies to Vercel only. It does not say anything about other projects of the owner: a project that is personal, non-commercial and involves no payment to anyone involved is within the Hobby terms. Whether a given project is commercial is for Vercel to judge, and its documentation recommends contacting support when unsure. The documentation also lists policy violations among the reasons an account or deployment can be paused. How strictly it is enforced was not verified.

Hobby also lacks team collaboration, spend management and more than 1 hour of runtime logs (Pro keeps 1 day), which matter for a production shop with a client.

## Options (official pages, consulted 2026-10-02)

| | Vercel Pro | AWS Amplify Hosting | AWS Lightsail | AWS ECS Fargate with a load balancer |
|---|---|---|---|---|
| Model | 20 USD per month per developer seat, viewer seats free, with a usage credit included (pricing page) | Pay as you go, no monthly minimum | Fixed monthly instance price | Pay as you go |
| Listed prices | Over the credit: function invocations 0.60 USD per million, active CPU from 0.128 USD per hour | Build: 1,000 minutes per month listed as free, then 0.01 USD per minute. Transfer out: 15 GB per month listed as free, then 0.15 USD per GB. SSR requests: 500,000 per month listed as free, then 0.30 USD per million. SSR duration: 100 GB-hours per month listed as free, then 0.20 USD per GB-hour. Optional firewall: 15 USD per month per app plus its own costs | 5 USD (0.5 GB RAM), 7 USD (1 GB), 12 USD (2 GB), 24 USD (4 GB), 44 USD (8 GB), with 1 to 5 TB of transfer included | Fargate, US East: 0.000011244 USD per vCPU-second and 0.000001235 USD per GB-second on x86. Application Load Balancer, US East: 0.0225 USD per hour (about 16.20 USD per month) plus capacity units |
| Next.js 16 | Maintained by the framework's own company | The AWS documentation page read says "Amplify supports Next.js 15 applications without the need for an adapter". Support for Next.js 16, which this project uses (16.3.6), was not found in the official documentation. One secondary source reports Next.js 16 apps deployed successfully | You run it yourself, so any version | You run it in a container, so any version |
| Node 22 or later | Supported: 24.x default, 22.x, 20.x | Secondary source says 20, 22 and 24 are supported. Not confirmed on an official page | Your own installation | Your own container |
| Operations effort | Lowest: deploys, previews, rollbacks, TLS and scaling are part of the product | Low to medium: managed builds and hosting, but AWS accounts, roles and monitoring are on the team | High: operating system updates, Node, reverse proxy, TLS certificates, deployment process, process supervision, backups and monitoring are all our responsibility | Highest: container build and registry, task definitions, networking, load balancer, autoscaling, logs |
| Client owns the account | Yes, in a Vercel team owned by the client | Yes, in the client's AWS account, which also holds the mailboxes | Same | Same |

Notes:

- App Runner is not an option: the official AWS page says it "will no longer accept new customers starting on April 30, 2026", and recommends Amazon ECS Express Mode.
- Minimum Fargate estimate with US East prices: a 0.25 vCPU and 0.5 GB task is about 9 USD per month (0.25 x 0.04048 + 0.5 x 0.004446 USD per hour, over 730 hours). With the load balancer fee, about 25 USD per month before capacity units, a database, networking and logs. The Europe region prices were not found on the pages read, so the real figure may be higher. A secondary source puts the whole Express Mode setup at 40 to 50 USD per month.
- The Amplify listed amounts are given as "free up to" on the pricing page. Whether they are always free or part of the 12-month free tier for new AWS customers is not clear from the page. The page also lists up to 200 USD of credits for new AWS customers.
- AWS regions in the European Union and their prices for these services were not verified.
- Other hosts (for example Netlify, Cloudflare, Railway, Render, Fly.io) were not evaluated.

## Assessment

- The saving from AWS is real only at the two ends of the effort scale. Lightsail (5 to 12 USD) is cheaper than Vercel Pro (20 USD), but it moves the operations of a payment-taking shop onto the owner and the client. Amplify may cost close to nothing for a small shop if traffic stays inside its listed amounts, but its documented Next.js support stops at version 15. ECS Fargate is not cheaper than Vercel Pro once the load balancer is counted, and is the most work.
- The difference of about 20 USD per month has to be weighed against the owner's time and the risk of an unpatched server on a store with customer data and payments.
- AWS keeps everything in the client's existing account, which simplifies ownership and billing.

## Decision (proposed)

Leaning: Vercel Pro in a team owned by the client, for the lowest operations effort and a documented fit with the framework version in use. Keep AWS Amplify as the alternative worth testing, but only after confirming Next.js 16 support in the official documentation or with a test deployment. Lightsail is not recommended for this project.

## To verify before accepting

- Amplify: official support for Next.js 16 and its `proxy` file, the Node runtime used, the free amounts (permanent or time-limited), the European regions and prices, and how deployments, rollbacks and preview environments work.
- Vercel: the number of seats needed (the owner as developer seat), the credit included in Pro, and expected usage against it for this shop.
- Whether the client prefers to keep hosting in the existing AWS account, and who would operate it.
- Whether Hobby is acceptable for the owner's other projects is a separate question to settle with Vercel support if in doubt.

## Sources

- Vercel Hobby plan: https://vercel.com/docs/plans/hobby (2026-10-02).
- Vercel fair use guidelines, commercial usage: https://vercel.com/docs/limits/fair-use-guidelines (2026-10-02).
- Vercel pricing: https://vercel.com/pricing (2026-09-30) and supported Node.js versions: https://vercel.com/docs/functions/runtimes/node-js/node-js-versions (2026-09-30).
- AWS Amplify Hosting pricing: https://aws.amazon.com/amplify/pricing/ (2026-10-02).
- AWS Amplify, server-side rendering support: https://docs.aws.amazon.com/amplify/latest/userguide/server-side-rendering-amplify.html (2026-10-02).
- AWS Lightsail pricing: https://aws.amazon.com/lightsail/pricing/ (2026-10-02).
- AWS Fargate pricing: https://aws.amazon.com/fargate/pricing/ and Elastic Load Balancing pricing: https://aws.amazon.com/elasticloadbalancing/pricing/ (2026-10-02).
- AWS App Runner availability: https://aws.amazon.com/apprunner/ (2026-10-02).
- Secondary, not official: Node runtimes on Amplify and the Next.js 16 deployment report (web search results); the Express Mode total cost (web search results).
