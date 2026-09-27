# Deployment

## Deployment Goal

The app should run locally with Docker Compose first, then move to a private
production deployment when real integrations, authentication and data controls
are ready.

Potential private domain:

```txt
ops.essentialresourcing.co.uk
```

## Local Development

Recommended services:

- frontend: Next.js
- backend: FastAPI
- postgres: PostgreSQL
- redis: Redis
- worker: Celery worker
- scheduler: Celery beat or equivalent scheduler

Recommended local command later:

```txt
docker compose up
```

Phase 1 should use mocked providers and local test data.

## Environments

Recommended environments:

- local
- staging
- production

Production must not use mocked email or calendar providers unless explicitly in
maintenance mode.

## Required Environment Variables

Core:

```txt
APP_ENV=
APP_BASE_URL=
DATABASE_URL=
REDIS_URL=
SESSION_SECRET=
ENCRYPTION_KEY=
```

Auth:

```txt
AUTH_PROVIDER=
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
MICROSOFT_OAUTH_CLIENT_ID=
MICROSOFT_OAUTH_CLIENT_SECRET=
```

OpenAI:

```txt
OPENAI_API_KEY=
OPENAI_MODEL=
AI_CONFIDENCE_THRESHOLD=
```

Email:

```txt
EMAIL_PROVIDER=
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
MICROSOFT_GRAPH_CLIENT_ID=
MICROSOFT_GRAPH_CLIENT_SECRET=
```

Calendar:

```txt
CALENDAR_PROVIDER=
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
MICROSOFT_CALENDAR_CLIENT_ID=
MICROSOFT_CALENDAR_CLIENT_SECRET=
```

Scheduling:

```txt
DEFAULT_TIMEZONE=Europe/London
WORKING_HOURS_START=08:00
WORKING_HOURS_END=18:00
DEFAULT_INTERVIEW_START=09:00
DEFAULT_INTERVIEW_END=17:30
MAX_AUTOMATED_CHASES=2
```

## Production Readiness Gate

Do not deploy to production until:

- secure login is live
- HTTPS is enforced
- database backups are configured
- OAuth token encryption is implemented
- audit logs are working
- provider secrets are in a secret store
- error reporting is configured
- deletion and retention paths exist
- real email send rules have been tested
- real calendar idempotency has been tested
- reschedule and cancellation flows require approval

## Health Checks

Recommended checks:

- API health
- database connection
- Redis connection
- worker heartbeat
- scheduler heartbeat
- email provider connection status
- calendar provider connection status
- OAuth token expiry warnings

## Backups

Production database backups should include:

- encrypted daily backups
- retention policy
- restore test process
- restricted access

OAuth token encryption keys must be backed up separately and securely.

## Observability

Track:

- workflow failures
- email send failures
- calendar write failures
- OAuth expiry
- AI parse failures
- low-confidence extraction rate
- duplicate webhook rate
- reminders sent
- reminders failed
- worker queue depth

