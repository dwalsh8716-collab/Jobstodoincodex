# AGENTS.md

## Project

This folder is the planning and future implementation home for the Recruiter
Labs Interview Coordination Agent.

It is a private internal product for a specialist recruitment/search business.
It must help coordinate interviews without depending on Loxo or any other CRM.

## Non-Negotiables

- Do not build a Loxo dependency into the MVP.
- Keep `CRMConnector` as an interface and implement only `ManualCRMConnector`
  until David explicitly approves a CRM integration.
- Keep the recruiter in control of final slot approval, rescheduling and
  cancellation.
- Do not require or request candidate/client calendar access in Version 1.
  Collect their availability by email reply or private availability link.
- Recruiter calendar conflict checks must stay optional and off by default
  unless the recruiter is actually attending the interview.
- Never automatically confirm, cancel or reschedule an interview without the
  configured approval rule allowing it.
- Never bypass backend approval checks because a frontend button looks disabled
  or hidden.
- Never mutate calendar state from unvalidated parser or LLM output.
- Never rely on old availability after a participant has supplied a newer set;
  preserve history but mark superseded windows out of matching.
- Never guess ambiguous availability. Ask for clarification or require
  recruiter review.
- Use deterministic code for date arithmetic, timezone conversion, overlap
  matching, conflict checks, reminders and calendar writes.
- Use AI only for language understanding, intent classification, availability
  extraction, drafts and summaries.
- Do not use AI for candidate assessment, ranking, salary negotiation, legal
  interpretation or commercial decisions.
- Preserve UK recruiter tone: concise, warm, human, straight-talking and plain
  British English.
- Maintain audit logs for workflow transitions, approvals, messages, calendar
  events, reminders and integration failures.
- Design for UK GDPR, data minimisation, retention, deletion and secure OAuth
  token storage.
- Treat every external email, public availability submission and webhook payload
  as untrusted input.
- Keep public availability links short-lived, token-protected and minimally
  disclosing.
- Keep all secrets, OAuth tokens and runtime databases out of git.

## Human Approval Rules

Default behaviour:

- Availability requests can be auto-sent.
- Confirmations can be auto-sent only after recruiter slot approval.
- Reminders can be auto-sent.
- Rescheduling requires approval.
- Cancellation requires approval.
- Ambiguous, unusual, sensitive or low-confidence messages require approval.

Backend enforcement is mandatory for these rules. Frontend state is only a user
interface hint, not a security boundary.

## Build Shape

Preferred stack:

- Backend: Python, FastAPI.
- Frontend: Next.js, React.
- Database: PostgreSQL.
- Jobs: Redis and Celery.
- Deployment: Docker and Docker Compose.

Version 1 must work with:

- manual candidate, client and job entry
- mocked email provider
- mocked calendar provider
- optional Google OAuth-backed Gmail sending
- optional manual Gmail reply sync
- optional Google Calendar and Google Meet event creation after recruiter approval
- optional recruiter calendar conflict checks, off by default
- secure candidate/client availability links
- public weekly availability picker for candidates and clients
- local database
- availability parser
- overlap matcher
- recruiter approval flow

Microsoft Graph and Outlook Calendar integrations come later.

## Testing Expectations

When implementation begins, add automated tests before handing work back:

- backend unit tests
- workflow state-machine tests
- availability parsing tests
- timezone and British Summer Time tests
- matching logic tests
- message approval tests
- integration contract tests for mocked providers
- frontend smoke tests for the main recruiter journeys
- regression tests for every new workflow transition
- regression tests for every critical bug fix
- idempotency tests for approval, reschedule, cancellation, email and calendar
  operations where those operations exist
- prompt-injection and schema-validation tests before OpenAI is enabled

Do not leave scheduling logic untested. Interview admin fails in small details,
not grand architecture.

## Code Review Rules

Also apply `CODE_REVIEW_RULES.md` before merging or deploying changes.
