# Launch Google SEO And Local Setup

This is the manual launch setup guide for Google Search Console, GA4, Google Tag Manager, Google Business Profile, local SEO and search compliance.

The site can prepare the ground. David still needs to own the Google account, DNS, Business Profile and verification steps.

No passwords. No recovery codes. No Google account credentials in the repo.

## Plain-English Summary For David

Technical SEO makes the site crawlable.

Google Search Console proves you own the site, lets you submit the sitemap and shows how people find you in Google.

GA4 measures users, events and enquiries.

Google Tag Manager is optional. It is useful if you want one container to manage tags, but direct GA4 is simpler.

Google Business Profile supports local visibility on Google Search and Maps. It needs accurate business details, real service areas, genuine reviews, real photos and no fake address.

Some of this cannot be automated safely. You need to log in, verify ownership and approve anything connected to Google accounts or DNS.

## Audit Summary

### Already Implemented

- `GOOGLE_SITE_VERIFICATION` env var is supported in `app/layout.tsx`.
- `NEXT_PUBLIC_GA_ID` is supported.
- `NEXT_PUBLIC_GTM_ID` is supported.
- LinkedIn, Meta, Clarity and Hotjar env-controlled tracking is supported.
- Tracking scripts are consent-gated and do not load when env vars are absent.
- Google Consent Mode V2 default and update flow is implemented for Google tags.
- Users can accept, reject, manage and reopen cookie preferences.
- GTM suppresses the direct GA4 script so the site does not double-load GA4 by default.
- `sitemap.xml` is dynamic and includes launch pages, service pages, published insights, published proof, published salary snapshots and live jobs.
- `robots.txt` points to the sitemap and blocks `/studio`, `/cms`, `/admin`,
  `/labs` and `/api`.
- Organisation / ProfessionalService schema, David Walsh Person schema, WebSite schema, breadcrumbs, service schema, article schema, FAQ schema, live JobPosting schema and visible ItemList schema are in place.
- Privacy and cookie pages explain that analytics is environment-controlled and consent-gated.
- Contact page and footer include business identity, email and service-area signals without faking an address.
- Draft jobs, draft proof and unvalidated salary snapshots are excluded from live indexing routes.

### Added In This Pass

- Form error tracking event.
- LinkedIn click tracking event.
- Salary snapshot view tracking for future published snapshots.
- Unit tests for sitemap and robots launch behaviour.
- This Google/local launch setup guide.
- Consent Mode V2 setup is documented in `docs/consent-mode-v2-setup.md`.

### Missing Or Manual

- Google Search Console property.
- DNS TXT verification or URL-prefix verification.
- Sitemap submission inside Search Console.
- GA4 property and Measurement ID.
- Optional GTM container.
- Search Console / GA4 linking.
- Google Business Profile ownership and verification.
- Bing Webmaster Tools setup.
- PageSpeed Insights checks on the production URL.
- Legal review of privacy/cookie wording.
- Final CMP approval if marketing or advertising tags are enabled.

## Google Search Console

Recommended setup:

1. Log in to Google Search Console.
2. Add a Domain property for `essentialresourcing.co.uk` if DNS access is available.
3. Add the DNS TXT record through the domain or DNS provider.
4. Wait for Google to verify it.
5. Submit `https://essentialresourcing.co.uk/sitemap.xml`.
6. Check `https://essentialresourcing.co.uk/robots.txt`.
7. Inspect these URLs after launch:
   - `https://essentialresourcing.co.uk/`
   - `https://essentialresourcing.co.uk/services/strategic-interim`
   - `https://essentialresourcing.co.uk/services/leadership-search`
   - `https://essentialresourcing.co.uk/jobs`
   - `https://essentialresourcing.co.uk/insights`
   - `https://essentialresourcing.co.uk/contact`
8. Request indexing for the homepage and core service pages after launch.
9. Watch coverage, page experience and enhancement reports once Google has crawled the site.

URL-prefix fallback:

- Add `https://essentialresourcing.co.uk` as a URL-prefix property if needed.
- Use the HTML meta tag method by adding the verification token to `GOOGLE_SITE_VERIFICATION`.
- Redeploy.
- Verify in Search Console.

