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

gh label create "railway" \
  --repo "$REPO" \
  --color "7952B3" \
  --description "Railway hosting, deployment and environment setup" 2>/dev/null || true

gh label create "database" \
  --repo "$REPO" \
  --color "0E8A16" \
  --description "Postgres database, migrations and data modelling" 2>/dev/null || true

gh label create "admin-dashboard" \
  --repo "$REPO" \
  --color "1D76DB" \
  --description "Private admin dashboard and internal workflow" 2>/dev/null || true

gh label create "security" \
  --repo "$REPO" \
  --color "D93F0B" \
  --description "Security, privacy, authentication and sensitive data handling" 2>/dev/null || true

gh label create "cms-compatible" \
  --repo "$REPO" \
  --color "FBCA04" \
  --description "Preserve Sanity CMS and existing public website build" 2>/dev/null || true

gh label create "audit-first" \
  --repo "$REPO" \
  --color "5319E7" \
  --description "Inspect current implementation before changing anything" 2>/dev/null || true

TITLE="RAILWAY BACKEND: Postgres database, private admin dashboard and Sanity-compatible operations layer"

if gh issue list --repo "$REPO" --state all --search "$TITLE in:title" --json title --jq '.[].title' | grep -Fxq "$TITLE"; then
  echo "Issue already exists: $TITLE"
  echo "Open issues here: https://github.com/$REPO/issues"
  exit 0
fi

echo "Creating Railway/Postgres backend issue..."

gh issue create \
  --repo "$REPO" \
  --title "$TITLE" \
  --label "priority: critical,railway,database,admin-dashboard,security,cms-compatible,audit-first" \
  --body-file - <<'EOF'
# Railway Backend: Postgres Database, Private Admin Dashboard and Sanity-Compatible Operations Layer

## Critical Context

Build a world-class Railway + Postgres operational backend for the Essential Resourcing website, without breaking the existing Sanity CMS website build.

The current website uses Sanity as the public CMS.

Keep Sanity for public website content.

Do not replace Sanity.

Do not migrate public CMS content into Postgres.

Do not break the existing website, CMS, routing, design system, SEO, schema, forms, analytics, consent setup or deployment assumptions.

The new database/backend is for private business operations only:

- contact form enquiries
- candidate records
- job applications
- uploaded CVs
- notes
- statuses
- tasks
- private lead history
- admin dashboard
- internal workflow
- GDPR/data retention controls

Preferred hosting:
Railway.

Preferred database:
Railway Postgres.

Preferred architecture:
Next.js full-stack app deployed on Railway, with Sanity still used as the public CMS, and Postgres used for private operational data.

If Railway authentication, CLI login, project linking, database provisioning, environment variables, domain setup, storage setup or any other account access is needed, prompt David clearly and give exact terminal commands or dashboard steps. Do not guess. Do not fake successful connection.

Use Extra-high reasoning for this task.

---

## 1. First: Audit Existing Project

Before changing anything, audit the existing codebase.

Identify:

- current framework and version
- current deployment assumptions
- whether it is Next.js App Router
- current Sanity integration
- current forms
- current job application flow
- current contact page
- current candidate flow
- current env variables
- current auth, if any
- current admin/dashboard, if any
- current file upload handling
- current validation approach
- current server actions/API routes
- current analytics/consent setup
- current package manager
- current build scripts
- current TypeScript strictness
- current test setup

Report:

- what already exists
- what must be preserved
- what can be extended
- what is missing
- what is risky
- what requires manual setup

Do not rebuild blindly.

---

## 2. Architecture Principle

Keep the architecture clean:

Sanity:
- public marketing CMS
- homepage
- service pages
- jobs content if already CMS-managed
- insights
- case studies
- salary snapshots
- testimonials
- navigation/footer/site settings
- SEO-editable content

Postgres:
- private enquiries
- private candidate records
- private applications
- private uploaded CV metadata
- private notes
- private statuses
- private tasks
- private lead history
- admin users/roles if needed
- audit logs
- consent/privacy records
- internal workflow

Do not duplicate the same public content in both Sanity and Postgres unless there is a clear reason.

Public jobs may remain in Sanity.

Private applications for those jobs should go into Postgres.

---

## 3. Recommended Stack

Use the existing stack where possible.

If the project is Next.js/TypeScript, prefer:

