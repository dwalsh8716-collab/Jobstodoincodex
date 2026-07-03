# QA Checklist

## Automated Gate

Run `npm run verify` before release. It covers linting, TypeScript, Vitest,
production build, public client bundle budget and Playwright e2e tests.

Then run the production QA crawler against either local production preview or
the Railway URL:

```bash
npm run qa:production -- --base=http://127.0.0.1:3000
npm run qa:production -- --base=https://web-production-ba3b9.up.railway.app
```

The crawler checks sitemap routes, required launch assets, canonical redirects,
404 behaviour, internal links, desktop/tablet/mobile rendering, console errors,
page errors, horizontal overflow, visible broken images, main landmarks, H1
counts and unlabeled visible controls. It writes JSON evidence to `.qa/`, which
is intentionally ignored by Git.

Individual commands:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run performance:budget`
- `npm run test:e2e`
- `npm run qa:production -- --base=<preview-or-production-url>`

## Manual Pass

- Homepage loads with one clear H1.
- Header navigation works on desktop, tablet and mobile.
- Mobile menu opens, closes and routes without trapping focus.
- Footer links work.
- Contact form validates required fields and returns a safe success or error.
- Services, Strategic Interim, insights, jobs, case studies, salary snapshots
  and salary guide pages load.
- 404 page is useful and has a route back.
- Sitemap, robots, metadata, Open Graph and JSON-LD output are present.
- Console is free of unexpected errors.
- Keyboard focus states are visible.
- Cookie banner is keyboard usable; accept, reject and manage preferences work.
- No analytics cookies are set before consent where consent is required.
- Images and video posters load without layout shift.
- Legal/privacy copy has been reviewed by a qualified person.
- WhatsApp, LinkedIn, booking and email routes work on mobile.
- Contact form email delivery is tested with the real inbox once Resend is live.
- CMS login, `/studio`, Sanity CORS and editor access are tested.
- Search Console, GA4 Realtime and Consent Mode V2 are tested after Google IDs
  are set.
- DNS is switched only after Railway URL, CMS, booking, analytics consent and
  email checks are green.
