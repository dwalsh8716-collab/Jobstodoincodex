# Recruiter Labs Candidate WhatsApp Preferences

Audit date: 11 June 2026

## Status

Staged and safe.

The site now supports clearer candidate communication preferences without
turning job pages into a WhatsApp funnel.

Feature flag:

```txt
FEATURE_CANDIDATE_WHATSAPP_QUESTIONS=false
```

The current public behaviour is simple:

- user-initiated `wa.me` links
- job-specific prefilled WhatsApp question messages
- preferred contact method captured on candidate/job forms
- explicit WhatsApp reply consent required for candidate/job WhatsApp preference
- no automatic WhatsApp sends unless the future WhatsApp Business API path is
  configured and the candidate has opted in

## Audit Summary

Already existed:

- central WhatsApp helper in `src/lib/whatsapp.ts`
- direct WhatsApp button component
- candidate and job forms with `preferredContactMethod`
- phone required when phone or WhatsApp is selected
- general application/contact consent
- separate Candidate Privacy Notice acknowledgement
- optional talent-pool consent
- WhatsApp Business API disabled by default
- no WhatsApp widget, chatbot, tracking pixel or floating bubble
- future metadata-first WhatsApp/Loxo discovery

Improved here:

- explicit candidate WhatsApp reply consent checkbox
- server-side validation requiring that checkbox when a candidate/job applicant
  selects WhatsApp
- WhatsApp Business send guard now requires explicit candidate WhatsApp consent
- job page `wa.me` message includes job title and slug
- duplicate job-page WhatsApp CTA removed so WhatsApp stays useful, not pushy
- private database fields staged for email, phone and WhatsApp consent
- docs and tests updated

## Candidate Contact Routes Updated

Job detail pages now use one clear WhatsApp route:

```txt
Got a quick question before applying?
Message David on WhatsApp
```

The prefilled message includes role context:

```txt
Hi David, I've got a quick question about the [Job Title] role on Essential Resourcing. Job ref: [job-slug].
```

The same area also points candidates back to email/form and a quick call route
where useful, so WhatsApp is not the only option.

Candidate and job forms ask how David should contact the candidate about the
application or note.

Supported preferences:

- email
- phone
- WhatsApp
- no preference

## Preference Fields Added Or Reused

Already reused:

- `preferredContactMethod`
- candidate contact consent
- Candidate Privacy Notice acknowledgement
- optional talent-pool consent

Added/staged:

- `whatsappContactConsent`
- `whatsapp_contact_consent`
- `phone_contact_consent`
- `email_contact_consent`
- `communication_notes`

Migration:

```txt
database/migrations/026_candidate_communication_preferences.sql
```

The migration covers `enquiries` and future `applications` records.

## WhatsApp Behaviour

Current:

- Direct links open WhatsApp.
- Candidates control whether they send the message.
- No site-side WhatsApp message is sent from the direct link.
- Job detail links include job title and slug in the prefilled message.
- WhatsApp clicks use the existing consent-aware analytics attributes and do
  not include candidate names, emails, phone numbers or message text.

Future:

- WhatsApp Business API acknowledgement.
- Application updates.
- Interview scheduling logistics.
- Reminders.

Future WhatsApp automation stays blocked until:

- Meta/WhatsApp Business API is configured.
- Templates are approved.
- Railway/Postgres is migrated.
- Consent wording is reviewed.
- Opt-out handling is approved.
- David approves the workflow.

## Privacy Safeguards

- WhatsApp preference is not marketing consent.
- Talent-pool consent stays separate.
- Candidates must add a phone number for WhatsApp or phone preference.
- Candidate/job WhatsApp Business sends require explicit
  `whatsappContactConsent`.
- No raw WhatsApp message bodies are stored in Sanity, analytics or public docs.
- No bulk WhatsApp broadcasts.
- No negative news by WhatsApp.
- No automatic sends from AI output.

This is technical implementation guidance, not legal advice.

## Blockers

Still blocked before live WhatsApp automation:

- legal/privacy review of WhatsApp wording
- WhatsApp Business template approval
- opt-out process
- provider/DPA review
- live Railway/Postgres configuration
- retention and deletion rules
- David approval

Make candidate communication easy, but not pushy. Respect preference. Use
WhatsApp carefully. No spam. No faff.
