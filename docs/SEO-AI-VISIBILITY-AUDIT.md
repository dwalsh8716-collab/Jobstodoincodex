# SEO And AI Visibility Audit

Audit date: 3 July 2026

Status: strong technical foundation, sharper commercial targeting now added.

## 1. SEO Executive Summary

The site has the right bones: server-rendered pages, canonical metadata,
structured data, sitemap, robots, RSS, `llms.txt`, `llms-full.txt`, clean
private-route exclusions and a live Railway preview that has passed production
QA.

The weakness was not technical hygiene. It was commercial search sharpness.
Several pages already said "marketing, comms, PR and digital", but the exact
buyer searches were not clear enough across metadata, service copy and AI
retrieval text.

Safe quick wins implemented:

- homepage metadata now leads with `Marketing Recruitment Manchester`
- services index metadata now covers marketing, PR, digital, agency, retained
  search and strategic interim
- service pages now include a buyer-useful market-fit block
- service content now carries targeted search summaries and search phrases
- service JSON-LD now includes service-specific keywords and service output
- `llms-full.txt` now exposes service market fit and search language
- AI search answers now cover Manchester marketing recruitment, PR recruitment,
  digital recruitment, media recruitment and exclusive/retained recruitment

Launch verdict: technically search-ready as a preview. Growth verdict: not done
until Search Console, GA4, real proof, salary data and ongoing content are live.

## 2. Technical SEO Findings

Pass:

- App Router pages render server-side.
- Canonical URLs are generated through `src/lib/seo.ts`.
- `sitemap.xml` is dynamic and tested.
- `robots.txt` points to the sitemap and blocks private/admin/API areas.
- `rss.xml`, `llms.txt` and `llms-full.txt` render.
- Draft jobs, draft proof and unvalidated salary records are excluded from
  sitemap and AI maps.
- Public pages passed the production QA crawler against Railway.
- Required routes, redirects, 404, internal links, images and browser viewports
  passed.

Watch:

- Final QA must be repeated after `essentialresourcing.co.uk` is switched.
- Search Console verification and sitemap submission are still manual.
- GA4/GTM must stay consent-aware. Do not add duplicate tags.

## 3. Metadata Recommendations

Implemented:

- Home title: `Marketing Recruitment Manchester | Essential Resourcing`
- Home description now names marketing, PR, digital, agency, Manchester, North
  West, UK, retained search and strategic interim.
- Services index title now covers marketing, PR and digital recruitment.
- Service detail metadata now targets:
  - retained marketing recruitment
  - PR agency recruitment
  - marketing recruitment Manchester
  - digital recruitment North West
  - media recruitment North West
  - strategic interim marketing leadership

Keep metadata honest:

- Do not create location pages unless the page answers a real local buyer
  question.
- Do not publish salary/title claims until the data is checked.
- Keep titles readable. No keyword pile-ups.

## 4. Content Gap Analysis

Current content covers:

- senior marketing hiring failure
- retained search for agencies
- Strategic Interim
- Marketing Director hiring process
- service pages for leadership search, strategic interim, agency recruitment,
  client-side marketing recruitment and senior recruitment

Priority gaps:

- dedicated article: "Marketing recruitment in Manchester: what senior buyers
  should check before briefing a recruiter"
- dedicated article: "PR recruitment in Manchester: why agency titles rarely
  tell the full story"
- dedicated article: "Digital recruitment in the North West: salary, scope and
  hybrid reality"
- dedicated article: "Retained vs exclusive recruitment: when a serious brief
  needs commitment"
- validated salary snapshot for senior marketing roles in the North West
- permissioned case studies with real outcomes, timings and commercial impact

Do not fake these. Publish only when David has real evidence or a real point of
view.

## 5. Entity And Semantic SEO Recommendations

Entities already clear:

- Essential Resourcing
- David Walsh
- Manchester
- North West
- senior marketing recruitment
- PR and communications recruitment
- digital recruitment
- agency recruitment
- retained search
- Strategic Interim

Implemented:

- organisation schema now carries target recruitment keywords
- service schema now carries service-specific search phrases
- service pages now explain market fit in plain English

Next:

- Add David's verified Google Business Profile details once final domain is
  ready.
- Add consistent NAP details only if David wants a public phone/address route.
- Add permissioned external sameAs links only when profiles are live and
  maintained.

