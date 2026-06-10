# Essential Resourcing Go-Live Checklist

## Current Readiness

The site is close to launch from a build point of view. It has the public website, design system, logos, SEO/GEO routes, rich media components, CMS schemas, private CMS gate and embedded Sanity Studio.

Treat it as preview-ready now, not fully public-live until the items below are complete.

## Must Do Before Public Launch

- Add the real phone number.
- Add the correct LinkedIn URL.
- Add the booking URL, if calls should go through a booking tool.
- Configure `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` so forms send email.
- Create or connect the real Sanity project.
- Add `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_VERSION` and any required read token.
- Invite the editor users in Sanity.
- Change `CMS_GATE_USERNAME`, `CMS_GATE_PASSWORD` and `CMS_GATE_SECRET`.
- Review privacy policy, cookie policy and terms.
- Add cookie consent if analytics or remarketing tags are enabled.
- Replace placeholder/draft salary data with verified salary data.
- Replace draft case-study proof with approved outcomes.
- Add only testimonials and logos with permission.
- Add the final David Walsh portrait.
- Deploy to Vercel and connect `essentialresourcing.co.uk`.
- Run final QA on the live domain.

## CMS Choice

Recommended: keep Sanity.

Why: it is already installed, it supports structured content well, it is strong for SEO/GEO data, it can handle video and rich media, and it keeps the site flexible without turning every page into a loose drag-and-drop layout.

Choose Storyblok only if the priority becomes a more visual block editor and the extra monthly cost is acceptable.

Choose Payload only if full code ownership is more important than non-technical editor simplicity.

