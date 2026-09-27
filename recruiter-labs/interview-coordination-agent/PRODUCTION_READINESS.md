# Production Readiness

Date: 2026-08-24

## Overall Score

Current score for a one-person Google Workspace internal deployment: 72 / 100

Confidence: medium-high for code-level findings, medium for live Google
behaviour because only controlled local setup was verified.

## Category Scores

| Category | Score | Evidence | Critical Gaps |
|---|---:|---|---|
| Scheduling Reliability | 76 | Core overlap path works; stale availability fixed; reschedules update existing events; cancellation approval exists; failed calendar operations move to visible error and can be retried | Still needs live Google failure-mode QA and heavier concurrency testing |
| AI Reliability | 35 | No AI live, so no prompt-injection execution path | No Responses API, no schemas, no AI evals, no cost tracking |
| Candidate Experience | 74 | Public availability link supports quick blocks, exact custom times and timezone clarity; reminders/reschedule/cancel messages exist | Needs live-email QA |
| Client Experience | 70 | Natural request, confirmation, reschedule and cancellation messages | Needs live-email QA and unmatched reply review |
| Security | 66 | Secrets ignored, OAuth tokens encrypted, OAuth state verified, HttpOnly cookie session, login/public-link rate limits, approval/cancel operations guarded | Still needs full Workspace login/MFA, HTTPS deployment and edge rate limiting |
| Privacy | 58 | Token hashing, encrypted OAuth tokens, anonymisation and message-body redaction endpoints | Needs scheduled retention, admin UX and role-aware body access |
| UX | 72 | Dashboard views, alerts, safe approval/reschedule/cancel controls and exact-time picker are wired | Needs final mobile/live workflow polish |
| Performance | 62 | Lightweight automatic worker and bounded batches suit solo-agency load with headroom | Needs hosted load smoke test and Postgres before serious scale |
| Observability | 55 | Workflow events/audit logs plus Alerts view for failed email/calendar/workflow states | No external error tracking/uptime alerts yet |
| Maintainability | 62 | Clear service modules, tests, docs, Google scope model | No Alembic migrations; workflow service still growing |
| Cost Efficiency | 70 | No AI cost currently, mock-first design | No future AI cost telemetry |
| Production Readiness | 65 | Google integration path, automation worker, auth hardening, backup scripts and key operational flows exist | Needs live Google Workspace QA, HTTPS hosting, Postgres/migrations, managed backups and monitoring |

## Go/No-Go

Local demo/testing: Go.

Controlled internal pilot with test accounts: Go.

One-person Google Workspace production trial: Cautious go after live end-to-end
QA on your real Workspace/Gmail account.

High-volume/multi-user production: No-go today.

## Minimum Production Gate

Before real-world use:

- OAuth state verification.
- Approval/calendar idempotency.
- Parser wrong-time fixes and tests.
- Keep recruiter calendar checks optional unless the recruiter attends.
- Confirm automatic worker behaviour on hosted deployment.
- Scheduled retention controls and admin UX.
- Google Workspace OAuth app configured as internal/trusted where available.
- HTTPS deployment.
- PostgreSQL migrations.
- Backup/restore procedure tested.
- External uptime/error monitoring.

## Verdict

The app is now a credible one-person internal production trial candidate, once
Google Workspace is configured properly and live end-to-end QA passes. It should
not yet be treated as a high-volume multi-user SaaS product. The next work is
deployment hardening: HTTPS, Postgres, migrations, managed backups, monitoring
and live Google failure-mode testing.
