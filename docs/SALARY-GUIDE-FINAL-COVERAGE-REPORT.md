# Final Salary Guide Coverage Expansion
7 October 2026. Pre-release verification report. David subsequently approved publishing this build, including sharing controls at the top and bottom.

## A. Implementation Summary
Added Product Marketing and Growth & Demand Generation as two dedicated categories. Expanded Digital & Performance, Content & Social and Agency with the approved specialist roles. No new salary research or substitute figures used.
Salary data remains code-defined in src/lib/salary-guide-2026-tables.ts; commentary and FAQ source remains src/lib/salary-guide-2026.ts. No CMS dataset edits or duplicate content store.
Shared design, existing copy, every original salary row, form behaviour and unrelated website architecture retained. The current live baseline is e6e6e079d2c0193dce736542266abf7d3241255b; no stale indexed version was used.

## B. Final Category Order
1. Marketing Leadership
2. Client-side Marketing
3. Brand
4. Product Marketing
5. Growth & Demand Generation
6. Digital & Performance
7. eCommerce
8. CRM
9. Content & Social
10. PR & Communications
11. Agency
12. Brand & Creative Strategy / Planning
13. Media-agency Strategy & Communications Planning
14. Media-agency Client Leadership, Planning & Buying
15. Marketing, Digital & Media Analytics
16. Consumer, Audience & Research Insight
17. Fractional & Interim Marketing Leadership

## C. New Salary Rows
Annual gross base salaries. Figures match all 27 unique approved rows in the supplied brief exactly.

| Section | Role | Lower | Typical | Upper |
| --- | --- | --- | --- | --- |
| product-marketing | Product Marketing Manager | £45,000 | £55,000 | £70,000 |
| product-marketing | Senior Product Marketing Manager | £60,000 | £72,500 | £85,000 |
| product-marketing | Head of Product Marketing / Product Marketing Lead | £75,000 | £90,000 | £110,000 |
| product-marketing | Product Marketing Director | £90,000 | £105,000 | £125,000 |
| growth-demand-generation | Growth Marketing Manager | £45,000 | £55,000 | £70,000 |
| growth-demand-generation | Senior Growth Marketing Manager | £55,000 | £65,000 | £80,000 |
| growth-demand-generation | Demand Generation Manager | £45,000 | £57,500 | £70,000 |
| growth-demand-generation | Head of Growth / Demand Generation | £70,000 | £85,000 | £105,000 |
| growth-demand-generation | Growth Director | £85,000 | £100,000 | £125,000 |
| digital-performance | Paid Social Executive | £28,000 | £32,000 | £36,000 |
| digital-performance | Paid Social Manager | £35,000 | £42,500 | £50,000 |
| digital-performance | Paid Social Account Director / Director | £45,000 | £55,000 | £65,000 |
| digital-performance | Head of Paid Social | £60,000 | £75,000 | £90,000 |
| digital-performance | Programmatic Executive / Trader | £28,000 | £32,000 | £36,000 |
| digital-performance | Programmatic Manager | £35,000 | £42,500 | £50,000 |
| digital-performance | Programmatic Director | £50,000 | £60,000 | £75,000 |
| digital-performance | Head of Programmatic | £60,000 | £75,000 | £90,000 |
| digital-performance | CRO Analyst | £30,000 | £35,000 | £40,000 |
| digital-performance | CRO Manager | £37,500 | £45,000 | £52,500 |
| digital-performance | Affiliate Executive | £26,000 | £30,000 | £35,000 |
| digital-performance | Affiliate Manager | £35,000 | £42,500 | £50,000 |
| content-social | Senior Social Media Manager / Social Lead | £42,500 | £50,000 | £60,000 |
| content-social | Head of Social | £55,000 | £70,000 | £90,000 |
| content-social | Influencer Marketing Manager | £35,000 | £42,500 | £50,000 |
| agency | Agency New Business Manager | £40,000 | £50,000 | £60,000 |
| agency | Agency New Business Director / Growth Director | £70,000 | £85,000 | £105,000 |
| agency | Head of New Business / Agency Growth | £75,000 | £90,000 | £110,000 |

## D. Deliberate Exclusions
No salary rows added for Biddable, Paid Social Creative Strategist, Internal Communications, Agency Operations, Shopper/Trade, Retail Media, generic Partnerships, technical CRO/Experimentation Engineering, Marketing Automation/Lifecycle, Product Management, Product Design or Engineering.
No invented Influencer hierarchy, extra Product Marketing grades, Chief Growth Officer, Sales Director or Commercial Director.

## E. Copy Changes
- Product Marketing: positioning, go-to-market, sales enablement and the boundary with Product Management.
- Growth/Demand Generation: funnel, pipeline, retention and scope; excludes generic sales and agency new business.
- Paid Social: paid activation versus organic social, and specialist versus client-leadership responsibility.
- Programmatic: platform execution, trading, data and senior responsibilities; distinct from integrated media planning.
- Biddable: concise explanation, no invented salary benchmark.
- Paid Social Creative Strategist: existing strategy commentary already makes the distinction; retained rather than duplicated.
- CRO: commercial experimentation, not software engineering.
- Affiliate: channel management and negotiation, not generic partnerships or sales.
- Head of Social/Influencer: agency/client-side scope, creator relationships and commercial responsibility.
- Agency New Business: separate base salary and variable compensation; pipeline, support, targets and closing responsibility.
- Six additional FAQs; all existing FAQs retained.
British English and David's straight-talking voice retained. No new em dashes, forced jokes or inflated research claims.

