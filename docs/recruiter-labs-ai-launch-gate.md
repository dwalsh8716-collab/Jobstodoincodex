# Recruiter Labs AI Launch Gate

## Status

Private, synthetic-data testing only.

No AI provider is configured. No AI API call exists. No real candidate data,
client data, CV content, interview transcript or private note should be sent to
an AI provider until this gate is cleared.

This is technical launch guidance, not legal advice.

Hard rule:

```txt
AI can help David move faster.
It must not make hidden decisions about people.
```

Safe first. Private first. No faff.

## What Can Be Tested Now

Allowed now:

- private admin route review
- synthetic or fake data walkthroughs
- feature flag checks
- launch-gate checklist review
- draft schema review
- audit event name review
- policy and documentation review

Not allowed now:

- real candidate prompts
- live interview transcription
- CV summarisation
- automated candidate scoring
- automated rejection
- client-facing AI summaries
- automated WhatsApp or email sending from AI output

## Banned Use Policy

AI must never be used to:

- rank candidates
- filter CVs automatically
- reject candidates
- create a suitability score used as a decision
- score personality
- score culture fit
- infer protected characteristics
- make hidden candidate evaluations
- make AI-only hiring or shortlist decisions

Scorecards can organise human notes.

They must not turn into automated scoring.

## Launch Gate Checklist

### Banned Uses

- Passed: no automated candidate ranking exists.
- Passed: no automated CV filtering exists.
- Passed: no automated rejection exists.
- Passed: no suitability, personality or culture-fit scoring exists.
- Passed: protected-characteristic inference is banned.
- Passed: no AI-only decision route exists.

### Human Review

- Passed: AI output is labelled as draft.
- Manual review: David review and approval fields are staged.
- Manual review: edit/delete metadata is staged.
- Blocked: real edit, delete and approval UI is not live.
- Blocked: client-facing publication workflow is not live.

Before real use, David must be able to:

- review AI output
- edit it
- reject it
- delete it
- approve it
- block it from client view

### Privacy

- Blocked: AI provider not selected.
- Blocked: provider DPA/terms not reviewed.
- Blocked: processing region not confirmed.
- Blocked: provider training-use policy not confirmed.
- Manual review: redaction and minimisation rules are documented but not live.
- Manual review: retention, deletion and DSAR handling must be confirmed for AI
  drafts.

No unnecessary PII should be sent to an AI provider.

Do not send raw CV files, storage URLs, signed URLs, phone numbers, email
addresses or full transcripts unless David has approved that exact workflow.

### Consent

- Blocked: interview transcription consent wording is not approved.
- Blocked: candidate opt-out route is not built.
- Passed: manual notes remain the default.
- Blocked: recording/transcription transparency must be reviewed before any
  notetaker or transcript workflow is used.

Any interview recording or transcription workflow needs clear wording before it
is used with a candidate.

### Audit

- Passed: AI generation, review, approval, rejection, deletion and blocked
  generation event names are typed.
- Passed: source data summary and prompt version metadata are staged.
- Manual review: live routes must call the central audit utility when built.
- Manual review: client-facing publication logging is staged but not live.

Audit logs must not include:

- raw prompts containing candidate PII
- full transcript text
- CV text
- provider secrets
- API keys
- storage keys
- signed URLs

### Security

- Passed: AI feature flags are server-side and off by default.
- Passed: AI Ops is admin-only.
- Passed: AI Ops is noindexed and absent from the sitemap.
- Passed: no provider secret is committed.
- Passed: no public AI draft route exists.
- Passed: AI draft fields are blocked from Sanity/public CMS content.

API keys must live only in the hosting environment.

Never commit real secrets.

## Vendor Checklist

Before David approves a provider, capture:

- provider name
- model name
- processing region
- DPA or equivalent terms
- data retention period
- deletion/export support
- whether prompts or outputs train models
- security controls
- access controls
- subprocessor list where relevant
- whether redaction can happen before sending data
- support process if a deletion request lands
- cost model
- failure mode if the provider is unavailable

Potential vendor types:

- general AI API provider
- interview notetaker
- transcript summariser
- CRM-native AI tool
- Loxo-compatible workflow tool

No vendor is approved by default.

## Approval Workflow

Minimum workflow before real candidate data:

1. David approves the AI provider and use case.
2. Privacy terms, consent wording and retention approach are reviewed.
3. Feature flag is enabled only for the specific workflow.
4. AI output is labelled as draft.
5. David reviews the draft against the source notes.
6. David edits, rejects, deletes or approves the draft.
7. Client-facing output stays blocked until David approves publication.
8. Every generation, review, approval, rejection, deletion and publication
   action is logged.

## Rollback Plan

If anything looks wrong:

1. Set every AI Ops feature flag to `false`.
2. Remove or disable the AI provider key in the hosting environment.
3. Stop any route from accepting real candidate data.
4. Mark affected AI drafts as `rejected` or `deleted`.
5. Block client visibility for affected profiles.
6. Review AI audit events.
7. Confirm candidate deletion, DSAR and retention actions.
8. Re-run `npm run typecheck`, `npm run lint` and `npm run build`.

## Production Blockers

Real candidate data is blocked until:

- provider approved
- DPA/terms reviewed where needed
- processing region confirmed
- training-use policy confirmed
- privacy wording updated
- transcription/recording consent wording approved
- candidate opt-out route agreed
- redaction/minimisation workflow agreed
- audit logging live
- retention and DSAR handling agreed
- David review/edit/delete/approve workflow live

Client-facing AI output is blocked until:

- candidate sharing consent is clear
- profile publication is approved by David
- publication event is logged
- source data and prompt version are tracked
- output is fact-checked
- uncertainty is visible
- no protected-characteristic inference is present
- no suitability decision is implied

## Engineering Decision

Current decision:

- synthetic-data admin testing is OK
- real candidate data is not OK
- client-facing AI output is not OK

The launch gate is intentionally hard.

AI drafts. David decides.
