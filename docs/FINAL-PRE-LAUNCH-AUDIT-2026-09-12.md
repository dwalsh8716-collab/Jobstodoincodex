# Essential Resourcing Final Pre-Launch Audit

Date: 12 September 2026  
Audited build: local production preview at `http://127.0.0.1:3000`  
Verdict: strong, distinctive and technically healthy, but the public domain switch should wait for the final external launch checks.

## 1. Launch Readiness Score

| Category | Score | What is strong | Holding it back | Before launch |
| --- | ---: | --- | --- | --- |
| Brand / positioning | 14/15 | Founder-led, senior, Manchester-rooted, commercially sharp. The positioning is clear without sounding like a generic recruitment agency. | Needs more permissioned proof to fully justify premium search claims. | Add one or two real proof assets when available. |
| UX and navigation | 13/15 | Primary journeys are clear: clients, services, Fractional, jobs, insights, about and contact. CTAs are obvious. | Empty proof/salary hubs needed hiding from launch navigation until content exists. This has now been done. | Keep proof/salary hubs noindexed until real content is live. |
| UI / visual execution | 9/10 | The homepage has real presence. Typography, spacing and Manchester energy are strong. | Needs more owned photography/video over time. | Add real founder/service media when ready. |
| Copy and messaging | 9/10 | The copy sounds like David: direct, useful, commercially honest, no fake guru nonsense. | A few staged/supporting lines still need live operational proof behind them. | No broad rewrite needed. |
| Conversion / commercial journey | 8/10 | Contact routes, WhatsApp and brief-sense-check CTAs are strong. | Contact email delivery and operational inbox handling still need production env verification. | Configure and test live form delivery before switching the domain. |
| SEO | 9/10 | Good titles, metadata, crawl controls, sitemap, schema, article/service coverage and location relevance. | Final launch still needs Search Console, redirects and production-domain smoke tests. | Submit sitemap, verify redirects and monitor crawl errors after launch. |
| AI / LLM search visibility | 9/10 | Strong direct-answer content, entity clarity, service definitions, `llms.txt`, `llms-full.txt`, schema and article structure. | Lacks first-party proof/data assets that would make answer engines trust it more. | Add case studies and salary/market data after validation. |
| Technical / pre-launch QA | 9/10 | Build, lint, typecheck, unit tests, browser tests, accessibility checks and performance budget pass. | Dependency audit still has moderate dev/tooling advisories that need planned maintenance. | Do not force breaking dependency upgrades on launch day. |
| Trust / credibility / proof | 4/5 | Founder history, process, candidate privacy and working style create trust. | No live testimonials, named proof or published case studies yet. | Add proof carefully, not made-up fluff. |
| Mobile / accessibility | 5/5 | Mobile layout is strong after footer/contrast/reveal fixes. Axe WCAG AA checks pass on key pages. | Keep retesting after any new media/content. | Run screenshots again after live media is added. |

Overall launch readiness: **89/100**  
Classification: **Strong but needs final work**  

Would I launch today? **YES, BUT FIX THESE FIRST.**

I would not point the live Essential Resourcing domain at this build until the external launch gates are done: production form email delivery, DNS/SSL, Search Console, Sanity production access/CORS, analytics consent, and a final live-domain crawl. The site itself is now in good shape. The remaining risk is mostly live plumbing and proof maturity, not the core build.

## 2. Changes Applied During This Audit

| Area | Change | Why |
| --- | --- | --- |
| Homepage heading | Fixed machine-readable H1 spacing so it reads as "Helping Businesses Make Better Hiring Decisions." | Prevents joined heading text for assistive tech and tests. |
| Accessibility | Darkened homepage accent text and comparison text that failed WCAG contrast checks. | Axe flagged serious contrast failures. These now pass. |
| Reveal behaviour | Made reveal/mask states readable and visible by default. | Avoids blank-looking sections in screenshots, slow scripts or assistive tooling. |
| Video placeholders | Empty video blocks without usable media now render nothing. Public "Founder video" placeholder wording was changed. | Stops the site feeling unfinished when a video URL is missing. |
| Booking route | `/book-a-call` now redirects to `/contact` when no real booking URL is configured. | Removes a public "Setup needed" panel. |
| Empty proof/salary hubs | `/case-studies` and `/salary-snapshots` are noindexed, removed from launch sitemap paths and removed from footer navigation until real content exists. | Empty proof pages should not be pushed into Google or footer journeys. |
| AI index | Removed public "Draft" wording from `llms.txt`/`llms-full.txt` output. | Keeps the AI-readable map clean and launch-facing. |
| Dependencies | Applied safe dependency updates. Critical/high advisories were cleared; moderate advisories remain where forced fixes are breaking. | Sensible launch-day risk control. |
| Sanity build compatibility | Updated Sanity icon usage after package changes. | Restored clean production build. |
| Tests | Updated stale tests after the final copy deck and launch fixes. | Keeps the safety net aligned with the current site. |

