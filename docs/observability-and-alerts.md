# Observability And Alerts

Audit date: 11 June 2026

## Status

Amber.

The website has the technical basics for health checks and safe logging. It does not yet have a live external error tracker or uptime alerting account. That part needs David/account approval because it means choosing who receives alerts and which third-party service is used.

## What Exists Today

App health:

- `/api/health`
- Railway healthcheck path points at `/api/health`
- health route returns simple app and operations database status
- health route does not expose secrets, connection strings or private records

Logs:

- Railway will provide deploy and service logs once the app is deployed
- contact form logs safe failure metadata
- data/privacy request form logs safe failure metadata
- operations database failures are logged without raw form payloads
- audit logs are staged in Postgres once private operations are enabled

Automated checks:

- `.github/workflows/quality.yml`
- `.github/workflows/retention-review.yml`
- `npm run verify`
- `npm run db:status`
- `npm run retention:check`

## What Is Not Added Automatically

No Sentry SDK has been installed.

No Better Stack, UptimeRobot, Axiom, Logtail or Osano-style account has been connected.

No paid monitoring service has been added.

No new third-party script has been added to the public website.

Reason: David should approve the monitoring provider, alert recipient and privacy terms before any live third-party monitoring is connected.

## Recommended Monitoring Layers

## 1. Railway

Use Railway for:

- deployment logs
- service logs
- crash/restart visibility
- CPU and memory metrics
- environment variable management
- healthcheck status

David should check Railway first when:

- a deployment fails
- the site is down
- `/api/health` fails
- form submissions start failing
- environment variables have changed

## 2. Uptime Monitoring

Recommended low-cost options:

- Better Stack Uptime
- UptimeRobot
- Pingdom if David already uses it

Monitor these URLs once the production domain exists:

```txt
https://www.essentialresourcing.co.uk/
https://www.essentialresourcing.co.uk/contact
https://www.essentialresourcing.co.uk/sitemap.xml
https://www.essentialresourcing.co.uk/api/health
```

Suggested checks:

- every 5 minutes for `/`
- every 5 to 10 minutes for `/api/health`
- every 15 to 60 minutes for `/contact` and `/sitemap.xml`

Alert David by email first. Add SMS/phone alerts only if he wants that level of noise.

## 3. Application Error Tracking

Recommended first option:

- Sentry

Alternatives:

- Highlight
- Axiom or Logtail-style logging if David wants centralised logs first
- Better Stack logs if using Better Stack for uptime

Sentry is useful for:

- frontend runtime errors
- server/API route errors
- release tracking
- source maps if configured carefully
- performance traces if sampling is controlled

Do not add it until David approves:

- provider
- alert email
- data processing terms
- sampling level
- whether source maps are uploaded

## Sentry Privacy Rules

If Sentry is added later:

- do not send names, emails, phone numbers, CV text, form messages or private notes
- do not send `DATABASE_URL`, API keys, tokens, cookies or auth headers
- scrub request bodies by default
- keep traces sampling low at launch
- do not record session replay unless separately approved and privacy-reviewed
- store DSN/config in environment variables
- upload source maps only intentionally

Potential env vars if Sentry is approved:

```txt
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.05
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

Do not add real values to GitHub.

## 4. Form Monitoring

Watch:

- `/api/contact` failures
- `/api/data-request` failures
- Resend email failures
- operations database write failures
- WhatsApp Business send failures if enabled
- rate-limit spikes

Current behavior:

- the user gets a safe success/error state
- server logs avoid raw secrets and stack traces in user-facing messages
- database writes are optional and disabled unless explicitly enabled

Recommended improvement after launch:

- use Sentry or central logs for API route failure alerts
- add an internal monthly form submission check
- test a contact form enquiry after any deploy

## 5. Search And Analytics Monitoring

Use after consent setup is approved:

- Google Search Console
- GA4 or GTM
- consent mode checks
- sitemap submission and coverage review

Do not send PII to analytics.

## Alert Meanings

Homepage down:

- check Railway deployment status
- check latest deploy logs
- check custom domain and DNS
- check `/api/health`

Health route down:

- check Railway service logs
- check whether the app crashed
- check environment variables

Contact page down:

- check latest deploy
- check browser smoke tests
- check form route logs

Sitemap down:

- check build output
- check public content fallback
- check `NEXT_PUBLIC_SITE_URL`

Form failure:

- check server logs
- check Resend env vars
- check operations database status
- check rate limit behavior

## Monthly Review

Every month, David or Codex should check:

- Railway logs
- uptime monitor incidents
- Sentry or chosen error tracker
- GitHub Actions failures
- Dependabot/security alerts
- Google Search Console issues
- form delivery by sending a test enquiry
- `/api/health`
- `npm run verify`

## Manual Setup Checklist

Before public launch:

1. Deploy to Railway.
2. Confirm `/api/health` works on the Railway URL.
3. Add production domain.
4. Add uptime monitor for `/`, `/contact`, `/sitemap.xml` and `/api/health`.
5. Decide who receives alerts.
6. Decide whether to add Sentry.
7. If Sentry is approved, configure privacy scrubbing before sending events.
8. Confirm form failure logs are visible in Railway.
9. Run a test enquiry after deploy.

## Final Recommendation

Use Railway logs and uptime monitoring as the minimum launch setup.

Add Sentry after David approves the provider and privacy settings.

Do not launch blind.

No PII in monitoring. No secrets in GitHub. No paid tool without approval.
