# Message Style Tests

Date: 2026-08-18

Purpose: regression checks for candidate/client messages so the product keeps a
human UK recruiter tone and does not drift into ATS waffle.

## Style Rules

Messages should be:

- concise
- warm
- commercially aware
- plain British English
- natural enough to read like David sending it between calls
- low-pressure

Messages should avoid:

- "Dear Candidate"
- "Kindly"
- "Your interview has successfully been scheduled"
- "Please select your preferred availability slot"
- "Book a discovery call"
- HR/corporate filler
- forced jokes

## Regression Examples

### Candidate Availability Request

Expected:

```text
Hi Sarah,

Good news - they would like to meet you.

Can you send me a couple of times that work over the next few days and I will
get everything coordinated?

Cheers,
David
```

Fail if:

- It sounds automated.
- It asks the candidate to connect their calendar.
- It uses "Dear" or "kindly".

### Client Availability Request

Expected:

```text
Hi Greg,

Great, thanks.

Can you send me a couple of windows that work for you/the team over the next few
days and I will coordinate everything with Sarah?

Cheers,
David
```

Fail if:

- It over-explains the system.
- It sounds like a ticketing workflow.

### Candidate Confirmation

Expected:

```text
All sorted.

You are booked in with WPP for Wednesday at 2pm.

You will be meeting Greg Smith.

I have sent the calendar invite over as well.

I will give you a shout beforehand, but if anything changes just let me know.

Cheers,
David
```

Fail if:

- It says "successfully scheduled".
- It hides the time or company.
- It forgets the calendar invite status.

### Client Confirmation

Expected:

```text
All confirmed.

Sarah is booked in for Wednesday at 2pm.

Calendar invite has gone across to everyone.

Give me a shout if anything changes.

Cheers,
David
```

Fail if:

- It sends different details to candidate and client.
- It includes internal recruiter notes.

### Clarification Request

Expected:

```text
Hi Sarah,

Thanks for that.

Could you send me the exact day and rough time window? I do not want to guess and
end up putting the wrong thing in the diary.

Cheers,
David
```

Fail if:

- It guesses ambiguous availability.
- It blames the candidate.

## Automated Test Recommendation

Add snapshot-style tests around `backend/app/services/messages.py` for:

- candidate availability request
- client availability request
- known client windows included in candidate request
- candidate confirmation with/without real calendar invite
- client confirmation
- clarification
- chase messages once implemented
- reschedule/cancellation messages once implemented
