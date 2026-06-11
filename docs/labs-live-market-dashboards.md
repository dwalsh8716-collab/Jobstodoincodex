# Labs Live Market Dashboards

This stages the future market intelligence dashboard product for Essential
Resourcing Labs.

Status: hidden foundation. Not public. Not launch-ready.

## Principle

Live data beats PDFs only if the data is credible.

No fake benchmarks. No tiny charts pretending to be insight. No faff.

## Hidden Route

Private admin preview:

```txt
/admin/labs/market-dashboards
```

The route is:

- protected by the CMS admin session gate
- noindexed
- absent from sitemap, RSS and AI index routes
- controlled by `FEATURE_LIVE_MARKET_DASHBOARDS`
- blocked from public launch by design

There is no public dashboard route yet.

## Feature Flag

```bash
FEATURE_LIVE_MARKET_DASHBOARDS=false
```

Keep it false until:

- Railway Postgres is live and migrated
- data sources are reviewed
- methodology notes exist
- charts are performance-tested
- David approves private preview
- public launch wording is reviewed

Turning the flag on is not public launch approval.

## Dashboard Architecture

Server-side planning helper:

```txt
src/lib/labs-market-dashboards.ts
```

Hidden admin route:

```txt
app/admin/labs/market-dashboards/page.tsx
```

Database migration:

```txt
database/migrations/033_labs_market_dashboards.sql
```

The hidden preview lists dashboard plans, source requirements, disabled filters,
methodology checks and privacy rules. It does not render fake chart data.

## Planned Dashboards

- North West Marketing Salary Dashboard
- Manchester Agency Hiring Dashboard
- Strategic Interim Rate Dashboard
- Senior Marketing Leadership Market Snapshot
- PR & Communications Salary Dashboard

Each dashboard needs:

- source type
- confidence level
- sample size or evidence strength
- last updated date
- David review note
- public citation where public data is used

## Data Model

Staged tables:

- `market_data_sources`
- `market_dashboard_configs`
- `market_data_points`
- `salary_ranges`
- `rate_ranges`

Key fields:

- role family
- role title
- seniority
- location
- sector
- function/channel
- demand level
- availability level
- minimum, median and maximum salary
- minimum, median and maximum day rate
- source
- confidence level
- sample size
- methodology note
- last updated date

## Data Sources

Acceptable source types:

- verified salary guide data
- anonymised internal applications
- anonymised candidate expectations
- manually entered market ranges
- survey responses
- public data with citation
- David-verified market notes

Do not use:

- raw CV text
- named candidate data
- named client data without approval
- unsupported hearsay
- scraped personal profiles
- invented ranges

## Confidence Rules

Use confidence levels:

- `draft`
- `low`
- `medium`
- `high`
- `verified`

Public display should require `verified` source confidence for precise ranges.
Directional commentary can use lower confidence only if labelled clearly.

Do not show fake precision. A broad honest range is better than a precise weak
number.

## Dashboard Design

Use:

- cards
- charts once data is verified
- role/seniority filters
- location filters
- source and methodology notes
- last updated dates
- caveats near the data
- CTA to discuss the range with David

Avoid:

- cluttered dashboards
- tiny unreadable charts
- unsupported claims
- candidate/client leakage
- data with no update owner

## Lead Capture

Future public version may support:

- view basic aggregate data freely
- unlock full report
- request benchmark
- book 15-minute call
- WhatsApp David
- download PDF summary

Lead data goes to Postgres and needs consent wording. It must not go into GA4
or GTM as private market-context data.

## Privacy Safeguards

Rules:

- No raw PII
- no individual candidate exposure
- no named client trend unless approved and public
- no private dashboard events in GA4/GTM
- aggregate-only candidate availability
- no public route until data quality is proven
- no salary/rate claims without source notes

## Testing Checklist

Before private preview:

- `FEATURE_LIVE_MARKET_DASHBOARDS=false` hides live data by default
- `/admin/labs/market-dashboards` redirects unauthenticated users
- route metadata is noindex
- route is absent from sitemap
- migration contains no PII fields
- fake data is not rendered
- disabled filters do not imply live data
- methodology requirements are visible
- privacy rules are visible
- build/typecheck/lint pass

Before public launch:

- verified data source rows exist
- methodology notes are written
- sample size or evidence strength is shown
- last updated date is shown
- charts pass mobile and accessibility checks
- public page copy has caveats
- lead capture consent is reviewed
- David signs off the exact dataset

## Blockers

Blocked before public launch:

- verified salary/rate source data
- data owner and update process
- performance budget for charts
- public methodology wording
- privacy/legal review if lead capture is added
- David approval

## Recommendation

Stage the architecture now. Build public dashboards later.

Start with one narrow dashboard: North West senior marketing salary ranges with
clearly labelled source confidence and last-updated dates.

Do not launch multiple dashboards until one is credible enough to stand behind.
