import os
import boto3
import email
from botocore.exceptions import ClientError
from email.mime.multipart import MIMEMultipart

# Environment variables:
#   Region            AWS region of SES
#   MailS3Bucket      bucket where the SES receipt rules store incoming mail
#   MailRecipient     mailbox that receives the forwarded copies
#   ForwardPrefixes   comma separated mailbox names that may be forwarded
#                     (support,fabio.ramalhinho,privacy,terms,dev,abuse,postmaster)
#   ConfigurationSet  optional SES configuration set used for the forwarded mail

STRICT_PREFIXES = {'abuse', 'postmaster'}


def allowed_prefixes():
    raw = os.environ.get('ForwardPrefixes', '')
    return {p.strip().lower() for p in raw.split(',') if p.strip()}


def should_forward(prefix, receipt):
    if prefix not in allowed_prefixes():
        return False
    if receipt['virusVerdict']['status'] == 'FAIL':
        return False
    if receipt['spamVerdict']['status'] == 'FAIL':
        return False
    if prefix in STRICT_PREFIXES and receipt['dkimVerdict']['status'] != 'PASS':
        return False
    return True


def get_message_from_s3(object_key):
    incoming_email_bucket = os.environ['MailS3Bucket']
    client_s3 = boto3.client("s3")
    object_s3 = client_s3.get_object(Bucket=incoming_email_bucket, Key=object_key)
    return {"file": object_s3['Body'].read()}


def reply_address(mailobject):
    # Reply to the person who wrote, not to the bounce address (Return-Path).
    return mailobject['Reply-To'] or mailobject['From'] or mailobject['Return-Path'] or ''


def create_message(file_dict, dynamic_sender):
    recipient = os.environ['MailRecipient']

    # Parse the email from bytes (handles binary content safely).
    mailobject = email.message_from_bytes(file_dict['file'])

    subject_original = mailobject['Subject'] or ''

    # Create a new MIMEMultipart message for forwarding.
    msg = MIMEMultipart()
    msg['Subject'] = subject_original
    msg['From'] = dynamic_sender
    msg['To'] = recipient
    msg['Reply-To'] = reply_address(mailobject)

    # Prefer HTML body if available; fallback to plain text; attach other parts (e.g., attachments).
    html_part = None
    text_part = None
    attachments = []

    for part in mailobject.walk():
        content_type = part.get_content_type()
        filename = part.get_filename()

        if content_type == 'text/html':
            html_part = part
        elif content_type == 'text/plain':
            text_part = part
        elif content_type == 'text/calendar' or (filename and filename.endswith('.ics')):
            attachments.append(part)
        elif filename or content_type.startswith(('image/', 'application/', 'audio/', 'video/')):
            attachments.append(part)

    # Attach the preferred body part.
    if html_part:
        msg.attach(html_part)
    elif text_part:
        msg.attach(text_part)

    # Attach any additional parts (e.g., files).
    for att in attachments:
        msg.attach(att)

    return {
        "Source": dynamic_sender,
        "Destinations": recipient,
        "Data": msg.as_bytes(),
    }


def send_email(message):
    # SES v2 raw messages support up to 40 MB.
    client_ses = boto3.client('sesv2', os.environ['Region'])

    params = {
        'FromEmailAddress': message['Source'],
        'Destination': {'ToAddresses': [message['Destinations']]},
        'Content': {'Raw': {'Data': message['Data']}},
    }
    configuration_set = os.environ.get('ConfigurationSet')
    if configuration_set:
        params['ConfigurationSetName'] = configuration_set

    try:
        response = client_ses.send_email(**params)
        return "Email sent! Message ID: " + response['MessageId']
    except ClientError as e:
        return e.response['Error']['Message']


def lambda_handler(event, context):
    ses_notification = event['Records'][0]['ses']
    message_id = ses_notification['mail']['messageId']
    receipt = ses_notification['receipt']

    # The recipients that SES matched, not the To/Cc headers.
    failures = []
    for recipient in receipt['recipients']:
        prefix = recipient.split('@')[0].lower()

        if not should_forward(prefix, receipt):
            print(f"Not forwarded: {recipient} | spam={receipt['spamVerdict']['status']} "
                  f"virus={receipt['virusVerdict']['status']} dkim={receipt['dkimVerdict']['status']}")
            continue

        object_key = f"{prefix}/{message_id}"
        print(f"Recipient: {recipient} | S3 key: {object_key}")

        try:
            file_dict = get_message_from_s3(object_key)
            message_to_send = create_message(file_dict, recipient)
            print(send_email(message_to_send))
        except Exception as e:
            print(f"Error processing {recipient}: {str(e)}")
            print(f"Full event: {ses_notification}")
            failures.append(recipient)

    if failures:
        raise RuntimeError(f"Forwarding failed for: {', '.join(failures)}")
    return 'done'
