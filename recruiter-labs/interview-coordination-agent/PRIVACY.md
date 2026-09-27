# Privacy

## UK GDPR Position

This app processes personal data for interview coordination in a recruitment
context. It should be designed around data minimisation, purpose limitation,
security, accuracy, retention and auditability.

This document is implementation guidance, not legal advice.

## Purpose

Permitted purpose:

- coordinating interviews
- tracking scheduling activity
- sending logistics messages
- creating calendar events
- sending reminders
- requesting interview feedback where approved

Not permitted:

- automated candidate assessment
- hidden candidate scoring
- marketing messages
- special-category data storage unless explicitly required and approved
- unnecessary long-term storage of email content

## Data Minimisation

Store only what is needed to schedule and track the interview:

- candidate name
- candidate email
- optional mobile
- timezone
- current location where useful
- client contact details
- role and company
- interview stage
- availability windows
- message metadata
- calendar event metadata
- audit history

Avoid storing:

- full CV content
- sensitive interview feedback in calendar bodies
- salary negotiation details in calendar bodies
- unnecessary private client notes
- protected-characteristic information
- raw WhatsApp message bodies unless explicitly approved

## Message Storage

Recommended default:

- store provider metadata
- store short safe excerpt
- encrypt full body only where operationally necessary
- apply retention rules

Availability records may store the original availability sentence because it is
needed to explain the interpretation.

## Retention

Suggested defaults:

- active workflow data: retained while interview is active
- completed workflow core record: 24 months
- message bodies: 12 months or shorter if not needed
- provider token audit records: while connected plus audit period
- deleted candidate records: remove personal fields and preserve non-personal
  audit facts where legally appropriate

Retention must be configurable.

## Deletion

The app should support:

- deleting candidate contact details
- deleting stored message bodies
- revoking OAuth connections
- removing calendar integration tokens
- retaining minimal audit records without unnecessary personal data

## Access Control

Only authorised internal users should access interview workflows.

Read-only users should not be able to:

- send messages
- approve slots
- cancel interviews
- reschedule interviews
- view secrets
- delete records

## AI Data Use

Before real AI processing:

- provider must be approved
- terms and data use must be reviewed
- prompts must be data-minimised
- outputs must be stored only where needed
- AI use must be logged

Do not send whole email threads to AI unless needed and approved.

## Calendar Privacy

Calendar events should include logistics only:

- participant names
- role title
- company
- stage
- format
- link/location
- recruiter contact details

Do not include:

- CV notes
- candidate assessment
- salary negotiation
- private client commentary
- personal circumstances unless operationally necessary and approved

