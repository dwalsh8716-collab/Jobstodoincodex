# Upgrade Roadmap

Date: 2026-08-24

## P0 - Critical

### P0-001 OAuth state verification

Problem: Google OAuth callback does not verify stored state.

Risk: OAuth CSRF/confused callback.

Solution: Persist hashed state with expiry and single-use verification.

Business value: Makes Google connection safer before real client/candidate use.

Effort: Low-medium.

Dependencies: DB model/table and tests.

Implementation risk: Low.

Status: implemented for Google OAuth in the local MVP.

### P0-002 Prevent wrong parsed times

Problem: `10:30` becomes `10:00`; bare `4` can become 04:00.

Risk: Wrong interview time.

Solution: Preserve minutes and clarify ambiguous bare low hours.

Business value: Prevents the most embarrassing and damaging scheduling failure.

Effort: Low.

Dependencies: Parser tests.

Implementation risk: Low.

Status: implemented for minute precision, bare low-hour clarification, common UK
weekday abbreviations and `any time except` ranges.

### P0-003 Stale availability superseding

Problem: Old availability remained active after a participant supplied a newer
set.

Risk: Wrong interview slot proposed from outdated availability.

Solution: Preserve history but mark older participant windows as superseded and
exclude them from matching.

Business value: Prevents a quiet, high-cost scheduling mistake.

Effort: Low-medium.

Dependencies: Data model column and tests.

Implementation risk: Low.

Status: implemented.

### P0-004 Approval/calendar idempotency

Problem: Calendar create happens before durable event state and has no
idempotency protection.

Risk: Duplicate meetings or orphan Google event.

Solution: Add approval idempotency, unique active calendar event guard and
provider request id where available.

Business value: Prevents duplicate/conflicting confirmations.

Effort: Medium.

Dependencies: DB changes/tests.

Implementation risk: Medium.

Status: partially improved with `workflow_operations` and stable approval keys.
Reschedules now update the existing provider event and repeat scheduled
approval returns without creating a duplicate. Still needs full transactional
outbox/reconciliation before higher-volume production. Failed calendar
approval/cancellation now moves to visible `ERROR` and can be retried.

### P0-005 Remove misleading live controls

Problem: Some approval buttons are visible but do nothing.

Risk: Recruiter trusts controls that do not act.

Solution: Implement them or disable/hide them until implemented.

Business value: Keeps recruiter confidence.

Effort: Low.

Dependencies: Frontend only if disabling.

Implementation risk: Low.

Status: implemented by wiring safe request-more-availability and cancellation
actions, disabling no unsafe live-only controls and fixing dashboard empty
sections.

## P1 - High Impact

### P1-001 Google free/busy checks

Problem: App creates calendar events but should only check recruiter calendar
conflicts when the recruiter is actually attending.

Risk: Overcomplication and false slot rejection if the recruiter diary blocks
candidate/client interviews unnecessarily.

Solution: Implement Google Calendar freeBusy behind
`CHECK_RECRUITER_CALENDAR_CONFLICTS=false` by default, and always check known
same-attendee clashes already stored inside the app.

Business value: Keeps the core workflow simple while preserving an option for
rare recruiter-attended interviews.

Effort: Medium.

Dependencies: Calendar provider interface expansion.

Implementation risk: Medium.

Status: implemented as optional recruiter free/busy plus local known-attendee
conflict checks. Candidate and client calendars are not connected.

### P1-002 Background jobs

Problem: Gmail sync, reminders and chases are manual/not sent.

Risk: Missed replies and reminders.

Solution: Add Redis/Celery or a simpler scheduler for MVP, then queues.

Business value: Enables "leave the application" workflow.

Effort: Medium-high.

Dependencies: Deployment stack.

Implementation risk: Medium.

Status: implemented for the solo-agency production path with a lightweight
automatic backend worker plus protected manual runner. For larger multi-user
scale, replace with Redis/Celery or a managed worker queue.

### P1-003 Reschedule completion flow

Problem: Reschedule is detected but not completed.

Risk: Stale calendar events and manual rescue.

Solution: Collect new availability, approve new slot, update existing event and
notify all parties.

Business value: Handles one of the most common recruitment admin pains.

Effort: High.

Dependencies: Calendar update/cancel support and idempotency.

Implementation risk: High.

Status: implemented for the local MVP: reschedule intent pauses old reminders,
fresh availability is collected, approval updates the existing event and sends
reschedule confirmations.

### P1-004 Cancellation approval flow

Problem: Cancellation is detected but cannot be confirmed in app.

Risk: Confusing stale interviews.

Solution: Add recruiter approval card, cancel/update event, cancel reminders and
notify attendees.

Business value: Closes the operational loop.

Effort: Medium.

Dependencies: Calendar cancel support.

Implementation risk: Medium.

Status: implemented for the local MVP with recruiter confirmation, event
cancellation, reminder cancellation and participant notifications.

### P1-005 Retention/deletion controls

Problem: Personal data and message bodies are retained indefinitely.

Risk: UK GDPR exposure.

Solution: Add anonymisation/deletion and message body retention settings.

Business value: Makes the product credible for real candidate data.

Effort: Medium.

Dependencies: Data model and admin UI.

Implementation risk: Medium.

Status: partially implemented with protected interview anonymisation and bulk
message body redaction endpoints. Still needs admin UX and scheduled retention.

### P1-006 Google Workspace production posture

Problem: Google/Gmail production use must stay compliant without over-requesting
permissions.

Risk: OAuth scope creep, untrusted Workspace app, or unnecessary restricted
scope use.

Solution: Feature-based Google scopes, internal/trusted Workspace guidance,
encrypted token storage and visible missing-scope warnings.

Business value: Makes the product credible for real Gmail/Calendar use.

Effort: Medium.

Dependencies: Google Workspace admin configuration.

Implementation risk: Medium.

Status: implemented in code/docs for a one-person internal Workspace app.

## P2 - Valuable

- Unmatched Gmail reply queue.
- HTML-to-text and quote/signature stripping.
- Full Google Workspace login instead of single-user password login.
- Structured logs and correlation IDs.
- AIProvider with OpenAI Responses API structured outputs.
- Cost telemetry.
- Message style regression tests.
- Panel/interviewer availability logic.
- Candidate self-reschedule links with recruiter-defined limits.
- Interview briefing pack.
- Debrief workflow.

## P3 - Nice To Have

- WhatsApp/SMS integration after consent design.
- Recruiter preference learning.
- Candidate preference memory.
- Smart chase timing.
- Advanced analytics.
- Slack/Teams internal notifications.

## Recommendation

Implement P0 first. Then do P1-001 and P1-002 before adding more AI. A scheduling
agent lives or dies on boring reliability, not clever copy.
