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

## Crawl Files

- `app/sitemap.ts` includes launch pages, services, published insights, published case studies, published salary snapshots and live jobs.
- `app/robots.ts` allows the public site and blocks `/studio`, `/cms` and `/api`.
- `/rss.xml` lists published insights.
- `/llms.txt` and `/llms-full.txt` expose a concise AI-readable site map and expanded content map.

## GEO / AI Search

The insights hub includes crawlable answers to common senior hiring questions around Strategic Interim, retained search, senior marketing hiring failure, agency recruitment, Marketing Director briefs, interim leadership, candidate quality and North West salary context.

The priority is useful first-party content in David Walsh's tone, not keyword stuffing.
