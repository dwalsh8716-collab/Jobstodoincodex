# Feature Flags

Audit date: 11 June 2026

## Status

Green for safe future build work.

The site already had a good server-side feature flag pattern. This pass did not
replace it.

What now exists:

- typed flag names in code
- one central server-only registry at `src/lib/feature-flags.ts`
- defaults in `.env.example`
- validation in `src/lib/env.ts`
- tests that keep flags private, default-off and out of public pages

## Plain-English Rule

Feature flags are safety switches.

They are not passwords. They are not legal approval. They are not a way to make
private candidate or client data public.

Every flag below defaults to `false`. To turn one on, the value must be exactly
`true`.

## Current Recommendation

Keep all Recruiter Labs, AI Ops and candidate transparency flags off in
production until the relevant launch gate has passed.

For now, use them only for protected admin planning and synthetic testing.

## Public Safety

None of the current flags is a public browser flag.

- They are server-side only.
- They are not named `NEXT_PUBLIC_*`.
- They must not contain secrets.
- They must not control access to private data on their own.
- Public pages should not import private Labs helper code.

If a future feature needs a public flag, create a separate issue and review the
privacy, bundle size and search-index impact first.

## Railway Instructions

In Railway:

1. Open the project.
2. Open the website service.
3. Go to Variables.
4. Add or edit the flag name exactly as shown below.
5. Use `false` to keep it off.
6. Use `true` only after David approves that specific feature.
7. Redeploy the service after changing the value.

To disable quickly, set the flag back to `false` and redeploy.

Do not put API keys, passwords, tokens, candidate names, client names or private
notes in feature flag values.

## Master Flag List

| Flag                                       | Default | Safe for public now? | Controls                                                          |
| ------------------------------------------ | ------- | -------------------- | ----------------------------------------------------------------- |
| `FEATURE_LABS_ENABLED`                     | `false` | No                   | Protected Labs admin planning surface.                            |
| `FEATURE_SALARY_GUIDE_GATE`                | `false` | No                   | Future gated salary guide lead-capture flow.                      |
| `FEATURE_SALARY_BENCHMARK_ASSET`           | `false` | No                   | Future bespoke salary benchmarking asset builder.                 |
| `FEATURE_MARKET_MAPPING`                   | `false` | No                   | Future market mapping visuals.                                    |
| `FEATURE_BAD_HIRE_CALCULATOR`              | `false` | No                   | Future bad-hire cost calculator.                                  |
| `FEATURE_FUNCTIONAL_MATRIX`                | `false` | No                   | Future role and search-shape mapping.                             |
| `FEATURE_CLIENT_SHORTLIST_PORTAL`          | `false` | No                   | Future protected client shortlist portal.                         |
| `FEATURE_AI_BRIEF_BUILDER`                 | `false` | No                   | Future AI-assisted brief drafting and client diagnostic.          |
| `FEATURE_INTERIM_BENCH_PORTAL`             | `false` | No                   | Future Strategic Interim bench workflow.                          |
| `FEATURE_INTERIM_AVAILABILITY_TOGGLE`      | `false` | No                   | Future private interim availability magic-link updates.           |
| `FEATURE_LIVE_MARKET_DASHBOARDS`           | `false` | No                   | Future live market intelligence dashboards.                       |
| `FEATURE_RECRUITER_LABS_ENABLED`           | `false` | No                   | Protected Recruiter Labs client-pipeline foundation.              |
| `FEATURE_CLIENT_PRESENTATION_PORTAL`       | `false` | No                   | Future magic-link shortlist presentation portal.                  |
| `FEATURE_BRANDED_CANDIDATE_PROFILES`       | `false` | No                   | Future David-approved candidate profile cards.                    |
| `FEATURE_SHORTLIST_FEEDBACK_TRACKING`      | `false` | No                   | Future client shortlist feedback and private engagement tracking. |
| `FEATURE_RETAINED_SEARCH_DASHBOARD`        | `false` | No                   | Future aggregate-only retained search dashboard.                  |
| `FEATURE_INTERVIEW_REQUEST_WORKFLOW`       | `false` | No                   | Future interview request workflow.                                |
| `FEATURE_WHATSAPP_INTERVIEW_SCHEDULING`    | `false` | No                   | Future WhatsApp interview logistics.                              |
| `FEATURE_WHATSAPP_CRM_SYNC`                | `false` | No                   | Future WhatsApp webhook-to-candidate activity sync.               |
| `FEATURE_LOXO_INTEGRATION`                 | `false` | No                   | Future Loxo API handoff or activity write-back.                   |
| `FEATURE_WHATSAPP_MESSAGE_LOGGING`         | `false` | No                   | Future metadata-only WhatsApp communication timeline.             |
| `FEATURE_WHATSAPP_LOGISTICS_AUTOMATION`    | `false` | No                   | Future approved-template logistics automation.                    |
| `FEATURE_GOOGLE_MEET_INTERVIEW_SCHEDULING` | `false` | No                   | Future Google Calendar and Meet orchestration.                    |
| `FEATURE_AI_CANDIDATE_SUMMARIES`           | `false` | No                   | Future AI-assisted candidate summary drafts.                      |
| `FEATURE_DAVIDS_AUDIO_NOTES`               | `false` | No                   | Future David-approved private audio notes for client profiles.    |
| `FEATURE_CANDIDATE_TRANSPARENCY_LABS`      | `false` | No                   | Candidate transparency planning stream.                           |
| `FEATURE_FLUFF_FREE_JOB_PAGES`             | `false` | No                   | Future stricter job page publishing gate. Public clarity fields are safe now. |
| `FEATURE_CANDIDATE_APPLICATION_DROP`       | `false` | No                   | Future live CV upload route. Profile-or-note applications are safe without it. |
| `FEATURE_LINKEDIN_PROFILE_APPLICATION`     | `false` | No                   | Future richer LinkedIn/profile parsing. Candidate-supplied profile links are allowed. |
| `FEATURE_CANDIDATE_STATUS_JOURNEY`         | `false` | No                   | Future private candidate status updates.                          |
| `FEATURE_CANDIDATE_WHATSAPP_QUESTIONS`     | `false` | No                   | Candidate WhatsApp quick questions and preference workflow.       |
| `FEATURE_INTERVIEW_PROCESS_TRANSPARENCY`   | `false` | No                   | Interview process timeline and next-step clarity on roles.        |
| `FEATURE_CANDIDATE_TRANSPARENCY_SCORECARD` | `false` | No                   | Private job-advert readiness checker before publishing.           |
| `FEATURE_AI_OPS_COMPRESSION`               | `false` | No                   | Future AI support for reducing admin typing.                      |
| `FEATURE_AI_INTERVIEW_NOTES`               | `false` | No                   | Future interview note structuring.                                |
| `FEATURE_AI_SCORECARD_NOTES`               | `false` | No                   | Future scorecard note organisation, not candidate scoring.        |
| `FEATURE_AI_CANDIDATE_SUMMARY_DRAFTS`      | `false` | No                   | Future candidate summary drafts for David review.                 |
| `FEATURE_CV_ANONYMIZATION`                 | `false` | No                   | Future private CV redaction drafts for David review.              |
| `FEATURE_AI_CLIENT_PROFILE_DRAFTS`         | `false` | No                   | Future client profile drafts behind approval.                     |
| `FEATURE_AI_FOLLOW_UP_DRAFTS`              | `false` | No                   | Future follow-up draft support, no automatic sending.             |

