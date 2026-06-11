# DSAR Framework

## Status

Staged and safer, with manual launch checks still required.

Essential Resourcing now has a clear public route for candidate data/privacy
requests, a private Postgres workflow for recording them when Railway operations
are enabled, and a secure email-confirmation step when Resend is configured.

This is not legal advice. David should have the final privacy wording, retention rules and DSAR process reviewed before launch.

## Plain-English Meaning

DSAR means a person asks what personal data is held about them. Related requests can include correction, deletion, withdrawal of consent, restriction or objection.

For recruitment, this needs care. Candidate data can include applications, notes, consent records, messages, CV metadata and future file records. It should not be exposed through an unauthenticated public endpoint.

## Public Route

Route:

```txt
/candidate-privacy/request
```

The form supports:

- copy/export of my data
- delete my candidate details
- correct or update my details
- withdraw consent
- restrict how my data is used
- object to processing
- ask a privacy question

The confirmation copy is neutral:

```txt
Thanks. Your request has been received. If email confirmation is needed, check your inbox. David will review it before any data is released, changed or deleted.
```

The public site does not confirm whether a matching candidate record exists.

## Submission Safety

Implemented:

- server-side Zod validation
- honeypot spam field
- minimum completion time
- basic in-memory rate limiting
- authority confirmation checkbox
- Candidate Privacy Notice and Privacy Policy acknowledgement
- no public candidate lookup
- no one-click export
- no one-click deletion
- no PII sent to analytics

If neither Postgres storage nor email delivery is configured, the form does not pretend the request has been handled. It tells the person to email David directly.

## Database Workflow

Migration:

```txt
database/migrations/003_data_subject_requests.sql
database/migrations/017_dsar_email_verification.sql
```

Table:

```txt
data_subject_requests
```

Core fields:

- request type
- requester name, email and optional phone
- requester email hash
- message
- status
- verification status
- assigned admin
- related candidate/contact/enquiry links
- due date
- completion notes
- IP/user-agent hashes where a privacy salt exists
- email verification token hash
- email verification requested, expiry and confirmed timestamps
- metadata

Statuses:

- received
- verifying_identity
- in_review
- awaiting_info
- approved
- rejected
- completed
- closed

Verification statuses:

- not_started
- pending
- verified
- failed
- not_required

When Postgres is enabled, each request creates:

- a `data_subject_requests` row
- an `activities` row
- an `audit_logs` row using the `dsar_request_created` action and a hashed requester identifier

The request also receives retention lifecycle fields:

- `retention_category`
- `data_retention_until`
- `retention_review_at`
- `retention_status`
- `retention_last_checked_at`

DSAR records appear in the staged retention review queue. They are not deleted
or anonymised automatically.

## Email Confirmation

When all of these are configured:

- `OPERATIONS_DB_ENABLED=true`
- `DATABASE_URL`
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `NEXT_PUBLIC_SITE_URL`

the first submission creates a private request with:

- `status='verifying_identity'`
- `verification_status='pending'`
- a hashed confirmation token
- a token expiry, defaulting to 24 hours

The requester receives a link to:

```txt
/candidate-privacy/request/confirm
```

That page does not verify the request on page load. The person has to press a
confirmation button, which posts the token to:

```txt
/api/data-request/confirm
```

On success, the system:

- clears the stored token hash
- marks the request email as verified
- moves the request to `in_review`
- writes activity and audit records
- emails David that a verified request is ready for review

Email confirmation proves control of that inbox only. It is not full legal
identity verification and it does not release, correct, delete or anonymise
data.

## Admin Workflow

Route:

```txt
/admin
```

The admin dashboard is protected by the existing CMS session gate and is noindexed.

It now shows:

- open data/privacy request count
- latest data/privacy requests
- request type
- status
- verification status
- due date

This is an operations workflow, not a legal automation platform.

## Identity Verification

Current state:

- Email confirmation is available when Postgres and Resend are configured.
- Manual identity review is still required.
- Default verification status is `pending`.
- No export is generated automatically.
- No record is deleted automatically.

David should verify identity before releasing, correcting or deleting private data. A practical first process is:

1. Confirm the requester controls the email address used on the original record.
2. Ask for extra context where needed, such as the role applied for or approximate date of contact.
3. Record the verification decision in the admin workflow.
4. Only then prepare an export, correction or deletion/anonymisation action.

## Export Workflow

Current state:

- Manual export instructions only.
- No unauthenticated export endpoint exists.
- No automatic zip or download link exists.

Manual export should review:

- enquiries
- candidates
- applications
- consent records
- activity records
- audit logs
- file metadata
- future private CV storage

Do not include confidential third-party client notes until legally reviewed.

Future stage:

- verified admin-only export generator
- structured JSON/CSV package
- short-lived signed download
- access logging
- expiry and cleanup

When those steps are built, they should use the central audit utility described in:

```txt
docs/audit-logging.md
docs/data-retention-engine.md
```

## Deletion And Anonymisation Workflow

Current state:

- Requests can be captured and tracked.
- Candidate/application schema already contains deletion/export fields.
- No public delete endpoint exists.

Deletion requests should be reviewed because erasure is not always absolute. Some records may need to be retained for legal, contract, fraud prevention or compliance reasons.

Manual actions may include:

- mark candidate as delete requested
- remove or anonymise candidate details where appropriate
- delete or revoke access to private CV files once storage exists
- retain a minimal audit trail of the request and outcome where appropriate
- record completion notes and date

## Emails

If Resend and Postgres are configured, the DSAR action sends:

- requester confirmation link
- admin notification after the requester confirms the email address

If email verification is not available but Resend is configured, the fallback
manual route can still send:

- admin notification: new data/privacy request received
- requester confirmation: request received and identity verification may be needed

Required existing env vars:

```txt
RESEND_API_KEY
CONTACT_TO_EMAIL
CONTACT_FROM_EMAIL
NEXT_PUBLIC_SITE_URL
DSAR_EMAIL_VERIFICATION_TOKEN_HOURS
```

The admin email avoids sending unnecessary message detail. David should review the request in the protected admin workflow.

## Testing Checklist

Before launch:

- submit each request type
- confirm required validation works
- confirm honeypot blocks fake submissions
- confirm timing guard blocks instant submissions
- confirm the success message does not reveal whether a record exists
- confirm request writes to `data_subject_requests`
- confirm activity and audit rows are created
- confirm admin dashboard is protected
- confirm unauthenticated users cannot view `/admin`
- confirm export is not available without verification
- confirm delete is not available without admin review
- confirm no PII is sent to analytics
- confirm emails send when Resend is configured
- confirm confirmation links open the confirmation page without verifying on page load
- confirm `/api/data-request/confirm` verifies a valid token
- confirm invalid or expired tokens fail safely
- confirm verified requests move to admin review, not export/delete
- confirm emails fail safely when provider is unavailable
- run `npm run lint`
- run `npm run typecheck`
- run `npm run build`

## Manual Legal/Privacy Actions

David must approve before launch:

- final Privacy Policy wording
- final Candidate Privacy Notice wording
- retention periods
- lawful basis wording
- identity verification process
- when deletion means deletion versus anonymisation
- what client/confidential notes can be included in exports
- admin access policy
- backup and database retention policy

No fake compliance. Verify identity. Protect candidate data. Keep the audit trail.
