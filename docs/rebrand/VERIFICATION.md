# Phase One verification

27 September 2026. Scope: protected local setup only.

| Check | Result |
|---|---|
| TypeScript | `npm run typecheck` passed after the final build |
| Lint | `npm run lint` passed with zero warnings |
| Production-mode compilation | `npm run build` passed; 71 static pages generated; existing dynamic routes preserved |
| Isolation tests | `npm run test:rebrand`: 8 passed; credentials, host restriction, mutations, private paths, indexing and external configuration checked |
| Unauthenticated homepage, logo and image optimiser | All returned 401 with noindex header |
| Authenticated public routes | 41/42 live-sitemap paths returned 200 locally; `/book-a-call` returned its expected 307 to `/contact` because live booking is disconnected |
| Preview metadata | Local canonical, `noindex, nofollow`; no production entity schema published |
| API/server-action writes | Synthetic empty POSTs to local `/api/contact` and `/contact` rejected at the preview gate with 405; no form handler or external business process invoked |
| Private tools | Studio, admin and tokenised client route returned 403 |
| Discovery | Authenticated robots disallows all; preview sitemap returns 404; feeds disabled |
| Desktop/mobile | 1440px and 390px home screenshots inspected; no horizontal overflow; new logo readable and undistorted; existing navigation retained |
| Footer | Supplied white logo loads when lazy image is scrolled into view on desktop/mobile |
| WhatsApp click | Prevented locally and explanatory preview notice displayed; test also intercepts external navigation defensively |
| Browser runtime | No page errors and no external requests during initial home checks |
| Recovery | Git bundle restored into a separate bare test repository; restored tree exactly matches snapshot tree |
| Original source | Hash comparison of 612 audited source/config/documentation files found no changes |
| Production after setup | Same Railway deployment ID, SUCCESS, same domains, only original production environment/service; no rebrand assets/indicator found on live homepage |
| Production endpoints | Home, health, robots and sitemap still return 200 |

The homepage and sitemap are regenerated content, so response hashes can change without a deployment. Health/robots hashes remained equal; deployment identity, domains and brand isolation were checked separately. No claim of byte-identical generated production HTML is made.

The original automated suite includes brand/SEO expectations for Essential Resourcing. This phase ran the relevant preview isolation tests plus build/type/lint; it is not a full new-brand acceptance or private-integration certification. Those belong to later phases.

Evidence: [desktop](evidence/rebrand-home-1440.png), [mobile](evidence/rebrand-home-390.png), [HTTP/browser checks](evidence/rebrand-verification.json), [footer/contact checks](evidence/rebrand-additional-verification.json), [restore drill](inventory/rollback-verification.json), [production read-back](inventory/production-after-check.json).

## Local preview access

- Address: `http://127.0.0.1:3027`
- Local username/password: `/Users/walsh/Jobstodoincodex-rebrand/.rebrand-preview-access.json`
- The server is bound to this computer only. It cannot be opened from a phone or sent to someone else as a public preview link.
- No Railway or Sanity service was provisioned. The local server can be stopped between reviews; all source and build work remains saved.
- To restart from this worktree: `npm run start` (or `npm run dev` for development). Both use the protected wrapper.
- The wrapper deliberately rejects Railway execution, copied `.env` files and live integration settings. Do not bypass it to deploy this phase-one artifact.
- Local process details/logs are stored under `.qa/`. Never stop unrelated running website processes.

## Rollback

Rebrand baseline: `d5ef8012a315867fb0122cd959f459ef4ef21dfd`.

Recovery bundle: `/Users/walsh/.codex/rebrand-backups/2026-09-27/essential-pre-rebrand.bundle`.

The restoration drill recovered the baseline into an independent bare repository and checked the full Git tree ID. No production database or site was restored or interrupted. The original checkout and all private records remain in place.

Current production recovery deployment: `58876159-ac8b-44dc-a1f9-990e741dc2a7`. Save a fresh deployment/configuration baseline again immediately before any future launch, because the live site may continue changing meanwhile.
# In-app browser access

The local preview also supports a single-use browser access link, generated on server startup in the ignored `.qa/preview-browser-access.json` file (owner-readable only). It expires after 15 minutes and exchanges for an HttpOnly, SameSite=Strict session cookie lasting at most eight hours. Restarting the server invalidates it. This avoids unsupported HTTP Basic authentication dialogs in the in-app browser; existing Basic authentication and all local-only, indexing, integration and write protections remain active. Never publish or share this access file.
