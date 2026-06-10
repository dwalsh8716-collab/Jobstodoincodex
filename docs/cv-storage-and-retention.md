# CV Storage And Retention

## Current Decision

CV upload is intentionally not enabled on the public website.

That is the correct decision until private storage, signed access, retention rules, deletion handling and legal review are complete.

## Hard Rules

- Do not store CVs in `/public`.
- Do not commit CVs to GitHub.
- Do not expose public CV URLs.
- Do not send CVs to analytics.
- Do not store CVs in Sanity unless a deliberate private storage decision is made.
- Do not store CV binary files directly in Postgres.
- Do not email full CV attachments around by default.

## Intended Future Architecture

Postgres:

- CV metadata only.
- Owner type and owner ID.
- Original filename where needed.
- File type and size.
- Storage provider and private storage key.
- Upload timestamp.
- Virus/manual scan status.
- Retention date.
- Deleted timestamp.
- DSAR/request linkage where a candidate asks for export, deletion or correction.

Private object storage:

- actual CV files
- private bucket
- signed URLs
- admin-only access
- expiry on download links

Possible providers:

- Cloudflare R2
- AWS S3
- Supabase Storage
- UploadThing with private access

## File Rules

Allowed future file types:

- PDF
- DOC
- DOCX

Recommended future max size:

```txt
10MB
```

Before enabling upload, add:

- file type validation
- file size validation
- clear error states
- virus scanning or manual review process
- private download route
- audit log for upload/view/download/delete

## Retention

Candidate retention wording:

```txt
We'll only keep your details for as long as there is a genuine recruitment reason to do so. If you apply for a role or send us your CV, we may keep your details so David can contact you about relevant opportunities. You can ask us to delete your details at any time.
```

Postgres already has fields for:

- consent timestamp
- privacy notice version
- data retention date
- deletion request date
- export request date
- deleted date
- deletion reason

Formal candidate data/privacy requests are captured through:

```txt
/candidate-privacy/request
```

Workflow notes:

```txt
docs/dsar-framework.md
```

Do not release a CV, CV metadata or private candidate notes from a DSAR request
until identity has been checked and the request has been reviewed.

## Manual Actions Before CV Upload

1. Choose the storage provider.
2. Configure private bucket/storage.
3. Add storage env vars.
4. Build signed admin download route.
5. Add file validation.
6. Add virus scanning or manual review process.
7. Add audit logging for access.
8. Confirm retention/deletion workflow.
9. Get legal/privacy wording reviewed.
10. Confirm how DSAR export and deletion requests apply to stored CV files.

Until then, the website should keep asking candidates for a LinkedIn URL or short note first.