## Recruiter Labs Portal Config

`RECRUITER_LABS_CLIENT_TOKEN_EXPIRY_DAYS` controls future client shortlist link
expiry. It defaults to 30 days and is capped in code at 90 days.

Keep the default unless David approves a shorter or longer private-beta window.
This is not a secret and must not contain a token.

`FEATURE_FUNCTIONAL_MATRIX` must stay `false` until David approves private
preview with real role or client data. The protected preview lives at
`/admin/labs/functional-matrix`; the implementation note lives in
`docs/labs-functional-matrix.md`. It is an advisory scoping tool, not candidate
scoring or automated matching.

`FEATURE_BAD_HIRE_CALCULATOR` must stay `false` until assumptions, source
caveats, privacy wording and lead capture are approved. The protected preview
lives at `/admin/labs/bad-hire-calculator`; the methodology note lives in
`docs/bad-hire-calculator-methodology.md`. Outputs are estimates for a
conversation, not financial advice.

`INTERIM_AVAILABILITY_TOKEN_EXPIRY_DAYS` controls future Strategic Interim
availability magic links. It defaults to 14 days and is capped in code at 45
days. It is not a secret and must not contain a token.

`FEATURE_SHORTLIST_FEEDBACK_TRACKING` must stay `false` until the client portal,
Postgres, audit proof, candidate-sharing wording and David approval are all in
place. When enabled, feedback goes to private Postgres records, not GA4.

`FEATURE_INTERIM_AVAILABILITY_TOGGLE` must stay `false` until Postgres is
migrated, candidate consent/preference wording is approved, and David has tested
the private link flow. WhatsApp distribution must only happen where the
candidate has the right WhatsApp consent/preference.

`FEATURE_WHATSAPP_CRM_SYNC` must stay `false` until the official Meta webhook is
configured with `WHATSAPP_BUSINESS_APP_SECRET`, Railway Postgres is migrated,
the 24-hour WhatsApp service-window process is approved, and privacy/legal
wording has been reviewed. When enabled, the webhook stores status/activity
metadata only. It does not store raw WhatsApp message text or raw phone numbers.

