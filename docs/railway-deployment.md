# Railway Deployment

## What Railway Is Used For

Railway can host the Next.js app and provide Railway Postgres for the private operations database.

Recommended Railway project name:

```txt
Essential Resourcing
```

Sanity remains the public website CMS.

Use Railway Postgres only for private operational data:

- contact enquiries
- candidate records
- job applications
- CV/file metadata
- notes
- statuses
- tasks
- activity history
- consent records
- audit logs

Hard boundary:

```txt
Sanity is for public website content. Do not store private candidate/client data,
CVs, application records or internal notes in Sanity.
```

Full boundary guide:

```txt
docs/data-boundaries.md
```

## Current Build Contract

Build command:

```bash
npm run build
```

Start command:

```bash
npm run start -- --hostname 0.0.0.0 --port ${PORT:-3000}
```

Health check:

```txt
/api/health
```

Database migration command:

```bash
npm run db:migrate
```

Database status command:

```bash
npm run db:status
```

Retention dry-run command:

```bash
npm run retention:check
```

The Railway image is configured through `nixpacks.toml` to include the PostgreSQL client used by the migration/status scripts.

Full launch handover:

```txt
docs/launch-handover.md
```

## Dashboard Setup

1. Go to Railway.
2. Create a new project.
3. Name it `Essential Resourcing`.
4. Choose deploy from GitHub.
5. Select `dwalsh8716-collab/Jobstodoincodex`.
6. Confirm the Railway-generated domain works before adding custom domains.
7. Add a PostgreSQL service if private operations are going live.
8. Open the app service variables.
9. Add `DATABASE_URL` from the PostgreSQL service if Postgres is enabled.
10. Add the required Sanity variables.
11. Add the required form/email variables.
12. Add the CMS gate variables.
13. Leave `OPERATIONS_DB_ENABLED=false` until migrations pass.
14. Deploy the app.
15. Run `npm run db:status`.
16. Run `npm run db:migrate` if Postgres is enabled.
17. Run `npm run retention:check`.
18. Set `OPERATIONS_DB_ENABLED=true` only after migrations pass.
19. Keep `RETENTION_ENGINE_ENABLED=false` until legal/privacy and backup review is complete.
20. Redeploy.
21. Visit `/api/health`.
22. Log in at `/cms`.
23. Open `/studio` after the CMS gate.
24. Open `/admin`.
25. Submit a test contact form.
26. Confirm the enquiry appears in `/admin` if Postgres is enabled.
27. Confirm retention review fields appear for due records.
28. Add a custom domain after QA, not before.

## Required Variables

Core:

```txt
NEXT_PUBLIC_SITE_URL
```

Private operations database:

```txt
DATABASE_URL
OPERATIONS_DB_ENABLED
OPERATIONS_PRIVACY_SALT
RETENTION_ENGINE_ENABLED
RETENTION_DRY_RUN
RETENTION_ROLE_APPLICATION_MONTHS
RETENTION_TALENT_POOL_MONTHS
RETENTION_GENERAL_CANDIDATE_MONTHS
RETENTION_CLIENT_ENQUIRY_MONTHS
RETENTION_CV_FILE_MONTHS
RETENTION_DSAR_RECORD_MONTHS
RETENTION_AUDIT_LOG_MONTHS
CRON_SECRET
```

Sanity:

```txt
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
NEXT_PUBLIC_SANITY_API_VERSION
SANITY_PROJECT_ID
SANITY_DATASET
SANITY_API_VERSION
SANITY_READ_TOKEN
SANITY_API_READ_TOKEN
SANITY_PREVIEW_SECRET
```

CMS gate:

```txt
CMS_GATE_USERNAME
CMS_GATE_PASSWORD
CMS_GATE_SECRET
```

Forms/email:

```txt
RESEND_API_KEY
CONTACT_TO_EMAIL
CONTACT_FROM_EMAIL
```

Tracking/search:

```txt
NEXT_PUBLIC_GA_ID
NEXT_PUBLIC_GTM_ID
GOOGLE_SITE_VERIFICATION
```

Contact:

```txt
NEXT_PUBLIC_WHATSAPP_NUMBER
NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE
NEXT_PUBLIC_BOOKING_URL
NEXT_PUBLIC_LINKEDIN_URL
NEXT_PUBLIC_PHONE
```

## CLI Option

Use the dashboard if you are unsure. CLI syntax can change, so verify the installed Railway CLI before running commands.

Typical flow:

```bash
npm install -g @railway/cli
railway login
railway link
railway status
railway variables
railway up
```

Do not paste secrets into GitHub, Slack, browser notes or commit history.

Current local audit note:

```txt
Railway CLI was not installed in the local workspace during the deployment audit.
```

## Migrations

Migration files live here:

```txt
database/migrations
```

Run:

```bash
npm run db:migrate
```

Only set `OPERATIONS_DB_ENABLED=true` after migrations succeed.

## Retention Checks

The retention engine is review-first.

Safe dry-run:

```bash
npm run retention:check
```

Apply mode:

```bash
RETENTION_ENGINE_ENABLED=true npm run retention:apply
```

Apply mode creates review tasks and audit entries only. It does not delete rows,
anonymise data or delete CV files.

Keep `RETENTION_ENGINE_ENABLED=false` until:

- legal review confirms the retention periods
- Railway Postgres backups are understood
- David has approved the first dry-run output
- private CV storage and deletion rules are agreed

Full operating notes:

```txt
docs/data-retention-engine.md
```

## CV And File Storage

Do not upload CVs until private storage is chosen and configured.

Approved future options:

- Cloudflare R2
- AWS S3
- Supabase Storage
- UploadThing with private access
- another private object storage provider with signed URLs

Requirements:

- private bucket/storage
- no public CV URLs
- signed admin-only access
- allowed file types: PDF, DOC, DOCX
- max file size
- retention/deletion support
- virus scanning plan or manual review warning

## Backups And Retention

Before live private operations, define:

- Railway Postgres backup routine
- who has Railway access
- who has `/admin` access
- data retention period
- deletion/export request process
- incident response contact
- monthly review checklist

This is a technical setup guide, not legal advice.

## Custom Domain And 123 Reg

Do not change 123 Reg DNS until the Railway-generated domain works.

Custom domain/DNS guide:

```txt
docs/123-reg-domain-switch.md
```

Recommended canonical domain:

```txt
https://essentialresourcing.co.uk
```

Railway must generate the exact DNS records. Do not guess them.
