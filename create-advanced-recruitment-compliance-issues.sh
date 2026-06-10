#!/usr/bin/env bash

set -euo pipefail

REPO="dwalsh8716-collab/Jobstodoincodex"

echo "Checking GitHub CLI authentication..."
gh auth status

echo "Creating labels if needed..."

gh label create "priority: critical" \
  --repo "$REPO" \
  --color "B60205" \
  --description "Critical production build requirement" 2>/dev/null || true

gh label create "whatsapp-business" \
  --repo "$REPO" \
  --color "25D366" \
  --description "WhatsApp Business integration and candidate communication" 2>/dev/null || true

gh label create "gdpr" \
  --repo "$REPO" \
  --color "D93F0B" \
  --description "Privacy, consent, retention and GDPR-related requirements" 2>/dev/null || true

gh label create "dsar" \
  --repo "$REPO" \
  --color "5319E7" \
  --description "Data Subject Access Request workflows" 2>/dev/null || true

gh label create "audit-logging" \
  --repo "$REPO" \
  --color "1D76DB" \
  --description "Compliance audit logs and sensitive data access tracking" 2>/dev/null || true

gh label create "security" \
  --repo "$REPO" \
  --color "FBCA04" \
  --description "Security, privacy, authentication and sensitive data handling" 2>/dev/null || true

gh label create "database" \
  --repo "$REPO" \
  --color "0E8A16" \
  --description "Postgres database, migrations and data modelling" 2>/dev/null || true

gh label create "audit-first" \
  --repo "$REPO" \
  --color "C5DEF5" \
  --description "Inspect current implementation before changing anything" 2>/dev/null || true

create_issue_if_missing() {
  local title="$1"
  local labels="$2"
  local body="$3"

  if gh issue list --repo "$REPO" --state all --search "$title in:title" --json title --jq '.[].title' | grep -Fxq "$title"; then
    echo "Issue already exists: $title"
  else
    echo "Creating issue: $title"
    printf "%s" "$body" | gh issue create \
      --repo "$REPO" \
      --title "$title" \
      --label "$labels" \
      --body-file -
  fi
}

