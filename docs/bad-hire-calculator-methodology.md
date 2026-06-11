# Bad Hire Calculator Methodology

This documents the staged Labs calculator:

```txt
/admin/labs/bad-hire-calculator
```

Status: private preview only. Not public. Not financial advice.

## Principle

Help clients see the commercial risk of poor hiring without scaremongering.

Evidence-led. Caveated. Premium. No fake maths. No faff.

## Methodology

The calculator estimates a range, not a single truth.

It combines:

- direct recruitment cost
- lost productivity while the wrong hire is in role
- management time wasted
- vacancy drag during replacement hiring
- team disruption
- agency/client impact
- interim cover
- delayed commercial or campaign impact
- replacement search time

It then applies three scenario multipliers:

- conservative
- realistic
- high-risk

This creates a sensible range for a commercial conversation. The point is to
help David and the client tighten the brief before more time or money is wasted.

## Assumptions

The current staged defaults are editable before launch:

| Assumption | Default |
| --- | ---: |
| Recruitment/search fee estimate | 22% of salary |
| Direct recruitment fallback | GBP 7,500 |
| Productivity loss while failing | 45% |
| Management day cost | GBP 650 |
| Vacancy cost multiplier | 35% of salary day cost |
| Replacement search weeks | 8 |
| Interim cover day rate | GBP 700 |
| Opportunity cost multiplier | 50% |
| Team disruption rate | 8% of salary |
| Agency/client impact rate | 6% of salary |

These are deliberately conservative working assumptions for senior marketing,
communications, agency leadership and Strategic Interim conversations. They must
be reviewed before public use.

## Source Context

Useful calibration sources:

- CIPD Resourcing and Talent Planning Report 2024:
  https://www.cipd.org/uk/knowledge/reports/resourcing-surveys/
- Oxford Economics/Unum, The Cost of Brain Drain:
  https://www.oxfordeconomics.com/resource/the-cost-of-brain-drain/
- SHRM 2025 benchmarking release:
  https://www.shrm.org/about/press-room/shrm-releases-2025-benchmarking-reports--how-does-your-organizat
- SHRM cost-per-hire explainer:
  https://www.shrm.org/topics-tools/news/talent-acquisition/real-costs-recruitment

How these sources should be used:

- CIPD gives UK resourcing and recruitment-cost context.
- Oxford Economics/Unum is useful because it separates logistical replacement
  cost from lost output while someone reaches full productivity.
- SHRM is useful for cost-per-hire benchmarking, especially the reminder that
  executive hiring costs can be materially higher than non-executive hiring.

None of these sources gives a perfect number for a specific Essential
Resourcing client brief. The calculator must say that plainly.

## What The Calculator Does Not Know

It does not know:

- true lost revenue
- exact team morale impact
- brand or client relationship damage
- whether the brief was wrong or the hiring process failed
- how strong the replacement market is
- whether interim cover is possible
- whether the salary/rate is realistic for the brief
- what the client would have achieved with a better hire

That is why the output is an estimate and why David's judgement still matters.

## Why Outputs Are Estimates

The model uses broad ranges and editable assumptions because hiring risk is not
clean arithmetic.

Two roles with the same salary can carry very different risk:

- a retained search for a marketing director
- a client-side performance role with weak data
- an agency leadership role with staff retention risk
- a Strategic Interim gap during a major commercial reset

The calculator should surface the conversation, not pretend to settle it.

## Lead Capture Flow

Future lead actions:

- email me the results
- WhatsApp David
- book a 15-minute call
- sense-check the brief

If emailing results, store the lead privately in Postgres.

Do not send private result data, salary data, company names or contact notes to
GA4 or GTM.

## Privacy Safeguards

Rules:

- private/admin preview only until launch approved
- no public route until assumptions are reviewed
- no PII in analytics
- no secrets in GitHub
- no Sanity storage for private lead/result data
- Postgres only for lead capture
- explicit consent before follow-up
- privacy notice acknowledgement for emailed results

## Legal And Commercial Disclaimer

This calculator is a business-estimate tool. It is not financial, legal,
accounting or employment advice.

Before public launch, David must approve:

- the assumptions
- the source caveats
- the result wording
- the privacy wording
- the lead capture consent wording
- the follow-up process

## Blockers

Blocked before public launch:

- public route
- lead email delivery
- CRM handoff
- PDF/export
- assumption editing UI
- final source review
- legal/privacy review
- David approval

Useful, not scary. Commercial, not gimmicky.
