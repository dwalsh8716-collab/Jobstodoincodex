# Future-Proof Architecture

Audit date: 11 June 2026

## Status

Amber to Green.

The architecture is strong enough to keep building, but public launch still depends on account-side setup for Railway, Sanity, email, monitoring, legal/privacy review and final production smoke testing.

The important point:

```txt
Sanity is the public CMS.
Loxo is the recruitment CRM/ATS.
Railway runs the app and can host private workflow data.
Postgres is not a replacement CRM.
Recruiter Labs stays private until a separate launch gate passes.
```

## Architecture Map

```txt
Visitors
  -> Next.js public website
  -> public content from Sanity or local fallback
  -> contact, booking, WhatsApp or candidate routes

Editors
  -> /cms gate
  -> /studio
  -> Sanity public content only

David/admin
  -> /admin
  -> protected operations dashboard
  -> Railway Postgres if enabled

Recruitment records
  -> Loxo as source of truth
  -> optional Postgres handoff/reference IDs

Future Labs
  -> server-side feature flags
  -> admin-only routes
  -> noindex
  -> private data in Postgres only when approved
```

## Public Website Stack

- Next.js 16 App Router.
- React 19.
- TypeScript.
- CSS tokens in `src/styles/theme.css`.
- Public routes under `app/`.
- Public content loaders in `src/lib/public-content.ts`.
- Canonical fallback content in `src/lib/content.ts`.
- Metadata, schema, sitemap, robots, RSS and AI index routes.

Public pages should stay mostly server-rendered.

Use client components only for real interactivity: navigation, forms, consent, analytics, Studio and similar browser-only behavior.

## CMS Stack

Sanity is for public website content:

- homepage
- navigation
- services
- jobs
- insights
- case studies
- salary snapshots
- people
- proof items
- SEO fields
- images and public media metadata

Sanity must not store:

- private candidate records
- CVs or CV URLs
- private application records
- private client contacts
- DSAR requests
- audit logs
- shortlist feedback
- WhatsApp messages
- AI drafts containing private candidate/client data

Relevant docs:

- `docs/sanity-cms-audit.md`
- `docs/sanity-cms-access.md`
- `docs/sanity-editor-guide.md`
- `docs/sanity-nextjs-fetching.md`

## CRM/ATS Boundary

Loxo remains the recruitment CRM/ATS source of truth.

Use Loxo for:

- candidate records
- client recruitment records
- pipeline history
- placement/search records
- recruiter notes
- live CRM work

Use the website/Postgres only for website workflow records and handoff references.

Do not rebuild a full CRM in the website unless David explicitly chooses that as a separate business decision.

## Railway/Postgres Boundary

Railway is the intended hosting target.

Railway provides:

- app hosting
- production environment variables
- deployment logs
- service logs
- healthcheck monitoring
- optional Postgres

Postgres is staged for:

- enquiries
- applications
- consent records
- audit logs
- DSAR records
- retention review
- private workflow tasks
- Recruiter Labs prototypes
- optional Loxo reference IDs
- integration sync events

Postgres is disabled by default:

```txt
OPERATIONS_DB_ENABLED=false
DATABASE_URL=
```

Enable it only after Railway Postgres exists, migrations pass and David approves private workflow storage.

## Recruiter Labs Boundary

Recruiter Labs is private.

Current controls:

- admin-only routes
- CMS session gate
- noindex metadata
- excluded from sitemap
- server-only feature flags
- no public client shortlist route yet
- no public candidate profiles
- no public CV access
- no live AI provider
- no live Loxo sync

Future Labs work must pass its own launch gate before real client or candidate use.

## Feature Flags

Feature flags are environment-driven and typed in code.

Important files:

- `src/lib/env.ts`
- `src/lib/labs.ts`
- `src/lib/recruiter-labs.ts`
- `src/lib/recruiter-labs-ai.ts`

Default rule:

```txt
Future and Labs features are off unless explicitly enabled.
```

Do not put secrets in feature flags.

Do not use public feature flags for private data access decisions.

## Public Performance

Public pages must not load hidden Labs code unnecessarily.

Current protection:

- Labs pages live under protected admin routes.
- Labs helpers use `server-only`.
- Public sitemap excludes admin/Labs routes.
- `npm run performance:budget` checks public client JavaScript.
- `npm run verify` includes the performance budget.

Current public budget target:

```txt
Unique public client JS stays small and checked by script.
```

If a future feature adds charts, dashboards, AI UI, portals or heavy media, load it only where needed and keep it out of public routes.

## Monitoring Stack

What exists:

- `/api/health`
- Railway healthcheck config
- Railway deployment/service logs after deploy
- safe server logging for form/database failures
- admin audit route when Postgres is enabled
- weekly retention review workflow

What still needs manual setup:

- uptime monitor for `/`, `/contact`, `/sitemap.xml` and `/api/health`
- Sentry or equivalent app error tracking
- alert recipient decisions
- production Railway log review
- GA4/GTM/Search Console setup after consent approval

Related docs:

- `docs/observability-audit.md`
- `docs/ci-quality-gates.md`
- `docs/launch-handover.md`

## Update Process

Default process:

1. Work from a GitHub issue.
2. Audit existing implementation first.
3. Preserve working systems.
4. Make the smallest useful change.
5. Run focused tests where useful.
6. Run `npm run verify`.
7. Run Sanity/database checks where relevant.
8. Commit and push.
9. Close the issue with evidence.

Dependency process:

1. Let Dependabot open small PRs.
2. Apply patch/minor updates first.
3. Treat major upgrades as separate planned work.
4. Do not combine major framework upgrades with content/design changes.
5. Run the full quality gate before merging.

## Monthly Review Process

David or Codex should check:

- GitHub security and Dependabot alerts.
- GitHub Actions failures.
- Railway deploy and service logs.
- uptime monitor alerts.
- form failure logs.
- Search Console coverage issues.
- slow public routes.
- stale jobs, case studies and salary content.
- retention review queue if Postgres is enabled.
- Recruiter Labs flags remain off unless deliberately approved.

## What David Needs To Know

- Do not share passwords, tokens or private candidate data in prompts.
- Sanity is for public content only.
- Loxo is the recruitment CRM/ATS.
- Railway is where the website runs.
- GitHub is where the code and issue trail live.
- Green checks matter. Red checks should be fixed before launch.
- Recruiter Labs is not public.

## What Future Engineers Need To Know

- Read `AGENTS.md` before editing.
- Keep design tokens in `src/styles/theme.css`.
- Keep David Walsh tone plain, direct and human.
- Prefer server components.
- Keep private data out of Sanity and analytics.
- Do not add duplicate analytics tags.
- Do not make Labs public by accident.
- Use existing helpers before creating new abstractions.
- Run the release gate before handing work back.

## Current Risks

- Production Railway deployment has not been verified from this workspace.
- Production Sanity access and CORS still need account-side confirmation.
- Email delivery depends on production Resend/env setup.
- Error tracking and uptime monitoring still need manual setup.
- Legal/privacy wording still needs review.
- Loxo integration is not live and should not be guessed.

## Recommendation

Safe to continue build.

Safe for private beta only after Railway, Sanity, email, monitoring and legal/privacy setup are complete.

Not safe for public launch until the final production URL smoke test and manual launch actions pass.
