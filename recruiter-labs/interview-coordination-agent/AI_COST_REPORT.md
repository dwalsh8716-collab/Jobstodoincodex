# AI Cost Report

Date: 2026-08-18

## Current Cost Position

Current OpenAI usage: none.

Current estimated AI cost per interview: GBP 0 / USD 0.

The app does not currently make OpenAI API calls, so there are no live token
costs, no model routing, and no AI telemetry.

## Reference Pricing Source

OpenAI pricing is time-sensitive. Prices below were checked on 2026-08-18 from
the official pricing page:

https://platform.openai.com/docs/pricing

The page lists prices per 1M tokens and currently shows, for short context,
`gpt-5.6-luna` at $0.20 input / $1.20 output, `gpt-5.6-terra` at $2.00 input /
$12.00 output, and `gpt-5.6-sol` at $5.00 input / $30.00 output in the standard
flagship section.

## Proposed Tracking

Add an `ai_usage_events` table before enabling AI:

| Field | Purpose |
|---|---|
| `id` | usage event ID |
| `interview_id` | cost per workflow |
| `purpose` | extraction, classification, drafting, summary |
| `model` | model used |
| `input_tokens` | billing and optimisation |
| `output_tokens` | billing and optimisation |
| `estimated_cost_usd` | cost tracking |
| `cache_hit` | prompt caching visibility |
| `latency_ms` | performance |
| `status` | success, timeout, schema_invalid, provider_error |
| `created_at` | reporting |

## Guardrails

- Do not send full email threads unless a thread-summary task explicitly needs
  it.
- Trim quoted replies and signatures before model calls.
- Cache parsed message results.
- Do not call a model again for the same provider message ID.
- Prefer deterministic templates over model-generated routine emails.
- Use low-cost models for routine extraction and classification.
- Use stronger models only for complex thread interpretation or ambiguity review.

## Example Cost Model

Typical interview, once AI exists:

| Step | Calls | Estimated tokens | Model tier |
|---|---:|---:|---|
| Candidate reply extraction | 1 | 600 in / 150 out | low cost |
| Client reply extraction | 1 | 600 in / 150 out | low cost |
| Reschedule/cancel classification | 0-1 | 400 in / 100 out | low cost |
| Thread summary on exception | 0-1 | 2,000 in / 400 out | mid tier |

Target:

- Routine successful booking: under USD 0.01-0.03 in model cost.
- Exception workflow: under USD 0.05-0.15 unless a long-thread summary is needed.

## Verdict

The current product has no AI spend risk because it uses no OpenAI calls. The
risk begins when AI is introduced, so cost telemetry and model routing should be
implemented before the first production OpenAI integration is switched on.
