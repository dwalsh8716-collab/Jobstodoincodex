# Launch Sitemap And Route Audit

## Required Launch Pages

All required launch pages exist and are linked through the header, footer, service hub, homepage or sitemap:

- Home: `/`
- About Essential: `/about-essential`
- About David Walsh: `/about-david-walsh`
- For Clients: `/clients`
- For Candidates: `/candidates`
- Services: `/services`
- Leadership Search: `/services/leadership-search`
- Strategic Interim: `/services/strategic-interim`
- Agency Recruitment: `/services/agency-recruitment`
- Client-side Marketing Recruitment: `/services/client-side-marketing-recruitment`
- Marketing and communications specialisms: `/specialisms`
- Case Studies: `/case-studies`
- Insights: `/insights`
- Salary and Market Snapshots: `/salary-snapshots`
- Contact David: `/contact`
- Jobs and live roles: `/jobs`
- Privacy Policy: `/privacy-policy`
- Cookie Policy: `/cookie-policy`
- Terms of Website Use: `/terms`

## Navigation Decision

The top navigation is deliberately client-led:

- Clients
- Services
- Strategic Interim
- Jobs
- Insights
- About
- Talk to David

The candidate journey still exists, but it does not dominate the header. Candidates can reach it from the homepage, jobs page and footer.

## Sitemap Rules

`app/sitemap.ts` includes launch pages, service pages, published insights, published case studies, published salary snapshots and live jobs. Draft jobs, draft proof and draft salary data stay out of the sitemap.

`app/robots.ts` references the sitemap and blocks Studio, CMS login, admin, Labs, client magic-link and API routes from crawler discovery.

## Future Pages To Add Later

These are intentionally deferred until there is useful first-hand content, not thin doorway copy:

- PR and communications specialist page
- Digital, performance and eCommerce specialist page
- B2B, SaaS and professional services marketing page
- PE-backed growth hiring page
- Newsletter archive
- Quarterly market reports hub
- Manchester, London and UK-wide location pages
- Candidate community or talent network page
- Speaking, events and roundtables page

No swapped-city SEO pages. No fake proof. No filler.