## F. Navigation
All 17 categories numbered in order, existing anchor IDs preserved. New anchors: #product-marketing and #growth-demand-generation.
Retained compact horizontal navigation, with no new client component. All 19 navigation destinations (including methodology and FAQs) activated at 320px and 1440px. Headings land approximately 152px below the viewport top, clear of sticky navigation.
All back-to-navigation links tested. Keyboard anchor, table scrolling and FAQ activation passed.

## G. Data Integrity
- Existing salary rows before: 121
- Existing salary rows retained after: 121
- Total rows after: 148
- New salary rows: 27
- Existing rows deleted: 0
- Existing cells changed: 0
- New numeric salary cells: 81
- Categories: 15 before; 17 after
- Approved-data mismatches: 0

No changed existing cells to list.
Reproducible comparison: scripts/verify-salary-guide-expansion.mjs, against the baseline commit and supplied brief. Detailed output: artifacts/salary-guide-2026/final-expansion-integrity.json.
Digital table has seven semantic row groups; Agency has four. Group headers are not salary data rows.

## H. Methodology
Original September counts (176/255/63/51/42) unchanged.
The 7 October strategy/media/analytics/insight review remains separate.
The final coverage-gap review is described separately as approved planning estimates, not a fresh measured regional dataset. No invented sample counts, medians or blanket London discount. Recruiter nous and noggin retained.
This implementation verifies supplied data integrity, not the underlying salary research anew.

## I. SEO / GEO / AI Discovery
- Title retained: Manchester & North West Marketing Salary Guide 2026 | Essential Resourcing
- Description retained: Explore 2026 marketing, digital, PR and agency salary ranges for Manchester and the North West, with practical hiring advice and Fractional leadership rates.
- Canonical unchanged: https://essentialresourcing.co.uk/insights/manchester-north-west-marketing-salary-guide-2026
- No page robots-meta restriction introduced.
- Article, BreadcrumbList and FAQPage remain valid JSON; 24 visible FAQs and 24 schema answers.
- David Walsh author and existing entity links retained.
- datePublished remains 2026-09-24; dateModified is 2026-10-07, the genuine update date.
- Existing dedicated Salary Guide Open Graph image and social metadata retained.
- Contextual links added to Marketing & Leadership, Digital/Performance/eCommerce and PR/Communications/Content. Existing service, candidate and source links preserved.
- New commentary included in the existing exported guide body.
- No JobPosting schema, keyword stuffing or additional SEO dependencies.
- Local verification does not establish search-engine indexing or AI citations.

## J. Responsive QA
Chromium tested at 320, 375, 390, 430, 640, 768, 1024, 1280, 1440 and 1920px.
No page-level overflow, broken images, missing anchor targets or duplicate IDs.
Screenshots inspected for mobile/desktop Product Marketing and Digital & Performance; screenshots captured for new categories, Social, Agency, FAQs and form.
A 640px intermediate-width check exposed a pre-existing guide gutter mismatch. A guide-scoped mobile variable correction now matches the parent 24px gutter. Retest passes.
Tables remain horizontally scrollable with readable role names, captions and hints. No layout redesign or smaller typography introduced.

## K. Accessibility
One H1; existing H2 category and H3 editorial hierarchy retained.
Semantic captions, column headers, row headers and named row groups retained/added.
Automated axe scan of the article: zero violations in the tested state. Keyboard navigation, table scrolling and FAQ activation passed.
Existing focus and reduced-motion styles retained; no new colour-only distinctions. Group labels are text, using existing tokens.
Effective 200% layout reflow at 640px tested after the gutter correction. Native browser zoom, physical touch devices and real screen-reader sessions were not tested; no universal accessibility certification claimed.

## L. Engineering
Files changed for this task:
- src/lib/salary-guide-2026-tables.ts
- src/lib/salary-guide-2026.ts
- app/insights/manchester-north-west-marketing-salary-guide-2026/page.tsx
- app/insights/manchester-north-west-marketing-salary-guide-2026/salary-guide.module.css
- src/tests/unit/salary-guide-2026.test.ts
- scripts/verify-salary-guide-expansion.mjs
- CHANGELOG.md
- This report and local QA artifacts

Typecheck: PASS. Lint: PASS. Production build: PASS. Focused unit tests: 14 passed.
New dependencies: NONE. Shared components changed: NONE. Global CSS changed: NONE.
Browser page errors: 0. Failed requests in QA run: 0.
Guide client JavaScript: 38KB gzip; unique public client JavaScript: 71KB gzip, unchanged from prior release budget.
Form success checked with an intercepted response; no live enquiry submitted. Actual delivery not retested.
Homepage, Services, Specialisms, Jobs, Insights, Candidates and Clients returned 200 with one H1 and no overflow in the regression check.
No unexpected regression observed. Unrelated eslint.config.mjs, tsconfig.json and side-door-webco work left untouched.
Field Core Web Vitals, Firefox/Safari and real-device compatibility were not measured in this pass.

## M. Visual / Editorial QA
- One coherent guide: PASS.
- Native to established design system: PASS.
- Editorial rather than dashboard: PASS.
- Specialist distinctions understandable: PASS.
- David-style copy: PASS, subject to David's final personal preference.
- Substantial without needless repeated explanations: PASS.
- Deliberate mobile presentation: PASS.
The guide uses existing section patterns; only long-table grouping is new. No icons, charts, animations, new cards or hidden salary content.

## N. Manual Review For David
Subjective review only: Product Marketing/Growth placement, Digital table density, Biddable explanation and overall reading length.
No manual data-integrity or technical verification work is needed from David.

## O. Final Status
READY FOR PRODUCTION

Preview: http://127.0.0.1:3037/insights/manchester-north-west-marketing-salary-guide-2026

David has approved release. The checks above describe the local production build; deployment success and live verification are reported separately in the release conversation.
