# David Walsh Recruitment: Phase One

Prepared 27 September 2026. This is a private preparation project, not a launch authorisation.

## Decision

Keep the existing website repository and develop on the isolated `codex/dwr-rebrand` branch in `/Users/walsh/Jobstodoincodex-rebrand`. Essential Resourcing continues operating from its existing Railway deployment and Sanity production dataset. No second Railway service, environment, database, bucket or paid Sanity dataset has been created.

The local preview uses the existing website structure and components. The designer's shorter navigation is illustrative. Retain Clients, Candidates, Services, Jobs, Insight and About, all nested pages, and the four service products. Recruiter Labs source remains preserved.

Prepare the final build locally, then use a short, separately authorised hosting-validation window before launch. A local build cannot prove future DNS, TLS, mail authentication, provider callbacks or deployed account permissions. Those remain explicit launch gates.

## Evidence and scope

- Read 612 source/configuration/documentation files; generated 1,333 brand/discovery reference entries and 209 environment-variable names with source locations.
- Recorded 75 application route files, 42 live sitemap URLs and 36 existing redirect rules. Route files include APIs, private tools and dynamic templates; they are not all public indexable pages.
- Inspected the connected Railway project, deployment, service configuration and redacted variable presence. No secret values were written into this report or the inventories.
- Read the public homepage, health endpoint, robots and sitemap. All returned 200.
- Inspected CMS source and public Sanity document types. Saved only published public website content used by the existing frontend queries, with draft-status records excluded.
- Inspected the supplied logo pack, both visual references, component layout, branding, metadata, integration boundaries and operational scripts.
- Did not inspect private database rows, CV objects, emails, customer records, OAuth tokens or account inboxes. Did not submit forms, send email or messages, invoke webhooks, alter external profiles or change production settings.
- External account permissions, current backlink exports, search-performance history and historical URLs outside the code/sitemap are not yet independently verified. The URL map is complete for the observed sitemap and source redirects, not a claim to include every historic backlink.

Detailed evidence: [inventory summary](inventory/summary.json), [brand references](inventory/brand-references.csv), [environment references](inventory/environment-references.csv), [route inventory](inventory/route-inventory.json), [dependency manifests](inventory/package-inventory.json), [URL map](inventory/url-migration-map.csv), [legacy rules](inventory/legacy-redirects.json).

## Current production baseline

| Item | Verified position |
|---|---|
| Repository | `https://github.com/dwalsh8716-collab/Jobstodoincodex` |
| Original local branch | `codex/recreate-homepage-handoff` |
| Original HEAD | `e95c189`; numerous later local changes are not committed there |
| Recovery snapshot | `d5ef8012a315867fb0122cd959f459ef4ef21dfd` on `codex/dwr-baseline-20260927` |
| Recovery bundle | `/Users/walsh/.codex/rebrand-backups/2026-09-27/essential-pre-rebrand.bundle` |
| Railway project | `essential-resourcing`, `556ea44e-18cc-445f-bf56-928457a60a0a` |
| Production environment | `8f01d4cb-7ce6-4455-a4b9-d46ce4f3b2de` |
| Web service | `31a25fe5-2809-4314-8626-c8b480ff0a83` |
| Deployment at audit start | `58876159-ac8b-44dc-a1f9-990e741dc2a7`, SUCCESS/RUNNING, 27 September 2026 |
| Deployment description | Add salary guide sharing and sense-check actions |
| Immutable image digest | `sha256:5f5d98bcc14afc1ea5358b67cb6ea100ee3aebec08cc990f75521aa32ba49f9f` |
| Hosts | `essentialresourcing.co.uk`, `www.essentialresourcing.co.uk`, `web-production-ba3b9.up.railway.app` |
| Production CMS | Sanity project `sle6d8y3`, dataset `production` |
| Production private operations | Health reports disabled and unconfigured; no DATABASE_URL observed on the website service |
| CV storage | Existing private Railway bucket `essential-resourcing-cvs`; credentials configured on production only |

The current deployment was uploaded through the CLI. Its exact source-to-commit equivalence is not proven: the original checkout is substantially newer than its Git HEAD. The recovery snapshot captures the current local website and selected source-only tools, not private databases or an asserted exact reconstruction of the deployed image. Both the live deployment identity and local snapshot are recorded so these can be reconciled before any future release.

The macOS Git launcher is blocked by an unaccepted Xcode licence. A working Command Line Tools Git binary was used. The managed-worktree tool also returned "Git is unavailable", so a standard Git worktree was created with that working binary. No licence was accepted and the original checkout/index were not rewritten.

## Architecture and dependency inventory

