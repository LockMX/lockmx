# Landing page and public site shell

## Objective

Replace the "coming soon" placeholder with the real public face of LockMX: a landing page in PT-PT and EN that presents the brand and the flagship product (racks for carrying equipment inside vans) and the tyres, and the shell every later page sits in (header, navigation, footer, metadata, error pages). For visitors who do not know the brand, and for the client, who needs something to show before the shop exists.

This idea is independent of how the shop is built. The shop was decided on 2026-10-09 as Shopify behind our own Next.js frontend (ADR 0014); the landing page and the shell are Next.js pages built with the design system of spec 003 either way.

Update of 2026-10-09: the owner answered most of the open questions below (address, structure, purpose of the page, copy from the client, legal part last). The answers and the final section list are in `../specs/004-landing-page.md`, which is the current source; the options below are kept as the record of what was considered.

## Criteria

1. Built only from the components and tokens of spec 003. A missing component is raised as a question, not invented in the page (boundary of spec 003: "ask first").
2. Every visible string and accessible name comes from the dictionaries, in PT-PT and EN. Final copy is supplied or approved by the client.
3. The legal minimum of `../compliance/site-information-and-complaints.md` is met on every page:
   - company name, registered address, email, commercial registry data and tax number, one click away (footer link);
   - a telephone number and a physical address where a complaint can be made (assumed mandatory until the open point in that file is closed);
   - a visible, prominent link to the Complaints Book platform;
   - the consumer dispute resolution entity, if the client is bound to one;
   - no link to the EU online dispute resolution platform, which was discontinued.
4. No personal data is collected and no cookie is set that needs consent. So this spec needs no privacy text, no consent banner and no analytics. Each of those comes with the spec that introduces the data.
5. Pages are tested end to end in Chromium, Firefox and WebKit, at a mobile and a desktop width (ADR 0013).
6. Each page has a title, a description, a canonical address and alternate-language links for `pt` and `en`. The site has a sitemap and a robots file. While `COMING_SOON` is on, search engines are told not to index.
7. A not-found page and an error page exist, in both languages, inside the same shell.
8. WCAG 2.1 AA, as in `../design/accessibility.md`: one `h1` per page, landmarks, a skip link, keyboard operation, and the header usable at 320 px.
9. Images are served through `next/image`, with real dimensions and meaningful alternative text from the dictionaries. No stock or placeholder photography goes live.

## Options

### Scope of the first spec

| Option | What it contains | Assessment |
|---|---|---|
| A. Shell and static landing page | Header, navigation, footer, metadata, sitemap, robots, error pages, the landing page sections, the company information page | Depends only on the client's content and on ADR 0013. Proposed. |
| B. A plus the contact form | Adds the form, the two emails, Turnstile and rate limits | Blocked: ADR 0005 (Resend) is proposed, there is no decision on Turnstile, on where rate-limit counters are stored (it touches ADR 0006) or on a validation library, and a form collects personal data, so it needs the privacy text first. |
| C. A plus the legal pages | Adds privacy, cookies and terms | Blocked: the texts are written and reviewed on the client's side (`project-brief.md`) and do not exist yet. |

Proposed: A now. B and C each get a spec when their blockers are closed. Until the form exists, the contact section shows the email address and the telephone number.

### Sections of the landing page

A proposal to check against the storefront UI kit and with the client, in page order:

1. Hero: the brand line, one sentence on what LockMX makes, one primary action.
2. The racks: what they are, which vans they fit, how they are installed. The flagship product gets the most room.
3. Tyres: a short block.
4. Why LockMX: three or four facts the client can stand behind (materials, made where, warranty). Only claims the client confirms.
5. Contact: email, telephone, address.
6. Footer: navigation, company information, Complaints Book, language switcher.

The storefront UI kit of the design system (`ui_kits/storefront` in the Claude Design project) is the visual input for these sections. Spec 003 read only its README and left the screens as input for this spec. It was not read for this idea, so the list above comes from `project-brief.md` and not from the kit. It was read on 2026-10-09; what it defines and where it differs is in the spec, section "Storefront UI kit".

### Featured products

| Option | Assessment |
|---|---|
| Static content in the dictionaries, no prices | Works today. No price is shown, so no rule about prices, stock or VAT applies yet. Proposed for the first version. |
| Read from the catalogue (own database, or Shopify) | Needs the shop decision. Added by the shop spec. |

### The primary action of the hero

There is no shop to send the visitor to. Options: scroll to the contact section, or a `mailto:` link. Open with the client (see below).

## Contact form: decisions so far (owner, 2026-10-09)

The form stays in its own spec. Recorded here so that spec starts from them:

- Bot protection: Cloudflare Turnstile, verified on the server.
- No double opt-in. It confirms consent to a subscription, and a contact message is not one (see `customer-accounts-and-consent.md`).
- The message is delivered to `crew@lockmx.com`, which replaces `fabio.ramalhinho@lockmx.com` in the table of ADR 0005. The client answers from that mailbox, so the visitor's address goes in the reply-to field.
- No automatic email to the sender. This changes the earlier plan of an acknowledgement, and it also means the form cannot be used to send mail to an address someone else typed.
- Nothing is stored: no database (ADR 0014). The message exists only as the email.
- Still needed, and not decided: a service that sends that one email (Resend, ADR 0005, or the AWS SES account that already receives the mailboxes); a validation library for the input on the server; the privacy information shown next to the form, since name, email and message are personal data; and a rate limit (see below).
- Rate limit: Turnstile reduces automated submissions, it does not stop a person or a paid solving service from sending many. Each submission costs one email of the sending quota and lands in the client's inbox. A limit per address of origin caps that. Where its counters live without a database, or whether the hosting provides it, is not researched yet.

### Update (owner, 2026-10-13)

- **The sender gets an acknowledgement after all**, sent with Resend: a short email saying the LockMX team received the message. The client then answers by email. This reverses "no automatic email to the sender" above, and brings back what that line avoided: the form can make our domain send mail to an address someone else typed. The form spec answers it: the acknowledgement carries no text typed by the visitor (not the message, and the name only if it passes a strict check), Turnstile, and a limit per address of origin and per recipient.
- The model for the email is a template of another project of the owner (a card with a logo, a heading, a paragraph, a sign-off and a footer with the site and the privacy policy), to be redone with the LockMX logo and colours. An email needs colour values written inline, which the rule "tokens only" does not cover; the form spec says where those values come from.
- The privacy link of the template and of the form points at `/privacy`, which exists and says "Em implementação" until the client delivers the text. The form is not published before that text exists (same reason as before: name, email and message are personal data).
- Turnstile: the owner is creating the Cloudflare account.
- ADR 0005 is still "proposed" and was written for the custom shop; it is updated and accepted for this one use before the spec. How its templates are written (React Email, a new dependency, or HTML built by our code) is decided there.
- Each submission is now two emails. On the free plan of Resend (100 a day, 3,000 a month, ADR 0005, read 2026-10-08) that is 50 submissions a day.

### Where the rate limit counters live (read 2026-10-13, nothing decided)

The owner agreed on 2026-10-13 to a limit of 3 messages per hour per address of origin, and that 50 submissions a day (the Resend quota) are enough for now. A limit per recipient of the acknowledgement needs a counter keyed by something of the request body, so a firewall rule alone does not give it.

| Option | What was read | Assessment |
|---|---|---|
| Supabase, free plan | "Free projects are paused after 1 week of inactivity." (https://supabase.com/pricing) | Raised and set aside by the owner: a form with little traffic would pause the project, and the limit would fail when it is needed. |
| Vercel WAF rate limiting | Available on all plans. Hobby: 1 rule per project, key IP or JA4, fixed window from 10 s to 10 min, 1,000,000 allowed requests included. Counters are per region. (https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting) | No database, no code, no dependency. The longest window is 10 minutes, so "3 per hour" becomes, for example, 1 per 10 minutes. It counts by address of origin only, and ties the limit to the hosting, whose ADR (0012) is provisional. |
| Amazon DynamoDB, on demand | $0.625 per million writes and $0.125 per million reads in US East; 25 GB of storage in the monthly free benefits; no pause for inactivity mentioned (https://aws.amazon.com/dynamodb/pricing/on-demand/). Not read: the price in an EU region, and how items expire. | Always on, and the owner already has the AWS account. Needs the AWS SDK (a new dependency) and credentials on the hosting. Fits both limits. |
| Upstash Redis, free tier | 250 MB and 500,000 commands a month (https://upstash.com/pricing/redis). Not on the page: EU regions, and what happens to an idle free database. | Made for counters with an expiry. A new account, a new processor and a new dependency. |

Owner, 2026-10-13: the counters go in DynamoDB, since counters are needed in any case. Whether the sender gets the acknowledgement by email or only on the screen is still open; on the screen only, there is no template and no limit per recipient.

Not researched: a rate limit by Cloudflare, which needs the domain served through Cloudflare, and where the DNS of `lockmx.com` is managed.

## Open questions

For the client:

- Company name, registered address, commercial registry number, tax number, telephone, and the physical address for complaints.
- Whether the client is bound to a consumer arbitration centre, and the decision on the physical Complaints Book.
- The copy in PT-PT, and who writes or reviews the English.
- Real photographs of the racks installed in a van and of the tyres, with the right to use them. The mockups of the identity pack are brand images, not product images.
- The list of van models the racks fit, if it is to be shown.
- What the main action of the page should be before the shop opens.
- Whether the landing page goes live before the shop (replacing "coming soon") or only with it.

For the owner:

- The address structure: is the landing page `/pt` and the shop `/pt/loja`, or is the shop the home page later? It decides the navigation labels now.
- Social network links in the footer: which accounts exist.
- Whether the display typeface stays Barlow Condensed for launch (`../design/brand.md`, open point).
- Approval of ADR 0013 and of the `@playwright/test` development dependency.

## Outcome

- `../decisions/0013-e2e-test-runner.md` (accepted 2026-10-09).
- `../specs/004-landing-page.md` (draft), on branch `feat/004-landing-page`.