- Railway for hosting
- Railway Postgres for database
- Prisma ORM or Drizzle ORM
- Zod for validation
- Server Actions or API routes for secure writes
- Auth.js / NextAuth, Clerk, Lucia, Better Auth or another appropriate auth layer after auditing what exists
- private admin dashboard under a protected route, for example /admin
- secure file upload strategy for CVs
- transactional email provider if already planned, for example Resend

Before choosing Prisma or Drizzle, inspect the project.

If there is already an ORM, use it unless it is unsuitable.

If there is no ORM, recommend the best fit and explain why.

Do not add unnecessary complexity.

---

## 4. Railway Deployment Requirements

Prepare the project for Railway deployment without breaking local development.

Check and add if needed:

- railway.json if useful
- correct build command
- correct start command
- correct Node version
- healthcheck route if useful
- environment variable documentation
- DATABASE_URL support
- production-safe build
- Prisma/Drizzle migration workflow
- seed script if useful
- docs/railway-deployment.md

Railway setup should support:

- Next.js app service
- Railway Postgres service
- service-to-service database connection via DATABASE_URL
- environment variables set in Railway dashboard
- custom domain setup later
- deploy from GitHub repo

If Railway CLI is needed, provide exact commands for David.

Possible commands to document, but do not run unless environment supports it:

npm install -g @railway/cli
railway login
railway init
railway link
railway add
railway variables
railway up

Important:
Check current Railway CLI syntax before giving final commands.

If uncertain, instruct David to use Railway dashboard for database creation and env var linking.

---

## 5. Database Schema

Design a production-grade Postgres schema for a recruitment/search business.

Core entities:

### Admin Users

Fields:
- id
- name
- email
- role
- status
- createdAt
- updatedAt
- lastLoginAt

Roles:
- owner
- admin
- editor
- recruiter
- viewer

### Enquiries

For contact form and general leads.

Fields:
- id
- source
- enquiryType
- name
- email
- phone
- company
- jobTitle
- message
- serviceInterest
- urgency
- preferredContactMethod
- consentToContact
- marketingConsent
- status
- priority
- assignedTo
- createdAt
- updatedAt
- archivedAt

Statuses:
- new
- reviewed
- contacted
- qualified
- converted
- closed
- spam

### Companies

For client/lead history.

Fields:
- id
- name
- website
- linkedinUrl
- sector
- location
- size
- notes
- status
- createdAt
- updatedAt

### Contacts

For people at companies.

Fields:
- id
- companyId
- name
- email
- phone
- jobTitle
- linkedinUrl
- contactType
- notes
- consentToContact
- marketingConsent
- createdAt
- updatedAt

### Candidates

Private candidate records.

Fields:
- id
- name
- email
- phone
- location
- linkedinUrl
- currentTitle
- currentCompany
- desiredRole
- salaryExpectation
- noticePeriod
- workPreference
- sectorExperience
- seniority
- status
- source
- consentToStoreData
- consentTimestamp
- dataRetentionUntil
- notes
- createdAt
- updatedAt
- archivedAt

Candidate statuses:
- new
- reviewing
- contacted
- active
- shortlisted
- placed
- notSuitable
- archived
- deleteRequested

### Jobs

If public jobs remain in Sanity, store external references only.

Fields:
- id
- sanityJobId
- title
- clientCompanyId
- status
- createdAt
- updatedAt

Do not duplicate full public job content unless needed.

### Applications

Fields:
- id
- candidateId
- jobId
- sanityJobId
- source
- coverMessage
- cvFileId
- status
- consentToStoreData
- createdAt
- updatedAt

Statuses:
- received
- reviewing
- contacted
- shortlisted
- submitted
- interviewing
- offered
- placed
- rejected
- withdrawn
- archived

### Files / CV Metadata

Fields:
- id
- ownerType
- ownerId
- fileName
- fileType
- fileSize
- storageProvider
- storageKey
- uploadedBy
- uploadedAt
- virusScanStatus
- accessLevel
- retentionUntil
- deletedAt

Important:
Do not store CV binary files directly in Postgres unless there is a strong reason.

Use secure object storage.

### Notes

Fields:
- id
- entityType
- entityId
- note
- noteType
- createdBy
- createdAt
- updatedAt

### Tasks

Fields:
- id
- entityType
- entityId
- title
- description
- status
- priority
- dueAt
- assignedTo
- createdBy
- createdAt
- updatedAt
- completedAt

### Activity / Lead History

Fields:
- id
- entityType
- entityId
- activityType
- title
- description
- metadata
- createdBy
- createdAt

