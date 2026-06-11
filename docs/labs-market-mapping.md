# Labs Market Mapping

This stages the future market mapping and network reach visualisation product
for Essential Resourcing Labs.

Status: private/admin preview. Not public. Not client-live.

## Principle

Show clients the work behind the search without exposing private candidate data.

Make the invisible work visible. No public PII. No gimmicks. No faff.

## Route

Private admin preview:

```txt
/admin/labs/market-mapping
```

The route is protected by the CMS session gate, noindexed and absent from public
sitemap output.

## Feature Flag

```bash
FEATURE_MARKET_MAPPING=false
```

Keep it false until David approves private preview with real client/search
context and Railway Postgres is migrated.

## Recommended Visual Approach

Start with a premium editorial search map:

- search funnel
- sector map
- seniority heatmap
- location spread
- status board
- network reach cards
- anonymised talent pool snapshot
- role difficulty score

Avoid gimmicks. The point is to show method, progress and market reality, not to
decorate the page.

## Staged Visuals

The private preview shows:

- target role universe
- mapped
- approached
- engaged
- shortlisted
- segment table
- market constraints
- private client use cases
- privacy rules

This is sample structure only. It is not live client data.

## Data Model

Migration:

```txt
database/migrations/039_labs_market_mapping.sql
```

Tables:

- `market_maps`
- `market_map_segments`
- `market_map_snapshots`

Core fields:

- title
- client company reference
- role title
- sector
- geography
- seniority
- status
- visibility
- role risk level
- salary/rate reality
- market constraints
- notes

Segment fields:

- segment name
- segment type
- target count
- mapped count
- approached count
- engaged count
- shortlisted count
- candidate availability summary
- response status summary
- notes

## Private/Public Boundary

Private client version:

- role-specific
- access controlled
- audit logged
- tied to a retained search or strategic interim brief
- can show progress and constraints
- must not expose named candidate lists as a visual shortcut

Public version:

- high-level only
- anonymised
- aggregate
- methodology-led
- no client-specific context
- no named companies unless public and approved
- no candidate PII

## Privacy Safeguards

Rules:

- no named candidate lists in public visualisations
- no public candidate PII
- no raw CV text
- no scraped personal profile data
- no private market-map events in GA4/GTM
- no salary/rate reality claim without caveats
- no public route until privacy and methodology are reviewed

## Client-Facing Use

Potential uses:

- retained search update
- strategic interim market scan
- salary/rate reality discussion
- why this role is hard explanation
- proof of work
- sales presentation

Client-facing maps should sit behind the future client portal or another signed
access route. Do not email screenshots with private context casually.

## Testing Checklist

Before private preview with real data:

- flag defaults false
- admin route redirects unauthenticated users
- route noindexed
- route absent from sitemap
- Postgres migration has run
- maps save aggregate counts only
- no candidate names in map tables
- no raw CV/profile text
- no GA4/GTM private events
- mobile layout checked
- David approves the wording

Before public version:

- anonymisation reviewed
- methodology written
- role difficulty wording approved
- salary/rate caveats approved
- client/company naming rules approved
- legal/privacy review complete

## Blockers

Blocked:

- public route
- client-visible map route
- PDF/share export
- named candidate list visualisation
- private client context in public visuals
- real search maps until Postgres and privacy rules are ready

Make the work visible. Keep people protected.
