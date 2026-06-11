# Backend Data Boundary Audit

Audit date: 11 June 2026

## Status

Amber.

The private backend boundary is well staged, but production database use is not live until Railway Postgres is connected, migrated and deliberately enabled.

## Source Of Truth

Loxo should remain the CRM/ATS source of truth.

The website should capture or stage website-specific workflow records only. It should not become a full CRM by accident.

## What Exists

Database:

- SQL migrations in `database/migrations/`
- Migration runner in `scripts/db-migrate.mjs`
- Status checker in `scripts/db-status.mjs`
- Retention checker in `scripts/retention-check.mjs`

Operations code:

- `src/lib/operations/database.ts`
- `src/lib/operations/store.ts`
- `src/lib/operations/audit.ts`
- `src/lib/operations/types.ts`

Admin routes:

- `/admin`
- `/admin/audit`
- `/admin/labs`
- `/admin/recruiter-labs`
- `/admin/recruiter-labs/ai-ops`

## Tables Staged

The migration set stages:

- admin users
- companies
- contacts
- enquiries
- candidates
- applications
- files metadata
- consent records
- activities
- tasks
- audit logs
- WhatsApp message records
- data subject requests
- retention review views
- optional Loxo reference IDs for private handoff/sync mapping
- integration sync event records
- Recruiter Labs shortlists, feedback, private portal engagement events and
  David's Take audio-note metadata
- Recruiter Labs retained search dashboard aggregate metrics and access logs
- Recruiter Labs AI draft governance tables and future AI brief diagnostic
  submissions/draft packs

## Important Boundary

These tables are for private website workflows and prototypes.

They must not be treated as the main recruitment CRM unless David explicitly chooses that. Loxo remains the source of truth for recruitment records.

## Loxo Reference Boundary

Issue #94 added optional Loxo reference fields to the private Postgres schema:

- `companies.loxo_company_id`
- `contacts.loxo_contact_id`
- `candidates.loxo_candidate_id`
- `jobs.loxo_job_id`
- `applications.loxo_application_id`
- `applications.loxo_candidate_id`
- `applications.loxo_job_id`
- `enquiries.loxo_handoff_id`

These fields are not a live integration.

They exist so future Loxo handoff or sync work can link a website workflow record to the matching Loxo record without duplicating the whole CRM inside the website.

The migration also adds `integration_sync_events` so future integrations can log:

- which integration was involved
- whether it was inbound, outbound or manual handoff
- the local record
- the external record ID
- the operation
- current status
- safe metadata

Do not store Loxo API keys, access tokens or private payload dumps in these fields.

## ORM Decision

No ORM was introduced.

The existing project already uses SQL migrations plus a small server-only operations helper that calls `psql`. Adding Prisma or Drizzle here would create another abstraction layer without solving a current problem.

## Current Local State

Local audit result:

- `DATABASE_URL` is not set.
- `OPERATIONS_DB_ENABLED` defaults to false.
- `npm run db:status` reports the database is not configured locally.
- `npm run retention:check` safely skips when no database is configured.

This is safe for local build work.

## Forms

Contact form:

- validates server-side
- has honeypot
- has timing check
- has basic in-memory rate limit
- writes to Postgres only when operations DB is enabled
- falls back to email route when database is disabled
- avoids PII in analytics payloads

Data/privacy request form:

- validates server-side
- has honeypot
- has timing check
- has basic in-memory rate limit
- stores in Postgres only when operations DB is enabled
- fails safely and tells the user to email David if neither storage nor email is configured

## Security Notes

- Database access is server-only.
- `DATABASE_URL` is not public.
- IP/user-agent hashes use `OPERATIONS_PRIVACY_SALT` or `CMS_GATE_SECRET`.
- Audit logging sanitises secrets, tokens, signed URLs, CV content and message-heavy fields.
- Audit logs are designed as append-only in the database.

## Risks

- `psql` must be available wherever migrations/status checks run.
- Production rate limiting is currently in-memory and not shared across instances.
- Private CV storage is not implemented.
- Loxo integration is not implemented.
- Loxo IDs are staged for future reference only; there is no live sync, webhook or API client.
- Migration execution is manual until Railway deploy workflow is finalised.

## Manual Actions

1. Create Railway Postgres only when private storage is needed.
2. Set `DATABASE_URL`.
3. Set `OPERATIONS_DB_ENABLED=false` first.
4. Run `npm run db:migrate`.
5. Confirm `npm run db:status`.
6. Set `OPERATIONS_DB_ENABLED=true` only after migrations pass.
7. Set `OPERATIONS_PRIVACY_SALT`.
8. Keep Loxo as CRM/ATS source of truth.

## Recommendation

Use Postgres for private website workflow records.

Keep Loxo as recruitment CRM/ATS.

Do not build a full CRM inside the website without explicit approval.