Activity types:
- enquiry_created
- form_submitted
- candidate_created
- application_received
- note_added
- status_changed
- task_created
- email_sent
- file_uploaded
- consent_updated

### Consent Records

Fields:
- id
- entityType
- entityId
- consentType
- status
- source
- ipHash if appropriate
- userAgentHash if appropriate
- createdAt
- expiresAt

### Audit Logs

Fields:
- id
- actorId
- action
- entityType
- entityId
- before
- after
- createdAt

Audit sensitive changes:
- candidate create/update/delete
- CV upload/delete
- application status changes
- consent changes
- admin user changes
- data export/delete requests

---

## 6. GDPR / Privacy / Security

This is critical because CVs and candidate data are sensitive business data.

Implement or design for:

- authenticated admin-only access
- role-based permissions
- server-side validation
- CSRF protection if relevant
- rate limiting on public forms
- spam protection/honeypot
- secure file uploads
- file type restrictions
- file size restrictions
- virus scanning plan or clear manual warning
- private object storage for CVs
- signed URLs for private file access
- no public CV URLs
- no secrets in GitHub
- no PII in client-side logs
- no PII in analytics events
- audit logs
- data retention fields
- delete/export request workflow
- consent records
- privacy policy updates required
- cookie/consent mode compatibility

Do not overclaim legal compliance.

Flag legal/privacy review before launch.

---

## 7. File Upload Strategy

Audit current file upload handling.

For uploaded CVs:

Do not store files in public /uploads.

Do not commit files.

Do not store CV files in Sanity unless there is a clear secure private storage plan.

Do not expose CV files publicly.

Recommended options:

- Railway volume only if appropriate and backed up
- S3-compatible object storage
- Cloudflare R2
- AWS S3
- UploadThing
- Supabase Storage
- another secure private object storage provider

Choose or recommend the safest practical option.

Requirements:

- private bucket/storage
- signed access URLs
- file metadata in Postgres
- allowed file types: PDF, DOC, DOCX
- max file size limit
- clear upload errors
- virus scanning plan or warning
- retention/deletion support

---

## 8. Admin Dashboard

Build or plan a private admin dashboard.

Route:
- /admin

Must be protected.

Dashboard sections:

- Overview
- New enquiries
- Candidates
- Applications
- Jobs/applications link
- Companies/leads
- Tasks
- Notes/activity
- Files/CVs
- Settings
- Audit log if appropriate

Admin dashboard should allow David to:

- view new enquiries
- change enquiry status
- create notes
- assign tasks
- view candidate records
- view applications
- download/view CVs securely
- update statuses
- see application history
- filter/search candidates
- filter/search applications
- see lead/company history
- export data if appropriate
- process deletion/export requests manually

Make the UI simple and non-technical.

Do not build a bloated CRM.

Build a focused recruitment operations dashboard.

---

## 9. Public Form Integration

Connect public forms to Postgres securely:

- contact form
- hiring enquiry form
- candidate enquiry form
- job application form
- CV upload form if present
- strategic interim enquiry form

Use server-side actions/API routes.

Validate with Zod or existing validation.

On submit:

- create enquiry/application/candidate record
- store consent flags
- create activity log
- send confirmation email if configured
- send admin notification if configured
- trigger analytics event only if consent allows and without PII

Never send full CV or sensitive PII to analytics.

---

## 10. Sanity Integration

Preserve Sanity.

For public jobs in Sanity:
- job detail page comes from Sanity
- application form submits to Postgres
- application stores sanityJobId
- admin dashboard can show linked Sanity job title/slug if available

For public case studies/insights/services:
- keep in Sanity
- do not move to Postgres

For site settings:
- keep existing Sanity setup
- do not duplicate unless necessary

If the admin dashboard needs to display public job info from Sanity, query Sanity read-only.

---

## 11. Environment Variables

Document all required env vars.

Likely env vars:

DATABASE_URL=
NEXTAUTH_SECRET=
AUTH_SECRET=
AUTH_URL=
ADMIN_EMAILS=
RESEND_API_KEY=
FROM_EMAIL=
SANITY_PROJECT_ID=
SANITY_DATASET=
SANITY_API_READ_TOKEN=
SANITY_API_WRITE_TOKEN=
STORAGE_PROVIDER=
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ENDPOINT=
MAX_UPLOAD_MB=
NEXT_PUBLIC_SITE_URL=

Only include what is actually used.

Never commit .env values.