`FEATURE_LOXO_INTEGRATION`, `FEATURE_WHATSAPP_MESSAGE_LOGGING` and
`FEATURE_WHATSAPP_LOGISTICS_AUTOMATION` must stay `false` until David confirms
the Loxo route, provider DPA, consent wording, opt-out process and retention
rules. The discovery report lives in
`docs/recruiter-labs-whatsapp-crm-sync.md`. Payemoji, Ringover, TalentLynk,
Twilio, Bird, Infobip and automation tools are options to review, not approvals.

`FEATURE_WHATSAPP_INTERVIEW_SCHEDULING` must stay `false` until David approves
the exact interview logistics templates, the private interview request fields
are migrated, WhatsApp consent/preference capture is clear, and the manual
fallback route is agreed. It is for operational interview messages only, not
rejection, sensitive feedback, salary negotiation or bulk marketing.

`FEATURE_GOOGLE_MEET_INTERVIEW_SCHEDULING` must stay `false` until David
approves the Google Calendar account, OAuth scopes, Meet generation rules,
calendar event wording and manual fallback. The staged architecture lives in
`docs/recruiter-labs-interview-scheduling.md`; it prepares manual calendar
drafts only and does not create Google Calendar events.

`FEATURE_AI_CANDIDATE_SUMMARY_DRAFTS` must stay `false` until the AI provider,
candidate consent wording, redaction/minimisation rules, edit/approve workflow
and retention handling are approved. Drafts are not rankings, scores or
recommendations. David must approve them before any client visibility.

`FEATURE_CANDIDATE_TRANSPARENCY_SCORECARD` must stay `false` until David wants
the private scorecard to act as a formal publishing gate. The admin-only route
can still show the draft readiness report at
`/admin/recruiter-labs/candidate-transparency`, but the score must not be shown
publicly or used as fake compliance. The implementation note lives in
`docs/recruiter-labs-candidate-transparency-scorecard.md`.

`FEATURE_CANDIDATE_WHATSAPP_QUESTIONS` remains `false` while WhatsApp is a
simple user-initiated question route. Candidate/job forms now capture explicit
WhatsApp reply consent when WhatsApp is selected, but future automated WhatsApp
Business updates still need templates, opt-out handling and privacy review. The
implementation note lives in
`docs/recruiter-labs-candidate-whatsapp-preferences.md`.

`FEATURE_BRANDED_CANDIDATE_PROFILES` must stay `false` until Railway Postgres,
candidate consent wording, retention checks and David approval workflow are
ready. The private builder foundation lives in
`docs/recruiter-labs-candidate-profiles.md`. It does not create public
candidate profile URLs and does not approve AI drafts automatically.

`FEATURE_CLIENT_SHORTLIST_PORTAL` and `FEATURE_CLIENT_PRESENTATION_PORTAL` must
stay `false` until Railway Postgres is live, token expiry/revocation is tested,
candidate sharing consent is approved, and David signs off private beta. They
point at the same gated portal; `FEATURE_CLIENT_SHORTLIST_PORTAL` is the
issue-aligned name and `FEATURE_CLIENT_PRESENTATION_PORTAL` is the existing
implementation name. The route and model notes live in
`docs/labs-client-shortlists.md` and
`docs/recruiter-labs-client-presentation-portal.md`. Turning either flag on is
not enough for launch: feedback, CV access, audit logging and privacy review
still need their own gates.

`FEATURE_LIVE_MARKET_DASHBOARDS` must stay `false` until verified salary/rate
source data, methodology notes, last-updated dates, performance testing and
David approval are in place. The hidden admin preview and launch rules live in
`docs/labs-live-market-dashboards.md`. Do not publish dashboards from weak
sample sizes or unsourced market notes.

`FEATURE_INTERIM_BENCH_PORTAL` must stay `false` until Railway Postgres,
candidate consent wording, retention rules, admin review screens and David
approval are ready. The private bench foundation lives in
`docs/labs-strategic-interim-bench.md`. It must not create a public talent
database, exposed interim profiles or client-visible matching views.

`FEATURE_AI_BRIEF_BUILDER` must stay `false` until Railway Postgres, privacy
wording, retention rules, David review/edit/approve workflow and AI
provider/DPA approval are ready. The private builder foundation lives in
`docs/labs-ai-brief-builder.md`. Non-AI structured mode can be designed first;
AI-assisted drafts must not be published or sent without David approval.

`FEATURE_INTERVIEW_PROCESS_TRANSPARENCY` remains `false` as a release-control
flag while the public timeline component uses safe exact/typical process
wording. Future private candidate status tracking still needs backend, access
and privacy review. The implementation note lives in
`docs/recruiter-labs-candidate-process-transparency.md`.

