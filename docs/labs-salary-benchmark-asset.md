# Labs Salary Benchmark Asset

This stages the future bespoke salary benchmarking asset builder for Essential
Resourcing Labs.

Status: private/admin preview. Not public. Not client-live.

## Principle

Premium lead-generation based on honest market advice.

No fake salary data. No unreviewed AI advice. No faff.

## Route

Private admin preview:

```txt
/admin/labs/salary-benchmark
```

The route is protected by the CMS session gate, noindexed and absent from public
sitemap output.

## Feature Flag

```bash
FEATURE_SALARY_BENCHMARK_ASSET=false
```

Keep it false until David approves the request wording, privacy wording, source
caveats, Postgres storage and review workflow.

## Feature Design

Working names:

- Salary Sense-Check
- Salary Benchmark Request
- Brief and Salary Reality Check
- Is This Salary Competitive?
- Senior Marketing Salary Benchmark

This is different from a generic salary guide. The user submits role context.
David reviews the benchmark before anything is sent.

## Request Fields

The staged request model supports:

- role title
- seniority
- location
- hybrid/remote setup
- agency/client-side
- sector
- salary/rate budget
- must-have skills
- hiring urgency
- email/company details
- consent

## Output Asset

The future report structure should include:

- client role summary
- market range
- salary/rate caveats
- hiring difficulty
- likely candidate pool
- risk of underpaying
- suggested adjustments
- comparable roles
- interim vs permanent view
- David's recommendation
- CTA to discuss

No report should be sent until David has reviewed and approved it.

## Data Model

Migration:

```txt
database/migrations/040_labs_salary_benchmark_asset.sql
```

Tables:

- `salary_benchmark_requests`
- `salary_benchmark_drafts`

The request table stores the private lead/request.

The draft table stores report structure, caveats, source notes, AI-use notes and
David review timestamps.

The database blocks `sent_at` unless `approved_to_send_at` and
`david_reviewed_at` are present.

## Admin Workflow

David should be able to:

- view request
- add benchmark notes
- set recommended range
- add caveats
- attach/send report later
- create task
- mark status
- convert to lead/enquiry

This pass stages the data and private preview. It does not build a public form
or sending workflow.

## AI And Human Review Rules

AI may help draft structure later, but not final advice.

Rules:

- use only approved data
- no hallucinated salary figures
- show draft as needs David review
- no auto-send
- log AI use
- allow David to edit
- every figure needs a caveat/source note

## Privacy Safeguards

Rules:

- no public route yet
- no private benchmark data in Sanity
- no private benchmark data in GA4/GTM
- Postgres only for requests and drafts
- consent before follow-up
- separate marketing consent
- no unreviewed salary recommendation
- no fake precision

## Blockers

Blocked before launch:

- public request form
- report/PDF generation
- email delivery
- CRM handoff
- source review
- David review/edit screen
- AI provider approval if AI is used
- legal/privacy review

Build the advice carefully. Salary data can win trust or lose it quickly.
