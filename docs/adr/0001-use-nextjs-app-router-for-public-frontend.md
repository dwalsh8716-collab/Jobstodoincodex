# 0001 - Use Next.js App Router For The Public Frontend

## Status

Accepted.

## Context

The Essential Resourcing website is a premium public website with content,
services, jobs, insights, schema, sitemaps, forms, analytics consent and a
private admin layer.

The current build uses Next.js 16 App Router, React 19 and TypeScript.

The public site needs to be fast, crawlable, easy to verify and safe to extend.
Most pages are content-led and do not need client-side application state.

Supporting docs:

- `docs/frontend-architecture.md`
- `docs/future-proof-architecture.md`
- `docs/TECHNICAL-SEO-GEO.md`

## Decision

Use Next.js App Router as the public frontend architecture.

Default to Server Components for public pages and shared layout.

Use Client Components only where the browser is genuinely needed:

- navigation menus
- forms
- consent management
- analytics event delegation
- embedded Sanity Studio
- private admin interactions
- future interactive tools that cannot be server-rendered

Keep metadata, sitemap, robots, RSS, `llms.txt`, `llms-full.txt` and JSON-LD
first-class parts of the app, not afterthoughts.

## Consequences

- Public pages remain fast, crawlable and simple to reason about.
- Search, GEO and AI-readable routes stay close to the content model.
- Future UI work must be careful not to turn content pages into heavy client
  bundles.
- Verification must keep using `npm run verify` as the release gate.

## What Not To Do

- Do not rewrite the public site into a separate SPA.
- Do not move public content rendering into a client-only layer.
- Do not add client state just because a component looks interactive.
- Do not bypass App Router metadata and structured-data patterns.
- Do not let private Recruiter Labs code leak into public bundles.
