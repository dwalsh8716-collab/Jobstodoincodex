# AGENTS.md

## Project

This is the Essential Resourcing website build: a premium, content-led recruitment site for senior marketing, PR, communications, digital, agency leadership and Strategic Interim hiring.

## Stack

- Next.js 16 App Router with TypeScript.
- React 19.
- Sanity 6 Studio embedded at `/studio`.
- Central CSS token system in `src/styles/theme.css`.
- Canonical content seed data in `src/lib/content.ts`.

## Important Commands

Run these before handing work back:

```bash
npm run typecheck
npm run lint
npm run build
```

For local preview:

```bash
npm run dev
```

For production preview after a build:

```bash
npm run start
```

## Build Rules

- Keep design tokens centralized in `src/styles/theme.css`.
- Do not hardcode new colours in components unless they are a one-off asset requirement.
- Keep the current premium adaptable palette. Do not switch to the Manchester palette unless David explicitly asks for that again.
- Follow `docs/DAVID-WALSH-TONE-OF-VOICE.md` for every page, component, CTA, FAQ, CMS label and placeholder/slot line.
- Prefer Server Components. Use client components only for navigation, forms, analytics, Studio and real interactivity.
- Keep draft content noindexed and out of sitemap/AI index routes.
- Do not invent named client outcomes, testimonials, salary data or live jobs.
- Use structured data for services, articles, FAQs, jobs, breadcrumbs, organization and person entities where relevant.
- Forms must keep validation, honeypot protection, consent, clear success/error states and no insecure CV upload.
- Use the supplied logo assets from `public/assets` for headers, footers, icons, manifests, social images and app thumbnails.

## Done Means

- Typecheck, lint and production build pass.
- Key routes return 200.
- Contact API rejects bad submissions and accepts valid browser-style form submissions.
- `robots.txt`, `sitemap.xml`, `rss.xml`, `llms.txt` and `llms-full.txt` render.
- Mobile and desktop screenshots have no horizontal overflow or clipped text.
- Any remaining launch caveats are documented in `README.md` or `docs/BRIEF-COMPLETION-MATRIX.md`.

## Review Priorities

- David Walsh tone of voice: plain English, warm, Northern, straight-talking, commercial, human, no faff.
- Search visibility and draft publishing controls.
- Mobile layout and text fitting.
- Accessibility labels, image alt text and visible focus.
- Security headers and secret handling.
- Editorial credibility: no filler, no false claims, no fake proof.
