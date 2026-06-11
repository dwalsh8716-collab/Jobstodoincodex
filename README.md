# Essential Resourcing Full Website Build

Premium Next.js + Sanity-ready website for Essential Resourcing.

## Stack

- Next.js 16 App Router with webpack production builds
- TypeScript
- React 19
- Clean CSS design system with central tokens
- Sanity 5 Studio schemas and `/studio` route
- Railway-ready deployment
- JSON-LD schema, dynamic sitemap, robots, RSS, `llms.txt` and `llms-full.txt`
- API-backed contact forms with optional Resend email delivery
- Project-level Codex guidance in `AGENTS.md`

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Checks

```bash
npm run lint
npm run build
npm run typecheck
npm test
npm run performance:budget
npm run test:e2e
npm run verify
```

`npm run verify` is the release gate. It runs linting, production build, TypeScript, Vitest, public bundle budget and Playwright.

## Environment Variables

Copy `.env.example` to `.env.local` and add values as needed.

Required before production:

- `NEXT_PUBLIC_SITE_URL`
- `CONTACT_TO_EMAIL`
- `RESEND_API_KEY` if forms should send email
- `CONTACT_FROM_EMAIL`

Required for Sanity:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_VERSION`
- `SANITY_READ_TOKEN` if private data is queried

Optional tracking:

- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_LINKEDIN_PARTNER_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`
- `NEXT_PUBLIC_CLARITY_ID`
- `NEXT_PUBLIC_HOTJAR_ID`
- `GOOGLE_SITE_VERIFICATION`
- `NEXT_PUBLIC_LINKEDIN_URL`
- `NEXT_PUBLIC_BOOKING_URL`
- `NEXT_PUBLIC_GOOGLE_BOOKING_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE`
- `SALARY_GUIDE_DOWNLOAD_URL`

Optional WhatsApp Business API:

- `WHATSAPP_BUSINESS_ENABLED`
- `WHATSAPP_BUSINESS_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCESS_TOKEN`
- `WHATSAPP_BUSINESS_VERIFY_TOKEN`
- `WHATSAPP_BUSINESS_APP_SECRET`
- `WHATSAPP_BUSINESS_DEFAULT_TEMPLATE`
- `WHATSAPP_BUSINESS_TEMPLATE_LANGUAGE`
- `WHATSAPP_BUSINESS_API_VERSION`
- `WHATSAPP_BUSINESS_INTERVIEW_CONFIRMATION_TEMPLATE`
- `WHATSAPP_BUSINESS_INTERVIEW_REMINDER_TEMPLATE`
- `WHATSAPP_BUSINESS_INTERVIEW_RESCHEDULE_TEMPLATE`
- `WHATSAPP_BUSINESS_INTERVIEW_LOCATION_TEMPLATE`
- `WHATSAPP_BUSINESS_INTERVIEW_AVAILABILITY_TEMPLATE`

Optional private Labs flags:

Full reference:

```txt
docs/feature-flags.md
```

- `FEATURE_LABS_ENABLED`
- `FEATURE_SALARY_GUIDE_GATE`
- `FEATURE_SALARY_BENCHMARK_ASSET`
- `FEATURE_MARKET_MAPPING`
- `FEATURE_BAD_HIRE_CALCULATOR`
- `FEATURE_FUNCTIONAL_MATRIX`
- `FEATURE_CLIENT_SHORTLIST_PORTAL`
- `FEATURE_AI_BRIEF_BUILDER`
- `FEATURE_INTERIM_BENCH_PORTAL`
- `FEATURE_INTERIM_AVAILABILITY_TOGGLE`
- `FEATURE_LIVE_MARKET_DASHBOARDS`
- `FEATURE_RECRUITER_LABS_ENABLED`
- `FEATURE_CLIENT_PRESENTATION_PORTAL`
- `FEATURE_BRANDED_CANDIDATE_PROFILES`
- `FEATURE_SHORTLIST_FEEDBACK_TRACKING`
- `FEATURE_RETAINED_SEARCH_DASHBOARD`
- `FEATURE_INTERVIEW_REQUEST_WORKFLOW`
- `FEATURE_WHATSAPP_INTERVIEW_SCHEDULING`
- `FEATURE_WHATSAPP_CRM_SYNC`
- `FEATURE_LOXO_INTEGRATION`
- `FEATURE_WHATSAPP_MESSAGE_LOGGING`
- `FEATURE_WHATSAPP_LOGISTICS_AUTOMATION`
- `FEATURE_GOOGLE_MEET_INTERVIEW_SCHEDULING`
- `FEATURE_AI_CANDIDATE_SUMMARIES`
- `FEATURE_DAVIDS_AUDIO_NOTES`
- `FEATURE_CANDIDATE_TRANSPARENCY_LABS`
- `FEATURE_FLUFF_FREE_JOB_PAGES`
- `FEATURE_CANDIDATE_APPLICATION_DROP`
- `FEATURE_LINKEDIN_PROFILE_APPLICATION`
- `FEATURE_CANDIDATE_STATUS_JOURNEY`
- `FEATURE_CANDIDATE_WHATSAPP_QUESTIONS`
- `FEATURE_INTERVIEW_PROCESS_TRANSPARENCY`
- `FEATURE_CANDIDATE_TRANSPARENCY_SCORECARD`
- `FEATURE_AI_OPS_COMPRESSION`
- `FEATURE_AI_INTERVIEW_NOTES`
- `FEATURE_AI_SCORECARD_NOTES`
- `FEATURE_AI_CANDIDATE_SUMMARY_DRAFTS`
- `FEATURE_CV_ANONYMIZATION`
- `FEATURE_AI_CLIENT_PROFILE_DRAFTS`
- `FEATURE_AI_FOLLOW_UP_DRAFTS`