## 3. Page-By-Page Audit

| Page | URL | Score | Verdict | Recommendation |
| --- | --- | ---: | --- | --- |
| Home | `/` | 92 | Strong first impression. Clear founder-led search positioning, excellent commercial voice, good CTA flow, good AI-search answer density. | KEEP. Add real founder video/photo when ready. |
| Clients | `/clients` | 91 | Very clear for CEO/founder/CMO audience. Strong brief-challenge proposition. | KEEP. Add proof later. |
| Services hub | `/services` | 89 | Clear route into different hiring problems. Good service structure. | KEEP. |
| Leadership Search | `/services/leadership-search` | 91 | Strong senior-hire page. Good fit for Marketing Director, CMO and leadership-search intent. | KEEP. Add proof when available. |
| Fractional | `/services/strategic-interim` | 90 | Strong commercial explanation of interim/fractional leadership. | KEEP. Add real video or owned media later. |
| Agency Recruitment | `/services/agency-recruitment` | 90 | Feels specialist and commercially literate for agency founders. | KEEP. |
| Client-side Marketing Recruitment | `/services/client-side-marketing-recruitment` | 89 | Good client-side positioning and senior/specialist split. | KEEP. |
| Senior Recruitment | `/services/senior-recruitment` | 88 | Strong enough, but slightly broader than the sharper service pages. | TWEAK later with proof/examples. |
| Specialisms | `/specialisms` | 86 | Useful SEO/AI support page. Clear topical coverage across marketing, PR, digital and agencies. | KEEP. Consider a footer/internal link later if it becomes a strategic page. |
| Jobs | `/jobs` | 84 | Honest and candidate-friendly even with no live jobs. | KEEP. Add live jobs only when genuine. |
| Insights hub | `/insights` | 90 | Strong editorial tone and useful topical entry point. | KEEP. |
| Hire a Marketing Director article | `/insights/how-to-hire-a-marketing-director-without-wasting-six-weeks` | 91 | Good senior-hiring intent, practical and distinctive. | KEEP. |
| Fractional article | `/insights/what-is-a-strategic-interim-marketing-leader` | 90 | Good direct-answer content for AI/search. | KEEP. |
| Agency Retained Search article | `/insights/when-should-an-agency-use-retained-search` | 89 | Strong agency founder relevance. | KEEP. |
| Senior Marketing Hiring article | `/insights/why-senior-marketing-hiring-goes-wrong` | 90 | On-brand, useful and commercially sharp. | KEEP. |
| Candidates | `/candidates` | 90 | Candidate trust is unusually strong for recruitment sites. Good privacy and transparency links. | KEEP. |
| Case Studies | `/case-studies` | 76 | Honest, but empty. Now noindexed and removed from footer/sitemap until content exists. | FIX BEFORE MAKING PUBLIC: publish one verified case study or keep hidden. |
| Salary Snapshots | `/salary-snapshots` | 75 | Sensible principle, but empty. Now noindexed and removed from footer/sitemap until content exists. | FIX BEFORE MAKING PUBLIC: publish validated data or keep hidden. |
| About Essential | `/about-essential` | 90 | Strong explanation of why the business exists and how it works. | KEEP. |
| About David Walsh | `/about-david-walsh` | 88 | Strong founder credibility. | TWEAK later with real photo/video and permissioned recommendations. |
| Contact | `/contact` | 86 | Good copy, clear form, WhatsApp and email routes. | MUST TEST live email delivery before launch. |
| Privacy Policy | `/privacy-policy` | 87 | Solid launch-ready legal route. | NEEDS MANUAL legal/privacy review. |
| Candidate Privacy | `/candidate-privacy` | 91 | Strong candidate trust signal. | KEEP. |
| Data Request | `/candidate-privacy/request` | 88 | Good DSAR-style route and tone. | MUST TEST delivery/ops workflow before launch. |
| Cookie Policy | `/cookie-policy` | 86 | Clear enough for launch. | Verify against final analytics stack. |
| Terms | `/terms` | 85 | Fine for launch. | Legal review recommended. |
| CMS login | `/cms` | 82 | Correctly noindexed. Good enough for internal use. | Test production login/CORS before launch. |
| Book a Call | `/book-a-call` | 85 | Now redirects to contact unless booking is enabled. | Add Google booking URL only when fully tested. |
| Salary Guides | `/salary-guides` | 72 | Correctly noindexed/staged. | Do not expose until lead capture/download/email flow is configured. |
| Design System | `/design-system` | 70 | Correctly noindexed internal utility. | Keep private/noindex. |

