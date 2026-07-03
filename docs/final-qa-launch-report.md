# Final QA Launch Report

Audit date: 3 July 2026

Status: production preview ready, launch gated.

## QA Executive Summary

Railway preview is live:

```txt
https://web-production-ba3b9.up.railway.app
```

The live Railway preview passed the new production QA gate on 3 July 2026:

- 45 route checks
- 36 internal link checks
- 28 public pages audited
- 84 browser viewport runs across desktop, tablet and mobile
- 0 route failures
- 0 internal link failures
- 0 browser failures

The crawler checks sitemap routes, required launch assets, canonical redirects,
404 behaviour, internal links, desktop/tablet/mobile rendering, console errors,
page errors, horizontal overflow, fetchable visible images, main landmarks, H1
counts and visible controls without accessible names.

Verdict: the website code and Railway preview are good enough for serious
stakeholder review and final account-side launch setup.

Not safe for full public launch until the remaining external launch gates are
completed: GA4 Measurement ID and consent testing, Resend email delivery, legal
and privacy review, Search Console verification, final domain/DNS cutover and a
final QA pass on the real domain.

No fake green ticks. No public Recruiter Labs leakage. No secrets in GitHub. No
faff.

## Critical Blockers

No critical code blocker was found on the live Railway preview.

Critical launch blockers still outside the codebase:

1. GA4 Measurement ID is not confirmed in the app yet.
2. GA4 Realtime has not been tested with real consented traffic.
3. Resend email delivery is not live-tested with David's inbox.
4. Privacy Policy, Cookie Policy, Candidate Privacy Notice and Terms still need
   legal/privacy review before public launch.
5. Search Console verification and sitemap submission are not complete.
6. The final domain has not been switched by design. David asked to leave
   `essentialresourcing.co.uk` and `www.essentialresourcing.co.uk` as the last
   step.
7. Final QA must be repeated after DNS and the production domain are live.

## High-Priority Issues

No high-priority code issue remains from the available automated QA coverage.

High-priority launch items that must still happen:

- Add either `NEXT_PUBLIC_GA_ID` or `NEXT_PUBLIC_GTM_ID`, not both in a messy
  double-pageview setup.
- Test cookie consent and Google Consent Mode V2 before and after accepting,
  rejecting and changing preferences.
- Add a valid `RESEND_API_KEY` only after the sending domain/sender is verified.
- Confirm `CONTACT_TO_EMAIL=david@essentialresourcing.co.uk` in Railway.
- Confirm `CONTACT_FROM_EMAIL` is a verified sender.
- Add the final Railway and custom domains to Sanity CORS.
- Run the same QA gate against the final production domain.

## Medium-Priority Improvements

- Add a production error monitor such as Sentry once the final domain is live.
- Add uptime monitoring for `/`, `/contact`, `/api/health`, `/sitemap.xml` and
  `/robots.txt`.
- Run Lighthouse/PageSpeed Insights on the final domain after DNS and analytics
  are live.
- Add final approved proof: named testimonials, case studies, salary data and
  client outcomes only when David has permission and evidence.
- Add an approved David portrait if he wants a stronger founder trust signal.

## Cosmetic Polish Issues

No cosmetic defect was found by the automated desktop/tablet/mobile browser
pass.

Cosmetic items that remain editorial rather than technical:

- Replace any intentionally draft case-study or salary proof with verified
  content before publishing.
- Keep Recruiter Labs private until a separate launch gate approves it.
- Review all final legal-policy wording in plain English once the legal review
  is complete.

## Accessibility Issues

No automated accessibility blocker was found in the live QA gate.

What passed in the current browser audit:

- public pages have a main landmark
- public pages have one H1
- desktop, tablet and mobile layouts do not horizontally overflow
- visible controls in audited public routes have accessible names
- no page errors or unexpected console errors were reported

Manual accessibility work still recommended before launch:

- keyboard-only pass on the final domain
- screen-reader spot check for forms, cookie preferences, mobile navigation and
  CMS gate