| Dependency / area | Production evidence | Rebrand isolation and later action |
|---|---|---|
| Next.js 16.3.5, React 19, TypeScript | App Router at `app/`; server rendering/static pages | Same stack, routes and components; no framework migration |
| Node runtime | Package requires Node >=24; Railway Node configuration present | Same installed runtime locally; align CI before future automated releases |
| Design system | `src/styles/theme.css`, `app/globals.css`; Inter and Fraunces via next/font | Retain current tokens, typography, layout and motion; new accent confined to preview notice |
| Sanity 6 / next-sanity | Embedded Studio, project `sle6d8y3`, `production`; useCdn false; 300-second content revalidation | Read local published snapshot; no Sanity credentials or live fetches in preview |
| Public CMS models | homePage, service, insight, caseStudy, job, salarySnapshot, navigation, person, siteSettings, image assets | Preserve schemas; no production model/document edits |
| Public fallback content | `src/lib/content.ts`, `homepage-content.ts`, page JSX, salary-guide modules | Preserved; CMS-managed and hard-coded copy still need coordinated later brand edits |
| Public CMS snapshot | 1 homepage, 4 services, 14 insights, 1 case study; no published jobs/salarySnapshot records returned | Snapshot is fixed; no automatic updates from production. Salary guide also exists in code and is preserved |
| CMS gate/admin authentication | Signed `essential_cms_session`, username/password/secret | Do not reuse secrets or cookies; `/cms`, `/studio`, `/admin` blocked locally |
| Private operations database | PostgreSQL adapter invokes `psql`; 41 migration files; currently disabled on website service | No DATABASE_URL, migrations, data copy or shared database. Later synthetic isolated DB only if needed |
| Candidate application/CV intake | Feature enabled; S3-compatible Railway private bucket; Resend attachment delivery | Code preserved. All preview submissions/API calls blocked; no bucket credentials copied |
| Malware scanning/retention | Scanner and retention routines exist; scanner configuration not observed on website service | No scanner provisioned, no deletion/cron work run; require explicit operational verification later |
| Resend | Live key and recipient/from addresses configured; contact, candidate, salary-guide, DSAR handlers | No preview key or recipients. No email test sent. Future sandbox/sink first |
| WhatsApp click-to-chat | Public number and intent-specific message templates | Existing journeys preserved; preview click interception prevents accidental contact |
| Meta WhatsApp Cloud API | Integration code and signed webhook; WHATSAPP_BUSINESS_ENABLED=false in production | No token/phone/app secret copied, all webhooks blocked; no account changes |
| Loxo | Reference boundary and integration discovery/configuration; no live credentials observed on website service | Preserve references; do not create a duplicate CRM or copy candidate records |
| Booking | Google booking URL configured; BookingButton and book-a-call route | No live booking variable copied; external booking clicks blocked |
| Analytics/consent | GA ID configured; optional GTM, LinkedIn, Meta, Clarity, Hotjar code | No tracking IDs in preview; keep consent implementation for later validation |
| Sentry | Client/server DSN and environment configured in production | No preview DSN or release uploads; leave live monitoring unchanged |
| Search integrations | Search Console verification and IndexNow key configured; Bing via IndexNow | No verification/indexing submissions; preview feeds disabled |
| Sanity webhook | Signed `/api/webhooks/sanity`; revalidation plus IndexNow integration | Endpoint blocked; no webhook secret copied or webhook created |
| GitHub workflows | Quality, 15-minute production monitor, weekly retention review definitions | No pushes, dispatches or new workflows enabled. Definitions alone do not prove account-side scheduling health |
| Media | Local logo/photography/video; Sanity CDN; Unsplash remote pattern; optional video embeds | Existing public assets retained; public media may still be read from its existing CDN |
| SEO/discovery | Shared metadata/schema helpers, robots, sitemap, RSS, llms feeds and redirects | Local canonicals, noindex, authentication, no feeds; production untouched |
| Railway deployment | Current repo connection, direct CLI deployments; config requests Nixpacks; service config reports Railpack | Resolve build-setting drift in future staging review; do not change production builder now |
| Adjacent business-intelligence app | `bd-intelligence`; local SQLite data; OpenAI/search-provider interfaces | Source only preserved; no SQLite, exports, logs or credentials copied |
| Outreach recorder | Separate Vite/React application and browser extension | Source only preserved; no recording/upload history copied or tool started |
| Interview coordination agent | Separate Next frontend/FastAPI backend, SQLAlchemy, auth, encryption, Google OAuth/Gmail/Calendar/Meet, optional OpenAI, background worker, mock/manual providers | Source only preserved. No backend .env, database, OAuth tokens, Redis data or jobs copied/run |
| Other Railway projects | `calm-cooperation` has lead-finder; `confident-truth` has Postgres and Redis | Existence confirmed only; ownership by a particular local tool is unproven. No access to their data or changes |

