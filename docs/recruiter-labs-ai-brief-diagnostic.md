# Recruiter Labs AI Brief Diagnostic

This is a staged Recruiter Labs feature for future client qualification.

It is not live. It must not collect real client briefs until privacy wording,
Railway Postgres, AI provider approval, email delivery and David's private
review workflow are signed off.

## Audit Result

The codebase already had the broader `FEATURE_AI_BRIEF_BUILDER=false` flag and
AI governance notes. There was no working brief diagnostic flow, no live AI
provider, no email summary and no client-facing diagnostic route.

This work extends the existing flag. It does not create a duplicate AI brief
builder.

## Feature Flag

```txt
FEATURE_AI_BRIEF_BUILDER=false
```

The flag is server-side only. It is not a public launch switch.

## Locked Route

```txt
/api/recruiter-labs/brief-diagnostic
```

The route currently fails closed with a staged status. That is intentional.

It must stay locked until:

- the public journey and privacy wording are approved
- Railway Postgres is connected and migrated
- an AI provider is selected and approved
- David has a private review/edit/approve screen
- email delivery to David is configured
- PII is confirmed absent from analytics

## User Journey Staged

The diagnostic schema captures the fields from issue #109:

- what are you hiring?
- why now?
- what problem needs solving?
- what happens if this hire fails?
- permanent, interim or unsure?
- salary or rate budget
- location and hybrid reality
- must-haves
- nice-to-haves
- tried hiring already?
- what did not work?
- urgency
- contact details
- privacy acknowledgement
- AI draft acknowledgement

## Private Database Model

Migration:

```txt
database/migrations/022_ai_brief_diagnostic.sql
```

Private tables:

- `recruiter_lab_ai_brief_diagnostic_submissions`
- `recruiter_lab_ai_brief_diagnostic_drafts`

These tables are for Railway Postgres only. They are not Sanity content.

The draft table stages:

- formal commercial brief
- unclear areas
- risks
- salary and hybrid concerns
- suggested follow-up questions
- email summary to David
- optional client confirmation draft
- David approval state
- client visibility block

No automatic publishing. No public output. No fake market claims.

## AI Rules

The diagnostic can help structure a brief. It must not:

- invent market evidence
- give salary advice without sourced data and caveats
- publish anything automatically
- email a client automatically
- send private details to analytics
- replace David's judgement

Plain rule:

```txt
AI can draft. David decides.
```

## Current Technical Status

Implemented:

- private Postgres schema
- server-only validation
- deterministic review-pack helper for safe admin testing
- locked API route
- gap detection for thin answers, vague budget, unclear hybrid reality and
  overloaded must-haves
- documentation and tests

Not implemented:

- live public form
- AI provider calls
- email delivery
- admin review UI
- client confirmation sending
- CRM/Loxo handoff

## Launch Blockers

Before real use:

- approve privacy and retention wording
- choose an AI provider and review DPA, processing region, model-training terms
  and deletion/export support
- decide whether the first version should be custom only or backed by a CMP/CRM
  workflow
- build the private David review screen
- confirm who can see, edit, approve, delete and export diagnostic records
- run the migration against Railway Postgres
- test that no PII reaches analytics, logs or Sanity

This is technical launch guidance, not legal advice. No faff, and no fake
compliance.
