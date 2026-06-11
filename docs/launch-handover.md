# Launch Handover

## Status

Partially ready.

The website is technically prepared for Railway deployment, but it is not
actually deployed or linked to a Railway project from this workspace.

Final QA launch report:

```txt
docs/final-qa-launch-report.md
```

Reason:

- the Railway CLI is not installed locally
- no Railway authentication is available in this session
- project creation, account access and DNS changes need David's manual approval

Do not treat the website as live until the manual checklist at the end is
complete.

## Deployment Audit

Current framework:

- Next.js 16 App Router
- React 19
- TypeScript
- Sanity 5 Studio embedded at `/studio`

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
- Nixpacks installs Node 22 and PostgreSQL client
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

Current local tool status:

```txt
railway: not installed
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
Partially ready. Config and docs are ready. Manual Railway project creation or CLI login is still required.
```

Dashboard setup is the safer path for David:

1. Log in to Railway.
2. Create a new project.
3. Name it `Essential Resourcing`.
4. Choose deploy from GitHub.
5. Select `dwalsh8716-collab/Jobstodoincodex`.
6. Let Railway detect the app.
7. Confirm build command is `npm run build`.
8. Confirm start command is `npm run start -- --hostname 0.0.0.0 --port ${PORT:-3000}`.
9. Add the environment variables.
10. Deploy.
11. Check logs.
12. Open the Railway-generated domain.
13. Test `/api/health`.
14. Add Railway Postgres.
15. Run migrations.
16. Turn on operations only after migrations pass.
17. Add custom domains only after the Railway URL works.

CLI option if David wants to use it:

```bash
npm install -g @railway/cli
railway login
railway link
railway status
railway variables
railway up
```

Do not run deploy commands until David has authenticated and approved the target
project.

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

Studio URL after deployment:

```txt
https://essentialresourcing.co.uk/cms
https://essentialresourcing.co.uk/studio
```

David access status:

```txt
Unknown from local workspace. David must confirm in Sanity Manage.
```

Sanity handover guide:

```txt
docs/sanity-cms-access.md
docs/sanity-editor-guide.md
```

Manual Sanity actions:

1. Confirm the real Sanity project ID and dataset.
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
Not generated yet. Railway must provide the exact records after the custom domains are added to the Railway service.
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
- env vars added
- build passing
- logs checked
- Railway-generated domain working
- `/api/health` working
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

1. Log in to Railway.
2. Create or link the `Essential Resourcing` project.
3. Connect GitHub repo `dwalsh8716-collab/Jobstodoincodex`.
4. Add Railway environment variables.
5. Deploy and test the Railway-generated URL.
6. Add Railway Postgres if private operations should go live.
7. Run `npm run db:migrate` against Railway Postgres.
8. Confirm David has Sanity Owner/Admin access.
9. Add Railway and final domains to Sanity CORS.
10. Add custom domains in Railway and copy the exact DNS records.
11. Update 123 Reg without deleting email records.
12. Set `NEXT_PUBLIC_SITE_URL=https://essentialresourcing.co.uk`.
13. Redeploy.
14. Run final live QA.

## Production Readiness

```txt
Partially ready.
```

Final QA fixes completed in the launch-gate pass:

- common old/short launch URLs now redirect to canonical pages
- empty or malformed public form API posts now return safe validation responses
- final launch decision report created
- redirect and API response tests added

Blocks before true launch:

- Railway project is not linked or deployed from this workspace.
- Railway env vars are not set.
- Sanity project access is not confirmed.
- 123 Reg DNS has not been switched.
- Railway custom-domain DNS records are not generated yet.
- Legal/privacy review remains required for live operations data.

Host on Railway. Keep Sanity working. Protect email. No shared passwords. No
secrets in GitHub. No faff.
