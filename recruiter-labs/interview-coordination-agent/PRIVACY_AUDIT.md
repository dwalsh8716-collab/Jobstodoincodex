# Privacy Audit

Date: 2026-08-24

Jurisdiction posture: UK GDPR-aware internal recruitment coordination app.

## Personal Data Stored

| Data | Table/Area | Current Purpose | Risk |
|---|---|---|---|
| Candidate name/email/mobile/location/timezone | `candidates` | interview coordination | Medium |
| Client contact name/email/timezone | `client_contacts` | interview coordination | Medium |
| Interview notes/prep/instructions | `interviews`, `jobs` | recruiter context | High if sensitive notes are entered |
| Email bodies and excerpts | `messages` | audit and parsing | High |
| Availability windows | `availability_windows` | scheduling | Medium |
| Calendar event metadata and meeting links | `calendar_events` | scheduling | Medium |
| Workflow/audit events | `workflow_events`, `audit_logs` | traceability | Medium |
| OAuth tokens | `integration_connections` | Gmail/Calendar access | High |

## Current Safeguards

- Public availability tokens are hashed in storage.
- Google access and refresh tokens are encrypted before storage.
- `.env` and runtime database files are ignored by git.
- The app avoids Loxo dependency and does not push candidate data into a CRM.
- Calendar invite description tells users not to include sensitive notes.
- Protected API endpoints can anonymise an interview workflow and redact old
  message bodies.

## P0 Findings

No immediate evidence of committed secrets was found in the source scan, but the
runtime `.env` and SQLite database exist locally and must remain uncommitted.

## P1 Findings

### P1-PRIV-001: No deletion/anonymisation mechanism

Risk: Candidate/client data may be retained indefinitely.

Fix:

- Add deletion/anonymisation endpoints for interviews and candidates.
- Preserve non-identifying audit facts where needed.
- Log deletion action without retaining full deleted content.

Status after upgrades: partially implemented with protected interview
anonymisation. Still needs admin UX, scheduled retention and a reviewed legal
policy for when to retain minimal audit facts.

### P1-PRIV-002: Full email bodies are stored and returned by workflow detail

Risk: Long-term retention of unnecessary personal data, accidental exposure to
future multi-user accounts.

Fix:

- Store `body_excerpt` by default for routine UI.
- Encrypt or redact full `body_plain`.
- Add explicit reveal permission for full content.
- Add retention setting for message body expiry.

Status after upgrades: partially implemented with a bulk message-body redaction
endpoint. Workflow detail still returns `body_plain` for authorised users until
UI permissions are refined.

### P1-PRIV-003: No retention policy

Risk: Personal data and full email content can remain forever.

Fix:

- Add configurable retention, for example:
  - active workflows: retain full content
  - completed workflows: reduce to summary after 180 days
  - cancelled/stale workflows: review/delete after 90 days
- Add scheduled retention job.

### P1-PRIV-004: OpenAI data sharing policy not yet implemented

Risk: When OpenAI is added, email content may be sent to a third party without
clear controls.

Fix:

- Document what fields are sent to OpenAI.
- Send minimal message snippets, not entire threads by default.
- Add DPA/subprocessor notes to privacy docs.
- Store model request metadata and avoid logging raw prompts.

### P1-PRIV-005: Public availability page exposes contextual data to token holder

Risk: Anyone with token can see candidate/client/job context until expiry.

Fix:

- Keep tokens short-lived.
- Add revoke action.
- Consider showing only the minimum needed context.
- Rate-limit invalid token access.

## Data Minimisation Recommendations

- Make mobile and current location optional and clearly labelled.
- Do not store salary, health, diversity, legal or assessment notes in this app.
- Add UI warnings around notes fields.
- Keep candidate preparation notes separate from calendar invites.
- Avoid sending internal recruiter instructions to AI providers.

## Verdict

The app has the right privacy intent and now has basic redaction/anonymisation
controls. It still needs scheduled retention, role-aware UI access, rate limits,
audit-safe logging and clear third-party processing boundaries before live
production use.
