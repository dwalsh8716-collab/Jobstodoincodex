# Railway Postgres Backend

## Status

Partially ready.

The public Essential Resourcing website still uses Sanity for public content. That is deliberate and should not be changed.

Railway Postgres is now staged as the private operations database for:

- enquiries
- companies and contacts
- candidates
- job applications
- CV/file metadata
- notes
- tasks
- activity history
- consent records
- audit logs
- data/privacy requests
- retention review queue
- optional Loxo reference IDs
- integration sync event records

No public website content has moved from Sanity to Postgres.

## Audit Summary

Current project:

- Next.js 16 App Router.
- React 19.
- TypeScript strict mode.
- Sanity 5 Studio at `/studio`.
- Public content fallback in local TypeScript content.
- Contact form posts to `/api/contact`.
- Zod validates public form payloads.
- Resend is prepared for email delivery.
- Consent-aware analytics exists.
- CMS gate exists at `/cms`.
- No traditional database existed before this pass.
- No CV upload flow existed before this pass.
- No private admin dashboard existed before this pass.

Preserved:

- Sanity as the public CMS.
- Current public routes, SEO routes and structured data.
- Existing contact form validation, honeypot, timing check and email fallback.
- Existing CMS gate.
- Existing privacy-first consent model.

Added:

- Railway deployment files.
- Postgres migration for the private operations schema.
- `/api/health` route for Railway health checks.
- Protected `/admin` operations dashboard.
- Contact form hook that can save enquiries to Postgres once Railway is configured.
- Candidate data/privacy request hook that can save DSAR requests to Postgres once Railway is configured.
- Central audit logging utility and protected read-only audit view.
- Review-first retention engine and admin retention queue.
- Recruiter Labs foundation tables for future private shortlists, hashed magic
  link access, shortlist feedback and interview requests.
- Recruiter Labs launch-gate fields for private beta status, candidate sharing
  consent, CV access approval/revocation and rollback notes.
- Recruiter Labs AI governance draft metadata for future sample/redacted/private
  drafts with David review state.
- Recruiter Labs AI launch-gate fields for source summaries, prompt versions,
  deletion state and client-visibility blocking.
- Recruiter Labs private portal engagement events for shortlist opens, candidate
  card review timing, modal activity, CV actions and feedback submission.
- Recruiter Labs David's Take audio-note metadata, approval state and access-log
  tables for future private signed playback.
- Recruiter Labs retained search dashboard aggregate metrics, hashed access
  tokens and access-log tables.
- Recruiter Labs AI brief diagnostic submissions and draft packs for future
  David-reviewed client qualification.
- Database migration and status scripts.

## Architecture Summary

Sanity remains responsible for:

- homepage
- service pages
- jobs content
- insights
- case studies
- salary snapshots
- navigation, footer and site settings
- SEO-editable public content

Sanity must not store private candidate/client PII, CV files, private
application records, DSAR requests, audit logs or internal recruitment notes.

Postgres is for private business operations only:

- submitted enquiries
- candidate/application records
- private notes
- internal statuses
- tasks
- CV/file metadata
- consent records
- audit logs
- data/privacy requests
- Loxo handoff/reference IDs where a website workflow record maps to Loxo
- integration sync events for future manual handoff or approved API sync

Public jobs can still live in Sanity. Private applications can store a Sanity job ID or slug when that flow is extended.

## Database Summary

Migration:

```txt
database/migrations/001_operations_foundation.sql
database/migrations/003_data_subject_requests.sql
database/migrations/004_audit_logging_enhancements.sql
database/migrations/005_retention_engine.sql
database/migrations/006_recruiter_labs_foundation.sql
database/migrations/007_recruiter_labs_launch_gate.sql
database/migrations/008_recruiter_labs_ai_governance.sql
database/migrations/009_recruiter_labs_ai_launch_gate.sql
database/migrations/016_candidate_summary_drafts.sql
database/migrations/023_candidate_summary_review_versions.sql
database/migrations/022_ai_brief_diagnostic.sql
database/migrations/017_dsar_email_verification.sql
database/migrations/018_interim_availability_toggle.sql
database/migrations/010_loxo_reference_boundary.sql
```

Tables:

- `admin_users`
- `companies`
- `contacts`
- `enquiries`
- `candidates`
- `jobs`
- `applications`
- `files`
- `notes`
- `tasks`
- `activities`
- `consent_records`
- `audit_logs`
- `data_subject_requests`
- `interim_candidate_availability`
- `interim_availability_tokens`
- `integration_sync_events`
- `retention_review_queue` view

Important privacy fields are included for candidate/application records:

- `consent_to_store_data`
- `consent_timestamp`
- `privacy_notice_version`
- `data_retention_until`
- `retention_category`
- `retention_review_at`
- `retention_status`
- `delete_requested_at`
- `export_requested_at`
- `deletion_approved_at`
- `anonymised_at`
- `deleted_at`
- `deletion_reason`

