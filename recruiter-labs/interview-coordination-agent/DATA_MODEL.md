# Data Model

## Data Principles

- Use PostgreSQL as the source of truth.
- Use UUID primary keys.
- Store all event times internally as UTC `timestamptz`.
- Store participant timezones as IANA timezone names.
- Preserve original availability text alongside structured interpretation.
- Keep audit records append-only.
- Encrypt sensitive provider tokens and message bodies where stored.
- Do not store unnecessary special-category data.

## Core Tables

### users

Internal recruiters and future admin users.

Important fields:

- `id`
- `email`
- `display_name`
- `role`
- `auth_provider`
- `status`
- `timezone`
- `created_at`
- `updated_at`

Initial roles:

- `owner`
- `recruiter`
- `admin`
- `read_only`

### companies

Client companies.

Important fields:

- `id`
- `name`
- `website`
- `notes`
- `created_at`
- `updated_at`

### client_contacts

Client contacts and interviewers.

Important fields:

- `id`
- `company_id`
- `full_name`
- `email`
- `timezone`
- `phone`
- `created_at`
- `updated_at`

### candidates

Candidate contact details entered manually for interview coordination.

Important fields:

- `id`
- `full_name`
- `email`
- `mobile`
- `timezone`
- `current_location`
- `created_at`
- `updated_at`
- `deleted_at`

### jobs

Role context for the interview.

Important fields:

- `id`
- `company_id`
- `title`
- `company_display_name`
- `notes`
- `created_at`
- `updated_at`

### interviews

Main workflow record.

Important fields:

- `id`
- `candidate_id`
- `client_contact_id`
- `company_id`
- `job_id`
- `owner_user_id`
- `stage`
- `duration_minutes`
- `format`
- `office_location`
- `preferred_date_range_start`
- `preferred_date_range_end`
- `candidate_preparation_notes`
- `recruiter_instructions`
- `state`
- `state_reason`
- `approval_required`
- `approved_slot_start_at`
- `approved_slot_end_at`
- `approved_slot_timezone`
- `scheduled_start_at`
- `scheduled_end_at`
- `created_at`
- `updated_at`
- `completed_at`
- `cancelled_at`

Allowed states:

- `DRAFT`
- `STARTED`
- `AWAITING_CLIENT_AVAILABILITY`
- `AWAITING_CANDIDATE_AVAILABILITY`
- `AWAITING_BOTH`
- `MATCHING_AVAILABILITY`
- `AWAITING_RECRUITER_APPROVAL`
- `APPROVED`
- `SCHEDULED`
- `REMINDER_PENDING`
- `RESCHEDULE_REQUESTED`
- `CANCELLATION_REQUESTED`
- `COMPLETED`
- `FEEDBACK_PENDING`
- `CANCELLED`
- `ESCALATED`
- `ERROR`

### interview_participants

All participants attached to an interview.

Important fields:

- `id`
- `interview_id`
- `participant_type`
- `person_id`
- `name`
- `email`
- `timezone`
- `calendar_required`
- `response_required`
- `created_at`

Participant types:

- `candidate`
- `client_contact`
- `interviewer`
- `recruiter`
- `other`

### availability_windows

Structured availability extracted from emails or manually entered.

Important fields:

- `id`
- `interview_id`
- `participant_id`
- `source_message_id`
- `source`
- `date`
- `start_at`
- `end_at`
- `timezone`
- `original_text`
- `interpretation`
- `confidence`
- `requires_clarification`
- `superseded_at`
- `created_at`

Sources:

- `manual`
- `email`
- `calendar`
- `phone_note`
- `availability_link`

Only rows where `superseded_at` is null should be used for matching. Old
availability must be preserved for audit history but excluded from slot
generation once the same participant provides a newer availability set.

### messages

Inbound and outbound message records.

Important fields:

- `id`
- `interview_id`
- `email_thread_id`
- `direction`
- `channel`
- `sender_email`
- `recipient_emails`
- `subject`
- `body_plain_ciphertext`
- `body_excerpt`
- `provider_message_id`
- `provider_thread_id`
- `workflow_public_id`
- `intent`
- `intent_confidence`
- `status`
- `requires_approval`
- `approved_by_user_id`
- `approved_at`
- `sent_at`
- `received_at`
- `created_at`

The body can be encrypted or retained only as a short excerpt depending on the
retention setting.

### email_threads

Provider thread mapping.

Important fields:

