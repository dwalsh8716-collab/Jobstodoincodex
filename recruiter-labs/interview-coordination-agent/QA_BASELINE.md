# QA Baseline

Date: 2026-08-18

Auditor stance: forensic QA of the current standalone Interview Coordination
Agent. This baseline records what the code actually implements, not what the
roadmap says it will eventually do.

## Executive Summary

The product is a working local MVP with a credible core scheduling path:

1. recruiter logs in with local credentials
2. recruiter creates an interview manually
3. system sends or records availability request messages
4. candidate/client availability can be captured from text replies or public
   availability links
5. overlap matching proposes top slots
6. recruiter approval is required before calendar creation
7. confirmation messages, reminder records and a manual CRM summary are created

The product is not production-ready yet. It is currently best described as
Phase 1 plus early Google Phase 1.5:

- real Gmail send can work once Google is connected
- manual Gmail reply sync exists
- Google Calendar event creation exists
- Google Meet link creation exists
- candidate/client public availability picker exists
- background jobs, true webhooks, automatic reminders, reschedule completion,
  cancellation approval, OpenAI structured outputs, production auth,
  idempotent calendar updates and retention/deletion controls are not complete

The highest-risk gaps are calendar idempotency, OAuth state verification,
production authentication, plaintext message storage, limited availability
parsing, missing background jobs, and incomplete reschedule/cancellation flows.

Post-audit update:

- Google OAuth state verification has been implemented for the local MVP.
- Availability windows are now superseded when a participant submits newer
  availability, preserving history while excluding stale windows from matching.
- Minute precision and ambiguous bare low-hour time handling have been fixed in
  the rule-based parser.
- Repeat approval after scheduling is idempotent; full transactional
  outbox/reconciliation remains required before production.
- Misleading empty dashboard sections and unsafe inactive approval buttons have
  been corrected.

## Evidence Read

Documents inspected:

- `README.md`
- `AGENTS.md`
- `ARCHITECTURE.md`
- `WORKFLOW.md`
- `DATA_MODEL.md`
- `INTEGRATIONS.md`
- `SECURITY.md`
- `PRIVACY.md`
- `TESTING.md`
- `DEPLOYMENT.md`
- `IMPLEMENTATION_PLAN.md`
- `EMAIL_SETUP.md`
- `GOOGLE_SETUP.md`
- `frontend/AGENTS.md`

Code areas inspected:

- FastAPI backend
- Next.js frontend
- SQLAlchemy models
- local SQLite runtime database
- provider abstractions
- Gmail/Google Calendar integration code
- public availability link code
- workflow service
- scheduling service
- rule-based availability parser
- local auth/session code
- backend tests
- Docker/Docker Compose files

## Current Runtime Baseline

At inspection time:

- Backend local server on `127.0.0.1:8005`: not running.
- Frontend local server on `127.0.0.1:3005`: not running.
- Local SQLite database exists at `backend/data/interview_agent.db`.
- Runtime database contains test/demo records, including one Google integration
  connection record.
- `backend/.env` exists and is ignored by git.
- `backend/data/`, `.next/`, `node_modules/` and virtualenv artefacts are
  ignored by project `.gitignore`.

Latest test run:

- Backend: `15 passed`, 2 FastAPI deprecation warnings.
- Frontend: TypeScript check passed.
- Frontend: production build passed.
- `npm audit --omit=dev`: 0 known vulnerabilities reported.

## What Is Actually Implemented

### Backend

Implemented:

- FastAPI app with routes for auth, dashboard, interviews, public availability
  and integrations.
- Local bearer-token login using configured email/password/session secret.
- SQLAlchemy schema with tables for users, candidates, contacts, companies,
  jobs, interviews, participants, availability windows, messages, email
  threads, calendar events, reminders, workflow events, audit logs, settings,
  integration connections and manual CRM exports.
- `ManualCRMConnector` only. No Loxo dependency found.
- `WorkflowService` owns the main state transitions.
- Workflow events and audit logs are written during transitions.
- Availability request messages are generated automatically.
- Public availability links are generated with hashed tokens.
- Public availability picker submissions are accepted without login through a
  token-protected endpoint.
- Rule-based parser detects common availability, reschedule and cancellation
  language.
- Deterministic overlap matcher generates top slots in 15-minute increments.
- Recruiter approval endpoint requires `AWAITING_RECRUITER_APPROVAL` before
  creating calendar events and confirmations.
- Mock email provider.
- SMTP provider for controlled local testing.
- Gmail provider using Google OAuth.
- Google Calendar provider creating calendar events and Google Meet links.
- Manual Gmail sync route for recent replies.

### Frontend

Implemented:

- Private app login screen.
- Dashboard shell with sections:
  - New Interview
  - Today
  - Awaiting Responses
  - Needs Approval
  - Upcoming
  - Reschedules
  - Completed
  - Activity Log
- Integration status panel.
- Connect/Reconnect Google button.
- Manual Gmail reply sync button.
- New interview form.
- Mock reply entry controls.
- Approval slot display and approve buttons.
- Workflow detail for messages, availability, calendar, reminders and audit
  history.