CV files are not stored in Postgres. Only metadata is modelled. Actual CV storage must use private object storage with signed access URLs before upload is enabled.

Loxo reference fields are optional. They exist to connect a private website workflow record to the matching Loxo record later. They do not mean the website database is now the CRM.

## Admin Dashboard Summary

Route:

```txt
/admin
```

Access:

- Protected by the existing CMS session gate.
- Unauthenticated users are redirected to `/cms?next=/admin`.
- Page is noindexed.

Current dashboard:

- database connection/status panel
- enquiries count
- new enquiries count
- candidates count
- applications count
- open tasks count
- open data/privacy request count
- latest enquiries table
- latest data/privacy requests table
- retention review count
- latest retention review table
- link to read-only audit log view
- setup checklist

Audit route:

```txt
/admin/audit
```

The audit route is protected by the same CMS gate, noindexed and read-only in
the application.

This is a focused operations dashboard, not a bloated CRM.

## Form Integration

The existing contact form now attempts a private database write through:

```txt
src/lib/operations/store.ts
```

Behaviour:

- `OPERATIONS_DB_ENABLED=false`: form behaves as before.
- `OPERATIONS_DB_ENABLED=true` and `DATABASE_URL` missing: form returns a safe failure.
- database write fails while enabled: form returns a safe failure and tells the user to email David.
- database write succeeds: enquiry, activity record and consent record are created.

The candidate data/privacy request form posts through a separate action. When
Railway/Postgres is enabled, it creates a `data_subject_requests` row, an
activity record and an audit-log record. When Resend and the operations database
are both configured, it stores only a hashed email-confirmation token and sends
the requester a confirmation link. It does not look up candidate records
publicly, and it does not export or delete data without manual review.

No PII is sent to analytics.

IP address and user agent are only hashed when `OPERATIONS_PRIVACY_SALT` or `CMS_GATE_SECRET` is present. Raw IP/user agent values are not stored by the operations helper.

## Railway Summary

Files:

- `railway.json`
- `nixpacks.toml`
- `scripts/db-migrate.mjs`
- `scripts/db-status.mjs`
- `docs/railway-deployment.md`
- `docs/launch-handover.md`

Railway is expected to run:

```txt
npm run build
npm run start -- --hostname 0.0.0.0 --port ${PORT:-3000}
```

Health check:

```txt
/api/health
```

## Security Summary

Implemented:

- protected admin route
- no public CV storage
- no CV upload added
- no secrets committed
- no PII in analytics
- consent records in schema
- audit logs in schema
- retention/delete/export fields in schema
- DSAR request table and protected dashboard summary
- enriched append-only audit logs with actor, action, entity, metadata and hashed request context
- dry-run retention check and review-first apply script
- no unauthenticated retention/cron endpoint
- no public Recruiter Labs client portal until hashed-token validation, expiry,
  revocation, consent and audit logging are complete
- server-side form validation remains in place
- form spam/timing/honeypot controls remain in place

Still manual before live operations:

- Railway account/project connection
- Railway Postgres service creation
- production `DATABASE_URL`
- private storage provider for CVs
- legal review of retention wording
- backup and access-control policy
- approval before `RETENTION_ENGINE_ENABLED=true`
- admin user/role operational policy
- decision on Prisma or Drizzle once package registry/authentication is available

## Production Readiness

Public website:

```txt
Ready to keep working without Postgres.
```

Private operations backend:

```txt
Partially ready. Schema, docs, admin route and guarded writes are staged. It is not fully live until Railway Postgres is created, env vars are set and migrations are run.
```

CV upload:

```txt
Blocked until private object storage, signed URLs, retention/deletion process and legal review are approved.
```

Candidate trust follow-up:

```txt
docs/candidate-data-journey.md
docs/cv-storage-and-retention.md
docs/audit-logging.md
docs/data-boundaries.md
```

WhatsApp Business follow-up:

```txt
database/migrations/002_whatsapp_business_messages.sql
database/migrations/014_whatsapp_crm_sync.sql
database/migrations/015_whatsapp_interview_logistics.sql
docs/whatsapp-business-cloud-api.md
```

Recruiter Labs AI follow-up:

```txt
database/migrations/016_candidate_summary_drafts.sql
database/migrations/023_candidate_summary_review_versions.sql
database/migrations/022_ai_brief_diagnostic.sql
docs/recruiter-labs-ai-governance.md
docs/recruiter-labs-ai-launch-gate.md
docs/recruiter-labs-ai-brief-diagnostic.md
```

Strategic Interim availability follow-up:

```txt
database/migrations/018_interim_availability_toggle.sql
FEATURE_INTERIM_AVAILABILITY_TOGGLE=false
INTERIM_AVAILABILITY_TOKEN_EXPIRY_DAYS=14
```

Final rule: no fake compliance, no public CV links, no secrets in GitHub, and no duplicate public CMS content in Postgres.
