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

gh label create "candidate-trust" \
  --repo "$REPO" \
  --color "0E8A16" \
  --description "Candidate journey, trust and application experience" 2>/dev/null || true

gh label create "gdpr" \
  --repo "$REPO" \
  --color "D93F0B" \
  --description "Privacy, consent, retention and GDPR-related requirements" 2>/dev/null || true

gh label create "cv-uploads" \
  --repo "$REPO" \
  --color "1D76DB" \
  --description "CV upload, storage and application handling" 2>/dev/null || true

gh label create "email-automation" \
  --repo "$REPO" \
  --color "FBCA04" \
  --description "Confirmation emails, notifications and user follow-up" 2>/dev/null || true

gh label create "security" \
  --repo "$REPO" \
  --color "5319E7" \
  --description "Security, private data handling and access control" 2>/dev/null || true

gh label create "audit-first" \
  --repo "$REPO" \
  --color "C5DEF5" \
  --description "Inspect current implementation before changing anything" 2>/dev/null || true

TITLE="CANDIDATE TRUST: GDPR journey, CV consent, private storage and application confirmations"

if gh issue list --repo "$REPO" --state all --search "$TITLE in:title" --json title --jq '.[].title' | grep -Fxq "$TITLE"; then
  echo "Issue already exists: $TITLE"
  echo "Open issues here: https://github.com/$REPO/issues"
  exit 0
fi

echo "Creating candidate trust/GDPR issue..."

gh issue create \
  --repo "$REPO" \
  --title "$TITLE" \
  --label "priority: critical,candidate-trust,gdpr,cv-uploads,email-automation,security,audit-first" \
  --body-file - <<'EOF'
# Candidate Trust: GDPR Journey, CV Consent, Private Storage and Application Confirmations

## Critical Context

Essential Resourcing will handle candidate enquiries, job applications, CV uploads and potentially private candidate records.

This means the candidate journey must feel trustworthy, clear and professionally handled.

The goal is not just legal checkbox compliance.

The goal is that candidates understand:

- what happens when they apply
- what happens to their CV
- how their data is stored
- how long their data may be kept
- who can access it
- how they can ask for deletion or export
- how David will contact them
- what the next step is after applying

Do not rebuild blindly.

Audit first.

Preserve what works.

Do not fake legal compliance.

Do not expose CVs publicly.

Do not store sensitive candidate data in analytics.

Do not send private candidate data to Sanity unless there is a clear and secure reason.

Sanity should remain the public CMS.

Railway/Postgres, if implemented, should be used for private candidate/application records.

---

## 1. Audit Current Candidate Journey

Audit the existing site for:

- Jobs listing page
- Job detail pages
- Candidate contact route
- Candidate enquiry form
- Job application form
- CV upload flow, if present
- Contact page candidate option
- Footer candidate links
- Privacy Policy
- Cookie Policy
- Candidate Privacy Notice, if present
- Consent checkboxes
- Form validation
- Confirmation messages
- Confirmation emails
- Admin notification emails
- Storage of candidate data
- Any database/Postgres models
- Any Sanity candidate/application storage
- Any file upload handling
- Any analytics events that may include PII
- Any public URLs for uploaded files
- Any admin dashboard candidate/application views

Report:

- what exists
- what is missing
- what is risky
- what should be improved
- what requires legal review
- what requires manual setup

---

## 2. Candidate Privacy Notice

Create or improve a Candidate Privacy Notice.

This should be separate from or clearly linked within the main Privacy Policy.

Suggested route:

/candidate-privacy

Or if legal pages are grouped:

/privacy/candidate-privacy

The Candidate Privacy Notice should explain in plain English:

- who Essential Resourcing is
- what candidate data may be collected
- why candidate data is collected
- how candidate data is used
- who may receive candidate data
- how CVs and applications are handled
- how long candidate data may be kept
- how candidates can ask for deletion
- how candidates can ask for a copy/export
- how candidates can withdraw consent
- how to contact David
- that final legal wording needs legal review before launch

Important:
Use placeholder/legal-review wording where needed.

Do not pretend final legal compliance has been approved.

Tone:
Clear, calm, trustworthy, plain English.

No legal waffle.

No scare tactics.

---

## 3. Data Retention Statement

Add a clear candidate data retention statement.

This should appear:

- in the Candidate Privacy Notice
- near CV upload/application forms
- in the application confirmation message/email if appropriate
- in admin documentation

Suggested plain-English draft to adapt:

“We’ll only keep your details for as long as there is a genuine recruitment reason to do so. If you apply for a role or send us your CV, we may keep your details so we can contact you about relevant opportunities. You can ask us to delete your details at any time.”

Add a legal review note.

