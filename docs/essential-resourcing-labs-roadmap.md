# Essential Resourcing Labs Roadmap

This is the 12-month product engineering roadmap for Essential Resourcing Labs.

Labs is a private staging area, not a public feature dump. The aim is to build
future advantage without distracting from launch or exposing candidate/client
data.

## Executive Decision

Build in this order:

1. Labs foundation.
2. Lead capture assets.
3. Advisory tools.
4. Private data infrastructure.
5. Client portal features.
6. Strategic Interim bench.
7. Market intelligence products.

Do not build everything at once.

The highest-value public work starts with lead capture and advisory tools. The
highest-risk private work waits until Postgres, consent, retention, audit logs
and David approval are solid.

## Product Principles

- Keep Labs private by default.
- Use feature flags as review gates, not launch permission.
- Use Sanity for planning/editorial content only.
- Use Postgres for private operational data.
- Keep candidate/client data out of GA4, GTM, Sanity and public logs.
- Do not invent salary data, market statistics or candidate proof.
- Do not automate hiring decisions.
- AI may help structure drafts. David decides what is used.
- Build only what helps David win better work or serve clients better.

No faff.

## 12-Month Build Order

| Phase | Timing | Theme | Build | Hold back | Reasoning |
| --- | --- | --- | --- | --- | --- |
| 1 | Month 0-1 | Labs foundation | Protected `/admin/labs`, server flags, docs, noindex rules, status model. | Public `/labs` section. | Low-risk planning layer first. |
| 2 | Month 1-2 | Lead capture assets | Gated salary guides, salary benchmark request, hiring health check. | Live salary dashboards. | Fastest route to commercial value without private candidate data. |
| 3 | Month 2-4 | Advisory tools | Bad hire calculator, functional matrix, AI brief builder prototype. | Automated brief scoring or candidate matching. | Shows David's thinking and creates better first conversations. |
| 4 | Month 3-6 | Private data infrastructure | Railway/Postgres, auth, admin dashboard, audit logs, DSAR, retention, CV storage plan. | Public/private candidate views. | Private features need the backend to be boring and safe. |
| 5 | Month 5-8 | Client portal features | Passwordless shortlists, client feedback, anonymised market mapping. | Real client links until private beta is approved. | Strong differentiation, high privacy risk. |
| 6 | Month 7-10 | Strategic Interim bench | Availability toggle, private interim profiles, consent/retention flow. | Client-visible matching views. | Useful operationally, but candidate data must stay protected. |
| 7 | Month 9-12 | Market intelligence | Live dashboards, salary intelligence, digital PR data assets. | Automated live feeds until data quality is proven. | Strong authority play only if data is sourced and maintainable. |

## Feature Decision Matrix

Scores use 1-5. Higher is better for value columns. Higher is riskier for risk,
complexity and maintenance.

| Feature | Lead gen | Differentiation | Operational value | SEO/GEO | Privacy risk | Complexity | Maintenance | Time to value | Postgres | Auth | AI | Verified data | Phase |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- |
| Gated salary guides | 5 | 3 | 2 | 4 | 2 | 3 | 3 | 4 | Yes | No | No | Yes | 2 |
| Bespoke salary benchmarking | 4 | 4 | 3 | 4 | 3 | 4 | 4 | 3 | Yes | Admin | Optional | Yes | 2 |
| Hiring health check | 4 | 3 | 3 | 3 | 2 | 2 | 2 | 5 | Optional | No | No | No | 2 |
| Bad hire calculator | 4 | 4 | 2 | 4 | 1 | 3 | 2 | 4 | No | No | No | Assumptions | 3 |
| Functional matrix mapping | 3 | 5 | 4 | 3 | 1 | 3 | 3 | 4 | Optional | No | No | No | 3 |
| AI brief builder | 4 | 5 | 4 | 2 | 4 | 5 | 4 | 3 | Yes | Admin | Yes | No PII | 3 |
| Passwordless client shortlists | 2 | 5 | 5 | 1 | 5 | 5 | 4 | 2 | Yes | Magic link | No | Candidate consent | 5 |
| Market mapping visuals | 3 | 5 | 4 | 4 | 4 | 5 | 4 | 2 | Yes | Optional | No | Yes | 5 |
| Strategic Interim bench | 2 | 4 | 5 | 2 | 5 | 5 | 4 | 2 | Yes | Magic link | No | Candidate consent | 6 |
| Live market dashboards | 4 | 5 | 3 | 5 | 3 | 5 | 5 | 2 | Yes | Optional | Optional | Yes | 7 |

