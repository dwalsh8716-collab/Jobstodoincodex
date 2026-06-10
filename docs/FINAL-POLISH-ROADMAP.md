# Final Polish Roadmap

This is the final SEO, GEO, accessibility, performance and roadmap pass before a production launch decision.

The site is in strong shape technically. The remaining risk is not code polish. It is whether the final live claims, contact details, analytics setup and production credentials are real, checked and owned.

## Short Audit

### What Works Well

- The site has a clear Next.js App Router structure with server-rendered, crawlable pages.
- Important pages have unique metadata, canonical URLs, Open Graph data and clear calls to action.
- Navigation, breadcrumbs, sitemap, robots, RSS, `llms.txt` and `llms-full.txt` are in place.
- Organisation, David Walsh, website, breadcrumb, service, article, FAQ and live job schema are already handled.
- Draft jobs, draft case studies and unvalidated salary snapshots are not treated as live proof.
- Forms validate server-side, avoid storing CVs, protect against obvious spam and can send through Resend when configured.
- Analytics is consent-gated and only loads configured providers.
- The visual direction is premium, restrained and on-brand. Keep the current graphite, cobalt and copper palette.

### What Was Missing

- Public listing pages needed `ItemList` schema where it helps search systems understand visible services, jobs, insights, case studies and salary snapshots.
- The final future roadmap needed to live in the repo, not just in an issue.

### What Was Weak

- Search engines could understand individual service, article and job detail pages well, but list pages were less explicit.
- The launch status needed a plain-English split between "ready to preview" and "ready to publish".

### What Should Not Be Touched

- Do not rebuild the homepage, service structure, CMS model or form architecture without a specific reason.
- Do not change the colour palette just to follow a passing preference.
- Do not publish fake client logos, fake testimonials, fake salary data, fake ratings or unpermissioned proof.
- Do not turn draft proof into production proof until David has signed it off.

### Must Be Fixed Before Launch

- Confirm the live domain and `NEXT_PUBLIC_SITE_URL`.
- Add real Google Search Console verification.
- Add real GA4 or Tag Manager IDs and confirm consent behaviour matches the cookie policy.
- Configure Resend with verified sender and recipient addresses.
- Replace placeholder phone, LinkedIn and booking links where needed.
- Review all legal, privacy and cookie wording.
- Confirm any public case study, salary snapshot, testimonial, logo or named client has permission.
- Confirm the final portrait/image choices and alt text.
- Run `npm run verify` against the final production-like build.

### Can Wait Until Phase Two

- More salary snapshot markets once data is current.
- More case studies after permission and outcome checks.
- Deeper editorial programme for retained search, strategic interim and senior marketing hiring.
- Digital PR and authority building.
- Ongoing A/B testing once there is enough traffic to make it meaningful.

The detailed post-launch content, authority, digital PR and GEO plan is tracked in:

```txt
docs/POST-LAUNCH-GROWTH-ROADMAP.md
```

## Final SEO And GEO Status

The site is now structured around useful, crawlable answers rather than search padding.

- Service pages explain who each route is for, when it makes sense and where briefs usually go wrong.
- Insights answer real hiring questions in plain English.
- List pages now expose `ItemList` schema only for content visible on the page.
- Live job detail pages output `JobPosting`; closed and draft roles do not.
- FAQ schema only appears where the FAQs are visible.
- AI-readable files describe the business, services, live routes and publishing standards.

## Future Roadmap

### Immediate

- Connect Search Console, GA4 or Tag Manager, and the final consent settings.
- Configure Resend and test real enquiry delivery.
- Check the production URL, sitemap, robots, metadata, schema and analytics events after deployment.
- Confirm final phone, LinkedIn, booking, email and business details.
- Remove or keep noindexed any page that is useful internally but not ready for public launch.

### First 30 Days

- Publish one or two strong David Walsh insight pieces based on real hiring conversations.
- Add one permissioned case study if the outcome and client approval are clean.
- Review Search Console queries for unclear page intent, crawl errors and missing coverage.
- Check form submissions and CTA clicks to see where people are hesitating.
- Tighten internal links from high-interest insights into the most relevant service pages.

### Three Months

- Build a small content cluster around senior marketing hiring failure, retained search, strategic interim and agency leadership hires.
- Add validated salary snapshots only where the numbers are current and defensible.
- Start light digital PR around genuinely useful commentary, not generic recruitment noise.
- Review Core Web Vitals from field data, not just lab tests.
- Refresh stale insight dates only when the content has genuinely changed.

### Six Months

- Review which service pages are creating commercial conversations.
- Expand case studies if permissioned proof is available.
- Build comparison and answer-led pages only where there is a real client question behind them.
- Revisit IA, conversion paths and editorial priorities using actual traffic and enquiry data.
- Decide whether the CMS needs deeper workflow rules based on how David and the team are actually editing.

## Launch Rule

Do not call the site fully production-live until the manual launch blockers are done. The code can be production-ready while the business evidence, analytics ownership and legal checks still need a human yes.