### Page-Level Notes

| Route | Purpose and H1 | Visual / copy / CTA notes | SEO / AI-search notes | Launch classification |
| --- | --- | --- | --- | --- |
| `/` | Establish the whole proposition: founder-led search for better hiring decisions. H1 is clear and now reads correctly in the DOM. | Strong hierarchy, strong commercial language, clear CTAs. Static founder media is acceptable but should become real founder media later. | Excellent entity clarity and direct-answer copy. | KEEP. |
| `/clients` | Speak to hiring businesses that need sharper senior recruitment judgement. | Clear client journey and credible tone. CTAs are natural and low-friction. | Strong commercial intent page for business/hiring searches. | KEEP. |
| `/services` | Route users to the right type of hiring help. | Good scanning and service segmentation. | Useful hub for service discovery and internal linking. | KEEP. |
| `/services/leadership-search` | Explain retained/founder-led marketing leadership search. | Strong senior-hire language and appropriate CTAs. | Strong for marketing director, CMO and leadership search intent. | KEEP. |
| `/services/strategic-interim` | Explain Fractional and fractional marketing leadership. | Strong commercial explanation. Empty video no longer shows as an unfinished block. | Good direct-answer coverage for interim/fractional searches. | KEEP. |
| `/services/agency-recruitment` | Show agency founders that the business understands agency pressure. | Tone is particularly strong here. CTAs fit the audience. | Good agency and senior agency recruitment relevance. | KEEP. |
| `/services/client-side-marketing-recruitment` | Explain client-side senior and specialist marketing recruitment. | Clear enough for CMO/MD readers. Could use future proof examples. | Good client-side recruitment intent coverage. | KEEP. |
| `/services/senior-recruitment` | Broader senior recruitment page for roles below/around leadership. | Useful but less distinctive than the sharper service pages. | Helpful supporting route. | TWEAK LATER. |
| `/specialisms` | List the marketing, PR, communications, digital and agency specialisms. | Functional and useful. Not a primary conversion page. | Valuable topical map for Google and answer engines. | KEEP. |
| `/jobs` | Candidate job hub, even when no jobs are currently live. | Honest copy prevents a dead-board feeling. | Correctly avoids inventing live roles. | KEEP. |
| `/insights` | Editorial hub for useful hiring thinking. | Strong article cards and good internal route into service pages. | Good topical authority base. | KEEP. |
| `/insights/how-to-hire-a-marketing-director-without-wasting-six-weeks` | Advice article for senior marketing hires. | Practical, specific and strongly in David's voice. | Excellent search and AI-answer fit. | KEEP. |
| `/insights/what-is-a-strategic-interim-marketing-leader` | Define Fractional marketing leadership. | Clear education-led page without sounding academic. | Strong direct-answer article. | KEEP. |
| `/insights/when-should-an-agency-use-retained-search` | Explain when retained search makes sense for agencies. | Useful commercial judgement for agency owners. | Good niche search fit. | KEEP. |
| `/insights/why-senior-marketing-hiring-goes-wrong` | Explain common senior hiring failures. | Strong problem-led copy and good CTA logic. | Useful for commercial discovery searches. | KEEP. |
| `/candidates` | Build candidate confidence and explain how David works. | Warm, candid and unusually transparent for recruitment. | Strong trust signal and internal support for candidate privacy. | KEEP. |
| `/case-studies` | Future proof hub. | Currently empty and should not be part of main journeys. | Now noindexed and removed from footer/sitemap. | FIX BEFORE MAKING PUBLIC. |
| `/salary-snapshots` | Future market-data hub. | Currently empty and should not be part of main journeys. | Now noindexed and removed from footer/sitemap. | FIX BEFORE MAKING PUBLIC. |
| `/about-essential` | Explain the business model and why Essential Resourcing exists. | Strong founder-led company page. | Good organisation/entity support. | KEEP. |
| `/about-david-walsh` | Establish David's credibility and working style. | Strong, human and believable. Needs real media/proof later. | Good person/entity support. | TWEAK LATER. |
| `/contact` | Convert enquiries into conversations. | Good form and CTA copy. Biggest risk is production email delivery, not page design. | Good commercial action page. | FIX LIVE EMAIL BEFORE LAUNCH. |
| `/privacy-policy` | Legal/privacy route. | Clear and usable. | Needs final legal review against actual tooling. | KEEP WITH REVIEW. |
| `/candidate-privacy` | Explain candidate data handling plainly. | Excellent trust-building route. | Useful for candidate confidence and brand credibility. | KEEP. |
| `/candidate-privacy/request` | Let candidates request access, correction or deletion. | Clear and respectful. Must be operationally tested. | Privacy utility route, not a traffic page. | FIX DELIVERY BEFORE LAUNCH. |
| `/cookie-policy` | Explain cookies/tracking. | Fine for launch if it matches final analytics setup. | Needs final analytics confirmation. | KEEP WITH REVIEW. |
| `/terms` | Terms route. | Functional and clear. | Legal review recommended. | KEEP WITH REVIEW. |
| `/cms` | Internal CMS entry point. | Correctly not a public marketing journey. | Noindexed. | TEST PRODUCTION ACCESS. |
| `/book-a-call` | Optional booking route. | Now redirects to contact until the booking URL is ready. | Noindexed and out of launch sitemap while disabled. | KEEP DISABLED UNTIL TESTED. |
| `/salary-guides` | Future gated guide route. | Staged but noindexed. | Should remain hidden until consent/download/email is live. | HOLD. |
| `/design-system` | Internal design reference. | Not public marketing content. | Noindexed. | HOLD INTERNAL. |

