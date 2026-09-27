# Testing

## Testing Goal

Interview scheduling is detail-heavy. The test suite must cover the unglamorous
things: timezones, duplicate replies, reschedules, unclear availability,
calendar conflicts and approval rules.

## Test Types

### Backend Unit Tests

Cover:

- state transitions
- missing information detection
- availability parsing validation
- deterministic overlap matching
- working-hours filtering
- timezone conversion
- British Summer Time
- reminder schedule generation
- chase limits
- message approval rules
- CRM summary generation

### Integration Tests

Cover:

- database writes
- email provider interface with mock provider
- calendar provider interface with mock provider
- AI provider interface with rule-based or mocked output
- idempotent webhook handling
- idempotent calendar event update
- duplicate reply handling

### Frontend Tests

Cover:

- login gate
- dashboard sections
- new interview form validation
- start coordination
- workflow detail page
- approval card buttons
- manual CRM summary copy view
- activity log visibility

### End-To-End Tests

Cover the main recruiter journey:

1. Log in.
2. Create a new interview.
3. Start coordination.
4. Receive mocked client availability.
5. Receive mocked candidate availability.
6. Generate recommended slots.
7. Approve one slot.
8. Create mocked calendar event.
9. Send mocked confirmations.
10. Schedule reminders.

## Required Scenarios

### Basic Overlap

Client:

```txt
Tuesday after 2 or Wednesday morning.
```

Candidate:

```txt
Tuesday works any time after 3.
```

Expected:

```txt
Tuesday after 15:00
```

### No Overlap

Expected:

- no slot is proposed
- workflow requests more availability or escalates
- no confirmation is sent
- no calendar event is created

### Ambiguous Reply

Example:

```txt
Could maybe do later next week.
```

Expected:

- low confidence
- clarification or recruiter review
- no guessed slot

### British Summer Time

Expected:

- Europe/London offset is correct for the chosen date
- internal UTC storage is correct
- displayed local time is correct

### International Timezones

Expected:

- participant local times show explicitly
- UTC conversion is correct
- working-hour filters respect configured participant rules

### Multi-Attendee Interview

Expected:

- all required interviewer availability is considered where calendar permission
  exists
- optional attendees do not block the slot unless configured

### Changed Availability

Expected:

- old availability is preserved
- latest availability is preferred
- audit history shows the change

### Duplicate Reply

Expected:

- provider message ID is deduplicated
- no duplicate availability windows
- no duplicate chases or calendar events

### Reschedule

Expected:

- workflow moves to `RESCHEDULE_REQUESTED`
- reminders pause
- existing calendar event is preserved
- new slot requires approval
- existing event is updated after approval

### Cancellation

Expected:

- workflow moves to `CANCELLATION_REQUESTED`
- approval card is created
- event is cancelled only after approval
- reminders are cancelled
- reason is logged

### Deleted Calendar Event

Expected:

- provider event lookup detects missing event
- workflow flags error or review state
- recruiter sees clear action needed

### API Outage

Expected:

- retry where safe
- no duplicate send
- visible failure
- manual fallback action

### OAuth Expiry

Expected:

- connection marked needs reconnect
- affected workflows show blocked action
- no silent failure

## Quality Gates

Before phase 1 handback:

- backend tests pass
- frontend tests pass where implemented
- linting passes
- formatting passes
- type checks pass
- manual smoke test proves the main mocked workflow

