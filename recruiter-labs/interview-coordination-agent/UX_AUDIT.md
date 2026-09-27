# UX Audit

Date: 2026-08-18

## Recruiter Workflow Verdict

The product is understandable for an internal MVP. A recruiter can start an
interview, see status, record replies, approve a slot and copy a CRM summary.

It does not yet give enough confidence for unattended real-world coordination
because several visible controls are not wired, provider failures are not
explained in plain operational terms, and the dashboard can show misleading data
in empty sections.

## Strengths

- The first screen is the working internal tool, not a marketing page.
- The main workflow sections match a recruiter mental model:
  - New Interview
  - Today
  - Awaiting Responses
  - Needs Approval
  - Upcoming
  - Reschedules
  - Completed
  - Activity Log
- Google connection status is visible.
- Real delivery/calendar status is shown after Google is connected.
- Public availability picker is far easier for candidates/clients than asking
  them to connect calendars.
- Confirmation and availability messages are concise and natural.

## P0/P1 Findings

### P1-UX-001: Empty dashboard sections fall back to all interviews

Risk: The recruiter clicks "Today" or "Awaiting Responses" and sees unrelated
interviews, which damages trust.

Evidence: `frontend/app/page.tsx` uses `section.items.length ? section.items :
interviews`.

Fix: Show the section empty state unless the user is in global search/history.

Status after audit fixes: implemented.

### P1-UX-002: Approval actions are visible but inert

Risk: Recruiter thinks they can request more availability, change time or cancel
from the card, but the buttons do nothing.

Evidence: `Select Alternative`, `Change Time`, `Request More Availability` and
`Cancel Workflow` have no handlers.

Fix: Implement the actions or temporarily disable/hide them with honest copy.

Status after audit fixes: temporarily disabled with explanatory tooltips pending
safe backend actions.

### P1-UX-003: Mock Inbox label is confusing once Gmail is connected

Risk: Recruiter may not understand whether they are sending/reading real email.

Fix:

- Rename to "Manual test replies" in mock mode.
- In Gmail mode, show "Gmail reply sync" and unmatched reply counts.
- Keep test reply boxes clearly marked as local/test tools.

### P1-UX-004: Failure states are too technical/generic

Risk: When Google/Gmail/calendar fails, the recruiter needs "what happened, who
is affected, what action is needed".

Fix:

- Add recruiter-facing failure cards.
- Include affected participant and message/event.
- Offer retry/reconnect/review actions.

## Public Availability Picker

Current picker:

- 5 business days
- Morning
- Early afternoon
- Late afternoon
- Notes

This is a good V1 direction. It avoids the mess of asking candidates/clients to
connect calendars and keeps admin simple.

Recommended next step:

- Keep the simple quick-pick layout.
- Add a "Custom time" row for precise windows.
- Show timezone clearly.
- Respect preferred date range.
- Let the recruiter choose how many days the link offers.

## Time Targets

| Task | Target | Current Assessment |
|---|---:|---|
| Start interview | under 60 seconds | Plausible with saved defaults, not yet measured |
| Approve slot | under 10 seconds | Plausible |
| Understand current status | immediate | Good at high level, weak on failures |
| Candidate/client submit availability | under 45 seconds | Good; quick blocks and exact custom times now available |

## Verdict

The UX is a promising MVP, especially the public availability link. Before real
client/candidate use, the app must remove inert controls, fix dashboard section
truthfulness and make integration failures crystal clear.
