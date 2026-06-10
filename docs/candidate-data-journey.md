# Candidate Data Journey

## Status

Partially ready.

The candidate journey now has clear public wording, active consent, a Candidate Privacy Notice and confirmation copy. It does not pretend that CV upload or live private storage is complete.

## Audit Summary

Already existed:

- `/candidates` route.
- `/jobs` and job detail routes.
- Candidate and job forms using the shared contact form.
- Server-side Zod validation.
- Honeypot and timing checks.
- Consent-aware analytics utility.
- No public CV upload.
- No CV files stored in `/public`.
- Railway/Postgres schema with candidate, application, file metadata, consent and retention fields.

Missing before this pass:

- Separate Candidate Privacy Notice.
- Candidate-specific consent wording.
- Clear “what happens next” copy near application forms.
- Confirmation screen copy for candidates.
- Candidate confirmation email when Resend is configured.
- Candidate rights wording for deletion/export.
- Candidate privacy documentation.

Improved:

- Added `/candidate-privacy`.
- Linked candidate privacy from candidate page, forms, Privacy Policy and footer.
- Added retention statement near candidate/application forms.
- Added confirmation panel after candidate/job form submission.
- Added candidate confirmation email text through the existing Resend path.
- Changed candidate analytics to use safe event names and avoid candidate PII.
- Added `/admin` to robots disallow rules.

## What Candidates See

Before applying or sending a note, candidates now see:

- why CV upload is not enabled yet
- that David handles the conversation directly
- that details are handled privately
- what happens next after they apply or send a note
- a link to the Candidate Privacy Notice
- how to ask for deletion or export

## Consent

Candidate and job forms require active consent. The checkbox is not pre-ticked.

Candidates agree that Essential Resourcing may store and use their details to contact them about the role and relevant opportunities. They are told they can ask for deletion at any time and are linked to the Candidate Privacy Notice.

Marketing consent is not bundled into application consent.

## Data Storage

Public website content remains in Sanity.

Private candidate/application records should use Railway/Postgres once:

- Railway Postgres is created
- `DATABASE_URL` is set
- migrations have run
- `OPERATIONS_DB_ENABLED=true`

Candidate/application schema fields include:

- consent status
- consent timestamp
- privacy notice version
- data retention date
- deletion/export request fields
- archived/deleted fields
- audit-log support

## Emails

When Resend is configured:

- David receives the admin notification.
- Candidates receive a short confirmation email for candidate/job submissions.
- Confirmation email links to the Candidate Privacy Notice.
- The email does not attach CVs.
- It does not promise every applicant a reply.

Required env vars:

```txt
RESEND_API_KEY
CONTACT_TO_EMAIL
CONTACT_FROM_EMAIL
NEXT_PUBLIC_SITE_URL
```

## Analytics Safety

Candidate form events must not include names, emails, phone numbers, CV filenames or message content.

Current safe events:

- `candidate_enquiry_submitted`
- `job_application_start`
- `job_application_submission`
- `form_error`

Safe properties:

- form type
- brief type
- job slug

## Manual Legal Review

The Candidate Privacy Notice is launch wording, not legal advice.

Before public launch, David should have the final wording checked against:

- live database setup
- email provider setup
- CV storage provider
- retention policy
- client-sharing process
- deletion/export request process
- admin access controls

No fake compliance. No public CV links. No candidate data in analytics.
