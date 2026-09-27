# Master QA Report

Date: 2026-08-24

## Executive Verdict

The Interview Coordination Agent is a coherent local MVP. It can create a manual
interview workflow, collect availability through emails or public links, propose
overlapping slots, require recruiter approval, create a Google Calendar/Meet
event once connected, send confirmations and create reminder records.

It is not production-ready for unattended high-volume candidate/client
coordination, but the critical MVP failure modes have been reduced. The
highest-risk remaining areas are production hardening: transactional outbox and
provider reconciliation, production auth/session controls, real background
workers, monitoring, rate limiting and backup/restore.

Current answer to the trust benchmark:

Would a recruitment firm trust this system to coordinate hundreds of real
interviews without someone checking every step?

Not yet. It can support watched pilots and controlled test-account use, but not
high-volume real scheduling until the production gates below are completed.

## Independent Review Inputs

Specialist read-only reviews were run for:

- Security
- Scheduling and timezone logic
- AI reliability
- Frontend UX
- Test coverage
- UK GDPR/privacy

The performance/SRE review was completed locally because the parallel task limit
was reached.

The independent reviews agreed on the key risks:

- OAuth state is not verified.
- Approval/calendar actions lack robust idempotency.
- Stale availability can be reused.
- Parser can create wrong times for minutes and bare hours.
- Visible approval controls are inert.
- Dashboard sections can show the wrong interviews.
- No OpenAI implementation exists yet, which is safe but incomplete.
- Privacy controls need retention/deletion/body minimisation.
- Tests pass but do not yet cover the nastiest failure modes.

## Original P0 Findings

### P0-001 Stale availability can drive wrong booking

Evidence: availability windows are appended and matching reads all historical
non-clarification windows.

Impact: If a candidate changes from Tuesday to Thursday, Tuesday may still be
used for the proposed slot.

Fix: supersede old participant windows on new availability and filter matching
to active windows only.

### P0-002 Parser can create wrong times

Evidence: the parser accepts minute syntax but drops the minutes; bare `at 4`
can become 04:00.

Impact: wrong interview time.

Fix: preserve minutes and clarify ambiguous bare low-hour `at` phrases.

### P0-003 OAuth state is not verified

Evidence: Google OAuth URL contains `state`, but the callback does not persist
or verify it.

Impact: OAuth CSRF/confused callback risk.

Fix: persist hashed state, require callback state, enforce expiry and single use.

### P0-004 Calendar approval side effects are not idempotent enough

Evidence: approval calls calendar create and confirmation sends without a durable
outbox/idempotency record.

Impact: duplicate real meetings and contradictory confirmations under retry or
race conditions.

Fix: short-term backend guard against repeated approval; longer-term outbox,
row lock, stable provider idempotency key and reconciliation job.

### P0-005 Misleading live UI controls

Evidence: `Select Alternative`, `Change Time`, `Request More Availability` and
`Cancel Workflow` are rendered as enabled buttons without handlers.

Impact: recruiter trusts controls that do nothing.

Fix: implement or disable/hide until implemented.

## P1 Findings

- Recruiter calendar free/busy checks must stay optional, because the recruiter
  rarely attends candidate/client interviews.
- Lightweight automatic worker now handles reminders, chases and Gmail sync
  while the backend is running.
- Session token is now set as an HttpOnly cookie with bearer fallback.
- Basic login/public-link rate limiting exists; MFA and multi-user RBAC are
  still future hardening.
- Full email bodies can still be returned in workflow detail until UI
  permissions are refined.
- Privacy endpoints exist, but there is no scheduled retention job or admin UX.
- Public availability links have basic rate limiting.
- Gmail sync scans recent mail and lacks an unmatched review queue.
- Public availability picker now supports exact custom times; timezone clarity
  can still be polished.
- Tests pass but still need concurrency, provider partial failures, invalid
  public links, HTML-only emails and frontend journey coverage.

## What Was Verified

- Backend tests pass: 33 passed.
- Frontend TypeScript check passes.
- Frontend production build passes.
- Frontend dependency audit reported 0 known vulnerabilities.
- Secrets and runtime database are ignored by git.
- No Loxo dependency exists in the MVP.

## Production Readiness Score

Current one-person Google Workspace internal deployment score: 72 / 100.

Category detail is in `PRODUCTION_READINESS.md`.

## Immediate Fixes Implemented

The following low-risk, high-value fixes were implemented after the baseline
audit:

1. Supersede stale availability windows and filter matching to current windows.
2. Preserve parsed minutes.
3. Clarify ambiguous bare low-hour `at` phrases.
4. Support common UK weekday abbreviations and `any time except` ranges.
5. Persist and verify Google OAuth state.
6. Add a workflow operation idempotency guard for approval.
7. Fix misleading dashboard empty sections.
8. Wire request-more-availability and cancellation controls.
9. Implement optional recruiter Google free/busy checks, off by default.
10. Add local known-attendee clash checks without connecting candidate/client
    calendars.
11. Add reschedule approval that updates the existing calendar event.
12. Add cancellation approval that cancels the existing event and reminders.
13. Add a protected due-work runner for reminders and capped availability
    chases.
14. Add protected anonymisation and message-body redaction endpoints.
15. Add lightweight automatic worker for Gmail sync, reminders and capped
    chases.
16. Add feature-based Google OAuth scopes.
17. Add HttpOnly cookie sessions and basic rate limiting.
18. Add operational Alerts view.
19. Add exact custom times to the public availability picker.
20. Add backup/restore scripts and Google Workspace production checklist.
21. Add regression tests for these risks.

Remaining structural items:

- Full transactional outbox and provider reconciliation for calendar/email.
- Production auth/session/MFA/RBAC.
- Full transactional outbox and provider reconciliation.
- Full Google Workspace login/MFA/RBAC if the app expands beyond one user.
- Scheduled retention job and admin UX.
- Hosted-worker verification for Gmail sync, reminders and chases.
- External monitoring, edge rate limiting and tested managed backup/restore.

## Source Reports

- `QA_BASELINE.md`
- `TEST_MATRIX.md`
- `AI_RELIABILITY_REPORT.md`
- `SECURITY_AUDIT.md`
- `PRIVACY_AUDIT.md`
- `UX_AUDIT.md`
- `COMPETITIVE_BENCHMARK.md`
- `AI_COST_REPORT.md`
- `PRODUCTION_READINESS.md`
- `UPGRADE_ROADMAP.md`
- `DISASTER_RECOVERY.md`
- `MESSAGE_STYLE_TESTS.md`
- `CODE_REVIEW_RULES.md`

## Verification After Fixes

- Backend tests: 33 passed.
- Frontend typecheck: passed.
- Frontend production build: passed.
