# Recruiter Labs AI Ops Roadmap

## Status

Roadmap only.

No AI provider is configured. No AI API call exists. No real candidate data,
client data, CV text, interview transcript or private note should be sent to an
AI provider until the launch gate is cleared.

The principle is simple:

```txt
AI should compress operations, not evaluate candidates.
```

Use AI where it saves admin. Avoid AI where it creates unfairness, opacity or
legal risk.

No ranking. No filtering. No faff.

## What Already Exists

The codebase already has:

- `docs/recruiter-labs-ai-governance.md`
- `docs/recruiter-labs-ai-launch-gate.md`
- `docs/recruiter-labs-ai-brief-diagnostic.md`
- private AI Ops route: `/admin/recruiter-labs/ai-ops`
- server-only AI Ops feature flags, all off by default
- banned uses for ranking, rejection, filtering and hidden scoring
- private Postgres AI draft schema
- candidate summary draft helper, blocked from real/client use
- brief diagnostic validation and locked route
- data-boundary docs keeping private AI records out of Sanity

That is the right foundation. The next work is sequencing, not a rebuild.

## Phased Plan

### Phase 1: Governance

Status: mostly staged.

Build now:

- keep the banned-use policy visible in code and docs
- keep AI flags server-side and default false
- keep the AI launch gate hard for real data
- keep private AI records in Postgres, not Sanity
- keep `/admin/recruiter-labs/ai-ops` admin-only, noindexed and absent from the
  sitemap

Later:

- add provider-specific rules only after David chooses a provider
- add live generation audit events only when a real provider exists

Dependencies:

- `docs/recruiter-labs-ai-governance.md`
- `docs/recruiter-labs-ai-launch-gate.md`
- `src/lib/recruiter-labs-ai.ts`
- `database/migrations/008_recruiter_labs_ai_governance.sql`
- `database/migrations/009_recruiter_labs_ai_launch_gate.sql`

### Phase 2: Manual Structured Notes

Status: staged in `docs/recruiter-labs-ai-interview-notes.md`.

Build now:

- manual interview note structure
- scorecard template fields for human note organisation
- candidate profile source fields
- approval status and review metadata
- edit, reject, delete and approve states

Later:

- live AI note structuring
- transcript import
- meeting recording or notetaker workflow

Dependencies:

- interview note consent wording
- Candidate Privacy Notice review
- private Postgres workflow records
- audit logging

### Phase 3: AI Drafting With Fake Data

Status: safe for admin-only prototyping once the fake data set is explicit.

Build now:

- fake CV and interview examples
- fake shortlist examples
- synthetic candidate profile drafts
- candidate summary UI using fake data only
- prompt safety tests
- generated output labelled as draft

Later:

- real candidate data pilot
- provider calls
- client-facing output

Rules:

- no real candidate data
- no hidden scoring
- no suitability score
- no client visibility
- David review still required

### Phase 4: Vendor Discovery

Status: documented in `docs/recruiter-labs-ai-vendor-discovery.md`.

Review:

- Metaview-style interview notetakers
- general AI API providers
- CRM-native AI tools
- Loxo compatibility
- Google Meet compatibility
- data processing region
- DPA or equivalent terms
- model-training policy
- retention and deletion support
- cost, failure modes and admin effort

No vendor is approved by default.

### Phase 5: Real Data Pilot

Status: blocked until David approval.

Only after approval:

- consent wording is approved
- provider is selected
- DPA/privacy terms are reviewed
- processing region and training-use terms are known
- redaction/minimisation rules are agreed
- limited pilot scope is defined
- audit logging is live
- David review, edit, reject, delete and approve workflow is live

The pilot should start with one narrow workflow, not every AI idea at once.

### Phase 6: Client Portal Integration

Status: later.

Client portal AI output can appear only when:

- source data has been approved
- candidate sharing consent is present
- the draft has been edited or approved by David
- the final copy is versioned
- the AI draft is never directly visible
- publication is audit logged
- uncertainty remains visible
- no protected-characteristic inference is present
- no suitability decision is implied

## Dependencies

Hard dependencies:

- Railway Postgres live and migrated
- audit logging live
- candidate consent wording approved
- data retention and DSAR handling agreed
- admin review/edit/delete/approve UI
- provider approval and DPA review
- no PII in analytics
- private data kept out of Sanity

Useful dependencies:

- Loxo handoff/sync decision
- Google Meet and Calendar decision
- WhatsApp Business logistics decision
- private storage if CV, transcript or audio files are involved

## Risks

Main risks:

- AI output sounds more certain than the source evidence allows.
- AI turns notes into a hidden people decision.
- AI introduces protected-characteristic inference.
- Interview transcription happens without clear candidate wording.
- Client-facing summaries ship before David has checked them.
- Private prompts, transcripts or CV content leak into logs, analytics or Sanity.
- Vendor terms allow training or retention David has not approved.

Controls:

- banned-use policy
- feature flags off by default
- fake data first
- David review required
- private Postgres only
- audit logging
- no automated sending
- no direct client visibility for drafts

## Build Now Vs Later

Build now:

- roadmap and issue order
- manual scorecard/note structure
- fake-data draft UI
- prompt/output safety tests
- admin-only review states
- provider comparison template

Build later:

- real AI provider connection
- real interview notetaker integration
- real candidate data processing
- automatic email or WhatsApp drafts
- client portal publication
- Loxo sync of generated notes

Build only after explicit approval:

- live provider keys
- real transcript handling
- real CV summarisation
- client-visible AI-assisted summaries

## Codex Issue Order

Recommended order from here:

1. #89: AI Ops roadmap.
2. #87: AI vendor discovery and Loxo fit. Current recommendation: explore
   Loxo AI Notetaker first, Metaview second.
3. #85: manual structured interview notes and scorecard-aligned records.
4. #86: human-verified candidate summary drafts for the client portal.
5. #64: broader AI brief builder, extending the staged diagnostic rather than
   duplicating it.
6. #70: branded candidate profile builder from private CV/application data.
7. #69: magic-link client presentation portal.
8. #72: interview request workflow from the client portal.
9. #73: WhatsApp, Google Calendar and Meet interview orchestration.
10. #83: WhatsApp Business CRM sync with Loxo candidate records.

Keep these sequenced. Do not jump to vendor calls or client-facing AI output
before the manual workflow is clear.

## What Not To Build

Do not build:

- AI candidate ranking
- AI rejection
- automated CV filtering
- suitability scores
- culture-fit or personality scores
- protected-characteristic inference
- automated shortlist decisions
- automatic client publication
- automatic candidate or client messaging from AI output
- hidden scoring inside a scorecard UI
- public AI tools using private candidate/client data

Scorecards can structure human notes. They must not become a machine decision.

## Private Beta Checklist

Before private beta:

- every AI flag is still default false
- the exact beta flag is approved by David
- Railway Postgres is live and migrated
- admin access is limited to the right people
- candidate/client privacy wording is approved
- provider, DPA, region, retention and training-use terms are approved
- fake-data workflow has passed first
- David can edit, approve, reject and delete outputs
- audit logging records generation, review, approval, rejection and deletion
- no raw prompts, transcript text, CV text, API keys, storage keys or signed
  URLs are logged
- no PII is sent to analytics
- drafts are not visible to clients
- rollback steps have been rehearsed

## Owner Decision

The AI roadmap is not a race to add a model.

It is a controlled route to save David admin time without creating hidden
candidate evaluation, privacy surprises or polished nonsense.
