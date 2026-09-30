# 0003. Authentication with Better Auth: passwordless customers, strong admins

- Status: proposed
- Date: 2026-09-30 (revised the same day after the passwordless discussion)

## Context

The customer area needs accounts and sessions. The admin panel needs a server-side role check and strong protection. The owner wants customer registration and login to be simple: name and email, then a one-time code sent by email, with no password to remember. Reasoning and evidence: `../ideas/customer-accounts-and-consent.md`.

## Decision (proposed)

Use Better Auth, with the Drizzle adapter on the project's own PostgreSQL.

- **Customers:** passwordless, using Better Auth's Email OTP plugin. Registration and login are the same flow: the visitor enters name and email, receives a code, enters it, and is signed in. No password is stored. Emails are sent through the provider in ADR 0005.
- **Admins:** the admin plugin provides the role. Every admin must also use a second method that is not an email code: a passkey and/or an authenticator-app second factor (the passkey and two-factor plugins). An email code alone never opens the admin panel.
- **Code hardening, required:** single use; short lifetime; codes stored hashed; a low limit of failed attempts per code; a rate limit per email and per IP; a resend cooldown; sign-in responses that do not reveal whether an account exists; the email send is not awaited in the request, as the Better Auth documentation recommends.
- **Marketing consent** is separate from account creation (see the idea document).

The decision moves to `accepted` after the verification listed under Consequences.

## Alternatives considered

- Password plus email verification: familiar, but customers forget passwords, and we would store and protect password hashes. Recovery already depends on email, so it does not remove the mailbox dependency.
- Magic link instead of a code: same mailbox dependency. Better Auth supports it. A code avoids following a link on another device. Can be reconsidered.
- Phone (SMS) codes: extra cost and a provider dependency, plus SIM-swap risk. NIST treats SMS as a restricted channel. Deferred until there is a concrete need.
- Auth.js (NextAuth): a secondary source reports that the Better Auth team took over its maintenance in September 2025 and that its documented pattern predates the Next.js 16 rename of `middleware` to `proxy`. Not verified in the Auth.js documentation.
- Supabase Auth: fewer lines of code, but users live in a schema managed by the provider, which couples the data model and the database provider. Not verified against the Supabase documentation in this session.
- Hand-rolled sessions as in the Next.js authentication guide: rejected for the security burden on a store with payments.

## Consequences

- With email codes, the security of a customer account equals the security of the customer's mailbox, and a code can be phished in real time. This is accepted for customer accounts (moderate-value data) and is the reason admins need a stronger method. NIST SP 800-63B-4 says email must not be used for out-of-band authentication and allows codes sent to validate an address; it targets high-assurance systems and is used here as a risk reference, not a requirement.
- Login availability depends on email delivery. Guest checkout limits the impact on sales.
- The email templates, in PT-PT and EN, are part of the authentication work (ADR 0005).
- Server-side authorization is enforced on every action, not only in layouts. Proxy checks are optimistic only, per the Next.js guide.
- To verify before accepting, in the current official Better Auth documentation:
  - integration with Next.js 16, including the proxy file;
  - the Email OTP defaults (code length, lifetime, attempts, rate limit) and the exact settings we choose;
  - the passkey and two-factor plugins and how to make a second method mandatory for admins;
  - whether password sign-in is off unless enabled;
  - the release status of the version to install.
- Open product question that shapes the data model: guest checkout, with an optional account created from the order by email code (recommended).

## Sources

- Better Auth documentation via Context7 (`/better-auth/better-auth`), consulted 2026-09-30: Drizzle adapter; admin plugin; Email OTP plugin options (`otpLength`, `expiresIn`, `allowedAttempts`, `storeOTP`, `resendStrategy`, `rateLimit`, `disableSignUp`, and the note about not awaiting the send); magic link, passkey and two-factor plugins.
- NIST SP 800-63B-4, Authenticators: https://pages.nist.gov/800-63-4/sp800-63b/authenticators/ (2026-09-30).
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html (2026-09-30).
- Next.js bundled docs, `apps/web/node_modules/next/dist/docs/01-app/02-guides/authentication.md` (optimistic checks in Proxy), 2026-09-30.
- Secondary source, not official: LogRocket, "I tested every major auth library for Next.js in 2026", https://blog.logrocket.com/best-auth-library-nextjs-2026/ (2026-09-30). To be replaced by official sources during verification.
