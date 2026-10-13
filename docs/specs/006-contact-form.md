# 006. Contact form

- Status: draft (written 2026-10-13, waiting for the owner's approval and for the answers of "Open points")
- Idea: `../ideas/landing-page.md`, section "Contact form"
- Decisions: `../decisions/0005-transactional-email-resend.md` (section "Contact form"), `../decisions/0015-contact-form-rate-limit.md`, `../decisions/0012-provisional-hosting-vercel.md`, `../decisions/0014-shopify-headless-commerce.md`

## Objective

Let a visitor write to LockMX from the contact section of the landing page. The form asks for first name, surname, email, telephone and message. The server checks the input, verifies a Cloudflare Turnstile token, and sends one email with the five fields to `crew@lockmx.com`, with the visitor's address as the reply address. The visitor sees on the screen that the message was received; no email is sent to the visitor. Nothing is stored by this project.

## Out of scope

- An email to the sender, and any email template. Owner, 2026-10-13: confirmation on the screen only.
- A database, a counter or any storage of ours. The rate limit is a rule of the hosting firewall (ADR 0015).
- A form for the shop (a request for a quote for the racks, asking for the vehicle). Not decided: see "Open points".
- The privacy text. It is the client's (spec 004, T7). This spec links to `/privacy` and does not publish the form before that text exists.
- A consent banner and a cookie policy. If the reading of T5 finds that Turnstile sets a cookie that needs consent, the task stops and it is raised.
- Security headers (Content-Security-Policy). They do not exist yet; the decision that adds them must allow the Turnstile script and frame.
- Attachments, a subject field, a copy to the sender, newsletter sign-up.
- Creating the Resend account, the sending domain and its DNS records, the Turnstile widget and the firewall rule. They are changes to external services, done by the owner; T6 writes the steps.

## Decisions taken with the owner

1. **Fields** (2026-10-13): first name, surname, email, telephone, message. Delivered to `crew@lockmx.com`.
2. **Confirmation on the screen only** (2026-10-13). No acknowledgement email, so the form cannot be used to send mail to a third party.
3. **Resend** sends the email (2026-10-13; ADR 0005).
4. **Rate limit in the Vercel firewall** (2026-10-13; ADR 0015).
5. **Cloudflare Turnstile**, verified on the server (2026-10-09). The owner is creating the Cloudflare account.
6. **No double opt-in** (2026-10-09): a contact message is not a subscription.
7. **Privacy link** to `/privacy`; the form is not published before the client's text is there (2026-10-13).

## Design

### Why a Route Handler and not a Server Action

The form posts JSON to `POST /api/contact`, a Route Handler. The bundled forms guide presents Server Actions as the way to handle forms; this spec departs from it for two reasons that come from ADR 0015:

- A Server Action "runs as a POST request against the page that invokes it" (`02-guides/server-actions.md`), here `/pt` and `/en`. A firewall rule on those paths would also count every later action of the same pages. A Route Handler has a path of its own for the rule.
- Over the limit, the firewall answers 429 itself. The form calls the route with `fetch` and reads the status, so it can show a translated message. How a Server Action called through `useActionState` treats a response that is not its own was not verified.

The cost: the form does not work without script. Turnstile needs script in any case, and the section shows the email address beside the form for whoever cannot use it. Server Actions get an Origin check from Next.js; the route does its own (below).

### Layers

| Path | Role |
|---|---|
| `app/api/contact/route.ts` | Thin: reads the JSON body, calls the use case, maps its result to a status. No logic. |
| `server/contact/contact-message.ts` | The shape of a valid message and the function that checks untrusted input. Plain TypeScript. |
| `server/contact/turnstile.ts` | Verifies a token with the Siteverify API. |
| `server/email/` | The email port (`sendEmail`) and its Resend adapter. The only code that knows Resend. |
| `server/contact/contact-config.ts` | The only reader of the environment variables of the form. |
| `server/contact/submit-contact.ts` | The use case: check, verify, send. Receives the verifier and the sender as arguments, so tests pass fakes. |
| `components/site/contact-form.tsx`, `turnstile-widget.tsx` | Client Components. Text through props. |

Everything under `server/` imports `server-only`.

### Fields and rules

Proposed limits, approved with this spec. The server trims each value first and applies the rules to the result.

| Field | Name | Rule |
|---|---|---|
| First name | `firstName` | Required, 1 to 80 characters, no control characters. |
| Surname | `lastName` | Required, 1 to 80 characters, no control characters. |
| Email | `email` | Required, at most 254 characters, one `@` with text on both sides and a dot in the domain, no spaces or control characters. |
| Telephone | `phone` | Optional (open point 1). When present: digits, spaces, `+`, `-`, `(` and `)` only, with 6 to 15 digits. |
| Message | `message` | Required, 10 to 2,000 characters. Line breaks allowed, other control characters not. |
| Token | `turnstileToken` | Required, at most 2,048 characters (the limit Cloudflare documents). |
| Locale | `locale` | `pt` or `en`: the language of the page the visitor wrote from, shown in the email. |

Any other property of the body is ignored. A body larger than 16 KB is refused with 413 and one that is not JSON with 400, before anything else is done with it. The browser gets the same rules as native attributes (`required`, `type="email"`, `type="tel"`, `maxLength`, `minLength`, `autocomplete`), which are a convenience: the server is what decides.

No validation library: five fields do not justify a production dependency.

### What the server does, in order

1. If the form is not configured (below), answer 404.
2. Check the `Origin` header against the site origin (`SITE_URL`). Missing or different: 403.
3. Check the fields. Any failure: 422 with the list of field names and one code per field (`required`, `too_long`, `too_short`, `invalid`). No text: the form maps codes to translated strings.
4. Verify the token: `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` with the secret and the token, with a timeout. `success` false: 422 with the code `verification`. The service does not answer: 502. The visitor's address is not sent to Cloudflare by our code (`remoteip` is optional).
5. Send the email, with a timeout. Failure: 502.
6. Answer 204.

The check of the fields comes before the token is spent, so a correction does not need a second challenge unless the token expired (it is valid for five minutes and for one verification).

Responses carry no detail of the failure. The server logs the outcome of each submission (the step that failed, the status of the provider, the id Resend returned) and never a field, the token or a key.

### The email

- `from`: the configured sender, shown as "LockMX". `to`: `crew@lockmx.com` (`lib/site/contact.ts`, already the address the section shows). `reply_to`: the visitor's address.
- Subject: `Contacto do site: <first name> <surname>`. In Portuguese in both locales: the reader is the client.
- Body, plain text: name, email, telephone (or "não indicado"), the language of the page, then the message as written. These labels are for the client and are not in the dictionaries, which hold visitor-facing text. Raised here because it is an exception to "no hardcoded string": approved with this spec, or moved to the dictionaries if the owner prefers.
- Plain text only, so nothing the visitor types is interpreted as HTML. The names go in the subject; the rule against control characters is what keeps a line break out of it.

### Configuration and the switch

| Variable | What | Secret |
|---|---|---|
| `RESEND_API_KEY` | API key of Resend, restricted to sending if the dashboard allows it (verified in T6). | Yes |
| `CONTACT_FROM_EMAIL` | The sender address, on the domain verified in Resend. | No |
| `TURNSTILE_SECRET_KEY` | Secret key of the Turnstile widget. | Yes |
| `TURNSTILE_SITE_KEY` | Site key of the widget. Public by nature: it is rendered in the page. | No |

None is a `NEXT_PUBLIC_*` variable: the page is a Server Component and passes the site key to the form as a prop. `.env.example` lists the four without values.

**The form is on only when the four are set.** Otherwise the contact section is what it is today (the text and the email address) and the route answers 404. This is the switch that keeps the form out of production until the privacy text exists: the owner sets the variables in the production deployment after spec 004 T7 delivers `/privacy`. `COMING_SOON` does not hide API routes (ADR 0012), which is why the route has its own switch. A set of variables that is partly filled fails the build with a message that names the missing ones, as `SITE_URL` does.

### The form on the page

- In the contact section, inside the white card that now holds the email address. The email address moves under the sentence on the left, still a link.
- Built from `Input`, `Textarea`, `Button` of `@/components/ui`. First name and surname side by side from `md`, one column below. No new design system component.
- Under the fields: one sentence saying the data is used to answer the message, with the link to the privacy page. Working copy until the client's text exists; the wording is checked against it (open point 2).
- The Turnstile widget above the submit button, rendered explicitly by `turnstile.render()` after the script loads from `https://challenges.cloudflare.com/turnstile/v0/api.js` (it "must be fetched from the exact URL"; no wrapper library). Size `flexible`, light theme. The submit button is usable only with a token.
- States, each with text from the dictionaries, in PT-PT and EN:
  - **Sending:** the button shows its loading state and the fields cannot be changed.
  - **Sent:** the form is replaced by a confirmation ("Recebemos a tua mensagem. Respondemos por email assim que possível."), which takes the focus and is a `status` region.
  - **Field errors:** each under its field, through the `error` prop; the focus goes to the first invalid field.
  - **Verification failed or expired:** a message by the widget, and the widget is reset for a new token.
  - **Too many attempts (429):** a message asking to try again later, with the email address.
  - **Failure (any other status, or no answer):** a message with the email address as the other way to write. What was typed is kept.

### Tests without a real send

- **Unit (Vitest):** the field rules; the Turnstile verifier and the Resend adapter with `fetch` stubbed; the use case with fake verifier and sender; the route with the use case stubbed; the form with `fetch` stubbed. No test reaches Cloudflare or Resend.
- **End to end (Playwright):** the test server gets the four variables, with the documented Turnstile test keys and a placeholder Resend key. The tests intercept in the browser the Turnstile script (a stub that hands out the documented dummy token) and `POST /api/contact` (answered with 204, 422, 429 or 502), so each state of the form is seen without a network call. One test lets an invalid body reach the real route and expects 422, which stops before any provider is called. The stubs live in `e2e/` only; nothing in `src/` knows it is under test.
- **By hand, by the owner, on the deployment:** one real message arrives at the client's inbox and a reply goes to the visitor; the firewall rule answers 429. Recorded in the notes of T6.

## Sources

- Next.js bundled docs 16.3.6 (`apps/web/node_modules/next/dist/docs/01-app/`), read 2026-10-13:
  - `02-guides/forms.md`: Server Actions with forms, `useActionState`, validation on the server.
  - `02-guides/server-actions.md` and `02-guides/data-security.md`: an action is a POST against the page that invokes it and is reachable by anyone; the Origin and Host comparison; "For expensive operations (sending emails, writing to a database), consider adding rate limiting".
  - `02-guides/backend-for-frontend.md`: "Never trust incoming request data. Validate content type and size"; "Remove sensitive or unnecessary data from responses and backend logs"; "enable any rate limiting features provided by your host".
- Cloudflare Turnstile, read 2026-10-13:
  - Server-side validation, https://developers.cloudflare.com/turnstile/get-started/server-side-validation/: the Siteverify endpoint, `secret`, `response`, optional `remoteip`; a token is valid for five minutes, for one validation, and has at most 2,048 characters; "You must call the Siteverify API to complete your Turnstile implementation."
  - Client-side rendering, https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/: the script address and that it must not be proxied or cached; explicit rendering; sizes `normal`, `flexible`, `compact`; `turnstile.reset()`.
  - Testing, https://developers.cloudflare.com/turnstile/troubleshooting/testing/: test site keys and secret keys, the dummy token `XXXX.DUMMY.TOKEN.XXXX`; automated browsers are flagged as bots, so tests use the test keys.
  - Supported languages, https://developers.cloudflare.com/turnstile/reference/supported-languages/: Portuguese exists as Brazilian only (`pt-br`, `pt`); English as `en`.
- Resend: the pages cited in ADR 0005, read 2026-10-13.
- Vercel firewall: the pages cited in ADR 0015, read 2026-10-13.
- `../integrations/aws-ses-mailboxes.md`: `crew@` is forwarded to the client's inbox and the forwarder keeps an existing `Reply-To`.
- Not read yet, read at the start of the task that needs them and cited in its notes: the bundled `route.md` and `15-route-handlers.md` (T4); the bundled `script.md` and the Turnstile widget configuration page, with the pixel sizes of the widget (T5); the Turnstile Privacy Addendum and what the widget stores in the browser (T5); the Resend pages on API key permissions and domain verification, and the errors reference (T3, T6); WCAG 3.3.1 and 3.3.3 on error identification (T5).

## Dependencies

- Production: none. Development: none. Anything else is asked first.

## Open points

For the owner:

1. **Telephone: optional or required?** Proposed: optional, because the answer goes by email and asking only for what is needed is the rule for personal data. Whether "contacto telefónico" must be Portuguese only is not assumed: the rule above accepts international numbers.
2. **Privacy sentence under the form, and a checkbox or not.** The storefront kit shows a privacy checkbox. Whether the form needs one depends on the legal basis the client's privacy text states for answering a contact; that is the client's legal review, not a guess of ours. Proposed until then: the sentence with the link, no checkbox.
3. **Language of the Turnstile widget on PT pages.** Turnstile has no European Portuguese. Options: Brazilian Portuguese (`pt`), or English on every page. Proposed: `pt`, since the widget shows only a few words. The owner can ask Cloudflare for pt-PT through the form linked on its page.
4. **Sender address and domain** in Resend (ADR 0005: the planned subdomain is `shop.lockmx.com`). Needed before T6, not before the code.
5. **Vercel plan** (ADR 0012). The firewall rule exists on every plan; the plan decides the limits and the price.
6. **The labels of the email in Portuguese outside the dictionaries** (see "The email").

Pending, not part of this spec:

7. **A form for the shop.** If the racks are sold by quote and not by cart (the question for the client in `../ideas/landing-focus-and-shop-route.md`), the shop needs a form that also asks for the vehicle. Not decided. If it comes, it reuses the route, the verifier and the email port of this spec with its own fields, and the firewall rule has to cover its path (Hobby allows one rate limiting rule, so the path condition would list both).

## Working branch

`feat/006-contact-form`, created from the tip of `feat/005-shop-home`: the contact section this spec changes was last changed there (T9 of amendment 1). If spec 005 is merged first, the branch is rebased on `main`. The pull request is opened on explicit request.

## Conventions for every task

Those of spec 004: the test first and seen failing; site components in `components/site/` with text through props; tokens only; every visitor-facing string in both dictionaries, addressing the visitor as "tu"; the visual check at 320, 768, 1024 and 1440 px on the real route; each task ends with `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` and `pnpm test:e2e`. In addition: no secret, token or form field in a log, a test fixture or a commit; test fixtures use the documented Turnstile test keys and invented people.

## Tasks

### T1. Message rules
- Description: the type of a valid contact message and a function that takes an unknown value and returns either the message (trimmed) or the list of field errors, following "Fields and rules".
- Planned files: `apps/web/src/server/contact/contact-message.ts` and test.
- Acceptance criteria: every rule of the table has a test for the accepted and the refused side, including the limits (80 and 81 characters, 6 and 15 digits, 10 and 2,000 characters), a value that is not a string, a missing property, a line break in a name, and unknown properties ignored; the function never throws for any input.
- Tests: unit, written first.
- Commit: `feat: add contact message validation`

### T2. Configuration and Turnstile verification
- Description: `contact-config.ts` reads the four variables once and returns either the configuration or "off"; partly filled, it throws naming the missing ones. `turnstile.ts` verifies a token with Siteverify, with a timeout, and returns one of three results: valid, invalid, unavailable. `.env.example` gains the four variables with a comment each.
- Planned files: `apps/web/src/server/contact/contact-config.ts`, `apps/web/src/server/contact/turnstile.ts`, tests, `apps/web/.env.example`.
- Acceptance criteria: the variables are read in one module; the secret is sent only to the Siteverify address and never appears in a thrown message or a log; a response that is not JSON, a status that is not 200 and a timeout all give "unavailable"; `success: false` gives "invalid".
- Tests: unit with `fetch` stubbed, written first.
- Commit: `feat: add turnstile verification`

### T3. Email port and Resend adapter
- Description: read the Resend errors reference first. `server/email/send-email.ts` defines the port: a function that takes `from`, `to`, `replyTo`, `subject` and `text` and returns the provider's id or a failure. `resend.ts` implements it with one `fetch` to the send endpoint, with a timeout.
- Planned files: `apps/web/src/server/email/send-email.ts`, `apps/web/src/server/email/resend.ts`, test.
- Acceptance criteria: the request has the bearer key, a JSON body with exactly those fields under the names of the API (`reply_to`) and no HTML; a status outside 2xx, a body without an id and a timeout are failures that carry the status and not the body; the key appears in no log or error.
- Tests: unit with `fetch` stubbed, written first.
- Commit: `feat: add email port with resend adapter`

### T4. Use case and route
- Description: read the bundled `route.md` and `15-route-handlers.md` first. `submit-contact.ts` runs the steps of "What the server does" from the field check on, with the verifier and the sender passed in, builds the subject and the text, and logs the outcome. `route.ts` handles the switch, the Origin check, the size and the JSON parsing, calls the use case and maps the result to 204, 400, 403, 404, 413, 422 or 502. The route is never cached.
- Planned files: `apps/web/src/server/contact/submit-contact.ts`, `apps/web/src/server/contact/contact-email.ts` (subject and text), `apps/web/src/app/api/contact/route.ts`, tests, `apps/web/e2e/contact.spec.ts` (the request-level tests), `apps/web/playwright.config.ts` (the variables for the test server).
- Acceptance criteria: an invalid message calls neither Cloudflare nor Resend; an invalid token calls Resend never; the email has the visitor's address in `reply_to` and `crew@lockmx.com` in `to`; without configuration the route answers 404; a request from another origin answers 403; a body over 16 KB answers 413 and one that is not JSON 400, without being processed; no response body contains a field or a provider detail; the log lines contain no field.
- Tests: unit for the use case (each branch) and the email text (a snapshot of one message, and a name with characters that would matter in HTML left as typed); end to end: a `POST` with an invalid body answers 422 with the field codes, with another `Origin` 403, and `GET` 405.
- Commit: `feat: add contact form endpoint`

### T5. The form in the contact section
- Description: read the bundled `script.md`, the Turnstile widget configuration page and the Turnstile Privacy Addendum first; if the widget sets a cookie or stores something in the browser that needs consent, stop and raise it. `TurnstileWidget` loads the script, renders the widget explicitly, gives the token to its parent, resets on request and on expiry, and removes the widget when unmounted. `ContactForm` holds the fields and the states of "The form on the page". `Contact` takes the form as an optional slot: with it, the card holds the form and the address moves to the left column; without it, the section is unchanged. The page passes the form only when the configuration is on. The dictionaries gain `home.contact.form.*` in both languages.
- Planned files: `apps/web/src/components/site/turnstile-widget.tsx`, `apps/web/src/components/site/contact-form.tsx`, `apps/web/src/components/site/sections/contact.tsx`, tests, `apps/web/src/app/[lang]/(marketing)/page.tsx`, `apps/web/src/server/i18n/messages/{pt,en}.ts`, `apps/web/e2e/contact.spec.ts`, `apps/web/e2e/landing.spec.ts`.
- Acceptance criteria: every field has a visible label and the right `type` and `autocomplete`; the form can be filled and sent with the keyboard alone; each state of the list is reachable in a test and announced (errors in the live region of `Field`, the confirmation as a `status` that takes the focus); a second click while sending sends nothing; after a failure the typed values are still there; the widget fits at 320 px without sideways scroll; with the configuration off the section and its tests of spec 004 are unchanged; no string is hardcoded.
- Tests: unit for the widget (with a stub of `window.turnstile`) and the form (with `fetch` stubbed), written first; end to end in both locales and on the mobile project for sent, field errors, 429 and failure, with the interceptions described in "Tests without a real send".
- Commit: `feat: add contact form to the landing page`

### T6. Setup notes, architecture and checklist
- Description: `docs/integrations/contact-form.md` with the steps the owner follows and what was verified at each: the Resend domain and its DNS records beside the SES ones, the API key and its permission, the Turnstile widget and its hostnames, the four variables per environment, the firewall rule of ADR 0015 (Log first, then the limit), and the hand test of a real message and of the 429. Update `docs/architecture.md` (`app/api/`, `server/contact/`, `server/email/`), `apps/web/AGENTS.md` if it lists what exists, the processor list of `docs/compliance/` if the file exists by then, and `docs/checklists/`. Set the status.
- Planned files: `docs/integrations/contact-form.md`, `docs/architecture.md`, `docs/checklists/04-contact-form.md`, `docs/checklists/README.md`, this spec.
- Acceptance criteria: every path named exists; each step names where it is done and what proves it worked; what the owner has not done yet is listed as open, not as done.
- Tests: no tests (documentation).
- Commit: `docs: add contact form setup notes and checklist`

## Boundaries

- Always: the server decides (the browser's checks are a convenience); the test first; the bundled Next.js docs and the provider's page read before each API is used; text from the dictionaries.
- Ask first: any dependency; a new design system component, icon or token; a field beyond the five; any sentence that states what LockMX does with the data.
- Never: send an email to an address the visitor typed; store or log a field of the form; put a key in a `NEXT_PUBLIC_*` variable, a test or a commit; call Cloudflare or Resend from a test; set the variables in production before the privacy text exists; create or change anything in Resend, Cloudflare, Vercel or the DNS (the owner's actions).

## Definition of done

All tasks committed on `feat/006-contact-form`; `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` and `pnpm test:e2e` pass; a real message was received by the client and answered, and the firewall rule was seen answering 429, both recorded in the notes; the documentation matches the code; and the status is `done`, or `in progress` naming what waits for the owner or the client.