Update .env.example with placeholders.

Update Railway docs with how to add env vars.

Railway docs should explain that DATABASE_URL should reference the Railway Postgres service variable where appropriate.

---

## 12. Railway Setup Instructions for David

Create docs/railway-deployment.md with exact steps.

Include:

1. Create Railway account or login.
2. Create new Railway project.
3. Connect GitHub repo.
4. Add Next.js app service.
5. Add PostgreSQL service.
6. Set DATABASE_URL on the app service from the Postgres service.
7. Add required Sanity env vars.
8. Add auth env vars.
9. Add email env vars if used.
10. Add storage env vars if used.
11. Set build command.
12. Set start command.
13. Run database migrations.
14. Deploy.
15. Check logs.
16. Open deployed app.
17. Test contact form.
18. Test job application.
19. Test admin login.
20. Test CV upload/download.
21. Add custom domain later.
22. Set production secrets properly.

If Railway CLI is available, provide commands, but also include dashboard fallback.

Example command section should be clearly labelled as “verify against current Railway CLI before running”.

Do not invent commands if not sure.

---

## 13. Migration and Seeding

Add database migration workflow.

If Prisma:
- prisma/schema.prisma
- prisma migrations
- npm script for generate
- npm script for migrate deploy
- optional seed

If Drizzle:
- schema files
- drizzle config
- migration scripts
- npm script for generate/migrate

Add scripts carefully to package.json.

Examples:

db:generate
db:migrate
db:studio
db:seed

Only add scripts that work with chosen ORM.

Run or document commands:

npm install
npm run db:generate
npm run db:migrate
npm run typecheck
npm run lint
npm run build

Do not claim success unless run.

---

## 14. Testing

Add tests or validation where practical:

- form validation tests
- admin route protection test
- database write test
- application submission test
- CV metadata test
- consent fields test
- no PII analytics test
- build test
- typecheck
- lint

Manual QA checklist:

- submit contact enquiry
- submit hiring enquiry
- submit candidate enquiry
- apply for job
- upload CV
- view admin dashboard
- update status
- add note
- add task
- view activity history
- download CV securely
- check unauthenticated admin access blocked
- check env missing behaviour
- check Railway deployment logs

---

## 15. Backups, Retention and Ops

Add operational notes.

Railway/Postgres launch checklist should include:

- database backup strategy
- retention policy
- access control
- admin account recovery
- data export process
- deletion request process
- incident response note
- file storage backup/retention
- monitoring/logging
- monthly maintenance checklist

Do not treat this as optional if CVs are being stored.

---

## 16. Important Decision Points

If the current project is not ready for this full backend, do not force it.

Instead produce a staged plan:

Stage 1:
- Railway deployment readiness
- Postgres added
- secure contact enquiries saved
- admin dashboard basic view

Stage 2:
- candidate records
- applications
- notes/statuses/tasks

Stage 3:
- secure CV uploads
- object storage
- signed URLs
- audit logs

Stage 4:
- lead history
- reporting
- automations
- email workflows
- advanced search/filtering

Stage 5:
- backups, retention, exports, deletion workflows, hardening

Recommend staging if safer.

---

## 17. Final Output Required

When finished, provide:

## Architecture Summary

- what remains in Sanity
- what moves to Postgres
- how Railway is used
- how the admin dashboard works

## Database Summary

- tables/models created
- key relationships
- migrations added
- retention/consent/audit fields

## Railway Setup Summary

- what Codex prepared
- what David must do manually
- exact env vars needed
- exact commands/dashboard steps

## Security Summary

- auth
- permissions
- CV storage
- consent
- audit logs
- rate limiting
- spam protection
- privacy risks

## Admin Dashboard Summary

- pages created
- actions supported
- what remains future work

## Sanity Compatibility Summary

- how existing CMS is preserved
- how public jobs link to private applications
- what was not changed

## Files Changed

List all files changed.

## Commands Run

List commands actually run.

## Manual Actions for David

Give a numbered checklist.

## Production Readiness

State clearly:
- ready
- partially ready
- blocked
- what blocks launch

Final principle:
Build the private operational backend properly without damaging the public CMS website.

Sanity remains the public CMS.

Railway/Postgres becomes the private business database.

No secrets in GitHub.

No public CV links.

No fake compliance.

No overbuilt CRM.

No faff.
EOF

echo ""
echo "Done. Created Railway/Postgres backend issue:"
echo "https://github.com/$REPO/issues"
