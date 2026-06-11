# Security And Privacy Audit

Audit date: 11 June 2026

## Status

Amber.

The codebase has good privacy architecture, but launch still needs production configuration and legal review.

## Good Findings

- Security headers are configured in `next.config.ts`.
- `poweredByHeader` is disabled.
- CMS and Studio routes are gated.
- Admin and Labs routes are noindexed.
- Private/admin routes are excluded from sitemap.
- Sanity is public-content only.
- Contact and data request forms validate on the server.
- Forms use honeypot and timing checks.
- Database writes are disabled unless explicitly enabled.
- Audit logging redacts sensitive fields.
- Analytics respects consent before loading tracking scripts.
- Google Consent Mode V2 defaults are privacy-first.
- WhatsApp Business automation is disabled unless configured.
- AI/Labs governance blocks real candidate data and automated candidate evaluation.

## Security Headers

Configured:

- `X-DNS-Prefetch-Control`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Strict-Transport-Security`
- `Content-Security-Policy`

## Consent And Analytics

Consent defaults:

- analytics denied
- advertising denied
- personalisation denied
- security granted

The site has:

- accept all
- reject non-essential
- manage preferences
- save preferences
- footer reopen button when tracking is configured
- cookie and privacy policy links

This is technical readiness, not legal advice.

## Private Data

Private data must not go into:

- Sanity
- analytics
- public files
- logs
- public URLs

Private data belongs in:

- Loxo for CRM/ATS records
- Railway Postgres for website workflow records
- future private object storage for CV files, if approved

## Known Risks

- Legal review still required before launch.
- Production secrets must be set in Railway, never committed.
- CMS gate needs strong credentials and a strong secret.
- In-memory rate limiting is not a full distributed production rate limiter.
- WhatsApp webhook POST accepts unsigned payloads if `WHATSAPP_BUSINESS_APP_SECRET` is not set. Set the app secret before live webhook use.
- No private CV upload/storage is live. Do not add public CV upload.
- No Sentry/error tracking is configured yet.
- No uptime monitor is configured yet.

## Manual Actions

1. Set strong `CMS_GATE_USERNAME`, `CMS_GATE_PASSWORD` and `CMS_GATE_SECRET`.
2. Set `OPERATIONS_PRIVACY_SALT` before enabling private DB.
3. Set `WHATSAPP_BUSINESS_APP_SECRET` before live WhatsApp webhook use.
4. Set only public-safe variables with `NEXT_PUBLIC_`.
5. Review privacy, cookie, candidate privacy and terms pages with a legal adviser.
6. Confirm no CV files are uploaded to `public/`.
7. Keep Recruiter Labs private.

## Recommendation

Privacy architecture is sensible.

Launch confidence remains Amber until legal/privacy review and production env setup are complete.
