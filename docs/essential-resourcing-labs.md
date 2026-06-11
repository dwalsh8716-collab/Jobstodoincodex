# Essential Resourcing Labs

Essential Resourcing Labs is a private planning area for future product ideas.
It is not a public website section, not a client portal and not a place for
candidate or client private records.

The purpose is simple: let David plan, stage and review future features without
leaking unfinished work to Google, AI crawlers, clients or candidates.

## Current Architecture

Recommended approach for this codebase:

- protected admin route: `/admin/labs`
- server-side feature flags
- Sanity planning document: `labsIdea`
- no public `/labs` route
- no public navigation or footer links
- no sitemap, RSS, `llms.txt` or `llms-full.txt` inclusion
- noindex metadata on the admin route
- robots block for `/admin` and `/labs`

This fits the current project because `/admin` is already protected by the CMS
session gate. Unauthenticated visitors are redirected to `/cms?next=/admin/labs`.

## What Labs Is

Labs can hold planning for:

- gated salary guides
- staged salary guide lead capture at `/salary-guides`
- bespoke salary benchmarking assets
- market mapping visualisations
- bad hire calculators
- functional matrix tools
- passwordless client shortlists
- AI-assisted brief builders and client diagnostics
- Strategic Interim bench workflows
- live market dashboards
- future client and candidate portal ideas
- digital PR data products

The 12-month dependency-aware roadmap lives in:

```txt
docs/essential-resourcing-labs-roadmap.md
```

The staged live market dashboard methodology lives in:

```txt
docs/labs-live-market-dashboards.md
```

Each idea should explain:

- commercial purpose
- target user
- problem solved
- likely data required
- privacy risk
- implementation complexity
- dependencies
- related GitHub issue
- related route if already built and protected
- launch readiness

## What Labs Is Not

Labs is not for:

- CV text
- private candidate notes
- client contact records
- salary negotiations tied to named people
- DSAR records
- audit logs
- WhatsApp message content
- secrets, tokens or API keys
- anything that would be risky if an editor accidentally copied it

Sanity Labs content is planning content only. If a future feature stores private
operational state, use Postgres with admin access controls and audit logging.

## Feature Flags

Current server-side flags:

```bash
FEATURE_LABS_ENABLED=false
FEATURE_SALARY_GUIDE_GATE=false
FEATURE_SALARY_BENCHMARK_ASSET=false
FEATURE_MARKET_MAPPING=false
FEATURE_BAD_HIRE_CALCULATOR=false
FEATURE_FUNCTIONAL_MATRIX=false
FEATURE_CLIENT_SHORTLIST_PORTAL=false
FEATURE_AI_BRIEF_BUILDER=false
FEATURE_INTERIM_BENCH_PORTAL=false
FEATURE_INTERIM_AVAILABILITY_TOGGLE=false
FEATURE_LIVE_MARKET_DASHBOARDS=false
```

Rules:

- keep private flags server-side
- do not add `NEXT_PUBLIC_` unless the feature is deliberately public-facing
- default every Labs feature to off
- use flags as review gates, not casual publish switches
- never let a flag bypass auth, consent, privacy review or indexing controls

## Sanity Or Postgres

Use Sanity when the item is planning/editorial:

- feature idea
- proposed user journey
- dependency notes
- public content links
- status and readiness notes

Use Postgres when the item becomes operational:

- private client shortlist state
- candidate profile records
- interview scheduling state
- consent records
- audit logs
- magic-link access
- interim availability status
- portal engagement tracking
- salary guide leads and delivery status
- AI brief diagnostic submissions and David-reviewed draft packs

Current recommendation: Sanity for Labs planning, Postgres only when a specific
Labs feature needs private workflow state.

## Public Launch Process

No Labs idea should go public directly from the Labs dashboard.

Before launch:

1. Create or reopen the related GitHub issue.
2. Confirm whether the feature is public, private or client-only.
3. Confirm route protection and auth.
4. Confirm noindex/sitemap/AI-index behaviour.
5. Confirm consent and privacy wording.
6. Confirm data storage location.
7. Confirm audit logging if private data is involved.
8. Run typecheck, lint, tests and production build.
9. Test authenticated and unauthenticated access.
10. Only then add the public navigation or sitemap entry if it is meant to be
    public.

## Security Notes

- `/admin/labs` is protected by the CMS session gate.
- The route is noindexed.
- Robots blocks `/admin` and `/labs`.
- The public site does not query `labsIdea`.
- No feature flag in this foundation publishes a feature on its own.
- No Labs idea should contain private candidate/client data.

Private by default. Review before release. No unfinished features in public.
