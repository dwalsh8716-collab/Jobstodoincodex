# Final QA Launch Report

Audit date: 11 June 2026

## Executive Summary

Status: partially ready.

The website is strong from a code and content-structure point of view. The local
production build runs, the public route set renders, admin and Labs routes are
protected, forms validate, consent-aware analytics is staged, and Railway/Sanity
handover docs are in place.

It is not safe to call the site fully launched yet.

The remaining launch blockers are account-side and business-side:

- Railway deployment has not been connected and verified from this workspace.
- Railway production environment variables are not set.
- Email delivery is not configured with live Resend/from/to values.
- Sanity project access, project ID, dataset and CORS are not confirmed.
- 123 Reg DNS has not been switched.
- Google Search Console, GA4/GTM and local SEO setup need David's account access.
- Privacy, cookie and candidate data wording still needs legal/privacy review.
- Final live-domain smoke testing has not happened because there is no live
  Railway URL in this session.

Final recommendation: safe for local preview and private stakeholder review now.
Safe for public launch only after the blockers above are completed and the live
Railway/domain smoke test passes.

## Critical Blockers

These block true public launch:

1. Deploy to Railway and confirm the Railway-generated URL works.
2. Add production environment variables in Railway.
3. Configure form email delivery, or accept that forms only validate locally and
   show the safe fallback message.
4. Confirm Sanity project access, CORS and production env vars.
5. Confirm 123 Reg DNS records without breaking email.
6. Complete legal/privacy review for Privacy Policy, Cookie Policy, Candidate
   Privacy Notice, consent wording and retention periods.
7. Complete Google Search Console, GA4/GTM, consent-mode and local SEO account
   setup.
8. Run final QA on the real production URL.

No code blocker was found that prevents the app from building or running
locally.

## High Priority Fixes Made

- Added canonical redirects for common old or short launch URLs:
  - `/about` -> `/about-essential`
  - `/about-david` -> `/about-david-walsh`
  - `/leadership-search` -> `/services/leadership-search`
  - `/strategic-interim` -> `/services/strategic-interim`
  - `/agency-recruitment` -> `/services/agency-recruitment`
  - `/client-side-recruitment` -> `/services/client-side-marketing-recruitment`
  - `/marketing-recruitment` -> `/services/client-side-marketing-recruitment`
  - `/privacy` -> `/privacy-policy`
  - `/cookies` -> `/cookie-policy`
- Replaced the old `/salary-guides` redirect with a staged, noindexed salary
  guide lead-capture page controlled by `FEATURE_SALARY_GUIDE_GATE`.
- Tightened public form API parsing so empty or malformed POST requests return
  safe validation responses rather than a server error.
- Added tests for the redirects and public form API responses.
- Added this final launch report and linked it from the handover docs.

## Medium Priority Fixes

- Add the final public phone number if David wants phone to appear on the site.
- Add `NEXT_PUBLIC_LINKEDIN_URL` in Railway so LinkedIn appears in the contact
  and footer surfaces.
- Add a Google Calendar Appointment Schedule URL if booking should be live.
- Replace draft proof and salary content only when outcomes/data are verified.

## Nice-To-Haves

- Add Sentry or a similar error tracker after Railway is live.
- Add an uptime monitor for `/`, `/contact`, `/sitemap.xml` and `/api/health`.
- Add a final David portrait if David wants a stronger founder visual signal.
- Add approved testimonials/logos only when permission is explicit.

## Page-By-Page Findings

Local production preview was checked at `http://127.0.0.1:3000`.

