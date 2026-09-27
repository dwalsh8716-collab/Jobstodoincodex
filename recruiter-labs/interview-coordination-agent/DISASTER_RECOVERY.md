# Disaster Recovery

Date: 2026-08-18

## Current State

The local MVP uses SQLite by default at `backend/data/interview_agent.db`.

No automated backup, point-in-time recovery, restore test, or production
runbook is implemented.

## Recovery Objectives

Recommended production targets:

- RPO: 15 minutes for database data.
- RTO: 2 hours for app restore.
- OAuth token loss tolerance: reconnect required, but interviews must remain.
- Calendar/email external state: reconcile from provider IDs where possible.

## Data To Protect

- Interview workflows.
- Participants.
- Availability windows.
- Workflow/audit events.
- Messages and message excerpts.
- Calendar event provider IDs.
- Reminder state.
- Integration connection metadata and encrypted OAuth tokens.
- Settings.

## Backup Plan

For production PostgreSQL:

- Enable managed daily backups.
- Enable point-in-time recovery.
- Take pre-migration snapshots.
- Store backups in a region and account appropriate for UK GDPR posture.
- Test restore quarterly.

For local MVP:

- Do not rely on local SQLite for production.
- If local testing needs preservation, stop the app and copy
  `backend/data/interview_agent.db` to an encrypted backup location.

## Restore Procedure

1. Freeze writes.
2. Identify last known good backup or point-in-time.
3. Restore database to a new instance.
4. Verify table counts and latest workflow events.
5. Repoint app environment to restored database.
6. Start backend and worker.
7. Run health checks.
8. Reconcile calendar events against `calendar_events.provider_event_id`.
9. Requeue failed reminders/chases only where still valid.
10. Notify recruiter of any workflows needing manual review.

## Chaos Scenarios

| Scenario | Expected Behaviour | Current State |
|---|---|---|
| Google outage | Preserve workflow, show retry/reconnect action | Partial generic failure |
| OpenAI outage | Fall back to clarification/recruiter review | Not applicable, no AI |
| Database restart | No workflow loss, retry in worker | Not tested |
| Worker crash | Jobs resume from queue | No worker |
| Calendar event created but DB write fails | Reconcile or avoid orphan event | Not handled |
| Email send succeeds but DB write fails | Reconcile or alert | Not handled |
| Deleted external calendar event | Detect and alert | Not handled |

## Production Requirements

- PostgreSQL with backups and PITR.
- Migration tooling.
- Outbox table for external actions.
- Idempotency keys on outbound email/calendar operations.
- Provider reconciliation job.
- Failure dashboard.
- Restore drill documented with timings.

## Verdict

Disaster recovery is not production-ready. This is acceptable for the local MVP
but must be fixed before the app is trusted with real interview coordination.
