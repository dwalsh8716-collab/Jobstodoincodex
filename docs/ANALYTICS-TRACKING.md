# Analytics and Tracking

Tracking is centralised and consent-gated.

Google Consent Mode V2 is initialised with privacy-first defaults before Google tags load, then updated when the visitor accepts, rejects or saves preferences.

## Environment Variables

- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_LINKEDIN_PARTNER_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`
- `NEXT_PUBLIC_CLARITY_ID`
- `NEXT_PUBLIC_HOTJAR_ID`
- `GOOGLE_SITE_VERIFICATION`

No tracking script loads when its env var is absent. Public tracking scripts also wait until the visitor accepts analytics.

If `NEXT_PUBLIC_GTM_ID` is set, the direct GA4 script is suppressed to reduce duplicate pageview risk. Configure GA4 inside GTM only once.

## Events

`src/lib/analytics.ts` defines safe event names and payloads. It does not send names, email addresses, phone numbers or message content.

Current tracked actions:

- CTA clicks
- Booking clicks through `booking_click`
- Email clicks
- Phone clicks
- WhatsApp clicks
- LinkedIn clicks
- Contact form submissions
- Contact form errors
- Job application starts
- Job application submissions
- Salary snapshot views

Salary snapshot and insight download events are reserved in the utility for future downloads.

Google Search Console, GA4, GTM, Google Business Profile, local SEO and launch monitoring setup is documented in:

```txt
docs/launch-google-seo-local-setup.md
```

Consent Mode V2 setup and QA is documented in:

```txt
docs/consent-mode-v2-setup.md
```
