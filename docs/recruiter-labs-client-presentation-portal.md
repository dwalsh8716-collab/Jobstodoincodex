# Recruiter Labs Client Presentation Portal

This is the private, feature-flagged magic-link portal for future client
shortlists.

It replaces messy CV attachment chains with one branded review link, but only
when the database, consent, audit and privacy gates are ready.

Current status: staged foundation. Not live for real clients.

Shortlist-specific launch notes for issue `#63` live in:

```txt
docs/labs-client-shortlists.md
```

## Route Structure

Client route:

```txt
/client/shortlist/[token]
```

Admin route:

```txt
/admin/recruiter-labs
```

The client route is:

- dynamic
- noindexed
- excluded from sitemap, RSS and AI index routes
- feature-gated by `FEATURE_CLIENT_SHORTLIST_PORTAL` or
  `FEATURE_CLIENT_PRESENTATION_PORTAL`
- blocked when the private operations database is disabled
- blocked for invalid, expired, revoked or not-ready links

## Feature Flags

Keep these off until David approves private beta:

```bash
FEATURE_CLIENT_PRESENTATION_PORTAL=false
FEATURE_CLIENT_SHORTLIST_PORTAL=false
FEATURE_SHORTLIST_FEEDBACK_TRACKING=false
FEATURE_INTERVIEW_REQUEST_WORKFLOW=false
FEATURE_BRANDED_CANDIDATE_PROFILES=false
```

The portal can only read private data when:

- `FEATURE_CLIENT_PRESENTATION_PORTAL=true`
  or `FEATURE_CLIENT_SHORTLIST_PORTAL=true`
- `OPERATIONS_DB_ENABLED=true`
- `DATABASE_URL` is configured
- the shortlist launch gate is approved
- the token is valid, unexpired and not revoked

## Database Model

The live implementation keeps the namespaced Recruiter Labs tables and exposes
compatibility views for the plain-English issue model.

Core tables:

- `recruiter_lab_shortlists`
- `recruiter_lab_shortlist_candidates`
- `recruiter_lab_client_access_tokens`
- `recruiter_lab_shortlist_feedback`
- `recruiter_lab_shortlist_activity`
- `recruiter_lab_portal_engagement_events`

Compatibility views:

- `client_shortlists`
- `client_shortlist_candidates`
- `client_shortlist_access_tokens`
- `client_shortlist_feedback`
- `client_shortlist_activity`

Important additions in
`database/migrations/032_recruiter_labs_client_presentation_portal_alignment.sql`:

- client contact and related job links on shortlists
- role title, role summary and David intro note
- candidate profile references
- presentation status
- strengths and watch-outs
- salary, rate, notice, availability, location and working preference fields
- explicit feedback fields for action, comment, interview request and next action
- private shortlist activity table

No raw token field is added.

## Client Experience

The portal shows:

- Essential Resourcing branding
- private-access state copy
- role title and context
- David intro note
- link expiry note
- candidate cards
- View profile details
- strengths and watch-outs
- package, rate, notice, availability, location and working preference where set
- Shortlist, Interested, Maybe, Need More Information, Decline and Request
  Interview actions
- message David option
- security/access notes

Candidate cards only render after server-side sharing checks pass.

## Magic-Link Security

Implemented/staged:

- high-entropy token generation
- SHA-256 token hashing
- hashed token storage only
- expiry required
- revoked links fail closed
- route-level rate limiting
- shortlist-scoped lookup
- optional client-contact scoping
- no token in sitemap
- no token in marketing analytics
- no raw token in migrations
- no public candidate profile URL
- last-used timestamp update when a valid token is read

Still required before real client use:

- Railway Postgres live and migrated
- production audit-log proof
- operational monitoring
- legal/privacy review
- signed private CV access if CVs are enabled

## Admin Flow

The private admin page now maps the intended workflow:

1. Create shortlist.
2. Select candidate profiles.
3. Review summaries and watch-outs.
4. Generate magic link.
5. Copy or send link manually.
6. Revoke access when needed.
7. Review feedback and tasks.

Sending stays manual until David approves templates, consent boundaries and
CRM/WhatsApp/email handling.

## Feedback And Activity

Feedback actions write to private Postgres when both portal and feedback flags
are on:

- Shortlist
- Interested
- Maybe
- Decline
- Request Interview
- Need More Information

Each accepted action is designed to:

- create a feedback row
- update candidate feedback status
- create a generic activity
- create a portal-specific shortlist activity
- create an admin task where useful
- create an interview request for Request Interview

No GA4, GTM or public analytics event is used for private portal actions.

## Candidate Data Rules

The portal must not show candidate data unless:

- David has approved the candidate card
- candidate consent is confirmed
- named sharing has a sharing-consent timestamp
- CV access is approved where required
- retention status is safe
- shortlist status and launch gate are client-safe

If any check fails, the candidate is withheld.

## CV Access

CV access is not live.

Before CV links are allowed, the site still needs:

- private object storage
- signed access URLs
- malware scanning
- file type and size validation
- retention/deletion handling
- audit logs for view/download
- legal/privacy review

No CV belongs in Sanity or `/public`.

## Testing Checklist

Before private beta:

- feature hidden when flag off
- invalid token blocked
- expired token blocked
- revoked token blocked
- not-ready shortlist blocked
- route noindexed
- sitemap excludes `/client/shortlist`
- token hash stored, raw token not stored
- client sees only scoped shortlist
- client cannot access other candidates
- feedback writes private rows
- interview request creates private request row
- admin task created for useful follow-up
- no PII/token in GA4/GTM
- private engagement writes to Postgres only
- mobile layout has no horizontal overflow
- keyboard access works for feedback panels and profile details

## Blockers

Do not send real client links until:

- Railway Postgres is live and migrated
- David has approved private beta
- candidate consent wording is approved
- client access wording is approved
- CV storage/access is either blocked or fully secure
- audit logs are proven in production
- privacy/legal review is complete

This is not legal advice. It is the technical launch gate.

## Engineering View

Best next step after database launch: build the private admin create/edit UI for
shortlists and candidate ordering.

Do not build public profile URLs. Do not send CV dumps. Do not add candidate
scoring. Do not push private portal events into marketing analytics.

One secure link. David-approved profiles. Fast feedback. No faff.
