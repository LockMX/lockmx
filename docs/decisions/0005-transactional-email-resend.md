# 0005. Transactional email with Resend

- Status: proposed
- Date: 2026-09-30 (updated 2026-10-08)

## Context

The shop sends emails at defined moments: login and registration codes, welcome, order confirmation, and later invoices, shipping and contact form acknowledgements. Login depends on email delivery (ADR 0003), so deliverability and reliability matter. The client's mailboxes (`@lockmx.com`) are configured on AWS SES (see "Mailbox setup").

## Decision (proposed)

Use Resend to send transactional email, with the templates written as React Email components inside the repository, so they are versioned, tested and translated (PT-PT and EN) like the rest of the code. Amazon SES stays responsible for receiving and forwarding the `@lockmx.com` mailboxes.

Sending is done only from the server layer, through a small internal function (an email port) that takes a template name, the recipient and typed data, so the provider can be replaced by changing one adapter. Emails that block a user action (login codes) are sent without delaying the response beyond what is needed, and failures are logged and alerted.

The owner has not yet confirmed this choice over sending through SES as well (see "Comparison with Amazon SES"). The ADR stays proposed until he does.

## Mailbox setup

The client's existing mailbox `lock_mx@outlook.com` is the single place where everything arrives. On AWS, SES receives mail for `@lockmx.com` into an S3 bucket and a Lambda function forwards each message to that Outlook mailbox. In the forwarded message the original sender is in "Reply-To", the recipient is the Outlook mailbox, and the "mailed-by" shows the custom MAIL FROM subdomain of the domain. The owner uses the same pattern in another project.

| Address | Role | Notes |
|---|---|---|
| `shop@lockmx.com` | Sender of every automatic email of the shop (codes, welcome, order, payment, shipping status, form acknowledgement, invoices). Send only: it does not receive. | Every template sets `Reply-To: support@lockmx.com`, so a customer who replies reaches support and no reply bounces. Every template also says the message is automatic and points to `support@`. |
| `support@lockmx.com` | Public help address for anything about a purchase. Shown on the site. | Alias forwarded to the client's mailbox. |
| `fabio.ramalhinho@lockmx.com` | Direct relationship with customers, used by the person when he chooses. Receives the contact form messages and the "payment confirmed" notification. | Whether he answers from this address or from `support@` is not decided and does not affect the design. |
| `privacy@lockmx.com`, `terms@lockmx.com` | Data protection and legal terms contacts. | Exist already. |
| `postmaster@lockmx.com`, `abuse@lockmx.com` | Role mailboxes expected by email conventions. Not a legal requirement. | Aliases. |
| `dev@lockmx.com` | Owner of the accounts of third-party services (Resend, AWS, Cloudflare, domain registrar, payment provider). | The owner's convention across his projects. |
| `dmarc@lockmx.com` (proposed) | Receives DMARC aggregate reports. | Alias, to keep them out of people's inboxes. |

