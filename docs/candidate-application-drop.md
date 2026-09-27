# Candidate Application Drop

Audit date: 15 September 2026

## Status

CV upload is live when all of the following are configured on the server:

- `FEATURE_CANDIDATE_APPLICATION_DROP=true`
- private Railway bucket credentials
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL=david@essentialresourcing.co.uk`
- `CONTACT_FROM_EMAIL=website@mail.essentialresourcing.co.uk`

The public candidate and job application blocks use `/api/candidate-application-drop`.

## User Journey

Candidates can submit:

- name
- email
- optional mobile
- CV file
- optional LinkedIn/profile URL
- optional short note
- preferred contact method
- WhatsApp reply consent where relevant
- optional talent-pool consent
- Candidate Privacy Notice acknowledgement

The form accepts PDF, DOC and DOCX files up to 10MB.

## Delivery

On a valid upload:

1. The file extension, MIME type and file signature are validated.
2. When ClamAV is enabled, the CV must pass its malware scan before storage or email delivery.
3. The CV is written to the private Railway bucket with a retention date and scan status.
4. The CV is emailed to `david@essentialresourcing.co.uk` through Resend as an attachment.
5. The candidate receives a confirmation email without the CV attached.
6. The response gives the candidate a reference number.

No CV is stored in Sanity, GitHub or `/public`. No public file URL is created.

## Safety Rules

- Validate extension, MIME type and file signature before accepting a CV.
- Keep stored files private.
- Do not send uploaded CVs to analytics.
- Do not log candidate names, email addresses, filenames or CV content on failure.
- David must manually review the CV before forwarding it to any client.
- Candidates can request access, correction or deletion through `/candidate-privacy/request`.
- A failed email delivery removes the newly stored object to avoid an orphaned CV.

## Environment Variables

```txt
FEATURE_CANDIDATE_APPLICATION_DROP=true
CANDIDATE_CV_STORAGE_PROVIDER=railway_bucket
CANDIDATE_CV_STORAGE_BUCKET=
CANDIDATE_CV_STORAGE_ENDPOINT=
CANDIDATE_CV_STORAGE_REGION=auto
CANDIDATE_CV_STORAGE_ACCESS_KEY_ID=
CANDIDATE_CV_STORAGE_SECRET_ACCESS_KEY=
CANDIDATE_CV_STORAGE_FORCE_PATH_STYLE=false
CANDIDATE_CV_EMAIL_DELIVERY=resend_attachment
CANDIDATE_CV_MALWARE_SCAN_ENABLED=false
CANDIDATE_CV_MALWARE_SCAN_HOST=
CANDIDATE_CV_MALWARE_SCAN_PORT=3310
CANDIDATE_CV_MALWARE_SCAN_TIMEOUT_MS=12000
RETENTION_CV_FILE_MONTHS=6
RESEND_API_KEY=
CONTACT_TO_EMAIL=david@essentialresourcing.co.uk
CONTACT_FROM_EMAIL=website@mail.essentialresourcing.co.uk
```

These are server-side only. Do not expose storage credentials with `NEXT_PUBLIC_*`.

## Malware Scanning

The application supports a private ClamAV `clamd` service over the INSTREAM protocol. When `CANDIDATE_CV_MALWARE_SCAN_ENABLED=true`, scans fail closed: an unavailable scanner, timeout, malformed response or infection prevents storage and delivery.

Keep manual review even when a file scans clean. Do not send candidate CVs to public multi-engine scanning services.

## Retention And Deletion

Uploads carry a private `retention-until` object metadata value. Run:

```txt
npm run retention:cv:check
```

This is dry-run only and lists expired private objects. Deletion requires both `--apply` and `CV_RETENTION_DELETION_APPROVED=true`, so no scheduled job can silently delete candidate records.

No public CV links. No CVs in Sanity. No faff.
