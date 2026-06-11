# Audit Logging

## Status

Partially ready.

Essential Resourcing now has a central server-side audit logging utility, an enhanced Postgres audit table and a protected read-only audit view at:

```txt
/admin/audit
```

This supports defensible compliance processes. It is not legal advice and does not by itself prove regulatory compliance.

## Audit Summary

Already existed:

- `audit_logs` table in the operations foundation migration.
- DSAR request creation wrote a minimal audit row.
- `activities` records existed for enquiry and DSAR creation.
- Admin dashboard was protected by the CMS gate.
- Analytics avoided candidate PII.
- No CV upload/download routes existed.

Added:

- central audit utility at `src/lib/operations/audit.ts`
- shared operations DB helper at `src/lib/operations/database.ts`
- migration `004_audit_logging_enhancements.sql`
- append-only trigger for normal audit-log update/delete attempts
- CMS login success/failure audit events
- CMS logout audit event
- admin dashboard view audit event
- read-only `/admin/audit` route
- audit utility sanitisation tests
- retention review task creation through the staged retention engine

## What Is Logged Now

Implemented event sources:

- `login_success`
- `login_failed`
- `logout`
- `operations_dashboard_viewed`
- `audit_log_viewed`
- `dsar_request_created`
- `task_created` for retention review tasks
- `recruiter_labs_dashboard_viewed`

Prepared typed actions include:

- candidate created/viewed/updated/deleted/anonymised
- application created/viewed/updated/status changed
- CV uploaded/viewed/downloaded/deleted
- signed URL generated
- note created/updated/deleted
- task created/completed
- consent created/updated
- DSAR viewed/exported/downloaded/deletion approved/deletion completed
- admin user created/role changed
- Recruiter Labs launch gate reviewed
- Recruiter Labs access granted/denied
- Recruiter Labs candidate shared/withheld
- Recruiter Labs feedback created
- Recruiter Labs interview requested
- Recruiter Labs rollback started
- Recruiter Labs AI draft created/reviewed/approved/rejected
- Recruiter Labs AI generation blocked

Future candidate, application, CV and note routes should call the central `logAuditEvent` utility when they are built.

## Where Logs Are Stored

Table:

```txt
audit_logs
```

Enhanced fields:

- actor ID
- actor email
- actor role
- action
- entity type
- entity ID
- entity label
- before
- after
- metadata
- IP hash where configured
- user-agent hash where configured
- created timestamp

IP and user-agent are hashed only when `OPERATIONS_PRIVACY_SALT` or `CMS_GATE_SECRET` is available. Raw IP/user-agent values are not stored by the audit utility.

## Sanitisation Rules

The audit utility redacts:

- passwords
- secrets
- access tokens
- refresh tokens
- authorisation values
- cookies
- signed URLs
- storage keys
- raw CV content
- raw file content

It also avoids logging full message/note-style fields by replacing them with `[not logged]`.

Audit logs should store enough to show what happened, not become another uncontrolled copy of private candidate data.

## Append-Only Principle

The application has:

- no edit audit log route
- no delete audit log route
- read-only admin audit view

Migration `004_audit_logging_enhancements.sql` also adds a trigger that blocks update/delete of `audit_logs` unless a database owner deliberately sets:

```sql
set essential.allow_audit_log_mutation = 'true';
```

That override is for exceptional owner/ops work only. Normal app flow should only insert audit rows.

## Admin Review

Route:

```txt
/admin/audit
```

Access:

- protected by the existing CMS session gate
- noindexed
- read-only

Filters:

- entity type
- action
- actor
- entity ID

Current limitation:

The site has a CMS password gate, not a full admin user/role system yet. The route is protected, but owner/admin versus recruiter/editor role separation needs the future admin-user auth layer before it can be enforced properly.

## CV Access Logging Status

CV upload and private file download routes do not exist yet.

Prepared actions:

- `cv_uploaded`
- `cv_viewed`
- `cv_downloaded`
- `cv_deleted`
- `signed_url_generated`

When private CV storage is implemented, every upload, view, signed URL generation, download and delete action should call `logAuditEvent`.

Do not log:

- full CV text
- public file URL
- signed URL value
- storage secret
- raw token

## DSAR Logging Status

Implemented:

- public DSAR request creation writes `dsar_request_created`
- audit metadata includes request type, status, verification status, due date and hashed requester identifier
- no raw requester message is copied into audit metadata

Still manual/future:

- `dsar_request_viewed`
- `dsar_export_generated`
- `dsar_export_downloaded`
- `dsar_deletion_approved`
- `dsar_deletion_completed`

Those should be added when detailed DSAR admin actions are built.

## Privacy And Retention

Audit logs can still contain personal data, especially actor email, entity IDs and event metadata.

David should approve:

- who can view audit logs
- audit log retention period
- database backup retention
- whether and how actor details are anonymised after an admin leaves
- how DSAR deletion/anonymisation interacts with minimal compliance audit records
- how retention review, deletion and anonymisation actions should be retained

The recommended principle is to retain enough audit data to defend sensitive data handling decisions, without storing full candidate content in the log itself.

Retention engine notes:

```txt
docs/data-retention-engine.md
```

The first-stage engine logs review-task creation. Future approved deletion or
anonymisation must log the actor, reason, entity, timestamp and file cleanup
result. Do not delete audit logs as part of a general cleanup job.

## Testing Checklist

Before launch:

- confirm CMS login success writes an audit row
- confirm CMS login failure writes a safe audit row
- confirm admin dashboard view writes an audit row
- confirm `/admin/audit` is protected
- confirm unauthenticated users cannot view audit logs
- confirm no edit/delete audit routes exist
- confirm audit log trigger blocks normal update/delete
- confirm DSAR creation writes `dsar_request_created`
- confirm retention apply mode writes audit entries for review tasks
- confirm CV routes, once built, log upload/view/download/delete
- confirm signed URL values are never logged
- confirm raw CV content is never logged
- confirm note/message content is not copied into audit metadata
- confirm AI draft events do not log raw prompts, transcripts, CV text,
  provider secrets, storage keys or signed URLs
- run `npm run lint`
- run `npm run typecheck`
- run `npm run build`

No secrets. No CV content. Append-only in app flow. No faff.
