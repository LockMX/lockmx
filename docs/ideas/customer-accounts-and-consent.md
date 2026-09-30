# Customer accounts, passwordless login and consent

## Objective

Make registration and login effortless for customers of a small shop, without passwords they will forget, while keeping the customer area (personal data, addresses, orders, invoices) protected. Handle consent correctly for account creation, marketing emails and the landing page contact form.

## Proposed flow (from the owner)

- Registration: the visitor enters name and email. The server emails a one-time code. The visitor enters the code and the account exists.
- Login: the visitor enters the email, receives a code, enters it and gets in. No password anywhere.
- All emails are sent through Resend, from templates per moment: welcome, registration confirmation, login code, order confirmation, and so on.
- Phone verification was mentioned as a possible alternative or complement.

## What the documentation says (verified 2026-09-30)

Better Auth (official docs, via Context7):

- The Email OTP plugin supports sign-in by code, email verification and password recovery. If the email is unknown, sign-in registers the user automatically, and it accepts a `name` at that moment. It can be turned off with `disableSignUp`.
- Configurable: code length (`otpLength`), lifetime (`expiresIn`), maximum failed attempts (`allowedAttempts`), how the code is stored (`storeOTP`: hashed, plain or encrypted), a resend strategy (`rotate` or `reuse`) and a dedicated rate limit (`rateLimit`).
- The docs recommend not awaiting the email send, to avoid timing attacks, and to use `waitUntil` or similar on serverless platforms.
- A magic link plugin exists (a link instead of a code). Passkey and two-factor plugins exist too.

NIST SP 800-63B-4 (official, https://pages.nist.gov/800-63-4/sp800-63b/authenticators/):

- "Email SHALL NOT be used for out-of-band authentication", because of password-only mailbox access, interception and rerouting.
- Codes sent to validate an email address, or issued as recovery codes, are "not authentication processes" and are not affected.
- A code must be accepted only once during its validity period, and failed attempts must be rate limited.
- Note: NIST targets high-assurance systems. It does not define the requirements of a small shop. It is a useful reference for the risk, not a legal requirement for LockMX.

OWASP Authentication Cheat Sheet: recommends login throttling, with the failed-attempt counter tied to the account and not only to the IP address, and mentions FIDO/passkeys as a password-free option. It has no specific guidance on email codes.

Resend (official docs):

- Transactional email API, React Email support, EU data region option, webhooks, and a verified domain is required to send. Default rate limit is 10 requests per second per team. The free plan has daily and monthly quotas.

Portuguese law on marketing (secondary sources, to verify against the CNPD directive text and with a lawyer):

- Law 41/2004 article 13-A subjects electronic marketing to prior and explicit consent when the recipient is a natural person. A confirmed opt-in (double opt-in) is a way to prove that consent.

## Assessment

Where the owner's reasoning holds:

- Removing passwords removes weak and reused passwords, credential stuffing and password leaks from our database. That is a real gain.
- Most password systems already rely on email for recovery, so the mailbox is already the fallback credential. Passwordless email login does not add a new weakness in that respect.

Where it needs a caveat, so the docs do not overclaim:

- With email codes, the security of an account equals the security of the customer's mailbox. Compromising the mailbox compromises the account. That is not "better" than a strong password plus a second factor, it is a different trade-off.
- A code can be phished in real time like a password. Rate limiting, short lifetimes, single use and hashed storage reduce the risk. They do not remove it.
- Availability depends on email delivery. If the provider or the mailbox is slow, the customer cannot log in. Guest checkout reduces the impact on sales.
- Phone (SMS) codes are more costly and add SIM-swap risk and a provider dependency. NIST treats SMS as a restricted channel. Not proposed for now.

Consequence: email codes are reasonable for customers, whose accounts hold moderate-value data. The admin panel controls prices, stock and orders and needs a stronger method: a passkey and/or an authenticator-app second factor, required for every admin, not an email code alone.

## Double opt-in: three different situations

1. **Account registration.** The code that proves control of the email address is already a confirmation of the address. This is not consent to marketing.
2. **Marketing emails (newsletter, promotions).** Separate, explicit, unticked consent, never bundled with account creation or with a purchase. Double opt-in is recommended to prove the consent. To verify the exact requirements in the CNPD directive on direct marketing.
3. **Landing page contact form.** The visitor asks something and expects an answer. From the sources found, marketing consent is not needed to reply to a request, and a code before delivering the message is not shown to be required. The trade-off is fewer fake or mistyped addresses versus lost enquiries. Options: (a) no double opt-in, with anti-spam (honeypot, rate limit, Cloudflare Turnstile) and an automatic acknowledgement email; (b) a verification code before the message is sent. To decide with the owner and the client.

## Criteria

- A customer can register and log in with only name and email.
- No password is stored anywhere for customers.
- Codes are single use, short lived, hashed at rest, and limited in attempts and in resend frequency.
- Sign-in responses do not reveal whether an email has an account.
- Admins cannot log in with an email code alone.
- Marketing consent is separate, explicit and logged with date, text shown and source.
- Every email exists in PT-PT and EN and follows the templates catalog.

## Options

- Customers: email code (chosen direction), magic link, password plus verification, or a combination. Magic links and codes have the same mailbox dependency. A code avoids opening a link on a different device, and a link is one click. Better Auth supports both.
- Admin: passkey, authenticator-app codes, or both.
- Phone verification: deferred until there is a concrete need.

## Open questions

- Guest checkout: allowed, with an optional account created from the order by email code? Recommended, and it shapes the order model.
- Marketing emails at launch, or not at all? This decides whether the consent flow is needed now.
- Contact form: option (a) or (b) above?
- Emails from `@lockmx.com` or from a subdomain, and the exact DNS records Resend requires. Verify at the Resend documentation when the domain is ready.
- Resend plan and pricing: verify at the official page before the client commits.

## Outcome

Updates ADR 0003 (authentication). Creates ADR 0005 (transactional email). Feeds the authentication and customer-area specs.
