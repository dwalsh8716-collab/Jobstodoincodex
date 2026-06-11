# 0006 - Use Railway For Hosting

## Status

Accepted, pending production account setup.

## Context

The project is Railway-ready. Existing docs define Railway as the intended app
hosting target and Railway Postgres as the optional private operations database.

David needs a hosting setup that is quick to inspect, easy to connect to GitHub
and clear enough for a non-technical owner to operate with help.

Supporting docs:

- `docs/railway-deployment.md`
- `docs/railway-readiness-audit.md`
- `docs/launch-handover.md`
- `docs/123-reg-domain-switch.md`

## Decision

Use Railway for hosting the Next.js app.

Use Railway environment variables for production configuration and secrets.

Use Railway Postgres only when private website workflows are approved and ready.

Keep the production contract:

- build command: `npm run build`
- start command: `npm run start -- --hostname 0.0.0.0 --port ${PORT:-3000}`
- health check: `/api/health`
- migration command: `npm run db:migrate`
- status command: `npm run db:status`

## Consequences

- Deployments stay connected to GitHub.
- Runtime secrets stay out of Git.
- Logs, health checks and environment variables have one operational home.
- Production launch still needs manual Railway account, domain, env var and
  smoke-test setup.

## What Not To Do

- Do not commit production secrets.
- Do not enable database-backed features before Railway Postgres exists and
  migrations pass.
- Do not point the live domain at Railway before final QA.
- Do not use a random temporary host as the long-term production decision
  without a new ADR.
- Do not skip `/api/health`, forms, CMS gate and admin smoke checks after deploy.
