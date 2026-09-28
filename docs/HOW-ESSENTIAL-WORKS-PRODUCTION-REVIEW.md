# How Essential Resourcing Works: Implementation Review

Date: 28 September 2026

Preview: http://127.0.0.1:3020/how-essential-resourcing-works

Status: **READY FOR REVIEW. Local only. Not committed, pushed or deployed.**

## A. Implementation Summary

Rebuilt the page as the parent explanation of Essential's four services, rather than presenting one search process as the answer to every hiring problem. The existing design tokens, Inter typography, dark hero, editorial surfaces, buttons, borders and WhatsApp component are retained.

The previously approved four service pages are unchanged by this task. Production, Sanity, Railway, the navigation, footer, contact handling and tracking configuration were not changed.

## B. Page Architecture

1. Hero: start with the problem, with Contact and WhatsApp CTAs.
2. Essential philosophy: editorial copy about understanding the need and applying judgement.
3. Four routes: one hiring problem leading to four distinct, fully clickable product cards.
4. Shared principles: five numbered editorial entries, without chronological connectors.
5. Service comparison: all four products and all six approved dimensions.
6. Search methodology: seven concise stages, explicitly qualified as common search thinking rather than a universal service process.
7. Technology + judgement: restrained split editorial treatment and closing cadence.
8. Founder-led involvement: compact operational explanation, with David's name linking to his existing page.
9. Choose your route: shorter service navigation, followed by secondary case-study and client links.
10. Final CTA: the approved invitation to sense-check the problem, plus WhatsApp and the closing line.

## C. New Components

| Name | Purpose | Reused elsewhere? |
| --- | --- | --- |
| `FourRouteSelector` | Reusable, data-driven 2 x 2 service-route selector, stacking on mobile | No; this page only at present |
| `ServiceComparison` | Single set of semantic description lists; aligned desktop matrix and tablet/mobile summaries | No; this page only at present |
| `ContactActions` | Page-local helper for the two approved CTA groups | Used twice within this page |

Existing Breadcrumbs, SchemaScript, WhatsAppButton, metadata/schema helpers and analytics attributes are reused. No unnecessary component extraction for simple editorial sections.

## D. Copy

Implemented the supplied headings, propositions, route descriptions, principles, all 24 comparison values, methodology qualification, seven search stages, technology/judgement copy, founder involvement, routing copy and final CTA.

Presentation decisions, explicitly recorded:

- Adjacent short sentences are grouped into natural paragraphs; their wording is preserved.
- Retained the original "Recruitment is a two-way sell." in stage 3, as requested in the brief's final preservation instruction. It supplements the shorter stage-3 specification.
- Added the compact linked name "David Walsh" beneath founder involvement, following the brief's optional name treatment.
- Used the existing `/case-studies` index for "See client case studies".
- Eyebrows use the existing uppercase visual styling; straight apostrophes and typographic quotation marks do not alter the wording.

No other copy deviations. The earlier copy-reference file remains a historical before-change snapshot, not the new publication copy.

## E. SEO / GEO

**Title:** How Essential Resourcing Works | Recruitment, Search & Advisory

**Meta description:** How Essential Resourcing helps businesses make better hiring decisions through Permanent Recruitment, Retained Search, Fractional Leadership and Market Intelligence & Advisory.

**Canonical:** https://essentialresourcing.co.uk/how-essential-resourcing-works

**Breadcrumb:** How Essential Resourcing Works

**Structured-data name:** How Essential Resourcing Works

**Structured-data description:** How Essential Resourcing approaches recruitment, retained search, fractional leadership search and market intelligence for marketing, digital, PR, communications and agency hiring.

- Retained the existing ItemList implementation, now describing the four visible service routes instead of suggesting the entire page is a universal seven-stage process.
- Existing global organization/person relationships and breadcrumb schema remain intact. Rendered JSON-LD parses successfully.
- Exactly one H1, followed by section H2s and component H3s.
- Canonical and indexability verified in rendered HTML; no accidental noindex.
- Page remains in the sitemap. Robots, sitemap, RSS and both AI text routes return 200 locally.
- All four service URLs are correct and return 200. All ten unique internal destinations on this page return 200.
- Preserved the seven original search-stage anchor IDs for existing deep links.
- Main content remains visible with JavaScript disabled. No hidden keyword copy added.

