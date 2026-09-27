# Custom Codex Code Review Rules

Date: 2026-08-24

Use these rules when reviewing changes to the Interview Coordination Agent.

## Critical Rules

1. Flag any calendar mutation that can happen without backend recruiter approval.
2. Flag any calendar/email mutation without idempotency or retry protection.
3. Flag unvalidated LLM output that changes workflow state.
4. Flag any ambiguous availability parsing that guesses a date/time silently.
5. Flag timezone/date arithmetic performed by an LLM.
6. Flag missing workflow/audit event writes on state transitions.
7. Flag PII or OAuth tokens in logs.
8. Flag committed secrets or credentials.
9. Flag public endpoints without token validation and rate limiting.
10. Flag OAuth callbacks that do not verify state.
11. Flag webhook handlers without signature verification and duplicate handling.
12. Flag approval, cancellation or reschedule endpoints that trust frontend state.
13. Flag scheduling logic that blocks candidate/client interviews on the
    recruiter's calendar unless `CHECK_RECRUITER_CALENDAR_CONFLICTS=true`.

## High-Priority Rules

1. Flag new workflow states without tests.
2. Flag parser changes without UK phrase fixtures.
3. Flag calendar event creation before durable DB intent/outbox storage.
4. Flag message body retention changes without privacy review.
5. Flag integrations that introduce Loxo dependency into MVP core.
6. Flag OpenAI calls that do not use Responses API structured outputs.
7. Flag OpenAI calls that send full email threads by default.
8. Flag UI buttons that appear actionable but have no handler.
9. Flag dashboard status views that mix unrelated workflow states.
10. Flag migrations missing for model/schema changes.

## Review Checklist

- Does this preserve human approval before final booking?
- Does it avoid guessing ambiguous availability?
- Does it store all times in UTC and display local timezone clearly?
- Does it handle BST and timezone conversion deterministically?
- Does it avoid sending internal notes to candidates/clients/calendar invites?
- Does it keep candidate/client calendar connection out of V1?
- Does it keep recruiter calendar conflict checks optional and off by default?
- Does it keep the app independent of Loxo?
- Does it include regression tests for any critical bug fixed?
- Does it fail visibly instead of silently?
- Does it use plain, human UK recruiter communication?
