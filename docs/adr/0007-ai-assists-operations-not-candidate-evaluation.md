# 0007 - AI Assists Operations, Not Candidate Evaluation

## Status

Accepted.

## Context

AI may help Essential Resourcing reduce admin load, structure notes and draft
internal materials. It must not make hidden decisions about people.

Current AI work is governance-only. No provider is configured, no AI API call is
live and no real candidate data should be sent to an AI provider until David has
approved the provider, terms, privacy wording and workflow.

Supporting docs:

- `docs/recruiter-labs-ai-governance.md`
- `docs/recruiter-labs-ai-launch-gate.md`
- `docs/data-boundaries.md`

## Decision

AI may assist operations. David decides.

Allowed direction:

- draft admin notes
- structure interview notes
- organise notes against a human-defined scorecard
- draft candidate summaries for David review
- suggest missing information
- prepare internal briefing notes
- draft follow-up wording for human approval

Banned direction:

- automated candidate ranking
- automated rejection
- hidden suitability scoring
- protected-characteristic inference
- personality or culture-fit scoring
- AI-only hiring or shortlist decisions

## Consequences

- AI work stays private, auditable and human-reviewed.
- Any AI provider needs explicit approval before real data is used.
- Outputs must be labelled as drafts and reviewed before client/candidate use.
- Prompts, outputs and logs must follow data minimisation and retention rules.

## What Not To Do

- Do not send real candidate data to an AI provider before approval.
- Do not use AI to rank, reject or filter candidates automatically.
- Do not hide uncertainty behind polished AI wording.
- Do not store private AI prompts or drafts in Sanity.
- Do not commit AI provider keys or secrets.
