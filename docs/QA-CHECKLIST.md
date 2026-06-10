# QA Checklist

## Automated Gate

Run `npm run verify` before release. It covers linting, TypeScript, Vitest, production build, public client bundle budget and Playwright e2e tests.

Individual commands:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run performance:budget`
- `npm run test:e2e`

## Manual Pass

- Homepage loads with one clear H1.
- Header navigation works on desktop and mobile.
- Footer links work.
- Contact form validates required fields and returns a safe success or error.
- Services, Strategic Interim, insights, jobs, case studies and salary snapshots load.
- 404 page is useful and has a route back.
- Sitemap, robots, metadata, Open Graph and JSON-LD output are present.
- Console is free of unexpected errors.
- Keyboard focus states are visible.
- Images and video posters load without layout shift.
