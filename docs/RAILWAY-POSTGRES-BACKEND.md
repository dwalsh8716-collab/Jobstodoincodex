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

Postgres is for private business operations only:

- submitted enquiries
- candidate/application records
- private notes
- internal statuses
- tasks
- CV/file metadata
- consent records
- audit logs

Public jobs can still live in Sanity. Private applications can store a Sanity job ID or slug when that flow is extended.

## Database Summary

Migration:

```txt
database/migrations/001_operations_foundation.sql
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

Important privacy fields are included for candidate/application records:

- `consent_to_store_data`
- `consent_timestamp`
- `privacy_notice_version`
- `data_retention_until`
- `delete_requested_at`
- `export_requested_at`
- `deleted_at`
- `deletion_reason`

CV files are not stored in Postgres. Only metadata is modelled. Actual CV storage must use private object storage with signed access URLs before upload is enabled.

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
- latest enquiries table
- setup checklist

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

No PII is sent to analytics.

IP address and user agent are only hashed when `OPERATIONS_PRIVACY_SALT` or `CMS_GATE_SECRET` is present. Raw IP/user agent values are not stored by the operations helper.

## Railway Summary

Files:

- `railway.json`
- `nixpacks.toml`
- `scripts/db-migrate.mjs`
- `scripts/db-status.mjs`
- `docs/railway-deployment.md`

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
- server-side form validation remains in place
- form spam/timing/honeypot controls remain in place

Still manual before live operations:

- Railway account/project connection
- Railway Postgres service creation
- production `DATABASE_URL`
- private storage provider for CVs
- legal review of retention wording
- backup and access-control policy
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

Final rule: no fake compliance, no public CV links, no secrets in GitHub, and no duplicate public CMS content in Postgres.