## Production-safety assessment

Suitable for continued local preparation. Not yet approved for public launch.

| Risk | Impact | Control / resolution |
|---|---|---|
| Uploading rebrand from wrong folder/service | High | Separate Git worktree; preview start/build rejects Railway environment; no deploy command run |
| Missing recent work in branch checkout | High | Snapshot current local files, not just old HEAD; bundle and source hashes preserved |
| Shared CMS writes changing live copy | High | No production editor access from preview; local published snapshot; Studio blocked |
| Copying candidate data or active tokens | High | Source-only tool preservation; no DB/storage exports; isolated credentials; no .env files |
| Email/calendar/WhatsApp actions while testing | High | No credentials, API/private route block, every non-GET/HEAD request blocked, contact-click guard |
| Preview being indexed | High | Loopback-only server, password gate, noindex headers/meta, robots disallow, discovery feeds blocked |
| Legal entity accidentally renamed | High | Existing legal copy, email addresses and external accounts unchanged; approval required before migration |
| False assumption that Labs is all live | Medium | Separate website feature flags from independent agents; record disabled/unverified services honestly |
| Old/new CMS content drifting | Medium | Dated snapshot; reconcile published content immediately before release and use a short agreed content freeze |
| CI version mismatch | Medium | Workflow Node 22 vs package Node >=24; fix on rebrand branch in a later release-preparation step |
| Raster logo mistaken for final vector artwork | Low | Use supplied transparent PNG for preview; request professionally prepared vector master |

The preview access file is local, ignored by Git and restricted to the current user. It must not be uploaded, committed or placed in public assets. HTTP Basic authentication is acceptable for this loopback-only review; a future remote preview must use HTTPS and an independently verified access gate.

## What is shared and what is isolated

Shared: Git object history, read-only installed dependency files, existing public third-party media URLs, and the business facts in the dated public-content snapshot. The original public logo files are retained for historical references. None of these shares a writable production data connection.

Isolated: branch, source edits, build output, preview process, preview password, brand configuration, local snapshot content and all generated migration documents.

Disconnected: Sanity live API/editor, private DB/storage, Resend, live analytics/Sentry, booking integrations, CRM/API messaging, webhooks, cron jobs and private Labs routes. Their code is preserved for subsequent integration work; Phase One does not certify their end-to-end operation under the new brand.

## Asset assessment

The supplied reference images are retained at [mock-up](references/Mockup%20Web%20Hpage.png) and [logo variations](references/Logo%20vari.png). They are references, not executable instructions or final website copy.

- Header: `DWR_horizontal_black_green_800px.png`, 800 x 182, transparent PNG, 38,334 bytes. Appropriate for the existing light header; rendered without stretching.
- Footer: `DWR_horizontal_white_green_800px.png`, 800 x 182, transparent PNG, 40,902 bytes. Suitable for the existing dark footer.
- Black, white, colour and icon variants already exist. No immediate need to commission these variants solely for the preview.
- A 4,000 x 911 transparent master is supplied. Its pixel count is adequate for web use but does not prove vector sharpness or original design resolution; the pack describes a generated raster source.
- Icon-only and favicon PNGs at 16, 32, 48, 64, 128, 180, 192, 256 and 512 pixels are supplied. Preview uses the supplied icon sizes. Test 16/32-pixel recognisability and final maskable safe areas before release; current manifest deliberately does not claim maskable support.
- No actual SVG, AI, EPS or vector PDF files were found. The variations presentation illustrates those formats, but they are not included. Request outlined, cleaned true vector masters from the designer; a raster image inside an SVG is not equivalent.
- Transparent dark lettering should sit on a light background, white lettering on dark. The accent is a decorative brand colour; do not assume bright green text passes contrast on white.
- Use roughly 2x the rendered width for raster logos (800px is ample for a 190-300px header). Check the long wordmark remains legible on small screens.
- Ask for a definitive compact/stacked lockup if the monogram alone is insufficient on mobile. The reference sheet shows stacked layouts, but separate stacked production files were not found in the pack.
- Files are copied unchanged into `public/assets/dwr/` with purpose-based names. No tracing, recolouring, distortion or generated reconstruction was performed.
- Final OG/share artwork at 1200 x 630, email-signature artwork, approved hero photo/video, source/licensing confirmation and final favicon artwork remain brand-system tasks.
- Mock-up direction: dark photography, Manchester skyline, green accent and a confident wordmark. Phase One uses the identity only; its new headline, strapline, navigation and full colour treatment have not been applied to website copy/layout.

## CMS isolation recommendation