Uploaded HTML file option:

- Only use this if Google provides the exact file name and contents.
- Do not commit a random placeholder verification file.
- DNS or meta tag verification is cleaner for this project.

## Sitemap And Robots

Current status:

- `/sitemap.xml` exists.
- `/robots.txt` exists.
- Robots references the sitemap.
- Sitemap uses canonical URLs from `NEXT_PUBLIC_SITE_URL` / site config.
- Draft and private routes are excluded from public sitemap logic.
- Unit tests now check launch pages, draft job exclusion and private route disallow rules.

Manual checks after deployment:

1. Open `/sitemap.xml` on the production domain.
2. Open `/robots.txt` on the production domain.
3. Confirm the sitemap uses `https://essentialresourcing.co.uk`.
4. Confirm Search Console can fetch the sitemap.

## Cookie Consent And Google Consent Mode V2

Consent Mode is critical for launch. It is not a cookie banner by itself. It communicates the user's consent choice to Google tags.

Current technical status:

- A lightweight custom consent banner exists.
- The banner supports Accept all, Reject non-essential, Manage preferences and Save preferences.
- Users can reopen Cookie preferences from the footer.
- Cookie Policy and Privacy Policy links are included in the banner.
- Consent preferences are stored locally.
- Google Consent Mode V2 defaults are initialised before Google tags load.
- Privacy-first defaults deny analytics and advertising storage until consent is given.
- Consent updates are sent when the user accepts, rejects or saves preferences.
- Known first-party analytics and marketing cookies are cleared when the matching category is rejected.
- GTM and direct GA4 are not loaded together in a way that should double-count pageviews.

Default consent state:

```txt
ad_storage: denied
analytics_storage: denied
functionality_storage: denied
personalization_storage: denied
security_storage: granted
ad_user_data: denied
ad_personalization: denied
```

Recommendation:

- Use direct GA4 for the simplest first launch if only GA4 is needed.
- Use GTM when David approves multiple tags or a CMP/GTM template.
- Use a reputable CMP before enabling marketing or advertising tags.
- Shortlist Cookiebot, CookieYes and Civic Cookie Control first; review OneTrust, Osano and Complianz if requirements grow.
- Treat FitConsent as one possible vendor, not a requirement.

Manual actions:

1. Approve the final tracking stack.
2. Decide whether to keep the interim custom banner or buy a CMP.
3. Get Cookie Policy and Privacy Policy wording reviewed.
4. Use Tag Assistant and GTM Preview after deployment.
5. Confirm no non-essential cookies are set before consent where consent is required.

Full setup and QA checklist:

```txt
docs/consent-mode-v2-setup.md
```

## GA4

Environment variable:

```txt
NEXT_PUBLIC_GA_ID=
```

Manual setup:

1. Create a GA4 property.
2. Create a web data stream for `https://essentialresourcing.co.uk`.
3. Copy the Measurement ID.
4. Add it to the hosting environment as `NEXT_PUBLIC_GA_ID`.
5. Deploy.
6. Accept analytics consent on the site.
7. Check GA4 Realtime.
8. Mark useful events as conversions where appropriate.

Supported events:

- CTA clicks.
- Booking clicks.
- Email clicks.
- Phone clicks.
- LinkedIn clicks.
- Contact form submissions.
- Contact form errors.
- Job application starts.
- Job application submissions.
- Salary snapshot views.
- Reserved future events for insight and salary downloads.

Do not send names, email addresses, phone numbers, CVs or message content as analytics payloads.

## Google Tag Manager

Environment variable:

```txt
NEXT_PUBLIC_GTM_ID=
```

Use GTM if David wants tags managed in one place.

Manual setup:

1. Create a GTM web container.
2. Add the GTM ID to `NEXT_PUBLIC_GTM_ID`.
3. Configure GA4 inside GTM if using GTM for GA4.
4. Use GTM Preview mode.
5. Accept analytics consent on the website.
6. Confirm tags fire only after consent.
7. Publish the container.
8. Check GA4 Realtime.