## 4. Unfinished / Placeholder Sweep

| Page | Issue | Exact text/element | Severity | Action |
| --- | --- | --- | --- | --- |
| Contact and form-backed routes | Delivery must be proven in production | Contact API can validate locally without necessarily proving production email delivery. | CRITICAL | Configure Resend or chosen mail provider, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, then send a real enquiry and confirm inbox delivery. |
| `/candidate-privacy/request` | Data request workflow depends on production delivery/storage config | Candidate data requests must reach David reliably. | CRITICAL | Test valid/invalid submissions and confirm no PII leaks in responses/logs. |
| `/case-studies` | Empty proof hub | "Proof in progress" | MEDIUM now, HIGH if relinked/indexed | Kept noindex/unlinked. Publish only when verified. |
| `/salary-snapshots` | Empty market-data hub | "No public salary snapshots are live yet." | MEDIUM now, HIGH if relinked/indexed | Kept noindex/unlinked. Publish only with validated data. |
| Homepage/About | Founder media still not fully real | Static founder perspective poster rather than real founder video/photo. | MEDIUM | Add owned founder photo or short video when ready. |
| Fractional article/service support | Missing real service media | Empty Fractional video URL is now hidden. | LOW | Add real video/media later if useful. |
| `/salary-guides` | Staged lead magnet | Noindex gated route. | MEDIUM | Do not expose until download/email/consent path is live. |
| Analytics/cookie consent | Depends on production IDs | Cookie preferences appear only when tracking config exists. | MEDIUM | Test with final GA4/GTM/LinkedIn IDs. |
| Sanity | CMS/local content split | Local fallback content currently protects final copy. | MEDIUM | Sync approved copy into Sanity before handing editing back to CMS. |

