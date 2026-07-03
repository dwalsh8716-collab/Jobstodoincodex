# Performance And Core Web Vitals Audit

Status: production preview performance is in good shape, with no obvious layout-shift or bundle-size blocker found in the audited build.

This is an engineering performance review, not a field-data guarantee. Real Core Web Vitals must still be checked after the final domain, analytics, cookie consent and production traffic are live.

## 1. Performance Summary

The build is already lean for a content-led recruitment site:

- Next.js App Router renders the main public pages as static or revalidated server output.
- Public client JavaScript is budgeted and currently small for the surface area.
- `next/font` handles font loading with `display: swap`.
- `next/image` is used for the main visual assets.
- Analytics and marketing scripts are consent-gated and do not load by default.
- The local production QA crawler found zero horizontal overflow or browser failures across desktop, tablet and mobile.

Implemented in this pass:

- tightened the public JavaScript budget from 180KB to 120KB gzip
- tightened the per-route client budget from 120KB to 80KB gzip
- enabled AVIF/WebP image formats in Next image optimisation
- increased remote image cache TTL from 4 hours to 24 hours
- lowered homepage editorial image quality to 75
- reduced the below-fold Manchester image source width from 2400px to 2000px
- added explicit high-priority fetch hint to the homepage LCP image
- changed reveal animations to use one shared `IntersectionObserver`
- bypassed reveal observers completely for users who prefer reduced motion

## 2. Core Web Vitals Risks

### LCP

Primary risk: the homepage editorial image can become the LCP candidate on visual loads.

Mitigation now in place:

- priority image loading
- explicit `fetchPriority="high"`
- controlled responsive sizes
- lower remote source quality
- AVIF/WebP output enabled
- longer Next image cache TTL

### CLS

No obvious layout shift issue was found in the audited build.

Mitigation already in place:

- fixed image dimensions or `fill` inside stable containers
- stable button sizing
- mobile sticky CTA is fixed, not injected into flow
- production crawler checks for horizontal overflow across 84 viewport runs

### INP

Primary risk: too many small client-side observers or third-party scripts.

Mitigation now in place:

- reveal effects use one shared observer rather than creating one observer per reveal block
- reduced-motion users skip the reveal observer completely
- analytics and marketing scripts remain consent-aware
- public client bundle budget is tighter

## 3. Image Optimisation Recommendations

Implemented now:

- use AVIF and WebP where supported
- keep LCP image priority and high fetch priority
- keep below-fold images lazy
- use quality 75 for editorial imagery unless there is a real visual reason not to
- avoid adding uncompressed CMS images without width/height metadata

Still required in production:

- review Sanity uploads for oversized images
- use descriptive alt text without stuffing keywords
- avoid autoplaying video or heavy embeds above the fold
- keep social images compressed and versioned

## 4. Font Optimisation Recommendations

Current setup is good:

- fonts are loaded through `next/font`
- `display: swap` is configured
- only Latin subsets are used
- headings and body fonts are defined centrally

No alteration is needed for launch.

Future watch-out: do not add extra font families for campaign pages unless there is a strong brand reason and the budget is rechecked.

## 5. JavaScript And CSS Improvements

Implemented now:

- tighter JavaScript budgets
- shared reveal observer
- reduced-motion short-circuit for reveal effects
- continued consent-gating for analytics and marketing scripts

Current evidence:

- `npm run performance:budget` reports unique public client JavaScript well below the new 120KB gzip ceiling.
- The heaviest current public routes are far below the new 80KB route ceiling.

CSS is centralized and token-based. No separate CSS bloat blocker was found.

## 6. Mobile Performance Issues

No obvious mobile blocker was found in the audited build.

Mobile strengths:

- no horizontal overflow in production QA
- stable mobile CTA positioning
- compact public client JavaScript
- lazy below-fold imagery
- reduced-motion support

Mobile risks to keep watching:

- large future CMS images
- embedded video or third-party widgets
- adding more client-only components to public pages
- analytics, heatmap or advertising tags if added without restraint

## 7. Prioritised Fixes

Completed:

1. Tighten public bundle budgets.
2. Improve image format, cache and LCP hints.
3. Reduce reveal animation observer cost.
4. Keep reduced-motion users off the reveal observer path.
5. Document Core Web Vitals risks and launch checks.

Next manual checks before final domain switch:

1. Run Lighthouse on the Railway URL and final domain.
2. Check Chrome UX Report/PageSpeed Insights once the live domain has traffic.
3. Test on a real mobile connection, not only desktop Wi-Fi.
4. Recheck after GA4/GTM, Search Console and email/form production variables are final.

## 8. Final Performance Checklist

- [x] Production build passes.
- [x] Public bundle budget passes.
- [x] Public bundle budget tightened.
- [x] Homepage LCP image has priority and high fetch priority.
- [x] Next image output supports AVIF and WebP.
- [x] Remote image cache TTL improved.
- [x] Below-fold homepage image remains lazy.
- [x] Reveal animations use one shared observer.
- [x] Reduced-motion users bypass reveal observers.
- [x] No horizontal overflow found in production QA.
- [x] No obvious layout shift blocker found.
- [x] Performance audit documented.
- [ ] Lighthouse check on Railway URL.
- [ ] Lighthouse check after final DNS switch.
- [ ] Real mobile smoke test after final tracking and consent configuration.
- [ ] Field Core Web Vitals review after the domain has real traffic.
