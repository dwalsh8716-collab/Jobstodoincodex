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
- Feature-flagged webhook parsing and CRM activity sync staging.
- 24-hour customer service window handling for inbound WhatsApp messages.
- Feature-flagged interview logistics templates for future scheduled interviews.
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
FEATURE_WHATSAPP_CRM_SYNC=false
FEATURE_LOXO_INTEGRATION=false
FEATURE_WHATSAPP_MESSAGE_LOGGING=false
FEATURE_WHATSAPP_LOGISTICS_AUTOMATION=false
FEATURE_WHATSAPP_INTERVIEW_SCHEDULING=false
WHATSAPP_BUSINESS_INTERVIEW_CONFIRMATION_TEMPLATE=
WHATSAPP_BUSINESS_INTERVIEW_REMINDER_TEMPLATE=
WHATSAPP_BUSINESS_INTERVIEW_RESCHEDULE_TEMPLATE=
WHATSAPP_BUSINESS_INTERVIEW_LOCATION_TEMPLATE=
WHATSAPP_BUSINESS_INTERVIEW_AVAILABILITY_TEMPLATE=
LOXO_API_BASE_URL=https://app.loxo.co/api
LOXO_AGENCY_SLUG=
LOXO_API_TOKEN=
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
- `interview_confirmation`
- `interview_reminder`
- `interview_reschedule`
- `interview_location_drop`
- `interview_availability_check`

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

The route parses:

- inbound message events
- delivery/read/failure status updates
- Meta error codes and titles where supplied

With `FEATURE_WHATSAPP_CRM_SYNC=false`, the route only returns safe counts.

With `FEATURE_WHATSAPP_CRM_SYNC=true`, the route will only attempt private
Postgres writes when:

- `WHATSAPP_BUSINESS_ENABLED=true`
- `WHATSAPP_BUSINESS_APP_SECRET` is set
- `OPERATIONS_DB_ENABLED=true`
- `DATABASE_URL` is set
- `OPERATIONS_PRIVACY_SALT` or `CMS_GATE_SECRET` is set for hashing
- `database/migrations/014_whatsapp_crm_sync.sql` has been run

If the CRM sync flag is on but the app secret is missing, the POST endpoint
rejects the request. Do not run live sync without Meta signature validation.

The webhook does not store raw WhatsApp message content. It stores message type,
provider message ID, hashed phone value, delivery status, response policy and
safe metadata only.

## Candidate Matching

Candidate matching is deliberately conservative.

The webhook only links an inbound WhatsApp event to a candidate when:

- a private hash salt is available
- the inbound WhatsApp number can be normalised
- the stored candidate phone can be normalised
- the hashes match exactly
- exactly one candidate matches

If there is no match, or more than one possible match, the event stays unmatched.
The system does not guess, scrape personal WhatsApp data, or infer UK local
numbers from international numbers.

When a single safe match exists, the system adds a candidate activity saying a
WhatsApp message was received. The activity does not contain the message body.
Loxo write-back is not live yet. Use the Loxo boundary work before enabling any
external CRM write.

## 24-Hour Customer Service Window

Inbound WhatsApp messages open a 24-hour customer service window.

During that window, a freeform operational reply may be allowed, subject to
Meta's current rules and David's approved process.

After that window expires, the site should only send an approved WhatsApp
template. The webhook records the expiry time and response policy so future
interview logistics or CRM workflows do not accidentally send the wrong type of
message.

This is technical implementation guidance, not legal advice.

## Interview Logistics

Interview WhatsApp automation is staged, not live.

It is controlled by:

```txt
FEATURE_WHATSAPP_INTERVIEW_SCHEDULING=false
```

The helper only sends operational, approved-template messages for:

- interview confirmation
- interview reminders
- reschedule logistics
- location drops
- availability checks

It must not be used for:

- rejection
- offer withdrawal
- sensitive feedback
- salary negotiation
- bad news
- bulk marketing

Before an interview WhatsApp message can send, all of this must be true:

- the feature flag is `true`
- WhatsApp Business is enabled and configured
- the interview request is `scheduled`
- `interview_start_at` is set in Postgres
- the candidate has WhatsApp as the preferred contact method
- WhatsApp consent is explicitly recorded for that workflow
- a valid mobile number is available
- an approved Meta template name is configured or the default template name has
  been approved in Meta

If any of that is missing, the result is a manual/email fallback. That is
deliberate.

Physical address or map-link details are only included when
`location_approved_for_whatsapp=true`. Otherwise the template says David will
confirm the location separately.

Message attempts are logged to `whatsapp_messages` and linked back to
`recruiter_lab_interview_requests.whatsapp_message_id`. Status updates can then
arrive through the webhook route documented above.

## Database Preparation

Migration:

```txt
database/migrations/002_whatsapp_business_messages.sql
database/migrations/014_whatsapp_crm_sync.sql
database/migrations/025_whatsapp_loxo_crm_discovery.sql
```

These migrations create and extend a `whatsapp_messages` table for future
status/activity tracking without storing raw phone numbers or raw message text.

## Loxo CRM Sync Discovery

The future WhatsApp/Loxo sync is discovery only.

Private notes live in:

```txt
docs/recruiter-labs-whatsapp-crm-sync.md
```

Private admin route:

```txt
/admin/recruiter-labs/whatsapp-crm-sync
```

Current recommendation:

- Ask Loxo about native or marketplace options first.
- Review Ringover and TalentLynk before custom code.
- Treat Payemoji as one possible vendor, not a requirement.
- Keep custom WhatsApp Business Cloud API plus Loxo API write-back as a second
  or third-stage route.
- Do not enable CRM sync until consent, opt-out, DPA, retention, webhook
  signatures, database migrations and David approval are complete.

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
9. Run database migrations in Railway Postgres.
10. Add env vars in Railway.
11. Keep `FEATURE_WHATSAPP_CRM_SYNC=false` until David approves live sync.
12. Test with a real opted-in mobile number.
13. Use Meta webhook tooling to confirm delivery, status updates and retries.

## Privacy Notes

This is transactional/recruitment communication only.

Do not use this for marketing broadcasts unless David explicitly approves that later and legal/privacy wording is updated.

No candidate names, emails, phone numbers, CV filenames or message content should be sent to analytics.

This is technical implementation guidance, not legal advice.
