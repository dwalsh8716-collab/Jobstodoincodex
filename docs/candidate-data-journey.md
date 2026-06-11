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
- Clear architecture direction: Sanity is public CMS; Postgres is private operations.

Missing before this pass:

- Separate Candidate Privacy Notice.
- Candidate-specific consent wording.
- Separate Candidate Privacy Notice acknowledgement.
- Optional talent-pool consent.
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
- Added `/candidate-privacy/request` for data export, deletion, correction,
  withdrawal and privacy questions.
- Added a Postgres-backed DSAR request workflow with manual verification.
- Added candidate transparency standards for salary, hybrid reality, interview
  process, data handling and quick-question routes.
- Added a staged passwordless application-drop component with CV upload safely
  disabled until private storage is approved.
- Added a profile-or-note application rule so candidates do not have to write a
  cover letter when a useful profile link is enough.
- Added private application metadata writes for job applications when the
  operations database is enabled.

Detailed job/candidate transparency standards live in:

```txt
docs/recruiter-labs-candidate-transparency.md
docs/candidate-application-drop.md
```

## What Candidates See

Before applying or sending a note, candidates now see:

- why CV upload is not enabled yet
- that David handles the conversation directly
- that details are handled privately
- what happens next after they apply or send a note
- a link to the Candidate Privacy Notice
- how to ask for deletion or export
- where to submit a formal data/privacy request
- optional talent-pool consent, kept separate from marketing consent
- explicit WhatsApp reply consent when WhatsApp is selected as the preferred
  candidate route
- a staged CV upload control that explains why upload is not live yet
- a profile-or-note application route that is designed to take under two
  minutes

## Consent

Candidate and job forms require active consent. The checkbox is not pre-ticked.

Candidates agree that Essential Resourcing may store and use their details to contact them about the role and relevant opportunities. They are told they can ask for deletion at any time and are linked to the Candidate Privacy Notice.

Candidates separately confirm that they have read the Candidate Privacy Notice.

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
- retention category
- retention review date
- retention status
- deletion/export request fields
- archived/deleted fields
- audit-log support
- future WhatsApp preference, opt-in and opt-out metadata
- email, phone and WhatsApp contact preference consent flags
- future Loxo reference IDs and CRM sync audit events
- application source page and application method

## Job Application Metadata

When the operations database is enabled and migrations have been run, job
submissions create a private application record as well as the existing enquiry
trail.

Stored fields include:

- applicant name, email and optional phone
- job slug and source page
- profile URL
- short note, if supplied
- preferred contact method
- WhatsApp reply consent, if WhatsApp is selected
- optional talent-pool consent
- Candidate Privacy Notice version and acknowledgement

It does not store CV files. The future `candidate_files` table is metadata-only
until private storage, signed access, scanning, retention/deletion and legal
review are complete.

Hard boundary:

```txt
Candidate names, emails, phone numbers, application messages, CV files, CV URLs
and private recruitment notes must not be stored in Sanity.
```

Future WhatsApp/Loxo communication sync must stay private and metadata-first.
Do not store raw WhatsApp message bodies in Sanity or public analytics. The
discovery notes live in:

```txt
docs/recruiter-labs-whatsapp-crm-sync.md
docs/recruiter-labs-candidate-whatsapp-preferences.md
```

Full boundary notes:

```txt
docs/data-boundaries.md
```

## Retention Review

Candidate and job enquiries now receive a retention category and review date
when written to the private operations database.

Starting categories:

- job/application enquiry: `role_application`
- speculative candidate enquiry: `general_candidate_enquiry`
- talent pool record: `talent_pool` only after clear opt-in

The staged retention engine is documented here:

```txt
docs/data-retention-engine.md
```

It runs in dry-run mode by default, creates admin review tasks before any
action, and does not delete or anonymise candidate data automatically.

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

The data/privacy request form does not send candidate names, emails, phone
numbers, request details or request types to analytics.

## Data And Privacy Requests

Route:

```txt
/candidate-privacy/request
```

This route supports candidate requests for access/export, deletion, correction,
consent withdrawal, restriction, objection and privacy questions.

It does not confirm whether a matching record exists. It does not provide an
automatic export. It does not delete records from a public form submission.

When Railway/Postgres operations are enabled, requests are stored in
`data_subject_requests` and logged in activity/audit tables. Identity
verification remains manual before any export, correction or deletion.

Full workflow notes:

```txt
docs/dsar-framework.md
```

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
- DSAR identity verification process
- admin access controls

No fake compliance. No public CV links. No candidate data in analytics.
