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

gh label create "data-architecture" \
  --repo "$REPO" \
  --color "0E8A16" \
  --description "Data architecture and separation of concerns" 2>/dev/null || true

gh label create "sanity-cms" \
  --repo "$REPO" \
  --color "F03E2F" \
  --description "Sanity CMS structure and content boundaries" 2>/dev/null || true

gh label create "database" \
  --repo "$REPO" \
  --color "1D76DB" \
  --description "Postgres database, migrations and data modelling" 2>/dev/null || true

gh label create "gdpr" \
  --repo "$REPO" \
  --color "D93F0B" \
  --description "Privacy, consent, retention and GDPR-related requirements" 2>/dev/null || true

gh label create "security" \
  --repo "$REPO" \
  --color "FBCA04" \
  --description "Security, privacy, authentication and sensitive data handling" 2>/dev/null || true

gh label create "retention-engine" \
  --repo "$REPO" \
  --color "5319E7" \
  --description "Data minimisation, retention rules and scheduled cleanup jobs" 2>/dev/null || true

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

BODY_SEPARATION=$(cat <<'EOF'
# DATA ARCHITECTURE: Strict Separation of Sanity CMS and Private Candidate/Client PII

## Critical Context

Essential Resourcing will use Sanity as the public website CMS.

Sanity is excellent for public marketing content:

- homepage
- service pages
- public job adverts
- insights
- case studies
- salary snapshots
- testimonials
- navigation
- footer
- SEO content
- public media assets

But Sanity must not become the private database for real candidate records, CVs, phone numbers, private client contacts, application history or internal recruitment notes.

This issue exists to enforce a strict separation of concerns:

Sanity = public CMS  
Postgres / secure database = private operational records

Do not rebuild blindly.

Audit first.

Preserve what works.

Do not migrate public CMS content out of Sanity.

Do not store private candidate/client PII in Sanity.

Do not duplicate data unnecessarily.

Do not break existing CMS functionality.

---

## 1. Audit Current Data Flow

Audit the current codebase and CMS schemas.

Check:

- Sanity schemas
- Sanity documents
- public job schema
- application forms
- candidate forms
- contact forms
- CV upload flow
- admin dashboard if present
- Railway/Postgres backend if present
- server actions/API routes
- environment variables
- form submission handlers
- email notifications
- analytics events
- any code storing form submissions in Sanity
- any code storing CVs or candidate details in Sanity
- any code exposing private data through public queries

Report clearly:

- what Sanity currently stores
- what Postgres/database currently stores
- what is public content
- what is private operational data
- what is risky
- what must be moved or blocked
- what can remain as-is

---

## 2. Define the Data Boundary

Create a clear documented rule:

### Sanity May Store

- public job advert title
- public job advert slug
- public salary/rate range if intended to be public
- public location/hybrid information
- public job description
- public service pages
- public insight articles
- public case studies
- public salary snapshots
- public testimonials with permission
- public SEO metadata
- public CTAs
- public navigation/footer
- public site settings

### Sanity Must Not Store

- candidate names submitted through forms
- candidate email addresses
- candidate phone numbers
- CV files
- CV file URLs
- cover letters
- private job application records
- private client contact records
- private hiring briefs containing named contacts
- private internal notes
- candidate statuses
- application statuses
- lead history
- DSAR requests
- audit logs
- private consent records
- private WhatsApp messaging logs
- sensitive admin-only records

### Postgres / Private Database Should Store

- enquiries
- candidate records
- application records
- private client/contact records
- CV metadata
- consent records
- retention dates
- statuses
- tasks
- notes
- lead history
- DSAR requests
- audit logs
- admin workflow records

---

## 3. Public Job to Private Application Pattern

If jobs are public in Sanity, keep them there.

Recommended pattern:

Sanity job:
- id
- title
- slug
- public description
- public salary/rate range
- public location
- public status
- public SEO metadata

Postgres application:
- id
- sanityJobId
- candidateId
- cvFileId
- coverMessage
- consentToStoreData
- status
- createdAt
- updatedAt

The public job page should read from Sanity.

The application form should write private candidate/application data to Postgres only.

The admin dashboard can show linked Sanity job title/slug by reading Sanity read-only, but should not write private application data into Sanity.

---

## 4. Enforce in Code

Add safeguards so future development does not accidentally store PII in Sanity.

Where practical:

- centralise candidate/application writes through private server actions/API routes
- create clear naming for private data functions
- add comments/warnings near Sanity write utilities
- avoid generic “submitToSanity” patterns for forms
- ensure form handlers for candidates/applications/enquiries do not write PII to Sanity
- update TypeScript types to separate public CMS types from private database types
- add tests or lint-like checks where practical
- update documentation

Suggested docs:

docs/data-boundaries.md

This should explain:

- what Sanity is for
- what Postgres is for
- what must never go into Sanity
- how applications should flow
- how CVs should flow
- how admin dashboard should read/write data
- what future developers must not do

---

## 5. Sanity Schema Review

Review Sanity schemas for risky fields.

Look for fields such as:

- candidateName
- candidateEmail
- candidatePhone
- cv
- cvFile
- application
- coverLetter
- clientContactEmail
- privateNotes
- internalStatus
- leadHistory
- consentRecord

If found:

- decide whether they are public-safe
- remove or deprecate if unsafe
- migrate only if safe and necessary
- document manual data cleanup if private data already exists in Sanity

Do not delete real data blindly.

If private PII is found in Sanity, stop and report:

- what was found
- where
- why it is risky
- recommended safe migration/removal plan
- manual approval needed from David

---

## 6. Database / CRM Decision

If Railway/Postgres is already planned, align with that.

Preferred private store:
- Railway Postgres

Alternative future options:
- Supabase Postgres
- Neon Postgres
- hardened ATS/CRM with API
- secure object storage for CV files

Do not introduce Supabase or Neon if Railway/Postgres is already the chosen direction unless there is a strong reason.

This build should avoid platform sprawl.

---

## 7. CV and File Handling Boundary

Hard rule:

Sanity should not store private CV files or public URLs to private CV files.

Recommended flow:

- candidate uploads CV through secure form
- file goes to private object storage
- metadata goes to Postgres
- application record links to metadata
- admin dashboard accesses CV through authenticated/signed route
- audit log records CV access
- retention engine can delete or anonymise records later

If this is not implemented yet, document it as a dependency.

Do not create unsafe interim upload behaviour.

---

## 8. Analytics Boundary

Ensure no PII is sent to analytics.

Do not send:

- names
- emails
- phone numbers
- CV filenames
- cover letters
- messages
- exact candidate identifiers

Allowed:

- form_type
- page_path
- job_slug
- generic status
- source
- consent state if non-identifying

---

## 9. Documentation and Developer Warnings

Create or update:

docs/data-boundaries.md  
docs/candidate-data-journey.md  
docs/railway-deployment.md if relevant  
docs/sanity-editor-guide.md if relevant

Add a clear plain-English warning:

“Sanity is for public website content. Do not store private candidate/client data, CVs, application records or internal notes in Sanity.”

---

## 10. Testing

Test or verify:

- public pages still read from Sanity
- job pages still work
- application form does not write PII to Sanity
- candidate enquiry does not write PII to Sanity
- private form submissions go to secure backend or are clearly staged
- no public Sanity query exposes private records
- build passes
- typecheck passes
- lint passes

Do not claim commands passed unless they actually passed.

---

## 11. Final Output Required

Report:

## Audit Summary
- what Sanity currently stores
- what private database/backend currently stores
- any risky PII found in Sanity
- any risky public exposure found

## Boundary Decision
- what stays in Sanity
- what must go to Postgres/private backend
- what must never be stored in Sanity

## Changes Made
- code changes
- schema changes
- docs added
- warnings added
- tests/checks added

## Risks / Manual Actions
- any private data cleanup needed
- any migration needed
- any legal/privacy review needed

## Files Changed
List all files changed.

## Commands Run
List commands actually run.

## Production Readiness
State:
- ready
- partially ready
- blocked
- what blocks launch

Final principle:
Sanity is the public content engine.

Postgres/private backend is the operational data store.

No candidate PII in Sanity.

No CVs in Sanity.

No private records in public CMS queries.

No fake compliance.

No faff.
EOF
)

