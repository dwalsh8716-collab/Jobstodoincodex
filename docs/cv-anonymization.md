# CV Anonymization Drafts

## Status

Staged, private and blocked for real CV use.

No public CV upload has been enabled.

No AI provider has been connected.

No real CV should be processed until private storage, malware scanning, consent,
retention, audit logging, David review and legal/privacy wording are approved.

This is technical staging, not legal advice.

## Decision

CV anonymization belongs in Recruiter Labs.

It must stay:

- feature-flagged
- private
- server-side
- noindexed by route policy
- out of Sanity
- out of analytics
- blocked from client use until David approves

Feature flag:

```txt
FEATURE_CV_ANONYMIZATION=false
```

## What Was Added

- Server-only CV anonymization helper in `src/lib/cv-anonymization.ts`.
- Deterministic draft redaction for obvious direct identifiers.
- Private Postgres staging table in
  `database/migrations/013_cv_anonymization_drafts.sql`.
- Audit action for CV anonymization draft creation.
- Feature flag entry and tests.

## Worker Contract

The staged worker expects:

- `originalCvFileId`
- server-side `extractedText`
- optional `candidateName`
- optional `employerNames`
- optional employer-name redaction mode

It creates a draft with:

- `originalCvFileId`
- `anonymizedText`
- `anonymizationStatus`
- `reviewedBy`
- `reviewedAt`
- `approvedForClientUse`
- `aiGenerationEventId`

The draft starts in `david_review`.

It must never auto-publish.

## Redaction Scope

The helper removes obvious direct identifiers:

- name when provided
- email
- phone
- address lines containing a UK postcode
- LinkedIn URL
- other personal website URLs
- references line
- employer names only when anonymised employer mode is selected

It tries to preserve experience, skills and chronology.

It does not rewrite the substance.

It is not a guarantee of full anonymisation.

## AI Rules

AI or automation must not:

- alter experience
- invent skills
- rank candidates
- score suitability
- make decisions
- publish without David approval

The current helper is deterministic redaction scaffolding. If a future AI
provider is introduced, `docs/recruiter-labs-ai-launch-gate.md` must pass first.

## Manual Blockers

Before real CV use:

1. Choose and configure private CV storage.
2. Add malware scanning and signed/authenticated access.
3. Approve consent wording for anonymised client presentation.
4. Confirm retention and DSAR handling.
5. Build David review/edit/reject/delete/approve UI.
6. Confirm audit events are written in production.
7. Confirm no raw CV text is logged, sent to analytics or stored in Sanity.
8. Review legal/privacy wording.

## Rollback

Keep `FEATURE_CV_ANONYMIZATION=false`.

If a private draft workflow is later enabled and something looks wrong:

1. Set `FEATURE_CV_ANONYMIZATION=false`.
2. Stop processing new CV drafts.
3. Mark affected drafts as rejected or deleted.
4. Review audit events.
5. Confirm any source CV file access remains revoked or restricted.

No fake compliance. No public CV links. No client use without David review.
