# Recruiter Labs Candidate Transparency Roadmap

Audit date: 11 June 2026

## Status

Roadmap complete. Product build still staged.

This document connects the existing candidate transparency work into one build
plan. It does not launch a candidate portal, CV upload, automated WhatsApp
updates, live Loxo sync or any private candidate data feature.

The candidate experience should feel unusually honest for recruitment:

- clear jobs
- clear salary or rate position
- clear hybrid reality
- clear process
- simple application
- respectful communication
- private data
- no faff

## Audit Summary

Already in place:

- `/candidates`, `/jobs` and `/jobs/[slug]` routes.
- Draft jobs kept out of live lists, sitemap and AI index routes.
- Closed jobs noindexed and not open for applications.
- JobPosting schema only emitted for live jobs.
- Job copy standards in `docs/job-copy-standards.md`.
- Candidate transparency foundation in `docs/recruiter-labs-candidate-transparency.md`.
- Candidate Privacy Notice and candidate data/privacy request route.
- Active application consent and separate Candidate Privacy Notice acknowledgement.
- Optional LinkedIn/profile URL on candidate and job application flows.
- Staged `CandidateApplicationDrop` component with CV upload deliberately disabled.
- WhatsApp direct contact links for quick questions, without a widget, chatbot or pixel.
- WhatsApp Business and Loxo sync discovery kept private, metadata-first and disabled.
- Private operations data model direction: Sanity for public CMS, Postgres for private workflows.
- Server-only feature flags for candidate transparency work, default-off.

Still not live:

- CV upload.
- Private candidate status journey.
- Automated candidate WhatsApp updates.
- Loxo/WhatsApp candidate activity sync.
- Candidate portal.
- AI candidate evaluation or scoring.
- Any public feature that stores private candidate records.

## Product Vision

Build a candidate journey that answers the obvious questions before someone
applies.

A candidate should be able to see what the job is, what it pays, how hybrid
really works, why the role exists, what the process looks like, what happens
after applying, how their data is handled, and how to ask David a quick
question.

Internally, David should be able to spot weak job adverts before they go live:
hidden salary, vague hybrid, missing process, lazy requirements, risky privacy
copy or jargon. The system should help him publish better roles, not create a
slow corporate approval maze.

## Build Order

### Phase 1 - Audit And Standards

Status: mostly implemented.

Already covered:

- job copy standards
- banned phrases
- required public job fields
- candidate trust questions
- privacy/data boundaries
- server-only feature flags
- tests for job transparency gates

Finish before expanding:

- keep `docs/job-copy-standards.md` as the live editorial rulebook
- keep Sanity job schema labels plain English
- keep false salary, fake benefits and vague hybrid copy blocked from live roles

### Phase 2 - Job Page Improvements

Primary issue: #77.

Build and verify:

- role snapshot
- salary or day-rate display
- salary confidence status
- hybrid reality
- why the role exists
- must-haves and useful extras split
- interview process timeline
- what happens after applying
- candidate privacy note
- quick question route
- JobPosting schema only when the role is genuinely live

Public soon: yes, when each live job has real approved content.

Do not publish: placeholder salary, invented benefits, fake process certainty or
client-sensitive detail.

### Phase 3 - Application Flow

Primary issue: #78.

Build and verify:

- shorter application path
- LinkedIn/profile URL option
- optional CV drop only after secure storage is approved
- contact preference capture
- separate application consent and talent-pool consent
- Candidate Privacy Notice acknowledgement
- confirmation page or confirmation state
- confirmation email where Resend is configured

Public soon: LinkedIn/profile URL and simple application copy.

Must stay blocked: CV upload until private storage, virus scanning/manual review,
signed download access, retention, deletion and audit logging are approved.

### Phase 4 - Process Transparency

Primary issue: #79.

Build and verify:

- public interview steps on job pages
- confirmed vs indicative process status
- what-happens-next copy near application forms
- private internal status model for future candidate journey
- careful wording so candidates are informed without being over-promised

Public soon: process clarity on job adverts.

Private only: application status tracking tied to named candidates.

### Phase 5 - Candidate Communication

Primary issue: #80.

Build and verify:

- WhatsApp quick question route
- preferred contact method capture
- safe application acknowledgement
- future WhatsApp Business logistics only where consent and templates are approved
- opt-out and preference handling

Public soon: user-initiated WhatsApp questions and clear contact choices.

Must stay private: WhatsApp Business automation, Loxo matching, communication
timelines, phone hashes, opt-in/out records and audit events.

Do not use WhatsApp for rejections, offer withdrawals, difficult feedback,
sensitive salary negotiation or bulk job broadcasts. Phone first for bad news.

### Phase 6 - Internal Scorecard

Primary issue: #81.

Build and verify:

- candidate transparency score
- missing salary/rate warning
- missing hybrid reality warning
- missing process warning
- jargon warning
- privacy note warning
- readiness state before publishing
- private admin scorecard route at `/admin/recruiter-labs/candidate-transparency`

Public soon: no. This is an internal quality gate.

Keep it plain: the scorecard should warn David before a bad advert goes live. It
must not become candidate ranking, AI judgement or fake compliance theatre.

