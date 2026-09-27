# Workflow

## State Machine

All workflow movement must happen through a deterministic state machine.

Allowed states:

```txt
DRAFT
STARTED
AWAITING_CLIENT_AVAILABILITY
AWAITING_CANDIDATE_AVAILABILITY
AWAITING_BOTH
MATCHING_AVAILABILITY
AWAITING_RECRUITER_APPROVAL
APPROVED
SCHEDULED
REMINDER_PENDING
RESCHEDULE_REQUESTED
CANCELLATION_REQUESTED
COMPLETED
FEEDBACK_PENDING
CANCELLED
ESCALATED
ERROR
```

Every transition writes a `workflow_events` record and an `audit_logs` record
where the transition involves human approval, external messages, calendar
changes, failures or sensitive data.

## Start Coordination

When the recruiter clicks `Start Coordination`:

1. Validate required candidate, client, role and interview fields.
2. Create or reuse candidate, client contact, company and job records.
3. Create the interview workflow record.
4. Create participants.
5. Store any known candidate or client availability.
6. Determine missing information.
7. Create message previews for missing availability.
8. Apply message settings.
9. Send routine availability requests if allowed.
10. Move the workflow to the correct waiting state.

State decision:

- client missing and candidate missing: `AWAITING_BOTH`
- client missing only: `AWAITING_CLIENT_AVAILABILITY`
- candidate missing only: `AWAITING_CANDIDATE_AVAILABILITY`
- both present: `MATCHING_AVAILABILITY`

## Automation Boundary

The app should automate interview admin after the recruiter enters details once:

- send routine availability requests
- sync Gmail replies when enabled
- parse availability
- calculate overlap
- prepare approval options
- send confirmations after approval
- create/update/cancel the Google Calendar event after approval
- send reminders and limited chases

The app must not automate:

- final booking without recruiter approval
- cancellation without recruiter approval
- non-routine rescheduling without recruiter approval
- candidate/client calendar connection
- candidate assessment or commercial decisions

## Availability Requests

### Client Email

Default draft:

```txt
Hi Greg,

Great, thanks.

Can you send me a couple of windows that work for you/the team over the next few
days and I'll coordinate everything with Sarah?

Cheers,
David
```

### Candidate Email

Default draft:

```txt
Hi Sarah,

Good news - they'd like to meet you.

Can you send me a couple of times that work over the next few days and I'll get
everything coordinated?

Cheers,
David
```

If client availability is already known:

```txt
Hi Sarah,

Good news - they'd like to meet you.

They can currently do:

Tuesday 2-5pm
Wednesday morning
Thursday after 3pm

Do any of those work for you?

Cheers,
David
```

## Email Reply Handling

Replies must be matched using multiple signals:

- provider message ID
- provider thread ID
- workflow public ID in custom header or reply alias
- sender address
- known participants
- timestamps
- interview state

Subject lines are a weak signal only.

Duplicate webhook or poll events must be deduplicated by provider message ID and
idempotency keys.

## Natural-Language Availability

AI may classify and extract availability, for example:

```json
{
  "intent": "availability_response",
  "confidence": 0.96,
  "availability": [
    {
      "date": "2026-08-20",
      "start": "14:00",
      "end": "17:00",
      "timezone": "Europe/London"
    }
  ],
  "requires_clarification": false
}
```

The workflow must then validate:

- schema shape
- date exists
- timezone is known
- start is before end
- window is long enough for the interview
- relative date was resolved from the message timestamp and participant timezone
- confidence meets the configured threshold

If confidence is below threshold, do not guess.

Default responses:

- ask a natural clarification if the issue is minor
- escalate to recruiter if the message is unusual, contradictory or sensitive

## Matching

Once required availability exists:

1. Convert all windows to UTC.
2. Apply participant timezones.
3. Apply working days.
4. Apply scheduling hours.
5. Apply meeting duration.
6. Apply buffer rules.
7. Check known clashes for required interview attendees inside this app.
8. Optionally check the recruiter's own Google Calendar only when
   `CHECK_RECRUITER_CALENDAR_CONFLICTS=true`.
9. Calculate overlapping slots.
10. Rank the top 3.

Candidate and client calendars are not connected in Version 1. They provide
availability by reply or private availability link. The app then creates the
final calendar invite after recruiter approval.