- confirm consent banner copy and preference controls remain understandable
  after any CMP or analytics change

## Mobile And Responsive Issues

No mobile layout blocker was found by the automated QA pass.

Evidence:

- mobile viewport: 390 x 844
- tablet viewport: 834 x 1112
- desktop viewport: 1440 x 1000
- all audited public pages passed without horizontal overflow

Manual checks still required:

- real iPhone/Android WhatsApp link test
- real mobile Google Calendar booking test
- real mobile contact-form submission after Resend is configured

## Performance Concerns

No performance code blocker is known from the current build.

Current technical posture:

- production build is configured for Railway
- public bundle budget exists
- images are served through supported public assets or approved remote sources
- private Recruiter Labs code is not part of normal public navigation

Remaining performance work:

- run Lighthouse/PageSpeed on the final domain after DNS
- watch Core Web Vitals after real traffic starts
- avoid adding heavy third-party widgets, chat bubbles or tracking scripts

## Specific Fixes Required

Implemented in this QA pass:

- added a repeatable production QA crawler: `npm run qa:production`
- added Railway/live-preview QA instructions to `docs/QA-CHECKLIST.md`
- ignored generated QA evidence files with `.qa/`, `qa-*.json` and
  `qa-screenshots/`
- updated the final QA launch report to reflect the real Railway preview
  rather than stale local-only status
- updated the final QA unit test so it guards the current launch decision

Commands for the final gate:

```bash
npm run verify
npm run qa:production -- --base=https://web-production-ba3b9.up.railway.app
npm run qa:production -- --base=https://essentialresourcing.co.uk
```

Run the final-domain command only after David deliberately switches DNS.

## Page And Route Coverage

The production QA crawler derives public routes from `sitemap.xml` and adds the
known launch pages. The live pass covered the core public site:

- homepage
- about pages
- client and candidate routes
- service index and service detail pages
- jobs
- insights and published insight articles
- case studies
- salary snapshots
- salary guides
- contact
- book-a-call
- privacy, cookie, terms and candidate privacy pages
- `robots.txt`
- `sitemap.xml`
- `rss.xml`
- `llms.txt`
- `llms-full.txt`
- `/api/health`
- canonical redirects
- 404 behaviour

## Forms And Conversion Routes

Conversion surfaces are technically ready to test, but email delivery is still
launch-gated.

WhatsApp:

- direct WhatsApp links are implemented as direct links, not a cheap widget
- WhatsApp should be tested on a real mobile device before launch

Booking:

- Google Calendar booking URL is configured for the preview
- `/book-a-call` should be tested again on the final domain

Contact form:

- validation and safe fallback behaviour exist
- live email delivery still depends on a valid Resend setup
- do not call the form launch-ready until David receives a real test enquiry
  at `david@essentialresourcing.co.uk`

## CMS And Recruiter Labs

CMS:

- `/cms` is the branded entry point
- `/studio` is gated before the Sanity Studio loads
- Sanity is the public CMS only
- private candidate/client records, CVs, DSAR requests, audit logs and internal
  recruitment notes must stay out of Sanity

Recruiter Labs:

- Recruiter Labs remains private
- public pages do not expose Labs routes through normal navigation
- do not switch Labs features live without a separate privacy, security and
  operations gate

## Final Launch Readiness Verdict

Code verdict: ready as a production preview candidate.

Launch verdict: not yet safe for full public launch.

David can approve public launch only after:

1. GA4 Measurement ID or GTM ID is added and consent-tested.
2. Resend email delivery sends a real test enquiry to
   `david@essentialresourcing.co.uk`.
3. Search Console verification and sitemap submission are complete.
4. Sanity CORS includes the Railway preview and final domains.
5. Legal/privacy review is complete.
6. DNS is switched intentionally, preserving email records.
7. The production QA crawler passes on `https://essentialresourcing.co.uk`.

Until those are done, the honest verdict is:

```txt
Production preview ready.
Full public launch gated.
```