### Phase 7 - Future Candidate Portal

Primary future stream: after #77 to #81 and the client-portal foundations.

Consider only after the basics are reliable:

- application status
- profile update
- data preferences
- availability update
- interview prep
- communication preference changes
- DSAR/privacy request shortcuts

Public soon: no.

Must stay private until proven: any named candidate status, profile, CV,
preference or interview data.

## Dependencies

Technical dependencies:

- Railway Postgres live and migrated.
- `DATABASE_URL` and `OPERATIONS_DB_ENABLED=true` set outside GitHub.
- Audit logging live in production.
- Retention dry-run reviewed before destructive action.
- Admin access controls tested.
- Candidate file storage provider approved before CV upload.
- Signed private file access route before any CV download.
- Resend configured only with approved sender/domain settings.
- WhatsApp Business Cloud API enabled only after templates, consent and privacy
  wording are approved.
- Loxo integration enabled only after David approves the integration route,
  provider DPA, data boundary and opt-out rules.

Content dependencies:

- real salary/rate ranges
- real office location and hybrid rhythm
- real interview process or clear indicative caveat
- David-approved role reason and expectations
- client-approved public advert wording
- Candidate Privacy Notice wording reviewed for the live setup

Operational dependencies:

- who reviews applications
- how quickly David replies
- when a candidate is told there is no fit
- how candidate permission is captured before client submission
- how deletion/export/correction requests are handled
- how WhatsApp opt-out is honoured

## What Can Go Public Soon

These can be public once the actual content is true:

- clearer job page sections
- salary/rate confidence notes
- hybrid reality notes
- must-have/useful-extra split
- interview process wording
- what happens after applying
- Candidate Privacy Notice links
- user-initiated WhatsApp question links
- LinkedIn/profile URL application option
- noindexed closed job handling

These improve trust without storing extra private data.

## What Must Stay Private

Keep these behind admin, feature flags, private routes or future portals:

- named candidate records
- application status
- CV files
- CV text
- LinkedIn/profile data attached to a named candidate
- phone numbers and WhatsApp opt-in records
- WhatsApp message metadata and audit events
- Loxo IDs and sync status
- client shortlist feedback
- interview scheduling records
- AI drafts based on candidate material
- transparency scorecard before publish

Private candidate data belongs in Postgres or the approved CRM, not Sanity,
public analytics, GitHub, markdown docs or browser-visible scripts.

## Backend And Storage Requirements

Postgres should hold:

- candidate/application records
- consent records
- Candidate Privacy Notice version acknowledgement
- contact preferences
- talent-pool opt-in
- retention category and review date
- data/privacy request records
- audit logs
- future WhatsApp preference and opt-out metadata
- future Loxo reference IDs and sync events

Private object storage should hold:

- CV files, only after approval
- malware-scanned or manually reviewed file metadata
- retention and deletion metadata

Sanity should hold only:

- public job advert content
- public service/content pages
- public salary snapshots
- public-safe editor guidance

Sanity must not hold candidate names, emails, phone numbers, CVs, application
messages, private notes, WhatsApp logs or Loxo payloads.

## Legal And Privacy Review

This roadmap is technical guidance, not legal advice.

Review is needed before launch for:

- Candidate Privacy Notice final wording
- Privacy Policy updates for application, talent-pool and WhatsApp routes
- Cookie/analytics wording where candidate conversion events are measured
- CV storage and retention policy
- lawful basis and consent wording for candidate communications
- separate talent-pool opt-in
- WhatsApp Business templates and opt-out process
- Loxo/CRM data sharing and DPA position
- DSAR identity verification workflow
- deletion/export/correction process
- client submission consent wording
- AI provider terms if candidate material is ever processed

No fake compliance. If the process is not approved, the feature stays off.

## Suggested GitHub Issue Order

Recommended order from the current candidate transparency backlog:

1. #77 - Job pages: salary, hybrid, process and advert clarity.
2. #78 - Application UX: CV drop boundary and LinkedIn/profile option.
3. #79 - Process transparency: interview timeline and what happens next.
4. #80 - Candidate WhatsApp: quick questions and contact preferences.
5. #81 - Job scorecard: internal readiness checker before publishing.
6. Future candidate portal stream - status, profile update, data preferences,
   availability and interview prep after backend and privacy gates pass.

Supporting work already completed or linked:

- `docs/job-copy-standards.md`
- `docs/recruiter-labs-candidate-transparency.md`
- `docs/candidate-application-drop.md`
- `docs/candidate-data-journey.md`
- `docs/data-boundaries.md`
- `docs/recruiter-labs-whatsapp-crm-sync.md`
- `docs/feature-flags.md`

## Production Readiness

Ready now:

- roadmap
- standards
- public content boundaries
- staged application-drop UX
- feature flags
- tests for existing transparency gates

Not ready for production:

- CV upload
- candidate status portal
- automated WhatsApp updates
- WhatsApp/Loxo sync
- scorecard-as-publishing-gate
- any AI support touching real candidate material

David should approve each stage separately. The right standard is simple:
candidates get clearer information, David keeps control, and private data stays
private.
