# Recruiter Labs Candidate Transparency

## Status

Foundation implemented.

This does not launch a private candidate portal, CV upload flow or candidate
status tracker. It sets the standards and guardrails so job and application
work does not drift back into vague recruitment copy.

## Current Candidate Journey Audit

Already good:

- `/candidates` exists and speaks plainly.
- `/jobs` separates live roles from draft and closed roles.
- Candidate and job forms use active consent.
- Candidate Privacy Notice exists.
- Candidate data/privacy request route exists.
- WhatsApp is available as a quick human route.
- CV upload is deliberately not enabled until secure storage exists.
- Candidate form analytics uses safe event names and does not include PII.

The full build roadmap now lives in:

```txt
docs/recruiter-labs-candidate-transparency-roadmap.md
```

Improved in this pass:

- Candidate page now lists the practical questions a decent journey should
  answer.
- Jobs page now states what a live job advert should tell a candidate.
- Job detail pages now surface salary/rate status, hybrid reality, location
  expectation, process, data handling and quick-question route.
- Application form now supports a LinkedIn or profile URL without requiring a
  CV upload.

## Current Job Page Audit

Already good:

- Draft jobs are hidden from sitemap and live job lists.
- Closed jobs are noindexed and do not invite applications.
- JobPosting schema is only emitted for live jobs.
- Public job fields live in Sanity/content, not private candidate records.

Missing before this pass:

- salary confidence status
- salary transparency note
- real hybrid rhythm
- location expectation
- must-haves vs nice-to-haves
- interview-process steps
- what happens after applying
- data-handling note
- quick-question route
- code-level check for vague salary/process placeholders

## Feature Flags

Server-side flags added and off by default:

```txt
FEATURE_CANDIDATE_TRANSPARENCY_LABS=false
FEATURE_FLUFF_FREE_JOB_PAGES=false
FEATURE_CANDIDATE_APPLICATION_DROP=false
FEATURE_LINKEDIN_PROFILE_APPLICATION=false
FEATURE_CANDIDATE_STATUS_JOURNEY=false
FEATURE_CANDIDATE_WHATSAPP_QUESTIONS=false
FEATURE_INTERVIEW_PROCESS_TRANSPARENCY=false
FEATURE_CANDIDATE_TRANSPARENCY_SCORECARD=false
```

These are planning and release-control flags. They do not override privacy,
consent, storage or legal checks.

The private scorecard implementation note lives in:

```txt
docs/recruiter-labs-candidate-transparency-scorecard.md
```

## Job Page Standards

A live role should clearly state:

- what the job really is
- why the role exists
- salary or rate range
- whether salary/rate is verified or indicative
- location expectation
- real hybrid or office rhythm
- permanent, interim or contract status
- must-haves
- useful extras
- interview process
- what happens after applying
- candidate data handling
- how to ask David a quick question
- whether the role is still live

No hidden salary. No vague hybrid. No "Rockstar". No "Ninja". No faff.

## Salary And Rate Rules

- Do not publish a live role with `Add confirmed salary`, `TBC`,
  `competitive`, `DOE` or similar.
- Use `verified` when David has confirmed the range/rate.
- Use `indicative` only when it is genuinely useful and clearly explained.
- Keep `unverified` jobs in draft.
- Do not invent salary data to make a page look complete.

## Hybrid Working Rules

Every live role should explain:

- office location
- expected office rhythm
- any client-site or travel requirement
- whether remote flexibility is real or occasional

"Hybrid" on its own is not enough.

## Application UX Principles

The public form should stay short:

- name
- email
- optional phone
- optional LinkedIn/profile URL
- short note
- preferred contact method
- active consent

CV upload remains blocked until private storage, validation, virus scanning,
retention and audit logging are approved.

## LinkedIn/Profile Application Option

Staged now:

- Candidate/job forms accept a LinkedIn or profile URL.
- The form copy makes this optional.
- Private candidate/application records should store profile URLs in Postgres,
  not Sanity.

Still blocked:

- full profile-first application workflow
- candidate status tracker
- automated profile enrichment

## Privacy And Consent Rules

- Candidate consent must be active, not pre-ticked.
- Marketing consent must not be bundled into application consent.
- Candidate PII must not go to Sanity.
- Candidate PII must not go to GA4/GTM.
- CVs must not be stored in `/public`.
- Candidate details should use Railway/Postgres once private operations are
  configured.

This is technical guidance, not legal advice.

## WhatsApp Candidate Communication Rules

Allowed now:

- user-initiated WhatsApp links for quick questions
- consent-aware click tracking without candidate PII

Still blocked until approved:

- automated WhatsApp status updates
- interview logistics templates
- CRM/Loxo matching
- WhatsApp message storage beyond safe status metadata

## Launch Checklist

Before a role goes live:

- salary/rate is confirmed or honestly marked indicative
- salary note is plain English
- location expectation is clear
- hybrid rhythm is clear
- role purpose is clear
- must-haves and useful extras are separated
- interview process is listed
- what happens after applying is listed
- Candidate Privacy Notice is linked
- quick-question route is available
- no buzzword jargon is present
- no private client or candidate information is published
- no fake salary, proof or job data is invented

Before future candidate-lab features:

- Railway Postgres is live and migrated
- private CV storage is approved
- audit logging is proven in production
- retention/DSAR process is approved
- WhatsApp templates are reviewed
- candidate status wording is legally reviewed
- feature flags are deliberately enabled

## What Is Implemented

- Central server-only candidate transparency flags.
- Candidate trust questions and job-page standards.
- Job transparency fields in the shared Job type.
- Draft job content updated with safe placeholders.
- Live-job helper now blocks vague/unverified/placeholder job adverts from being
  treated as live.
- Sanity job schema has public transparency fields.
- Jobs and candidates pages explain the standard.
- Job detail pages show transparency panels.
- Application form supports LinkedIn/profile URL.
- Tests cover flags, candidate standards and the live-job transparency gate.

## What Remains Blocked

- CV upload.
- Candidate portal/status tracker.
- Automated candidate WhatsApp updates.
- LinkedIn enrichment or scraping.
- Loxo candidate sync.
- Any client-facing candidate presentation workflow.

Candidates should never feel like they are applying into a black hole.

Clear role. Clear salary. Clear process. Clear data handling. No faff.
