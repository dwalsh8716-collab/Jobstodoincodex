# Recruiter Labs Client Pipeline Roadmap

## Status

Private roadmap.

This is not live client functionality. It is a product build plan for the
Recruiter Labs client presentation and scheduling pipeline.

This is technical implementation guidance, not legal advice.

## What This Covers

The programme covers:

- magic-link client presentation portal
- branded candidate profiles
- CV formatting and text extraction
- AI-assisted, David-verified summaries
- client feedback buttons
- private portal engagement tracking
- database sync
- interview request workflow
- WhatsApp scheduling
- Google Calendar and Meet integration
- launch gate

Final rule:

Build it like a product. Hide it like a secret. Test it like it matters.

Launch only when safe.

No faff.

## Audit Snapshot

The repo already has a strong private foundation. Do not rebuild it blindly.

Already staged:

- server-side Recruiter Labs feature flags, all defaulting to `false`
- protected admin route at `/admin/recruiter-labs`
- noindexed staged client route at `/client/shortlist/[token]`
- `/client` blocked in `robots.txt`
- client routes excluded from sitemap, RSS and AI index routes
- hashed-token helper and token expiry logic
- client portal invalid, expired, revoked, disabled, rate-limited and
  not-ready states
- candidate share decision checks for consent, David approval, CV access and
  retention status
- private Postgres migrations for shortlist, candidate profile, feedback,
  interview request, engagement, audio-note and retained-search foundations
- private feedback action model with structured decline reasons
- portal engagement tracking staged for private Postgres, not GA4
- WhatsApp Business safety layer and logistics templates staged off
- AI governance, launch gate and draft-summary boundaries
- David's Take audio-note metadata staged off
- retained search dashboard foundation staged as aggregate-only
- launch gate documentation in
  `docs/recruiter-labs-client-pipeline-launch-gate.md`

Still not safe:

- real client shortlist links
- real CV access
- real client feedback capture
- real WhatsApp sends
- Google Calendar or Meet event creation
- AI summaries built from real candidate data
- any client-facing profile that David has not approved

The correct move now is to continue from the foundation, not start another
parallel system.

## Product Principles

- David stays in control.
- Candidate and client data stay private.
- Sanity is for public website content only.
- Postgres/private storage is for candidate, client, CV, feedback and audit
  records.
- Every client-facing candidate profile must be approved by David.
- AI can draft, tidy and structure. It must not rank, reject or score
  candidates.
- WhatsApp and Google scheduling are operational tools, not marketing toys.
- Feature flags are safety switches, not approval.
- No public CV links.
- No secrets in GitHub.
- No private data in GA4, GTM, Sanity or public logs.

## Build Order

| Phase | Name | Current state | Build next | Dependencies | Codex reasoning |
| --- | --- | --- | --- | --- | --- |
| 1 | Private foundation | Staged | Keep flags server-side, keep routes noindexed, keep launch gate visible in admin, keep data-boundary docs current. | Admin auth, feature flags, data-boundary rules. | Medium is fine for docs. Use high for route/auth changes. |
| 2 | Branded candidate profiles | Part-staged | Build manual profile builder, profile versioning, approval state, profile preview and consent warnings. | Postgres, candidate consent wording, David approval workflow. | High. Candidate data and client-facing copy are involved. |
| 3 | Client shortlist portal | Staged route only | Build shortlist CRUD, candidate selection, hashed magic-link creation, revoke flow and sample portal using fake data first. | Railway Postgres, audit log, token expiry, noindex proof. | High. Magic links and private data need careful work. |
| 4 | Feedback and engagement | Part-staged | Capture structured feedback, dwell-time basics, admin activity timeline and follow-up tasks in private Postgres. | Portal access, audit logging, retention rules, privacy wording. | High. Do not leak PII or infer candidate quality from dwell time. |
| 5 | CV access | Blocked | Add signed/private CV viewing and download only after storage and legal/privacy sign-off. | Private object storage, signed URLs, CV permission, audit logs. | High. This is privacy-critical. |
| 6 | Interview request workflow | Part-staged | Let clients request interviews from the portal, then require David/admin approval before anything is sent. | Feedback workflow, candidate preferences, admin task model. | High. Avoid accidental commitments. |
| 7 | WhatsApp scheduling | Safety layer staged | Add approved operational templates, availability prompts and message-reference logs only after Meta/WhatsApp approval. | WhatsApp Business API, template approval, opt-out wording, candidate consent. | High. External messaging and consent are involved. |
| 8 | Google Calendar and Meet | Blocked | Start with manual fallback, then create draft calendar events only after OAuth, scopes and approval are clear. | Google OAuth, calendar permissions, Meet policy, David approval. | High. Do not hardcode credentials or auto-create meetings. |
| 9 | AI assistance | Governed, staged off | Add CV text extraction and AI draft summaries only with redaction, prompt versioning and David review. | AI provider approval, candidate consent, retention, no-ranking policy. | High. Real candidate data must stay blocked until governance passes. |
| 10 | Private beta | Not started | Test with dummy data and one internal sample shortlist. Prove token, audit, consent, noindex, rollback and retention behaviour. | Phases 1 to 9 ready enough for synthetic/private testing. | High. This is the final safety rehearsal. |
| 11 | Real-client launch | Blocked | Enable only the exact approved flags for a named private beta or launch cohort. | Legal/privacy review, David approval, production audit proof. | High. No shortcuts. |