- `id`
- `interview_id`
- `provider`
- `provider_thread_id`
- `workflow_public_id`
- `participants_hash`
- `started_at`
- `last_message_at`
- `status`

Never rely solely on subject lines. Matching should use provider thread IDs,
message IDs, sender address, participants, timestamps and workflow IDs.

### calendar_events

Calendar event tracking and idempotency.

Important fields:

- `id`
- `interview_id`
- `provider`
- `provider_calendar_id`
- `provider_event_id`
- `provider_event_etag`
- `meeting_url`
- `location`
- `title`
- `description`
- `start_at`
- `end_at`
- `timezone`
- `status`
- `created_by_user_id`
- `created_at`
- `updated_at`
- `cancelled_at`

### workflow_operations

Idempotency and safety records for external side effects.

Important fields:

- `id`
- `interview_id`
- `operation_key`
- `operation_type`
- `status`
- `provider`
- `provider_reference`
- `request_payload`
- `error`
- `started_at`
- `completed_at`

Examples:

- `approve_slot`
- future `reschedule_event`
- future `cancel_event`
- future `send_message`

`operation_key` must be unique. Calendar/email side effects should use these
records to avoid duplicate sends or duplicate meetings.

Statuses:

- `draft`
- `approved`
- `created`
- `updated`
- `cancelled`
- `deleted_external`
- `failed`

### reminders

Reminder schedule and delivery records.

Important fields:

- `id`
- `interview_id`
- `participant_id`
- `reminder_type`
- `scheduled_for`
- `channel`
- `status`
- `provider_message_id`
- `paused_at`
- `sent_at`
- `failed_at`
- `created_at`

### workflow_events

Domain events that drive the state machine.

Important fields:

- `id`
- `interview_id`
- `event_type`
- `from_state`
- `to_state`
- `actor_type`
- `actor_id`
- `metadata`
- `created_at`

### audit_logs

Append-only operational audit records.

Important fields:

- `id`
- `actor_type`
- `actor_id`
- `action`
- `entity_type`
- `entity_id`
- `summary`
- `metadata`
- `ip_address_hash`
- `user_agent_hash`
- `created_at`

### settings

Organisation and user settings.

Important fields:

- `id`
- `scope`
- `scope_id`
- `key`
- `value`
- `created_at`
- `updated_at`

Key settings:

- `auto_send_routine_messages`
- `require_approval_for_all_messages`
- `availability_confidence_threshold`
- `working_hours_start`
- `working_hours_end`
- `working_days`
- `default_interview_start`
- `default_interview_end`
- `candidate_reminder_24h_enabled`
- `candidate_reminder_2h_enabled`
- `recruiter_morning_reminder_enabled`
- `client_reminder_enabled`
- `max_automated_chases`
- `candidate_chase_after_hours`
- `client_chase_after_hours`

### integration_connections

OAuth and provider connection records.

Important fields:

- `id`
- `user_id`
- `provider_type`
- `provider_name`
- `account_email`
- `scopes`
- `access_token_ciphertext`
- `refresh_token_ciphertext`
- `expires_at`
- `status`
- `last_error`

### oauth_states

Short-lived one-time OAuth state records.

Important fields:

- `id`
- `provider_name`
- `state_hash`
- `user_email`
- `expires_at`
- `used_at`
- `created_at`

Raw OAuth state values must never be stored. Store only a keyed hash and reject
missing, expired, reused or unknown callback states.
- `created_at`
- `updated_at`

Provider types:

- `email`
- `calendar`
- `ai`
- `crm`

## CRMConnector Tables

No CRM table should require Loxo identifiers in version 1.

Optional manual CRM output can be stored as:

### crm_exports

Important fields:

- `id`
- `interview_id`
- `connector_name`
- `summary_text`
- `note_text`
- `copied_at`
- `downloaded_at`
- `created_at`

For version 1, `connector_name` must be:

```txt
manual
```

## Indexes

Recommended indexes:

- `interviews(state, updated_at desc)`
- `interviews(owner_user_id, scheduled_start_at desc)`
- `interviews(candidate_id, created_at desc)`
- `interviews(company_id, created_at desc)`
- `messages(interview_id, created_at desc)`
- `messages(provider_message_id)`
- `email_threads(provider, provider_thread_id)`
- `availability_windows(interview_id, participant_id)`
- `calendar_events(interview_id, provider_event_id)`
- `reminders(status, scheduled_for)`
- `workflow_events(interview_id, created_at)`
- `audit_logs(entity_type, entity_id, created_at)`
