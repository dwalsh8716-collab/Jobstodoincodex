# 0004 - Use Postgres Only For Private Website Workflows

## Status

Accepted, staged.

## Context

The website needs a private place for operational records that should not live
in Sanity: enquiries, applications, consent, audit logs, DSAR requests, retention
state and future Recruiter Labs workflow records.

Railway Postgres is staged for this purpose, but local development currently
skips database checks when `DATABASE_URL` is not set.

Supporting docs:

- `docs/RAILWAY-POSTGRES-BACKEND.md`
- `docs/data-boundaries.md`
- `docs/data-retention-engine.md`
- `docs/audit-logging.md`

## Decision

Use Postgres only for private website workflows.

Postgres may store:

- contact enquiries
- candidate applications
- consent records
- DSAR requests
- audit logs
- retention review state
- private admin workflow state
- salary guide lead requests
- Recruiter Labs private prototype records
- integration sync events and reference IDs

Postgres is not the CRM/ATS and not a public CMS.

## Consequences

- Private workflow data has a clear technical home.
- Retention, audit and DSAR handling can be built against one private store.
- Production must not enable private database writes until migrations, salts,
  backups, access controls and privacy review are ready.
- Local checks must safely skip when `DATABASE_URL` is missing.

## What Not To Do

- Do not use Postgres to replace Loxo.
- Do not put public editorial content in Postgres unless there is a strong
  operational reason.
- Do not enable `OPERATIONS_DB_ENABLED=true` before migrations pass.
- Do not store secrets, raw access tokens or unnecessary PII.
- Do not keep private records forever without a retention reason.
