# 0005. Transactional email with Resend

- Status: proposed
- Date: 2026-09-30

## Context

The shop sends emails at defined moments: login and registration codes, welcome, order confirmation, and later invoices, shipping and contact form acknowledgements. Login depends on email delivery (ADR 0003), so deliverability and reliability matter. The client's mailboxes (`@lockmx.com`) are being created.

## Decision (proposed)

Use Resend to send transactional email, with the templates written as React Email components inside the repository, so they are versioned, tested and translated (PT-PT and EN) like the rest of the code.

Sending is done only from the server layer. Emails that block a user action (login codes) are sent without delaying the response beyond what is needed, and failures are logged and alerted.

## Alternatives considered

Other transactional providers were not compared yet. The decision stays "proposed" until at least one alternative is checked against the official documentation, and until pricing, the plan needed for the expected volume and the data processing terms are verified.

## Consequences

- A verified sending domain is required. It must be ready before any email can be sent, so the `@lockmx.com` domain setup is a dependency. The sending domain is `@lockmx.com`, validated in Resend by the owner when the mailboxes are configured on AWS. Because human mailboxes and Resend share the domain, how the SPF, DKIM and DMARC records combine for both senders is verified in the Resend and AWS documentation before publishing DNS records.
- Cost is paid by the client. The plan and price are confirmed by the owner at the official Resend page before the client commits.
- Default API rate limit is 10 requests per second per team, with daily and monthly quotas on the free plan. Login code sending must handle a `429` response without losing the request.
- An EU data region is available, relevant to GDPR. The data processing agreement and the processor entry in the privacy policy inventory must be recorded.
- Because purchase requires an account created with an emailed code (ADR 0003), a sending failure blocks sales. Delivery events and failures must be monitored and alerted, and the code endpoint must handle rate limit responses without losing the request.
- Templates at launch (PT-PT and EN each): registration and login code; welcome, sent after the code is confirmed and strictly transactional (no promotions, otherwise marketing consent would apply); order confirmation. Contact form: an acknowledgement to the sender and a notification to the client. The catalog is maintained in `docs/integrations/` once created.
- Webhooks report delivery events, and can feed monitoring of bounces and failures.

## Sources

- Resend documentation: https://resend.com/docs/introduction and https://resend.com/docs/api-reference/rate-limit (2026-09-30): transactional email, React Email support, EU data region, webhooks, verified domain requirement, rate limit and quotas.
- Better Auth Email OTP plugin, `sendVerificationOTP` callback, via Context7 (2026-09-30).
