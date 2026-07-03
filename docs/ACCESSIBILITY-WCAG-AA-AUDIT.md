# Accessibility WCAG AA Audit

Status: no obvious WCAG AA blocker remains in the audited build.

This is an engineering accessibility review, not a legal certification. It covers the public website, contact routes, cookie consent layer and launch QA gates. A specialist manual audit with assistive technology is still the right final step before a major public launch.

## 1. Accessibility Summary

The site already has the right accessibility foundations for a production recruitment website:

- semantic page structure with a single public `main` landmark and one H1 per route
- a visible skip link to jump straight to the main content
- keyboard-reachable header, footer, CTA, form and consent controls
- visible focus states using the central design tokens
- labelled form fields, required states, live status messages and honeypot fields removed from the tab order
- plain-English form and consent copy
- reduced-motion support for smooth scroll, reveal effects and ticker motion
- mobile touch targets sized for practical use
- no public candidate CV upload until secure storage is ready

The automated gate now includes axe WCAG A/AA checks on the highest-risk public pages and the production QA crawler now fails if the skip link is removed.

## 2. Critical Issues

No critical accessibility issue remains after this pass.

Fixed in this pass:

- The production QA crawler already recorded whether a skip link existed, but it did not fail the run if the skip link disappeared. That is now a hard failure.
- The browser test suite now runs axe WCAG A/AA checks across key public routes, including homepage, services, client/candidate pages, jobs, contact, cookie policy and privacy policy.
- The homepage definition list now uses valid `<dl>` structure. The previous reveal wrapper added an extra `<div>` between the list wrapper and the `<dt>` / `<dd>` pair.
- The decorative homepage process number has moved out of the DOM and into CSS, so it keeps the visual treatment without creating a low-contrast text node.
- Small accent text, muted copy on stone sections and form-note links now use readable token-based colours that meet the automated WCAG AA contrast gate.

## 3. WCAG AA Risks

Remaining risks are practical launch risks, not current known blockers:

- Cookie consent is technically accessible and usable, but final legal wording and CMP suitability still need review before launch.
- Rich content added through Sanity can still create accessibility debt if editors use vague link text, missing image alt text, skipped headings or pasted formatting.
- Future media embeds need human-checked captions, transcripts or equivalent text where required.
- Future charts, dashboards and private Labs tools need their own keyboard and screen reader testing before being made public or business critical.

## 4. Keyboard Navigation Findings

PASS.

Keyboard users can reach:

- skip link
- header navigation
- service dropdown via focus
- mobile menu toggle
- primary CTAs
- WhatsApp, booking and contact links
- forms and consent checkboxes
- footer links
- cookie preference controls

The site keeps focus outlines visible. The mobile menu opens and routes correctly in Playwright. The cookie preference panel focuses the first actionable control when opened and supports Escape once preferences already exist.

No alteration is needed for the current public launch surface.

## 5. Screen Reader Concerns

PASS WITH EDITORIAL DISCIPLINE REQUIRED.

Current code uses named landmarks, labelled controls, live status regions and hidden text for visual-only patterns such as ticker content and toggle labels.

Watch-outs:

- Sanity editors must write meaningful image alt text.
- Link text should stay specific. Avoid vague CMS copy such as "click here".
- Decorative imagery should remain empty or `aria-hidden` where appropriate.
- Future private tools should not rely on colour alone for status.

## 6. Colour And Contrast Issues

PASS after fixes.

The current premium palette is preserved. No Manchester palette change has been made.

Focus outlines, button states and form focus states use central tokens. The axe WCAG AA checks now guard the key public pages for obvious contrast failures.

Fixed during this pass:

- small red eyebrow text on muted stone backgrounds
- muted lede copy on muted stone backgrounds
- yellow form-note and consent links on light panels

Manual visual review should still happen on production hardware for:

- cookie banner over page content
- WhatsApp and booking CTAs
- form error/success states
- mobile sticky CTA
- Sanity-authored images and rich text

## 7. Form Accessibility Issues

PASS.

The contact, candidate and job enquiry forms use visible labels, required fields, clear consent text, status messages with `role="status"` or `role="alert"`, and no insecure CV upload.

The honeypot field is hidden from assistive technology and removed from keyboard navigation. Candidate data copy remains plain English and avoids fake reassurance.

No alteration is needed for the current form layer.

## 8. Recommended Fixes

Implemented now:

- Make missing skip link fail production QA.
- Add axe WCAG A/AA coverage to Playwright for the main public journeys.
- Document the remaining manual accessibility checks in this audit.
- Keep the existing colour palette and token system intact.

Recommended before final domain switch:

- Run a short manual screen reader smoke test on homepage, services, contact, jobs and cookie preferences.
- Review Sanity content for heading order, link text and image alt text.
- Re-test with a real mobile device after DNS and analytics IDs are live.
- Treat any new public Labs route as a fresh accessibility surface, not covered by this public-site pass.

## 9. Implementation Checklist

- [x] Skip link present in root layout.
- [x] Skip link is now enforced by the production QA crawler.
- [x] Focus states are visible through central CSS tokens.
- [x] Reduced-motion preference is respected.
- [x] Header navigation and service dropdown are keyboard reachable.
- [x] Mobile navigation is covered by Playwright.
- [x] Forms have labels, consent copy and live status messaging.
- [x] Cookie preference controls are reachable and plain English.
- [x] Axe WCAG A/AA checks run across key public routes.
- [x] Homepage definition list structure corrected.
- [x] Decorative low-contrast process number removed from the DOM.
- [x] Small accent text and form-note links corrected for AA contrast.
- [x] No obvious WCAG AA blocker remains.
- [ ] Final assistive-technology smoke test with real screen reader before public launch.
- [ ] Legal/privacy review of cookie and privacy wording before public launch.
- [ ] Editor training for image alt text, headings and specific link text in Sanity.
