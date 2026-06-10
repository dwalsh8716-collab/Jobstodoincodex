# Brief Completion Matrix

## 1-8: Business, Positioning, Tone, Proposition

Status: Implemented.

- Positioning carried into homepage, services, clients, candidates and about pages.
- Required phrases included where appropriate.
- Candidate route exists but does not dominate the homepage.
- Strategic Interim has a dedicated journey and page.

## 9-12: Visual Identity, Palette, Typography, Imagery

Status: Implemented with user override.

- Original Manchester palette is not the default because David said he did not like it.
- New default palette is centralised in `src/styles/theme.css`.
- Original Manchester palette remains as an optional theme.
- Typography uses Space Grotesk and Inter.
- Logo assets are used for header, footer, icon, favicon and social preview.
- David portrait remains a manual asset slot.

## 13-17: Purpose, Journeys, Sitemap, Navigation, Homepage

Status: Implemented.

- Required launch sitemap routes created.
- Clean top navigation with services dropdown.
- Homepage follows the requested 10-section conversion flow.
- Proof slots are text-based and do not invent fake logos.
- Final CTA included.

## 18-23: Services, Candidates, Jobs, Insights, Salary, Case Studies

Status: Implemented as structured systems.

- Service template includes hero, audience, problems, when to use, process, mistakes, FAQs, proof, related insight and CTA.
- Candidate page includes honest candidate route and FAQs.
- Jobs system supports draft/live/closed and JobPosting schema for live roles.
- Insights hub and article pages include author/date/FAQ/schema/rich media.
- Salary snapshot hub uses semantic HTML tables.
- Case studies are draft-safe and do not invent named outcomes.

## 24-25: CMS And Technology Stack

Status: Implemented.

- Next.js 16 App Router.
- React 19.
- Sanity 5 Studio config and `/studio` route.
- Sanity schemas for requested content types.
- Vercel-ready environment setup.

## 26-28: Design System, Accessibility, Performance

Status: Implemented.

- Central tokens for colours, spacing, radius and typography.
- Buttons, cards, forms, tables and media blocks are reusable.
- Semantic HTML, skip link, labels, focus states, alt text and reduced motion support included.
- Minimal client JavaScript outside nav, forms, analytics and Studio.

## 29-30: SEO And GEO / AI Search

Status: Implemented.

- Unique metadata on pages.
- Dynamic sitemap and robots.
- RSS feed.
- `llms.txt` and `llms-full.txt` AI-readable maps.
- Breadcrumbs.
- Organisation, Person, WebSite, Breadcrumb, Service, Article, FAQ and JobPosting schema implemented where relevant.
- Clear direct-answer insight structure.
- Draft jobs, draft proof and draft salary records are noindexed and excluded from sitemap and AI maps.

## 31-32: Forms And Analytics

Status: Implemented with production credentials required.

- API route validates fields.
- Honeypot spam protection.
- Consent checkbox.
- Clear success/error states.
- Resend support via environment variables.
- GA4 and LinkedIn Insight Tag are environment-variable controlled.

## 33-34: Sanity Content Models And Flexible Blocks

Status: Implemented.

- Site Settings, Navigation, Page, Service, Job, Insight, Case Study, Salary Snapshot, Testimonial, FAQ, Person, CTA and Proof schemas.
- Rich text supports video, media feature and gallery blocks.

## 35-39: Initial Copy, Linking, Schema, Content Seeds

Status: Implemented.

- No lorem ipsum.
- Draft proof and salary slots are clearly marked.
- Content seeds included.
- Internal links between services, insights, jobs, case studies and contact.

## 40-41: Backend Ease Of Use And Deployment

Status: Implemented.

- Sanity Studio organised into owner-friendly groups.
- `.env.example` and README included.
- Deployment instructions included.

## 42-44: QA, Responsive, Security, Privacy

Status: Verified in Codex with manual launch items remaining.

- TypeScript, lint and production build pass.
- Form validation route implemented.
- Dependency audit reports zero vulnerabilities after safe upgrades and overrides.
- Security headers configured.
- Legal pages created but require final legal review.
- CV upload intentionally not enabled until secure storage is configured.

## 45-48: Development Approach, Avoid List, Deliverables, Build Standard

Status: Implemented as phase-one production structure.

- Full phase-one site structure created.
- Not a generic recruitment theme.
- No fake testimonials or fake logos.
- Strategic Interim is not buried.
- Site is scalable and editable.

## Remaining Manual Inputs

- Real David Walsh portrait.
- Real phone, booking and LinkedIn URLs.
- Real salary data.
- Real case-study outcomes and permissioned quotes.
- Final legal/privacy review.
- Sanity project credentials.
- Form delivery provider credentials.
- Final production URL QA and analytics consent review.
