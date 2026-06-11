# Recruiter Labs Candidate Profiles

## Status

Private builder foundation.

This is staged behind:

```txt
FEATURE_BRANDED_CANDIDATE_PROFILES=false
FEATURE_AI_CANDIDATE_SUMMARIES=false
FEATURE_AI_CANDIDATE_SUMMARY_DRAFTS=false
FEATURE_CV_ANONYMIZATION=false
```

No public candidate profile route has been added. No CV extraction is live. No
AI provider has been connected. No AI output can be treated as approved unless
David reviews it.

This is technical implementation guidance, not legal advice.

## Audit

Already existed:

- shortlist candidate snapshots in private Postgres
- candidate profile approval status on shortlist candidates
- candidate summary draft tables
- candidate profile version history
- CV anonymisation draft scaffolding
- AI launch gates and banned-use rules
- client sharing checks that block missing consent, missing approval and unsafe
  retention states
- no public candidate profile URL

Gaps filled in this pass:

- explicit candidate profile builder table
- generation event table
- profile-version link back to the builder record
- server-only helper for manual profile drafts
- share-decision helper for profile-level approval checks
- private documentation for CV extraction, AI review and admin workflow

## What Was Built Or Staged

Migration:

```txt
database/migrations/031_recruiter_labs_candidate_profile_builder.sql
```

Helper:

```txt
src/lib/recruiter-labs-candidate-profiles.ts
```

The helper can prepare a manual structured draft from approved private
candidate/application data. It normalises fields, keeps arrays bounded and
marks drafts as not approved for client use.

If an AI draft was used, the profile starts as:

```txt
AI-assisted draft. David review required.
```

## Feature Flags

- `FEATURE_BRANDED_CANDIDATE_PROFILES` controls the private builder foundation.
- `FEATURE_AI_CANDIDATE_SUMMARIES` and
  `FEATURE_AI_CANDIDATE_SUMMARY_DRAFTS` remain off until AI governance passes.
- `FEATURE_CV_ANONYMIZATION` remains off until private CV storage, scanning,
  extraction and review rules are approved.

Feature flags are not approval. David still needs to approve the profile and
the private beta before any client sees candidate data.

## Database Model

Adds:

```txt
recruiter_lab_candidate_profiles
recruiter_lab_candidate_profile_generation_events
```

Extends:

```txt
recruiter_lab_candidate_profile_versions
```

Profile fields include:

- candidate/application links
- profile status
- display name or anonymised label
- current/recent title
- private current company
- location
- work preference
- salary/rate expectation
- notice period
- availability
- seniority
- sector experience
- agency/client-side background
- functional strengths
- leadership scope
- commercial impact
- David summary
- strengths
- watch-outs
- relevant experience
- CV access flag and metadata
- AI draft flags/review timestamps
- client approval fields
- consent check timestamp
- retention status

Approval rule:

- `approved_for_client_use=true` requires `profile_status='approved_for_client'`
  plus David approval and consent check timestamps.

AI rule:

- AI-assisted profiles remain unapproved until David review is recorded.

## CV Extraction Approach

Current state: blocked.

Future CV extraction must:

- run server-side only
- use private file storage
- validate PDF/DOC/DOCX type
- validate file size
- use malware scanning
- store raw extracted text only where justified
- avoid Sanity
- avoid `/public`
- avoid analytics
- log extraction events
- allow deletion/anonymisation
- require David review before client use

No real CV text should be processed until the CV storage and privacy gates are
approved.

## AI Approach

AI may help draft:

- summary
- strengths
- watch-outs
- relevant experience
- interview questions
- missing-information prompts

AI must not:

- invent achievements
- infer protected characteristics
- rank candidates
- score suitability
- decide who should progress
- send profiles to clients
- publish without David approval
- use unapproved providers

The AI launch gate remains the source of truth.

## Human Review Workflow

1. David creates a manual profile draft.
2. Private fields are checked against the application/CV.
3. Optional AI draft stays labelled as review-required.
4. David edits summary, strengths, watch-outs and relevant experience.
5. Consent and retention status are checked.
6. David approves for client use.
7. The approved version can be linked to a shortlist.
8. Client portal displays only approved, scoped, consent-cleared profiles.

## Admin UI

The next admin UI should let David:

- create a profile from candidate/application data
- see CV metadata, not raw public CV links
- enter structured fields
- add David summary
- add strengths, watch-outs and relevant experience
- see AI draft warning status
- mark profile as withheld or approved
- choose named or anonymised display
- see consent and retention warnings
- view version history

Do not add a public profile route.

## Privacy Safeguards

- candidate profiles stay in private Postgres
- no candidate profile data goes into Sanity
- no candidate profile data goes to GA4/GTM
- no public candidate URLs
- no CVs in `/public`
- no AI auto-publish
- no suitability score
- no ranking
- no protected-characteristic inference
- client sharing requires consent, retention clearance and David approval

## Blockers

Still blocked:

- real CV extraction
- private CV storage
- malware scanning
- AI provider approval
- AI DPA/data-retention review
- admin edit/approve UI
- real client sharing
- legal/privacy review

## Final Engineering View

Turn messy CVs into clean, branded, human-reviewed candidate profiles.

AI assists.

David verifies.

No public candidate data.

No faff.