Avoid duplicate tracking:

- If `NEXT_PUBLIC_GTM_ID` is set, the site does not load the direct GA4 script.
- Do not also add a separate hardcoded GA4 script in the page head.
- Keep all IDs in environment variables.

## Search Console And GA4 Linking

Manual setup:

1. Confirm Search Console and GA4 use the right Google permissions.
2. In GA4 Admin, open Search Console linking.
3. Choose the verified Search Console property.
4. Choose the web stream.
5. Submit the link.
6. Wait for data to populate.

Search Console and GA4 numbers will not match exactly. They measure different things.

## Google Business Profile

Do not fake an address.

Do not use a PO box or virtual mailbox if it breaks Google rules.

If Essential Resourcing is a service-area or remote founder-led business, configure it honestly.

Checklist:

1. Create or claim the Google Business Profile.
2. Business name: `Essential Resourcing`.
3. Use the real-world business name only.
4. Choose the primary category carefully. Research:
   - Recruiter.
   - Employment agency.
   - Executive search firm.
5. Do not use Marketing agency unless the business genuinely provides marketing services.
6. Add accurate phone, website and Google Calendar booking URL.
7. Add service areas:
   - Manchester.
   - North West.
   - United Kingdom.
8. Add services:
   - Leadership Search.
   - Strategic Interim.
   - Senior Marketing Recruitment.
   - Agency Recruitment.
   - Client-side Marketing Recruitment.
   - PR & Communications Recruitment.
   - Digital Recruitment.
9. Add real photos when available:
   - David portrait.
   - Logo.
   - Genuine office or Manchester-relevant imagery.
   - Branded graphics.
10. Ask genuine clients for reviews where appropriate and compliant.
11. Respond to reviews professionally.
12. Keep business name, phone, website and service language consistent.

Business description draft:

```txt
Essential Resourcing is a founder-led recruitment and search business helping agencies, brands and growth businesses hire marketing, PR, communications, digital and agency leadership people who move the business forward. Led by David Walsh, the business works across Manchester, the North West and the wider UK, with a focus on senior hiring, retained search, strategic interim and hard-to-fill specialist roles. No CV flinging. No recruitment nonsense. Just honest market advice and hiring done properly.
```

Shorter version:

```txt
Founder-led recruitment and search for senior marketing, PR, communications, digital and agency leadership hires across Manchester, the North West and the wider UK. Led by David Walsh. No CV flinging. No recruitment nonsense.
```

## Local SEO Onsite Status

The site already has:

- Consistent business name.
- Consistent email.
- Environment-driven phone and LinkedIn fields.
- Manchester, North West and UK-wide service-area language.
- Contact page.
- Footer entity details.
- About David page.
- About Essential page.
- Organisation / ProfessionalService schema.
- David Walsh Person schema.
- SameAs support when LinkedIn URL is configured.

Future local pages can be useful, but only if they are genuinely specific:

- Manchester Marketing Recruitment.
- North West Marketing Recruitment.
- Manchester Agency Recruitment.
- UK Senior Marketing Recruitment.

Do not create thin location doorway pages. No swapped city names. No keyword stuffing.

## Bing Webmaster Tools

Manual setup:

1. Log in to Bing Webmaster Tools.
2. Import from Google Search Console if available.
3. Submit `https://essentialresourcing.co.uk/sitemap.xml`.
4. Check crawl and indexing reports.
5. Review any SEO reports.

Other local consistency options:

- LinkedIn company page.
- Apple Business Connect if local presence is relevant.
- High-quality local or business directories only where genuinely useful.
- Avoid spammy directory submissions.

## Schema Validation

Manual validation checklist:

1. Test homepage Organisation / ProfessionalService schema.
2. Test About David Person schema.
3. Test service page Service schema.
4. Test live job JobPosting schema when a role is genuinely live.
5. Test insight Article schema.
6. Test FAQ schema only where FAQs are visible.
7. Test BreadcrumbList schema.
8. Test ItemList schema on visible list pages.
9. Use Google Rich Results Test where relevant.
10. Use Schema Markup Validator for broader JSON-LD checks.

