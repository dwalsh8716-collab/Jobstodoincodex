# Labs Functional Matrix

This stages the future functional matrix mapping tool for Essential Resourcing
Labs.

Status: private/admin preview. Not public. Not client-live.

## Principle

The job title is not the brief.

The matrix should turn vague hiring language into structured search criteria.
It should help David ask better questions, not make decisions for him.

## Routes

Private admin preview:

```txt
/admin/labs/functional-matrix
```

The route is protected by the CMS session gate, noindexed and absent from public
sitemap output.

## Feature Flag

```bash
FEATURE_FUNCTIONAL_MATRIX=false
```

Keep it false until David approves private preview with real role or client
data. The static admin preview can show the shape of the tool, but live saving
needs Postgres and a reviewed workflow.

## Proposed Matrix Dimensions

The staged dimensions are:

- strategy
- execution
- leadership
- commercial impact
- technical skill
- channel expertise
- stakeholder management
- agency/client-side experience
- sector knowledge
- team management
- budget ownership
- growth/change experience
- hands-on delivery
- transformation
- interim urgency

Suggested scale:

```txt
1 = Light
2 = Useful
3 = Important
4 = Critical
```

Scores should explain the role shape. They must not become hidden candidate
ranking.

## Outputs

Potential outputs:

- role requirement matrix
- must-have/nice-to-have split
- brief quality score
- mismatch warnings
- candidate comparison matrix
- shortlist summary
- hiring risk notes
- salary realism note

The brief quality score is advisory only. It should warn when a brief is vague,
overloaded or commercially unrealistic.

## Data Model

Migration:

```txt
database/migrations/037_labs_functional_matrix.sql
```

Tables:

- `labs_functional_matrices`
- `labs_functional_matrix_events`

Compatibility view:

- `functional_matrices`

Core fields:

- title
- role title
- service type
- client type
- matrix scores
- must-haves
- nice-to-haves
- risks
- notes
- status
- source context
- related shortlist or job reference, if future private use needs it

Use Postgres if the matrix references real client, role, shortlist or candidate
data.

Use Sanity only for static public template definitions.

## UI Route And Component

The current UI is a protected admin preview showing:

- feature flag status
- database status
- 15 dimensions
- example role profile
- must-haves
- useful extras
- outputs
- safety rules

It is designed to feel like an advisory tool, not a spreadsheet.

## Privacy Boundary

Rules:

- no public route
- no sitemap entry
- no private client or candidate data in Sanity
- no private matrix data in GA4 or GTM
- no automated candidate scoring
- no automated candidate recommendation
- no client PDF/share route until access controls exist
- no salary realism note without caveats and source review

## Design Notes

The public-facing idea later should feel:

- premium
- plain English
- structured
- commercially useful
- easy to review on mobile
- better on desktop for editing

Avoid spreadsheet ugliness. The value is David's judgement, not a grid for its
own sake.

## Testing Checklist

Before private preview with real data:

- flag defaults false
- admin route redirects unauthenticated users
- route noindexed
- route absent from sitemap
- Postgres migration has run
- matrix scores remain structured JSON
- must-haves and nice-to-haves are separate
- audit event records admin preview access
- no private role/client/candidate data enters Sanity
- no candidate ranking or automated recommendation appears
- mobile and desktop layout checked

Before any client-facing version:

- signed access or client portal route approved
- export/PDF route access-controlled
- role/client wording approved
- salary caveats approved
- David review workflow in place
- legal/privacy review complete

## Blockers

Blocked:

- public route
- PDF/client sharing
- candidate scoring
- automated matching
- salary advice without reviewed data
- real client matrices until Postgres and privacy rules are ready

No faff. Structure the brief. Keep David in charge.
