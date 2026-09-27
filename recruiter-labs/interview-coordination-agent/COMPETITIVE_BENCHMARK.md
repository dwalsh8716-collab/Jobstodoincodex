# Competitive Benchmark

Date researched: 2026-08-18

Sources used:

- Calendly features: https://calendly.com/features
- Calendly browser extensions: https://calendly.com/features/browser-extensions
- GoodTime Hire: https://goodtime.io/products/hire/
- ModernLoop scheduling: https://www.modernloop.com/scheduling/
- Paradox conversational scheduling: https://www.paradox.ai/products/conversational-scheduling
- Ashby scheduling defaults: https://docs.ashbyhq.com/setting-scheduling-defaults
- Ashby Scheduling 2.0: https://www.ashbyhq.com/product-updates/ashby-scheduling-2-0
- Greenhouse scheduling and calendars: https://support.greenhouse.io/hc/en-us/sections/4405927206939-Scheduling-and-calendars
- Lever scheduling: https://help.lever.co/s/article/Scheduling-interviews
- Microsoft Bookings overview: https://learn.microsoft.com/en-us/microsoft-365/bookings/bookings-overview
- Microsoft Bookings FAQ: https://learn.microsoft.com/en-us/microsoft-365/bookings/bookings-faq
- Google Calendar appointment scheduling: https://workspace.google.com/resources/appointment-scheduling/
- Google Calendar appointment schedules help: https://support.google.com/calendar/answer/10729749
- Loxo/Arrange product update: https://www.loxo.co/product-updates/bye-bye-back-and-forth-loxo-arrange-eliminates-the-middleman

## Benchmark Summary

The market has split into three useful categories:

1. General scheduling tools: Calendly, Google Calendar appointment schedules,
   Microsoft Bookings.
2. Recruiting-specific ATS scheduling: Ashby, Greenhouse, Lever, Loxo plus
   partners.
3. Recruiting coordination platforms: GoodTime, ModernLoop, Paradox, Arrange.

This product's opportunity is not to out-Calendly Calendly. The wedge is the
agency/search coordination problem: recruiter in the middle, external client,
external candidate, natural recruiter tone, manual CRM independence and human
approval before anything sensitive happens.

## Capability Comparison

| Capability | Current app | Best-in-class reference | Gap |
|---|---|---|---|
| Manual interview setup | Yes | All tools | Good |
| Candidate/client availability collection | Yes, simple links/text | Calendly, Ashby, Greenhouse, Google Calendar | Needs custom slots and settings |
| Recruiter approval gate | Yes | Recruiting tools vary | Strong for agency/search control |
| Gmail send/sync | Early | General tools plus ATS integrations | Needs background sync/webhooks |
| Google Calendar event creation | Yes | Calendly, Google, ATS tools | Needs conflict checks |
| Google Meet creation | Yes | Google/Ashby/Greenhouse-style tools | Good for V1 |
| Calendar conflict checking | Not real yet | Calendly, Microsoft Bookings, Google appointment schedules | Critical gap |
| Panel scheduling | Invite only | GoodTime, ModernLoop, Paradox, Ashby | Major gap |
| Rescheduling | Detection only | Calendly/GoodTime/ModernLoop/Paradox/Ashby | Critical gap |
| Cancellations | Detection only | Calendly/Bookings/ATS tools | Critical gap |
| Automated reminders | Records only | Calendly, Bookings, Ashby, GoodTime | Gap |
| Chasing no replies | Not implemented | Recruiting coordinators and ATS automation | Gap |
| Candidate portal | Basic public link | GoodTime/Ashby style portals | Good MVP, needs polish |
| SMS/WhatsApp | Not implemented | GoodTime, Paradox | Not needed for V1 without consent design |
| Analytics | Not implemented | Calendly analytics, GoodTime reporting, ATS reports | Later |
| ATS/CRM integration | Manual only | Greenhouse/Lever/Ashby/Loxo integrations | Deliberate V1 choice |

## What We Match Already

- Manual start from recruiter-entered details.
- Human approval before confirmed booking.
- Natural UK recruiter message templates.
- No Loxo dependency.
- Public availability collection without asking candidate/client to connect a
  calendar.
- Google Meet creation once Google is connected.

## What We Exceed For This Niche

- The product is more suited to agency/search three-party coordination than a
  plain one-person booking link.
- The message tone is warmer and more recruiter-like than many default ATS
  templates.
- The manual CRM summary is practical for a firm keeping Loxo as source of
  truth but not depending on it.

## What We Lack

P0/P1 competitive gaps:

- Real calendar free/busy checks.
- Idempotent calendar operations.
- Background email sync.
- Reschedule completion.
- Cancellation approval completion.
- Reminder/chase worker.
- Public picker custom slots.
- Production auth/session/security.
- Retention/deletion controls.

P2 gaps:

- Panel scheduling logic.
- Candidate self-reschedule links with limits.
- Interviewer load balancing.
- Scheduling analytics.
- Slack/Teams internal notifications.

## Features Not Worth Building Yet

- Candidate/client calendar connection in V1. It adds friction and privacy
  concerns. Simple availability links are better for agency recruitment.
- Full ATS replacement. Loxo remains the CRM/ATS.
- SMS/WhatsApp until consent, retention and opt-out handling are designed.
- AI candidate assessment. Out of scope and risky.
- Salary negotiation automation. Keep human.

## Product Direction

Build toward a "quiet recruitment coordinator" rather than a public booking page.

The best next product improvements are:

1. calendar conflict checks
2. robust public availability picker
3. background Gmail sync and reminders
4. idempotent approval/calendar operations
5. reschedule/cancellation completion flows
6. privacy and security hardening
