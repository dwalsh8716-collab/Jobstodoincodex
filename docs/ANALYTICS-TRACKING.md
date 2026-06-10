# Analytics and Tracking

Tracking is centralised and consent-gated.

## Environment Variables

- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_LINKEDIN_PARTNER_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`
- `NEXT_PUBLIC_CLARITY_ID`
- `NEXT_PUBLIC_HOTJAR_ID`
- `GOOGLE_SITE_VERIFICATION`

No tracking script loads when its env var is absent. Public tracking scripts also wait until the visitor accepts analytics.

## Events

`src/lib/analytics.ts` defines safe event names and payloads. It does not send names, email addresses, phone numbers or message content.

Current tracked actions:

- CTA clicks
- Book-a-call clicks
- Email clicks
- Phone clicks
- Contact form submissions
- Job application starts
- Job application submissions

Salary snapshot and insight download events are reserved in the utility for future downloads.
