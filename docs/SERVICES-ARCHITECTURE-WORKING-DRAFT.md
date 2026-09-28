# Services Architecture: Working Draft

> Historical architecture draft. The final approved process concepts and copy are implemented in [Services Production Review](./SERVICES-PRODUCTION-REVIEW.md); use that review for the current page structure.

28 September 2026. Local preview for discussion; no production deployment.

## The Four Products

| Product | Client's situation | What Essential sells | URL |
| --- | --- | --- | --- |
| Permanent Recruitment | We know roughly what we need and want somebody permanently. | A focused specialist search with a success-based fee on appointment. | `/services/permanent-recruitment` |
| Retained Search | This hire really matters and we need to search the market properly. | A committed search mandate with deeper research, market coverage, direct approaches, calibration and assessment. | `/services/retained-search` |
| Fractional Leadership | We need senior capability, but not necessarily five days a week. | Search and selection for an embedded senior leader whose scope and time fit the problem. Essential finds the leader; it does not act as the leader. | `/services/fractional` |
| Market Intelligence & Advisory | We need to understand the market before deciding what to hire. | A defined piece of research and advice that helps the client decide whether and how to hire. | `/services/market-intelligence-advisory` |

Shared principle: **Start with the problem. Not the recruitment product.** The `/services` page now gives clients a compact way to recognise their situation before they explore the four product cards.

## Key Page Decisions

- **Permanent Recruitment:** Keep the H1, "Permanent marketing recruitment. Done properly." The process is six steps, including assessment beyond the CV and onboarding. A FAQ explains the contingency/success-based model in plain English.
- **Retained Search:** Keep the H1, "When the hire matters enough to search the market properly." The seven-step process now starts with a committed mandate and search definition, then covers mapping, engagement, evidence, selection and onboarding.
- **Fractional Leadership:** Keep the existing URL for continuity. Use "Fractional Leadership" in the service navigation and page title. The new H1 is "Senior marketing leadership. Just not necessarily five days a week." The seven-step process gives special weight to problem, model and mandate before search and engagement. It makes clear that Essential recruits the leader.
- **Market Intelligence & Advisory:** Keep the H1, "Before you recruit, make sure the brief actually stacks up." The six advisory areas appear near the top of the page. A separate five-step process explains how research leads to a decision, which may be not to hire yet.

The existing service-page framework remains: hero, audience/problem/use case, service fit, process, David's judgement, public recommendations, common mistakes, relevant published proof and insights, FAQs and contact. Advisory adds its six service areas immediately after the hero.

## Process Counts

| Product | Stages | Distinctive part |
| --- | ---: | --- |
| Permanent Recruitment | 6 | Focused search for a defined permanent vacancy, paid on appointment. |
| Retained Search | 7 | Committed mandate, research depth, market calibration and evidence. |
| Fractional Leadership | 7 | Define the problem, model and mandate before searching for the leader. |
| Market Intelligence & Advisory | 5 | Define a question, research the market, reality-check the evidence and decide what to do. |

The detailed `/how-essential-resourcing-works` page remains the shared methodology. Its copy can be reconciled with the new service-specific processes during the page-by-page rewrite.

## Visual Direction For The Next Pass

Keep the existing type, palette and spacing system. Render each process as real HTML text so it remains accessible and crawlable. On mobile, the numbered steps should read vertically. Permanent can stay a clean linear sequence; Retained should give research and assessment more visual weight; Fractional should group the first three scoping steps; Advisory should read as research leading to a decision. The service names should stay legible before any artwork is added.

The current local implementation uses one semantic ordered-list treatment with a distinct scoping treatment for Fractional. The finished visual treatment can be refined with the design prompt in the next stage without changing the content model or URLs.

## Copy And Commercial Decisions For Later

- Rewrite each page with David's approval, starting from its client's problem. Preserve the distinct commercial model for each service.
- Do not present Permanent Recruitment as an inferior version of Retained Search.
- Do not present Fractional Leadership chiefly as a cheaper CMO. The public offer is search and selection; an ongoing management/protection product remains undefined and is not promised on these pages.
- Keep Advisory practical and close to real hiring decisions. No implied guarantee that research must lead to recruitment.
- The shared service template takes these four pages' main copy from `src/lib/content.ts` even when a matching Sanity service document exists. The homepage service cards, by contrast, can be overridden by Sanity. The current local homepage still shows the older "Fractional" card from Sanity; the service navigation and service pages show "Fractional Leadership". Reconcile the Sanity homepage card when the final public wording is approved.