Open points: which sending domain the shop uses (the root `lockmx.com` as the owner has done so far, or a subdomain for the shop's automatic mail, which isolates its sending reputation from the person-to-person mail and from the forwarder, as Resend recommends); whether `fabio.ramalhinho@` and `support@` land in the same Outlook mailbox and how they are told apart (by the "To" header, with Outlook rules).

## Order email flow

Payment confirmation comes from the payment provider's webhook with a verified signature and idempotent processing (`AGENTS.md`). The emails below are triggered from server code after that, never from the browser, and each is sent at most once per order event.

| Event | Customer receives | Fábio receives |
|---|---|---|
| Order registered | Order confirmation (with the payment details for deferred methods such as Multibanco or bank transfer). | Nothing. |
| Payment confirmed (webhook) | Payment confirmed. The order moves to "in preparation" and the customer area shows it. | One email: payment confirmed, with what to ship and where. This is the only order email he gets. |
| Marked as shipped in the admin panel, with the shipping tracking number | Status change with the tracking number. The customer area shows the same. | Nothing. |
| Payment failed or expired | Payment failed or expired, with how to retry. | Nothing. |
| Order cancelled or refunded | Cancellation or refund notice. | To define in the order spec. |

The last two rows are not in the owner's description and are proposed so a customer is never left without information. Each customer email exists in PT-PT and EN. The invoice email depends on the invoicing spec.

## Comparison with Amazon SES (checked 2026-10-08)

The owner already has the domain verified in SES, so using it for transactional email too was evaluated.

| Aspect | Amazon SES | Resend |
|---|---|---|
| Price | Outbound email $0.10 per 1,000 on the pay-as-you-go rate shown, with Essentials, Pro and Enterprise plans from $0.16 to $0.23 per 1,000, the last two with a monthly fee per account and region. A 6-month free plan and up to $200 in credits exist for new accounts. The page shows an "Essentials" default plan from 2026-07-21 for accounts without recent activity. Which plan applies to the owner's account is checked in the console. Event publishing, SNS and storage are billed under their own pricing pages. Attachments $0.12 per GB. The page lists no charge for templates. | Free: 3,000 emails per month, 100 per day, 1 webhook endpoint, 3 domains. Pro: $20 per month for 50,000 emails ($35 for 100,000), no daily limit. Overage $0.90 per 1,000. EU region and template limits not stated on the pricing page. |
| Templates | Stored templates (`CreateEmailTemplate`, v2 API) up to 20,000 per region and 500 KB each, with `{{placeholder}}` variables in subject, HTML and text; or inline templates passed on every send. Templates live in AWS, outside the repository: not versioned with the code, not typed, not unit-tested, translations managed by hand. | React Email components in the repository, rendered by our code. |
| Using React Email with SES | Possible: render the component to HTML and text in the server code and send it as plain content. Stored SES templates are then not used. | Native. |
| Delivery events | Bounce, complaint, delivery and others through event publishing to SNS, CloudWatch or Firehose, or feedback notifications through SNS. A public endpoint must verify the SNS signature (certificate checks, topic ARN check). | Signed webhooks (`svix-id`, `svix-timestamp`, `svix-signature`), verified with the SDK on the raw body. |
| Reputation limits | Account-wide. The account is put under review at a bounce rate of 5% and may be paused at 10%; under review at a complaint rate of 0.1% and may be paused at 0.5%. Rates use a "representative volume". | Per team and domain. Limits not checked. |
| Sandbox | New accounts start in a sandbox per region (200 messages per day, 1 per second, only to verified addresses). Production access is requested in the console (first reply within 24 hours). The owner's account is presumably out of it already. | Not applicable. |

Consequences for the decision:

- The cost difference is irrelevant at this scale (a shop with few orders per day). It is not a reason to choose either.
- SES reputation limits are for the whole AWS account and region. The Lambda that forwards inbound mail sends from the same account: spam arriving at `privacy@`, `abuse@` or `postmaster@` and forwarded counts as complaints and bounces of the same account that would also send login codes and order emails. A sending pause of the account would stop sales. Using a separate provider for the shop decouples the two. If the owner's other projects share the AWS account and region, they share this risk too.
- Templates in AWS are against the project's rule that everything is versioned, tested and translated in the repository. If SES were chosen, templates still live in the repository and are sent as rendered content.
- Staying on SES only would mean one provider and one set of DNS records, less to configure. Choosing it is possible without redesign because of the email port above.

Recommendation: keep Resend for the shop's transactional email and SES for the mailboxes. To be confirmed by the owner. The data processing terms of the chosen provider and its region are verified before accepting the ADR.

## Consequences

- A verified sending domain is required for Resend, so the DNS setup is a dependency. Resend recommends sending from one or more subdomains to isolate reputation. Because human mailboxes, the SES forwarder and Resend share the domain, how the SPF, DKIM and DMARC records combine is verified in the Resend and AWS documentation before publishing DNS records. The Resend page consulted does not list the records, and says nothing about coexistence with another mailbox provider.
- Cost is paid by the client. The plan and price are confirmed by the owner at the official Resend page before the client commits.
- Default API rate limit is 10 requests per second per team, with daily and monthly quotas on the free plan. Login code sending must handle a `429` response without losing the request.
- An EU data region is available, relevant to GDPR. The data processing agreement and the processor entry in the privacy policy inventory must be recorded.
- Because purchase requires an account created with an emailed code (ADR 0003), a sending failure blocks sales. Delivery events and failures must be monitored and alerted, and the code endpoint must handle rate limit responses without losing the request.
- Templates at launch (PT-PT and EN each): registration and login code; welcome, sent after the code is confirmed and strictly transactional (no promotions, otherwise marketing consent would apply); order confirmation; payment confirmed; shipped with tracking number; payment failed or expired; order cancelled or refunded. Contact form: an acknowledgement to the sender (from `shop@`) and a notification to the client (to `fabio.ramalhinho@`). Internal notification of confirmed payment. The catalog is maintained in `docs/integrations/` once created.
- Webhooks report delivery events, and can feed monitoring of bounces and failures.

## Sources

- Resend documentation: https://resend.com/docs/introduction and https://resend.com/docs/api-reference/rate-limit (2026-09-30): transactional email, React Email support, EU data region, webhooks, verified domain requirement, rate limit and quotas.
- Resend pricing, https://resend.com/pricing (2026-10-08): plans, daily limit, webhook endpoints, domains.
- Resend domains, https://resend.com/docs/dashboard/domains/introduction (2026-10-08): subdomain recommendation.
- Resend webhook verification, https://resend.com/docs/webhooks/verify-webhooks-requests (2026-10-08).
- Amazon SES pricing, https://aws.amazon.com/ses/pricing/ (2026-10-08).
- Amazon SES templates and `SendEmail`, https://docs.aws.amazon.com/ses/latest/dg/send-personalized-email-api.html (2026-10-08): stored and inline templates, limits.
- Amazon SES monitoring and event publishing, https://docs.aws.amazon.com/ses/latest/dg/monitor-sending-activity.html (2026-10-08).
- Amazon SES reputation thresholds, https://docs.aws.amazon.com/ses/latest/dg/reputationdashboardmessages.html (2026-10-08).
- Amazon SES sandbox and production access, https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html (2026-10-08).
- Amazon SES custom MAIL FROM domain, https://docs.aws.amazon.com/ses/latest/dg/mail-from.html (2026-10-08).
- Verifying Amazon SNS message signatures, https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html (2026-10-08).
- Better Auth Email OTP plugin, `sendVerificationOTP` callback, via Context7 (2026-09-30).
