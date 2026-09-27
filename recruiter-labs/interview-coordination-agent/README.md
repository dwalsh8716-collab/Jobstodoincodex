# Interview Coordination Agent

Private Recruiter Labs product for interview scheduling and coordination.

## Status

Phase 1 local MVP in progress.

This folder now contains the standalone planning pack plus a working local MVP
with:

- FastAPI backend
- Next.js frontend
- SQLAlchemy data model
- mocked email provider
- mocked calendar provider
- optional Gmail sending through Google OAuth
- optional Google Calendar event creation
- optional Google Meet link creation through Google Calendar
- optional recruiter calendar conflict checks, off by default
- secure candidate/client availability links
- public weekly availability picker for candidates and clients
- rule-based availability parser
- deterministic overlap matching
- recruiter approval gate
- stale availability superseding
- Google OAuth state verification
- approval operation idempotency guard
- reschedule approval that updates the existing event
- cancellation approval that cancels the existing event and reminders
- manual due-work runner for reminders and capped chases
- lightweight automatic worker for due reminders, chases and Gmail reply sync
- operational alerts dashboard
- HttpOnly cookie sessions with bearer fallback
- basic login and public-link rate limiting
- protected anonymisation and message-body redaction endpoints
- confirmation messages
- reminder records
- manual CRM summary output

Real Gmail and Google Calendar are opt-in. The app defaults to mock mode so it
cannot accidentally send live messages or create real calendar events before the
recruiter has configured and connected Google.

Candidate and client calendars are not connected in Version 1. They provide
availability by email reply or the private availability picker. Google Calendar
is used to create the final invite and Google Meet link after recruiter
approval. Organiser-side Google events are created as available/free by default
so they do not block the recruiter's diary when the recruiter is not attending.

Microsoft Graph, Outlook Calendar and OpenAI calls are not enabled yet.

## How The Automation Works

The recruiter still starts each workflow manually and approves the final slot.
The app can then handle the admin in the background:

1. Send availability requests.
2. Sync Gmail replies.
3. Parse availability.
4. Find overlapping candidate/client times.
5. Ask the recruiter to approve the slot.
6. Create the Google Calendar invite and Meet link.
7. Send confirmations.
8. Send reminders and limited chases.

Candidate and client calendars are not connected. They simply reply by email or
use the private availability picker.

## Product Goal

Move a recruiter from:

```txt
Client wants to interview Sarah.
```

to:

```txt
Sarah is confirmed for Wednesday at 2pm, everyone has been emailed, calendar
invites are sent, reminders are scheduled and the interview is being tracked.
```

with as little manual admin as possible while keeping the recruiter in control
of approvals, exceptions, reschedules, cancellations and sensitive decisions.

## Product Boundary

This is a standalone private operations app. It does not depend on Loxo or any
CRM API.

Version 1 uses manual data entry through the internal app. The recruiter may
copy the final interview summary into Loxo manually after confirmation.

Future CRM connectors can be added behind the `CRMConnector` interface, but only
`ManualCRMConnector` is in scope for version 1.

## Core Principles

- Reliability over flashy AI.
- Human approval before confirmed interview creation.
- Deterministic calendar logic for time, overlap, conflicts and reminders.
- AI only for language understanding, intent classification and message drafts.
- UK recruiter tone in all external communication.
- Full auditability for workflow transitions, messages and approvals.
- UK GDPR by design.
- Low operating cost through caching, structured outputs and conventional code.

## Preferred Stack

- Backend: Python, FastAPI.
- Frontend: Next.js, React.
- Database: PostgreSQL.
- Background jobs: Redis and Celery.
- Deployment: Docker and Docker Compose first, production container deployment
  later.
- Optional automation: n8n may be used around the edges, but not for core
  workflow correctness.

## Planning Documents

- `ARCHITECTURE.md`
- `DATA_MODEL.md`
- `WORKFLOW.md`
- `INTEGRATIONS.md`
- `SECURITY.md`
- `PRIVACY.md`
- `DEPLOYMENT.md`
- `GOOGLE_WORKSPACE_PRODUCTION.md`
- `TESTING.md`
- `IMPLEMENTATION_PLAN.md`
- `EMAIL_SETUP.md`
- `GOOGLE_SETUP.md`
- `QA_BASELINE.md`
- `TEST_MATRIX.md`
- `MASTER_QA_REPORT.md`
- `PRODUCTION_READINESS.md`
- `UPGRADE_ROADMAP.md`

## Local Development

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
APP_LOGIN_EMAIL=david@example.com APP_LOGIN_PASSWORD=local-test-password SESSION_SECRET=local-test-secret uvicorn app.main:app --reload --port 8005
```

Frontend:

```bash
cd frontend
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:8005 npm run dev
```

Open:

```txt
http://localhost:3005
```

Docker Compose can be used once a local `.env` file has been created with the
required login, database and secret values.

## Backups

For the local SQLite MVP:

```bash
scripts/backup_sqlite.sh
scripts/restore_sqlite.sh backups/interview_agent_YYYYMMDDTHHMMSSZ.db
```

For production, move to PostgreSQL with managed backups before relying on the
app for live candidate/client scheduling.

## Real Email And Calendar Testing

By default, email is mocked and no message is delivered to an inbox.

For SMTP test sending, see `EMAIL_SETUP.md`.

For Gmail sending, Gmail reply sync, Google Calendar and Google Meet, see
`GOOGLE_SETUP.md` and `GOOGLE_WORKSPACE_PRODUCTION.md`.

If Google says the client is restricted to its organisation, the wrong Google
account was selected. Use the company Google Workspace account, not a personal
Gmail account. The local OAuth flow now asks Google to show the account picker
and can hint the company domain via `GOOGLE_OAUTH_HOSTED_DOMAIN`.
