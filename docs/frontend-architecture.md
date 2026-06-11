# Frontend Architecture

## Status

Next.js App Router is already in place and should be preserved.

This site is a public, SEO-led recruitment website with a protected CMS/admin
surface. Core public pages render on the server and do not depend on client-side
fetching for content.

## Route Structure

Public routes:

- `/`
- `/about-david-walsh`
- `/about-essential`
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
- `/contact`
- `/book-a-call`
- `/clients`
- `/candidates`
- legal and search routes: privacy, cookie policy, terms, sitemap, robots, RSS,
  `llms.txt` and `llms-full.txt`

Protected/private routes:

- `/cms`
- `/studio`
- `/admin`
- `/admin/labs`
- `/admin/recruiter-labs`
- `/admin/recruiter-labs/ai-ops`

Private routes are blocked from robots and excluded from sitemap output.

## Rendering Pattern

Use server components by default.

Client components are reserved for:

- navigation state
- forms
- analytics/consent interactions
- WhatsApp/booking click tracking
- deferred rich media
- embedded Sanity Studio

Core public content is fetched on the server through:

```txt
src/lib/public-content.ts
src/lib/sanity-content.ts
src/lib/sanity-queries.ts
```

The public site falls back to the local canonical content in `src/lib/content.ts`
when Sanity is not configured, empty or unavailable.

## Sanity Content Flow

Current flow:

```txt
Sanity public content
  -> central GROQ query
  -> server-only fetch helper
  -> mapper into current page type
  -> App Router page
```

Fallback flow:

```txt
Sanity unavailable
  -> local canonical content
  -> same App Router page
```

No private candidate/client data is fetched from Sanity.

## SEO Handling

SEO is handled in:

```txt
src/lib/seo.ts
```

Route metadata is generated server-side. Detail pages use the same public-content
loader as the page route so Sanity content can supply titles, descriptions and
slugs when configured.

Structured data exists for:

- organisation
- person
- breadcrumbs
- services
- articles
- jobs
- item lists
- FAQs where relevant

Draft jobs, draft proof and unvalidated public content stay out of sitemap
output.

## Preview And CMS

The embedded Studio is at:

```txt
/studio
```

The branded gate is:

```txt
/cms
```

Preview routes exist:

```txt
/api/preview?secret=...&path=/target-path
/api/preview/disable?path=/target-path
```

Set `SANITY_PREVIEW_SECRET` before using preview links in production.

## Private Data Boundary

Sanity is public CMS only.

Private candidate data, applications, CV metadata, DSAR records, audit logs,
shortlists, AI drafts and client operational notes belong in Railway
Postgres/private storage, not in Sanity.

## Manual Blockers

- Production Sanity project/dataset must be configured.
- Sanity editor/member access must be approved in Sanity Manage.
- Railway env vars must be set before Sanity-backed content is expected.
- Legal/privacy review is still required before named proof, testimonials or
  client case studies go live.
