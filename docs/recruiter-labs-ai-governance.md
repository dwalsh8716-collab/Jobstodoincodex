# Recruiter Labs AI Governance

## Status

Governance foundation only.

No AI provider is configured. No AI API calls are made. No public AI tool has
been added. No real candidate data should be sent to an AI provider until David
has approved the provider, data processing terms, privacy wording and operating
rules.

Essential Resourcing does not use AI to make automated candidate selection,
ranking, rejection or hiring decisions.

The hard launch gate lives in:

```txt
docs/recruiter-labs-ai-launch-gate.md
```

## Purpose

AI may be useful for operational compression:

- reduce admin typing
- structure interview notes
- organise notes against a human-defined scorecard
- draft candidate summaries for David to review
- draft anonymised CV text for David to review, using private server-side
  extracted text only after storage and consent gates pass
- draft shortlist profile notes
- draft interview questions
- draft follow-up emails
- suggest admin tasks
- flag missing information
- prepare internal briefing notes

Hard rule:

```txt
AI drafts. David decides.
```

## Banned Uses

AI must not:

- rank candidates
- reject candidates
- filter CVs or resumes automatically
- decide suitability
- infer protected characteristics
- score personality
- score culture fit
- make automated employment decisions
- publish client-facing summaries without David approval
- send candidate or client messages automatically
- invent experience, achievements or evidence
- hide uncertainty

No automated ranking. No automated rejection. No hidden scoring.

## Feature Flags

All off by default:

```txt
FEATURE_AI_OPS_COMPRESSION=false
FEATURE_AI_INTERVIEW_NOTES=false
FEATURE_AI_SCORECARD_NOTES=false
FEATURE_AI_CANDIDATE_SUMMARY_DRAFTS=false
FEATURE_CV_ANONYMIZATION=false
FEATURE_AI_CLIENT_PROFILE_DRAFTS=false
FEATURE_AI_FOLLOW_UP_DRAFTS=false
```

Existing broader flags still apply:

```txt
FEATURE_AI_BRIEF_BUILDER=false
FEATURE_AI_CANDIDATE_SUMMARIES=false
```

Flags do not override consent, privacy, retention or review rules.

## Private Route

Staged route:

```txt
/admin/recruiter-labs/ai-ops
```

Rules:

- admin-only
- noindex
- excluded from sitemap
- not linked from public navigation
- sample/governance content only
- no provider calls
- no real candidate data

## Provider Approval Rules

Before real data is used, David must know and approve:

- AI provider name
- model/provider terms
- data processing location
- retention policy
- whether prompts or outputs are used for model training
- DPA or equivalent terms where needed
- security controls
- deletion/export process
- support for redaction or data minimisation
- who can access generated drafts

No API keys or provider secrets should be committed to GitHub.

## Data Minimisation

Before sending anything to an AI provider:

- remove unnecessary names, phone numbers and email addresses where practical
- remove CV file URLs and storage keys
- avoid full transcripts unless approved
- use role/context summaries where possible
- keep prompts narrow
- mark output as AI-assisted draft
- log generation/review events
- store only what is needed in private Postgres

Do not put private AI notes, prompts, transcripts, candidate summaries or client
profile drafts into Sanity.

## Human Review Rules

AI output can be used only when:

- David has reviewed it
- facts have been checked against source notes
- uncertainty is left visible
- no protected-characteristic inference is present
- no suitability decision is implied
- the candidate has the required consent where client presentation is involved
- client-facing wording is approved

AI drafts should show their state:

- draft
- David review
- approved
- rejected
- deleted

## Audit Logging

Future AI routes should call the central audit utility for:

- AI draft created
- AI draft reviewed
- AI draft approved
- AI draft rejected
- AI generation blocked

Do not log:

- raw prompts containing candidate PII
- full transcript text
- CV text
- API keys
- provider secrets
- storage keys
- signed URLs

## Private Database Staging

Migration:

```txt
database/migrations/008_recruiter_labs_ai_governance.sql
database/migrations/016_candidate_summary_drafts.sql
database/migrations/022_ai_brief_diagnostic.sql
```

It stages:

