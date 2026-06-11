# Retained Search Client Dashboard

This is a staged Recruiter Labs client dashboard for retained search work.

It is private, noindexed, feature-flagged and aggregate-only. It must not expose
candidate names, CVs, contact details, notes or any candidate-level records.

## Feature Flag

```txt
FEATURE_RETAINED_SEARCH_DASHBOARD=false
```

The flag is server-side only. It is not a public launch switch.

## Route

```txt
/client/retained-search/[token]
```

The route is:

- dynamic
- noindexed
- under `/client`, which is blocked from robots
- absent from sitemap routes
- safe when disabled
- unable to read private data unless Railway Postgres is enabled

## What The Dashboard Can Show

Aggregate metrics only:

- total mapped
- total approached
- total responded
- total screened
- total rejected
- total shortlisted
- interview stage count

Approved narrative fields:

- process timeline
- market notes
- salary/rate reality
- blockers
- next actions

No candidate PII. No candidate ranking. No CVs. No client-visible raw pipeline
notes.

## Database Model

Migration:

```txt
database/migrations/021_retained_search_dashboard.sql
```

Private tables:

- `recruiter_lab_retained_search_dashboards`
- `recruiter_lab_retained_search_dashboard_access_tokens`
- `recruiter_lab_retained_search_pipeline_events`
- `recruiter_lab_retained_search_dashboard_access_logs`

Aggregate view:

```txt
recruiter_lab_retained_search_dashboard_metric_totals
```

Pipeline events store counts, not candidate records. There are no candidate
foreign keys in the retained-search dashboard model.

## Launch Rules

Before real client use:

- Railway Postgres must be live and migrated.
- Token generation must store only hashes.
- Metrics must be reviewed for source accuracy.
- Market notes, salary/rate reality, blockers and next actions need David
  approval before sharing.
- Wording must be reviewed so clients understand these are aggregate progress
  signals, not proof of every confidential conversation.
- Access logging must be tested.
- Retention and deletion rules must be confirmed.

This should prove work without turning private search activity into a creepy
feed. Useful signal. No candidate exposure. No faff.
