# AWS SES: receiving and forwarding mailboxes

Status: in use (being migrated to the v2 function). Written on 2026-10-08. The mailbox catalog and the reasons for splitting SES and Resend are in `../decisions/0005-transactional-email-resend.md`; this file is the operational setup.

## Purpose

The company mailboxes (`support@`, `fabio.ramalhinho@`, `privacy@`, `terms@`, `dev@`, `abuse@`, `postmaster@`) do not exist as real mailboxes. SES receives the mail for them and a Lambda forwards a copy to the client's inbox (`lock_mx@outlook.com`). Transactional shop mail (`shop@`, send only) does not use this path: it goes through Resend on its own subdomain, so the two reputations stay separate.

## Flow

1. DNS: the root domain has an MX record pointing to SES inbound in the region of the receipt rules: `lockmx.com MX 10 inbound-smtp.us-east-1.amazonaws.com` (checked with `nslookup` on 2026-10-08). The MX on `mail.lockmx.com` (`feedback-smtp.us-east-1.amazonses.com`) belongs to the custom MAIL FROM and only handles bounces of sent mail; it does not make the domain receive mail. Without the root MX nothing reaches S3 and the function is never invoked.
2. A receipt rule per mailbox matches the recipient and runs two actions: store the message in S3 under `<mailbox>/<messageId>`, then invoke the Lambda.
3. The Lambda reads the object from S3, decides whether to forward, rebuilds a MIME message (HTML body preferred, text fallback, attachments kept) and sends it with SES v2 from the mailbox address to the client's inbox, with `Reply-To` set to the original sender.

Code: `aws-ses-forwarder.py` (this folder). Locally tested with a stubbed `boto3`; not yet tested against real AWS.

## Lambda configuration

| Environment variable | Meaning |
|---|---|
| `Region` | SES region |
| `MailS3Bucket` | bucket where the receipt rules store the mail |
| `MailRecipient` | inbox that receives the copies |
| `ForwardPrefixes` | comma separated mailbox names allowed to be forwarded, for example `support,fabio.ramalhinho,privacy,terms,dev,abuse,postmaster` |
| `ConfigurationSet` | optional SES configuration set, to get bounce and complaint metrics for forwarded mail |

Function settings to raise from the defaults (128 MB and 3 s, with which the function timed out in a console test on 2026-10-08): memory (the message is read, parsed and serialized again, so several copies of it live in memory; 512 MB or more) and timeout (60 s for large attachments). The IAM role needs `s3:GetObject` on the bucket and `ses:SendEmail` for the sending identity.

### The `dev@` mailbox

`dev@` belongs to the maintainer, not to the client. The rule `forward-to-dev` invokes a second function with the same code, `MailRecipient` set to the maintainer's mailbox and `ForwardPrefixes=dev`; `dev` is left out of `ForwardPrefixes` in the main function.

If the destination mailbox is itself forwarded by another SES setup, that second forwarder must also keep an existing `Reply-To`. A forwarder that uses `Return-Path` first replaces the sender with the SES bounce address of the first hop (seen on 2026-10-08, fixed by using this same function there).

### Testing in the console

The default console test event has no `Records` key and fails with `KeyError: 'Records'`. Use an event shaped like the SES one (`Records[0].ses.mail.messageId`, `receipt.recipients` and the three verdicts), with `messageId` equal to the name of an object that exists under `<mailbox>/` in the bucket. `AMAZON_SES_SETUP_NOTIFICATION` is the file SES writes when the S3 action is configured, not a received message.

## Forwarding rules in the function

- Only mailboxes listed in `ForwardPrefixes` are forwarded. A mailbox that is not listed (for example a future `dmarc@` that only stores reports) is stored in S3 and not forwarded.
- Messages with a spam or virus verdict of `FAIL` are not forwarded.
- `abuse@` and `postmaster@` additionally require a DKIM verdict of `PASS`. They are published addresses that attract unsolicited and forged mail, and each forwarded copy counts in the account's bounce and complaint rates.
- The `Reply-To` of the copy is the original `Reply-To`, else `From`, else `Return-Path`.
- The function iterates over the recipients matched by SES. With one rule per mailbox each invocation normally has one recipient.
- If forwarding fails for any recipient, the function raises after trying all of them, so the failure is visible in Lambda errors.

## Receipt rules

One rule per mailbox, in the active rule set. For each: recipient condition (the full address), action 1 S3 (bucket, object key prefix `<mailbox>/`), action 2 Lambda (invocation type `Event`). Moving to the v2 function: create the new function, test it in the console with a sample SES event, switch the rules one at a time starting with low-risk mailboxes (`dev@`, `terms@`), and remove the Lambda action from mailboxes that must only store mail.

## Limits to know

| Item | Value | Verified |
|---|---|---|
| Maximum message size when SES stores to S3 | 40 MB including headers | Yes, SES documentation, 2026-10-08 |
| Maximum size of a raw message sent with SES v2 | 40 MB | Taken from the comment in the original function; not checked in the documentation |
| Re-encoding | Base64 makes attachments about a third larger, so a message near 40 MB inbound may exceed the outbound limit | Reasoning, not measured |
| Destination inbox size limit (Outlook.com) | Unknown | No. A rejection counts as a bounce on the SES account |

## Reputation

SES sending limits and reputation review are account-wide: a high bounce or complaint rate from forwarded mail can put the whole account under review, including any other sending identity in it. Reasons to keep the forwarder lean: the strict rules above, a configuration set to watch the metrics, and keeping the shop's customer mail out of this account (Resend). Alarms to create: CloudWatch alarms on the SES account bounce and complaint rates well below the review thresholds, and on Lambda errors. Thresholds to confirm against the current SES documentation when the alarms are created.

## Open points

- The SES account is still in the sandbox (2026-10-08): it only sends to verified addresses, so every forwarding destination must be verified until production access is granted.
- `_dmarc.lockmx.com` is `v=DMARC1; p=none;` with no report address (2026-10-08).
- Receiving domain and sending subdomain names (planned: Resend on `shop.lockmx.com`, SES custom MAIL FROM on `mail.lockmx.com`); the MAIL FROM subdomain must not be used for anything else.
- The Resend DNS records must be checked in the Resend dashboard before touching DNS, to confirm they do not collide with the SES records.
- Outlook safe-sender rule so that forwarded copies do not land in junk.
- Whether `fabio.ramalhinho@` and `support@` share the same inbox.
- The SMTP credentials of the SES account are kept locally in `docs/credentials/` (ignored by git). They are never committed, copied into documentation or put in environment files of the repository.