## 6. AI/LLM Visibility Recommendations

Current strengths:

- `llms.txt` gives a concise AI-readable site map.
- `llms-full.txt` gives expanded service, insight, FAQ and publishing context.
- Articles include direct-answer sections and FAQs.
- Draft proof and salary claims are deliberately excluded.

Implemented:

- added AI-readable service market-fit summaries
- added AI-readable search language for key recruitment terms
- added common hiring questions for Manchester marketing, PR, digital and
  exclusive recruitment intent

Next:

- Keep article introductions direct-answer first.
- Add quotable David Walsh lines only where he would actually say them.
- Use evidence-led pages over generic blog volume.
- Refresh `llms-full.txt` naturally through content updates, not a separate
  hidden SEO layer.

## 7. Internal Linking Plan

Current internal links are solid:

- homepage links to services, clients, candidates, insights, case studies,
  Strategic Interim, David and contact
- service pages link to related services, related insight and proof standards
- insight pages link back to related services
- breadcrumbs exist

Next links to add as content goes live:

- from Manchester marketing recruitment article to Client-side Marketing
  Recruitment, Leadership Search and Contact
- from PR recruitment article to Agency Recruitment and retained search insight
- from digital recruitment article to Client-side Marketing Recruitment and
  Senior Recruitment
- from salary snapshots to relevant service pages and contact
- from case studies to the exact service used and one related insight

Rule: every link should help a buyer move forward. No internal-link spaghetti.

## 8. Schema Recommendations

Already in place:

- ProfessionalService / organisation
- Person
- WebSite
- BreadcrumbList
- Service
- Article
- FAQPage
- JobPosting only for live jobs
- ItemList on visible list pages

Implemented:

- service schema now includes service-specific keyword context
- service schema now includes the plain-English service output where available

Next:

- Add LocalBusiness address only if the public address is approved.
- Add AggregateRating only if there is a verified review source and policy.
- Add Review/Testimonial schema only when permission and source are explicit.
- Keep JobPosting strict: no draft, expired or fake jobs.

## 9. Priority Action Plan

Now complete:

- sharpen metadata for priority recruitment searches
- add service market-fit copy
- add AI/LLM service retrieval signals
- document this audit and roadmap

Before public launch:

- Search Console verification
- sitemap submission
- GA4 or GTM, consent-tested
- PageSpeed/Lighthouse on the final domain
- legal/privacy review
- final domain QA crawler pass

First 30 days after launch:

- publish one Manchester marketing recruitment article
- publish one PR/agency recruitment article
- publish one digital/North West hiring article
- publish one retained/exclusive recruitment article
- review Search Console weekly
- improve titles/copy based on real query data

First 90 days:

- publish one validated salary snapshot
- publish one permissioned case study
- secure relevant external mentions or citations
- build a small expert-comment habit around David's actual hiring judgement

## 10. Specific Copy And Metadata Rewrites

Implemented metadata:

```txt
Home title:
Marketing Recruitment Manchester | Essential Resourcing

Home description:
Founder-led marketing, PR, digital and agency recruitment across Manchester, the North West and UK. Senior hires, retained search and strategic interim.

Services title:
Marketing, PR & Digital Recruitment Services | Essential Resourcing

Services description:
Marketing, PR, digital, agency, retained search and strategic interim recruitment services across Manchester, the North West and UK.
```

Implemented service targeting:

```txt
Leadership Search:
Retained marketing recruitment, exclusive recruitment partner, marketing recruiters Manchester.

Agency Recruitment:
PR recruitment Manchester, PR agency recruitment, digital recruitment North West, media recruitment North West.

Client-side Marketing Recruitment:
Marketing recruitment Manchester, marketing recruiters Manchester, digital recruitment North West.

Senior Recruitment:
Marketing recruitment Manchester, PR recruitment Manchester, digital recruitment North West, media recruitment North West.
```

Recommended next article H1s:

```txt
Marketing recruitment in Manchester: what to check before briefing a recruiter
PR recruitment in Manchester: why the job title is rarely the brief
Digital recruitment in the North West: salary, scope and hybrid reality
Retained recruitment: when a serious brief needs commitment
```

Final rule: No generic SEO waffle. Specific buyer questions, David's judgement
and verified proof will beat a pile of thin pages.
