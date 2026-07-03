# Codebase Forensic Audit Report

Audit date: 11 June 2026

## Executive Summary

Status: Amber.

The site is a serious, working Next.js build with public pages, Sanity CMS, consent-aware analytics, WhatsApp contact routes, Railway deployment files, private operations database migrations, admin routes, tests and documentation already in place.

It is safe to continue controlled build work.

It is not safe to call this fully launched until David completes the manual account-side work: Railway environment variables, Sanity project/editor access, production domain, email delivery, legal/privacy review, GA4/GTM setup and final live smoke testing.

## Plain English System Map

- Next.js is the website and server route layer.
- Sanity is the public CMS for pages, jobs, insights, services, case studies, salary content, images, navigation and SEO.
- Loxo should remain the recruitment CRM/ATS source of truth for candidate and client recruitment records.
- Railway hosts the website and can provide Postgres for private website workflows.
- Railway Postgres is staged for website enquiries, consent logs, audit logs, DSAR records, retention review, Recruiter Labs prototypes and integration staging.
- GitHub is the code and issue source of truth.
- Codex is the engineering assistant making audited code changes.

## What Exists

Frontend:

- Next.js 16 App Router.
- React 19.
- TypeScript.
- Tailwind/CSS token styling in `src/styles/theme.css`.
- Public route set for homepage, about, clients, candidates, services, jobs, insights, case studies, salary snapshots, contact, booking, privacy, cookies and terms.

CMS:

- Sanity 6 Studio embedded at `/studio`.
- Branded CMS gate at `/cms`.
- Public content schemas for pages, services, jobs, insights, case studies, salary snapshots, testimonials, FAQs, people, navigation and site settings.
- Server-only Sanity fetch layer with local fallback content.

Backend:

- API routes for contact, data/privacy request, health, preview, CMS login/logout and WhatsApp webhook.
- Server actions for contact and data subject requests.
- Private operations database scripts and migrations.

Security and privacy:

- Consent banner and Google Consent Mode V2 defaults.
- Security headers in `next.config.ts`.
- CMS/admin gate with signed cookie.
- Admin, CMS, Studio and Labs routes are noindexed/protected.
- Private route groups are excluded from `sitemap.xml`.

Testing:

- Vitest unit tests.
- Playwright smoke tests.
- Performance budget script.
- Sanity schema validation command.
- New GitHub Actions quality gate added in this audit.

## What Works

- The site builds locally.
- Public content has local fallback if Sanity is missing.
- Sanity schemas avoid candidate and client private data.
- Contact and data request forms validate server-side.
- Contact form has honeypot, timing check and rate limit protection.
- Email delivery is optional and environment-driven.
- Postgres writes are disabled unless explicitly enabled.
- Recruiter Labs is admin-only and hidden from search.
- AI/Labs policy blocks real candidate data and automated candidate evaluation.
- WhatsApp Business automation is disabled unless explicitly configured.
- Cookie consent is privacy-first and can be reopened from the footer.
- Railway build/start/healthcheck config exists.

## What Is Broken

No confirmed broken public page was found in the code audit.

Known not-live items:

- Production Railway deployment was not verified against a real Railway URL in this audit.
- Production Sanity account access was not verified from the codebase.
- Production email delivery was not verified because `RESEND_API_KEY` and recipient variables are environment-side.
- Production database connection was not available locally because `DATABASE_URL` is not set.
- No live Loxo integration exists.
- No private CV storage or secure CV upload exists.

## What Is Risky

- Launch depends on account setup David must do outside code.
- Legal/privacy pages contain careful launch wording but still need legal review.
- In-memory rate limiting is useful but not a complete distributed production abuse-control layer.
- CMS gate protects Studio/admin, but David must set strong `CMS_GATE_*` values.
- WhatsApp Business webhook verification is safe only when `WHATSAPP_BUSINESS_APP_SECRET` is set.
- Postgres schema includes candidate/application tables, but the site must not become a full CRM. Loxo remains source of truth.
- AI and Recruiter Labs features must stay private until provider, consent, retention and review gates are complete.

## What Is Missing

- Live Railway service confirmation.
- Live Postgres database and migrated schema.
- Sanity project, dataset, CORS and invited editor confirmation.
- Production email provider setup.
- Production domain and DNS switch.
- GA4/GTM/Search Console account setup.
- Sentry or equivalent application error tracking.
- Uptime monitoring.
- Legal review of privacy, cookie, candidate privacy and retention wording.
- Loxo API/access discovery.

## What Was Fixed In This Audit

- Added GitHub Actions quality gate in `.github/workflows/quality.yml`.
- Added Dependabot config in `.github/dependabot.yml`.
- Created the required plain-English audit documentation pack.
- Linked the new audit documents from `README.md`.
- Made the Playwright production smoke tests use `127.0.0.1` so local checks do not get confused by stale `localhost` listeners.
- Tightened the contact-form smoke test so WhatsApp CTA labels cannot be mistaken for the form message field.

## What Was Not Touched

- No palette change.
- No Manchester palette.
- No new database ORM.
- No Loxo connection.
- No WhatsApp Business live send setup.
- No Google Calendar account connection.
- No AI provider connection.
- No private candidate data added to Sanity.
- No CV upload route added.

## Manual Actions For David

1. Create or confirm the Railway project and app service.
2. Add all production environment variables in Railway.
3. Create Railway Postgres if the private operations database is needed.
4. Run migrations only after `DATABASE_URL` is set.
5. Confirm Sanity project ID, dataset and CORS settings.
6. Invite David and approved editors to Sanity.
7. Configure CMS gate username, password and secret.
8. Configure Resend or another email provider.
9. Configure GA4/GTM only after cookie consent is approved.
10. Complete Search Console verification and sitemap submission.
11. Complete 123 Reg DNS switch without touching email records.
12. Get legal review of privacy, cookie, candidate privacy and retention wording.
13. Confirm Loxo remains the recruitment CRM/ATS source of truth.
14. Keep Recruiter Labs private until a separate launch gate passes.

## Commands Run During Audit

- `gh issue view 119 --repo dwalsh8716-collab/Jobstodoincodex --json number,title,body,labels,comments,url`
- `gh issue list --repo dwalsh8716-collab/Jobstodoincodex --state all --limit 100 --search "audit QA backend Railway CMS Recruiter Labs Loxo" --json number,title,state,labels,url`
- `git status --short --branch`
- Route, docs, environment, schema, database, CMS and security file inspections using `rg`, `find` and `sed`.
- `npm audit --audit-level=moderate` - passed, 0 vulnerabilities.
- `npm outdated --long` - reported available updates, no code changed.
- `npm run verify` - passed after the smoke-test selector and loopback-host fix.
- `npm run sanity -- schema validate` - passed, 0 errors, 0 warnings.
- `npm run db:status` - passed safely; `DATABASE_URL` is not set locally.
- `npm run retention:check` - passed safely; skipped because `DATABASE_URL` is not set locally.

`npm run verify` includes lint, production build, generated route-type cleanup, TypeScript, unit tests, performance budget and Playwright desktop/mobile smoke tests.

## Final Recommendation

Safe to continue build.

Safe for private beta only after Railway, Sanity, email, database and legal/privacy setup are completed.

Not safe for public launch until the manual launch actions above are done and a final production URL smoke test passes.

No fake confidence. No hidden issues. No faff.