BODY_WHATSAPP=$(cat <<'EOF'
# Native WhatsApp Business Cloud API Integration

## Critical Context

Essential Resourcing already wants WhatsApp as a fast contact route.

This issue is for a more advanced, production-grade WhatsApp Business integration.

Do not just add a cheap floating WhatsApp widget.

Do not make the site feel spammy.

Do not rebuild blindly.

Audit first.

Preserve the existing WhatsApp link/CTA work if it exists.

This issue should explore and implement, where safe and practical, an official WhatsApp Business Cloud API integration for candidate/client communications.

Important:
This is not a chatbot project unless David explicitly approves that later.

The goal is structured, compliant, useful WhatsApp communication from Essential Resourcing’s official WhatsApp Business profile.

---

## 1. Audit Current WhatsApp Setup

Audit:

- existing WhatsApp CTAs
- WhatsApp number configuration
- Sanity site settings for WhatsApp
- contact forms
- candidate forms
- job application flow
- strategic interim enquiry flow
- analytics event tracking
- consent/privacy wording
- server actions/API routes
- email confirmation flow
- Railway/Postgres backend if present
- environment variable handling
- admin notification flow

Report:

- what already exists
- what should be preserved
- what is currently just a wa.me link
- what can be upgraded to Cloud API later
- what requires Meta/WhatsApp Business authentication
- what must remain manual

---

## 2. Architecture Principle

Keep two levels of WhatsApp support:

### Level 1: Direct WhatsApp Contact Links

Use wa.me links for quick user-initiated contact.

This is good for:
- Talk to David
- Contact page
- Footer
- Strategic Interim quick contact
- Mobile menu
- Job question CTA

### Level 2: Official WhatsApp Business Cloud API

Use the official API only for structured system messages where appropriate.

This may include:
- application received confirmation
- candidate enquiry received confirmation
- high-priority strategic interim enquiry acknowledgement
- client hiring enquiry acknowledgement
- follow-up reminders, only if compliant and approved

Do not replace email entirely.

Offer WhatsApp as an additional fast route.

---

## 3. WhatsApp Business Cloud API Requirements

Prepare the app for official WhatsApp Business Cloud API integration.

Add environment variable support only if actually used:

WHATSAPP_BUSINESS_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCESS_TOKEN=
WHATSAPP_BUSINESS_VERIFY_TOKEN=
WHATSAPP_BUSINESS_APP_SECRET=
WHATSAPP_BUSINESS_WEBHOOK_SECRET=
WHATSAPP_BUSINESS_DEFAULT_TEMPLATE=
WHATSAPP_BUSINESS_ENABLED=

Never commit these values.

Update .env.example with placeholders only.

Do not hardcode tokens.

Do not expose tokens client-side.

---

## 4. Candidate/Application Messaging

Design a safe message flow.

Potential triggers:

- candidate applies for a job
- candidate submits a CV
- candidate sends a candidate enquiry
- client submits a hiring enquiry
- strategic interim enquiry is submitted

For each trigger, decide:

- should WhatsApp message be sent?
- is consent required?
- is the phone number valid?
- does user explicitly opt in to WhatsApp contact?
- should this use a WhatsApp template?
- should email also be sent?
- should an admin notification be created?
- should activity be logged?

Important:
Do not send WhatsApp messages unless the user has provided a mobile number and clearly agreed to be contacted via WhatsApp where required.

---

## 5. Consent and Privacy

Add consent wording where needed.

Forms should make contact preferences clear.

Suggested field:

Preferred contact method:
- WhatsApp
- Email
- Phone
- No preference

Suggested checkbox if needed:

“I’m happy for Essential Resourcing to contact me about this enquiry using the details I’ve provided, including WhatsApp if I select it as my preferred contact method.”

Do not bundle marketing consent into operational contact consent.

Do not pre-tick marketing consent.

Do not send marketing broadcasts.

This is for transactional/recruitment communication only unless David explicitly approves marketing messaging later.

---

## 6. Message Templates

Prepare template-ready message copy.

Do not assume templates are approved.

Document that WhatsApp Business template messages may need approval inside Meta Business Manager.

Example candidate application confirmation:

“Hi {{1}}, thanks for applying for {{2}} through Essential Resourcing. David has received your application and will review it. Your details are handled privately for recruitment purposes. You can ask for your details to be deleted at any time.”

Example strategic interim enquiry:

“Hi {{1}}, thanks for contacting Essential Resourcing about strategic interim support. David has received your enquiry and will come back to you directly.”

Example client hiring enquiry:

“Hi {{1}}, thanks for contacting Essential Resourcing about your hiring challenge. David has received your enquiry and will review the details.”

Tone:
Plain English.
Warm.
Professional.
No faff.

---

## 7. Server-Side Implementation

If implementing now, build server-side only.

Possible structure:

- lib/whatsapp/client.ts
- lib/whatsapp/templates.ts
- lib/whatsapp/send-message.ts
- app/api/webhooks/whatsapp/route.ts if webhook is required
- server actions integrated with contact/application forms

Requirements:

- server-side token handling only
- typed request/response handling
- Zod validation where useful
- retry/error handling
- clear logging without PII leakage
- graceful failure if WhatsApp is disabled
- do not block form submission if WhatsApp send fails
- store message status/activity in database if backend exists

---

## 8. Admin Dashboard

If Railway/Postgres/admin dashboard exists, add or prepare:

- WhatsApp message status
- preferred contact method
- WhatsApp opt-in/contact preference
- message activity history
- failed message handling
- manual resend option only if safe
- audit log entry for message sent

Do not build a full WhatsApp inbox unless explicitly requested later.

---

## 9. Webhook Handling

If WhatsApp webhooks are implemented:

- verify webhook challenge securely
- validate signatures if supported
- handle delivery/read/status updates
- do not expose sensitive data
- rate limit endpoint
- log events safely
- store minimal useful message status
- document Meta webhook setup steps

If webhook setup requires Meta account access, prompt David clearly.

---

## 10. Documentation

Create or update:

docs/whatsapp-business-cloud-api.md

Include:

- what is implemented
- what remains manual
- required Meta/WhatsApp setup
- env vars
- template approval notes
- consent notes
- testing steps
- fallback behaviour
- privacy notes

Also update relevant launch checklist docs.

---

## 11. Testing

Test:

- forms still work if WhatsApp is disabled
- WhatsApp message send is skipped without env vars
- preferred contact method is stored
- consent is stored
- application confirmation does not fail if WhatsApp fails
- no tokens leak to client
- no PII is sent to analytics
- build passes
- typecheck passes
- lint passes

Do not claim commands passed unless they actually passed.

---

## 12. Final Output Required

Report:

- what already existed
- what was added
- whether Cloud API is fully implemented or only prepared
- env vars required
- Meta/WhatsApp manual setup needed
- forms updated
- consent/privacy changes
- files changed
- commands run
- blockers
- production readiness

Final principle:
Use WhatsApp to make communication faster and more human without making the website cheap, spammy or legally risky.

Official where useful.
Simple where sensible.
Consent-aware.
No secrets in GitHub.
No faff.
EOF
)

