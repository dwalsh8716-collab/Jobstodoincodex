# Data Retention Engine

## Status

Partially ready.

Essential Resourcing now has a staged retention model, database lifecycle fields,
an admin review queue and a dry-run retention check. It does not automatically
delete or anonymise personal data.

This is not legal advice. The retention periods, deletion rules, backup rules
and candidate wording need legal review before launch.

## Audit Summary

Already existed:

- consent fields on candidate and application records
- candidate `data_retention_until`, deletion request and deleted fields
- file metadata with `retention_until` and `deleted_at`
- DSAR/privacy request capture
- append-only audit logging
- protected `/admin` dashboard
- no public CV upload
- no CV files in `/public`
- no scheduled retention job
- no public retention/cron endpoint

Missing before this pass:

- retention categories across private records
- review dates and review statuses
- a single retention review queue
- safe dry-run/apply scripts
- review tasks for records that are due
- lifecycle fields on DSAR records
- clear Railway scheduling notes

Risk before this pass:

- private data could be collected later without an obvious review cadence
- CV metadata had a retention date, but no review workflow
- DSAR records could be tracked, but not lifecycle reviewed
- any future cleanup job would have been easy to make too destructive

## Retention Model

The defaults are starting recommendations only:

| Category                                  |   Default |         Review starts | Notes                                                  |
| ----------------------------------------- | --------: | --------------------: | ------------------------------------------------------ |
| Candidate application for a specific role |  6 months | 30 days before expiry | For inactive or unsuccessful role applications.        |
| Candidate talent pool / active roster     | 24 months | 60 days before expiry | Use only when the candidate clearly opts in.           |
| General candidate enquiry                 | 12 months | 30 days before expiry | For speculative candidate enquiries.                   |
| Client or hiring enquiry                  | 24 months | 60 days before expiry | Business-defined and needs legal review.               |
| CV or private file metadata               |  6 months | 30 days before expiry | Should follow the linked candidate/application record. |
| DSAR/privacy request record               | 24 months | 60 days before expiry | Keep enough to evidence the request and outcome.       |
| Audit log                                 | 72 months | 90 days before expiry | Separate compliance decision. Do not delete blindly.   |

Code defaults live in:

```txt
src/lib/retention.ts
```

Environment overrides are supported:

```txt
RETENTION_ROLE_APPLICATION_MONTHS=6
RETENTION_TALENT_POOL_MONTHS=24
RETENTION_GENERAL_CANDIDATE_MONTHS=12
RETENTION_CLIENT_ENQUIRY_MONTHS=24
RETENTION_CV_FILE_MONTHS=6
RETENTION_DSAR_RECORD_MONTHS=24
RETENTION_AUDIT_LOG_MONTHS=72
```

Do not treat those values as approved policy until David has had them checked.

## Database Changes

Migration:

```txt
database/migrations/005_retention_engine.sql
```

The migration adds lifecycle fields where they fit the existing model:

- `consent_source`
- `retention_category`
- `data_retention_until`
- `retention_review_at`
- `retention_status`
- `opted_into_talent_pool`
- `talent_pool_consent_until`
- `deletion_approved_at`
- `anonymised_at`
- `anonymisation_reason`
- `retention_last_checked_at`

It also creates:

```txt
retention_review_queue
```

The view combines candidates, applications, enquiries, CV/file metadata and
DSAR/privacy request records into one review queue.

Recommended actions:

- `review_deletion_request`
- `review_expired_retention`
- `review_due`
- `expiring_soon`
- `no_action`

The view does not delete anything.

## Retention Engine

Scripts:

```bash
npm run retention:check
npm run retention:apply
```

Dry-run behaviour:

- dry-run is the default
- no database writes
- lists due records from `retention_review_queue`
- exits safely when `DATABASE_URL` is missing

Apply behaviour:

- requires `RETENTION_ENGINE_ENABLED=true`
- creates review tasks for due records
- marks active due records as `pending_review`
- writes audit log entries for created tasks
- does not delete records
- does not anonymise records
- does not delete files

Safety flags:

```txt
RETENTION_ENGINE_ENABLED=false
RETENTION_DRY_RUN=true
```

There is no public retention endpoint. If one is ever added, it must be POST-only
and protected with `CRON_SECRET`, rate limiting and server-side audit logging.

## Admin Workflow

Route:

```txt
/admin
```

The admin dashboard now shows:

- retention review count
- latest due records
- record type
- retention category
- status
- recommended action
- retention date

The first live workflow should be:

1. Run `npm run retention:check`.
2. Review the output.
3. Confirm backups and legal review are in place.
4. Set `RETENTION_ENGINE_ENABLED=true` only after approval.
5. Run `npm run retention:apply`.
6. Review created tasks in `/admin`.
7. Decide manually whether to retain, delete or anonymise.
8. Record the reason and keep the audit trail.

## CV/File Handling

CV upload is still intentionally not enabled.

Current state:

- no public CV upload
- no public CV URLs
- no CV binary storage in Postgres
- file metadata table is staged for future private storage
- retention queue can flag file metadata for review
- no script deletes private files

Before CV upload is enabled, David still needs:

- private object storage
- signed admin-only access
- file validation
- virus scanning or manual review process
- audit logs for upload, view, download and delete
- approved deletion/anonymisation workflow

## Anonymisation Strategy

Future approved anonymisation should remove or blank:

- name
- email
- phone
- LinkedIn URL
- CV file links/storage keys
- cover messages
- free-text notes where they contain PII

It may keep:

- anonymised application statistics
- high-level role/category
- date ranges
- status
- audit record showing the action happened

Do not claim full anonymisation while free-text notes remain identifiable.

## Deletion Strategy

Deletion should stay manual until the private operations process is proven.

When deletion is approved, the admin process should:

- verify the request and legal basis
- check whether anything must be retained
- delete or revoke private CV files where storage exists
- delete or anonymise candidate/application/enquiry records
- avoid deleting audit logs blindly
- record actor, timestamp and reason
- confirm backup implications

## Audit Logging

The current engine logs review-task creation through `audit_logs`.

Future deletion/anonymisation work must log:

- actor/admin
- action
- entity type and ID
- before/after state where appropriate
- deletion/anonymisation reason
- file storage cleanup result

Audit log retention is its own compliance decision. Do not make it part of a
general wipe.

## Railway Scheduling

Safe first Railway setup:

```bash
npm run retention:check
```

Only after legal/privacy and backup approval:

```bash
RETENTION_ENGINE_ENABLED=true npm run retention:apply
```

Scheduling options:

- Railway scheduled job/service, if available on the project
- manual monthly run from the Railway shell
- GitHub Actions scheduled workflow that runs the script against Railway secrets
- external scheduler only if it calls a protected server-side endpoint

No unauthenticated cron route should be added.

## Testing Checklist

Before treating this as live:

- run migrations
- run `npm run retention:check`
- confirm expired records appear in dry-run output
- confirm dry-run makes no writes
- confirm apply fails unless `RETENTION_ENGINE_ENABLED=true`
- confirm apply creates review tasks only
- confirm no rows/files are deleted by apply
- confirm audit logs are written for created tasks
- confirm `/admin` is protected
- confirm no public retention endpoint exists
- confirm no PII is sent to analytics
- confirm CV upload is still disabled
- run `npm run lint`
- run `npm run typecheck`
- run `npm run build`

## Manual Actions For David

1. Get legal review on retention periods.
2. Confirm what counts as active recruitment need.
3. Decide when deletion means deletion versus anonymisation.
4. Confirm backup retention and restore process.
5. Confirm Railway database access controls.
6. Choose private CV storage before enabling CV upload.
7. Approve the first dry-run output before apply mode is used.
8. Keep `RETENTION_ENGINE_ENABLED=false` until the above is done.

## Production Readiness

Public website:

```txt
Ready to keep working without retention automation.
```

Private retention engine:

```txt
Partially ready. Review-first lifecycle management is staged. Automated deletion is deliberately blocked until legal review, storage and admin approval are complete.
```

No fake compliance. No dangerous auto-wipe. Keep David in control.
