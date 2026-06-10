# Sanity Editor Guide

## Public Content Only

Sanity is for public website content.

Do not store private candidate/client data, CVs, application records or internal
notes in Sanity.

Keep these out of Sanity:

- candidate names submitted through forms
- candidate email addresses or phone numbers
- CV files or CV URLs
- cover letters or private application messages
- private client contacts
- internal recruitment notes
- DSAR requests
- audit logs

Use Railway/Postgres for private operational data once it is configured.

Full boundary guide:

```txt
docs/data-boundaries.md
```

## WhatsApp Contact Settings

WhatsApp is managed from Site Settings when Sanity is connected.

Open:

```txt
Studio > Main Site > Site Settings
```

Fields:

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

Use the international number format with digits only.

Correct:

```txt
447824514296
```

Do not add spaces, brackets, plus signs or dashes.

The button opens WhatsApp directly. It does not add a WhatsApp pixel, chatbot or third-party widget.

Good button copy:

- Message David on WhatsApp.
- WhatsApp David.
- Talk to David on WhatsApp.

Keep the default message plain and human. For example:

```txt
Hi David, I've been on the Essential Resourcing website and wanted to speak to you.
```

Where WhatsApp appears:

- Mobile menu.
- Mobile sticky quick contact.
- Homepage hero and final CTA.
- Contact page.
- Service pages.
- Strategic Interim page.
- Candidate and jobs routes.
- Footer contact links.

If the WhatsApp number is removed or invalid, WhatsApp buttons should not render and the website falls back to the contact form, email and booking routes.
