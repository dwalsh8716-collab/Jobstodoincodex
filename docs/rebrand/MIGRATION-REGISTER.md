# Rebrand migration register

All launch actions below are inactive. Future origin is `{APPROVED_NEW_ORIGIN}` until David supplies the domain.

| Area | Source / current dependency | Required later change | Status |
|---|---|---|---|
| Brand identity | `src/lib/site.ts`, header, footer | Centralise name, wordmarks, alt text and dimensions | Initial private identity done; footer legal/social text deliberately pending |
| Palette/type | `src/styles/theme.css`, `app/globals.css`, root fonts | Approve new tokens and media while retaining UX | Pending brand approval |
| Copy | Page JSX, content.ts, homepage-content.ts, CMS, salary tables | Review every reference in brand-references.csv; preserve approved facts | Inventoried; no broad rewrite |
| Legal identity | Privacy, candidate privacy, cookies, terms, forms | Approve trading-name and controller wording | No production change |
| Public contact | siteConfig, contact pages, templates | Approve email/phone, preserve old routing during transition | Pending new details |
| WhatsApp | messages, buttons, business templates/webhook | Update brand text only; review number/account/display name separately | Preview contact blocked |
| Booking | Google booking URL and page metadata | Update appointment branding and callback/return URLs where required | Account untouched |
| Navigation | Header/service menu/footer/related cards | Preserve Clients, Candidates, Services, Jobs, Insight, About | Preserved |
| About URL | `/about-essential` | Prefer path preservation initially; rename only by an approved explicit map | Decision pending |
| Metadata | seo.ts, metadata.ts, per-page metadata, CMS seo fields | New title branding, descriptions, canonicals, absolute URLs | Inventory ready; local preview noindex |
| Structured data | Organization/Person/WebSite/Service/Article/JobPosting | Consistent approved entity name, IDs, logo, URL, sameAs; retain David identity | Suppressed in private preview; launch update pending |
| Share previews | og-image.png, metadata, social caches | New approved OG artwork, text and absolute URL; test WhatsApp/LinkedIn | Pending final assets |
| Icon/manifest | root layout, site.webmanifest | New favicon/app icons, correct contrast and safe areas | Initial supplied PNGs installed locally |
| URL migration | Live sitemap + source redirects | Preserve path; all legacy/protocol/host variants resolve directly to final canonical equivalent | 42 sitemap URLs + 36 source rules mapped |
| Sitemap | sitemap.ts, sitemap-engine.ts, CMS published status | Final new host and published canonical routes only; inspect placeholder specialism readiness | Preview disabled |
| Feeds | rss.xml, llms.txt, llms-full.txt | New origin/name; exclude drafts/private content | Preview feeds blocked |
| Robots/noindex | robots.ts, seo.ts, headers, preview gate | Remove preview protections only in authorised public release; retain private-route controls | Active private controls |
| Old domain | 123 Reg + Railway | Keep registered, serving TLS and redirects; do not cancel after launch | Unchanged |
| New domain | Unknown | Check ownership/history; plan exact Railway-issued DNS and SSL | Cannot specify records yet |
| Sanity | sle6d8y3/production, Studio, CLI, sync scripts | Private rebrand dataset if approved; scoped token, CORS, Studio separation and content reconciliation | Offline snapshot only |
| CMS webhooks | /api/webhooks/sanity, secret, IndexNow | Fresh scoped secret, final callback URL; ensure dataset filter and no duplicate notifications | No webhook changes |
| Admin/Labs auth | CMS signing secret, token URLs, separate agent sessions | New isolated test secrets; decide old signed-link compatibility at launch | Private routes blocked |
| CV files | Railway bucket, S3 SDK, attachment email | Preserve live objects and retention; update brand-facing messages only after review | No data/credentials copied |
| Enquiries/applications | Resend and operations handlers | New sender-domain verification, templates, recipients, consent labels | Sending disabled locally |
| DSAR | Request/confirmation flows and email | Preserve legally useful old links and inbox; review token compatibility | No real requests made |
| Salary guide | Public guide, share URLs, gated routes | Brand/download/link update, preserve approved data and timestamps | Content preserved |
| Recruiter tools | Next Labs plus separate agent/BI/recorder | Source-level brand pass; mock integrations and synthetic data; actual capabilities validated separately | Preserved source; not running |
| Google OAuth | Agent callback, hosted domain, login hint, consent screen | Register final callback; retain old while issued flows remain valid | Not changed |
| CRM/Meta/AI | Loxo references, WhatsApp, OpenAI/provider configuration | Review final account names, callbacks, approved automation and provider boundaries | No external actions |
| Analytics | GA4, consent, optional tags | Preserve historical property where appropriate; update stream/domain and annotate launch; avoid double counting | Production untouched, preview disabled |
| Monitoring | Sentry, GitHub monitor, health labels | New release/environment labels and host checks; preserve alerts and history | Existing live monitoring untouched |
| CI/release | GitHub Node22 workflow vs Node>=24 project; CLI uploads | Pin audited runtime; publish traceable release commits; keep preview jobs from production secrets | Risk recorded |
| Search Console/Bing | Verified old property, sitemap, IndexNow | Verify new property, validate redirects, submit new sitemap and eligible Change of Address only at launch | No settings/submissions changed |
| Directories/backlinks | LinkedIn, GBP, citations, partner links | Export priority links, update approved brand/domain details after launch | Account actions deferred |
| External/legal resources | Privacy copy, asset licences, proof permissions | Confirm continued use under new trading brand | Approval required |

