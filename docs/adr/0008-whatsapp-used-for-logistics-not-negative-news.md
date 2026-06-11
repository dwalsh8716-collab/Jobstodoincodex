# 0008 - WhatsApp Is Used For Logistics, Not Negative News

## Status

Accepted.

## Context

WhatsApp is an important direct contact route for Essential Resourcing.

The public website already uses direct `wa.me` links for quick user-initiated
contact. WhatsApp Business Cloud API support is staged for transactional
messages, disabled by default and dependent on Meta setup.

Recruitment communication can be sensitive. WhatsApp should make logistics and
quick questions easier, not turn difficult news into a casual message.

Supporting docs:

- `docs/WHATSAPP-CONTACT-INTEGRATION.md`
- `docs/whatsapp-business-cloud-api.md`
- `docs/recruiter-labs-whatsapp-crm-sync.md`
- `docs/data-boundaries.md`

## Decision

Use WhatsApp for logistics, quick questions and opted-in transactional contact.

Good uses:

- user-initiated website contact
- quick candidate questions
- quick hiring questions
- interview logistics
- appointment reminders where consent and templates allow
- form follow-up only when WhatsApp was selected and consented to

Do not use WhatsApp as the channel for negative or sensitive recruitment news by
default.

Negative news, rejection, sensitive feedback, compensation issues, privacy
requests or disputed decisions need a more careful human route.

## Consequences

- WhatsApp remains fast and human without becoming spammy.
- The website can keep direct `wa.me` links without adding widgets, chatbots or
  pixels.
- WhatsApp Business API remains server-side, disabled by default and
  consent-aware.
- Future automation must respect templates, consent, privacy and tone.
- Interview logistics automation must use approved templates only and fall back
  to manual/email if consent, preference, confirmed timing or configuration is
  missing.
- Future Loxo CRM sync must stay metadata-first, use opted-in operational
  messages only and avoid raw WhatsApp message bodies.

## What Not To Do

- Do not add a cheap floating WhatsApp widget by default.
- Do not use WhatsApp for marketing broadcasts without a separate approved
  decision and legal/privacy review.
- Do not send automated rejection or negative-news messages by WhatsApp.
- Do not store raw WhatsApp message contents or phone numbers in analytics.
- Do not enable WhatsApp Business Cloud API without Meta setup, approved
  templates and Railway secrets.