## Feature Notes

### Gated Salary Guides

Commercial value: captures serious hiring demand from people who want salary
context.

User value: gives hiring leaders a useful starting point before they speak to
David.

Build complexity: medium.

Privacy/security risk: medium because it collects lead data.

Dependencies: consent-aware form, CRM routing, delivery email, source caveats.

Decision: do now.

Suggested issue: `#58`.

Codex effort: medium unless database/CRM routing is changed.

### Bespoke Salary Benchmarking

Commercial value: turns David's market knowledge into a sharper client asset.

User value: helps clients understand what they need to pay and why.

Build complexity: high.

Privacy/security risk: medium.

Dependencies: reviewed salary assumptions, downloadable asset generation,
admin review, no fake numbers.

Decision: do soon, but not with unsourced live data.

Suggested issue: `#59`.

Codex effort: high if PDFs, data model or lead routing are involved.

### Bad Hire Calculator

Commercial value: makes weak hiring decisions feel commercially real.

User value: helps leaders quantify delay, churn, replacement cost and lost
momentum.

Build complexity: medium.

Privacy/security risk: low.

Dependencies: transparent assumptions and plain-English caveats.

Decision: good early public tool if it stays tasteful.

Suggested issue: `#61`.

Codex effort: medium.

### Functional Matrix Mapping

Commercial value: helps David shape better briefs before clients go to market.

User value: clarifies whether they need strategy, delivery, leadership,
technical depth, agency context or client-side experience.

Build complexity: medium.

Privacy/security risk: low.

Dependencies: role taxonomy and service-page alignment.

Decision: do now/soon as an advisory tool, not a decision engine.

Suggested issue: `#62`.

Codex effort: medium.

### AI Brief Builder

Commercial value: compresses messy first-call thinking into a draft brief David
can improve.

User value: helps clients articulate the role properly.

Build complexity: high.

Privacy/security risk: high.

Dependencies: AI governance, prompt/version logging, no PII by default, David
review before use.

Decision: prototype privately only.

Suggested issue: `#64`.

Codex effort: high.

Implementation and review-gate notes live in:

```txt
docs/labs-ai-brief-builder.md
```

### Passwordless Client Shortlists

Commercial value: premium client experience and faster feedback.

User value: one branded link instead of CV attachment chains.

Build complexity: high.

Privacy/security risk: critical.

Dependencies: Postgres, magic links, candidate consent, audit logs, expiry,
revocation, noindex, retention.

Decision: staged privately. No real client links yet.

Suggested issues: `#63`, `#69`, `#70`, `#71`, `#72`, `#73`.

Codex effort: high.

Shortlist-specific route, flag and security notes live in:

```txt
docs/labs-client-shortlists.md
```

### Market Mapping Visuals

Commercial value: shows search reach and market shape for serious client
briefs.

User value: helps clients understand where talent is and why the search takes
work.

Build complexity: high.

Privacy/security risk: high.

Dependencies: anonymised data, no named candidate/client leakage, source
methodology.

Decision: stage after private data infrastructure.

Suggested issue: `#60`.

Codex effort: high.

### Strategic Interim Bench

Commercial value: helps David respond quickly when interim needs are urgent.

User value: candidates can keep availability current without long email chains.

Build complexity: high.

Privacy/security risk: high.

Dependencies: candidate consent, magic links, retention, private profile
storage, admin review.

Decision: stage after portal/access foundations.

Suggested issue: `#65`.

Codex effort: high.

Implementation and privacy notes live in:

```txt
docs/labs-strategic-interim-bench.md
```

### Live Market Dashboards

