# Architecture

## Overview

The Interview Coordination Agent is a private internal web application for
running interview scheduling workflows independently of Loxo.

The product has four major layers:

1. Recruiter web app
2. FastAPI application backend
3. Workflow and job engine
4. Provider integrations

Version 1 runs locally with mocked email and calendar providers. Later phases
swap in Gmail or Microsoft Graph for email, and Google Calendar or Outlook
Calendar for calendar creation.

## Recommended Product Home

Private deployment target:

```txt
ops.essentialresourcing.co.uk
```

Internal route shape:

```txt
/login
/dashboard
/interviews/new
/interviews/:id
/interviews/:id/approval
/settings
/activity-log
```

The public Essential Resourcing website should not expose this product, link to
it publicly, include it in sitemap routes, or include it in AI index routes.

## System Diagram

```txt
Recruiter Browser
  -> Next.js Internal UI
  -> FastAPI Backend
  -> PostgreSQL
  -> Redis
  -> Celery Workers

Celery Workers
  -> EmailProvider
  -> CalendarProvider
  -> AIProvider
  -> Reminder Scheduler
  -> Audit Logger

Provider Implementations
  -> MockEmailProvider for phase 1
  -> MockCalendarProvider for phase 1
  -> GmailEmailProvider or GraphEmailProvider later
  -> GoogleCalendarProvider or OutlookCalendarProvider later
  -> OpenAIResponsesProvider later
  -> ManualCRMConnector for phase 1
```

## Backend Services

### InterviewWorkflowService

Owns the state machine. It creates workflow records, checks missing
information, creates workflow events and schedules background tasks.

It is the only service allowed to move an interview between workflow states.

### AvailabilityService

Stores candidate, client and interviewer availability. It accepts both manual
availability entered by the recruiter and parsed availability extracted from
email replies.

It does not calculate final slots by itself.

### AvailabilityParserService

Uses AI to convert natural-language replies into structured availability
windows.

It must validate all AI output against a schema. Low-confidence output is not
used as fact. It either triggers a clarification request or escalates to the
recruiter.

### SchedulingService

Deterministically calculates overlaps, timezones, buffers, working hours,
calendar conflicts and ranked slot options.

No LLM calls are allowed inside this service.

### ApprovalService

Creates recruiter approval cards for recommended slots, alternatives,
reschedule requests and cancellation requests.

It records who approved what and when.

### MessageService

Creates message previews, applies auto-send rules and sends or queues external
messages through the active `EmailProvider`.

It must never hide an unusual or sensitive message behind automation.

### CalendarService

Creates or updates calendar events through the active `CalendarProvider` after
recruiter approval.

It owns idempotency for calendar writes so reschedules do not accidentally
create duplicate interviews.

### ReminderService

Creates reminder records and background jobs. It pauses reminders during
reschedule or cancellation flows.

### IntegrationEventService

Receives email and calendar webhook events, deduplicates them, matches them to
interviews, and sends them into the workflow engine.

### AuditService

Writes append-only audit records for actions, transitions, provider calls,
approvals, errors and manual overrides.

## Frontend Areas

### Dashboard

Required dashboard sections:

- New Interview
- Today
- Awaiting Responses
- Needs Approval
- Upcoming
- Reschedule Requests
- Completed
- Activity Log

### New Interview Form

Form title:

```txt
Start Interview Coordination
```

Required field groups:

- candidate
- client
- role
- interview format

Optional field groups:

- office location
- additional interviewers
- preferred date range
- known client availability
- known candidate availability
- candidate preparation notes
- recruiter instructions

Primary action:

```txt
Start Coordination
```

### Workflow Detail

Opening a workflow must show:

- original entered details
- participant list
- current state
- missing information
- sent and received messages
- parsed availability
- proposed slots
- approval decisions
- calendar event state
- reminders
- reschedule history
- cancellation history
- audit history

### Approval Cards

Approval cards must offer:

- Approve
- Select Alternative
- Change Time
- Request More Availability
- Cancel Workflow

## State Ownership

The backend is the source of truth. The frontend displays state and sends
explicit recruiter actions.

Background workers may suggest next steps, draft messages and create approval
cards. They must not bypass the state machine.

## AI Boundary

AI is allowed for:

- email reply understanding
- availability extraction
- intent classification
- message drafting
- thread summaries
- ambiguity detection

AI is not allowed for:

- arithmetic
- timezone conversion
- calendar conflict logic
- event creation decisions
- cancellation without approval
- candidate assessment
- salary negotiation
- legal interpretation

## Loxo Boundary

Version 1 has no Loxo dependency.

The only CRM component in version 1 is:

```txt
ManualCRMConnector
```

It exists to make manual CRM updates quicker by producing a compact interview
summary for copying into Loxo or another CRM.

Future connector names may include:

- LoxoConnector
- BullhornConnector
- VincereConnector
- RecruitCRMConnector

None of those should be implemented until the standalone scheduling product is
stable and the integration has a clear business case.