| Route                                         | Status          | Findings                                                                                                   |
| --------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------- |
| `/`                                           | Green           | Homepage renders. Hero, navigation, WhatsApp and contact CTAs are present.                                 |
| `/about-essential`                            | Green           | Brand/about page renders.                                                                                  |
| `/about-david-walsh`                          | Green           | David profile page renders. LinkedIn is env-controlled and must be set before launch if required.          |
| `/clients`                                    | Green           | Client route renders.                                                                                      |
| `/candidates`                                 | Green           | Candidate route renders. CV upload is deliberately withheld until secure storage exists.                   |
| `/services`                                   | Green           | Services index renders.                                                                                    |
| `/services/leadership-search`                 | Green           | Service route renders.                                                                                     |
| `/services/strategic-interim`                 | Green           | Service route renders and WhatsApp is commercially useful here.                                            |
| `/services/agency-recruitment`                | Green           | Service route renders.                                                                                     |
| `/services/client-side-marketing-recruitment` | Green           | Service route renders.                                                                                     |
| `/services/senior-recruitment`                | Green           | Service route exists and is in the sitemap.                                                                |
| `/specialisms`                                | Green           | Specialisms route renders.                                                                                 |
| `/jobs`                                       | Green           | Jobs index renders. No live job is exposed as a fake vacancy.                                              |
| `/jobs/senior-account-director-draft`         | Green by policy | Draft job detail returns 404 and is excluded from sitemap because it is not live.                          |
| `/insights`                                   | Green           | Insight index renders.                                                                                     |
| `/insights/[slug]`                            | Green           | Four published insight routes render.                                                                      |
| `/case-studies`                               | Green           | Index renders safe draft summaries only. No fake proof is published.                                       |
| `/case-studies/[slug]`                        | Green by policy | Draft case-study detail pages return 404 until permissioned proof exists.                                  |
| `/salary-snapshots`                           | Green           | Index renders safe draft snapshot summaries only.                                                          |
| `/salary-snapshots/[slug]`                    | Green by policy | Draft salary detail pages return 404 until salary data is validated.                                       |
| `/contact`                                    | Green           | Contact page renders. WhatsApp, email, booking fallback and form are present.                              |
| `/book-a-call`                                | Green           | Booking route renders with a fallback when no booking URL is configured.                                   |
| `/privacy-policy`                             | Amber           | Page exists. Legal/privacy review still required.                                                          |
| `/cookie-policy`                              | Amber           | Page exists. Legal/privacy review still required.                                                          |
| `/candidate-privacy`                          | Amber           | Page exists. Legal/privacy review still required before real candidate data workflows go live.             |
| `/candidate-privacy/request`                  | Amber           | DSAR/privacy request page renders. It does not pretend to be fully handled when email/storage are missing. |
| `/terms`                                      | Amber           | Page exists. Legal review still required.                                                                  |
| `/sitemap.xml`                                | Green           | Renders and excludes admin, Labs, client shortlist, draft jobs, draft proof and draft salary pages.        |
| `/robots.txt`                                 | Green           | Renders, points to sitemap and blocks private/admin/API discovery.                                         |
| `/rss.xml`                                    | Green           | Renders.                                                                                                   |
| `/llms.txt`                                   | Green           | Renders.                                                                                                   |
| `/llms-full.txt`                              | Green           | Renders.                                                                                                   |
| `/api/health`                                 | Green           | Returns safe non-secret health data.                                                                       |
| `/cms`                                        | Green           | CMS gate renders and is noindexed.                                                                         |
| `/studio`                                     | Green           | Redirects to `/cms` when not signed in.                                                                    |
| `/admin`                                      | Green           | Redirects to `/cms?next=/admin` when not signed in.                                                        |
| `/admin/labs`                                 | Green           | Redirects to CMS gate and is noindexed in code.                                                            |
| `/admin/recruiter-labs`                       | Green           | Redirects to CMS gate and is noindexed in code.                                                            |
| `/admin/recruiter-labs/ai-ops`                | Green           | Redirects to CMS gate and is noindexed in code.                                                            |

## CMS Findings

Status: partially ready.

What is good:

- Sanity 5 Studio is embedded at `/studio`.
- Friendly CMS entry point exists at `/cms`.
- `/studio` is protected by the same CMS session gate before Sanity loads.
- Editor docs exist:
  - `docs/sanity-editor-guide.md`
  - `docs/sanity-cms-access.md`
  - `docs/sanity-cms-audit.md`
