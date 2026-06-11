# 0002 - Use Sanity For Public CMS Only

## Status

Accepted.

## Context

Sanity is embedded at `/studio` and protected by the `/cms` entry gate.

It is excellent for public editorial content: pages, services, jobs, insights,
case studies, salary snapshots, navigation, people, media metadata, proof items
and SEO fields.

It is not the right place for private candidate, client, CV, DSAR, audit or
operational recruitment data.

Supporting docs:

- `docs/data-boundaries.md`
- `docs/sanity-editor-guide.md`
- `docs/sanity-cms-access.md`
- `docs/sanity-nextjs-fetching.md`

## Decision

Use Sanity as the public website CMS only.

Sanity may store public content and public metadata.

Sanity must not store private candidate/client records, CV files or URLs,
application records, internal recruitment notes, DSAR requests, audit logs,
private consent records, WhatsApp logs, Loxo payload dumps or AI drafts that
contain private people data.

Public content can come from Sanity when configured, with local fallback content
kept in `src/lib/content.ts`.

## Consequences

- Editors get a sensible place to manage public website content.
- Private data has a harder boundary and a clearer retention path.
- Future schema work must ask whether the field is public before adding it.
- Public pages can safely use Sanity content without becoming a private
  operations database.

## What Not To Do

- Do not store submitted candidate details in Sanity.
- Do not store CVs, signed URLs or CV filenames in Sanity.
- Do not put private client contacts or recruitment notes in Sanity.
- Do not use Sanity to replace Loxo or Postgres.
- Do not add public schemas for private workflow state.
