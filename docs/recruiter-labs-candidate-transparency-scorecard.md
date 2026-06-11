# Recruiter Labs Candidate Transparency Scorecard

Audit date: 11 June 2026

## Status

Private scorecard implemented. Public launch gate still off.

This creates an internal readiness checker for job adverts before publishing. It
does not expose scores publicly, publish jobs automatically, rank candidates or
use AI to make decisions.

Do not publish vague jobs.

Route:

```txt
/admin/recruiter-labs/candidate-transparency
```

Feature flag:

```txt
FEATURE_CANDIDATE_TRANSPARENCY_SCORECARD=false
```

The route is CMS-gated and noindexed. The flag controls whether David treats
the scorecard as a formal publishing gate later. It stays `false` by default.

## Audit Summary

Already existed:

- public job fields for salary, hybrid, location, process and privacy
- `getJobTransparencyIssues()`
- `isJobCandidateTransparent()`
- `isJobLive()`
- JobPosting schema only for live candidate-ready jobs
- job copy standards
- candidate transparency roadmap
- candidate data/privacy boundaries

Added here:

- server-only scorecard engine
- private admin scorecard route
- explicit green/amber/red readiness model
- new feature flag
- documentation and tests

## Scorecard Criteria

The scorecard checks:

- salary/rate shown
- salary/rate caveat clear
- location clear
- hybrid pattern clear
- role type clear
- why role exists explained
- must-haves realistic
- nice-to-haves separated
- interview process explained
- what happens after applying explained
- privacy note included
- quick question route included
- no banned jargon
- JobPosting schema readiness

## Fields Checked

Core fields:

- `salaryRange`
- `salary`
- `salaryStatus`
- `salaryTransparencyNote`
- `location`
- `officeLocation`
- `locationExpectation`
- `workingPattern`
- `hybridPattern`
- `hybridReality`
- `remotePossible`
- `roleType`
- `seniority`
- `sector`
- `agencyOrClientSide`
- `whyRoleExists`
- `whyThisRoleMatters`
- `davidsTake`
- `mustHaves`
- `niceToHaves`
- `interviewSteps`
- `interviewProcessConfirmed`
- `applicationProcess`
- `applicationNotes`
- `candidatePrivacyNote`
- `candidateDataHandling`
- `quickQuestionEnabled`
- `quickQuestionRoute`
- `whatsappQuestionEnabled`
- `salaryMin`
- `salaryMax`
- `salaryPeriod`
- `postedDate`
- `seoTitle`
- `metaDescription`

## Readiness Rules

Green:

- all scorecard criteria pass
- no existing candidate transparency issues
- role is live and indexable
- JobPosting schema is safe to emit

Amber:

- no red content failures, but the role still needs action
- examples: scorecard is advisory only, role is still draft, role is noindexed,
  or must-haves need tightening

Red:

- at least one candidate-critical item fails
- examples: missing salary/rate, vague hybrid, missing process, missing privacy
  note, missing quick question route, banned jargon or placeholder copy

Red means do not publish the job as a live candidate-ready advert.

## Implementation Location

Code:

```txt
src/lib/candidate-transparency-scorecard.ts
app/admin/recruiter-labs/candidate-transparency/page.tsx
```

Tests:

```txt
src/tests/unit/candidate-transparency-scorecard.test.ts
```

Supporting docs:

```txt
docs/job-copy-standards.md
docs/recruiter-labs-candidate-transparency.md
docs/recruiter-labs-candidate-transparency-roadmap.md
docs/candidate-data-journey.md
docs/data-boundaries.md
```

## AI Option

Future AI assistance may suggest warnings for:

- vague copy
- missing salary
- jargon
- unrealistic must-haves
- weak process explanation
- biased or exclusionary language

AI must stay advisory. David must review every suggestion. No automated
publishing, candidate evaluation, ranking or rejection workflow should be built
from this scorecard.

## Public Exposure

Do not expose the score publicly unless David deliberately turns this into a
separate public trust feature later.

Current rule:

- private admin only
- noindexed
- CMS-gated
- no public badge
- no analytics payload containing private candidate or job-review notes
- no Sanity storage of private candidate data

## Blockers

Before using the scorecard as a formal publishing gate:

- David approves the criteria.
- Sanity editor guidance reflects the scorecard wording.
- Any real live jobs have verified salary/rate and hybrid content.
- Candidate Privacy Notice wording is legally reviewed for the live setup.
- If AI suggestions are ever added, provider, DPA, retention and human-review
  rules are approved first.

No vague jobs. No fake compliance. No fluff. No faff.
