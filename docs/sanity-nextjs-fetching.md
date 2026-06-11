# Sanity And Next.js Fetching

## Status

The Sanity fetch layer is server-only, cache-aware and fallback-safe.

It is designed for public website content only.

## Files

```txt
src/lib/sanity.ts
src/lib/sanity-content.ts
src/lib/public-content.ts
src/lib/sanity-queries.ts
src/lib/sanity-types.ts
src/content/fallback/index.ts
```

## Environment Variables

Public Sanity config:

```txt
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
NEXT_PUBLIC_SANITY_API_VERSION
```

Server read token, if required:

```txt
SANITY_READ_TOKEN
SANITY_API_READ_TOKEN
```

Preview secret:

```txt
SANITY_PREVIEW_SECRET
```

Do not commit tokens or secrets to GitHub.

## Fetch Flow

Public routes call loaders in:

```txt
src/lib/public-content.ts
```

Those loaders call:

```txt
sanityFetchWithFallback()
```

The helper:

- stays server-only
- checks whether Sanity is configured
- uses cache revalidation and tags
- returns local fallback content if Sanity is missing
- returns fallback content if Sanity returns nothing useful
- returns fallback content if Sanity errors

Default revalidation:

```txt
300 seconds
```

## Public Routes Using The Loader

- `/`
- `/services`
- `/services/[slug]`
- `/insights`
- `/insights/[slug]`
- `/case-studies`
- `/case-studies/[slug]`
- `/salary-snapshots`
- `/salary-snapshots/[slug]`
- `/jobs`
- `/jobs/[slug]`
- `/sitemap.xml`

## Content Mapping

Sanity documents are mapped into the current page types used by the site.

This avoids a big frontend rewrite and keeps existing cards, metadata, schema
and route components working.

Mapping examples:

- `service` -> `Service`
- `insight` -> `Insight`
- `caseStudy` -> `CaseStudy`
- `salarySnapshot` -> `SalarySnapshot`
- `job` -> `Job`

If Sanity content is partial, the loader fills gaps from local fallback content
where a matching slug exists.

## Drafts And Preview

Draft/public rules:

- insights render only when `status === "published"`
- case studies render only when `status === "published"`
- salary snapshots render only when `status === "published"`
- jobs render only when they are not draft
- live job schema is emitted only for genuinely live jobs

Preview mode exists through:

```txt
/api/preview
/api/preview/disable
```

Preview should only be enabled in production when `SANITY_PREVIEW_SECRET` is set.

## Token Safety

These files import `server-only`:

```txt
src/lib/sanity.ts
src/lib/sanity-content.ts
src/lib/public-content.ts
```

Do not import them into client components.

Do not expose `SANITY_READ_TOKEN` or `SANITY_API_READ_TOKEN` with a
`NEXT_PUBLIC_` prefix.

## Private Data Boundary

Do not fetch or store these in Sanity:

- candidate names submitted through forms
- candidate emails or phone numbers
- LinkedIn/profile URLs submitted through application forms
- CVs or CV URLs
- cover letters
- private client contacts
- shortlists
- AI drafts
- DSAR records
- audit logs

Those belong in private operations storage.

## Manual Setup

Before relying on live Sanity content:

1. Set Sanity env vars in Railway.
2. Confirm Sanity project/dataset in Sanity Manage.
3. Confirm CORS settings allow the deployed website.
4. Invite approved editors only.
5. Test `/studio` through `/cms`.
6. Publish one harmless test document.
7. Confirm the matching route renders with fallback still available.

No faff. Public content in Sanity. Private data elsewhere.