Ranking priority:

1. earliest workable interview
2. candidate and client stated preferences
3. minimal waiting time
4. known required-attendee clashes already tracked inside the app
5. optional recruiter calendar availability only if the recruiter is attending
6. working hours

Example approval output:

```txt
Candidate: Sarah Jones
Client: Greg Smith
Role: PPC Account Director
Stage: First Interview

Recommended:
Wednesday 14:00-14:45 Europe/London

Alternatives:
Thursday 10:00-10:45 Europe/London
Thursday 15:30-16:15 Europe/London
```

If no overlap exists, move to `ESCALATED` or create a `REQUEST_MORE_AVAILABILITY`
approval task.

## Recruiter Approval

The app must not automatically confirm the interview after matching.

It creates an approval card with:

- Approve
- Select Alternative
- Change Time
- Request More Availability
- Cancel Workflow

After `Approve`, move to `APPROVED` and create the calendar event job.

## Interview Creation

Once approved:

1. Build the calendar event.
2. Create or update the event idempotently.
3. Generate virtual meeting link where the provider supports it.
4. Send candidate confirmation.
5. Send client and interviewer confirmations.
6. Schedule reminders.
7. Move to `SCHEDULED`.

Event title:

```txt
Sarah Jones - PPC Account Director - WPP
```

Calendar body includes:

- interview stage
- interviewer names
- format
- meeting link or location
- recruiter contact details

Calendar body must not include sensitive notes, salary negotiation or private
candidate assessment.

## Confirmation Emails

Candidate:

```txt
All sorted.

You're booked in with WPP for Wednesday at 2pm.

You'll be meeting Greg Smith.

I've sent the calendar invite over as well.

I'll give you a shout beforehand, but if anything changes just let me know.

Cheers,
David
```

Client:

```txt
All confirmed.

Sarah is booked in for Wednesday at 2pm.

Calendar invite has gone across to everyone.

Give me a shout if anything changes.

Cheers,
David
```

## Reminders

Defaults:

- candidate: 24 hours before
- recruiter: morning of interview
- candidate optional: 2 hours before
- client optional: off by default

Reminders pause during reschedule and cancellation states.

## Rescheduling

Detect likely reschedule intent:

- "Can we move this?"
- "Something has come up."
- "Can Sarah do Friday instead?"
- "Sorry, I need to reschedule."

When detected:

1. Move to `RESCHEDULE_REQUESTED`.
2. Notify recruiter.
3. Pause reminders.
4. Preserve the existing calendar event.
5. Collect new availability.
6. Calculate new slot options.
7. Request recruiter approval.
8. Modify the existing event after approval.
9. Notify all parties.
10. Log full history.

Never create a duplicate interview for a reschedule. Use the existing
`calendar_events` row and provider event ID.

## Cancellation

Detect clear cancellation intent, but do not automatically cancel unless a
future explicit setting allows it.

Cancellation approval card shows:

- candidate
- role
- who requested cancellation
- reason
- current interview time

Buttons:

- Confirm Cancellation
- Reschedule Instead
- Ignore / Review

After approval:

1. Cancel or update the calendar event.
2. Notify attendees.
3. Cancel reminders.
4. Move to `CANCELLED`.
5. Log reason and actor.

## Post-Interview

After the interview end time:

1. Move to `COMPLETED`.
2. Notify recruiter.
3. Ask whether feedback should be requested.

Notification:

```txt
Interview completed:

Sarah Jones
PPC Account Director
WPP

Would you like me to request feedback?
```

Buttons:

- Client Feedback
- Candidate Feedback
- Both
- Not Yet

## Feedback Requests

Client:

```txt
Hi Greg,

Hope the conversation with Sarah went well.

When you get a chance, let me know your initial thoughts and I'll catch up with
her too.

Cheers,
David
```

Candidate:

```txt
Hi Sarah,

How did you get on?

Give me a shout when you're free and we can have a quick debrief.

Cheers,
David
```

## Chasing

Default maximum automated chases:

```txt
2
```

Candidate chase after 24 hours:

```txt
Hi Sarah,

Just giving this a quick nudge in case it got buried.

They're keen to get something arranged, so send me a couple of times when you
get a chance and I'll sort it.

Cheers,
David
```

After the configured maximum chases, notify the recruiter and stop chasing.