## Dependencies

Required before private beta:

- Railway Postgres live and migrated
- `OPERATIONS_DB_ENABLED=true`
- `DATABASE_URL` configured in Railway, not committed
- `OPERATIONS_PRIVACY_SALT` configured in Railway, not committed
- CMS/admin gate reviewed
- audit logging visible in admin
- candidate consent wording drafted and reviewed
- Candidate Privacy Notice reviewed
- retention rules reviewed
- DSAR workflow tested
- noindex and sitemap exclusion tested
- rollback process rehearsed

Required before real client launch:

- private CV storage approved and implemented
- signed or authenticated CV access routes
- CV view/download audit events
- real candidate sharing consent recorded
- client access terms reviewed
- retention periods approved
- WhatsApp templates approved if WhatsApp is used
- Google OAuth/scopes approved if Calendar or Meet is used
- AI provider, DPA, prompt rules and human review flow approved if AI is used
- David signs off the exact feature flags to turn on

## Safe To Build Now

Safe now, provided it stays private and feature-flagged:

- documentation and roadmap alignment
- schema/model drafts
- admin-only planning screens
- manual candidate profile builder using fake or approved sample data
- profile approval workflow
- profile versioning
- hashed magic-link architecture
- revoke and expiry flows
- feedback data model
- structured feedback buttons
- admin activity timeline
- launch gate status panel
- private beta checklist
- tests for noindex, sitemap exclusion, token states and audit sanitisation

Safe public improvements:

- none for this issue.

This issue should not add a public widget, public portal link or public candidate
profile.

## Blocked Items

Do not go live with these until the listed approvals exist:

- real client shortlist links
- real CV access
- signed CV download links
- WhatsApp Business sends
- WhatsApp message logging beyond safe metadata
- Google Calendar event creation
- Google Meet link generation
- AI-generated summaries from real candidate data
- automatic candidate ranking, scoring, rejection or recommendation
- real client sharing
- automated notifications

Blocked because:

- candidate consent wording is not legally signed off
- private CV storage is not live
- audit proof depends on production Postgres
- WhatsApp templates need approval
- Google OAuth and scopes need approval
- AI provider and review workflow need approval
- David must approve the exact private beta before any client gets access

## Data Boundaries

Sanity may hold:

- public pages
- public services
- public jobs
- public insights
- public site settings

Sanity must not hold:

- candidate PII
- raw CV text
- client feedback
- shortlist records
- magic-link tokens
- WhatsApp message bodies
- interview notes
- AI candidate drafts
- audit metadata

Private Postgres/private storage should hold:

- candidates
- applications
- CV metadata
- shortlists
- candidate profile snapshots
- client access tokens as hashes
- feedback
- engagement events
- interview requests
- WhatsApp message references
- Google Calendar references
- audit logs
- retention and DSAR records

## Feature Flag Order

Keep all flags off by default.

Suggested enablement order for private testing only:

1. `FEATURE_RECRUITER_LABS_ENABLED`
2. `FEATURE_BRANDED_CANDIDATE_PROFILES`
3. `FEATURE_CLIENT_SHORTLIST_PORTAL` or `FEATURE_CLIENT_PRESENTATION_PORTAL`
4. `FEATURE_SHORTLIST_FEEDBACK_TRACKING`
5. `FEATURE_INTERVIEW_REQUEST_WORKFLOW`
6. `FEATURE_WHATSAPP_INTERVIEW_SCHEDULING`
7. `FEATURE_GOOGLE_MEET_INTERVIEW_SCHEDULING`
8. `FEATURE_AI_CANDIDATE_SUMMARY_DRAFTS`

Do not turn on later flags just because an earlier flag works. Each flag needs
its own approval, evidence and rollback route.

## Private Beta Checklist

Before private beta:

- use dummy data first
- use one internal sample shortlist before any real client
- confirm unauthenticated `/admin/recruiter-labs` redirects
- confirm `/admin/recruiter-labs` is noindexed
- confirm `/client/shortlist/[token]` is noindexed
- confirm `/client` is blocked in `robots.txt`
- confirm no client URL appears in `sitemap.xml`
- test invalid token
- test expired token
- test revoked token
- test rate-limited token attempts
- test valid token using dummy records only
- confirm raw tokens are not written to audit logs
- confirm candidate sharing is blocked without consent
- confirm candidate sharing is blocked without David approval
- confirm candidate sharing is blocked when retention status is unsafe
- confirm feedback stays in private Postgres
- confirm private engagement is not sent to GA4 or GTM
- confirm feedback creates a private task/activity where database support exists
- confirm rollback revokes access
- test mobile layout
- test keyboard-only use
- review screen reader labels on client actions
- run `npm run typecheck`
- run `npm run lint`
- run `npm run build`

## Real-Client Launch Checklist

Before any real client sees it:

- David approves the named client/test cohort
- legal/privacy review is complete
- Candidate Privacy Notice is updated
- client access terms are updated
- retention rules are documented
- DSAR process covers shortlist records
- production Postgres migrations have run
- audit logging is visible in production
- private CV storage is live if CV access is included
- signed/authenticated CV access is tested if CV access is included
- CV view/download audit events are tested
- WhatsApp templates are approved if WhatsApp is included
- WhatsApp opt-out and candidate preference handling is tested
- Google OAuth and scopes are approved if Calendar/Meet is included
- AI provider and DPA are approved if AI is included
- AI output stays draft until David approves it
- no raw prompts, CV text or candidate notes are exposed to clients
- no candidate PII goes to analytics
- rollback has been rehearsed
- every enabled feature flag is listed in the launch note

## Suggested GitHub Issue Order

Work in this order:

1. `#75` Recruiter Labs roadmap. Finish the map before building more.
2. `#69` Magic-link client presentation portal for shortlists.
3. `#70` Branded candidate profile builder from CV/application data.
4. `#71` Client feedback, dwell-time and portal engagement sync.
5. `#72` Interview request workflow from the client portal.
6. `#73` WhatsApp, Google Calendar and Meet interview orchestration.

Do not jump to scheduling before the portal, profile and feedback foundations
are safe. Scheduling is not the product; it is the final operational layer.

Adjacent Labs issues such as market dashboards, salary assets, interim bench
and retained search dashboards should stay behind their own flags and launch
gates. They are not blockers for the client presentation pipeline unless David
chooses to bundle them later.

## Suggested Codex Reasoning Level

Use medium only for:

- documentation-only edits
- README links
- plain-English checklists
- low-risk admin copy

Use high for:

- database migrations
- token logic
- magic-link routes
- auth and route protection
- CV access
- audit logging
- candidate consent checks
- WhatsApp Business automation
- Google Calendar and Meet integration
- AI candidate summary handling
- any route that touches candidate or client data

If the setting is left on medium for high-risk phases, the work may still move,
but it is not the right bar for privacy, security or launch-gate decisions. For
those phases, slow down and reason harder.

## Risk Register

| Risk | Why it matters | Control |
| --- | --- | --- |
| Raw token exposure | A client link could expose private shortlist data. | Store only hashes, never log raw tokens, test denial states. |
| Candidate consent gap | A candidate could be shared without clear approval. | Require consent timestamp, David approval and retention clearance. |
| Public indexing | A private client route could leak through search. | Noindex, robots block, sitemap exclusion and tests. |
| CV leakage | CV files are sensitive and should never be public. | Private storage, signed access, audit view/download events. |
| Analytics leakage | Candidate/client behaviour could become marketing data. | Keep portal engagement in private Postgres, not GA4/GTM. |
| AI overreach | AI could create fake certainty or unfair evaluation. | Draft-only, no ranking, David approval, no automated employment decisions. |
| WhatsApp misuse | Messaging can feel intrusive and has consent rules. | Operational templates only, consent required, opt-out process. |
| Google overreach | Calendar automation can create commitments too early. | Manual fallback first, scoped OAuth only after approval. |
| Feature flag confusion | Flags can be mistaken for launch approval. | Treat flags as switches only. Keep launch gate separate. |

## Rollback Plan

If anything looks wrong:

1. Set relevant Recruiter Labs flags back to `false`.
2. Revoke affected access-token rows.
3. Mark affected shortlist launch gates as rolled back.
4. Hide or withhold affected candidates.
5. Confirm no client route appears in public indexes.
6. Review audit logs.
7. Document what happened.
8. Let David approve any client or candidate communication.

## Manual Approvals For David

David must approve:

- whether the private beta should happen at all
- which client, if any, can see the first private shortlist
- candidate sharing wording
- client access wording
- retention periods
- CV access rules
- WhatsApp template wording
- Google Calendar/Meet scopes
- AI provider and AI use boundaries
- the exact feature flags to turn on
- the rollback wording if anything fails

## Final Engineering View

Safe to keep building: yes.

Safe to show real clients today: no.

Best next move after this roadmap: finish the magic-link portal foundation in
`#69`, using dummy data first, with no public exposure and no real CV access.
