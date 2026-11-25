# AWS SES: receiving and forwarding mailboxes

Status: in use (being migrated to the v2 function). Written on 2026-10-08. The mailbox catalog and the operational setup.

## Purpose

The company mailboxes (`support@`, `crew@`, `fabio.ramalhinho@`, `privacy@`, `terms@`, `returns@`, `dev@`, `abuse@`, `postmaster@`) do not exist as real mailboxes. SES receives the mail for them and a Lambda forwards a copy to the client's inbox (`lock_mx@outlook.com`). `returns@` (named in the return policy) was added on 2026-11-17: the owner configured it in SES and reported that the client added it to their Gmail as an alias; not checked from this repository. The store's customer and order emails are sent by Shopify, not through this account.

## Mailboxes

| Address | Role | Notes |
|---|---|---|
| `support@lockmx.com` | Public help address for anything about a purchase. | Alias forwarded to the client's mailbox. |
| `crew@lockmx.com` | The contact address shown on `/contact` and in the footer (`apps/web/src/lib/site/contact.ts`). The client answers from it. | Alias forwarded to the client's mailbox. |
| `fabio.ramalhinho@lockmx.com` | Direct relationship with customers, used by the person when he chooses. | Whether he answers from this address or from `support@` is not decided. |
| `privacy@lockmx.com`, `terms@lockmx.com` | Data protection and legal terms contacts. | Exist already. |
| `returns@lockmx.com` | Return requests, named in the return policy. | Exists (configured by the owner, 2026-11-17). |
| `postmaster@lockmx.com`, `abuse@lockmx.com` | Role mailboxes expected by email conventions. Not a legal requirement. | Aliases. |
| `dev@lockmx.com` | Owner of the accounts of third-party services (AWS, Cloudflare, domain registrar). Belongs to the maintainer, see below. | The owner's convention across his projects. |
| `dmarc@lockmx.com` (proposed) | Receives DMARC aggregate reports. | Alias, to keep them out of people's inboxes. |

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
| `ForwardPrefixes` | comma separated mailbox names allowed to be forwarded, for example `support,crew,fabio.ramalhinho,privacy,terms,returns,abuse,postmaster` |
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

SES sending limits and reputation review are account-wide: a high bounce or complaint rate from forwarded mail can put the whole account under review, including any other sending identity in it. Reasons to keep the forwarder lean: the strict rules above, a configuration set to watch the metrics, and keeping the shop's customer mail out of this account (Shopify sends it). Alarms to create: CloudWatch alarms on the SES account bounce and complaint rates well below the review thresholds, and on Lambda errors. Thresholds to confirm against the current SES documentation when the alarms are created.

## Open points

- The SES account is still in the sandbox (2026-10-08): it only sends to verified addresses, so every forwarding destination must be verified until production access is granted.
- `_dmarc.lockmx.com` is `v=DMARC1; p=none;` with no report address (2026-10-08).
- The SES custom MAIL FROM subdomain is `mail.lockmx.com`; it must not be used for anything else.
- Outlook safe-sender rule so that forwarded copies do not land in junk.
- `crew@` was added after this document was written and replaces `fabio.ramalhinho@` as the client mailbox for contacts. The owner reported on 2026-10-09 that its forwarding is configured and working; the value of `ForwardPrefixes` in the deployed stack was not read for this note.
- Whether `fabio.ramalhinho@` and `support@` share the same inbox.
- The SMTP credentials of the SES account are kept locally in `docs/credentials/` (ignored by git). They are never committed, copied into documentation or put in environment files of the repository.
