# Sanity CMS Audit

Audit date: 11 June 2026

## Status

Amber.

The codebase has a strong Sanity setup for public content, but production readiness still depends on account-side setup in Sanity and Railway.

## What Exists

Files:

- `sanity.config.ts`
- `sanity.cli.ts`
- `sanity/schemas/index.ts`
- `sanity/studioStructure.ts`
- `app/studio/[[...tool]]/page.tsx`
- `app/cms/page.tsx`
- `src/lib/sanity.ts`
- `src/lib/sanity-content.ts`
- `src/lib/public-content.ts`
- `src/lib/sanity-queries.ts`
- `src/lib/sanity-types.ts`

Studio routes:

- `/cms` is the branded login gate.
- `/studio` is the embedded Sanity Studio.

The Studio is protected by the CMS session gate and marked noindex.

## Public Document Types

Sanity document types found:

- site settings
- homepage
- navigation
- page
- service
- public job advert
- insight/article
- case study
- salary snapshot or salary guide landing page
- testimonial
- FAQ
- person/author
- CTA block
- proof item
- redirect

## What David Can Edit

Sanity is prepared for:

- pages
- services
- jobs
- insights
- case studies
- salary snapshots
- testimonials/proof
- FAQs
- people/authors
- navigation/footer/site settings
- booking and WhatsApp settings
- SEO titles and descriptions
- media with alt text

## Private Data Boundary

Sanity is public CMS only.

The audit found no Sanity document type for:

- candidates
- applications
- CV files
- data subject requests
- audit logs
- client shortlists
- WhatsApp messages
- private AI prompts
- interview transcripts

The only `transcript` field found in Sanity is a public video accessibility transcript field, not an interview transcript.

## Fetching

Public pages now use the server-only public content loader:

- `src/lib/public-content.ts`
- `src/lib/sanity-content.ts`

If Sanity is missing, empty or unavailable, the site falls back to canonical local content from `src/lib/content.ts`.

## Preview

Preview routes exist:

- `/api/preview`
- `/api/preview/disable`

Preview requires `SANITY_PREVIEW_SECRET`.

## What Is Good

- Public content model is broad enough for launch.
- Private recruitment data is deliberately excluded.
- Schema validation passes locally.
- Studio route is protected/noindexed.
- CMS access and editor guide already exist.
- Public pages have fallback content if Sanity is unavailable.

## Risks

- Sanity project and dataset still need real production confirmation.
- David/editor accounts must be invited manually.
- CORS must be set in Sanity Manage.
- Legal review is needed before named proof, testimonials or sensitive case studies go live.
- Sanity tokens must not be exposed as `NEXT_PUBLIC_`.

## Manual Actions

1. Confirm Sanity project ID and dataset.
2. Add Sanity public env vars to Railway.
3. Add server read token only if required.
4. Set `SANITY_PREVIEW_SECRET`.
5. Configure CORS for the Railway/production domain.
6. Invite David and approved editors.
7. Publish one harmless test document.
8. Confirm the matching public route renders.

## Recommendation

Use Sanity for public content.

Use Loxo/Postgres for private recruitment data.

Do not add candidate, CV, audit, DSAR or private shortlist data to Sanity.