- Schema includes public content, SEO fields, media/rich text support, site
  settings, navigation, jobs, insights, services, case studies and salary
  snapshots.
- Docs clearly say Sanity is public CMS only.

Remaining risk:

- Real Sanity project ID, dataset, user access and CORS cannot be verified from
  this local workspace.
- David must confirm Owner/Admin access in Sanity Manage.
- Sanity tokens must be set in Railway only, never committed.

## Railway Findings

Status: code-ready, account not verified.

What is good:

- `railway.json` exists.
- `nixpacks.toml` installs Node 22 and PostgreSQL client.
- Build command is `npm run build`.
- Start command is `npm run start -- --hostname 0.0.0.0 --port ${PORT:-3000}`.
- Healthcheck path is `/api/health`.
- Public app does not depend on Postgres to render.
- Private operations database can remain off until Railway Postgres is ready.

Remaining risk:

- Railway CLI is not installed locally.
- Railway account/project is not authenticated in this session.
- Railway generated URL has not been tested.
- Railway logs have not been inspected.
- Railway Postgres is not created or migrated from this workspace.

## SEO And GEO Findings

Status: strong local readiness.

What is good:

- Metadata and canonical logic are centralised through `src/lib/seo.ts`.
- Sitemap renders.
- Robots renders.
- RSS, `llms.txt` and `llms-full.txt` render.
- Private and draft routes are excluded from sitemap.
- Admin/CMS/Studio routes are noindexed and/or access protected.
- Structured data exists for organisation, person, website, breadcrumbs,
  services, articles and item lists.
- Google setup docs exist in `docs/launch-google-seo-local-setup.md`.

Remaining risk:

- Google Search Console verification is manual.
- Sitemap has not been submitted in production.
- GA4/GTM IDs are not set locally.
- Consent-mode and analytics must be tested on the live domain after IDs are set.

## Performance Findings

Status: green locally.

Evidence:

- Production build completed.
- Performance budget passed.
- Unique public client JavaScript was reported at 31KB gzip.
- Public pages do not import private Recruiter Labs helpers.
- Feature flags remain server-only.
- No third-party feature flag service or widget was added.

Remaining risk:

- Lighthouse/PageSpeed should be run against the live Railway/custom domain
  after deployment and DNS.

## Accessibility Findings

Status: green from available automated coverage, with live manual review still
needed.

What is good:

- Playwright smoke tests cover desktop and mobile navigation.
- Forms use labels, required fields, status regions and consent checkboxes.
- Skip link exists.
- Admin routes are not exposed in normal public navigation.
- Mobile menu has accessible labels and expansion state.

Remaining risk:

- Full screen-reader testing is not done in this workspace.
- Final keyboard-only pass should be repeated on the live domain.

## Security And Privacy Findings

Status: strong local boundary, legal review still required.

What is good:

- Secret-pattern scan found no committed API keys or obvious tokens.
- Server secrets are not exposed as `NEXT_PUBLIC_*`.
- Sanity boundary docs block candidate/client PII and CVs from CMS.
- CV upload is deliberately not enabled.
- Admin/Labs routes require CMS session gate and noindex metadata.
- Recruiter Labs flags default off.
- WhatsApp Business API sends are disabled unless explicitly configured.
- Consent Mode V2 default/update flow exists and docs explain that Consent Mode
  is not a cookie banner by itself.
- Privacy, Cookie Policy and Candidate Privacy pages exist.

Remaining risk:

- Legal/privacy review is required before launch.
- Live analytics must be tested with real IDs and consent choices.
- Railway/Postgres retention and backup policy need owner approval before real
  candidate data is stored.

## Forms Findings

Status: contact form green locally; DSAR route safe but not fully configured.

What was tested:

- Empty contact API POST now returns safe validation failure.
- Valid contact form-style POST returns 200 with a safe message.
- Empty DSAR/privacy API POST now returns safe validation failure.
- Valid DSAR/privacy POST returns a safe 503 fallback when email/storage are not
  configured.
- WhatsApp webhook verification rejects an invalid token.

Remaining risk:

- `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` must be set in
  Railway for live email notifications.
