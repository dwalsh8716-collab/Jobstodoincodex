# WhatsApp Business Cloud API

## Status

Prepared, not fully live.

The site now has two levels of WhatsApp support.

Level 1:

- Direct `wa.me` links.
- Already live in the website UI.
- Good for user-initiated contact.

Level 2:

- Official WhatsApp Business Cloud API.
- Server-side only.
- Disabled by default.
- Prepared for transactional template messages after forms are submitted.
- Requires Meta Business setup before live use.

No chatbot, widget, broadcast list or WhatsApp inbox has been added.

## What Already Existed

- Central WhatsApp number/config.
- Reusable WhatsApp CTA component.
- Contact page, footer, mobile menu, job, candidate and service CTAs.
- `whatsapp_click` analytics event.
- Privacy Policy note that WhatsApp is an external third-party service.

## What Was Added

- Server-side WhatsApp Business client.
- Template selection for candidate, application, client and strategic interim submissions.
- Preferred contact method field on forms.
- Consent wording that covers WhatsApp only when selected.
- Disabled-by-default send attempt after successful form handling.
- Webhook verification route.
- Meta signature verification helper.
- Postgres migration for future WhatsApp message status records.
- Environment variable placeholders.
- Documentation and tests.

## Env Vars

```txt
WHATSAPP_BUSINESS_ENABLED=false
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCESS_TOKEN=
WHATSAPP_BUSINESS_VERIFY_TOKEN=
WHATSAPP_BUSINESS_APP_SECRET=
WHATSAPP_BUSINESS_DEFAULT_TEMPLATE=
WHATSAPP_BUSINESS_TEMPLATE_LANGUAGE=en_GB
WHATSAPP_BUSINESS_API_VERSION=v23.0
```

Never commit real values.

## Message Rules

The app only attempts a WhatsApp Business message when:

- `WHATSAPP_BUSINESS_ENABLED=true`
- required server env vars are present
- the user selected WhatsApp as preferred contact method
- the user provided a valid phone number
- the user accepted operational contact consent

If WhatsApp fails, the form does not fail. The error is logged without the candidate message, email, phone or CV data.

## Template Notes

Prepared triggers:

- `candidate_application_received`
- `candidate_enquiry_received`
- `client_hiring_enquiry_received`
- `strategic_interim_enquiry_received`

Templates may require approval in Meta Business Manager before production use.

Example candidate application template:

```txt
Hi {{1}}, thanks for applying for {{2}} through Essential Resourcing. David has received your application and will review it. Your details are handled privately for recruitment purposes. You can ask for your details to be deleted at any time.
```

## Webhook

Route:

```txt
/api/webhooks/whatsapp
```

GET verifies the Meta webhook challenge with `WHATSAPP_BUSINESS_VERIFY_TOKEN`.

POST verifies `x-hub-signature-256` when `WHATSAPP_BUSINESS_APP_SECRET` is set.

The route currently returns a safe status count. It does not store message contents or expose sensitive data.

## Database Preparation

Migration:

```txt
database/migrations/002_whatsapp_business_messages.sql
```

It creates a `whatsapp_messages` table for future status/activity tracking without storing raw phone numbers.

## Manual Meta Setup

David must do this before live Cloud API use:

1. Confirm the official WhatsApp Business account.
2. Create or confirm the Meta app.
3. Add the WhatsApp product.
4. Confirm the phone number ID.
5. Generate a production access token.
6. Add the webhook verify token.
7. Add the app secret.
8. Create and approve message templates.
9. Add env vars in Railway/Vercel.
10. Test with a real opted-in mobile number.

## Privacy Notes

This is transactional/recruitment communication only.

Do not use this for marketing broadcasts unless David explicitly approves that later and legal/privacy wording is updated.

No candidate names, emails, phone numbers, CV filenames or message content should be sent to analytics.

This is technical implementation guidance, not legal advice.
