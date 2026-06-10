# CMS Architecture

## Current Setup

- Provider: Sanity CMS.
- Studio: embedded Next.js Studio at `/studio`, with a private `/cms` login gate before the editor route.
- Schema location: `sanity/schemas/index.ts`.
- Studio structure: `sanity/studioStructure.ts`.
- Frontend client: `src/lib/sanity.ts`.
- Central GROQ queries: `src/lib/sanity-queries.ts`.
- Safe CMS fetch helper: `src/lib/sanity-content.ts`.
- Fallback content: `src/content/fallback/`.

Sanity is the public content engine. It must not store private candidate/client
PII, CV files, private application records, DSAR requests, audit logs or
internal recruitment notes.

## Editor Structure

The Studio is organised around plain-English groups:

- Main Site: Homepage, Site Settings, Navigation, Pages, Redirects.
- Commercial: Services, Case Studies, Testimonials, FAQs, CTA Blocks, Logo / Proof Items.
- Content: Insights, Salary Snapshots.
- Recruitment: Jobs.
- People: David Walsh / Team.

Homepage and Site Settings are single-entry documents so David can edit the main website settings without creating duplicates.

## Content Coverage

The CMS can manage:

- Homepage hero copy and premium video.
- Service page copy, client problems, what good looks like, mistakes, process, FAQs, CTAs and related content.
- Jobs, application details, status and SEO.
- Insights with buyer questions, problem addressed, author, rich text, FAQs, CTA and related content.
- Case studies with business problem, why the hire mattered, what made it tricky, de-risking, outcome and impact.
- Salary snapshots with table rows, market commentary, hiring notes and CTA.
- Site settings, contact details, WhatsApp Business details, social links, footer content, navigation, redirects and proof/logos where permission is clear.

## Post-Launch Growth Support

The first growth phase does not need a big new CMS build. Insights, salary snapshots, case studies, FAQs, CTAs, proof items and SEO fields already support the first 12 weeks of content and authority work.

Future additions should wait until David is actually using them:

- External coverage document or field.
- Report/download content type.
- Source and citation fields for data-led content.
- David media bio / quote bank.
- Newsletter signup and archive.
- Open Graph image templates for reports and campaigns.

The post-launch content, digital PR and measurement roadmap is tracked in:

```txt
docs/POST-LAUNCH-GROWTH-ROADMAP.md
docs/data-boundaries.md
```

## Fallback Behaviour

The public site must not depend on Sanity being available. `sanityFetchWithFallback` returns the provided fallback if credentials are missing, the dataset is unavailable or a query returns nothing. The fallback content lives in `src/content/fallback/` and reuses the production-safe local content already used by the site.

## Preview

Preview mode is available through `/api/preview?secret=...&path=/target-path` and can be disabled through `/api/preview/disable?path=/target-path`. Set `SANITY_PREVIEW_SECRET` before enabling this in production.

## Access Handover

CMS access and Railway launch handover are documented here:

```txt
docs/sanity-cms-access.md
docs/launch-handover.md
```
