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

The current job editor has three tabs: Role & pay, The advert, and Publish.
Only the facts needed to make a real vacancy clear are required to go live:

- plain role title and public URL
- real hiring employer, or `confidential` for an anonymous search
- employment type, location, working pattern and honest hybrid/remote rhythm
- public salary/rate minimum, maximum, pay period and whether the range is verified or indicative
- advert summary, full overview, responsibilities and must-haves
- clear application notes, original posted date and genuine closing date

Why the role exists, David's Take, useful extras, benefits and interview steps
remain available when they add something specific. Do not fill them with
generic copy just to complete a form. The website supplies the standard
candidate privacy link and application process; legacy CMS fields are retained
in existing records but are not part of the new-job form.

Google does not require salary for `JobPosting` eligibility. Essential chooses
to show a public range because that is more useful for candidates. Only a
verified, employer-provided range is emitted as `baseSalary` in structured data;
an indicative range remains visible in the advert without being represented as
confirmed pay in Google's markup. State any travel expectation in the advert
when it matters; there is no separate travel expectation box.

## Google Jobs Rules

Google Jobs only works properly when the public advert and the structured data
say the same thing.

For Essential Resourcing:

- `JobPosting` schema belongs on the individual job page only, never on the
  jobs listing page.
- The CMS has explicit fields for the original posting date, plain job title,
  hiring employer, employment type, location/remote status, full description,
  application notes and closing date. Complete these before changing Status to
  Live. For an anonymous search, record the hiring organization as
  `confidential`; do not label Essential Resourcing as the employer unless it
  is actually hiring.
- Draft jobs must stay out of the sitemap, AI index routes and JobPosting
  schema.
- Closed or expired jobs must not keep live JobPosting schema. Close the role,
  remove it, return 404/410, or set the expiry in the past.
- The job title must be the plain role title. Do not add salary, "apply now",
  urgency wording, location stuffing, brand stuffing or punctuation tricks.
- The description must be complete and visible on the page: role overview,
  responsibilities, requirements, must-haves, location, working pattern,
  salary/rate, process and how to apply.
- Use the real employer name in the advert and structured data when it can be
  disclosed. If the employer is anonymous, use `confidential` in the structured
  data and make that clear in the visible advert.
- Every live job needs a genuine closing date. Close or expire the advert when
  applications stop; do not keep an evergreen role live.
- Salary/rate schema should use real client- or employer-provided pay data.
  Do not invent a number to make the advert look better.
- Google does not require salary data for JobPosting eligibility; Essential's
  own candidate-transparency standard is stricter and requires a defensible
  public salary/rate range before a role is marked live.
- Fixed project fees can be shown in the advert, but they are not pushed into
  salary schema with a made-up unit.
- Use remote = Yes only for a role that is genuinely 100% remote. Hybrid,
  occasional home working and negotiable flexibility are not 100% remote.
- Fully remote jobs must state where applicants are eligible to work, usually
  the United Kingdom unless David has confirmed otherwise.
- Every live role needs a direct application route: the website form, direct
  email instructions, or another clear route to David.

Before asking Google to crawl a new role:

1. Publish only when the candidate advert is complete.
2. Check the page in Google's Rich Results Test.
3. Inspect the URL in Google Search Console after the final domain is live.
4. Use the sitemap and, for job posting updates, Google's Indexing API if it is
   configured later.

Google can still choose not to show a role in Google Jobs. The job of this site
is to give Google clean, policy-safe, complete data and avoid the obvious
reasons for rejection.

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

Use Published range when the employer has confirmed the numbers. Use
Indicative range only when David can stand behind the estimate and the advert
clearly says that it is indicative. This salary visibility choice controls
whether confirmed base salary is included in Google's structured data.

No fake numbers. If the salary is not ready, the role stays draft.

## Hybrid And Location Rules

Every live role should say the job location, actual office or remote rhythm and
whether remote work is possible. Add any material travel or client-site
expectation to the advert copy.

`Hybrid` on its own is not enough.

## Success Indicator Rules

Use specific success indicators in the advert only when they help candidates
understand the real job; the CMS no longer asks for separate 3/6/12 month boxes.

Good:

- "By month three, the client has a clearer campaign rhythm and fewer loose ends."
- "By month six, the senior team trusts the marketing plan and reporting."

Not good:

- fake commercial outcomes
- named client results
- vague promises
- anything David cannot defend in a candidate conversation

## Process Rules

Add interview steps when the client has confirmed them. Otherwise the website
shows a clearly labelled typical process. The standard application journey and
Candidate Privacy Notice explain what happens after applying and how David
handles candidate details.

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

Clear pay. Clear working pattern. Clear route to apply. No faff.
