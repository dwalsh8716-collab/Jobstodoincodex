# AI Reliability Report

Date: 2026-08-18

## Current State

The current product does not call OpenAI yet. Availability extraction and intent
classification are handled by `RuleBasedAvailabilityParser` in
`backend/app/services/availability_parser.py`.

This is safer than a half-built model integration because external emails cannot
currently inject model instructions or trigger free-form AI actions. It is also
below the intended product brief because complex replies are not understood well
enough for production recruitment coordination.

## Evidence

- No OpenAI SDK or API call was found in backend requirements or app code.
- The parser is deterministic and rule-based.
- Parsed results are stored in `availability_windows` with `confidence`,
  `original_text` and `interpretation`.
- Reschedule and cancellation intent detection is keyword-based.
- No model output is currently able to mutate calendar state.

## OpenAI Implementation Gap

The original brief requires the OpenAI Responses API with structured outputs for
availability extraction and intent classification.

OpenAI's current documentation recommends the Responses API for direct model
requests and notes that reasoning models perform better through Responses:
https://platform.openai.com/docs/guides/text?api-mode=responses

OpenAI's structured output documentation says Structured Outputs are available
through function calling or JSON schema response formats, and that Structured
Outputs should be preferred over JSON mode where possible:
https://platform.openai.com/docs/guides/structured-outputs

The product should therefore add an `AIProvider` only behind strict schemas and
never let raw model text directly change workflow or calendar state.

## P0 Findings

### P0-AI-001: Future AI integration has no enforceable safety contract yet

Risk: A future model provider could be added quickly and allowed to change
workflow state from untrusted email content.

Current evidence: Provider abstractions exist for email/calendar/CRM, but no
`AIProvider` interface or schema validation layer exists.

Required fix:

- Add an `AIProvider` interface before any OpenAI call is introduced.
- Use Responses API structured outputs with strict JSON schemas.
- Validate outputs with Pydantic before storage.
- Treat model output as advisory data only.
- Require deterministic code for date arithmetic, timezone conversion, overlap
  calculation and calendar mutation.
- Add prompt-injection fixtures before enabling model parsing.

## P1 Findings

### P1-AI-001: No model routing or cost tracking exists

Risk: When AI is added, every task may use an unnecessarily expensive model, or
costs may become invisible.

Recommended fix:

- Use the rule-based parser first.
- Route routine extraction/classification to a low-cost reliable model.
- Route complex ambiguous thread interpretation to a stronger model only when
  necessary.
- Store request count, input tokens, output tokens, model, estimated cost,
  workflow ID and purpose.

### P1-AI-002: No eval suite exists for prompt changes

Risk: Prompt edits can silently degrade parsing and cause wrong interview times.

Recommended fix:

- Add fixture-based evals for UK scheduling phrases.
- Include adversarial instructions such as "ignore previous instructions".
- Include long email threads, quoted replies, signatures and mobile replies.
- Require regression tests before prompt changes.

## Prompt-Injection Requirements

External email bodies must always be treated as untrusted input.

The model instruction boundary should be:

- system/developer instructions: app rules and safety constraints
- structured input: sender, participant type, reference date, timezone, current
  workflow state
- untrusted content: email body as quoted data only

The model must never be given tools that can send email, delete records, update
settings or mutate calendar state. It should only return a validated structured
classification/extraction result.

## Proposed Structured Output Schemas

Availability extraction:

```json
{
  "intent": "availability_response",
  "confidence": 0.96,
  "availability": [
    {
      "date": "2026-08-20",
      "start": "14:00",
      "end": "17:00",
      "timezone": "Europe/London",
      "source_text": "Thursday after 2",
      "ambiguity_notes": []
    }
  ],
  "requires_clarification": false,
  "clarification_question": null
}
```

Intent classification:

```json
{
  "intent": "reschedule_request",
  "confidence": 0.93,
  "actor": "candidate",
  "requires_recruiter_approval": true,
  "reason": "The sender asks to move the confirmed interview."
}
```

## Safe Model Routing Proposal

| Task | First step | Model if needed | Approval needed |
|---|---|---|---|
| Simple phrase parse | Rule-based parser | None | No |
| Common availability extraction | Rule-based then low-cost model | `gpt-5.6-luna` equivalent | No, if confidence high |
| Ambiguous availability | Rule-based then low-cost model | `gpt-5.6-luna` equivalent | Clarification or recruiter review |
| Complex thread summary | Deterministic trimming then stronger model | `gpt-5.6-terra` equivalent | Internal only |
| Reschedule/cancel detection | Rules plus model validation | Low-cost model | Yes for action |
| Message drafting | Template first | Low-cost model only for variants | Configurable |
| Calendar/date calculation | Deterministic code | Never | Recruiter approval for booking |

## Verdict

AI risk is currently low because AI is not live. AI capability is also not yet
where the product brief wants it. Add OpenAI only after the deterministic parser
P0 fixes, strict schemas, prompt-injection tests and cost telemetry are in place.
