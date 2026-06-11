# Labs AI Brief Builder

This stages the future AI-assisted job brief builder for Essential Resourcing
Labs.

Status: hidden foundation. Live submissions and provider calls are blocked.

## Principle

The job title is not the brief.

AI should help ask better questions, not replace judgement.

David stays in control. No hallucinated briefs. No faff.

## Routes

Private admin preview:

```txt
/admin/labs/ai-brief-builder
```

Locked API route:

```txt
/api/recruiter-labs/brief-diagnostic
```

The admin route is protected by the CMS session gate and noindexed.

The API route currently fails closed. That is deliberate.

## Feature Flag

```bash
FEATURE_AI_BRIEF_BUILDER=false
```

Keep it false until:

- Railway Postgres is live and migrated
- privacy and retention wording are approved
- David review/edit/approve workflow exists
- AI provider, DPA, model-training terms and processing region are approved
- email/CRM handoff is approved
- PII handling has been tested

Turning the flag on is not public launch approval.

## Brief Flow

Sections:

1. The business problem.
2. The role reality.
3. The market reality.
4. The must-haves.
5. Salary/rate.
6. Urgency.
7. David's review.

Questions include:

- what has changed in the business?
- why does this hire exist?
- what problem needs solving?
- what happens if nobody is hired?
- permanent, interim or unsure?
- what does success look like in 3, 6 and 12 months?
- what must this person fix, build or lead?
- what is the salary/rate?
- what is flexible?
- what is non-negotiable?
- what have you tried already?
- why would the right person join?

CTA:

```txt
Sense-check this brief with David
```

## AI And Non-AI Mode

Non-AI mode:

- available as a private design pattern
- uses guided questions
- uses deterministic review-pack logic
- makes no provider call
- still needs David review before use

AI-assisted mode:

- blocked
- draft only
- labelled as unreviewed
- no automatic publishing
- no automatic client email
- no automated candidate decisions
- no sensitive data to a provider without approval

## Draft Outputs

The future builder may create:

- clearer role summary
- risks/gaps in the brief
- suggested must-haves
- salary realism notes
- interim vs permanent recommendation
- questions David should ask
- draft job advert outline

Every output is draft-only until David approves it.

## Data Model

Existing private tables:

- `recruiter_lab_ai_brief_diagnostic_submissions`
- `recruiter_lab_ai_brief_diagnostic_drafts`

Alignment migration:

```txt
database/migrations/035_labs_ai_brief_builder_alignment.sql
```

Staged additions:

- David notes
- reviewed by/at
- converted at
- closed at
- AI mode
- sensitive data warning acknowledgement
- review event trail
- compatibility view: `job_brief_requests`

The `job_brief_requests` view maps the issue's requested model without creating
a duplicate public content store.

## Data And Privacy Controls

Rules:

- store in Railway Postgres, not Sanity
- no private brief data in GA4/GTM
- no raw prompts, secrets or provider keys in GitHub
- no client-visible draft without David approval
- no provider calls until provider/privacy controls are approved
- no candidate evaluation, ranking or rejection
- no salary advice without source caveats

## Human Review Workflow

Required workflow:

1. Client or David completes structured brief answers.
2. System creates a draft pack or structured non-AI summary.
3. Draft is labelled unreviewed.
4. David reviews and edits.
5. David approves, rejects, converts or closes.
6. Only approved content can be used with a client.

No automatic publish. No automatic send.

## Testing Checklist

Before private preview:

- feature flag defaults false
- admin route redirects unauthenticated users
- admin route noindexed
- API fails closed
- non-AI mode works without provider call
- AI-assisted mode remains blocked
- draft output labelled unreviewed
- no PII in analytics/log responses
- migration has approval constraints
- `job_brief_requests` view exists

Before real use:

- Postgres migrated
- privacy wording approved
- retention rules approved
- David review UI built
- provider DPA reviewed if AI is enabled
- model training/retention terms approved
- deletion/export process agreed
- email/CRM handoff approved

## Blockers

Blocked:

- public form
- live AI provider calls
- client confirmation email
- CRM/Loxo handoff
- automatic job advert publishing
- automated candidate decisions
- salary recommendations without evidence

## Recommendation

Build the structured non-AI brief builder first.

Only add AI once David has a proper review screen and the provider/privacy
position is signed off.
