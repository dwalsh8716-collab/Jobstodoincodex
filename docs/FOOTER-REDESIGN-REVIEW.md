# Global footer implementation review

8 October 2026. Production-build preview at http://localhost:3030/. David approved publication after reviewing the footer and HTML sitemap. Deployment verification is recorded in the release conversation.

## A. FOOTER SUMMARY

Replaced the oversized footer contact panel with a concise brand block, curated navigation, six compact social/contact icons and a legal strip. Removed the repeated headline, sales sentence, booking prompt, large contact button and long social-link text. Existing page CTAs are untouched.

## B. FINAL ARCHITECTURE

- Brand: approved logo linked home; existing two short positioning sentences.
- Explore: Clients, Candidates, Jobs, Insight, Specialisms, Case Studies.
- Work with Essential: Permanent Recruitment, Retained Search, Fractional Leadership, Market Intelligence & Advisory.
- Connect: company LinkedIn, Facebook and Instagram; separate Direct to David row for LinkedIn, WhatsApp and email.
- Legal/utility: Sitemap, Privacy, Candidate Privacy, Data Request, Cookies, Terms and the existing conditional Cookie Preferences control; dynamic copyright and Manchester sign-off.
- The user explicitly approved adding a readable HTML sitemap. `/sitemap` groups the existing public content and uses the same eligibility function as the XML sitemap. Drafts, private routes and inactive jobs remain excluded. Its canonical metadata and XML discovery entry are included.

## C. SOCIAL LINKS

All six links use monochrome icons, destination-specific accessible names and matching native title tooltips. Company/direct labels distinguish the two LinkedIn links. External links use a new tab with `noopener noreferrer`; email uses `mailto:`.

| Accessible label | Destination | Result |
| --- | --- | --- |
| Essential Resourcing on LinkedIn | https://www.linkedin.com/company/essentialresourcing/ | PASS: official company verified in Chrome; owner login redirects to its admin view, but the stored URL is public. |
| Essential Resourcing on Facebook | https://www.facebook.com/essentialresourcing/ | PASS: official Page verified during the preceding setup. |
| Essential Resourcing on Instagram | https://www.instagram.com/esse.ntialresourcing/ | PASS: public business profile verified during the preceding setup. |
| Connect with David Walsh on LinkedIn | https://www.linkedin.com/in/davidwalshmarketingsearch/ | PASS: David's public profile verified in Chrome. |
| Message David on WhatsApp | https://wa.me/447824514296 | PASS: approved number and existing general prefilled message preserved. No message sent. |
| Email David | mailto:david@essentialresourcing.co.uk | PASS: approved address and mailto behaviour. No email sent. |

No admin, tracking or business-management profile URLs were added. WhatsApp and email checks validate the destinations, not message delivery.

## D. NAVIGATION LINKS

All below returned HTTP 200 in the production-build preview with no redirect required.

| Link | Route | Result |
| --- | --- | --- |
| Brand logo | `/` | PASS |
| Clients | `/clients` | PASS |
| Candidates | `/candidates` | PASS |
| Jobs | `/jobs` | PASS |
| Insight | `/insights` | PASS |
| Specialisms | `/specialisms` | PASS |
| Case Studies | `/case-studies` | PASS |
| Permanent Recruitment | `/services/permanent-recruitment` | PASS |
| Retained Search | `/services/retained-search` | PASS |
| Fractional Leadership | `/services/fractional` | PASS |
| Market Intelligence & Advisory | `/services/market-intelligence-advisory` | PASS |
| Sitemap | `/sitemap` | PASS |

## E. LEGAL LINKS

| Link | Route/control | Result |
| --- | --- | --- |
| Privacy | `/privacy-policy` | HTTP 200 / PASS |
| Candidate Privacy | `/candidate-privacy` | HTTP 200 / PASS |
| Data Request | `/candidate-privacy/request` | HTTP 200 / PASS |
| Cookies | `/cookie-policy` | HTTP 200 / PASS |
| Terms | `/terms` | HTTP 200 / PASS |
| Cookie Preferences | Existing consent event and component | PASS: production control opened the consent dialog. Existing conditional rendering retained. |

The local environment has no tracking configuration, so Cookie Preferences is absent from its screenshot. Production has tracking configured and continues to show the control. No consent behaviour or legal content changed.

## F. STRUCTURED DATA

Added the verified company Facebook and Instagram URLs to the existing Organization/ProfessionalService `sameAs` list, alongside company LinkedIn. David's Person `sameAs` remains his personal LinkedIn alone. Existing tests now verify the expanded company list and the unchanged distinction.

