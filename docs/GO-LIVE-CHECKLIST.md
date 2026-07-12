# Essential Resourcing Go-Live Checklist

## Current Readiness

The site is close to launch from a build point of view. It has the public website, design system, logos, SEO/GEO routes, rich media components, CMS schemas, private CMS gate and embedded Sanity Studio.

Treat it as preview-ready now, not fully public-live until the items below are complete.

## 12 July 2026 Status

Done:

- Railway production preview is live.
- WhatsApp is configured through the central site configuration.
- LinkedIn URL is configured.
- Google Calendar booking URL is configured.
- Resend/contact email variables are configured for
  `david@essentialresourcing.co.uk`.
- Sanity project `sle6d8y3` and dataset `production` are connected.
- GA4 direct measurement is configured with `G-PS0X1DFQ4D`.
- GTM is not set, deliberately avoiding duplicate analytics tags.
- Search Console property setup has been started.
- Public `/candidates` and `/candidate-privacy` pages are crawlable; private
  candidate token routes are blocked.

## Must Do Before Public Launch

- Add the real public phone number only if David wants phone shown on the site.
- Keep the LinkedIn URL current.
- Keep David's WhatsApp Business number and default message current.
- Keep WhatsApp Business Cloud API disabled until Meta setup, templates and consent wording are approved.
- Confirm the Google Calendar booking page still works on desktop and mobile.
- Send one final real contact-form enquiry and confirm email delivery.
- Keep the connected Sanity project as the single production project.
- Invite the editor users in Sanity.
- Set fresh `CMS_GATE_USERNAME`, `CMS_GATE_PASSWORD` and `CMS_GATE_SECRET`.
- Review privacy policy, cookie policy and terms.
- Review the Candidate Privacy Notice and candidate data journey.
- Confirm analytics consent wording and tracking requirements.
- Add the Search Console DNS TXT record at 123-reg or verify once final DNS
  points to Railway.
- Submit `https://essentialresourcing.co.uk/sitemap.xml` after Search Console
  verification.
- Link Search Console to GA4 after verification.
- Confirm any CV handling/storage is legally and technically safe before enabling uploads.
- Replace placeholder/draft salary data with verified salary data.
- Replace draft case-study proof with approved outcomes.
- Add only testimonials and logos with permission.
- Add the final David Walsh portrait.
- Deploy to Railway and test the Railway-generated URL first.
- Follow `docs/launch-handover.md` before treating the site as live.
- Follow `docs/123-reg-domain-switch.md` before changing 123 Reg DNS.
- Run final QA on the live domain.
- Keep `docs/FINAL-PRODUCTION-READINESS-AUDIT.md` with the launch record.

## CMS Choice

Recommended: keep Sanity.

Why: it is already installed, it supports structured content well, it is strong for SEO/GEO data, it can handle video and rich media, and it keeps the site flexible without turning every page into a loose drag-and-drop layout.

Choose Storyblok only if the priority becomes a more visual block editor and the extra monthly cost is acceptable.

Choose Payload only if full code ownership is more important than non-technical editor simplicity.
