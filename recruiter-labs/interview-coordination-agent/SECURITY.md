# Security

## Security Goal

This is a private internal operations app handling personal data, interview
logistics, email content and OAuth tokens. It must be designed as a secure
workflow product, not a public website feature.

## Authentication

Preferred options:

- Google Workspace OAuth
- Microsoft OAuth
- secure email and password with MFA

Version 1 can support one user, but the model should support multiple
recruiters later.

Security requirements:

- secure sessions
- short-lived session cookies
- CSRF protection for browser actions
- MFA for password auth
- account lockout or rate limiting
- no shared admin password in production

## Authorisation

Use role-based access control.

Initial roles:

- owner
- recruiter
- admin
- read_only

Protected actions:

- approving interview slots
- sending non-routine messages
- confirming cancellation
- modifying calendar events
- changing provider settings
- viewing audit logs
- deleting personal data

## Secrets

Never commit credentials.

Secrets include:

- OpenAI API key
- Gmail OAuth client secret
- Microsoft OAuth secret
- Google Calendar OAuth refresh tokens
- Outlook Calendar OAuth refresh tokens
- database credentials
- encryption keys
- session secrets

Production secrets should live in the hosting platform secret store.

OAuth access and refresh tokens must be encrypted before storage.

## Data Protection

Encryption in transit:

- HTTPS only
- secure cookies
- HSTS in production

Encryption at rest:

- database volume encryption where available
- encrypted OAuth tokens
- encrypted stored message bodies where retained
- encrypted backups

## Audit Logging

Audit these events:

- login success and failure
- interview created
- workflow state changed
- message preview created
- message sent
- message approval granted
- AI extraction used
- low-confidence AI result escalated
- calendar event created
- calendar event updated
- reschedule requested
- cancellation requested
- cancellation confirmed
- reminder sent
- provider connection added or removed
- OAuth expiry or failure
- personal data deleted

Audit logs should be append-only for normal application users.

## Approval Safety

Defaults:

- availability requests can auto-send
- confirmations auto-send only after recruiter slot approval
- reminders can auto-send
- reschedules require approval
- cancellations require approval
- ambiguous messages require approval

The system must never hide an irreversible action behind automation.

## AI Safety

AI cannot:

- make hiring decisions
- rank candidates
- assess suitability
- decide salary negotiation
- interpret legal issues
- calculate date/time overlaps
- create calendar events without deterministic validation and approval

Every AI output used for workflow action must pass schema validation.

Low confidence means:

- ask a clarification, or
- escalate to recruiter

## Provider Webhook Security

Webhook endpoints must:

- verify provider signatures where available
- use idempotency keys
- deduplicate provider message IDs
- reject unknown provider accounts
- rate-limit repeated events
- log safe failure summaries

## Error Visibility

Never silently fail.

Recruiter-facing error panels must explain:

- what happened
- what failed
- who is affected
- whether anything was sent
- whether the calendar changed
- what action is required

## Threats To Design Against

- compromised OAuth token
- mistaken auto-send
- duplicate calendar event
- candidate reply matched to wrong interview
- malicious email content
- leaked message body
- stale provider webhook
- deleted external calendar event
- user session hijack
- over-retention of personal data

