# Observability Audit

Audit date: 11 June 2026

## Status

Amber.

Basic health and logs are available through the app and Railway, but proper application error tracking and uptime alerting still need manual setup.

## What Exists

Health route:

- `/api/health`

It reports:

- app status
- operations database enabled/configured state

Railway config:

- `railway.json` points healthcheck to `/api/health`
- Railway will provide deployment logs and service logs once deployed

Code-level visibility:

- contact form logs safe failure metadata
- data/privacy request logs safe failure metadata
- audit logging is staged for private DB
- admin audit route exists when operations DB is enabled

## What Is Missing

- Sentry or equivalent application error tracking.
- UptimeRobot, Better Stack or similar uptime monitor.
- Alert recipient configuration.
- Form failure dashboard outside logs.
- Production Railway logs have not been inspected in this local audit.

## Recommended Layers

## Railway

Use Railway for:

- deploy logs
- service logs
- crash/restart visibility
- CPU and memory metrics
- environment variable checks

## Uptime

Use Better Stack or UptimeRobot to monitor:

- `/`
- `/contact`
- `/sitemap.xml`
- `/api/health`

Alert David by email.

## Error Tracking

Consider Sentry after launch setup.

Rules:

- no PII in error payloads
- no CV content
- no form messages
- DSN stored in env vars
- source maps handled intentionally
- sampling kept modest

## Form Monitoring

Watch:

- contact form API failures
- Resend failures
- database write failures
- DSAR route failures
- WhatsApp Business send failures if enabled

## Manual Actions

1. Confirm Railway app logs are accessible.
2. Add uptime monitor after production URL exists.
3. Decide whether to add Sentry.
4. Decide who receives alerts.
5. Run a monthly health check.

## Recommendation

Do not launch blind.

At minimum, enable Railway logging review and uptime monitoring before public launch.

Add Sentry when David wants proper error visibility beyond Railway logs.
