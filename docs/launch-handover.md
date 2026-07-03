# Launch Handover

## Status

Production preview ready. Full public launch gated.

The website is deployed to Railway as a preview and has passed the production
QA crawler against the Railway URL.

Final QA launch report:

```txt
docs/final-qa-launch-report.md
docs/FINAL-LAUNCH-READINESS-AUDIT.md
```

Railway preview:

```txt
https://web-production-ba3b9.up.railway.app
```

Current launch gates:

- GA4 Measurement ID or GTM ID still needs to be added and consent-tested
- Resend email delivery must send a real enquiry to David's inbox
- legal/privacy wording must be reviewed before public launch
- final domain DNS must stay untouched until David approves the cutover
- final QA must be repeated on `https://essentialresourcing.co.uk`

Do not treat the website as publicly launched until the manual checklist at the
end is complete.

## Deployment Audit

Current framework:

- Next.js 16 App Router
- React 19
- TypeScript
- Sanity 6 Studio embedded at `/studio`

Package manager:

- npm
- lockfile: `package-lock.json`

Build command:

```bash
npm run build
```

Start command:

```bash
npm run start -- --hostname 0.0.0.0 --port ${PORT:-3000}
```

Health check:

```txt
/api/health
```

Railway config:

- `railway.json` exists
- `nixpacks.toml` exists
- Nixpacks installs Node 24 and PostgreSQL client
- healthcheck route exists
- no Procfile required
- no Prisma or Drizzle production migration command required

Sanity:

- Studio embedded at `/studio`
- branded CMS gate at `/cms`
- `/studio` now requires the same CMS session gate before rendering
- Sanity remains the public CMS
- private candidate/client records must stay out of Sanity

Database:

- Railway/Postgres private operations schema is staged
- migrations live in `database/migrations`
- database is not required for the public site to render
- operations writes stay disabled until `OPERATIONS_DB_ENABLED=true`

Host-specific assumptions:

- no Vercel-only APIs are required
- forms use standard API routes/server actions
- no public file uploads depend on a host
- Next image optimisation allows Unsplash and Sanity CDN assets
- Content Security Policy allows Sanity, analytics and approved media providers
- canonical URLs use `NEXT_PUBLIC_SITE_URL` through `siteConfig`
- sitemap and robots use the same canonical site URL

Current deployment status:

```txt
Railway preview live at https://web-production-ba3b9.up.railway.app
```

Railway docs:

```txt
https://docs.railway.com/guides/nextjs
https://docs.railway.com/networking/public-networking
https://docs.railway.com/cli
```

## Railway Summary

Recommended project:

```txt
Essential Resourcing
```

Recommended services:

- Next.js website/app
- Railway Postgres for private operations
- future optional worker/cron service for retention checks
- future optional private storage integration for CV uploads

Deployment readiness:

```txt
Production preview ready. Public launch is gated by external account, email, analytics, legal and DNS tasks.
```

Dashboard setup for future changes:

1. Log in to Railway.
2. Open the `essential-resourcing` project.
3. Confirm GitHub deploys from the intended branch.
4. Add or update environment variables.
5. Redeploy.
6. Check logs.
7. Open the Railway-generated domain.
8. Test `/api/health`.
9. Add Railway Postgres only if private operations are going live.
10. Run migrations before enabling private operations.
11. Turn on operations only after migrations pass.
12. Add custom domains only after the Railway URL works.

CLI option if David wants to use it:

```bash
npm install -g @railway/cli
railway login
railway link
railway status
railway variables
railway up
```

Do not switch the final domain until David explicitly approves the DNS cutover.

## Environment Variables

Set these in Railway. Do not commit real values.

Core:

```txt
NEXT_PUBLIC_SITE_URL
```

Sanity client-safe:

```txt
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
NEXT_PUBLIC_SANITY_API_VERSION
```

Sanity server-side:

```txt
SANITY_PROJECT_ID
SANITY_DATASET
SANITY_API_VERSION
SANITY_READ_TOKEN
SANITY_API_READ_TOKEN
SANITY_PREVIEW_SECRET
```

CMS gate:

```txt
CMS_GATE_USERNAME
CMS_GATE_PASSWORD
CMS_GATE_SECRET
```

Forms/email:

```txt
RESEND_API_KEY
CONTACT_TO_EMAIL
CONTACT_FROM_EMAIL
RATE_LIMIT_SECRET
```

Private operations:

```txt
DATABASE_URL
OPERATIONS_DB_ENABLED
OPERATIONS_PRIVACY_SALT
RETENTION_ENGINE_ENABLED
RETENTION_DRY_RUN
RETENTION_ROLE_APPLICATION_MONTHS
RETENTION_TALENT_POOL_MONTHS
RETENTION_GENERAL_CANDIDATE_MONTHS
RETENTION_CLIENT_ENQUIRY_MONTHS
RETENTION_CV_FILE_MONTHS
RETENTION_DSAR_RECORD_MONTHS
DSAR_EMAIL_VERIFICATION_TOKEN_HOURS
INTERIM_AVAILABILITY_TOKEN_EXPIRY_DAYS
RETENTION_AUDIT_LOG_MONTHS
CRON_SECRET
```

Tracking/search:

```txt
GOOGLE_SITE_VERIFICATION
NEXT_PUBLIC_GA_ID
NEXT_PUBLIC_GTM_ID
NEXT_PUBLIC_LINKEDIN_PARTNER_ID
NEXT_PUBLIC_META_PIXEL_ID
NEXT_PUBLIC_CLARITY_ID
NEXT_PUBLIC_HOTJAR_ID
```

Contact:

```txt
NEXT_PUBLIC_WHATSAPP_NUMBER
NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE
NEXT_PUBLIC_BOOKING_URL
NEXT_PUBLIC_GOOGLE_BOOKING_URL
NEXT_PUBLIC_LINKEDIN_URL
NEXT_PUBLIC_PHONE
```

WhatsApp Business API, only if approved:

```txt
WHATSAPP_BUSINESS_ENABLED
WHATSAPP_BUSINESS_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCESS_TOKEN
WHATSAPP_BUSINESS_VERIFY_TOKEN
WHATSAPP_BUSINESS_APP_SECRET
WHATSAPP_BUSINESS_DEFAULT_TEMPLATE
WHATSAPP_BUSINESS_TEMPLATE_LANGUAGE
WHATSAPP_BUSINESS_API_VERSION
```

## CMS Access Summary

Studio URLs:

```txt
https://web-production-ba3b9.up.railway.app/cms
https://web-production-ba3b9.up.railway.app/studio
https://essentialresourcing.co.uk/cms
https://essentialresourcing.co.uk/studio
```

David access status:

```txt
Sanity project is configured for this build. David should still confirm Owner/Admin access in Sanity Manage before public launch.
```

Sanity handover guide:

```txt
docs/sanity-cms-access.md
docs/sanity-editor-guide.md
```

Manual Sanity actions:

1. Confirm project `sle6d8y3` and dataset `production`.
2. Confirm David is Owner or Administrator.
3. Invite staff with Editor/Contributor roles only where appropriate.
4. Add Railway generated domain and production custom domains to Sanity CORS.
5. Set Sanity env vars in Railway.
6. Test `/cms` and `/studio`.

## Domain And DNS Summary

Recommended canonical domain:

```txt
https://essentialresourcing.co.uk
```

Also support:

```txt
https://www.essentialresourcing.co.uk
```

DNS records:

```txt
Not switched yet. David asked to leave the live domain as the final step.
Railway must provide the exact records after custom domains are added to the service.
```

123 Reg guide:

```txt
docs/123-reg-domain-switch.md
```

Do not delete:

- MX records
- SPF records
- DKIM records
- DMARC records
- Microsoft 365 records
- Google Workspace records
- mailbox verification records

## Launch Checklist

Railway:

- project created
- GitHub connected
- core env vars added
- build passing
- Railway-generated domain working
- `/api/health` working
- production QA crawler passing against Railway preview
- Postgres added if private operations are going live
- migrations run
- `OPERATIONS_DB_ENABLED=true` only after migrations pass
- `RETENTION_ENGINE_ENABLED=false` until approved
- custom domains added after Railway URL works
- SSL active

Sanity:

- David has Owner/Admin access
- editor access tested
- `/cms` works
- `/studio` redirects to `/cms` when not signed in
- Studio opens after sign-in
- CORS includes Railway URL and production domain
- preview tested only if `SANITY_PREVIEW_SECRET` is set

123 Reg:

- current DNS backed up
- email host confirmed
- Railway DNS records copied exactly
- email records preserved
- apex domain tested
- `www` tested
- canonical redirect tested
- SSL active
- email sending and receiving tested

Website:

- homepage works
- service pages work
- jobs work
- insights work
- contact form works
- WhatsApp link works
- booking link works if configured
- sitemap works
- robots works
- RSS works
- `llms.txt` works
- consent banner works
- GA4/GTM fires only through consent-aware setup
- candidate privacy pages work
- admin dashboard protected

Google:

- Search Console verified
- sitemap submitted
- GA4 receiving consented data
- Google Business Profile updated if applicable

## Safe Access Policy

- Railway: David logs in and connects GitHub manually.
- GitHub: use the GitHub tool or normal authenticated Git only.
- Sanity: invite users through Sanity Members.
- 123 Reg: David makes DNS changes manually.
- Google: David verifies Search Console, GA4 and Business Profile manually.
- Env vars: set in Railway dashboard, not in GitHub issues.
- Passwords: do not paste them into Codex, Gemini, ChatGPT or any AI tool.

## Manual Actions For David

1. Add a GA4 Measurement ID or GTM ID and test consented analytics.
2. Add a valid Resend API key after sender/domain verification.
3. Send a real test enquiry to `david@essentialresourcing.co.uk`.
4. Confirm David has Sanity Owner/Admin access.
5. Add Railway preview and final domains to Sanity CORS.
6. Complete legal/privacy review.
7. Add custom domains in Railway and copy the exact DNS records.
8. Update 123 Reg without deleting email records.
9. Set `NEXT_PUBLIC_SITE_URL=https://essentialresourcing.co.uk`.
10. Redeploy.
11. Run final live QA against the production domain.

## Production Readiness

```txt
Production preview ready. Full public launch gated.
```

Final QA fixes completed in the launch-gate pass:

- production QA crawler added as `npm run qa:production`
- Railway preview passed 45 route checks, 36 link checks and 84 browser viewport runs
- generated QA evidence is ignored from Git
- final launch decision report updated
- common old/short launch URLs redirect to canonical pages
- empty or malformed public form API posts return safe validation responses
- redirect and API response tests exist

Blocks before true launch:

- GA4 Measurement ID or GTM ID must be set and tested through consent.
- Resend email delivery must be configured and tested.
- Sanity CORS and editor access must be confirmed before editor handover.
- 123 Reg DNS has not been switched by design.
- Railway custom-domain DNS records are not generated yet.
- Legal/privacy review remains required for live operations data.

Host on Railway. Keep Sanity working. Protect email. No shared passwords. No
secrets in GitHub. No faff.
