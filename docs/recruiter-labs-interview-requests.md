# Recruiter Labs Interview Requests

## Status

Private workflow foundation.

This is staged behind:

```txt
FEATURE_INTERVIEW_REQUEST_WORKFLOW=false
FEATURE_CLIENT_SHORTLIST_PORTAL=false
FEATURE_CLIENT_PRESENTATION_PORTAL=false
FEATURE_SHORTLIST_FEEDBACK_TRACKING=false
```

It is not public. It does not contact candidates automatically. It does not
book calendar events automatically.

This is technical implementation guidance, not legal advice.

## Audit

Already existed:

- client shortlist candidate cards
- feedback action `request_interview`
- private feedback API
- Postgres insert into `recruiter_lab_interview_requests`
- admin task creation
- candidate shortlist status update to `interview_requested`
- audit log for private feedback
- no marketing analytics on the private portal feedback route

Gaps filled in this pass:

- optional preferred times
- optional client notes for David
- clearer portal copy that an interview is requested, not booked
- richer interview request fields
- interview request activity table
- private workflow documentation
- tests for the request model, copy and no-auto-contact boundary

## Client Portal UX

The candidate card shows:

```txt
Request interview
```

Clicking it opens a short panel. The client can add:

- preferred format
- preferred times
- notes for David

Confirmation copy:

```txt
Thanks - David has the request and will coordinate the next step.
```

The copy deliberately avoids promising that the interview is booked.

## Workflow

1. Client reviews candidate profile.
2. Client clicks `Request interview`.
3. Client can add preferred times and notes.
4. Request writes to private Postgres.
5. Feedback status becomes `interview_requested`.
6. An admin task is created for David.
7. Interview request activity records the portal request.
8. David reviews the request.
9. David approves or rejects candidate contact.
10. Scheduling workflow can start later.

Candidate contact stays blocked until David approves it.

## Database Model

Migration:

```txt
database/migrations/029_recruiter_labs_interview_request_workflow.sql
```

Adds fields to `recruiter_lab_interview_requests`:

- `shortlist_id`
- `candidate_id`
- `application_id`
- `client_company_id`
- `client_contact_id`
- `requested_by`
- `request_source`
- `status`
- `interview_type`
- `location_preference`
- `preferred_times`
- `client_notes`
- `candidate_contact_approved_by`
- `candidate_contact_approved_by_label`
- `candidate_contact_approved_at`
- `candidate_contact_rejected_at`
- `closed_reason`
- `created_at`
- `updated_at`

Supported status values:

- `requested`
- `david_reviewing`
- `candidate_contact_approved`
- `candidate_contacted`
- `awaiting_candidate_availability`
- `awaiting_client_availability`
- `scheduling`
- `scheduled`
- `completed`
- `cancelled`
- `declined`
- `closed`

Legacy `reviewing` remains allowed so existing staged data does not break.

Adds:

```txt
recruiter_lab_interview_request_activity
```

Activity types include:

- `created_from_client_portal`
- `admin_review_started`
- `candidate_contact_approved`
- `candidate_contact_rejected`
- `client_more_info_requested`
- `candidate_contacted`
- `status_updated`
- `closed`

## Admin Workflow

David should be able to:

- see new interview requests in private admin tasks
- see candidate, shortlist, client and source context
- read preferred times and client notes
- approve candidate contact
- reject or close the request
- ask the client for more information
- contact the candidate manually
- trigger WhatsApp/email availability later only when enabled and approved
- prepare Google Calendar details later only when approved
- update status
- review activity history

## Notification Status

Current state:

- admin task is created in private Postgres when the request is saved
- no candidate notification is sent
- no client confirmation email is sent from this pass
- portal UI gives the client an on-page confirmation
- WhatsApp/email/Google scheduling stays separate and gated

Future notification work must:

- notify David first
- never contact the candidate before approval
- use approved templates only
- avoid sensitive client notes
- write audit/activity records

## Security And Privacy

- no public route added
- no sitemap exposure
- no raw token is stored
- invalid or unscoped candidate requests are rejected
- request data writes only after portal, feedback and database gates pass
- private comments are not echoed in API responses
- candidate contact is not automatic
- calendar booking is not automatic
- WhatsApp sends are not automatic
- private portal feedback does not use GA4/GTM

## Testing Checklist

Before private beta:

- valid private token can submit `request_interview`
- invalid token cannot submit
- candidate outside the shortlist cannot submit
- optional notes and preferred times save privately
- admin task is created
- activity record is created
- candidate status becomes `interview_requested`
- candidate is not contacted automatically
- scheduling remains blocked until David approval
- audit log is written
- no token, note or candidate ID is echoed in API errors
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Blockers

Still required before live client use:

- Railway Postgres live and migrated
- private portal launch gate approved
- candidate sharing consent wording reviewed
- David approval workflow in admin UI
- email notification rules
- secure availability links
- WhatsApp templates
- Google Calendar/Meet approval
- legal/privacy review

## Final Engineering View

Client can request interviews instantly.

David controls the process.

Fast, structured, safe.

No faff.