- draft type
- draft status
- data classification: sample, redacted or private
- provider/model labels, not secrets
- prompt/output summaries
- redaction notes
- David review and approval timestamps
- retention status
- metadata

Candidate summary drafts now also stage:

- `draft_summary`
- `draft_strengths`
- `draft_watchouts`
- `human_approved`
- `approved_by`
- `approved_at`
- `ai_generation_event_id`
- uncertainty notes

AI brief diagnostics stage:

- client qualification answers
- formal commercial brief draft
- unclear areas
- risks
- salary and hybrid concerns
- suggested follow-up questions
- email summary to David
- optional client confirmation draft
- David approval state

These fields are private Postgres fields. They are not Sanity fields and are
not client-visible until David approves them.

Default stance:

- `data_classification='sample'`
- `status='draft'`
- `retention_status='pending_review'`
- `human_approved=false`
- client visibility blocked until David approval

## Candidate Summary Drafts

The candidate summary draft helper is staged in:

```txt
src/lib/recruiter-labs-ai-candidate-summary.ts
```

It does not call an AI provider yet. It creates a constrained draft from
approved source fields only, so the workflow can be tested without sending real
candidate data to a model.

The trigger helper is:

```txt
saveCandidateSummaryDraftForShortlistCandidate(shortlistCandidateId)
```

It loads the private shortlist candidate row from Postgres, checks shortlist
source status and candidate sharing consent, then calls the same draft saver. It
is the intended hook for the future admin action that marks a candidate as
shortlisted or adds them to a client shortlist.

Rules:

- three-bullet summary only
- strengths are draft notes, not a ranking
- watch-outs are verification prompts, not rejection reasons
- no suitability score
- no protected-characteristic inference
- no hallucinated facts
- uncertainty must stay visible
- `human_approved=false` by default
- client visibility stays blocked until David approves

Before this can use real candidate data or a real provider, David must approve
the provider, DPA/terms, processing region, redaction/minimisation rules,
candidate sharing consent wording, retention handling and the edit/approve UI.

## AI Brief Diagnostic

The client brief diagnostic is staged in:

```txt
src/lib/ai-brief-diagnostic.ts
docs/recruiter-labs-ai-brief-diagnostic.md
```

It validates the qualification journey and can build a deterministic draft
review pack for admin testing. It does not call an AI provider, email David,
send a client confirmation or publish anything.

Rules:

- no fake market claims
- no salary advice without sourced data and caveats
- no PII in analytics
- no automatic client output
- David review before any use
- private Postgres only, not Sanity

## Bias And Fairness Risks

High-risk areas:

- AI may overstate confidence.
- AI may introduce details that were not in source notes.
- AI may infer age, ethnicity, health, family status or other protected traits.
- AI may turn a note into a suitability judgement.
- AI may make polished but unfair language sound credible.

Controls:

- no ranking or scoring
- source-note review
- David approval
- clear uncertainty
- no protected-characteristic inference
- no client use until approved

## Candidate Rights, DSAR And Retention

If AI drafts are stored and contain candidate data, they may be in scope for:

- access/export requests
- correction requests
- deletion requests
- consent withdrawal
- retention review

AI-generated drafts should follow the same private-data rules as candidate
notes. Do not treat AI output as disposable just because it was machine drafted.

## Launch Checklist

Before sample-only private testing:

- route is admin-only
- route is noindexed
- route is absent from sitemap
- no provider call exists
- no API key is required
- allowed and banned uses are visible
- tests confirm banned uses stay blocked

Before real candidate data:

- provider approved
- DPA/terms reviewed where needed
- privacy wording updated
- candidate consent model checked
- data minimisation/redaction rules agreed
- audit logging live
- retention/DSAR handling agreed
- David approval workflow built
- client-facing output remains blocked until approved

## Engineering Decision

Safe to build now:

- governance pages
- feature flags
- sample-only private admin views
- private draft metadata schema
- tests that ban evaluation/ranking/rejection

Blocked:

- real AI provider calls
- real candidate data in prompts
- automated candidate scoring
- automated rejection
- client-facing summaries without approval
- automated WhatsApp/email sending from AI drafts

Use AI to save David hours of typing.

Never use AI to replace David's judgement.

No faff.
