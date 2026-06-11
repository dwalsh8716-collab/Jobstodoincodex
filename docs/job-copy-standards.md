# Job Copy Standards

Audit date: 11 June 2026

## Status

Implemented as a public job advert standard.

The site already had:

- public `/jobs` and `/jobs/[slug]` routes
- draft, live and closed job states
- draft jobs excluded from sitemap and AI index routes
- closed jobs noindexed
- JobPosting schema only for genuinely live jobs
- Candidate Transparency guidance in `docs/recruiter-labs-candidate-transparency.md`
- public job fields in Sanity, not private candidate records

This pass tightened the public job schema and copy rules. It did not build a
private candidate portal, CV upload flow, automated WhatsApp workflow or
Recruiter Labs feature.

## Standard

A live Essential Resourcing job advert must tell candidates the truth quickly.

Required public fields:

- title
- slug
- status
- salary range
- salary minimum and maximum when the range is publishable
- salary/rate currency
- salary period
- salary visibility
- interim rate minimum and maximum when a rate is publishable
- interim rate period
- salary status
- working pattern
- location
- office location
- hybrid pattern
- whether remote work is possible
- travel expectation
- role type
- seniority
- sector
- agency-side or client-side context
- interview steps
- whether the interview process is confirmed
- David's Take
- why the role exists
- must-haves
- useful extras
- what good looks like
- 3/6/12 month success indicators where the client has confirmed them
- application notes
- application process notes
- candidate privacy note
- quick-question route
- WhatsApp question setting
- posted date
- updated date
- closing date where relevant
- SEO title and meta description

## David's Take

David's Take should be short, useful and plain English.

It should explain:

- why this role matters
- what the CV will not tell you
- what candidates should know before applying
- what the client genuinely needs

It should not be a sales paragraph, a generic recruiter intro or filler.

## Salary Rules

Do not publish a live role with:

- hidden salary
- `TBC`
- `DOE`
- `competitive salary`
- `market rate`
- `depending on experience`
- a range David cannot stand behind

Use:

- `verified` when David has confirmed the range or rate
- `indicative` only when the caveat is genuinely useful and clear
- `unverified` only for draft roles
- `public_range` when the range can be published
- `indicative_range` when a range is useful but needs caveat wording
- `confidential` only with a clear reason and David approval
- `to_be_confirmed` only while the role is draft

No fake numbers. If the salary is not ready, the role stays draft.

## Hybrid And Location Rules

Every live role should say:

- office base
- actual office rhythm
- any travel or client-site expectation
- whether remote work is possible

`Hybrid` on its own is not enough.

## Success Indicator Rules

Use 3/6/12 month indicators only when they help candidates understand the real
job.

Good:

- "By month three, the client has a clearer campaign rhythm and fewer loose ends."
- "By month six, the senior team trusts the marketing plan and reporting."

Not good:

- fake commercial outcomes
- named client results
- vague promises
- anything David cannot defend in a candidate conversation

## Process Rules

Every live role should show:

- the likely interview steps
- whether the process is confirmed or indicative
- what happens after applying
- how David handles candidate details
- how to ask a quick question before applying

Candidates should not feel like they are applying into a black hole.

## Copy Bans

Do not use:

- Ninja
- Rockstar
- Guru
- Unicorn
- Wizard
- competitive salary without a range
- exciting opportunity as filler
- fast-paced environment without a useful explanation
- dynamic team as filler
- hit the ground running without context
- wear many hats without explanation

Use plain role language instead. Say what the job is, why it exists and what
the person needs to deliver.

## Privacy Boundary

Sanity is for public job advert content only.

Do not store:

- candidate names
- candidate emails
- candidate phone numbers
- application messages
- CV text or CV files
- private notes
- client-sensitive shortlist information

Private candidate and application records belong in the private operations
backend once it is configured and legally reviewed.

## Launch Rule

A job can be marked live only when the public advert is clear enough for a
candidate to make a sensible decision.

Clear salary. Clear working pattern. Clear process. Clear privacy note. No faff.
