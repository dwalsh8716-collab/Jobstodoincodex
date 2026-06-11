# Labs Strategic Interim Bench

This stages the future private Strategic Interim bench for Essential
Resourcing.

Status: hidden foundation. Not public. Not a candidate portal launch.

## Principle

Build a strategic interim bench that is private, useful and consent-aware.

No public talent database. No exposed profiles. No faff.

## Routes

Private admin preview:

```txt
/admin/labs/interim-bench
```

Candidate magic-link update:

```txt
/candidate/interim-availability/[token]
```

The admin route is protected by the CMS gate and noindexed.

The candidate route is a scoped magic-link route. It must let an interim update
only their own record.

## Feature Flags

```bash
FEATURE_INTERIM_BENCH_PORTAL=false
FEATURE_INTERIM_AVAILABILITY_TOGGLE=false
```

Keep both false until:

- Railway Postgres is live and migrated
- candidate consent wording is approved
- retention rules are approved
- David approves private testing
- WhatsApp distribution rules are reviewed
- CV storage is either blocked or properly secured

Turning a flag on is not public launch approval.

## Data Model

Existing foundation:

- `interim_candidate_availability`
- `interim_availability_tokens`

New staged tables:

- `interim_profiles`
- `interim_preferences`
- `interim_profile_updates`
- `interim_consent_records`

New availability fields:

- preferred contract type
- sectors
- functions
- location preference
- remote preference
- contact preference
- consent reviewed date
- consent until
- profile visibility

Profile fields:

- candidate id
- profile status
- profile visibility
- headline
- seniority
- sectors
- functions
- location
- remote preference
- current status
- CV file reference
- case study highlights
- contact preferences
- consent until
- retention status
- last reviewed date
- private notes

## User Roles

David/admin:

- sees the private bench overview
- reviews stale profiles
- checks consent and retention
- uses the bench for active interim briefs
- decides whether a candidate can be discussed with a client

Interim candidate:

- updates their own availability through a scoped magic link
- can provide day rate, preferred work, sectors, functions and location notes
- can opt out of future check-ins
- cannot see other candidates

Reviewer/viewer:

- future read-only admin role
- no candidate self-service access

## Candidate UX

Keep it simple:

- update availability
- update available-from date
- update day rate/range
- update preferred work
- update sector and function notes
- update location/remote preference
- update contact preference
- opt out of interim availability check-ins
- message David for CV/profile changes

CV upload is not live. Do not add it until private storage, malware scanning,
file validation, signed access and retention handling are approved.

## Admin Dashboard

The private bench dashboard should show:

- available now
- available within 2 weeks
- available within 1 month
- rate bands
- specialisms
- updated recently
- stale profiles
- consent expiring
- possible match to active briefs

The current route shows these as staged metric definitions only. It does not
query or expose real candidate data unless Postgres and flags are ready.

## Auth And Privacy Requirements

Required:

- admin route protected by CMS session
- candidate route scoped by hashed magic-link token
- token expiry
- token revocation
- no public listing
- no sitemap inclusion
- no public candidate profile URL
- no analytics events containing candidate data
- candidate can update only their own record
- WhatsApp distribution only with explicit WhatsApp preference/consent
- retention and DSAR coverage

## Testing Checklist

Before private candidate use:

- `FEATURE_INTERIM_AVAILABILITY_TOGGLE=false` blocks updates
- invalid token blocked
- expired token blocked
- revoked token blocked
- token stored as hash only
- candidate route noindexed
- candidate route excluded from sitemap
- update writes only the scoped candidate record
- opt-out is stored
- no analytics event is fired
- admin route redirects unauthenticated users
- admin route is noindexed

Before real bench launch:

- `FEATURE_INTERIM_BENCH_PORTAL=true` approved by David
- Postgres migrated
- consent wording approved
- retention rules approved
- stale-profile process agreed
- CV/profile storage either secure or blocked
- WhatsApp/email check-in route approved
- privacy policy/candidate privacy notice reviewed

## Blockers

Blocked:

- public talent database
- public interim profile pages
- client-visible matching views
- CV upload
- automated WhatsApp check-ins
- automated client matching
- candidate scoring

## Recommendation

Keep building the private foundation. Do not open a broad candidate portal yet.

The next practical step after Railway Postgres is to build David's admin review
screen for available-now and stale-profile checks.