`FEATURE_CANDIDATE_APPLICATION_DROP` remains `false` because real CV upload is
not live. The public application journey can still accept a candidate-supplied
profile URL or short note through the existing contact route. When operations
Postgres is enabled, job submissions create private application metadata. No CV
files are stored, no public file URLs are created and no LinkedIn scraping or
automatic parsing is implied. The implementation note lives in
`docs/candidate-application-drop.md`.

`FEATURE_LINKEDIN_PROFILE_APPLICATION` remains `false` for any richer
LinkedIn/profile parsing or API-based workflow. The current site only accepts a
URL typed by the candidate.

`FEATURE_FLUFF_FREE_JOB_PAGES` remains `false` as a future publishing gate, not
because the public clarity fields are unsafe. The site can show the role
snapshot, salary/rate visibility, hybrid/travel expectations, process timeline
and privacy notes today. The flag is for a stricter automated gate before roles
go live.

## Salary Guide Gate

`FEATURE_SALARY_GUIDE_GATE` controls the staged `/salary-guides` lead-capture
page. It must stay `false` until:

- the guide asset is approved
- `OPERATIONS_DB_ENABLED=true` and `DATABASE_URL` are set
- `database/migrations/012_salary_guide_leads.sql` has been run
- Resend notification settings are approved
- `SALARY_GUIDE_DOWNLOAD_URL` points to the approved guide link
- privacy wording and retention rules are reviewed

When the flag is `false`, the form is disabled, the page is noindexed and the
route is not included in `sitemap.xml`.

`SALARY_GUIDE_DOWNLOAD_URL` is not a feature flag. It is the approved link sent
to requesters after the lead is saved. Do not put private tokens or secrets in
that value.

## Suggested Flags From Issue #117

Issue #117 specifically called out these flags. They all exist and default off:

- `FEATURE_RECRUITER_LABS_ENABLED`
- `FEATURE_CLIENT_SHORTLIST_PORTAL`
- `FEATURE_CLIENT_PRESENTATION_PORTAL`
- `FEATURE_BRANDED_CANDIDATE_PROFILES`
- `FEATURE_SHORTLIST_FEEDBACK_TRACKING`
- `FEATURE_WHATSAPP_INTERVIEW_SCHEDULING`
- `FEATURE_AI_OPS_COMPRESSION`
- `FEATURE_CANDIDATE_TRANSPARENCY_LABS`
- `FEATURE_SALARY_GUIDE_GATE`
- `FEATURE_INTERIM_BENCH_PORTAL`

## Where The Code Lives

- Master registry: `src/lib/feature-flags.ts`
- General Labs: `src/lib/labs.ts`
- Recruiter Labs client pipeline: `src/lib/recruiter-labs.ts`
- Candidate transparency flags: `src/lib/candidate-transparency.ts`
- Candidate transparency public content: `src/lib/candidate-transparency-content.ts`
- AI Ops: `src/lib/recruiter-labs-ai.ts`
- Env validation: `src/lib/env.ts`
- Example values: `.env.example`

## How To Enable A Flag Locally

Add the flag to `.env.local`:

```bash
FEATURE_RECRUITER_LABS_ENABLED=true
```

Restart the local server after changing env values.

Use only `true` or `false`. Anything else should be treated as wrong.

## How To Disable Quickly

Local:

```bash
FEATURE_RECRUITER_LABS_ENABLED=false
```

Railway:

1. Open Variables.
2. Set the flag to `false`.
3. Redeploy.
4. Check the relevant admin page.

For a live-risk incident, also remove public links, check `sitemap.xml` and
confirm the feature is noindexed or inaccessible.

## Launch Rules

Do not turn on Recruiter Labs for real clients until:

- Railway Postgres is live and migrated
- admin access is confirmed
- consent wording is reviewed
- audit logging is live
- retention rules are reviewed
- candidate/CV access is private
- David has approved the workflow
- legal/privacy review is complete

Do not turn on AI Ops for real candidate data until:

- the AI provider is approved
- DPA, processing region and training-use terms are reviewed
- redaction rules are agreed
- human review and deletion are live
- David approval is required before any client-facing output

## Public Bundle Impact

The current pattern is deliberately light:

- public pages do not import private Labs helpers
- protected admin routes import the Labs helpers
- feature definitions use `server-only`
- no third-party feature-flag service is installed
- no public tracking script is added

That keeps public pages fast and avoids shipping private planning logic to the
browser.

## Manual Approval For David

David must approve before any flag is set to `true` in production.

Approval should say:

- which flag
- where it will appear
- whether it uses real candidate or client data
- whether it is public, private admin or private beta
- how it will be switched off
- what privacy/legal review has happened

No faff. If the answer is not clear, keep the flag off.
