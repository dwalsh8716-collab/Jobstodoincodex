# Final Launch Readiness Audit

Audit date: 3 July 2026

Verdict: code launch-ready; public domain switch still gated by external account checks.

No critical code blocker remains in the audited build. The website is safe to deploy to production hosting and continue final stakeholder review. Do not point `essentialresourcing.co.uk` at this build until the must-fix external launch gates below are complete. That is not faff. That is the difference between a good build and a clean launch.

Evidence from the final engineering gate:

- `npm run verify` passed.
- 63 unit test files passed.
- 359 unit tests passed.
- 16 Playwright browser tests passed across desktop and mobile.
- Axe WCAG A/AA checks passed on key public routes.
- Public client JavaScript budget passed at about 43KB gzip against the tightened 120KB ceiling.
- `npm audit --audit-level=high` found 0 vulnerabilities.
- Local production QA crawler passed with 0 route failures, 0 link failures and 0 browser failures across 84 viewport runs.

## 1. Launch Readiness Verdict

### Code And Build

PASS.

The Next.js build, public routes, sitemap, robots, RSS, AI index files, metadata, structured data, forms, consent-aware analytics layer, WhatsApp links, booking route, CMS gate, embedded Sanity Studio, accessibility safeguards and performance budgets are in place.

### Public Domain Launch

GATED.

The build can be deployed and reviewed publicly on the Railway preview URL. The final domain switch should wait until the external launch checklist is complete.

### Recruiter Labs

PASS FOR PRIVATE ACCESS ONLY.

Recruiter Labs remains private under `/admin` routes, guarded by the CMS session gate and kept out of public sitemap/AI index routes. It is not approved as a public product surface.

## 2. Must-Fix Before Launch

These are launch blockers before the real domain is switched.

1. Email delivery
   - Verify Resend sender/domain.
   - Set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` in Railway.
   - Send a real contact form test and confirm it lands at `david@essentialresourcing.co.uk`.
   - Test candidate/data request routes if they are in launch scope.

2. Analytics and consent
   - Add either `NEXT_PUBLIC_GA_ID` or `NEXT_PUBLIC_GTM_ID`, not both unless GTM is intentionally managing GA4.
   - Test before consent: no analytics cookies where consent is required.
   - Test accept, reject and manage-preference flows.
   - Confirm GA4 Realtime receives consented events.
   - Keep Google Consent Mode V2 in place.

3. Search Console and metadata
   - Add `GOOGLE_SITE_VERIFICATION` or complete DNS verification.
   - Submit `https://essentialresourcing.co.uk/sitemap.xml`.
   - Check `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt` and `rss.xml` on the final domain.

4. Legal and privacy review
   - Review Privacy Policy.
   - Review Cookie Policy.
   - Review Candidate Privacy Notice.
   - Review Terms.
   - Confirm consent wording is appropriate for UK/EEA visitors.
   - Do not call this legal advice from the build team.

5. CMS and Sanity
   - Confirm the Sanity project and dataset are the intended production project.
   - Add the Railway production URL and final domains to Sanity CORS.
   - Test `/cms` and `/studio` with the production CMS gate.
   - Invite the correct editor users in Sanity.

6. Railway and DNS
   - Confirm Railway deploys from the intended branch.
   - Confirm all production environment variables are set.
   - Confirm `/api/health` returns healthy on the Railway URL.
   - Add final domains in Railway.
   - Switch DNS only when David approves.
   - Re-run production QA on `https://essentialresourcing.co.uk` after DNS.

7. Real-device conversion checks
   - Test WhatsApp on a real mobile device.
   - Test Google Calendar booking on desktop and mobile.
   - Test contact form on desktop and mobile.
   - Test social sharing preview with the final URL.

## 3. Should-Fix Soon

- Add Sentry or equivalent error monitoring once the final domain is live.
- Add uptime monitoring for `/`, `/contact`, `/api/health`, `/sitemap.xml` and `/robots.txt`.
- Run Lighthouse/PageSpeed on the Railway URL and final domain.
- Review field Core Web Vitals after the domain has real traffic.
- Replace draft case-study and salary proof only with approved, evidenced content.
- Add final David Walsh portrait if David wants stronger founder trust.
- Add approved testimonials/logos only where permission exists.
- Document the monthly launch-aftercare routine in the owner checklist.

## 4. Nice-To-Have Polish

- Add richer Open Graph image variants for service/category pages.
- Add a small public “latest insight” rhythm after launch rather than publishing thin filler.
- Create a lightweight status board for live launch checks.
- Add editor screenshots to the Sanity guide once David has used the CMS.
- Add a formal Lighthouse CI workflow once the deployment branch is stable.

## 5. Final Deployment Checklist

Run this sequence in order.

1. Confirm Railway build succeeds from the intended branch.
2. Confirm production environment variables are present and do not expose secrets.
3. Open the Railway URL.
4. Test `/api/health`.
5. Test `/cms` login and `/studio` access.
6. Test WhatsApp, booking, LinkedIn and contact form routes.
7. Run:

```bash
npm run verify
npm run qa:production -- --base=https://web-production-ba3b9.up.railway.app
```

8. Complete email, analytics, consent, Search Console, Sanity CORS and legal/privacy gates.
9. Add domains in Railway and update DNS only after David approves.
10. Run:

```bash
npm run qa:production -- --base=https://essentialresourcing.co.uk
```

11. Check Search Console can fetch the final sitemap.
12. Check GA4 Realtime with a consented visit.
13. Send one real form enquiry and confirm David receives it.
14. Capture a final launch note with the date, domain, branch and test evidence.

## 6. Post-Launch Monitoring Checklist

### First Hour

- Check homepage, services, jobs, contact, privacy, cookie policy, sitemap and robots.
- Check contact form delivery.
- Check WhatsApp and booking links.
- Check GA4 Realtime if analytics is enabled.
- Check Railway logs for errors.

### First Day

- Check Search Console indexing and sitemap status.
- Check server errors and contact form failures.
- Check mobile layout on a real phone.
- Check cookies before/after consent.
- Check no private `/admin`, `/cms`, `/studio` or client-token routes are in public indexes.

### First Week

- Review Core Web Vitals/PageSpeed.
- Review analytics events and conversion paths.
- Review common search queries.
- Fix any 404s or redirect misses.
- Confirm no spam or suspicious form activity.

### First Month

- Publish only useful, evidence-backed content.
- Review enquiries and conversion quality.
- Add approved proof where it exists.
- Run the production QA crawler again.
- Review privacy, retention and CMS access.

## Final Call

The build is in strong shape. The remaining launch risk is not the code. It is the account-side work that proves the site can receive enquiries, measure consented traffic, satisfy privacy expectations and survive the final domain switch cleanly.

No fake green ticks. Finish the external gates, then launch.