## SEO cutover plan

1. Reconcile the observed URL map with Search Console/Bing indexed pages, analytics landing pages and important backlink exports. Include downloads and image/video asset URLs. Unknown/deleted content must not be blanket-redirected to the homepage.
2. Keep existing paths unless a specific change is approved. Flatten aliases such as old Strategic Interim and regional landing URLs directly to their final new-host destinations. Test HTTP/HTTPS, www/non-www, trailing slashes and supported query strings with one permanent 301 where hosting permits. Detect loops before release.
3. At authorised release, every public canonical, sitemap URL, structured-data entity relationship and internal absolute link uses the approved HTTPS canonical host. Review CMS canonical overrides and content asset URLs too.
4. Authenticate the preview throughout preparation. The public release must intentionally remove preview auth/noindex/robots blocking from approved public routes; keep all private tools and drafts protected. Prevent Railway's generated hostname becoming an indexable duplicate.
5. Verify new and old Search Console properties, submit the new sitemap and use Google's Change of Address when eligible, after working redirects are live. Keep old-domain verification and redirects. Submit equivalent Bing updates; do not request removal of useful migrated old URLs.
6. Update priority external links, LinkedIn, GBP and directories with approved names/details. Preserve historical continuity and proof. No current account edit is authorised by this document.
7. Monitor 404/5xx, redirect chains, selected Google canonicals, crawl/indexing trends, traffic/conversions, forms, CV deliveries and error monitoring. Ranking fluctuations alone are not a reason for repeated reversals.

Google advises keeping redirects for at least a year; retain the old domain longer where practical. DNS itself does not provide HTTP redirects. The recommendation to preserve URL paths and keep the CMS/architecture stable follows [Google's migration guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).

## Domain/email preparation

- Obtain exact new domain/registrar and preferred host; check for conflicting existing MX/TXT records before any change.
- Capture existing DNS and email records securely before cutover. Ask Railway for the actual domain-specific routing/verification values at setup time; never guess or reuse unrelated targets.
- Validate HTTPS on both chosen host variants, then direct noncanonical variants and old host variants to the same final URLs without intermediate hops.
- Preserve old domain registration, old MX and old inboxes. Plan aliases/forwarding for enquiries and reply continuity; test forwarding rather than assuming it works.
- Configure the new provider's MX and SPF. Use one SPF record with the authorised senders. Verify DKIM separately for Workspace/email provider and Resend as applicable.
- Choose DMARC policy/reporting with the mail provider after verifying alignment; do not switch to strict rejection blindly. Preserve old domain mail authentication during transition.
- Test new outbound sender, reply-to, contact delivery, CV attachments, DSAR messages, spam placement and new/old replies only with explicit live-test approval and designated test recipients.
- No DNS or mail configuration can be final until the domain, provider and sender addresses are confirmed.

## Release and rollback gates

Release requires approved copy/brand/legal identity; current content reconciliation; no private data in public artifacts; secure storage/forms; accessible mobile/desktop pages; successful type/lint/build and integration tests; correct new-host TLS/metadata/redirects; a named owner; and explicit David launch approval.

Rollback triggers: public content exposed unintentionally, live data routed to staging, failed enquiry/CV delivery, widespread 5xx, critical route breakage or wrong canonical-host routing. Restore the previous app release/configuration, stop unsafe integrations and preserve new records. Restore DNS only where necessary and understand caching delays. Never restore an old database over new enquiries. If Google Change of Address has already been used, follow its reversal procedure rather than treating it as an instant undo.

After launch, scheduled checkpoints: immediately; 1 hour; 24 hours; 7 days; 30 days. These are proposed checks, not newly created automations.
