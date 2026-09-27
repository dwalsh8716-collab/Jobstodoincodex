# Google Setup

Use Google OAuth when you want the local app to send real Gmail messages, sync
Gmail replies, create Google Calendar events and generate Google Meet links.

The app still works without Google. In that case it stays in safe mock mode.

## Google Cloud Setup

Create or use a Google Cloud project, then enable:

- Gmail API
- Google Calendar API

Create an OAuth web client.

Allowed redirect URI for local testing:

```txt
http://127.0.0.1:8005/api/integrations/google/callback
```

## Local Environment

Restart the backend with:

```bash
EMAIL_PROVIDER=gmail
CALENDAR_PROVIDER=google
GOOGLE_OAUTH_CLIENT_ID=your-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://127.0.0.1:8005/api/integrations/google/callback
GOOGLE_CALENDAR_ID=primary
APP_LOGIN_EMAIL=david@example.com
APP_LOGIN_PASSWORD=local-test-password
SESSION_SECRET=replace-this-with-a-long-random-secret
```

Do not commit real client secrets, refresh tokens or mailbox credentials.

## Dashboard Flow

1. Open the local app.
2. Log in.
3. Use `Connect Google`.
4. Approve the requested Gmail and Calendar permissions.
5. Return to the app.
6. Create a test interview using test email addresses.
7. Use `Sync Gmail Replies` to manually pull replies during local testing.

## What Google Does

Gmail:

- sends availability requests and confirmations
- adds `X-ER-Workflow-ID`
- includes the workflow ID in the subject as a fallback
- syncs recent replies manually from the dashboard

Google Calendar:

- creates the event only after recruiter approval
- invites candidate, client and interviewers
- creates a Google Meet link for Google Meet interviews
- does not access candidate or client calendars

## Current Testing Boundary

Manual Gmail sync is deliberate for this stage. Production should add:

- verified webhooks or scheduled background polling
- idempotent processing
- retry queues
- visible failure alerts
- stricter OAuth state verification
- calendar conflict checks before event creation