Optional private operations database:

- `DATABASE_URL`
- `OPERATIONS_DB_ENABLED`
- `OPERATIONS_PRIVACY_SALT`
- `RETENTION_ENGINE_ENABLED`
- `RETENTION_DRY_RUN`
- `RETENTION_ROLE_APPLICATION_MONTHS`
- `RETENTION_TALENT_POOL_MONTHS`
- `RETENTION_GENERAL_CANDIDATE_MONTHS`
- `RETENTION_CLIENT_ENQUIRY_MONTHS`
- `RETENTION_CV_FILE_MONTHS`
- `RETENTION_DSAR_RECORD_MONTHS`
- `DSAR_EMAIL_VERIFICATION_TOKEN_HOURS`
- `INTERIM_AVAILABILITY_TOKEN_EXPIRY_DAYS`
- `RETENTION_AUDIT_LOG_MONTHS`
- `CRON_SECRET`

## Design Adaptability

The visual system is controlled in `src/styles/theme.css`.

Main tokens:

- `--color-bg`
- `--color-surface`
- `--color-surface-muted`
- `--color-ink`
- `--color-text`
- `--color-primary`
- `--color-accent`
- Radius, spacing, typography and shadows are also tokenised.

To change the visual direction, edit the root variables or set `NEXT_PUBLIC_THEME_PALETTE` to an included alternate palette:

- `editorial-green`

There is a noindexed design reference page at `/design-system`.

## Tone Of Voice

The David Walsh tone rules are saved in:

```txt
docs/DAVID-WALSH-TONE-OF-VOICE.md
```

Use that file before editing page copy, CTAs, FAQs, CMS labels, case studies, jobs or insight content.

## AI Search / GEO Signals

The site uses structured, crawlable signals rather than relying on a single gimmick:

- JSON-LD for organisation, person, website, breadcrumbs, services, articles, FAQs and live jobs
- Dynamic `sitemap.xml`
- `robots.txt`
- RSS feed at `/rss.xml`
- Concise AI map at `/llms.txt`
- Expanded AI-readable content map at `/llms-full.txt`

Draft jobs, draft case studies and unvalidated salary snapshots are deliberately kept out of the sitemap and AI index routes.

Launch route audit and future-page roadmap:

```txt
docs/LAUNCH-SITEMAP-ROUTES.md
docs/TECHNICAL-SEO-GEO.md
docs/FINAL-PRODUCTION-READINESS-AUDIT.md
docs/FINAL-POLISH-ROADMAP.md
docs/VISUAL-DESIGN-POLISH.md
docs/POST-LAUNCH-GROWTH-ROADMAP.md
docs/launch-google-seo-local-setup.md
docs/consent-mode-v2-setup.md
docs/frontend-architecture.md
docs/sanity-nextjs-fetching.md
docs/future-proof-architecture.md
docs/adr/README.md
docs/sanity-editor-guide.md
docs/sanity-cms-access.md
docs/WHATSAPP-CONTACT-INTEGRATION.md
docs/google-calendar-booking-setup.md
docs/essential-resourcing-labs.md
docs/feature-flags.md
docs/final-qa-launch-report.md
docs/job-copy-standards.md
docs/candidate-application-drop.md
docs/cv-anonymization.md
docs/codebase-forensic-audit-report.md
docs/non-technical-architecture-map.md
docs/sanity-cms-audit.md
docs/backend-data-boundary-audit.md
docs/railway-readiness-audit.md
docs/security-privacy-audit.md
docs/dependency-update-policy.md
docs/ci-quality-gates.md
docs/observability-audit.md
docs/observability-and-alerts.md
docs/monthly-website-health-report-template.md
docs/release-process.md
CHANGELOG.md
docs/david-non-technical-owner-checklist.md
docs/recruiter-labs-client-pipeline.md
docs/recruiter-labs-client-pipeline-roadmap.md
docs/recruiter-labs-client-pipeline-launch-gate.md
docs/recruiter-labs-candidate-transparency.md
docs/recruiter-labs-candidate-transparency-roadmap.md
docs/recruiter-labs-candidate-transparency-scorecard.md
docs/recruiter-labs-candidate-whatsapp-preferences.md
docs/recruiter-labs-candidate-process-transparency.md
docs/recruiter-labs-ai-governance.md
docs/recruiter-labs-ai-launch-gate.md
docs/recruiter-labs-ai-ops-roadmap.md
docs/recruiter-labs-ai-vendor-discovery.md
docs/recruiter-labs-ai-interview-notes.md
docs/recruiter-labs-ai-brief-diagnostic.md
docs/recruiter-labs-whatsapp-crm-sync.md
docs/recruiter-labs-davids-audio-notes.md
docs/recruiter-labs-retained-search-dashboard.md
docs/launch-handover.md
docs/123-reg-domain-switch.md
docs/railway-deployment.md
docs/RAILWAY-POSTGRES-BACKEND.md
docs/data-boundaries.md
docs/audit-logging.md
docs/data-retention-engine.md
docs/candidate-data-journey.md
docs/cv-storage-and-retention.md
docs/whatsapp-business-cloud-api.md
docs/MASTER-BUILD-COMPLETION-REPORT.md
```

