# CV Storage And Retention

## Current Decision

CV upload is enabled through the approved private candidate application route.

Uploaded CVs are:

- stored in a private Railway bucket
- emailed to `david@essentialresourcing.co.uk` through Resend
- excluded from Sanity, GitHub, `/public` and analytics
- handled under the Candidate Privacy Notice
- subject to manual review before any client-facing use

Implementation details live in:

```txt
docs/candidate-application-drop.md
```

## Hard Rules

- Do not store CVs in `/public`.
- Do not commit CVs to GitHub.
- Do not expose public CV URLs.
- Do not send CVs to analytics.
- Do not store CVs in Sanity.
- Do not store CV binary files directly in Postgres.
- Do not forward a CV to a client without candidate permission.
- Do not log CV filenames, names, email addresses or file contents on failure.

## Storage Architecture

Postgres:

- CV metadata only when the operations database is enabled.
- Candidate/application linkage through `candidate_files`.
- Original filename where needed.
- File type and size.
- Storage provider and private storage key.
- Upload timestamp.
- Manual review status.
- Retention date.
- Deleted timestamp where applicable.

Private object storage:

- Railway bucket
- private object keys
- no public links
- server-side credentials only

Resend:

- sends the candidate CV attachment to David
- sends candidate confirmation without the CV attached

## File Rules

Allowed file types:

- PDF
- DOC
- DOCX

Maximum file size:

```txt
10MB
```

Validation checks:

- file extension
- browser MIME type where supplied
- file signature
- size
- honeypot
- minimum completion time
- basic rate limiting

## Retention

Candidate retention wording:

```txt
We'll only keep your details for as long as there is a genuine recruitment reason to do so. If you apply for a role or send us your CV, we may keep your details so David can contact you about relevant opportunities. You can ask us to delete your details at any time.
```

Postgres already has fields for:

- consent timestamp
- privacy notice version
- data retention date
- retention category
- retention review date
- retention status
- deletion request date
- deletion approval date
- export request date
- deleted date
- anonymised date
- deletion reason
- anonymisation reason

Formal candidate data/privacy requests are captured through:

```txt
/candidate-privacy/request
```

Workflow notes:

```txt
docs/dsar-framework.md
docs/audit-logging.md
```

Do not release a CV, CV metadata or private candidate notes from a DSAR request
until identity has been checked and the request has been reviewed.

## Next Improvement

Automated malware scanning and an admin-only signed download view are still useful future upgrades, but the public flow is now safe for David's one-person agency use because delivery is private, direct and manually reviewed.
