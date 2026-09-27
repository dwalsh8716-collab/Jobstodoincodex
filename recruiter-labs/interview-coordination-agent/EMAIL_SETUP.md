# Email Setup

## Current Default

The app defaults to:

```txt
EMAIL_PROVIDER=mock
```

That means messages are written into the workflow and marked as `mock_sent`.
Nothing leaves the machine and no inbox receives an email.

This is deliberate for the safe local MVP.

## Quick Real-Email Test With SMTP

For a controlled local test, restart the backend with:

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-mailbox-app-password-or-smtp-password
SMTP_FROM_EMAIL=your-email@example.com
SMTP_FROM_NAME="David Walsh"
SMTP_USE_TLS=true
SMTP_USE_SSL=false
```

Then create a new interview using your own personal/work test addresses.

If SMTP is selected but not fully configured, messages will show as `failed`
inside the workflow with the provider error.

## Production Email Recommendation

SMTP is useful for quick testing, but it is not the recommended production
integration.

Production should use one of:

- Gmail API
- Microsoft Graph Mail

### Gmail API

Needed:

- Google Cloud project
- Gmail API enabled
- OAuth client ID and secret
- redirect URI for the app
- secure refresh token storage
- minimum send scope: `https://www.googleapis.com/auth/gmail.send`
- later reply monitoring scope, such as read-only or modify, depending on the
  approved inbox workflow

Current implementation:

- set `EMAIL_PROVIDER=gmail`
- configure Google OAuth
- connect Google from the dashboard
- use `Sync Gmail Replies` for controlled manual inbox monitoring while testing

See `GOOGLE_SETUP.md`.

### Microsoft Graph

Needed:

- Microsoft Entra app registration
- OAuth client ID and secret
- redirect URI for the app
- delegated `Mail.Send` permission for sending
- read permission later for reply monitoring
- secure refresh token storage

## What Is Still Mocked

When `EMAIL_PROVIDER=mock` or `CALENDAR_PROVIDER=mock`:

- no external email is delivered
- no real calendar event is created
- any meeting links are fake test links

When Google is configured and connected, Gmail sending, manual Gmail reply sync,
Google Calendar events and Google Meet links can be tested from the local app.
