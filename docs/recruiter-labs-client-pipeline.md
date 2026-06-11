# Recruiter Labs Client Pipeline

Recruiter Labs is the private foundation for a future branded shortlist and
candidate presentation workflow.

It is not live. It is not public. It must not expose candidate data, CV links or
client feedback until the security model is complete.

## Product Vision

The future workflow:

1. David creates a private shortlist in admin.
2. Candidate data stays in Postgres/private storage.
3. Branded profile drafts are prepared.
4. AI may help draft wording, but David verifies every client-facing summary.
5. The client receives one secure magic link.
6. The client reviews candidate cards without creating an account.
7. Feedback is captured as Shortlist, Decline, Maybe, Need More Info or Request
   Interview.
8. Feedback and access events are audit logged.
9. Interview scheduling can later connect to WhatsApp Business and Google
   Calendar/Meet.

## Current Implementation

Staged now:

- protected route: `/admin/recruiter-labs`
- server-side feature flags
- private Postgres migration: `006_recruiter_labs_foundation.sql`
- launch-gate hardening migration: `007_recruiter_labs_launch_gate.sql`
- server-side launch-gate, token and candidate sharing decision helpers
- admin launch-gate visibility inside `/admin/recruiter-labs`
- hashed-token table for future magic links
- no public client portal route
- no public candidate URLs
- no sitemap, RSS or AI-index inclusion
- no client-side private flags

## Feature Flags

```bash
FEATURE_RECRUITER_LABS_ENABLED=false
FEATURE_CLIENT_PRESENTATION_PORTAL=false
FEATURE_BRANDED_CANDIDATE_PROFILES=false
FEATURE_SHORTLIST_FEEDBACK_TRACKING=false
FEATURE_INTERVIEW_REQUEST_WORKFLOW=false
FEATURE_WHATSAPP_INTERVIEW_SCHEDULING=false
FEATURE_GOOGLE_MEET_INTERVIEW_SCHEDULING=false
FEATURE_AI_CANDIDATE_SUMMARIES=false
```

These are server-side flags. They are not public launch switches.

## Route Strategy

Admin planning:

```txt
/admin/recruiter-labs
```

Future client access, not built yet:

```txt
/client/shortlist/[token]
```

The future client route must have:

- valid token required
- token stored as a hash only
- expiry required
- revocation supported
- shortlist scope enforced
- no token in analytics
- no token in logs
- noindex metadata
- no sitemap inclusion

## Sanity And Postgres Boundary

Sanity is for public website content only.

Postgres/private backend is for:

- candidates
- applications
- CV metadata
- shortlists
- client contacts
- shortlist feedback
- interview requests
- audit logs
- WhatsApp message references
- Google Calendar event references

Candidate PII, CV text and private client feedback must not go into Sanity.

## Database Foundation

Migration `006_recruiter_labs_foundation.sql` stages:

- `recruiter_lab_shortlists`
- `recruiter_lab_shortlist_candidates`
- `recruiter_lab_client_access_tokens`
- `recruiter_lab_shortlist_feedback`
- `recruiter_lab_interview_requests`

Important:

- access tokens are stored as `token_hash`, not raw tokens
- candidate profile snapshots stay in Postgres, not Sanity
- shortlist launch status starts as `blocked`
- candidate sharing needs consent, retention clearance, CV permission where
  needed and David approval
- interview references are metadata only until integrations are approved
- no automated deletion or public sharing is added by this migration

Launch gate detail lives in:

```txt
docs/recruiter-labs-client-pipeline-launch-gate.md
```

## Required Dependencies

Before any client portal goes live:

- Railway Postgres live and migrated
- admin authentication configured
- private CV storage approved
- candidate consent model signed off
- Candidate Privacy Notice reviewed
- audit logging live
- DSAR workflow live
- data retention policy reviewed
- WhatsApp Business API configured and approved if used
- Google Calendar/Meet booking configured and approved if used
- no PII in analytics

## Build Phases

1. Private foundation: flags, docs, route and schema.
2. Shortlist admin CRUD behind `/admin`.
3. Candidate profile draft workflow with David approval.
4. Magic-link route with hashed token validation.
5. Feedback capture and audit logging.
6. Interview request workflow.
7. WhatsApp and Google scheduling only after approval.
8. AI-assisted drafts only with human verification and no automated candidate
   evaluation.

## Launch Gate

Do not launch until:

- unauthenticated access is blocked
- expired/revoked token access fails
- no token appears in logs or analytics
- no public route appears in sitemap
- client-facing pages are noindexed
- candidate consent is recorded
- David has approved every profile
- audit logs record access and feedback
- retention rules cover shortlist data
- legal/privacy review is complete

David stays in control. No public CV links. No fake automation. No faff.
