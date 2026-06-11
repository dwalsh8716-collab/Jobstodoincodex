# Strategic Interim Availability Toggle

## Status

Staged and disabled by default.

This is a private magic-link update route for senior interim candidates. It is
not a public bench, not a candidate portal and not a WhatsApp automation
system.

## Feature Flag

```txt
FEATURE_INTERIM_AVAILABILITY_TOGGLE=false
```

Keep it off until Railway Postgres is migrated, candidate consent wording is
approved and David has tested the private flow.

## Route

```txt
/candidate/interim-availability/[token]
```

The route is:

- noindexed
- absent from sitemap
- blocked in `robots.txt` through `/candidate`
- scoped to one hashed token
- hidden when the feature flag is off

## What The Candidate Can Update

- available now
- available from a date
- on assignment
- not looking
- day rate
- notes
- opt out of interim availability check-ins

## Database

Migration:

```txt
database/migrations/018_interim_availability_toggle.sql
```

Tables:

- `interim_candidate_availability`
- `interim_availability_tokens`

Tokens are stored as hashes only. Raw tokens are only used in the link sent to
the candidate.

## Admin Visibility

The protected `/admin` overview now shows:

- available-now interim count
- latest interim availability updates
- candidate name
- availability status
- available-from date
- day rate
- update date

This is private operations data. It does not belong in Sanity.

## WhatsApp Rule

This build does not send WhatsApp messages.

If David later sends these links through WhatsApp Business, the sending workflow
must confirm the candidate has the right consent/preference first. The helper
will not prepare a WhatsApp link unless consent is explicitly confirmed.

## Manual Launch Actions

Before using this with real candidates:

- run the Railway migration
- set `FEATURE_INTERIM_AVAILABILITY_TOGGLE=true`
- confirm `INTERIM_AVAILABILITY_TOKEN_EXPIRY_DAYS`
- approve candidate consent/preference wording
- approve WhatsApp/email wording
- test invalid, expired and revoked links
- test the admin overview
- confirm the privacy policy and candidate privacy notice cover interim bench
  updates

No public listing. No analytics. No secrets in GitHub. No fake compliance.
