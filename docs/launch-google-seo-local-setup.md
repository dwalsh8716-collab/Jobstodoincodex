# Launch Google SEO And Local Setup

This is the launch setup guide for Google Search Console, GA4, Google Business
Profile, Bing Webmaster Tools, local SEO, GEO / AI search and search
compliance.

The site can prepare the ground. David still needs to own the Google account, DNS, Business Profile and verification steps.

No passwords. No recovery codes. No Google account credentials in the repo.

## Plain-English Summary For David

Technical SEO makes the site crawlable.

Google Search Console proves you own the site, lets you submit the sitemap and shows how people find you in Google.

GA4 measures users, events and enquiries.

Google Tag Manager is optional. It is useful if you want one container to manage tags, but direct GA4 is simpler.

Google Business Profile supports local visibility on Google Search and Maps. It needs accurate business details, real service areas, genuine reviews, real photos and no fake address.

Some of this cannot be automated safely. David needs to approve anything that
changes public business details, DNS, legal wording or Google ownership.

There is no modern "turn keywords on" switch. Google does not use the old
`meta keywords` tag for ranking. Keyword work now means clear titles, helpful
page copy, internal links, structured data, Search Console query data,
local/entity consistency and genuinely useful content.

## Audit Summary

### Already Implemented

- `GOOGLE_SITE_VERIFICATION` env var is supported in `app/layout.tsx`.
- `NEXT_PUBLIC_GA_ID` is supported.
- `NEXT_PUBLIC_GTM_ID` is supported.
- Railway production has `GOOGLE_SITE_VERIFICATION` set.
- Railway production has direct GA4 set with Measurement ID `G-PS0X1DFQ4D`.
- Railway production does not have `NEXT_PUBLIC_GTM_ID` set, deliberately avoiding duplicate GA4/GTM tracking.
- Railway production has booking, WhatsApp, LinkedIn, Sanity and email delivery env vars set.
- LinkedIn, Meta, Clarity and Hotjar env-controlled tracking is supported.
- Tracking scripts are consent-gated and do not load when env vars are absent.
- Google Consent Mode V2 default and update flow is implemented for Google tags.
- Users can accept, reject, manage and reopen cookie preferences.
- GTM suppresses the direct GA4 script so the site does not double-load GA4 by default.
- `sitemap.xml` is dynamic and includes launch pages, service pages, published
  insights, published proof, published salary snapshots, public salary guide
  pages when approved and live jobs only.
- The sitemap engine excludes Sanity content marked `noIndex`, private route
  prefixes, closed jobs, expired jobs and jobs that fail live candidate-facing
  checks.
- `robots.txt` points to the sitemap and blocks `/studio`, `/cms`, `/admin`,
  `/labs`, `/client` and `/api`.
- Organisation / ProfessionalService schema, David Walsh Person schema, WebSite schema, breadcrumbs, service schema, article schema, FAQ schema, live JobPosting schema and visible ItemList schema are in place.
- Privacy and cookie pages explain that analytics is environment-controlled and consent-gated.
- Contact page and footer include business identity, email and service-area signals without faking an address.
- Draft jobs, draft proof and unvalidated salary snapshots are excluded from live indexing routes.
- Search Console meta verification is present in the deployed HTML.
- Canonical URLs, robots, sitemap and AI index routes use `https://essentialresourcing.co.uk`.
- `/llms.txt` and `/llms-full.txt` are live for AI-readable site/entity mapping.

### Added In This Pass

- Form error tracking event.
- LinkedIn click tracking event.
- Salary snapshot view tracking for future published snapshots.
- GA4 property and web stream for `https://essentialresourcing.co.uk`.
- Direct GA4 Railway env var using `G-PS0X1DFQ4D`.
- Consent-aware deployment verified on the Railway production URL.
- Analytics route exclusions tightened so private/sensitive areas do not load the public analytics banner or tag scripts.
- Unit tests for sitemap, robots and analytics privacy behaviour.
- This Google/local launch setup guide.
- Consent Mode V2 setup is documented in `docs/consent-mode-v2-setup.md`.

