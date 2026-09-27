# Salary guide launch — 24 September 2026

Public URL: https://essentialresourcing.co.uk/insights/manchester-north-west-marketing-salary-guide-2026

## Content and design

- Complete, ungated guide with nine salary groups, 77 approved source entries and 14 visible FAQs. The user requested removal of Fractional Managing Partner after previewing; Fractional Agency MD remains unchanged.
- All original 78 table rows compared against the supplied NLW_CHECKED Word document. Exact match apart from the user-approved clarification “Advisory-only (per month)”; one row subsequently removed at the user's request.
- Experience wording corrected to “more than a decade’s experience recruiting in the market” after David confirmed his recruitment career began in 2013.
- No PDF, download promise or lead-capture gate added to the guide.
- Existing brand typography and palette; semantic text tables, anchor navigation, clear methodology and direct recruitment links. No decorative stock images or extra image payload.
- Statutory wage context is distinguished from planning ranges; age and contracted-hours caveats accompany affected junior ranges.
- Planning points are not represented as medians, quartiles or statistical findings. The underlying research counts are supplied by Essential Resourcing, not independently audited in this website release.

## Integration

- Dedicated server-rendered route, title, description, canonical, existing branded social image and Article metadata.
- Article/author, breadcrumb and visible FAQ structured data; no promises of rich results or AI citations.
- Added to the Insights hub and relevant service reading lists; existing salary-guide holding page links to the public article.
- Existing content integration includes the new URL in the XML sitemap, RSS and text indexes.
- Existing unrelated local edits preserved. No broad Git commit or reset performed.

## Verification

- Typecheck and lint passed.
- Production build passed.
- 394 tests passed across 68 files, including five new guide-specific tests after the requested row removal.
- Initial browser QA at 1440, 390 and 320 pixels: HTTP 200, one H1, nine tables, 78 rows, no page-level horizontal overflow, no broken in-page anchors, no runtime page errors. Following the requested removal, the preview's fractional table was checked again: ten rows, no Fractional Managing Partner, Agency MD unchanged; overall guide count is now 77.
- Automated WCAG A/AA checks at those widths: zero detected violations. This is not a guarantee of complete accessibility conformance.
- Keyboard horizontal table scrolling and FAQ expansion verified.
- Seven article-linked internal destinations returned HTTP 200.
- Sitemap, RSS, both text indexes, robots, Insights hub and advisory service returned HTTP 200. Guide inclusion verified where applicable.
- No contact forms submitted, customer records changed or emails sent as part of QA.

## Recovery and release

- Targeted pre-change source backup: `artifacts/salary-guide-2026/pre-change-source.tar.gz`.
- Initial release source snapshot, excluding environment files: `artifacts/salary-guide-2026/approved-release-source.tar.gz`. Corrected 77-entry release: `artifacts/salary-guide-2026/approved-release-source-v2.tar.gz`.
- Screenshots: `artifacts/salary-guide-2026/`.
- Previous successful Railway deployment: `530553ab-498f-4a9a-84be-9051670f464f`.
- Initial deployment `3bc8a232-02c6-494c-a145-eabf4c831f68` reached SUCCESS. Public article, sitemap, RSS, text indexes, robots, health, Insights hub and advisory service returned HTTP 200. Canonical, title, monthly advisory wording and experience wording verified live; no noindex directive or X-Robots-Tag.
- Corrected deployment `9d9a425a-238b-415e-a97f-a67e0318681d` reached SUCCESS. Live article has 77 rows; Fractional Managing Partner is absent and Fractional Agency MD remains £700 / £900 / £1,200. The full text index also excludes the removed row. Live sitemap and health checks passed.

The existing sitemap registration was observed as Success, last read 24 September 2026. A duplicate sitemap submission was unnecessary. Google Search Console's live test at 23:58 UK time confirmed “URL is available to Google” and “Page can be indexed”, with one valid breadcrumb item. After the corrected release was verified live, the indexing request was submitted and Google confirmed “Indexing requested” and addition to its priority crawl queue. This is not confirmation or a guarantee of indexing, rankings or AI citations.