## F. Responsive QA

**Mobile:** 320, 375, 390 and 430px. Single-column service selector and comparison summaries; comfortable vertical principles and methodology. No horizontal overflow or clipped copy detected.

**Tablet:** 768 and 1024px. Selector remains 2 x 2. Comparison uses two-column service summaries at 768px and the aligned matrix at 1024px. Editorial sections reflow without changing reading order.

**Desktop:** 1280, 1440 and 1920px. Constrained content width, balanced route grid, aligned comparison rows and a lighter two-column search-method layout. Typography does not continue scaling with viewport width.

**Zoom/reflow:** Checked at 640 CSS pixels, equivalent to a 1280px-wide viewport at 200% browser zoom; no horizontal overflow. This is a reflow test, not a claim of physical-device testing.

No unresolved responsive issues found in this pass.

## G. Accessibility

- Semantic heading hierarchy, unordered principles and ordered search stages.
- Comparison uses one set of native description lists in service-first DOM order. Desktop dimension labels are decorative duplicates hidden from assistive technology; each value retains its own accessible term. Mobile reveals these same terms visually.
- Real anchors make complete route cards keyboard-operable; accessible link names identify their service.
- Keyboard traversal and visible focus checked. Existing contact and WhatsApp implementation retained.
- Automated axe WCAG A/AA scans at 390, 1024 and 1440px found zero violations, including contrast checks.
- Reduced-motion mode checked: no arrow movement and the existing site's effectively immediate 1ms transition reset.
- No screen-reader-specific manual session or Safari/Firefox rendering test was performed. Automated scans are not a complete WCAG certification.

## H. Engineering

Files changed or created by this task:

- `app/how-essential-resourcing-works/page.tsx`
- `src/lib/essential-approach.ts`
- `src/components/FourRouteSelector.tsx`
- `src/components/ServiceComparison.tsx`
- `src/components/EssentialApproach.module.css`
- `src/tests/unit/essential-approach.test.ts`
- `docs/HOW-ESSENTIAL-WORKS-PRODUCTION-REVIEW.md`

No new dependencies, client components, media downloads, CMS schema changes or global styles. Styles are scoped to the page/components and reuse existing colour/radius tokens.

Verification:

- Typecheck: passed.
- Lint: passed.
- Production build: passed; page statically rendered.
- Unit tests: 69 files, 404 tests passed, including six new focused tests.
- Rendered responsive checks: nine widths passed.
- Runtime console errors: none observed.
- Failed asset requests: none observed in the completed checks.
- Initial observed layout shift: 0 across all nine tested widths. This is local lab evidence, not field Core Web Vitals or a performance-score claim.
- No new page-specific JavaScript or heavy dependencies.

The QA driver initially waited for all background requests to become idle; this was changed to wait for page load and font readiness so unrelated prefetch activity did not stall the checks. The completed tests passed. No production configuration was changed to accommodate testing.

QA screenshots and machine-readable results from this session are in `/tmp/essential-approach-qa/`. No enquiries, WhatsApp messages or bookings were submitted.

## I. Visual QA

| Question | Result |
| --- | --- |
| Does this feel like the parent of the four service pages? | PASS |
| Does the selector communicate one problem and four possible routes? | PASS |
| Do the five principles read as principles, not chronological stages? | PASS |
| Is the search methodology useful without implying every service uses it? | PASS |
| Does the page remain recognisably Essential Resourcing? | PASS |

Inspected desktop, tablet and mobile screenshots of the hero, route selector, principles, comparison, methodology and technology/judgement treatment. The existing site palette and typography are preserved.

## J. Manual Review for David

Only subjective review remains:

- The overall page length and editorial rhythm.
- The visual balance of the 2 x 2 route selector.
- The density of the comparison and the lighter seven-stage presentation.

The working links, metadata, section counts and tested responsive behaviour do not need repeating manually.

## K. Final Status

**READY FOR REVIEW**

Review the local page at http://127.0.0.1:3020/how-essential-resourcing-works alongside the four approved service pages. Nothing has been pushed or deployed. The live Essential Resourcing website remains unchanged by this task.