### Missing Or Manual

- Final-domain DNS switch to Railway.
- Google Search Console final-domain verification.
- Sitemap submission inside Search Console after verification.
- Search Console / GA4 linking after Search Console is verified.
- Bing Webmaster Tools setup/import after Search Console is verified.
- Google Business Profile ownership, verification and public business-detail approval.
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

Current status:

- The site already emits the Search Console meta verification tag from
  `GOOGLE_SITE_VERIFICATION`.
- The final production domain is still not switched to Railway, so Google cannot
  reliably verify the URL-prefix property by crawling the current site yet.
- Domain-property verification can be done before launch only if David adds the
  Google DNS TXT record at the DNS provider. This does not need to switch the
  website to Railway, but it does require DNS access and care.
- Search Console API access needs a separate OAuth scope from the Analytics
  setup. The current Google CLI login can read GA4 but cannot yet manage Search
  Console.

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
NEXT_PUBLIC_GA_ID=G-PS0X1DFQ4D
```

Current setup:

1. GA4 account: `Essential Resourcing`.
2. GA4 property: `Essential Resourcing Website`.
3. Web stream URL: `https://essentialresourcing.co.uk`.
4. Measurement ID: `G-PS0X1DFQ4D`.
5. Railway production env var is set.
6. Railway deployment has succeeded.
7. Direct GA4 is used; GTM is not currently enabled.
8. GA4 only loads after analytics consent on public pages.

Manual checks after DNS switch:

1. Visit the production domain.
2. Accept analytics cookies.
3. Check GA4 Realtime.
4. Mark useful events as conversions where appropriate.
5. Link Search Console once Search Console is verified.

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

Use GTM only if David wants tags managed in one place. It is not needed for the
current launch because direct GA4 is simpler and already configured.

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

Do not change Google Business Profile details until David confirms:

- whether a real address should be public or hidden;
- the correct primary phone number;
- opening hours or appointment-only status;
- the primary category;
- approved photos and logo;
- whether there is already an existing claimed profile.

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

Recommended route:

- Verify Google Search Console first.
- Then import that verified property into Bing Webmaster Tools. Bing supports
  importing verified sites from Google Search Console, which avoids a second
  ownership-verification route.

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
5. Confirm direct GA4 remains set as `NEXT_PUBLIC_GA_ID=G-PS0X1DFQ4D`.
6. Confirm `NEXT_PUBLIC_GTM_ID` remains absent unless GTM is intentionally adopted.
7. Confirm consent banner blocks tracking until accepted.
8. Confirm GA4 Realtime events.
9. Link Search Console and GA4.
10. Create or claim Google Business Profile.
11. Add accurate services, areas, photos and description.
12. Set up Bing Webmaster Tools.
13. Run Rich Results and schema checks.
14. Run PageSpeed checks on production URLs.
15. Review privacy and cookie pages legally.
16. Start the week-one monitoring routine.

## Current Hard Blockers

These are not developer tasks:

1. DNS must be switched or a Search Console DNS TXT record must be added before
   final-domain Search Console verification can truly complete.
2. David must approve or supply the Google Business Profile facts. No fake
   address, fake hours, fake reviews or guessed phone number.
3. Search Console API access needs a fresh Google OAuth scope if Codex is going
   to submit the sitemap through the API.
4. Legal/privacy wording still needs review. This is not legal advice.

## Source Notes

- Google Search Central states that the `meta keywords` tag is not used by
  Google Search.
- Google Search Central recommends helping search engines understand content,
  using crawlable pages, useful titles and structured data rather than keyword
  stuffing.
- Google recommends JSON-LD for structured data where possible.
- Google Business Profile local visibility depends on complete, accurate
  business information and honest service-area/address handling.
- Bing Webmaster Tools can import verified sites from Google Search Console.

## Final Principle

World-class, but safe.

No secrets in GitHub.

No duplicate tags.

No fake local SEO.

No fake reviews.

No faff.