If Postgres exists or is being added, include retention fields such as:

- consentToStoreData
- consentTimestamp
- dataRetentionUntil
- deleteRequestedAt
- deletedAt
- deletionReason

Do not over-engineer if the backend is not ready.

Stage it if needed.

---

## 4. CV Upload Consent

Any CV upload or application form must include clear consent.

Add or improve checkbox wording.

Candidate should actively confirm:

- they are happy for Essential Resourcing to receive and review their CV/application
- they understand David may contact them about the role or relevant opportunities
- they understand they can ask for their data to be deleted
- they confirm they have read the Candidate Privacy Notice

Example checkbox wording:

“I’m happy for Essential Resourcing to store and use my details to contact me about this role and relevant opportunities. I understand I can ask for my details to be deleted at any time.”

Add a separate optional marketing/newsletter consent only if needed.

Do not bundle marketing consent with application consent.

Do not pre-tick consent boxes.

Do not block essential application submission with unnecessary marketing consent.

---

## 5. Clear Explanation of What Happens After Applying

Improve the application journey so candidates know what happens next.

Add a short “What happens next?” block to:

- job detail pages
- application form
- application confirmation screen
- application confirmation email

Suggested structure:

1. David reviews your application.
2. If it looks like a possible fit, he’ll contact you directly.
3. Your details are handled privately and only used for recruitment purposes.
4. You can ask for your details to be deleted at any time.

Tone should be human:

“No black hole. No nonsense. If it looks relevant, David will come back to you.”

Use this carefully and honestly.

Do not promise a response to every applicant unless David wants that operationally.

---

## 6. Private CV Storage

Audit and improve CV storage.

Hard rules:

- Do not store CVs in public folders.
- Do not expose public CV URLs.
- Do not commit uploaded files to GitHub.
- Do not send CVs to analytics.
- Do not store CVs in Sanity unless there is a deliberate private storage decision.
- Do not email full CV attachments around unnecessarily unless explicitly required.
- Do not store binary CV files directly in Postgres unless there is a strong documented reason.

Preferred approach:

- Store CV metadata in Postgres.
- Store actual CV files in private object storage.
- Access CVs through signed URLs or authenticated admin download routes.
- Restrict file types to PDF, DOC and DOCX.
- Restrict max file size.
- Add virus scanning plan or explicit manual warning.
- Add retention/deletion support.

If the secure file storage layer is not ready, do not build a fake unsafe upload.

Instead:
- stage the implementation
- allow enquiry without CV upload
- or use a secure temporary provider if approved

---

## 7. No Public CV Links

Add safeguards so no CV upload produces a public searchable URL.

Check:

- sitemap does not include uploaded files
- robots.txt is not relied on for privacy
- uploaded files are not placed in /public
- uploaded files are not accessible without auth
- admin-only downloads require authentication
- URLs expire if using signed links
- file names do not expose unnecessary PII where possible

---

## 8. Candidate Data in Database

If Railway/Postgres backend exists or is being built, make sure candidate/application records include the right privacy fields.

Candidate/application records should support:

- source
- consentToStoreData
- consentTimestamp
- privacyNoticeVersion
- dataRetentionUntil
- deleteRequestedAt
- deletedAt
- status
- notes
- activity history
- linked CV metadata
- linked job/application
- audit logs for sensitive changes

If the database is not yet implemented, document this as a required dependency for the Railway/Postgres backend issue.

Do not duplicate candidate data between Sanity and Postgres.

---

## 9. Application Confirmation Email

Add or prepare application confirmation email.

Use the current email provider if already configured.

If Resend or another transactional email provider is not configured, prepare the template and document required env vars.

Do not hardcode secrets.

Email should include:

Subject examples:
- “Thanks for applying through Essential Resourcing”
- “We’ve received your application”
- “Your application has been received”

Email body should say:

- application received
- role title if available
- David will review it
- what happens next
- link to Candidate Privacy Notice
- how to request deletion
- contact email/WhatsApp if appropriate
- no unrealistic promise of guaranteed response

Tone:
Warm.
Clear.
Professional.
Human.
No recruitment nonsense.

Also create admin notification email if appropriate:

- new application received
- candidate name
- role title
- link to admin record
- do not include full CV attachment unless deliberately approved
- avoid exposing sensitive data unnecessarily

---

## 10. Candidate Confirmation Screen

After application submission, show a clear confirmation screen.

Include:

- confirmation that the application was received
- what happens next
- privacy/data handling reassurance
- link to Candidate Privacy Notice
- optional WhatsApp link for urgent questions
- return to jobs or insights link

Avoid vague “Thanks, we’ll be in touch” only.

---

## 11. Candidate Rights: Delete / Export Request