## G. DESIGN

Desktop: four unequal columns, with a wider brand area. Tablet at 768/1024px: balanced two-by-two grid. Mobile: brand, Explore, services, Connect, legal; Explore uses two columns when space permits and reflows with enlarged text. Social links have 44px square targets without cards or platform-coloured backgrounds. Fine rules separate direct contact and the legal row. Existing palette variables and typefaces are retained; CSS is scoped to the footer and sitemap modules.

## H. SIZE / DENSITY

Measured at 1440px: live before about 1,161px high; new preview 485px. Measured at 390px: live before about 2,333px; new preview about 1,125px. Heights compare the current live footer with the production-build preview. The reduction comes from removing duplication and grouping links. Footer links retain at least 44px target height; body links are 15px and utility text 13px.

## I. RESPONSIVE QA

320, 375, 390, 430, 768, 1024, 1280 and 1440px: PASS. No horizontal page overflow at these default-text widths; no footer link/icon bounds outside the viewport; all link target heights at least 44px. Screenshots captured at every width. Footer also passes a separate 320px / 200% text-size check after the mobile grid adjustment. This is a footer reflow result, not a claim of whole-site enlarged-text certification.

## J. ACCESSIBILITY

Semantic footer, named navigation groups, list semantics, accessible icon names and logical DOM order verified. Keyboard Tab moved from company LinkedIn to Facebook with a visible focus outline. Axe found no footer violations, including contrast checks. Manual screenshot review confirmed readable groups. No screen-reader product or Safari testing was performed.

## K. CROSS-SITE QA

The footer passed at 390px and 1440px on all 15 routes below: 30 checks, all HTTP 200, exactly one Explore navigation and no default-size horizontal overflow.

- Homepage `/`
- Clients `/clients`
- Candidates `/candidates`
- Services `/services`
- Service detail `/services/retained-search`
- Specialisms `/specialisms`
- Specialism detail `/specialisms/marketing-and-leadership`
- Jobs `/jobs`
- Job detail `/jobs/biddable-account-director`
- Insight `/insights`
- Salary Guide `/insights/manchester-north-west-marketing-salary-guide-2026`
- Case Study `/case-studies/havas-media-manchester-managing-partner-james-reddington`
- About `/about-essential`
- Contact `/contact`
- New HTML directory `/sitemap`

## L. ENGINEERING

- Files: `src/components/Footer.tsx`, `src/components/Footer.module.css`, `src/lib/seo.ts`, `src/lib/site.ts`, `src/tests/unit/linkedin-profile.test.ts`, `app/sitemap/page.tsx`, `app/sitemap/sitemap.module.css`, this report; QA evidence under `artifacts/`.
- New dependencies: none.
- Shared component changed: Footer only. CookiePreferencesButton reused unchanged.
- Global CSS changed: no; component CSS modules added.
- New client JavaScript: none; footer and sitemap remain server components.
- Build: PASS. Typecheck: PASS. Lint: PASS.
- Tests: 77 files, 498 tests passed. Final production rebuild and typecheck also passed after the text-reflow/analytics refinement.
- Console errors/page exceptions: none recorded across the browser checks.
- Hydration warnings: none observed.
- Failed requests: none in the focused final production-preview asset check.
- Unexpected footer regressions: none found.
- Existing unrelated edits in `eslint.config.mjs`, `tsconfig.json` and the Side Door project were preserved.

## M. HARD-GUARDRAIL CONFIRMATION

CTA above footer changed: NO. Header changed: NO. Primary navigation changed: NO. Salary Guide data changed: NO. Jobs infrastructure changed: NO. Services architecture changed: NO. Specialisms architecture changed: NO. Unrelated pages redesigned: NO.

Explicitly approved scope extension: new `/sitemap` HTML directory and its discovery entry. It reuses existing public-content readers and sitemap eligibility rules; no CMS schema or publication rule was changed.

## N. MANUAL REVIEW FOR DAVID

Only subjective review remains: overall density and whether the two compact icon groups feel clear enough. The full HTML directory retains About David and the wider public navigation even though the curated footer does not repeat them.

Preview: http://localhost:3030/ and http://localhost:3030/sitemap.

## O. FINAL STATUS

APPROVED FOR PRODUCTION. Implementation and objective checks complete; David authorised publication. Confirm the matching Railway deployment succeeds and verify the public footer and `/sitemap` before reporting the release live.
