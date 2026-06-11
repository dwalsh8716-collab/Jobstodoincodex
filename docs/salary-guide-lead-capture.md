# Salary Guide Lead Capture

Audit date: 11 June 2026

## Status

Staged, not production-live by default.

The website has a dedicated `/salary-guides` route, lead-capture form, server
validation, private Postgres migrations, protected Labs preview and
email-delivery path. It stays noindexed and out of the sitemap until
`FEATURE_SALARY_GUIDE_GATE=true`.

## Audit Finding

Before this work:

- `/salary-guides` redirected to `/salary-snapshots`
- salary snapshot and public salary guide editorial content existed in Sanity
- no gated salary guide form existed
- no private `salary_guide_leads` table existed
- `FEATURE_SALARY_GUIDE_GATE=false` already existed as the right safety switch
- docs already said private lead records should not live in Sanity

No duplicate salary guide form was found.

The private Labs report for this feature now lives at
`/admin/labs/salary-guides`, with implementation notes in
`docs/labs-salary-guides.md`.

## What The Flow Does

When the feature is enabled and the operations database is ready:

1. The visitor submits the salary guide form.
2. The server validates the payload.
3. Honeypot, completion-time and rate-limit checks run.
4. The lead is stored in private Railway Postgres.
5. Contact and optional marketing consent are recorded separately.
6. A follow-up task and activity are created for David.
7. David is notified through Resend if email is configured.
8. The requester receives the guide link if `SALARY_GUIDE_DOWNLOAD_URL` is
   configured.
9. A safe confirmation page is shown.

The form does not send names, emails, phone numbers, companies or free-text
notes to analytics.

## Required Environment Variables

```bash
FEATURE_SALARY_GUIDE_GATE=false
OPERATIONS_DB_ENABLED=false
DATABASE_URL=
RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=
SALARY_GUIDE_DOWNLOAD_URL=
```

Keep the feature flag `false` until the guide, database, email delivery and
privacy wording have been approved.

## Data Boundary

Sanity may store public salary guide editorial content.

Private lead data belongs only in Railway Postgres:

- name
- guide id / guide slug
- company
- email
- optional job title
- optional phone
- hiring interest
- source page
- UTM source, medium and campaign
- lead status
- consent records
- delivery status
- hashed request metadata

No download token, raw lead record or private follow-up note belongs in Sanity.

## Manual Launch Gates

David must approve:

- final salary guide content or PDF
- `SALARY_GUIDE_DOWNLOAD_URL`
- privacy and cookie wording
- whether Resend is the approved email provider
- Railway Postgres production database and migrations
- who can access salary guide leads
- retention period for salary guide leads
- whether any extra anti-spam provider is needed

No reCAPTCHA, Turnstile or paid lead tool has been added.

## QA Checklist

Before launch:

- `FEATURE_SALARY_GUIDE_GATE=false` keeps the form disabled
- `/salary-guides` is noindexed
- `/salary-guides` is absent from `sitemap.xml`
- `/admin/labs/salary-guides` is protected and noindexed
- enabling the flag adds `/salary-guides` to the sitemap
- invalid submissions return safe messages
- honeypot submissions are rejected
- too-fast submissions are rejected
- repeated submissions are rate-limited
- valid submissions write to `salary_guide_leads`
- consent writes to `consent_records`
- David notification sends only when Resend is configured
- requester delivery sends only when `SALARY_GUIDE_DOWNLOAD_URL` is configured
- analytics event contains only non-identifying properties
- the page works on mobile and keyboard-only navigation

## Recommendation

Launch the page only after the guide asset and privacy wording are approved.
The code is now ready for a controlled switch-on, not a blind public release.