BODY_RETENTION=$(cat <<'EOF'
# DATA RETENTION: Automated Data Minimisation, Retention Rules and Scheduled Cleanup Engine

## Critical Context

Essential Resourcing will handle candidate applications, CVs, contact enquiries and potentially private recruitment records.

Private data should not be kept forever by default.

This issue is to design and implement, or safely stage, a data minimisation and retention engine.

The goal is to support GDPR-style data lifecycle management:

- collect only what is needed
- store only where needed
- retain only for a defined period
- allow opt-in for longer retention where appropriate
- anonymise/delete when retention expires
- log sensitive retention actions
- avoid fake compliance claims

Do not rebuild blindly.

Audit first.

Preserve existing systems.

Do not automatically delete records without understanding the data model, legal/privacy requirements, audit logs, backups and business workflow.

Do not create dangerous cron jobs that wipe production data without dry-run, review and safety controls.

---

## 1. Audit Current Data Retention Setup

Audit:

- candidate database models
- application models
- enquiry models
- CV metadata models
- consent records
- DSAR models
- audit_logs table
- admin dashboard
- job application flow
- candidate privacy notice
- privacy policy
- current retention wording
- current scheduled jobs/cron setup
- Railway deployment setup
- environment variables
- object storage/CV storage
- backup strategy

Report:

- whether retention fields exist
- whether consent timestamps exist
- whether dataRetentionUntil exists
- whether deletion/anonymisation fields exist
- whether CV deletion is possible
- whether audit logs exist
- whether cron/scheduled jobs are available
- what must be manual for now

---

## 2. Retention Policy Model

Create a clear configurable retention model.

Do not hardcode legal policy as if final.

Use configurable defaults with legal review warning.

Suggested retention categories:

### Candidate Application For Specific Role

If unsuccessful and no longer active:
- default retention: 6 months after rejection/closure
- then anonymise/delete candidate application data unless candidate opts in for future roles

### Candidate Talent Pool / Active Roster

If candidate explicitly opts in:
- default retention: 24 months
- send reminder/refresh consent before expiry if email/WhatsApp workflow exists
- anonymise/delete if no renewed consent

### General Candidate Enquiry

- default retention: 12 months unless converted to active candidate

### Client/Hiring Enquiry

- default retention: business-defined, e.g. 24 months or longer if there is legitimate business relationship
- legal review required

### CV Files

- follow candidate/application retention
- delete file from private object storage when record is deleted/anonymised
- keep only metadata needed for audit where appropriate

Important:
These are starting recommendations, not legal advice.

Make retention values configurable.

---

## 3. Database Fields

If Railway/Postgres exists or is being implemented, ensure relevant tables support:

- consentToStoreData
- consentTimestamp
- consentSource
- privacyNoticeVersion
- retentionCategory
- dataRetentionUntil
- retentionReviewAt
- retentionStatus
- optedIntoTalentPool
- talentPoolConsentUntil
- deleteRequestedAt
- deletionApprovedAt
- deletedAt
- anonymisedAt
- deletionReason
- anonymisationReason
- retentionLastCheckedAt

Retention statuses:

- active
- pending_review
- expiring_soon
- delete_requested
- deletion_approved
- deleted
- anonymised
- retained_for_legal_reason

Only add fields that fit the current data model.

Do not create duplicate concepts if existing fields already cover this.

---

## 4. Scheduled Job / Cron Architecture

Implement or document a scheduled retention job.

Preferred behaviour:

- safe dry-run mode
- logs candidates/applications due for action
- does not delete immediately on first run unless explicitly configured
- creates admin tasks/review queue first if needed
- supports manual approval for deletion/anonymisation
- writes audit log entries
- sends reminder/renewal emails only if approved
- deletes files from private storage only after approval/safe checks

Possible job name:

retention:check

Possible scripts:

npm run retention:check
npm run retention:check -- --dry-run
npm run retention:apply

If Railway supports scheduled jobs/cron for the project, document exact setup.

If not, document alternatives:

- Railway cron service if available
- GitHub Actions scheduled workflow calling a protected endpoint
- external cron service calling secure endpoint
- manual admin review queue as first phase

Important:
Do not expose an unauthenticated public cron endpoint.

If using an endpoint, protect it with:

- CRON_SECRET
- POST only
- rate limiting
- server-side execution
- audit logging

---

## 5. Retention Review Queue

Before fully automated deletion, build a safer review flow if practical.

Admin dashboard should show:

- records expiring soon
- records due for deletion/anonymisation
- candidate/application status
- consent status
- retention reason
- linked CV file metadata
- recommended action
- approve deletion
- approve anonymisation
- retain with reason
- mark as legally retained

This avoids unsafe automatic deletion.

---

## 6. Anonymisation Strategy

Define anonymisation rules.

For candidate records:

Remove or anonymise:
- name
- email
- phone
- LinkedIn URL
- CV file links
- free-text notes containing PII where possible
- cover letters/messages

Keep only if needed:
- anonymised application statistics
- role/category
- date ranges
- status
- high-level source
- audit log showing action occurred

Important:
Free-text notes may contain PII. Treat them carefully.

Do not claim full anonymisation if notes remain identifiable.

---

## 7. Deletion Strategy

Define deletion rules.

When deletion is approved:

- delete/revoke CV files from private storage
- delete or anonymise candidate record
- delete or anonymise applications
- delete or anonymise notes/tasks if appropriate
- retain minimal audit log if legally appropriate
- mark deletion completed
- record actor/admin
- record timestamp
- record deletion reason

Do not delete audit logs blindly.

Do not delete records that must be retained for legal/contractual reasons without review.

---

## 8. Consent Renewal

If candidate opts into a talent pool, prepare a renewal workflow.

Future/optional:

- send renewal email before retention expires
- allow candidate to confirm they want to stay on file
- update consent timestamp
- extend talentPoolConsentUntil
- log consent renewal
- if no response, queue for deletion/anonymisation

Do not send automated emails until email provider and legal copy are approved.

---

## 9. Admin Notifications and Tasks

If admin dashboard/tasks exist:

- create tasks for expiring records
- notify David of records due for review
- show retention warnings on candidate profiles
- show “data retention until” dates
- show consent status clearly

If no admin dashboard exists yet, document as dependency.

---

## 10. Documentation

Create or update:

docs/data-retention-engine.md  
docs/candidate-data-journey.md  
docs/cv-storage-and-retention.md  
docs/dsar-framework.md if present  
docs/railway-deployment.md if scheduled job setup needed

Include:

- retention principles
- retention categories
- recommended defaults
- legal review warning
- how scheduled jobs work
- dry-run/apply process
- admin review workflow
- deletion/anonymisation rules
- storage cleanup rules
- audit logging requirements
- manual fallback process

---

## 11. Safety Controls

Add safety controls:

- dry-run by default
- no production delete without explicit flag or admin approval
- audit log every action
- backup warning before first live run
- environment check
- CRON_SECRET if endpoint used
- feature flag:

RETENTION_ENGINE_ENABLED=false

- optional:

RETENTION_DRY_RUN=true

Do not let retention automation run unexpectedly in production.

---

## 12. Testing

Test:

- records with expired retention are identified
- dry-run makes no changes
- review queue shows records correctly
- apply mode requires explicit approval/config
- anonymisation removes PII fields
- CV file deletion is called only after approval
- audit logs are written
- cron endpoint is protected if used
- no unauthenticated deletion route exists
- no PII sent to analytics
- build passes
- typecheck passes
- lint passes

Do not claim commands passed unless actually run.

---

## 13. Staged Implementation

If backend is not ready, stage safely.

Stage 1:
- retention fields in schema/model
- documentation
- manual admin checklist
- no automated deletion yet

Stage 2:
- retention check dry-run
- admin review queue
- audit logs

Stage 3:
- approved anonymisation
- approved CV deletion
- admin dashboard workflow

Stage 4:
- scheduled checks
- renewal reminders
- reporting

Stage 5:
- hardened automation with legal review

Do not force full automation before database, storage, audit logging and admin approval exist.

---

## 14. Final Output Required

Report:

## Audit Summary
- what retention/data lifecycle currently exists
- what is missing
- what is risky

## Retention Model
- categories
- default durations
- legal review warnings
- configurable settings

## Database Changes
- fields/models added
- relationships
- migrations

## Retention Engine
- scripts/endpoints added
- dry-run behaviour
- apply behaviour
- cron/scheduling plan
- safety controls

## Admin Workflow
- review queue
- approval process
- tasks/notifications
- what remains manual

## CV/File Handling
- deletion/anonymisation behaviour
- private storage dependency
- remaining risks

## Audit Logging
- actions logged
- gaps/dependencies

## Files Changed
List all files changed.

## Commands Run
List commands actually run.

## Manual Actions for David
Give a numbered checklist.

## Production Readiness
State:
- ready
- partially ready
- blocked
- what blocks launch

Final principle:
Do not keep candidate data forever by accident.

Do not delete candidate data recklessly.

Build a safe lifecycle:
collect only what is needed,
store it privately,
review it regularly,
delete/anonymise when appropriate,
log the action,
and keep David in control.

No fake compliance.
No dangerous auto-wipe.
No public CV links.
No faff.
EOF
)

create_issue_if_missing \
  "DATA ARCHITECTURE: Strict separation of Sanity CMS and private candidate/client PII" \
  "priority: critical,data-architecture,sanity-cms,database,gdpr,security,audit-first" \
  "$BODY_SEPARATION"

create_issue_if_missing \
  "DATA RETENTION: Automated minimisation, retention rules and scheduled cleanup engine" \
  "priority: critical,retention-engine,gdpr,database,security,audit-first" \
  "$BODY_RETENTION"

echo ""
echo "Done. Created data separation and retention issues:"
echo "https://github.com/$REPO/issues"
