# Recruiter Labs Candidate Process Transparency

Audit date: 11 June 2026

## Status

Implemented as a public job-page component and candidate confirmation support.

Feature flag:

```txt
FEATURE_INTERVIEW_PROCESS_TRANSPARENCY=false
```

The feature flag remains off as a release-control flag. The underlying public
job-page clarity is safe because it does not store private candidate data and
does not promise exact client stages where they are unknown.

## Audit Summary

Already existed:

- `interviewSteps`
- `interviewProcessConfirmed`
- `interviewProcess`
- `applicationProcess`
- candidate next-step copy
- candidate privacy link
- job transparency gate
- Candidate Privacy Notice acknowledgement

Added here:

- `CandidateProcessTimeline`
- job-page timeline rendering
- application confirmation timeline
- Sanity process fields
- public content mapping and type support
- tests and documentation

## Component Added

Component:

```txt
src/components/CandidateProcessTimeline.tsx
```

Used in:

```txt
app/jobs/[slug]/page.tsx
src/components/ContactForm.tsx
```

It renders:

- confirmed process where the client process is known
- typical process where the exact client process is not confirmed
- expected timeline
- application review timeframe
- task requirement
- presentation requirement
- first-stage format
- final-stage format
- feedback expectation
- Candidate Privacy Notice link

## CMS Fields Added

Sanity job fields:

- `processOverview`
- `processSteps`
- `expectedTimeline`
- `taskRequired`
- `presentationRequired`
- `firstStageFormat`
- `finalStageFormat`
- `feedbackExpectation`
- `applicationReviewTimeframe`

Existing fields retained:

- `interviewProcessConfirmed`
- `interviewSteps`
- `interviewProcess`
- `applicationProcess`

Plain-English editor rule:

```txt
Use "typical process for this kind of role" where the exact client process is unknown.
```

Do not pretend certainty.

## Confirmation Journey Updated

Candidate/job form success state now shows a compact next-step timeline:

- David reviews the note or application directly
- possible next step with David
- nothing sent to a client without permission
- privacy/data route
- clear expectation that there is no automated promise

## Privacy Safeguards

- No private candidate process status is exposed publicly.
- No named candidate timeline is stored in Sanity.
- No application status portal was launched.
- No promise of feedback timing unless the client process is confirmed.
- No AI process suggestion or automated messaging was added.

## Blockers

Before using the timeline as a stronger publishing gate:

- Real live roles need client-approved process detail.
- Sanity editors need to fill exact vs typical process honestly.
- Legal/privacy wording should still be reviewed before launch.
- Candidate status tracking must stay private until backend, access and
  retention gates are complete.

Candidates should know what comes next. No mystery process. No false promises.
No faff.
