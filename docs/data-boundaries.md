# Data Boundaries

## Status

Ready as a technical boundary. Still needs operational discipline and legal/privacy review before launch.

Plain rule:

```txt
Sanity is for public website content. Do not store private candidate/client data, CVs, application records or internal notes in Sanity.
```

## Audit Summary

Sanity currently stores public website content:

- site settings
- homepage
- navigation
- pages
- services
- public job adverts
- insights
- case studies
- salary snapshots
- testimonials
- FAQs
- people/profile content
- CTA blocks
- proof/logo items
- redirects
- public media assets
- public SEO metadata

Railway Postgres is the staged private operations store for:

- enquiries
- candidate records
- application records
- LinkedIn/profile URLs submitted through candidate forms
- private client/contact records
- CV/file metadata
- consent records
- retention dates
- statuses
- candidate communication preferences
- tasks
- notes
- DSAR requests
- audit logs
- admin workflow records
- WhatsApp Business message status logs
- Recruiter Labs shortlists, hashed access tokens, feedback and interview
  requests
- Recruiter Labs launch-gate, sharing consent, CV access approval and rollback
  state

No Sanity schema was found for private candidate records, applications, CV files, DSAR requests, audit logs, private consent records or WhatsApp messaging logs.

No Sanity mutation client was found in the form submission paths.

No CV upload flow exists on the public website.

## Boundary Decision

### Sanity May Store

- public job advert title
- public job advert slug
- public salary/rate range if intended to be public
- public location and hybrid information
- public job description
- public service pages
- public insight articles
- public case studies
- public salary snapshots
- public testimonials with permission
- public SEO metadata
- public CTAs
- public navigation and footer
- public site settings
- public media assets

### Sanity Must Not Store

- candidate names submitted through forms
- candidate email addresses
- candidate phone numbers
- CV files
- CV file URLs
- cover letters
- private job application records
- LinkedIn/profile URLs submitted through forms
- private client contact records
- private hiring briefs containing named contacts
- private internal notes
- candidate statuses
- application statuses
- lead history
- DSAR requests
- audit logs
- private consent records
- private WhatsApp messaging logs
- sensitive admin-only records

### Postgres / Private Backend Should Store

- enquiries
- candidate records
- application records
- private client/contact records
- CV metadata
- LinkedIn/profile URLs submitted through candidate/application forms
- consent records
- retention dates
- statuses
- tasks
- notes
- lead history
- DSAR requests
- audit logs
- admin workflow records
- candidate status updates
- Recruiter Labs shortlists
- hashed client access tokens
- branded candidate profile review state
- candidate sharing consent and CV access approval state
- shortlist feedback
- interview requests

## Public Job To Private Application Pattern

Public job advert:

```txt
Sanity
```

Allowed fields:

- job ID
- title
- slug
- public description
- public salary/rate range
- public location
- public status
- public SEO metadata
- public application routing label/email if intended for publication

Private application:

```txt
Railway Postgres
```

Private fields:

- application ID
- Sanity job ID or slug
- candidate ID
- CV metadata ID
- cover/application message
- consent to store data
- status
- created and updated timestamps

The public job page reads from Sanity. The application form must write private candidate/application data to the private backend only.

## CV And File Boundary

Hard rule:

```txt
No private CV files or private CV URLs in Sanity.
```

Future flow:

1. Candidate uploads CV through a secure form.
2. File goes to private object storage.
3. Metadata goes to Postgres.
4. Application record links to the metadata.
5. Admin dashboard accesses CV through an authenticated/signed route.
6. Audit log records CV access.
7. Retention engine can delete or anonymise records later.

This is not implemented yet. Do not add an unsafe interim upload route.

## Analytics Boundary

Do not send these to analytics:

- names
- email addresses
- phone numbers
- CV filenames
- cover letters
- messages
- exact candidate identifiers

Allowed analytics properties:

- form type
- page path
- job slug
- generic status
- source
- non-identifying consent state

## Code Guardrails

Added:

- `src/lib/data-boundaries.ts`
- `src/tests/unit/data-boundaries.test.ts`
- warning comment in `src/lib/sanity.ts`
- editor-facing warnings in `sanity/schemas/index.ts`

The test checks:

- Sanity document types remain public-content types.
- risky private field names are not defined in Sanity schemas.
- contact and DSAR server actions do not use Sanity mutation APIs.

This is a guardrail, not a substitute for judgement. A developer can still write bad free text into a public content field; editors must keep private data out of Sanity.

## Sanity Schema Review

Risky field names checked:

- candidateName
- candidateEmail
- candidatePhone
- cv
- cvFile
- cvFileUrl
- coverLetter
- applicationRecord
- clientContactEmail
- privateNotes
- internalStatus
- leadHistory
- consentRecord
- dsarRequest
- auditLog

No matching private operational fields are currently defined.

Public fields that need editorial care:

- `job.applicationEmail`: public routing inbox only, not a candidate email.
- `salarySnapshot.candidateAvailabilityNotes`: anonymous market-level notes only.
- `testimonial.name`: named people only with permission.
- `person.email`: public profile email only.
- `redirect.notes`: technical redirect notes only, not private lead history.

## Manual Actions

David should approve:

- whether public job application email should stay visible
- testimonial permission process
- case study naming rules
- who can edit Sanity content
- who can access Railway/Postgres private operations
- whether any existing Sanity dataset content needs manual privacy review before launch

No private cleanup was performed because no private Sanity schemas or form-to-Sanity write paths were found.

## Production Readiness

Partially ready.

The code boundary is clear and guarded. Launch still depends on:

- Railway Postgres being configured for private operations
- migrations being run
- final privacy/legal review
- Sanity editor training
- private CV storage decision before any CV upload is enabled

No candidate PII in Sanity. No CVs in Sanity. No private records in public CMS queries. No fake compliance.
