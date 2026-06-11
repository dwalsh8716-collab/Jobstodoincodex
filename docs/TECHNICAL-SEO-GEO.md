# Technical SEO And GEO Notes

## Current SEO System

- Metadata source of truth: `src/lib/seo.ts`.
- Site/navigation config: `src/lib/site.ts`.
- Compatibility exports: `src/config/site.ts`, `src/config/seo.ts`, `src/lib/metadata.ts`.
- JSON-LD script helper: `src/components/SchemaScript.tsx`.
- SEO component wrappers: `src/components/seo/`.

No second metadata system has been introduced. The config files are thin exports over the existing implementation.

## Structured Data

The site emits:

- `ProfessionalService` / organisation schema in the root layout.
- `Person` schema for David Walsh in the root layout.
- `WebSite` schema in the root layout.
- `BreadcrumbList` schema through the shared breadcrumbs component.
- `Service` schema on service detail pages.
- `Article` schema on published insight pages.
- `FAQPage` schema through the shared FAQ component.
- `JobPosting` schema only on live job pages.
- `ItemList` schema on visible list pages where there are real public services, insights, live jobs, published case studies or published salary snapshots.

List schema is deliberately guarded. Draft proof, closed roles and unvalidated salary data are not marked up as public evidence.

## Crawl Files

- `app/sitemap.ts` uses the tested engine in `src/lib/sitemap-engine.ts` to
  include launch pages, services, published insights, published case studies,
  published salary snapshots, public salary guide pages when approved and live
  jobs only.
- Content marked `noIndex` in Sanity is excluded from the sitemap.
- Closed, expired, draft and candidate-unready jobs are excluded from the
  sitemap.
- `app/robots.ts` allows the public site and blocks `/studio`, `/cms`,
  `/admin`, `/labs`, `/client` and `/api`.
- `/rss.xml` lists published insights.
- `/llms.txt` and `/llms-full.txt` expose a concise AI-readable site map and expanded content map.

## GEO / AI Search

The insights hub includes crawlable answers to common senior hiring questions around Strategic Interim, retained search, senior marketing hiring failure, agency recruitment, Marketing Director briefs, interim leadership, candidate quality and North West salary context.

The priority is useful first-party content in David Walsh's tone, not keyword stuffing.

## Final Polish Roadmap

The launch audit, manual blockers and future SEO/GEO roadmap are tracked in:

```txt
docs/FINAL-POLISH-ROADMAP.md
```
