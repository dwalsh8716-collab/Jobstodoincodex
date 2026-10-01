# Specialisms final upgrade

Review date: 1 October 2026. Scope: the Specialisms hub and its four detail pages only.

## A. Implementation summary

The hub now has four numbered market cards, the supplied job-title editorial section, client/candidate routing and a short Services bridge. All four detail pages use the existing shared template with market-specific copy, grouped role examples, brief questions, compact service routes, published reading and a candidate route independent of article availability.

Discovery corrected one assumption in the brief: all four live detail pages already had the richer shared architecture. This release extends that foundation rather than rebuilding it. Specialism wording is code-defined; related articles and case studies use the existing public-content integration. No Sanity documents or schemas were changed.

## B. Page-by-page summary

| Page | Preserved | Rewritten / added | Redesigned | Left alone |
| --- | --- | --- | --- | --- |
| Hub | H1 and supporting proposition | Four approved card descriptions; job-title editorial; audience routes; service bridge; first-person final CTA | Two-column numbered cards, editorial split, mobile stack | URL, metadata, global navigation/footer |
| Marketing & Leadership | Market coverage, original judgement paragraph, adjacent Digital link | Supplied hero, three territories, market context, six questions and closing | Numbered columns, compact hero, editorial hierarchy | URL, metadata, existing published reading |
| Digital, Performance & eCommerce | Hero copy, three groups, commercial questions, software/IT boundary | Explicit paid-social boundary and shared candidate/final CTA treatment | Numbered groups and family spacing | Original proposition and core brief questions |
| PR, Communications & Content | Agency/client-side coverage, judgement paragraph, Digital boundary | Supplied hero, three territories, context, seven questions; four service routes | Horizontal territory rows, mobile vertical groups | URL, metadata, existing Salary Guide link |
| Agency Client Services & Leadership | Original judgement/questions and published Havas proof | Supplied hero, expanded role territories and commercial context; relevant published agency article | Horizontal role groups, shared editorial hierarchy | Havas source content, URL and metadata |

## C. Copy changes

Material additions are listed above. The supplied PR fragments are joined into natural paragraphs rather than displayed one word per line. The hub uses the explicit "Can't see your exact job title?" CTA from section 15, rather than the optional alternative in section 36. Existing approved service summaries are retained. British English, first-person David wording and useful existing copy are preserved; no new outcomes, salary claims or testimonials were invented. The published Havas source excerpt remains unchanged.

## D. Design system

Existing tokens, typefaces, surfaces and buttons remain. Specialism cards use restrained numbering and fine accent rules, distinct from the Services product cards. Marketing/Digital use columns; PR/Agency use rows for longer discipline and role labels. Editorial prose remains unframed. Services are compact text links; existing InsightCard and CTASection components are reused without global edits. All groups stack on mobile. One visual language, with market-specific presentation.

## E. Files changed

- `app/specialisms/page.tsx`: hub structure and supplied copy.
- `app/specialisms/[slug]/page.tsx`: shared detail rendering, relevant published reading, independent candidate route and CTAs.
- `src/lib/specialism-editorial.ts`: existing specialism editorial source extended with hero, hub and market-context copy; role groups and questions updated.
- `src/components/SpecialismPage.module.css`: locally scoped hub/detail styling and responsive rules.
- This report: implementation record and QA caveats.

## F. Responsive QA

Chrome production-build checks: all five pages at 320, 375, 390, 430, 768, 1024, 1280 and 1440px. One H1 each; no detected horizontal overflow or clipped heading/list/card containers. Desktop full-page screenshots and mobile hero screenshots reviewed; tablet heroes and mobile role rows reviewed. No broken grids or accidental empty fixed-height text containers observed. Desktop groupings recompose vertically on mobile. The existing mobile quick-contact bar is unchanged and hides during scrolling.

## G. Accessibility

Practical review, not a full WCAG certification. H1/H2/H3 hierarchy and semantic lists retained. Links are native anchors with no nested interactive targets. Keyboard traversal produced the existing visible 3px focus outline. Primary actions remain large touch targets. Existing contrast tokens and reduced-motion rules are retained; no new animation was introduced. Responsive reflow checked down to 320px. Screen-reader and separate browser-zoom testing were not performed.

## H. SEO / GEO

All five rendered pages have unique existing titles and descriptions, correct self-referencing production canonicals, Open Graph title/description/URL/image and valid parseable JSON-LD. Existing BreadcrumbList, ProfessionalService (including David Walsh founder relationship) and WebSite entities remain. No noindex was introduced. All five pages are present in the sitemap and use real HTML content. Geography and relevant markets remain visible without keyword stuffing. Indexing or AI citation is not guaranteed by these checks.

All 18 distinct internal page destinations used by the five pages returned HTTP 200 in the production preview. Candidate anchor navigation was clicked and its target verified. WhatsApp URL and number were inspected; no message or form was submitted.

## I. Engineering

Typecheck: PASS. Lint: PASS. Production build: PASS. Diff whitespace check: PASS.

New dependencies: NO. Shared Specialism template changed: YES, affecting only the four detail routes. Shared global components changed: NO. Jobs/distribution infrastructure changed: NO. No new client-side JavaScript or external assets were added. Existing Havas logo loaded successfully after scrolling into its section. No console errors were captured during the reviewed page journeys. No performance benchmark or cross-browser certification was performed.

Whole-repository checks found unrelated existing caveats, not hidden as passes:

- Unit suite: 422 passed, 1 failed. `candidate-process-timeline.test.ts` expects "To be confirmed" when the existing component omits unconfirmed optional facts. The test and component are unchanged by this release.
- Existing SEO audit checked 43 routes; its one failure expects `Disallow: /client`. The current live robots file also lacks this rule. No robots/authentication/private-route changes were made in this scoped Specialisms release. Review separately without accidentally blocking `/clients`.

Homepage, Services, Clients, Candidates and Jobs were opened for heading/overflow regression checks; no overflow was detected. Their source and styling remain unchanged.

## J. Visual QA

PASS: hub hierarchy; coherent detail-page family; distinct market presentation; distinction from Services; scannable role groups; David-style copy; restrained decoration; mobile recomposition. These are visual review judgements, not promises of subjective preference.

## K. Cross-page consistency

PASS. Specialisms describes markets; Services describes hiring approaches. Existing Jobs, Insights and Case Studies destinations provide current vacancies, context and evidence. No duplicate product architecture, new CTA system or global design system was introduced.

## L. Manual review for David

Optional only: the balance of Agency client-service and leadership examples, and the hub's two-paragraph card density. No manual publishing action is required.

## M. Final status

READY FOR PRODUCTION for this scoped Specialisms release. Railway deployment and live-page verification are reported in the delivery message after publication. The unrelated test caveats above remain outside this change.