## 5. Visual / UI Audit

The site looks more like a serious founder-led senior search partner than a small generic recruitment agency. The homepage carries the brand well: bold type, dark/yellow/red Manchester energy, strong opening proposition and clear sense of a human operator behind the business.

What is working:
- The hero is memorable and does not feel templated.
- Typography has confidence without becoming gimmicky.
- The process and comparison sections explain the commercial difference well.
- Mobile layouts are strong after the footer and contrast fixes.
- CTAs are frequent but not desperate.

What still holds it back:
- The site needs one or two owned visual assets: David, Manchester, process, or client/candidate working context.
- There is not yet enough real proof to support every premium claim.
- The homepage is long, but it earns most of its length. Do not cut it heavily before launch.

## 6. User Journey / CRO Audit

Strongest journeys:
- CEO/Founder/MD needing a senior marketing hire: Home -> Clients -> Leadership Search -> Contact.
- Agency founder needing a senior hire: Home -> Services -> Agency Recruitment -> Contact/WhatsApp.
- Business considering interim/fractional support: Home -> Fractional -> Fractional article -> Contact.
- Senior candidate: Home -> Candidates -> Jobs -> Candidate Privacy -> Contact.
- LinkedIn-aware visitor: Home -> About David -> Contact/LinkedIn/WhatsApp.

Within 5 seconds, the site communicates:
- What Essential Resourcing does: yes.
- Who David helps: yes.
- Why David is different: yes.
- Next action: yes.

Conversion risks:
- Contact form must be live-delivery tested.
- No real case studies/testimonials means some cold senior buyers may want one extra trust signal before enquiring.
- "Talk to David" and "Sense-check a brief" are good CTAs. Keep them.

## 7. SEO Audit

Verified:
- Public routes return 200.
- Private/admin/CMS routes are noindexed or blocked appropriately.
- `/robots.txt`, `/sitemap.xml`, `/rss.xml`, `/llms.txt` and `/llms-full.txt` render.
- Empty case-study and salary hubs are now noindexed and removed from the launch sitemap path list.
- Booking and salary-guide gates are kept out of the sitemap unless configured.
- Service and article pages have useful title/meta/H1 alignment.
- Structured data exists for organisation, person, services, articles, breadcrumbs, FAQs and jobs where appropriate.

Search relevance already covered:
- marketing recruitment Manchester
- senior marketing recruitment
- marketing leadership search
- retained search marketing
- Fractional marketing
- fractional/interim marketing leadership
- agency recruitment Manchester
- client-side marketing recruitment
- PR, digital and communications recruitment

Gaps worth filling after launch:
- One strong Manchester/North West market insight using first-party observations.
- One permissioned or anonymised but specific case study.
- A validated salary/market snapshot with a clear review date.
- A page or article that more directly answers "marketing recruitment agency Manchester" without stuffing the phrase.

Current SEO guidance used:
- Google says AI search visibility does not require special AI-only markup; foundational SEO, crawlable text, indexability, snippets, internal links and good page experience still matter: https://developers.google.com/search/docs/appearance/ai-features
- Google's 2025 AI-search guidance reinforces structured data matching visible content and strong page experience: https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search
- Google's structured data docs state structured data should describe visible page content: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Google mobile-first guidance still requires equivalent mobile/desktop content and crawlable primary content: https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing

## 8. AI / LLM Visibility

AI / LLM visibility score: **90/100**

The site is unusually well prepared for answer engines because it gives clear direct answers:
- Essential Resourcing is founder-led.
- David Walsh is the founder and does the work.
- The business is Manchester-based and UK-wide.
- The specialisms are marketing leadership, retained search, Fractional, PR, digital, comms, agency and client-side marketing recruitment.
- The process is framed around better hiring decisions, brief interrogation and judgement.

Five highest-value AI-search improvements:
1. Publish one verified case study with specific role, context, process, outcome and permission status.
2. Publish one first-party market/salary insight with a review date and methodology note.
3. Add an owned David Walsh image/video with descriptive alt text and transcript.
4. Add one concise "Marketing recruitment in Manchester" explainer that answers location/service intent plainly.
5. Keep all schema aligned with visible text after CMS edits.

