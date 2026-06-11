# 0005 - Keep Recruiter Labs Private, Feature-Flagged And Noindexed

## Status

Accepted.

## Context

Recruiter Labs is the future product and operations layer for experiments such
as client portals, candidate transparency, AI assistance, scheduling and market
tools.

Those features may become commercially useful, but they are not public launch
features by default. They can involve private client/candidate data and must not
slow or expose the public website.

Supporting docs:

- `docs/essential-resourcing-labs.md`
- `docs/feature-flags.md`
- `docs/recruiter-labs-client-pipeline-launch-gate.md`
- `docs/recruiter-labs-ai-launch-gate.md`

## Decision

Keep Recruiter Labs private, feature-flagged and noindexed until a specific
launch gate says otherwise.

Default rules:

- feature flags are off by default
- private routes stay behind admin/CMS gating
- private routes use noindex metadata
- Labs routes are excluded from sitemap and AI index routes
- public pages must not fetch private Labs data
- heavy Labs UI must not inflate the public bundle

## Consequences

- Future work can be staged without risking the public site.
- David can approve Labs features one by one.
- Engineers must treat Labs as private operations work, not public marketing
  content.
- Public performance budget remains protected.

## What Not To Do

- Do not expose Labs routes in public navigation.
- Do not include Labs pages in sitemap, RSS, `llms.txt` or `llms-full.txt`.
- Do not put real candidate/client data into Labs without approval, consent and
  retention controls.
- Do not make feature flags the only security boundary.
- Do not ship AI, portals, dashboards or scheduling tools to users without their
  own launch gate.
