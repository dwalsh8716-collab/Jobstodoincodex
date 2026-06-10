# Essential Resourcing Full Website Build

Premium Next.js + Sanity-ready website for Essential Resourcing.

## Stack

- Next.js 16 App Router with Turbopack production builds
- TypeScript
- React 19
- Clean CSS design system with central tokens
- Sanity 5 Studio schemas and `/studio` route
- Vercel-ready deployment
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
- `NEXT_PUBLIC_BOOKING_URL`

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

Temporary local preview login:

```txt
Username: david
Password: Essential-Preview-2026!
```

Change `CMS_GATE_USERNAME`, `CMS_GATE_PASSWORD` and `CMS_GATE_SECRET` before the site goes live.

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

CMS audit and architecture notes:

```txt
docs/CMS-ARCHITECTURE.md
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

Recommended deployment target: Vercel.

1. Push the project to GitHub.
2. Import the project in Vercel.
3. Add environment variables.
4. Connect Sanity project and dataset.
5. Configure DNS for `essentialresourcing.co.uk`.
6. Run a final production URL QA pass.

Codex Sites note: if the Sites plugin is available in the workspace, this project can be reviewed as a saved candidate before any production deployment. Keep public deployment off until manual content, legal review and credentials are complete.

## Security And Quality

- Security headers are configured in `next.config.ts`.
- `X-Powered-By` is disabled.
- Contact API accepts both browser form posts and JSON, with the same validation.
- CV upload is intentionally disabled until secure storage is configured.
- Dependency audit currently reports zero vulnerabilities after the Next 16 / Sanity 5 upgrade and targeted safe overrides.

## Manual Items Before True Production

- Add final David Walsh portrait.
- Add real phone number, LinkedIn URL and booking URL.
- Add verified salary data.
- Replace draft case studies with verified outcomes.
- Add real testimonials only with permission.
- Review legal pages.
- Configure Resend or another form delivery provider.
- Configure Sanity project credentials.
- Invite editor users to the Sanity project.
- Change the temporary CMS preview password.
- Confirm analytics consent wording and tracking requirements.
- Confirm Google Search Console verification.
- Confirm CV handling/storage is legally and technically safe before enabling uploads.

## Production Status

The codebase builds cleanly and is production-structured, but it should not be considered final-live until the manual content, credential and legal items above are completed.
