# Implementation Plan

## Phase 0: Architecture And Product Boundary

Status: current.

Deliverables:

- `README.md`
- `AGENTS.md`
- `ARCHITECTURE.md`
- `DATA_MODEL.md`
- `WORKFLOW.md`
- `INTEGRATIONS.md`
- `SECURITY.md`
- `PRIVACY.md`
- `DEPLOYMENT.md`
- `TESTING.md`
- `IMPLEMENTATION_PLAN.md`

Decision:

Build this as a standalone private Recruiter Labs product, not as a public
website feature and not as a Loxo-dependent workflow.

## Proposed Folder Structure

When implementation starts:

```txt
recruiter-labs/interview-coordination-agent/
  backend/
    app/
      api/
      core/
      integrations/
      models/
      services/
      workflows/
      workers/
      tests/
  frontend/
    app/
    components/
    lib/
    tests/
  docker-compose.yml
  README.md
  AGENTS.md
```

## Phase 1: Standalone Local MVP

Goal:

Prove the core scheduling workflow with mocked integrations.

Build:

- secure local login
- dashboard shell
- new interview form
- PostgreSQL schema
- workflow state machine
- manual candidate/client/job entry
- mocked email provider
- mocked calendar provider
- availability parser
- overlap matcher
- recruiter approval card
- calendar event draft/create through mock provider
- confirmation message previews
- manual CRM summary
- activity log

Do not build:

- Gmail API
- Microsoft Graph
- Google Calendar API
- Outlook Calendar API
- real email sends
- real calendar writes
- Loxo integration

Acceptance criteria:

1. Recruiter logs in.
2. Recruiter creates a new interview.
3. App detects missing availability.
4. Mock emails are created or sent.
5. Mock replies are parsed.
6. Matching proposes top slots.
7. Recruiter approves one slot.
8. Mock calendar event is created.
9. Confirmation messages are generated.
10. Activity log shows the whole workflow.

## Phase 2: Real Email Integration

Goal:

Connect real inbound and outbound email while preserving approval rules.

Build one provider first:

- Gmail API, or
- Microsoft Graph Mail

Capabilities:

- OAuth connection
- send routine messages
- monitor replies
- webhook or polling support
- provider message/thread mapping
- duplicate reply handling
- reply-to workflow matching
- OAuth expiry handling

Acceptance criteria:

- replies are matched without relying solely on subject lines
- ambiguous replies do not create guessed slots
- low-confidence parsing escalates
- no duplicate messages from duplicate webhooks

## Phase 3: Real Calendar Integration

Goal:

Create and update real calendar events after recruiter approval.

Build one provider first:

- Google Calendar, or
- Outlook Calendar

Capabilities:

- recruiter calendar connection
- conflict checking
- event creation
- virtual meeting link creation where supported
- event update for reschedules
- event cancellation after approval
- deleted external event detection

Acceptance criteria:

- no event is created before approval
- reschedules update existing events
- duplicate calendar events are prevented
- provider failures are visible

## Phase 4: Reminders, Chases And Rescheduling

Goal:

Remove routine follow-up admin without losing human control.

Build:

- reminder scheduler
- candidate 24-hour reminder
- recruiter morning reminder
- optional candidate 2-hour reminder
- optional client reminder
- configurable chase rules
- maximum automated chases
- reschedule detection
- cancellation detection
- approval cards for reschedule/cancellation
- paused reminders during reschedule/cancellation

Acceptance criteria:

- reminders pause when they should
- chases stop after configured maximum
- reschedules never create duplicate interviews
- cancellations require approval

## Phase 5: Dashboard And Analytics

Goal:

Make the product operationally useful day to day.

Build:

- Today
- Awaiting Responses
- Needs Approval
- Upcoming
- Reschedule Requests
- Completed
- Activity Log
- search by candidate, client, company, job, date and status

Analytics:

- interviews scheduled
- average time to schedule
- average number of messages
- candidate response time
- client response time
- reschedules
- cancellations
- manual interventions
- hours saved
- estimated admin cost saved
- AI cost per interview

## Phase 6: Production Deployment And Hardening

Goal:

Move from local MVP to private production use.

Build:

- production auth
- encrypted OAuth tokens
- secrets management
- HTTPS
- backups
- retention jobs
- deletion workflow
- monitoring
- error reporting
- provider reconnect UX
- production runbooks

Production gate:

- security review complete
- privacy review complete
- real provider tests passed
- calendar idempotency tested
- reschedule and cancellation tested
- no Loxo dependency
- audit logs verified

## Build Order Recommendation

1. Backend domain model and state machine.
2. Database migrations.
3. Mock provider interfaces.
4. Availability parser and validator.
5. Deterministic matching engine.
6. New interview form.
7. Workflow detail and approval UI.
8. Mock end-to-end journey.
9. Tests.
10. Real provider integration.

This order keeps the hard operational logic central. The interface can improve
over time, but the workflow engine needs to be dependable from day one.