BODY_DSAR=$(cat <<'EOF'
# DSAR Framework: Candidate Data Export, Delete Requests and Privacy Portal Workflow

## Critical Context

Essential Resourcing will handle candidate data, CVs, job applications and private recruitment records.

Under GDPR, candidates may have rights to request access to their data, request deletion, request correction, restrict processing, or object to certain processing.

This issue is to build or prepare a secure, practical DSAR framework.

Important:
Do not build a dangerous one-click public delete button that wipes records without identity checks, audit logs, admin review and legal safeguards.

The right approach is:

- clear candidate-facing request route
- secure identity verification
- internal admin workflow
- data export package where appropriate
- deletion/anonymisation workflow where appropriate
- audit log of every step
- legal review flag

Do not fake compliance.

Do not over-automate sensitive deletion without review.

---

## 1. Audit Current Candidate Data Handling

Audit:

- candidate forms
- job application forms
- CV upload flow
- privacy policy
- candidate privacy notice
- database models
- storage locations
- Sanity usage
- Railway/Postgres backend
- admin dashboard
- email confirmations
- candidate records
- application records
- uploaded files
- audit logs
- consent records
- retention fields
- existing delete/export workflows

Report:

- what data is collected
- where it is stored
- what identifiers connect records
- what deletion/export gaps exist
- what requires legal review
- what should not be automated yet

---

## 2. Candidate Privacy Portal

Create or prepare a simple candidate privacy request route.

Possible route:

/candidate-privacy/request

Or:

/privacy/request-my-data

The page should allow candidates to request:

- copy/export of my data
- delete my candidate profile/details
- correct/update my details
- withdraw consent
- ask a privacy question

Keep it simple and professional.

Do not expose whether an email exists in the database.

Use neutral confirmation copy:

“If the details match records we hold, David will review the request and respond using the contact details provided.”

---

## 3. Secure Request Submission

Build a secure DSAR request form.

Fields:

- name
- email
- phone optional
- request type
- message/details
- confirmation checkbox
- privacy notice acknowledgement

Request types:

- access_export
- deletion
- correction
- consent_withdrawal
- restriction
- objection
- other

Security requirements:

- server-side validation
- spam protection/honeypot
- rate limiting
- no public lookup of candidate records
- do not reveal whether an email exists
- store request in Postgres if available
- send admin notification if email provider exists
- send requester confirmation if email provider exists
- log request creation in audit/activity log

---

## 4. Database Model

If Railway/Postgres exists or is being built, add DSAR models.

Suggested table:

data_subject_requests

Fields:

- id
- requestType
- requesterName
- requesterEmail
- requesterPhone
- message
- status
- verificationStatus
- verifiedAt
- assignedTo
- relatedCandidateId
- relatedContactId
- dueAt
- completedAt
- completionNotes
- createdAt
- updatedAt
- closedAt

Statuses:

- received
- verifying_identity
- in_review
- awaiting_info
- approved
- rejected
- completed
- closed

Verification statuses:

- not_started
- pending
- verified
- failed
- not_required

Also support activity/audit logs for every status change.

---

## 5. Identity Verification

Do not export or delete data without a sensible identity check.

Implement or document one of:

- email verification link
- manual admin verification
- request code sent to email
- admin-approved identity check

If full identity verification is not built yet, mark request as manual-review-required.

Never send a full data export to an unverified requester.

Never delete records based only on an unauthenticated public form submission.

---

## 6. Data Export Workflow

Create a secure data export workflow.

Preferred staged approach:

Stage 1:
- admin can see DSAR request
- documentation lists where to gather candidate data
- manual export instructions

Stage 2:
- generate structured JSON/CSV export from database rows
- include candidate, application, consent, notes and activity where appropriate
- do not include third-party confidential client notes unless legally reviewed
- create secure temporary download
- require admin approval before release

Stage 3:
- package export as secure zip
- short-lived signed URL
- access logging
- expiry
- deletion of export file after expiry

Important:
Do not build an unauthenticated endpoint that packages private data automatically.

---

## 7. Delete / Erasure Workflow

Create a safe deletion/anonymisation workflow.

Important:
Right to erasure is not always absolute. Some records may need retention for legal, contract, fraud prevention or compliance reasons.

Therefore:
- do not blindly wipe all records without review
- support deletion request status
- support admin approval
- support anonymisation where full deletion is not appropriate
- keep minimal audit log of deletion request and completion where legally appropriate
- delete or revoke access to CV files
- remove public/private file links
- update candidate status to deleteRequested or deleted where appropriate

Possible fields:

- deleteRequestedAt
- deletionApprovedAt
- deletedAt
- anonymisedAt
- deletionReason
- deletionCompletedBy

Hard rule:
No public one-click “wipe me completely” endpoint without verification and admin/legal safeguards.

---

## 8. Admin Dashboard Workflow

If admin dashboard exists or is being built, add DSAR section.

Admin should be able to:

- view requests
- filter by status
- see due dates
- assign request
- mark identity verification status
- link to candidate/contact record
- add internal notes
- approve/reject request
- generate/export package if implemented
- mark deletion/anonymisation completed
- see audit history

Keep it simple.

This is an internal compliance workflow, not a huge legal platform.

---

## 9. Email Notifications

Prepare transactional emails if provider exists.

Requester confirmation:

Subject:
“We’ve received your data request”

Body should say:
- request received
- David will review it
- identity verification may be required
- no sensitive data will be released until verification is complete
- link to Candidate Privacy Notice

Admin notification:

Subject:
“New data/privacy request received”

Body should include:
- request type
- requester name/email
- date received
- link to admin record if available

Do not include sensitive data unnecessarily.

---

## 10. Documentation

Create or update:

docs/dsar-framework.md

Include:

- what DSAR means in plain English
- what the site supports
- what remains manual
- where data is stored
- how requests are handled
- how identity verification works
- how exports work
- how deletion/anonymisation works
- legal review warning
- admin checklist

Also update:

- Candidate Privacy Notice
- Privacy Policy
- candidate-data-journey docs
- Railway/Postgres backend docs if relevant

---

## 11. Testing

Test:

- DSAR form submits
- validation works
- spam/honeypot works
- no account enumeration
- request stored correctly
- confirmation email prepared/sent if provider exists
- admin notification prepared/sent if provider exists
- admin dashboard access protected
- unauthenticated users cannot view requests
- export cannot run without verification/admin permission
- delete cannot run without verification/admin approval
- audit logs are created
- no PII is sent to analytics
- lint/typecheck/build pass

Do not claim commands passed unless they actually passed.

---

## 12. Final Output Required

Report:

- what was audited
- what was added
- request types supported
- database changes
- admin workflow
- export workflow
- deletion workflow
- identity verification status
- legal/privacy review items
- files changed
- commands run
- manual actions for David
- production readiness

Final principle:
Make DSAR handling clear, secure and defensible.

Do not create dangerous auto-delete shortcuts.

Verify identity.
Protect candidate data.
Log sensitive actions.
No fake compliance.
No faff.
EOF
)