Add a clear route for candidates to request deletion or export.

This can be simple at first.

Options:

- add instructions in Candidate Privacy Notice
- add mailto link
- add form option: “Request deletion/export of my data”
- add admin dashboard status if Postgres exists

Suggested copy:

“To ask for a copy of your details or request deletion, email David at [configured email].”

If Postgres/admin dashboard exists, add fields or workflow:

- deleteRequestedAt
- exportRequestedAt
- requestStatus
- completedAt
- internal notes

Do not build a complex self-service portal unless explicitly required.

---

## 12. Admin Dashboard Candidate Trust Requirements

If there is or will be an admin dashboard, ensure David can:

- view candidate/application consent status
- see when consent was given
- see privacy notice version if stored
- update candidate status
- add notes
- see linked CV metadata
- securely download CVs
- mark deletion requested
- mark record archived/deleted
- see audit history for sensitive actions

Do not show candidate data to unauthenticated users.

Do not expose admin pages publicly.

---

## 13. Analytics and Tracking Safeguards

Audit analytics events around candidate/application forms.

Rules:

- No candidate names in analytics
- No email addresses in analytics
- No phone numbers in analytics
- No CV filenames in analytics if filenames include names
- No cover letters/messages in analytics
- No sensitive role/candidate data in event properties

Allowed events:

- application_started
- application_submitted
- candidate_enquiry_submitted
- cv_upload_started
- cv_upload_completed
- cv_upload_failed

Allowed properties:

- page_path
- job_slug
- job_category
- source
- form_type
- consent_state if appropriate and non-identifying

Respect consent mode and cookie consent.

---

## 14. Legal Pages and Documentation

Create or update:

- Candidate Privacy Notice page
- Privacy Policy references
- Cookie Policy references if relevant
- docs/candidate-data-journey.md
- docs/cv-storage-and-retention.md if CV upload/storage is implemented

Documentation should explain:

- candidate journey
- data collected
- where data is stored
- how CVs are stored
- how to delete/export data
- how retention is handled
- what remains manual
- what needs legal review

---

## 15. UX and Design Requirements

The candidate trust layer should feel polished and reassuring.

Add trust content without making the application flow heavy.

Keep forms:

- clear
- short where possible
- accessible
- mobile-friendly
- plain English
- not intimidating

Use small trust notes near sensitive fields.

Example:

“Your CV is handled privately and only used for recruitment purposes.”

“Need this removed later? Just ask.”

Do not overdo legal copy on the form.

Link to full policy instead.

---

## 16. Testing

Test:

- candidate privacy page renders
- links to candidate privacy page work
- application form requires active consent where appropriate
- marketing consent is optional if present
- CV upload rejects unsupported files
- CV upload rejects oversized files
- CVs are not publicly accessible
- application confirmation screen works
- application confirmation email is prepared/sent if provider exists
- admin notification email is prepared/sent if provider exists
- candidate data is not sent to analytics
- unauthenticated users cannot access candidate/admin records
- sitemap does not expose private upload URLs
- no PII appears in client logs
- npm run lint
- npm run typecheck
- npm run build

Do not claim commands passed unless they actually passed.

---

## 17. Staged Implementation If Needed

If the Railway/Postgres backend or secure storage is not ready, implement this safely in stages.

Stage 1:
- Candidate Privacy Notice
- consent wording
- application confirmation screen copy
- documentation
- no unsafe CV upload

Stage 2:
- secure database records
- application confirmation email
- admin notification
- consent fields

Stage 3:
- private CV object storage
- signed admin download
- retention/delete/export workflow
- audit logs

Stage 4:
- admin dashboard candidate trust workflow
- reporting
- data retention automation

Do not force a risky full implementation.

---

## 18. Final Output Required

When finished, report:

## Audit Summary
- what already existed
- what was missing
- what was risky
- what was improved

## Candidate Journey Summary
- what candidates see before applying
- what they consent to
- what happens after applying
- how they request deletion/export

## Privacy/GDPR Summary
- Candidate Privacy Notice status
- consent wording added
- retention statement added
- legal review items

## CV Storage Summary
- how CVs are handled
- whether storage is private
- whether signed URLs/admin-only access are used
- any remaining storage risks

## Email Summary
- confirmation email status
- admin notification status
- env vars required

## Analytics Safety Summary
- events added/changed
- PII safeguards
- consent compatibility

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
Candidates should feel safe, informed and respected.

CVs must be private.

Consent must be clear.

Data retention must be thought through.

No fake compliance.

No public CV links.

No PII in analytics.

No faff.
EOF

echo ""
echo "Done. Created candidate trust/GDPR issue:"
echo "https://github.com/$REPO/issues"
