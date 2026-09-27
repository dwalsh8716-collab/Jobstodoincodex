# Integrations

## Integration Philosophy

The core product must run without live integrations in phase 1.

Provider integrations sit behind interfaces so the workflow, scheduling logic,
UI and tests do not depend on Gmail, Microsoft, Google Calendar, Outlook
Calendar, OpenAI or a CRM being live.

## Interfaces

### EmailProvider

Responsibilities:

- send email
- create draft preview
- list new replies
- process webhook events
- fetch message metadata
- fetch message content where allowed
- expose provider thread IDs and message IDs

Required methods:

```txt
send_message(message)
create_draft(message)
list_recent_replies(since)
get_message(provider_message_id)
normalise_webhook_event(event)
```

Phase 1 implementation:

```txt
MockEmailProvider
```

Phase 1.5 test implementation:

```txt
SMTPEmailProvider
GmailEmailProvider
```

SMTP is for controlled local testing only. It sends real email if configured,
but it does not provide inbox monitoring, OAuth refresh handling or provider
webhooks.

GmailEmailProvider uses Google OAuth, `gmail.send`, `gmail.readonly`, encrypted
token storage and manual reply sync from the recruiter dashboard.

`gmail.readonly` is requested only when `ENABLE_GMAIL_REPLY_SYNC=true`.

Later implementation:

```txt
GraphEmailProvider
```

### CalendarProvider

Responsibilities:

- check calendar conflicts
- create calendar event
- update existing calendar event
- cancel calendar event
- create meeting links where provider supports it
- detect deleted external events

Required methods:

```txt
list_busy_windows(calendar_ids, start, end)
create_event(event)
update_event(provider_event_id, event)
cancel_event(provider_event_id, reason)
get_event(provider_event_id)
```

Phase 1 implementation:

```txt
MockCalendarProvider
```

Phase 1.5 implementation:

```txt
GoogleCalendarProvider
```

GoogleCalendarProvider creates Google Calendar events and Google Meet links
after recruiter slot approval. Candidate and client calendars are not accessed.

`calendar.freebusy` is requested only when
`CHECK_RECRUITER_CALENDAR_CONFLICTS=true`.

Later implementation:

```txt
OutlookCalendarProvider
```

### AIProvider

Responsibilities:

- classify message intent
- extract availability
- detect ambiguity
- draft replies
- summarise long threads

Required methods:

```txt
classify_intent(message_context)
extract_availability(message_context)
draft_message(message_brief)
summarise_thread(thread_context)
```

Phase 1 can start with:

```txt
RuleBasedAIProvider
```

Then add:

```txt
OpenAIResponsesProvider
```

The OpenAI implementation must use the Responses API and structured outputs.
Every result must be schema-validated before use.

### CRMConnector

Responsibilities:

- provide interview source details
- produce CRM-ready summaries
- optionally write back confirmed interview activity in future

Version 1 implementation:

```txt
ManualCRMConnector
```

ManualCRMConnector behaviour:

- recruiter manually enters candidate, client and role details
- workflow operates independently
- final confirmed interview summary is generated for copying into Loxo
- no CRM credentials are required
- no Loxo API calls exist

Future connector names:

```txt
LoxoConnector
BullhornConnector
VincereConnector
RecruitCRMConnector
```

Do not implement future connectors in the MVP.

## Email Integration

Required providers in later phases:

- Gmail API
- Microsoft Graph Mail

Matching signals:

- provider message ID
- provider thread ID
- `X-ER-Workflow-ID` custom header where possible
- workflow-specific reply alias where possible
- sender address
- known participant list
- timestamps
- interview state

Subject lines are not reliable enough on their own.

Recommended outbound headers:

```txt
X-ER-Workflow-ID: <workflow_public_id>
X-ER-Interview-ID: <interview_uuid>
```

If using an alias:

```txt
interviews+<workflow_public_id>@essentialresourcing.co.uk
```

## Calendar Integration

Required providers in later phases:

- Google Calendar API
- Microsoft Outlook Calendar through Graph

Calendar rules:

- recruiter connects their own calendar
- recruiter calendar conflict checks are optional and off by default
- interviewer calendars are not required in Version 1
- candidate calendars are not required or connected
- client calendars are not required or connected
- candidate/client availability is collected by email reply or private
  availability link
- all calendar event writes require idempotency
- reschedules update existing events
- Google events are created as transparent/free by default so the organiser's
  diary is not blocked when the recruiter is not attending
- deleted external events move the workflow into a visible failure or review
  state

Virtual meeting support:

- Microsoft Teams for Outlook/Graph where available
- Google Meet for Google Calendar where available
- Zoom only if a later Zoom integration is explicitly added

## OpenAI Integration

Use the OpenAI Responses API.

Use structured outputs for:

- intent classification
- availability extraction
- ambiguity detection

Do not repeatedly send whole email threads. Use:

- latest reply
- small workflow context
- participant role
- previous parsed availability summary
- current date and timezone

Store:

- model
- request purpose
- token usage
- estimated cost
- confidence
- schema validation result

Do not store unnecessary full prompts unless explicitly approved.

## Cost Control

Default rules:

- try deterministic parsing for simple cases first
- call AI only when language understanding is actually needed
- cache parsed messages
- never reparse the same provider message unless the parser version changes
- track AI cost per interview
- track estimated admin minutes saved

Metrics:

- AI requests
- input tokens
- output tokens
- estimated cost
- cost per scheduled interview
- manual interventions avoided

## Integration Failures

Never silently fail.

Every provider failure must show:

- what happened
- what failed
- who is affected
- whether any messages or calendar events were sent
- what action the recruiter needs to take

Common failure cases:

- expired OAuth
- revoked OAuth scopes
- email send failure
- calendar API failure
- OpenAI failure
- webhook duplicate
- provider timeout
- provider rate limit
- deleted calendar event
- invalid recipient email
- reply from unexpected email