- If private operations are enabled, `DATABASE_URL`, migrations and backups must
  be verified first.

## Recruiter Labs Findings

Status: private and safe.

What is good:

- Feature flags default off.
- Central feature flag registry exists.
- Public pages do not import private Labs helpers.
- Admin/Labs routes redirect to CMS gate when unauthenticated.
- Admin/Labs routes are noindexed in code.
- Labs/client routes are excluded from sitemap.
- No public client shortlist route exists.
- No real WhatsApp sends, Google Calendar events, AI candidate processing or
  Loxo sync is live.

Remaining risk:

- Recruiter Labs must stay private until a separate launch gate approves real
  client/candidate workflows.

## Commands Run

Passed:

- `gh issue list --repo dwalsh8716-collab/Jobstodoincodex --state all --search "final QA launch Railway CMS SEO Recruiter Labs" --json number,title,state,labels,url --limit 30`
- `find app -type f ...`
- `rg` route, form, env, TODO/FIXME and private route searches
- `lsof -nP -iTCP:3000 -sTCP:LISTEN || true`
- `npm run start -- --hostname 127.0.0.1 --port 3000`
- local route smoke with `curl`
- form API smoke with `curl`
- `npx prettier --check next.config.ts src/tests/unit/redirects.test.ts src/tests/e2e/site.spec.ts`
- `npm run test -- --run src/tests/unit/redirects.test.ts src/tests/unit/launch-setup.test.ts src/tests/unit/feature-flags.test.ts`
- `npm run test -- --run src/tests/unit/api-routes.test.ts src/tests/unit/contact.test.ts src/tests/unit/data-subject-request.test.ts`
- `npm run typecheck`
- `npm run verify` passed after the redirect, API and report changes:
  - lint passed
  - production build passed
  - typecheck passed
  - 29 unit test files passed
  - 135 unit tests passed
  - performance budget passed
  - 14 Playwright browser smoke tests passed across desktop and mobile

## Files Changed

- `next.config.ts`
- `app/api/contact/route.ts`
- `app/api/data-request/route.ts`
- `src/tests/e2e/site.spec.ts`
- `src/tests/unit/redirects.test.ts`
- `src/tests/unit/api-routes.test.ts`
- `src/tests/unit/final-qa-launch.test.ts`
- `docs/final-qa-launch-report.md`
- `docs/launch-handover.md`
- `README.md`

## Manual Actions For David

1. Log into Railway.
2. Connect `dwalsh8716-collab/Jobstodoincodex`.
3. Add all production environment variables.
4. Deploy and test the Railway-generated URL.
5. Configure Resend/form email variables.
6. Confirm David has Sanity Owner/Admin access.
7. Add Railway and final domains to Sanity CORS.
8. Create Railway Postgres only if private operations are going live.
9. Run migrations before setting `OPERATIONS_DB_ENABLED=true`.
10. Keep `RETENTION_ENGINE_ENABLED=false` until legal/privacy and backup review.
11. Add Google Search Console verification.
12. Add GA4/GTM only with consent-aware setup.
13. Review Privacy Policy, Cookie Policy, Candidate Privacy Notice and Terms
    with a suitable legal/privacy adviser.
14. Deploy to Railway before touching 123 Reg DNS.
15. Back up current 123 Reg DNS records.
16. Add only the exact Railway DNS records.
17. Preserve MX, SPF, DKIM, DMARC and mailbox verification records.
18. Test apex, `www`, SSL, email sending and email receiving.
19. Submit the production sitemap in Google Search Console.
20. Run final live-domain QA before announcing launch.

## Final Recommendation

Safe for local preview and private stakeholder review now.

Not safe for full public launch until the manual launch blockers are completed.

Safe to launch after:

- Railway deploy passes
- live domain works
- forms/email are configured and tested
- Sanity access/CORS are confirmed
- Google/search/analytics setup is done
- legal/privacy review is complete
- final live-domain smoke test passes

No fake green ticks. No public Labs leakage. No secrets in GitHub. No faff.