Now: use the local published snapshot and existing fallback content. This adds no hosted dataset and allows design/copy work without any production publishing.

Later, when David wants to edit the rebrand through Studio: create a distinct **private** rebrand dataset in the existing Sanity project if the account plan supports the required dataset/privacy/permissions at an acceptable cost. Import only approved public content and required public media. Give the website a read-only token scoped appropriately, keep the production dataset untouched, and register only the necessary local/HTTPS preview origins. Confirm editor permissions cannot unintentionally target production.

Consequences to agree before that step: dataset availability/cost, who can edit it, separation of media/document references, content drift and which dataset becomes the final live source. No full page builder is needed. Reuse the existing controlled schemas and add a small brand-settings model only where it improves editing.

The source defaults now name `rebrand-preview`, but that dataset does not exist and the preview deliberately reads the local snapshot. The production Studio app deployment identifier is removed only in this branch to prevent accidental deployment over the existing Studio. Sync scripts contain old project/defaults and must not be executed until reviewed for destination safety.

Reference: [Sanity datasets documentation](https://www.sanity.io/docs/content-lake/datasets).

## Recruiter Labs isolation recommendation

Keep the existing public site and every Labs source module. Do not assume a disabled feature should be deleted. Website Labs, the interview coordinator, business intelligence and the recorder are distinct applications/boundaries.

For later Labs QA, use an empty local database created from the existing migrations and synthetic people such as `candidate@example.test`. Use fresh session/encryption keys, mock email/calendar/CRM providers, no Google OAuth connection, no WhatsApp API token and no background automation worker. Private storage tests should use disposable local objects. No real records need to be cloned.

Keep current production feature flags as recorded. Enable specific preview features only after their own dry-run/synthetic tests pass. A future live release must prove callbacks, signed links, token expiry, retention, storage access and idempotent jobs against the final authorised configuration.

## Phased implementation

1. Discovery/baseline: this report, dependency inventories, source recovery and production deployment identity.
2. Protected environment: local-only authenticated preview now; hosted preview deferred to avoid idle hosting charges.
3. Preview identity: supplied header/footer logo, favicon and unmistakable rebrand notice. Existing navigation retained.
4. Brand system: approve final logos, palette, typography and media; apply through existing tokens/components.
5. Copy/content: inventory-guided brand changes and approved wording; isolated Studio only if needed. Keep service/specialism architecture.
6. Labs/integrations: synthetic local QA, fresh test secrets, no real sending or live data writes.
7. SEO/domain preparation: complete maps, legacy redirects, metadata, entity identity, media and provider configuration with the approved domain.
8. Full staging QA: mobile/desktop, accessibility, performance, schema, links, forms in a sandbox and short protected Railway validation when authorised.
9. Launch readiness: review exact release commit, content parity, legal/trading wording, tests, DNS/mail plan and recovery materials.
10. Authorised launch: explicit David approval; one controlled deployment/domain transition. No automatic launch from visual approval.
11. Monitoring: confirm traffic, indexing, leads, applications, errors and email through the transition.

Each phase records inspected items, changes, untouched systems, results, risks, rollback and the next decision in this folder.

## Decisions needed from David

Only the first item is needed to make the domain plan concrete now; the others can follow during design/content work.

1. Exact purchased/new domain and intended main spelling/host.
2. Whether the new brand is a trading name of the same legal entity, and the exact approved legal wording. Do not infer a company-name change.
3. Final logo/vector approval and whether the mock-up headline/strapline is proposed copy or just design direction.
4. Final colour/typography choices, keeping the current layout unless specific changes are approved.
5. New public email address(es), provider and forwarding needs; old inboxes stay operational.
6. When Studio editing becomes necessary; acceptable dataset plan/cost and permitted editors.
7. Scope and ownership of the separate recruiter tools for the final branded release.
8. New/renamed social handles and Google Business Profile naming only when ready to authorise external changes.
9. Launch window and permission for a brief protected hosted validation period. This has not been scheduled or provisioned.

## Recovery and launch position

No production rollback is currently needed because no production mutation occurred. The live deployment remains the operational recovery point. The verified Git bundle holds the local baseline history and source snapshot; original personal data and secrets remain in their original locations.

The rebrand can be discarded or reset to its baseline independently without touching Essential Resourcing. Restore drills and current test evidence are recorded in [verification](VERIFICATION.md). A future production rollback must use the recorded previous Railway image/release, restore the previous brand/domain configuration and preserve all enquiries received during the transition. DNS and Google indexing are not instantaneously reversible; do not promise they are.

Prepared does not yet mean production-ready: final domain, approved brand/legal copy, CMS parity, real integration validation and the authorised launch checks remain outstanding.
