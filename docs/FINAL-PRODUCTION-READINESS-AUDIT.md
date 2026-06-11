# Final Production-Readiness Audit

## Status

The site is production-structured, tested and preview-ready.

It is not final-live until the manual content, credential, legal and launch setup items below are complete.

## Audit Summary

### Already Existed And Preserved

- Next.js App Router structure with server-rendered public pages.
- Central design tokens and the graphite, cobalt and copper palette direction.
- Public routes for homepage, services, clients, candidates, insights, jobs, case studies, salary snapshots and legal pages.
- Sanity Studio route, CMS gate and structured schema foundation.
- SEO routes for sitemap, robots, RSS, `llms.txt` and `llms-full.txt`.

### Missing And Added

- Secure form validation, honeypot, minimum timing and rate-limit handling.
- Server-only contact action and Resend-ready delivery path.
- Consent-gated analytics shell and safe event utility.
- Public bundle budget check.
- Unit and Playwright e2e coverage.
- QA checklist and final audit documentation.

### Weak And Improved

- Performance hints were tightened around images, video loading, font display and non-LCP priority.
- Accessibility contrast was improved while keeping the existing palette family.
- CMS architecture was expanded into editor-friendly groups, preview support and typed query/fallback structure.
- Technical SEO and GEO coverage was strengthened with structured data and AI-readable routes.
- Forms now return safe typed messages instead of raw provider details.

### Deliberately Left Unchanged

- The current graphite, cobalt and copper palette remains the production direction.
- CV upload remains disabled until private storage, malware scanning and legal handling are properly in place.
- Draft jobs, salary snapshots and proof remain visibly draft-safe rather than pretending to be verified production content.
- The CMS uses Sanity because it is already integrated and suits structured recruitment content.

## Build Summary

### Architecture

- Next.js 16, React 19, TypeScript and Tailwind CSS.
- Server Components by default, with client code limited to navigation, forms, video loading, analytics consent and Studio.
- Sanity 5 schema and Studio setup for structured editing.

### Components

- Header, footer, CTA, cards, breadcrumbs, schema scripts, rich media, video poster/loader, contact forms and analytics consent.
- CMS image helpers and responsive image sizing helpers.
- QA and performance budget scripts.

### Pages

- Homepage, about, clients, candidates, services, service detail pages, specialisms, jobs, job detail page, insights, insight detail pages, case studies, salary snapshots, contact, CMS login, Studio and legal pages.

### SEO

- Metadata helpers, canonical URLs, Open Graph defaults and Twitter metadata.
- Organisation, Person, WebSite, Breadcrumb, Service, FAQ, Article and JobPosting JSON-LD.
- Sitemap, robots, RSS and AI-search map routes.

### Accessibility

- Semantic headings and landmarks.
- Skip link, visible focus states, labelled form controls and accessible buttons.
- Contrast fixes for dark and light surfaces.
- Playwright checks for H1, navigation, mobile menu, forms and 404.

### Security

- Security headers and CSP.
- Server-only form delivery logic.
- Zod validation on public form input.
- Honeypot, minimum completion time and rate limiting.
- CV uploads deferred honestly.

### Performance

- Click-to-load video embeds and poster fallback.
- `next/image` sizing and safe helpers.
- Font display tuned for faster rendering.
- Public client JS budget check.

### Tests

- Vitest coverage for analytics utilities, SEO helpers, validation and contact action response shaping.
- Playwright coverage for homepage, navigation, mobile menu, contact form, services, jobs, insights and 404.
- `npm run verify` is the release gate.

## Commands Run

- `npm run lint`
- `npm run build`
- `npm run typecheck`
- `npm test`
- `npm run performance:budget`
- `npm run test:e2e`
- `npm run verify`

## Manual Launch Blockers

- Add final David Walsh portrait.
- Add real phone number.
- Add real LinkedIn URL.
- Confirm WhatsApp Business number and message wording.
- Add real Google Calendar booking URL if booking should happen outside the contact form.
- Add verified salary data.
- Replace draft case studies with verified outcomes.
- Add real testimonials and logos only with permission.
- Review privacy policy, cookie policy and terms with a qualified adviser.
- Configure Resend or another form delivery provider.
- Configure Sanity project credentials and invite editors.
- Configure fresh CMS gate username, password and signing secret.
- Confirm analytics requirements and consent wording.
- Confirm Google Search Console verification.
- Confirm any CV handling/storage is legally and technically safe before enabling uploads.
- Run final QA on the live production domain.

## Required Environment Variables

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_PHONE`
- `NEXT_PUBLIC_LINKEDIN_URL`
- `NEXT_PUBLIC_BOOKING_URL`
- `NEXT_PUBLIC_GOOGLE_BOOKING_URL`
- `GOOGLE_SITE_VERIFICATION`
- `NEXT_PUBLIC_GA_ID` or `NEXT_PUBLIC_GTM_ID` when tracking is approved
- `NEXT_PUBLIC_LINKEDIN_PARTNER_ID` when LinkedIn Insight is approved
- `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_CLARITY_ID` or `NEXT_PUBLIC_HOTJAR_ID` only if those tools are approved
- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_VERSION`
- `SANITY_READ_TOKEN` or `SANITY_API_READ_TOKEN` if required
- `CMS_GATE_USERNAME`
- `CMS_GATE_PASSWORD`
- `CMS_GATE_SECRET`
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`

## Production Status

Production-structured and preview-ready: yes.

Final-live: no, not until the manual launch blockers are completed.
