# Four Service Pages: Production Review

28 September 2026. Local production build on `main`. Status: **READY FOR REVIEW**.

Preview: [Permanent Recruitment](http://127.0.0.1:3020/services/permanent-recruitment), [Retained Search](http://127.0.0.1:3020/services/retained-search), [Fractional Leadership](http://127.0.0.1:3020/services/fractional), [Market Intelligence & Advisory](http://127.0.0.1:3020/services/market-intelligence-advisory).

## A. Implementation Summary

Implemented the final supplied copy and four distinct process concepts in the existing shared service-page layout. The shared three-card overview now uses short approved summaries, editorial numbering, a restrained charcoal rule and the established palette.

- Permanent: three connected chapters containing six stages.
- Retained: seven-stage timeline, including separate Longlist and Shortlist stages.
- Fractional: two connected leadership territories, followed by a quieter seven-step list.
- Advisory: five evidence sources converging on Decision, followed by six investigation workstreams.

The hero, market-fit, judgement and final CTA copy follows the production brief. Fractional's title and meta description have been updated exactly as supplied. Existing recommendations, approved Havas proof, related-content logic and other FAQs remain. The first Retained FAQ now compares Retained Search with Permanent Recruitment.

## B. Files / Components Changed

| File | Change and reason |
| --- | --- |
| `src/components/ServiceOverviewCards.tsx` | New reusable three-card overview; presents the approved summaries consistently. |
| `src/components/ServiceProcess.tsx` | Four distinct server-rendered process treatments; HTML carries all meaningful text. |
| `src/components/ServicePresentation.module.css` | Scoped component styles and responsive transformations using existing brand variables. |
| `app/services/[slug]/page.tsx` | Integrates the components, renders paragraph breaks, uses the approved WhatsApp label and passes through the final CTA destination. |
| `src/lib/content.ts` | Approved service copy, stage data, overview summaries, CTAs, Retained FAQ and Fractional metadata. |
| `src/lib/types.ts` | Typed content fields for Fractional territories, evidence sources and advisory workstreams. |
| `src/lib/public-content.ts` | Preserves the new content fields through the existing service mapper. |
| `app/globals.css` | Removes the superseded draft process/advisory rules; the new styles are scoped to their components. Earlier Services route-chooser styles remain. |
| `docs/SERVICES-ARCHITECTURE-WORKING-DRAFT.md` | Marks the earlier architecture draft as historical and points to this review. |
| `docs/SERVICES-PRODUCTION-REVIEW.md` | This implementation and QA record. |

The earlier local architecture work was preserved in `app/services/page.tsx`, `app/how-essential-resourcing-works/page.tsx`, `src/lib/homepage-content.ts`, `src/lib/site.ts`, `src/tests/unit/sanity-fetching.test.ts` and `docs/services-pages-copy-reference.md`. Those changes were already present when this implementation began and are included in the tested local build.

## C. Permanent Recruitment

Hero, three-card overview, market-fit copy, judgement and final CTA updated. All six approved stages are present under **Understand**, **Find** and **Get it right**. The unapproved "Land" label is absent.

Wide desktop uses three chapters with two columns per chapter. Tablet keeps the three chapter headers with their stages stacked underneath. Mobile stacks all three chapters vertically. Copy and responsive checks passed. No substantive deviation from the brief.

## D. Retained Search

All seven stages are present in the required order:

1. Get the brief right
2. Map the market
3. Approach
4. Steer & calibrate
5. Longlist
6. Shortlist
7. Hire

The supplied methodology was reviewed and its briefing, research, approaching, steering, longlist, shortlist and hire logic is retained. No training artwork was reproduced.

The timeline is horizontal from 1200px, wraps 4 + 3 below that, and becomes vertical at 740px and below. Desktop, tablet and mobile composition and copy passed review. The revised FAQ preserves Permanent Recruitment as a valid commercial choice. No substantive deviation.

## E. Fractional Leadership

The public service title is **Fractional Leadership** and the existing `/services/fractional` URL is retained. Hero and CTAs use the approved copy.

**Define the leadership need** and **Find the right person** form the main visual. The supporting seven-step process follows immediately below. The Fractional / Interim / Advisory / Consultancy explanation is updated, with natural paragraph grouping.

Wide desktop uses two connected rounded territories. Below 1200px they stack, avoiding text crowding at their curved edges; narrow mobile uses connected editorial panels. This is the responsive transformation allowed in the brief. No substantive deviation.

## F. Market Intelligence & Advisory

The five evidence nodes are **Market Mapping**, **Salary Intelligence**, **Talent Availability**, **Competitor Intelligence** and **Hiring Feasibility**. All point towards **Decision**. The closing line is "A clearer picture. A better hiring decision."

The desktop/large-tablet radial layout becomes a stacked evidence flow below 981px. The six investigation modules follow as an unnumbered workstream grid: 3 columns on desktop, 2 on smaller tablets and 1 on mobile. They are not presented as sequential steps.

The commercial reality-check copy and existing related material are preserved. No substantive deviation.

## G. Shared Three-Card Component

Three cards are retained on every page: **Who it's for**, **What it solves** and **When it makes sense**. The treatment uses large red editorial numbers, small clear labels, generous reading space, a charcoal top rule and existing surface/border tokens. No new icons or colours.

Desktop shows one three-card row; tablet can use 2 + 1; mobile uses one card per row. These are informational cards, so no misleading click or keyboard-focus behaviour was added. Contrast and reflow checks passed; existing interactive links retain focus styling.

## H. Accessibility

- One H1 per page; ordered process lists and logical heading hierarchy.
- All important text is selectable HTML. Connectors are decorative and hidden from assistive technology.
- Natural DOM order is preserved when layouts change.
- Automated axe checks at 390px and 1440px found no violations for the configured WCAG A/AA rules.
- FAQ opening/closing with the keyboard and visible CTA focus passed.
- All eight requested widths passed overflow and text-bound checks.
- Reduced-motion mode keeps every new component visible; the new process components have no animations.

Automated scans do not establish full WCAG certification. A dedicated screen-reader session and physical-device Safari testing were not performed.

## I. SEO / GEO

All four routes returned 200 in the local production build. Each has one H1, title, meta description, the correct production-domain self-canonical and no accidental `noindex`. Existing breadcrumb and structured-data output remains, and JSON-LD parses successfully.

All process text is server-rendered HTML. The 24 unique internal destinations found in the service-page content returned 200. All four services remain in `sitemap.xml`; `robots.txt`, `rss.xml`, `llms.txt` and `llms-full.txt` also returned 200.

No URLs, redirects, indexing settings or schema strategy were changed.

## J. Performance / Engineering

- New dependencies: **No**.
- New client-side JavaScript for the components: **None**. They are Server Components with CSS and one lightweight decorative SVG.
- No reference PNGs, new webfonts, charting packages or animation libraries are loaded.
- Typecheck, lint and production build passed; **68 test files / 398 tests passed**.
- No browser console errors or failed asset responses in the completed QA run. A small number of Next.js prefetch requests were cancelled when the test navigated to another page; their destination pages were checked successfully.
- Observed initial layout shift was 0 in this local automated run. This is not a field Core Web Vitals result or a claimed Lighthouse score.

Testing covered Chromium at **320, 375, 390, 430, 768, 1024, 1280 and 1440px**. Component screenshots and the machine-readable audit are in `/tmp/essential-service-qa/`. Component captures omit fixed navigation to reveal the entire component; hero viewport captures retain the normal interface.

The existing service data architecture remains code-led: these pages' approved copy comes from `src/lib/content.ts`, including when matching Sanity records exist. Production Sanity documents were not changed, and this work does not add new Studio editing controls. The earlier homepage-card Sanity override remains a separate publication consideration recorded in the architecture draft.

## K. Visual QA

| Design intent | Result |
| --- | --- |
| Permanent: three chapters / six stages | PASS |
| Retained: seven-stage editorial timeline | PASS |
| Fractional: two connected territories plus quieter detail | PASS |
| Advisory: evidence converges on Decision | PASS |
| Shared Essential typography, palette and visual family | PASS |

The tablet Fractional composition was refined after visual review so its copy stays comfortably within the rounded forms.

## L. Manual Review For David

The remaining review is visual preference: the weight of the dark Permanent chapter headers, the size of the Fractional territories and the prominence of the Decision node. Preview links are at the top of this report.

No form, booking or WhatsApp message was submitted during QA.

## M. Final Status

**READY FOR REVIEW**

The local production preview is running at `http://127.0.0.1:3020`. These changes have not been committed, pushed or deployed. The live Essential Resourcing website and production CMS remain unchanged by this pass.
