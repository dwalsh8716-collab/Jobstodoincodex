# WhatsApp Contact Integration

## Summary

WhatsApp is now a direct contact route for Essential Resourcing without replacing the contact form, email, booking routes or job application flow.

Primary line:

```txt
Fastest way to reach me? Message me on WhatsApp.
```

The integration uses direct `wa.me` links only. It does not add a WhatsApp widget, chatbot, tracking pixel or intrusive floating bubble.

Future WhatsApp Business and Loxo CRM sync is a separate Recruiter Labs
discovery item, not part of these public contact buttons:

```txt
docs/recruiter-labs-whatsapp-crm-sync.md
docs/recruiter-labs-candidate-whatsapp-preferences.md
```

## Current Decision

WhatsApp should be primary where speed is commercially useful:

- Mobile sticky contact route.
- Mobile menu quick action.
- Homepage hero.
- Contact page.
- Strategic Interim page and urgent interim CTAs.

WhatsApp should be secondary where a more detailed route still matters:

- Service pages.
- Candidate page.
- Jobs list and job detail pages.
- Homepage final CTA.
- Article, case study and salary snapshot CTA blocks.
- Footer contact details.

Email, form or booking should remain primary where detail, governance or structure matters:

- Full client briefing.
- Candidate/job application flow.
- Contact form submissions.
- Any future retained-search brief forms.
- Legal, privacy, cookie and policy pages.

WhatsApp should not appear as a spammy floating widget, forced popup, embedded chat service, or replacement for proper form handling.

## Configuration

The code has one central WhatsApp helper at:

```txt
src/lib/whatsapp.ts
```

Runtime configuration is supported through:

```txt
NEXT_PUBLIC_WHATSAPP_NUMBER
NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE
```

The production number should use digits only:

```txt
447824514296
```

The default public message is:

```txt
Hi David, I've been on the Essential Resourcing website and wanted to speak to you.
```

## Configured Messages

General:

```txt
Hi David, I've been on the Essential Resourcing website and wanted to speak to you.
```

Hiring:

```txt
Hi David, I'm hiring and wanted to speak to you about a marketing or communications role.
```

Strategic Interim:

```txt
Hi David, I'd like to speak to you about strategic interim support.
```

Candidates:

```txt
Hi David, I've seen Essential Resourcing and wanted to speak to you about my next move.
```

Jobs:

```txt
Hi David, I've got a quick question about the [Job Title] role on Essential Resourcing. Job ref: [job-slug].
```

## CMS Support

Sanity Site Settings now include editor-friendly WhatsApp fields:

- WhatsApp Business number.
- WhatsApp button text.
- Default WhatsApp message.
- WhatsApp hiring message.
- WhatsApp candidate message.
- WhatsApp strategic interim message.
- Show WhatsApp buttons on the website?
- Show WhatsApp in the mobile menu?
- Show WhatsApp in the footer?
- Show WhatsApp on the contact page?

The editor guide is here:

```txt
docs/sanity-editor-guide.md
```

## Analytics

WhatsApp clicks are tracked as:

```txt
whatsapp_click
```

Event attributes include location, CTA text, intent, service and job slug where relevant.

Tracking uses the existing consent-aware analytics layer. No WhatsApp pixel or third-party widget has been added.

## Privacy Notes

The Privacy Policy and Terms now mention WhatsApp as an external third-party service. Clicking a WhatsApp link opens WhatsApp and is subject to WhatsApp's own terms and privacy policy.

This is a technical implementation note, not legal advice. David should still have privacy and cookie wording reviewed before launch.

Candidate/job forms now require explicit WhatsApp reply consent when WhatsApp is
selected as the preferred contact method. This is not marketing consent and does
not allow broadcasts.

## Fallback Behaviour

If the WhatsApp number is invalid or unavailable, WhatsApp buttons do not render. The site falls back to the existing contact routes: form, email, booking and job application flows.

## Manual Launch Actions

David should approve before launch:

- The final WhatsApp Business number.
- The default pre-filled message wording.
- Whether WhatsApp should be visible in Sanity-controlled site settings.
- Privacy/cookie wording that mentions WhatsApp as an external service.
- Whether future marketing tracking tools should be connected to WhatsApp clicks. No such tools have been added here.
- Whether future WhatsApp/Loxo CRM sync should ever go live. It is discovery
  only and must not store raw WhatsApp message bodies or create bulk broadcasts.