- Manual CRM summary copy buttons.
- Candidate/client public availability picker for five business days.

### Integrations

Implemented:

- Google OAuth auth URL generation.
- Google OAuth code exchange.
- Encrypted storage of Google access/refresh tokens using Fernet.
- Token refresh logic.
- Gmail message send.
- Gmail recent message listing and full message fetch.
- Matching Gmail replies by workflow header or `[ERINT-...]` subject marker,
  with a limited sender/state fallback.
- Google Calendar event creation with `sendUpdates=all`.
- Google Meet creation for Google Meet interviews.

## What Is Mocked

- Email by default.
- Calendar by default.
- Calendar conflict checks.
- Recruiter calendar busy-window checks.
- Interviewer calendar busy-window checks.
- Reminder sending.
- Chasing.
- Most inbox monitoring, because Gmail sync is manual polling from the
  dashboard.
- AI provider, because current parser is rule-based.
- Background workflow automation.

## What Is Partially Implemented

### Rescheduling

Current behaviour:

- reschedule intent can be detected
- workflow moves to `RESCHEDULE_REQUESTED`
- scheduled reminders are paused
- existing calendar event row is preserved

Missing:

- new availability collection flow
- new slot approval card
- update of existing provider event
- notification to all parties
- duplicate prevention under retries
- stale reminder cleanup/recreation

### Cancellation

Current behaviour:

- cancellation intent can be detected
- workflow moves to `CANCELLATION_REQUESTED`
- reminders pause

Missing:

- cancellation approval card backend action
- calendar cancellation/update
- attendee notification
- reason capture
- final `CANCELLED` transition

### Approval UI

Current behaviour:

- actual approve buttons exist on proposed slots

Missing:

- `Select Alternative`, `Change Time`, `Request More Availability` and
  `Cancel Workflow` are visible buttons but do not perform actions yet.

### Public Availability Picker

Current behaviour:

- public token link shows five business days
- users select Morning, Early afternoon or Late afternoon blocks
- notes can be submitted

Missing:

- preferred date-range support
- configurable working hours
- fine-grained time selection
- explicit timezone warning when participants differ
- rate limiting and abuse controls

### Gmail Reply Sync

Current behaviour:

- manual sync fetches recent Gmail messages
- duplicates are skipped by provider message ID
- own mail is skipped
- workflow ID header/subject is preferred
- sender plus active workflow fallback is used only when one match exists

Missing:

- webhook verification
- scheduled polling
- robust message/thread persistence
- out-of-office/bounce handling
- HTML-only/signed email normalisation beyond snippets
- forward/reply-chain handling
- cross-workflow contamination tests

### Google Calendar

Current behaviour:

- creates a new Google Calendar event after approval
- invites candidate/client/interviewers
- creates Meet link for Google Meet format

Missing:

- deterministic conflict checks against recruiter/interviewer calendars
- provider idempotency key persisted before external write
- update existing event for reschedule
- cancel event after approved cancellation
- detect externally deleted events
- transactional outbox or retry-safe calendar mutation

## What Is Missing

Production-critical missing items:

- PostgreSQL migrations.
- Redis/Celery workers.
- Scheduler for reminders/chases/post-interview prompts.
- Production-grade auth with Google Workspace/Microsoft OAuth or MFA.
- Role-based authorisation enforcement.
- Login rate limiting/account lockout.
- CSRF protections for browser-initiated state changes.
- Secure, HttpOnly session cookies.
- Separate encryption key handling. Current encryption derives from
  `SESSION_SECRET`.
- Message body encryption or retention controls.
- Candidate/client data deletion workflow.
- OAuth disconnect/revoke workflow.
- OAuth state persistence and callback verification.
- Provider webhook signature verification.
- API-level idempotency keys for critical mutation endpoints.
- Calendar event update/cancel APIs.
- OpenAI Responses API integration.
- Structured Outputs schema validation for AI results.
- AI cost tracking.
- Observability metrics and alerting.
- Error tracking integration.
- Disaster recovery and restore process.
- Load/performance tests.
- Frontend automated tests.
- End-to-end tests against the running local app.

## Architecture Deviations From Plan

- Planned database: PostgreSQL. Current default runtime: SQLite.
- Planned migrations: none present. Current database creation uses
  `Base.metadata.create_all()` plus one manual incremental column patch.
- Planned background jobs: Redis/Celery. Current code has no worker or scheduler
  modules.
- Planned `AIProvider`: no provider interface implementation beyond a
  rule-based parser.
- Planned provider interfaces include list replies, webhooks, update/cancel
  calendar event and conflict checks. Current protocols are much narrower.
- Planned multi-user model exists in schema but authorisation is effectively a
  single configured user.
- Planned approval cards for reschedule/cancellation are not implemented.

## Technical Debt

- Session tokens are custom signed bearer tokens and stored in browser
  `localStorage`.
- Auth uses a configured plaintext password rather than a user table with
  password hashing or OAuth.
- `Message.body_plain` stores full message content in plaintext.
- OAuth token encryption is tied to `SESSION_SECRET`, not a dedicated
  production encryption key.