Commercial value: authority, data-led content, digital PR and stronger client
conversations.

User value: gives clients useful market context.

Build complexity: high.

Privacy/security risk: medium.

Dependencies: verified data, methodology, performance budget, maintenance owner.

Decision: do later. Do not build dashboards from weak data.

Suggested issue: `#66`.

Codex effort: high.

Implementation and methodology notes live in:

```txt
docs/labs-live-market-dashboards.md
```

## Top 3 Highest-Value Ideas

1. Gated salary guides: fastest lead-generation value and easiest to explain.
2. Functional matrix mapping: strong differentiation with low privacy risk.
3. Passwordless client shortlists: premium client experience, but high risk and
   private-only until the backend is proven.

## Top 3 Riskiest Ideas

1. Passwordless client shortlists: candidate data, client access, magic links,
   expiry, revocation and audit logs all matter.
2. Strategic Interim bench: availability and candidate data can become sensitive
   quickly.
3. AI brief builder: useful, but AI governance and human review must be strict.

## What Not To Build Yet

Do not build yet:

- live dashboards from unsourced data
- client-visible market maps with identifiable names
- public candidate/interim profiles
- automated candidate ranking or scoring
- AI-generated client advice without David review
- private CV links
- real client shortlist links
- WhatsApp or email automation for Labs features
- Google Calendar/Meet automation for Labs features

## What Depends On Database/Auth

Needs Postgres:

- salary guide lead capture and delivery status
- bespoke salary benchmark requests
- client shortlist portal
- client feedback
- market mapping private source data
- interim availability and candidate profiles
- AI brief submissions and reviewed drafts
- audit logs
- DSAR/retention records

Needs auth or magic links:

- `/admin/labs`
- admin dashboard
- client shortlists
- interim availability toggle
- private benchmark asset review
- any candidate-specific record

## What Can Be Staged Privately Now

Safe to stage now:

- docs and decision matrices
- private admin roadmap panels
- feature flags defaulting to off
- public calculators with transparent assumptions
- public lead forms with consent
- private schema drafts
- tests proving no sitemap/noindex exposure
- dummy-data prototypes

## What Could Become Public Later

Could become public after review:

- salary guide landing pages
- bad hire calculator
- functional matrix tool
- hiring health check
- methodology-led market insight pages
- anonymised public data stories

Should stay private/client-only:

- shortlists
- candidate profiles
- client feedback
- interim candidate availability
- CV access
- audit logs
- AI draft packs

## Suggested GitHub Issue Order

1. `#67` Labs roadmap and sequencing.
2. `#58` Gated salary guides.
3. `#59` Bespoke salary benchmarking.
4. `#61` Bad hire calculator.
5. `#62` Functional matrix mapping.
6. `#64` AI brief builder prototype.
7. `#63` Client shortlist portal foundation.
8. `#60` Market mapping.
9. `#65` Strategic Interim bench.
10. `#66` Live market dashboards.

Keep `#69` to `#73` as the deeper Recruiter Labs client-pipeline stream.

## Codex Reasoning Guidance

Use medium for:

- docs
- README links
- copy-only admin panels
- noindex/sitemap assertions
- simple public calculators without storage

Use high for:

- migrations
- auth
- magic links
- candidate/client data
- CV storage
- AI
- WhatsApp/Google integrations
- lead capture with CRM routing
- anything that changes privacy, consent or retention behaviour

If in doubt, treat the work as high.

## Blockers

Before private data features launch:

- Railway Postgres live and migrated
- production audit logs verified
- retention rules reviewed
- DSAR flow tested
- candidate consent wording approved
- privacy/legal review complete
- David approves the exact feature flags to turn on

Before public data-led features launch:

- source methodology written
- data caveats visible
- performance tested
- no fake salary or market statistics
- no identifiable candidate/client data

## Final Recommendation

Build Labs as a quiet engine behind the site:

- public first where risk is low and lead value is high
- private later where candidate/client data is involved
- data products last, once the data is strong enough to stand up

This is how Labs becomes a serious advantage, not a distraction.
