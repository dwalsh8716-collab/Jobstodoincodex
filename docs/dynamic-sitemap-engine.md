# Dynamic Sitemap Engine

Audit date: 11 June 2026

## Status

Implemented as an improvement to the existing sitemap, not a rebuild.

The site already had `app/sitemap.ts`, public Sanity/fallback content loaders
and robots pointing to `/sitemap.xml`. This pass moved the sitemap rules into a
small tested engine at `src/lib/sitemap-engine.ts`.

## What It Includes

The sitemap can include:

- homepage and public launch pages
- service hub and public service pages
- published insights
- published case studies
- published salary snapshots and public salary guide-style content
- active, candidate-ready live jobs only
- booking page when booking is configured
- `/salary-guides` only when `FEATURE_SALARY_GUIDE_GATE=true`

## What It Excludes

The engine defensively excludes:

- `/admin`
- `/api`
- `/cms`
- `/client`
- `/labs`
- `/studio`
- `/preview`
- malformed paths, query strings and hash URLs
- draft content
- content marked `noIndex` in Sanity
- closed jobs
- expired jobs
- jobs that fail the candidate-transparency/live-job checks

## Data Sources

Current sources:

- Sanity public content through `src/lib/public-content.ts`
- local public fallback content in `src/lib/content.ts`

Private candidate, application, shortlist and client records are not sitemap
sources. Postgres should only be used for public active jobs in future if the
project explicitly moves public job publishing there.

## Production Domain

The site URL is normalised from `NEXT_PUBLIC_SITE_URL`. A trailing slash is
removed before sitemap URLs are built, so this:

```bash
NEXT_PUBLIC_SITE_URL=https://www.essentialresourcing.co.uk/
```

still produces:

```txt
https://www.essentialresourcing.co.uk/services
```

not a double-slash URL.

## Tests

Coverage lives in:

- `src/tests/unit/sitemap-engine.test.ts`
- `src/tests/unit/launch-setup.test.ts`
- `src/tests/e2e/site.spec.ts`

The tests check public route inclusion, private route exclusion, noindex
exclusion, active-job-only behaviour, feature-gated salary guide inclusion,
booking-page inclusion and production URL normalisation.

## Manual Launch Check

After deployment:

1. Open `https://essentialresourcing.co.uk/sitemap.xml`.
2. Confirm URLs use the production domain.
3. Confirm private/admin/client/Labs URLs are absent.
4. Confirm closed and draft jobs are absent.
5. Submit the sitemap in Google Search Console.