## Rich Media And Video

The site supports:

- YouTube embeds
- Vimeo embeds
- Uploaded MP4/WebM video files through Sanity
- Image feature blocks
- Galleries
- Captions and alt text
- Poster images, click-to-load embeds and metadata-only preload for safer Core Web Vitals

Frontend component: `src/components/RichMedia.tsx`

Sanity block fields: `sanity/schemas/index.ts` under the rich text block configuration.

## CMS Editing

Friendly editor login:

```txt
/cms
```

Set `CMS_GATE_USERNAME`, `CMS_GATE_PASSWORD` and `CMS_GATE_SECRET` locally before using the editor gate. Do not commit those values.

Sanity Studio route after login:

```txt
/studio
```

Content groups:

- Main Site: Homepage, Pages, Navigation, Site Settings, Redirects
- Commercial: Services, Case Studies, Testimonials, FAQs, CTA Blocks, Proof Items
- Content: Insights, Salary Snapshots
- Recruitment: Jobs
- People: David Walsh / Team

Sanity is the public content engine only. Do not store private candidate/client
data, CVs, application records, DSAR requests, audit logs or internal
recruitment notes in Sanity. Use Railway/Postgres for private operations.

CMS audit and architecture notes:

```txt
docs/CMS-ARCHITECTURE.md
docs/frontend-architecture.md
docs/sanity-nextjs-fetching.md
docs/data-boundaries.md
```

Important: the front-end `/cms` gate is a branded site login. Sanity still needs a real Sanity project and invited editor account before live editing is production-ready.

## Adding A Job

1. Go to `/studio`.
2. Open Recruitment > Jobs.
3. Add title, slug, salary, location, hybrid status, employment type, sector, specialism and body content.
4. Set status to `live` only when the role is genuinely open.
5. Live jobs output JobPosting schema. Draft and closed jobs are noindexed.

## Publishing An Insight

1. Go to Content > Insights.
2. Add title, slug, excerpt, category, author, publish/update dates and reading time.
3. Use clear headings and direct-answer sections.
4. Add FAQs and related services.
5. Add video, image or gallery blocks where useful.
6. Set status to `published`.

## Adding A Case Study

1. Go to Commercial > Case Studies.
2. Add client type, sector, role hired and service used.
3. Fill client context, hiring challenge, why the brief was hard, approach, process, outcome and impact.
4. Only add named clients or quotes with permission.
5. Keep draft until outcomes are verified.

## Updating Salary Snapshots

1. Go to Content > Salary Snapshots.
2. Update quarter/date, market commentary and salary table rows.
3. Use real validated salary data before publishing.
4. Keep notes specific and useful.

## Deployment

Recommended deployment target: Railway.

1. Push the project to GitHub.
2. Create or link the `Essential Resourcing` project in Railway.
3. Add environment variables.
4. Connect Sanity project and dataset.
5. Test the Railway-generated URL.
6. Configure DNS for `essentialresourcing.co.uk` after Railway works.
7. Run a final production URL QA pass.

Keep public deployment off until manual content, legal review and credentials are complete.

Railway/Postgres notes for the private operations backend:

```txt
docs/launch-handover.md
docs/123-reg-domain-switch.md
docs/railway-deployment.md
docs/RAILWAY-POSTGRES-BACKEND.md
```

## Security And Quality

- Security headers are configured in `next.config.ts`.
- `X-Powered-By` is disabled.
- Contact API accepts both browser form posts and JSON, with the same validation.
- CV upload is intentionally disabled until secure storage is configured.
- Dependency audit currently reports zero vulnerabilities after the Next 16 / Sanity 5 upgrade and targeted safe overrides.

## Manual Items Before True Production

- Add final David Walsh portrait.
- Add real phone number, LinkedIn URL and Google booking URL.
- Add verified salary data.
- Replace draft case studies with verified outcomes.
- Add real testimonials only with permission.
- Review legal pages.
- Configure Resend or another form delivery provider.
- Configure Sanity project credentials.
- Invite editor users to the Sanity project.
- Set fresh CMS gate username, password and signing secret.
- Confirm analytics consent wording and tracking requirements.
- Confirm Google Search Console verification.
- Confirm CV handling/storage is legally and technically safe before enabling uploads.

## Production Status

The codebase builds cleanly and is production-structured, but it should not be considered final-live until the manual content, credential and legal items above are completed.
