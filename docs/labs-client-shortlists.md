# Labs Client Shortlists

This records the staged passwordless client shortlist portal for Essential
Resourcing Labs.

Status: private foundation. Not live for real client use.

## Principle

Shortlists should feel premium, fast and secure.

One secure link. David-approved profiles. Clear feedback. No loose CVs. No
faff.

## Audit Result

Already in place and preserved:

- `/client/shortlist/[token]` private dynamic route
- noindex metadata
- sitemap exclusion
- hashed token helper
- expiry and revocation checks
- candidate sharing gate
- feedback and engagement tracking foundations
- WhatsApp/email David contact route
- no public candidate profile URLs
- no GA4, GTM or public analytics event from the private portal

This pass did not rebuild the portal. It tightened the feature flag alignment,
access audit trail and issue-level database views.

## Routes

Client route:

```txt
/client/shortlist/[token]
```

Admin planning route:

```txt
/admin/recruiter-labs
```

The client route is dynamic, noindexed and blocked unless the feature flag,
database, launch gate, token and candidate-sharing checks all pass.

## Feature Flags

The issue-aligned flag is:

```bash
FEATURE_CLIENT_SHORTLIST_PORTAL=false
```

The existing implementation flag is still supported:

```bash
FEATURE_CLIENT_PRESENTATION_PORTAL=false
```

Both flags point at the same route, data model and launch gate. This is a
compatibility alias, not a second portal.

Turning either flag on is not launch approval. David still needs database,
audit, CV, candidate consent and legal/privacy gates signed off.

## Data Model

Existing tables stay namespaced:

- `recruiter_lab_shortlists`
- `recruiter_lab_shortlist_candidates`
- `recruiter_lab_client_access_tokens`
- `recruiter_lab_shortlist_feedback`
- `recruiter_lab_shortlist_activity`
- `recruiter_lab_portal_engagement_events`

Existing compatibility views:

- `client_shortlists`
- `client_shortlist_candidates`
- `client_shortlist_access_tokens`
- `client_shortlist_feedback`
- `client_shortlist_activity`

Issue-aligned views added in:

```txt
database/migrations/036_labs_client_shortlists_alignment.sql
```

Views:

- `shortlist_candidates`
- `shortlist_access_tokens`
- `shortlist_feedback`
- `shortlist_activity_logs`

No raw token field is added. Token storage remains hash-only.

## Security Model

Required before candidate data appears:

- passwordless token is valid
- token hash exists
- token is not expired
- token is not revoked
- private Postgres is enabled and configured
- shortlist status is client-safe
- shortlist launch gate is approved
- client visibility timestamp exists
- candidate card is approved by David
- candidate consent is confirmed
- named sharing has a consent timestamp
- CV access is approved if CV access is required
- retention status is safe

The portal logs safe access outcomes through the audit trail:

- `recruiter_labs_access_granted`
- `recruiter_labs_access_denied`

Audit metadata avoids raw tokens, candidate names, free-text feedback and CV
content.

## Client UX

The staged page supports:

- branded private-access copy
- role context
- David's intro note
- candidate comparison cards
- strengths
- watch-outs
- salary or rate expectation
- notice period
- availability
- work preference
- profile expansion
- feedback buttons
- interview interest
- message David route

Feedback only writes when the portal, feedback flag and database gate are all
ready.

## CV Access

CV access is not live.

Before CV links exist, the build still needs:

- private object storage
- signed URL route
- malware scan process
- file type and size validation
- access audit logs
- retention and deletion handling
- legal/privacy review

No CV belongs in Sanity or `/public`.

## Dependencies

Still required before private beta:

- Railway Postgres migrated
- production audit logs proven
- candidate sharing wording approved
- client access wording approved
- private CV storage decision made
- David approval workflow tested
- mobile and keyboard QA complete

## Testing Checklist

Before any private beta:

- feature flags default false
- invalid tokens blocked
- expired tokens blocked
- revoked tokens blocked
- rate limit state works
- not-ready shortlist blocked
- route noindexed
- route absent from sitemap
- raw tokens are not stored
- raw tokens are not logged
- candidate cannot cross into another client shortlist
- candidate cards only render after sharing checks pass
- feedback writes private rows only when explicitly enabled
- audit events write granted and denied access states
- no private portal event goes to GA4 or GTM
- mobile layout has no horizontal overflow
- keyboard use works for profile details and feedback panels

## Blockers

Do not send real shortlist links until:

- David approves private beta
- Railway Postgres is live and migrated
- audit proof is visible in production
- CV access is either blocked or fully secure
- legal/privacy wording is approved
- candidate consent process is proven
- rollback and revocation process is tested

This is not legal advice. It is the technical launch gate.
