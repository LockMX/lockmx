# Landing page and public site shell

## Objective

Replace the "coming soon" placeholder with the real public face of LockMX: a landing page in PT-PT and EN that presents the brand and the flagship product (racks for carrying equipment inside vans) and the tyres, and the shell every later page sits in (header, navigation, footer, metadata, error pages). For visitors who do not know the brand, and for the client, who needs something to show before the shop exists.

This idea is independent of how the shop is built. In every option still open in `build-vs-shopify.md` (custom, or Shopify behind our own Next.js frontend) the landing page and the shell are Next.js pages built with the design system of spec 003.

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

The storefront UI kit of the design system (`ui_kits/storefront` in the Claude Design project) is the visual input for these sections. Spec 003 read only its README and left the screens as input for this spec. It was not read again for this idea, so the list above comes from `project-brief.md` and not from the kit. Reading the kit is the first step of writing the spec; where the two differ, the difference goes to the owner.

### Featured products

| Option | Assessment |
|---|---|
| Static content in the dictionaries, no prices | Works today. No price is shown, so no rule about prices, stock or VAT applies yet. Proposed for the first version. |
| Read from the catalogue (own database, or Shopify) | Needs the shop decision. Added by the shop spec. |

### The primary action of the hero

There is no shop to send the visitor to. Options: scroll to the contact section, or a `mailto:` link. Open with the client (see below).

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

- `../decisions/0013-e2e-test-runner.md` (proposed).
- Spec `004-landing-page` and branch `feat/004-landing-page`, to be written after the owner answers the questions above that change the scope.
