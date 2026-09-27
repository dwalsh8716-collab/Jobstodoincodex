# Google Workspace Production Setup

## Target Posture

This app is intended as a private internal Google Workspace tool for Essential
Resourcing, not a public marketplace app.

The production posture should be:

- Google Cloud project owned by the business.
- OAuth consent configured for internal Workspace use where available.
- OAuth client marked trusted by the Workspace administrator.
- Only the scopes needed by enabled features are requested.
- OAuth tokens are encrypted at rest.
- Gmail and Calendar failures are visible in the app.
- Candidate and client calendars are never connected in Version 1.

## OAuth Scopes

The app requests scopes dynamically:

- Always required:
  - `openid`
  - `email`
  - `profile`
  - `https://www.googleapis.com/auth/gmail.send`
  - `https://www.googleapis.com/auth/calendar.events`

- Required only when Gmail reply sync is enabled:
  - `https://www.googleapis.com/auth/gmail.readonly`

- Required only when recruiter calendar conflict checks are enabled:
  - `https://www.googleapis.com/auth/calendar.freebusy`

Recommended default:

```txt
ENABLE_GMAIL_REPLY_SYNC=true
CHECK_RECRUITER_CALENDAR_CONFLICTS=false
```

This lets the app send emails, sync replies, create calendar invites and Google
Meet links, while not blocking candidate/client scheduling on the recruiter's
diary.

## Google Verification Notes

Gmail read scopes can be restricted. Google states that restricted scopes can
require OAuth verification and, where data is stored or transmitted, a security
assessment. Google also documents exceptions, including internal use within an
organisation and domain-wide/internal Workspace deployments.

For this one-person internal Workspace use case:

1. Keep the OAuth app internal to the Workspace organisation where possible.
2. In Google Admin, trust the app/client ID for Workspace API access.
3. Keep scope use minimal and aligned to the implemented features.
4. Do not publish the app externally without reviewing Google's OAuth
   verification requirements.
5. Keep the privacy/security docs current.

## Required Google APIs

Enable:

- Gmail API
- Google Calendar API
- OpenID Connect userinfo through OAuth

## Production Environment

Set:

```txt
APP_ENV=production
APP_BASE_URL=https://ops.example.co.uk
API_BASE_URL=https://api-or-same-host.example.co.uk
EMAIL_PROVIDER=gmail
CALENDAR_PROVIDER=google
ENABLE_AUTOMATION_WORKER=true
ENABLE_GMAIL_REPLY_SYNC=true
CHECK_RECRUITER_CALENDAR_CONFLICTS=false
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_REDIRECT_URI=https://api-or-same-host.example.co.uk/api/integrations/google/callback
GOOGLE_OAUTH_HOSTED_DOMAIN=essentialresourcing.co.uk
GOOGLE_OAUTH_LOGIN_HINT=
ENCRYPTION_KEY=...
SESSION_SECRET=...
```

`GOOGLE_OAUTH_HOSTED_DOMAIN` hints the Google account picker towards the
company Workspace account. `GOOGLE_OAUTH_LOGIN_HINT` can be set to the exact
Workspace email address when the app is only ever used by one recruiter.

If Google shows "this client is restricted to users within its organisation",
the browser has tried to connect a personal Gmail account. Choose the company
Workspace account instead. For personal Gmail testing, the Google OAuth consent
screen would need to be changed from internal to external and reviewed against
Google's scope rules.

## Operating Model

Daily:

- Check Alerts.
- Check Needs Approval.
- Check Reschedules.

Weekly:

- Confirm backups exist.
- Review failed emails/calendar events.
- Review unmatched Gmail reply count.

Before Real Production:

- Move from SQLite to PostgreSQL.
- Add managed backups.
- Add secure HTTPS hosting.
- Add login rate limits at the edge as well as in app.
- Test restore from backup.
