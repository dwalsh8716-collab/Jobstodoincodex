# Recruiter Labs Portal Engagement Tracking

This is a private Recruiter Labs feature. It is not public website analytics.

It exists so David can see whether a client is genuinely reviewing a private
shortlist, without sending candidate or client behaviour into GA4, GTM or any
public marketing tool.

## Current Status

Default state: off.

Required flags:

```txt
FEATURE_CLIENT_PRESENTATION_PORTAL=true
FEATURE_SHORTLIST_FEEDBACK_TRACKING=true
OPERATIONS_DB_ENABLED=true
DATABASE_URL=...
```

If either portal flag is off, the tracker does not write. If the private
database is not ready, it returns a safe disabled response.

## What Is Tracked

The staged event model supports:

- shortlist opened
- candidate profile expanded
- modal opened
- modal closed
- dwell duration on visible candidate cards
- CV viewed
- CV downloaded
- feedback submitted

The current portal has no live CV access route. CV view/download events are
there for the future signed CV flow, not for a public CV link.

## What Is Not Tracked

- No raw magic-link token is stored.
- No candidate data is stored in Sanity.
- No candidate PII is sent to GA4, GTM or public website event tracking.
- No dwell time is treated as candidate quality, ranking or suitability.
- No hidden third-party script, heatmap tool or replay tool is added.

This is operational context only. It helps David follow up properly; it must
not be used to judge a candidate.

## Storage

Migration:

```txt
database/migrations/019_recruiter_labs_portal_engagement.sql
```

Table:

```txt
recruiter_lab_portal_engagement_events
```

Candidate summary fields are also staged on
`recruiter_lab_shortlist_candidates`:

- `latest_engagement_at`
- `total_dwell_seconds`
- `profile_expand_count`
- `cv_view_count`
- `cv_download_count`

These are counts and timing signals only. They are not scores.

## Debounce And Write Control

The browser tracker is deliberately quiet:

- shortlist open is sent once
- candidate profile review is sent once per visible card
- dwell time flushes after at least five seconds
- regular dwell flushes are spaced at roughly 30 seconds
- page hide/visibility changes use a final keepalive send where available
- the server also ignores repeat events inside short debounce windows

This avoids write spam and keeps the portal fast.

## Consent And Privacy Boundary

This is not a cookie banner feature and not Google Consent Mode.

It is a private, token-scoped operational record inside David's own Postgres
backend. It should still be covered by the site's privacy wording, client terms
and candidate consent model before real client use.

Manual review needed before launch:

- confirm client portal terms mention private engagement records
- confirm candidate privacy wording is comfortable with shortlist review
  activity being recorded against the shortlist
- confirm retention rules for portal engagement events
- confirm who can view these records in admin

## QA Checklist

Before enabling for a real client:

- open `/client/shortlist/[token]` with a valid token
- confirm the page remains noindexed and absent from sitemap routes
- confirm `FEATURE_SHORTLIST_FEEDBACK_TRACKING=false` stops writes
- confirm no request goes to GA4, GTM, dataLayer or public analytics helpers
- confirm events write to Postgres only when both flags and the database are on
- confirm raw tokens are not stored in event rows
- confirm unscoped candidate ids are rejected
- confirm repeated visibility changes do not create noisy duplicate rows
- confirm feedback still submits if passive engagement writing fails
- confirm mobile, keyboard and screen-reader use is not affected

No creepy claims. No fake insight. No faff.