BODY_AUDIT=$(cat <<'EOF'
# Compliance Audit Logging: Candidate Data Access, CV Views and Sensitive Record Changes

## Critical Context

Essential Resourcing will store and process private recruitment data, including candidate records, applications, notes, statuses and uploaded CV metadata/files.

For compliance defensibility, the system should be able to show who accessed or changed sensitive data and when.

This issue is to implement or prepare a robust audit logging layer.

Do not rebuild blindly.

Audit first.

Preserve existing database/admin architecture.

Do not log sensitive full CV content.

Do not leak PII into analytics or public logs.

Audit logs should be append-only in normal application flow.

---

## 1. Audit Current Logging

Audit:

- database schema
- admin dashboard
- candidate records
- applications
- CV upload/download routes
- notes
- tasks
- status changes
- consent records
- DSAR workflow if present
- server actions/API routes
- auth/session system
- current app logs
- analytics events

Report:

- what is already logged
- what sensitive actions are not logged
- what logs include too much PII
- what needs audit logging
- what depends on Railway/Postgres backend

---

## 2. Audit Log Table

If Postgres exists or is being implemented, create an audit_logs table/model.

Suggested fields:

- id
- actorId
- actorEmail
- actorRole
- action
- entityType
- entityId
- entityLabel
- before
- after
- metadata
- ipHash if appropriate
- userAgentHash if appropriate
- createdAt

Important:
Be careful with before/after snapshots.
Do not store full CV text.
Do not store unnecessary sensitive content.
Prefer minimal diffs for sensitive fields.

Actions to support:

- candidate_created
- candidate_viewed
- candidate_updated
- candidate_deleted
- candidate_anonymised
- application_created
- application_viewed
- application_updated
- application_status_changed
- cv_uploaded
- cv_viewed
- cv_downloaded
- cv_deleted
- note_created
- note_updated
- note_deleted
- task_created
- task_completed
- consent_created
- consent_updated
- dsar_request_created
- dsar_request_viewed
- dsar_export_generated
- dsar_export_downloaded
- dsar_deletion_approved
- dsar_deletion_completed
- admin_user_created
- admin_user_role_changed
- login_success
- login_failed if auth system supports it

---

## 3. Append-Only Principle

Implement audit logging so normal admin users cannot edit or delete audit log rows from the UI.

If deletion is technically possible at database level, document that only database owners/ops can perform it.

In the application:
- no edit audit log route
- no delete audit log route
- audit logs are read-only in admin dashboard
- audit logs record sensitive actions automatically

---

## 4. Server-Side Logging Utility

Create a central audit logging utility.

Example:

logAuditEvent({
  actor,
  action,
  entityType,
  entityId,
  entityLabel,
  before,
  after,
  metadata
})

Requirements:

- server-side only
- typed actions
- safe metadata handling
- no secrets
- no full CV content
- no raw access tokens
- graceful failure strategy
- avoid breaking critical user submissions if audit log write fails unless action is highly sensitive

Sensitive admin operations should fail safely if audit logging is required and cannot be written.

---

## 5. Candidate Data Access Logging

Log when admin users view sensitive records.

At minimum:

- candidate profile viewed
- application viewed
- CV viewed/downloaded
- DSAR request viewed
- consent record viewed/updated
- deletion/export action performed

Avoid excessive noisy logging for harmless listing pages if impractical.

But any detailed candidate/CV access should be logged.

---

## 6. CV View and Download Logging

If CV uploads/storage exists:

Log:

- cv_uploaded
- cv_viewed
- cv_downloaded
- cv_deleted
- signed_url_generated if used

Include:

- admin user
- candidate/application id
- file metadata id
- timestamp
- access route

Do not include:

- full CV content
- public file URL
- signed URL value
- storage secret
- raw token

---

## 7. Status and Note Changes

Log:

- application status changes
- candidate status changes
- important note creation/update/deletion
- consent status changes
- retention/deletion status changes

For status changes, log:

- old status
- new status
- actor
- timestamp

---

## 8. Admin Dashboard Audit View

If admin dashboard exists, add read-only audit log view.

Possible route:

/admin/audit

Features:

- filter by entity type
- filter by action
- filter by actor
- filter by date range
- search by candidate/application id if safe
- view audit event detail
- link back to related record if authorised

Only owner/admin roles should access full audit log.

Recruiter/editor roles may only see limited related activity if appropriate.

---

## 9. Privacy and Retention

Audit logs themselves can contain personal data.

Document:

- what audit logs store
- why they are needed
- who can access them
- retention period recommendation
- deletion/anonymisation behaviour
- legal review required

Do not promise ICO compliance.
Say this supports defensible compliance processes but needs legal/privacy review.

---

## 10. Testing

Test:

- audit log created on candidate creation
- audit log created on candidate view
- audit log created on application status change
- audit log created on CV download/view
- audit log created on consent update
- audit log created on DSAR action if implemented
- admin audit route is protected
- normal users cannot edit/delete logs
- no secrets/PII-heavy data leaks into logs
- lint/typecheck/build pass

Do not claim commands passed unless they actually passed.

---

## 11. Documentation

Create or update:

docs/audit-logging.md

Include:

- what is logged
- why it is logged
- where logs are stored
- how to review logs
- what is not logged
- privacy/legal caveats
- admin dashboard instructions

Also update relevant backend/admin docs.

---

## 12. Final Output Required

Report:

- what was audited
- audit log schema/model added
- actions covered
- server utility added
- admin dashboard changes
- CV access logging status
- DSAR logging status
- privacy considerations
- files changed
- commands run
- manual actions for David
- production readiness

Final principle:
If someone views, changes, exports or deletes candidate data, the system should be able to show who did it and when.

Defensible.
Private.
Append-only in app flow.
No secrets.
No CV content in logs.
No faff.
EOF
)

create_issue_if_missing \
  "WHATSAPP BUSINESS: Native Cloud API candidate and client messaging integration" \
  "priority: critical,whatsapp-business,security,audit-first" \
  "$BODY_WHATSAPP"

create_issue_if_missing \
  "DSAR FRAMEWORK: Candidate data export, delete requests and privacy portal workflow" \
  "priority: critical,gdpr,dsar,security,database,audit-first" \
  "$BODY_DSAR"

create_issue_if_missing \
  "AUDIT LOGGING: Candidate data access, CV views and compliance defensibility" \
  "priority: critical,audit-logging,gdpr,security,database,audit-first" \
  "$BODY_AUDIT"

echo ""
echo "Done. Created advanced recruitment compliance issues:"
echo "https://github.com/$REPO/issues"