## 9. Copy Consistency Check

No broad rewrite is needed. The voice is strong and should not be polished into generic B2B copy.

Implemented copy-level fixes:

| Current | Replace with | Why |
| --- | --- | --- |
| "Founder video" | "Founder perspective" | Avoids implying a video exists when the media is only a poster/static fallback. |
| "Draft-safe proof area" | "Verification-led proof area" | Removes internal build language from the public AI map. |
| "Draft proof, salary and job records..." | "Unpublished proof, salary and job records..." | Cleaner public wording for AI-readable routes. |
| Booking setup panel on `/book-a-call` | Redirect to `/contact` when booking is not configured | Removes public setup copy entirely. |

Copy to protect:
- "Helping Businesses Make Better Hiring Decisions."
- "Technology helps find people. Experience and judgement work out who's actually good."
- "Sense-check a brief"
- "Talk to David"
- "No SEO sludge"
- "No recruitment nonsense"

## 10. Trust / Proof Audit

Proof already present:
- Founder-led model.
- David's recruitment history and accountability.
- Candidate privacy and data request routes.
- Strong explanation of process and market judgement.
- Honest stance against fake logos/testimonials.

Proof missing before this becomes 95+:
- Permissioned case studies.
- Named testimonials or LinkedIn recommendations, only where allowed.
- Specific outcomes from real searches.
- First-party salary/market observations.
- Real founder media.

The site is credible enough to launch without case studies, provided the empty proof pages stay noindexed/unlinked until ready.

## 11. Mobile / Accessibility / Technical QA

Verified:
- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run test` passes: 64 test files, 367 tests.
- `npm run build` passes on Next.js 16.3.4.
- `npx playwright test` passes: 16 browser tests across desktop and mobile.
- Axe WCAG A/AA checks pass on key public pages.
- `npm run performance:budget` passes: unique public client JS is 45KB gzip.
- `/robots.txt`, `/sitemap.xml`, `/rss.xml`, `/llms.txt`, `/llms-full.txt` return 200.
- `/book-a-call` redirects to `/contact` when booking is disabled.
- Sitemap excludes private/admin/client/candidate-token/lab routes.

Needs manual test:
- Live contact form email delivery.
- DSAR/data request email/storage workflow.
- Production CMS login and Sanity CORS.
- WhatsApp link on a real phone.
- Analytics/cookie preferences with real tracking IDs.
- DNS, SSL, www/non-www and old-site redirects.
- Google Search Console and Bing Webmaster Tools.

Action required:
- `npm audit --omit=dev` still reports 10 moderate advisories in Vitest/Sanity tooling chains. The automatic fix requires breaking upgrades, so handle this in a planned dependency pass rather than launch-day forcing.

## 12. Domain Switch / Go-Live Checklist

Before changing the domain:
1. Confirm this exact build is the intended site. The current public `essentialresourcing.co.uk` is a holding site, so do not switch accidentally.
2. Set production `NEXT_PUBLIC_SITE_URL=https://essentialresourcing.co.uk`.
3. Configure `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` or the chosen production email provider.
4. Send a real contact form test and confirm inbox delivery.
5. Send a real candidate data request test and confirm delivery/storage.
6. Configure Sanity project/dataset/API version and production CORS origins.
7. Test `/cms` and `/studio` access in production.
8. Configure analytics IDs and verify cookie consent before firing tracking.
9. Confirm WhatsApp number and default message.
10. Only add Google booking URL when the appointment schedule is live and tested.
11. Set DNS for apex and `www`.
12. Confirm SSL certificate is issued.
13. Choose canonical host and force the other host with 301 redirects.
14. Map old indexed URLs to new equivalents before switching.
15. Submit sitemap in Google Search Console and Bing Webmaster Tools.
16. Inspect robots.txt after production deploy.
17. Check Open Graph/social preview.
18. Run a live-domain crawl after launch.
19. Monitor Search Console coverage, 404s and crawl errors for two weeks.
20. Keep a rollback option to the previous holding site until the new site has been checked.