Do not add fake reviews, ratings, salary data, client logos or schema properties just to silence warnings.

## PageSpeed And Core Web Vitals

Manual checks on the production URL:

1. Homepage.
2. Strategic Interim page.
3. Leadership Search page.
4. Jobs page.
5. A published insight article.
6. Contact page.

Record:

- Mobile score.
- Desktop score.
- LCP.
- INP.
- CLS.
- Obvious fixes.
- Re-test date.

Lab results are useful, but Search Console field data matters once traffic exists.

## Cookie Consent And Privacy

Current status:

- Tracking scripts are environment-controlled.
- Public tracking waits for analytics consent.
- Privacy Policy page exists.
- Cookie Policy page exists.
- Analytics payloads avoid personal data.

Manual action:

- Get legal/privacy wording reviewed before final launch.
- Confirm the live tracking stack before publishing the cookie wording.
- Update the policy if GA4, GTM, LinkedIn Insight, Meta, Clarity or Hotjar are enabled.

## LinkedIn And Social Search

Checklist:

1. Align Essential Resourcing LinkedIn company page with website copy.
2. Align David Walsh's personal profile with the site positioning.
3. Add the website link.
4. Add Strategic Interim and Leadership Search links where useful.
5. Use consistent service language.
6. Test Open Graph previews for:
   - Homepage.
   - Strategic Interim page.
   - Leadership Search page.
   - A published insight.

Suggested LinkedIn company tagline:

```txt
Senior marketing and comms hiring, done properly.
```

Suggested short description:

```txt
Essential Resourcing helps agencies, brands and growth businesses hire marketing, PR, communications, digital and agency leadership people who move the business forward. Founder-led, straight-talking and built around the problem behind the hire. No CV flinging. No recruitment nonsense.
```

## Post-Launch Monitoring Routine

### Week 1

- Confirm Search Console verified.
- Confirm sitemap submitted.
- Inspect homepage and core pages.
- Confirm GA4 or GTM tracking.
- Confirm form and CTA events.
- Check indexing errors.
- Check robots.txt and sitemap processing.
- Check PageSpeed.
- Check schema.

### First Month

- Review Search Console weekly.
- Look for impressions and query data.
- Fix missing or weak titles/descriptions.
- Add FAQs from real queries.
- Improve pages with high impressions and low clicks.
- Improve internal links.
- Publish the first cornerstone insights.

### Monthly

- Review Search Console.
- Review GA4.
- Review Google Business Profile insights if available.
- Review enquiries.
- Review ranking and impression trends.
- Update content plan.
- Refresh salary and market content.
- Add proof or case studies only when verified.
- Check broken links.
- Check schema after major content changes.

## Gemini CLI / Google Account Safety

It may be tempting to give an AI tool full access to a Google account. Do not do that casually.

Safer approach:

- Let Codex or Gemini prepare code, checklists and documentation.
- Log in to Google products yourself.
- Use official Google verification flows.
- Use the minimum permissions needed.
- Never paste passwords, recovery codes or private credentials into prompts.
- Never commit API keys or OAuth tokens to GitHub.
- Store IDs in environment variables.
- Use separate users and permissions where possible.
- Revoke access when a tool no longer needs it.

## Final Manual Checklist

1. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
2. Add `GOOGLE_SITE_VERIFICATION` if using Search Console meta verification.
3. Create and verify Search Console property.
4. Submit sitemap.
5. Create GA4 property and add `NEXT_PUBLIC_GA_ID`, or create GTM and add `NEXT_PUBLIC_GTM_ID`.
6. Confirm consent banner blocks tracking until accepted.
7. Confirm GA4 Realtime events.
8. Link Search Console and GA4.
9. Create or claim Google Business Profile.
10. Add accurate services, areas, photos and description.
11. Set up Bing Webmaster Tools.
12. Run Rich Results and schema checks.
13. Run PageSpeed checks on production URLs.
14. Review privacy and cookie pages legally.
15. Start the week-one monitoring routine.

## Final Principle

World-class, but safe.

No secrets in GitHub.

No duplicate tags.

No fake local SEO.

No fake reviews.

No faff.