- OAuth `state` is generated but not stored or verified.
- `approve_slot` performs calendar provider calls before the database commit
  with no transaction/outbox/idempotency protection.
- Repeated availability submissions delete prior link-submitted availability
  for that participant without preserving old structured windows in history.
- Additional interviewers are invited to calendar events but their availability
  is not requested or considered during matching.
- Calendar event descriptions include a warning sentence to avoid sensitive
  notes. This is operationally useful internally but may look odd in a client
  or candidate calendar invite.
- Dashboard search falls back to all interviews when a section has no section
  items, which can make empty sections appear populated.
- Frontend has no lint script and no automated UI test script.
- Backend uses deprecated FastAPI startup event.

## Security Concerns

Severity scale: Critical, High, Medium, Low.

- High: OAuth callback does not verify stored `state`; susceptible to OAuth
  CSRF/session confusion.
- High: Local auth is not production-grade; no MFA, rate limiting, account
  lockout, password hashing, OAuth login or role enforcement.
- High: Message bodies and notes are stored in plaintext.
- High: Critical actions rely on bearer tokens stored in `localStorage`, raising
  XSS/session theft risk.
- High: Calendar creation is not idempotent under retry/partial failure.
- Medium: Public availability links are bearer links with no rate limiting.
- Medium: CORS allows local origins broadly and all methods/headers.
- Medium: Provider errors are stored as text and may expose provider detail in
  the UI if not sanitised.
- Medium: No security headers are configured in Next/FastAPI deployment.
- Medium: No audit entry for login success/failure.
- Medium: No OAuth token revocation/disconnect path.
- Low: FastAPI startup event deprecation should be cleaned up before hardening.

## Privacy / UK GDPR Concerns

- Full email bodies are retained in `messages.body_plain`.
- Retention settings exist in documentation but not implementation.
- Candidate deletion has a `deleted_at` column but no deletion/anonymisation
  endpoint.
- Audit logs can include actor identifiers and metadata without retention
  control.
- Availability notes from public links are stored as message bodies.
- OpenAI is not currently used, so there is no AI data-processing risk in code
  yet, but no guardrails exist for future OpenAI payload minimisation.
- Calendar event descriptions correctly avoid candidate assessment, but the
  product still needs a stricter template review before real clients use it at
  volume.

## Test Coverage Baseline

Current backend tests cover:

- start workflow with missing availability
- known availability creates approval card but no event
- approval creates mock event, confirmations, reminders and CRM export
- SMTP misconfiguration surfaces failed messages
- reschedule reply pauses reminders and preserves event row
- parser handles common availability
- parser avoids one ambiguous phrase
- parser detects one reschedule phrase
- parser detects one cancellation phrase
- scheduling overlap happy path
- no-overlap path
- one British Summer Time conversion
- Google OAuth URL scopes/offline access
- availability link token hashing
- public availability submission updates workflow

Major test gaps:

- 100 synthetic availability scenarios.
- Ambiguous terms such as `10ish`, `first thing`, `school run`, `Friday week`,
  `Monday after next`, `end of day`.
- GMT/BST transition days.
- leap years, end-of-month and end-of-year.
- international timezone scenarios.
- multi-interviewer/panel scheduling.
- candidate/client changing availability.
- duplicate Gmail replies under concurrency.
- OAuth expiry during send/calendar create.
- Google API outage and partial failure.
- duplicate approval requests.
- calendar event created but database commit fails.
- database commit succeeds but email send fails.
- cancellation approval flow.
- reschedule completion flow.
- deleted external calendar event.
- frontend form and approval button tests.
- public availability mobile UI tests.

## Current Strengths

- No Loxo dependency found.
- Recruiter approval is enforced server-side before first calendar event
  creation.
- Default mock mode prevents accidental email/calendar writes.
- Google status is visible to the recruiter.
- Public availability links store token hashes rather than raw tokens.
- Gmail reply matching does not rely solely on subject lines when workflow
  headers/markers are available.
- The core scheduling matcher is deterministic and separate from language
  parsing.
- Existing message tone is concise, human and broadly aligned with a UK
  recruiter voice.
- Tests pass and cover the most basic workflow path.

## Production Readiness Baseline

Current score estimate: 34 / 100.

Reasoning:

- Strong enough for local controlled tests with the recruiter watching.
- Not safe enough for unattended coordination of real candidate/client
  interviews at volume.
- Needs P0 fixes around OAuth state, idempotency, auth/session posture,
  plaintext storage decisions, and completion of reschedule/cancellation
  controls before any production-like use.

## Initial P0 Candidate Fixes

These need validation through the full test matrix before implementation:

1. Add OAuth state persistence and callback verification.
2. Add idempotency protection around slot approval/calendar creation.
3. Prevent duplicate confirmation messages on repeated approval attempts.
4. Add backend actions for cancellation approval or disable visible cancellation
   button until it works.
5. Add backend actions for request-more-availability or disable visible button
   until it works.
6. Add rate limiting/abuse protection for login and public availability links.
7. Stop exposing full message bodies by default in list/detail responses unless
   explicitly needed for an internal view.
8. Add a clear production safety banner/status when using local password auth,
   SQLite, mock providers or missing workers.
