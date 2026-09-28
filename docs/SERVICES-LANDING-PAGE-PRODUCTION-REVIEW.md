# Services Landing Page: Implementation Review

Preview: http://127.0.0.1:3021/services

Status: READY FOR REVIEW. Implemented locally; this landing-page update has not been pushed or deployed.

## A. Implementation Summary

Removed the redundant standalone route selector. One reusable four-service product grid now combines the approved service names, propositions, client thoughts, descriptions and links. Added hero contact actions, the five-principle How Essential Works bridge and the revised final CTA. Preserved the location wording and existing production contact implementation.

## B. Page Architecture

Breadcrumb → Hero → Four Service Cards (including the connected “Still not sure? Good.” closing) → How Essential Works → Location / Coverage → Final CTA.

## C. Service Cards

All four use the brief's approved copy and destinations:

| Service | Destination | Result |
| --- | --- | --- |
| Permanent Recruitment | /services/permanent-recruitment | PASS |
| Retained Search | /services/retained-search | PASS |
| Fractional Leadership | /services/fractional | PASS |
| Market Intelligence & Advisory | /services/market-intelligence-advisory | PASS |

The grid uses two columns at tablet/desktop widths and one below 741px. Cards have natural content height, restrained border/background feedback, a visible directional link and a single accessible link per card.

## D. Navigation

Desktop and mobile Services menus already matched the approved names and URLs. Six browser checks passed across /services, /services/fractional and /how-essential-resourcing-works. Menu links are visible and View all Services navigates correctly. No URL migration or redirects were introduced.

## E. SEO / GEO

- Title and meta description preserved exactly as requested.
- One H1; logical H2/H3 hierarchy.
- Canonical remains https://essentialresourcing.co.uk/services, with no noindex directive.
- Breadcrumb JSON-LD and the existing ItemList parse correctly; all four approved names appear in the service list.
- Eight unique internal destinations returned 200, including all services, the approach page and contact.
- Sitemap contains the canonical route. robots.txt, sitemap.xml, rss.xml, llms.txt and llms-full.txt returned 200.
- Manchester, North West and UK coverage wording preserved.

## F. Accessibility

Three axe scans (390px, 768px and 1440px) reported zero violations for the selected WCAG A/AA rules. Verified keyboard focus, accessible service-link names, no nested controls, native list structure, contrast, responsive reflow and reduced-motion behavior. A 200% CSS zoom check at a 1280px viewport found no overflowing content. This is a practical automated/browser check, not an independent accessibility certification.

## G. Engineering

Materially changed files:

- app/services/page.tsx: approved page structure, copy, actions and service-list data.
- src/components/ServiceProductCards.tsx: reusable server-rendered service cards.
- src/components/ServicesLanding.module.css: scoped responsive styles using existing palette, radius and container tokens.
- app/globals.css: removed the superseded landing-page styles and their unused responsive rules; other page selectors retained.
- docs/SERVICES-LANDING-PAGE-PRODUCTION-REVIEW.md: this report.

No dependencies added. No new client component or animation library. Existing public service-title loading retained. The earlier SERVICES-LANDING-PAGE-COPY-REVIEW.md remains a pre-change copy snapshot.

Typecheck, lint, production build and the performance budget passed. Public client JavaScript remains within the existing budget at 66KB gzip. No page errors, console errors or failed HTTP asset responses were detected in the local QA pass. Initial measured CLS was 0 at the tested widths; this is a lab observation, not field Core Web Vitals data.

## H. Visual QA

Chromium widths: 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920px. All passed overflow, clipping and grid checks. Screenshots were visually inspected on mobile, tablet and desktop.

- Entry point to the four-service system: PASS.
- Cards visually related to the individual service pages: PASS.
- Repeated standalone route section removed: PASS.
- Approach bridge provides context and a working internal link: PASS.
- Recognisably Essential Resourcing: PASS.

## I. Manual Review for David

Review the visual weight of the numbered cards, the restrained red quote rule and the overall page rhythm. Technical checks above are complete. No form submissions or WhatsApp messages were sent.

## J. Final Status

READY FOR REVIEW.

Local preview is running at http://127.0.0.1:3021/services. Production publication has not been performed for this update.
