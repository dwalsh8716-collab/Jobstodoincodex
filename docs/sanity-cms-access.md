# Sanity CMS Access Handover

## Status

Partially ready.

The website has an embedded Sanity Studio at:

```txt
/studio
```

The friendly editor entry point is:

```txt
/cms
```

The Studio route is now protected by the same site-level CMS session gate. Sanity
still handles the real editor account and project permissions.

This document does not contain tokens, passwords or real account secrets.

## Current Setup

- CMS provider: Sanity.
- Studio location: embedded in the Next.js app.
- Studio route: `/studio`.
- Editor gate route: `/cms`.
- Schema file: `sanity/schemas/index.ts`.
- Studio structure file: `sanity/studioStructure.ts`.
- Frontend Sanity client: `src/lib/sanity.ts`.
- Public content fallback: local TypeScript content remains available.

Current configured defaults if env vars are missing:

```txt
projectId: essentialresourcing
dataset: production
apiVersion: 2026-06-09
```

David must confirm the real Sanity project ID and dataset before launch. Do not
assume the fallback project ID is the production project.

## Environment Variables

Client-safe Sanity values:

```txt
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
NEXT_PUBLIC_SANITY_API_VERSION
```

Server-side Sanity values:

```txt
SANITY_PROJECT_ID
SANITY_DATASET
SANITY_API_VERSION
SANITY_READ_TOKEN
SANITY_API_READ_TOKEN
SANITY_PREVIEW_SECRET
```

Do not expose Sanity tokens with `NEXT_PUBLIC_`.

## David Access

David access status cannot be confirmed from this local workspace.

Manual check:

1. Go to `https://www.sanity.io/manage`.
2. Select the correct organisation.
3. Open the Essential Resourcing project.
4. Open Members.
5. Confirm David's email has Owner or Administrator access.
6. Invite staff as Editor/Contributor only unless they genuinely need admin
   control.
7. Do not share Sanity tokens in prompts, GitHub issues, notes or chat.

Sanity Manage:

```txt
https://www.sanity.io/manage
```

## Editor Login Flow

On the live website:

1. Go to `/cms`.
2. Log in with the site-level CMS gate.
3. Select "Open CMS Studio".
4. Sign in to Sanity if Sanity asks.
5. Edit content in the Studio.

Direct visits to `/studio` should redirect to `/cms` unless the site-level gate
session is valid.

## What David Can Edit

Main Site:

- homepage
- site settings
- navigation
- pages
- redirects

Commercial:

- services
- case studies
- testimonials
- FAQs
- CTA blocks
- proof/logo items

Content:

- insights
- salary snapshots

Recruitment:

- jobs

People:

- David Walsh / team profiles

## Common Editing Steps

Homepage:

1. Open Main Site.
2. Open Homepage.
3. Edit hero copy, media, sections and CTAs.
4. Publish only when the page is ready.

Service pages:

1. Open Commercial.
2. Open Services.
3. Edit the relevant service.
4. Keep copy specific, plain English and commercially useful.

Jobs:

1. Open Recruitment.
2. Open Jobs.
3. Add or edit the job.
4. Set status to live only when the role is genuinely open.
5. Keep salary, location, hybrid status and process details honest.

Insights:

1. Open Content.
2. Open Insights.
3. Add title, slug, excerpt, author, publish date and body.
4. Add FAQs and related services where useful.

Case studies:

1. Open Commercial.
2. Open Case Studies.
3. Keep anonymised drafts unpublished until the outcome is approved.
4. Do not use named clients, testimonials or logos without permission.

Salary snapshots:

1. Open Content.
2. Open Salary Snapshots.
3. Use verified or clearly caveated salary data only.
4. Keep draft data out of the live sitemap.

Site settings:

1. Open Main Site.
2. Open Site Settings.
3. Update contact details, social links, booking link, footer text and WhatsApp
   settings.
4. Use WhatsApp number format `447824514296`, with digits only.

## Preview

Preview route:

```txt
/api/preview?secret=...&path=/target-path
```

Preview requires:

```txt
SANITY_PREVIEW_SECRET
```

Do not enable preview links in production until the secret is set in Railway.

## CORS And Production Domain

After Railway generates the production URL and after the final custom domain is
known, add the allowed origins in Sanity project settings:

- Railway generated domain
- `https://essentialresourcing.co.uk`
- `https://www.essentialresourcing.co.uk` if used
- local development origin if needed

Do not add broad wildcard origins.

## What Not To Store In Sanity

Sanity is public website content only.

Keep out of Sanity:

- private candidate records
- candidate names submitted through forms
- candidate emails and phone numbers
- CV files
- CV URLs
- private application messages
- private client contacts
- internal recruitment notes
- DSAR requests
- audit logs

Private operations belong in Railway/Postgres once enabled.

## Manual Actions For David

1. Confirm the real Sanity project ID and dataset.
2. Confirm David has Owner or Administrator access.
3. Invite staff with the lowest sensible role.
4. Add Railway/custom domain origins in Sanity CORS.
5. Set Sanity environment variables in Railway.
6. Confirm `/cms` and `/studio` work on the Railway URL before DNS switch.
7. Keep Sanity tokens out of GitHub and prompts.

No shared passwords. No private candidate data in Sanity. No faff.
