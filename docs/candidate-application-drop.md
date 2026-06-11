# Candidate Application Drop

Audit date: 11 June 2026

## Status

Staged, not live for CV upload.

The website now has a passwordless application component for candidate and job
routes. It keeps the current simple journey:

- no account creation
- name
- email
- optional phone
- LinkedIn/profile URL
- short note
- preferred contact method
- application/data-processing consent
- explicit WhatsApp reply consent when WhatsApp is selected
- optional talent-pool consent
- Candidate Privacy Notice acknowledgement

The CV upload control is deliberately disabled.

## Audit Findings

Already in place before this pass:

- `/candidates` route.
- Job detail application form.
- Name, email, optional phone, LinkedIn/profile URL, message and preferred
  contact method.
- Active consent checkbox.
- Candidate Privacy Notice.
- Candidate confirmation copy.
- Safe analytics event names with no candidate PII.
- Postgres schema for future candidate, application and file metadata.
- CV storage and retention guidance in `docs/cv-storage-and-retention.md`.

Missing before this pass:

- dedicated passwordless application-drop component
- separate Candidate Privacy Notice acknowledgement
- optional talent-pool consent
- explicit staged CV upload route/status
- validation rules for future CV file type and size
- clear API response that CV upload is not yet enabled

## What Was Added

- `CandidateApplicationDrop` component.
- Disabled CV upload field with clear plain-English copy.
- Locked `/api/candidate-application-drop` route that returns a safe 503 while
  storage is not approved.
- Server-side CV validation rules for a future storage adapter:
  - PDF
  - DOC
  - DOCX
  - 10MB maximum
- Separate privacy acknowledgement on candidate/job forms.
- Optional talent-pool consent that is not treated as marketing consent.
- Private operations metadata for LinkedIn/profile URL, job slug, privacy
  acknowledgement, WhatsApp reply consent and talent-pool consent.

## Storage Decision

Do not enable CV upload yet.

Required before CV upload can be live:

1. Private object storage provider chosen.
2. Private bucket configured.
3. Storage secrets added in Railway only.
4. Signed admin-only download route built.
5. Virus scanning or manual review process approved.
6. File access audit logging complete.
7. Retention/deletion process approved.
8. Legal/privacy wording reviewed.

Until then, candidates should use LinkedIn/profile URL and a short note.

## Environment Variables

Feature flag:

```txt
FEATURE_CANDIDATE_APPLICATION_DROP=false
```

Future private storage variables:

```txt
CANDIDATE_CV_STORAGE_PROVIDER=
CANDIDATE_CV_STORAGE_BUCKET=
CANDIDATE_CV_STORAGE_SIGNING_SECRET=
```

These are server-side only. Do not expose storage secrets with
`NEXT_PUBLIC_*`.

## API Route

Route:

```txt
/api/candidate-application-drop
```

Current behaviour:

- returns `503`
- does not store files
- does not create public URLs
- does not write CVs to Sanity
- does not send CV data to analytics

This route exists as a safe staged boundary, not as a live upload service.

## Manual Blockers

David must approve the storage provider, retention approach, access workflow and
legal/privacy wording before CV upload is enabled.

No public CV links. No CVs in Sanity. No CVs in GitHub. No faff.