Google's site move guidance recommends monitoring traffic, sitemaps, server logs and crawl errors after URL/domain changes: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes

## 13. Master Action List

### Must Fix Before Go-Live

| Action | Location | Why it matters | Impact | Effort |
| --- | --- | --- | --- | --- |
| Configure and test production form email delivery | Contact/API/env | A launch site that cannot reliably receive enquiries is not launch-ready. | High | Quick |
| Configure and test candidate data request delivery | Candidate privacy request/API/env | Privacy requests must not vanish. | High | Quick |
| Confirm production DNS, SSL and canonical domain | Hosting/DNS | Prevents broken launch and SEO confusion. | High | Moderate |
| Add Search Console/Bing verification and submit sitemap | Search setup | Protects indexing during the domain switch. | High | Quick |
| Smoke-test CMS/Sanity access on production | CMS/Studio | Prevents post-launch editing pain. | Medium | Quick |
| Keep case studies and salary snapshots noindexed/unlinked until content exists | Proof/salary hubs | Avoids launching empty proof pages. | Medium | Done, then monitor |

### Should Fix Before Go-Live

| Action | Location | Why it matters | Impact | Effort |
| --- | --- | --- | --- | --- |
| Add one real founder photo or video | Home/About | Strengthens trust and human authority. | Medium | Moderate |
| Sync approved copy into Sanity | CMS | Avoids future edits resurrecting older copy. | High | Moderate |
| Test analytics and cookie consent with final IDs | Layout/consent | Keeps tracking lawful and clean. | Medium | Quick |
| Check old holding-site URLs and redirect map | SEO/domain | Protects any existing search value. | Medium | Moderate |

### First 30 Days After Launch

| Action | Location | Why it matters | Impact | Effort |
| --- | --- | --- | --- | --- |
| Publish one verified case study | Case studies | Adds trust and AI-search evidence. | High | Moderate |
| Publish one validated salary/market snapshot | Salary snapshots | Adds information gain and search value. | High | Moderate |
| Add one Manchester/North West market insight | Insights | Builds topical authority. | Medium | Moderate |
| Review Search Console queries weekly | SEO | Shows what Google understands and what it misses. | Medium | Quick |
| Add permissioned LinkedIn recommendations if allowed | About/Proof | Builds founder credibility without fake proof. | Medium | Moderate |

### Longer-Term Opportunities

| Action | Location | Why it matters | Impact | Effort |
| --- | --- | --- | --- | --- |
| Turn Recruiter Labs into a selective proof/innovation area | Internal/labs/public later | Shows modern process without making the business sound like an AI gimmick. | Medium | Significant |
| Add light conversion analytics dashboard | Admin/analytics | Helps understand which pages create enquiries. | Medium | Moderate |
| Build service-specific downloadable checklists | Services | Good lead capture if genuinely useful. | Medium | Moderate |

## 14. The 10 Things I Would Do Next, In Order

1. Configure production email delivery and send a real enquiry test.
2. Test candidate data request delivery end to end.
3. Confirm production env vars for site URL, Sanity, analytics, WhatsApp and email.
4. Deploy to staging/production preview without moving the domain.
5. Test CMS login and Sanity Studio on that deployed preview.
6. Crawl the deployed preview and compare against the local route check.
7. Prepare DNS, SSL and old URL redirect map.
8. Switch the domain only after the live-form test passes.
9. Submit sitemap and verify Search Console/Bing.
10. Add one verified proof asset in the first 30 days.

## 15. Final Scores

Current website score: **89/100**  
Expected score after critical external fixes: **92/100**  
Expected score after all recommended pre-launch work: **94/100**  

What prevents this being a 95+/100 website:
- Not enough permissioned proof yet.
- No validated salary/market data live yet.
- Founder/service media is not fully real yet.
- Production email/CMS/analytics/domain plumbing still needs live proof.
- It needs post-launch evidence from Search Console and real user behaviour.

Final call: **YES, BUT FIX THESE FIRST.**  

The build is good. The voice is good. The structure is good. The site now feels like a founder-led specialist search business rather than a generic recruiter. I would be comfortable moving toward launch, but only after the external launch gates are tested properly. No fake green ticks.
