# Railway Readiness Audit

Audit date: 11 June 2026

## Status

Amber.

The repo is Railway-ready in code, but production is not complete until David connects the Railway project, variables, database and domain.

## Railway Files

Found:

- `railway.json`
- `nixpacks.toml`
- `.env.example`
- `docs/railway-deployment.md`
- `docs/123-reg-domain-switch.md`
- `docs/launch-handover.md`

## Build And Start

Railway config:

- builder: Nixpacks
- build command: `npm run build`
- start command: `npm run start -- --hostname 0.0.0.0 --port ${PORT:-3000}`
- healthcheck path: `/api/health`
- restart policy: on failure

Nixpacks setup:

- Node.js 22
- PostgreSQL 16 client tools, useful for `psql` migration scripts

## Healthcheck

Route:

- `/api/health`

It returns simple status and does not expose secrets.

It reports whether the operations database is enabled/configured.

## Environment Variables

Production needs Railway variables for:

- site URL
- Sanity
- CMS gate
- contact email delivery
- optional database
- retention settings
- WhatsApp
- analytics/search
- booking/LinkedIn/phone

The full list is in:

- `.env.example`
- `README.md`
- `docs/launch-handover.md`

## Database Readiness

Postgres is staged, not automatically live.

Required sequence:

1. Add Postgres service in Railway.
2. Set `DATABASE_URL`.
3. Keep `OPERATIONS_DB_ENABLED=false`.
4. Run `npm run db:migrate`.
5. Run `npm run db:status`.
6. Turn `OPERATIONS_DB_ENABLED=true` only after migration success.

## Domain Readiness

Domain switching is manual.

David must preserve email DNS records before changing website DNS.

Use:

- `docs/123-reg-domain-switch.md`

## Risks

- No Railway production URL was verified in this local audit.
- Missing env vars can make forms, CMS, analytics or Sanity incomplete.
- If `NEXT_PUBLIC_SITE_URL` is wrong, canonical URLs and sitemap URLs will be wrong.
- Database migration failure should block enabling private operations DB.

## Recommendation

Railway is a good fit for this build.

Launch only after:

- app deploys
- `/api/health` works
- public routes work
- env vars are set
- Sanity is connected
- email is tested
- domain and SSL are confirmed
- sitemap is submitted

No secrets in GitHub. No guessing Railway status without checking the live dashboard/logs.
