# Recruiter Labs AI Interview Notes

## Status

Prototype staging only.

No real interview audio, meeting recording, transcript, candidate data or
provider call is live. The private admin UI uses fake transcript data only.

Plain rule:

```txt
AI can capture and structure interview evidence.
It cannot decide who is good enough.
```

David remains the judgement layer.

## Allowed Use

AI may eventually help with:

- structured interview notes
- candidate background summary drafts
- evidence snippets tied to interview answers
- strengths discussed
- concerns and watch-outs discussed
- follow-up questions
- scorecard-aligned sections
- draft internal notes
- draft client summary for David to edit
- admin task suggestions

Every output is draft-only until David reviews it.

## Banned Use

AI must not produce:

- pass/fail decisions
- automated ranking
- suitability scores
- personality scores
- culture-fit scores
- rejection recommendations
- legally sensitive decision rationale
- protected-characteristic inference
- automated selection

Scorecards here mean structured notes. They do not mean numeric scoring.

## Feature Flags

```txt
FEATURE_AI_INTERVIEW_NOTES=false
FEATURE_AI_SCORECARD_NOTES=false
```

Both flags stay server-side and off by default.

## Private Admin Prototype

Private route:

```txt
/admin/recruiter-labs/ai-ops
```

The route is:

- admin-only
- noindexed
- absent from sitemap
- fake-data only
- clear that real interviews are blocked
- clear that there is no numeric score

## Scorecard Structure

Staged sections:

- role motivation
- relevant experience
- leadership and seniority
- commercial impact
- functional expertise
- stakeholder management
- agency / client-side fit
- strategic vs hands-on balance
- availability and notice
- salary / rate alignment
- concerns and watch-outs
- follow-up questions

Each section should capture notes and evidence. It should not store a score.

## Data Model

Migration:

```txt
database/migrations/024_ai_interview_notes.sql
```

Private tables:

- `recruiter_lab_interview_transcripts`
- `recruiter_lab_interview_notes`
- `recruiter_lab_interview_scorecard_sections`
- `recruiter_lab_ai_generation_events`

The transcript table is staged for fake/manual or approved future provider
transcripts. Provider/audio transcripts require `consent_captured_at`.

The interview note table stages:

- source type
- transcript link
- draft status
- summary draft
- structured notes
- David edited notes
- approval state
- approval audit event link

The scorecard section table stages notes, evidence and follow-up flags only. It
does not include numeric score, ranking or rejection fields.

## Consent Requirements

Before recording or transcribing:

- candidate must be told
- consent must be captured
- purpose must be clear
- retention must be clear
- opt-out route must exist
- manual notes alternative must exist
- provider terms must be approved

No hidden recording. No secret transcription.

## Review Workflow

Staged workflow:

1. Manual or fake notes are structured.
2. AI output, if used later, is labelled as draft.
3. David reviews the source evidence.
4. David edits or rejects the draft.
5. David approves only the final text for profile use.
6. Approval writes an audit event.

No profile, shortlist or client portal can use interview notes until David has
approved them.

## Provider Questions

Before a provider is approved, ask:

- Can recording be disabled while note structuring remains available?
- Can the notetaker be blocked when consent is missing?
- Where are transcript and note data processed?
- Are transcripts or outputs used for model training?
- Can transcripts be deleted and exported?
- Can notes write back to Loxo as activities rather than overwrite candidate
  fields?
- Can output stay draft-only until David approves it?
- Can scoring/ranking/recommendation features be disabled?

Use `docs/recruiter-labs-ai-vendor-discovery.md` before any vendor decision.

## Risks

- A polished note may sound more certain than the interview evidence.
- A scorecard UI may drift into scoring.
- Transcription may surprise candidates if wording is weak.
- Full transcripts may contain sensitive data that does not need to be kept.
- AI output may leak into profile copy before David checks it.

Controls:

- fake/manual data first
- no numeric score fields
- David review required
- approval audit event
- private Postgres only
- no Sanity storage
- no provider connection yet

## Blockers

Blocked before real interviews:

- candidate consent wording
- opt-out route
- provider approval
- DPA, processing region and model-training review
- transcript retention and deletion process
- David edit/approve UI
- audit logging proof on approval
- Loxo handoff/sync decision

No faff. No hidden people decisions.
