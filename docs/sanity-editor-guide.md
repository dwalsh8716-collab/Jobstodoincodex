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
- AI prompts, transcripts, draft candidate summaries, client profile drafts or
  AI output used to judge people
- private client contacts
- internal recruitment notes
- DSAR requests
- audit logs

Use Railway/Postgres for private operational data once it is configured.

Full boundary guide:

```txt
docs/data-boundaries.md
docs/sanity-cms-access.md
```

## How To Get In

Live site route:

```txt
/cms
```

After login, `/cms` gives David a simple choice:

- CMS Studio: public website content.
- Recruiter Labs: private future recruitment tools.
- Labs: private roadmap and product ideas.
- Private admin: enquiries, tasks and operations.

Studio route after login:

```txt
/studio
```

Recruiter Labs shortcut:

```txt
/recruiter-labs
```

This shortcut uses the same CMS gate and then opens:

```txt
/admin/recruiter-labs
```

Direct Sanity-hosted Studio:

```txt
https://essential-resourcing.sanity.studio/
```

The site-level CMS gate protects the branded entry point, the embedded Studio
route and the private admin/Labs areas. Use the same username and password for
CMS Studio, Recruiter Labs, Labs and private admin. Sanity then handles the
actual editor account permissions inside Studio.

If the CMS gate says setup is missing, add these in Railway:

```txt
CMS_GATE_USERNAME
CMS_GATE_PASSWORD
CMS_GATE_SECRET
```

Do not put passwords or Sanity tokens into GitHub issues or AI prompts.

## Main Editing Areas

Main Site:

- Homepage.
- Site Settings.
- Navigation.
- Pages.
- Redirects.

Commercial:

- Services.
- Case Studies.
- Case Studies page copy.
- Testimonials.
- FAQs.
- CTA Blocks.
- Logo / Proof Items.

Content:

- Insights / Posts.
- Insights page copy.
- Salary Guides / Snapshots.

Recruitment:

- Jobs.
- Jobs page copy.

People:

- Authors / David Walsh / Team.

## What The Core CMS Types Mean

- Posts are managed as Insights / Posts.
- Authors are managed as People records.
- Footer copy and footer navigation are managed in Site Settings and Navigation.
- Salary guide public landing content is managed in Salary Guides / Snapshots.

Do not create duplicate content just because the label is different. Use the
existing area unless David asks for a separate content type.

## Common Jobs

Edit the homepage:

1. Open Main Site.
2. Open Homepage.
3. Update copy, sections, media and CTAs.
4. Publish only when the page is ready.

Edit a service page:

1. Open Commercial.
2. Open Services.
3. Choose the service.
4. Keep copy plain, specific and commercially useful.
5. Use the plain-English search summary to explain the buyer problem the page
   answers.
6. Use search phrases as an editor checklist, not as copy to paste repeatedly.
   If the page would sound daft read aloud, rewrite it.

Add a job:

1. Open Recruitment.
2. Open Jobs and create a new Job record.
3. In **1. Role & pay**, enter the plain role title, generate the public URL,
   enter the actual hiring employer (or `confidential`), choose employment type,
   location and the real working/hybrid pattern. Use Remote possible = Yes only
   for a genuinely 100% remote role; say clearly that applicants may be based
   in the UK if that is the rule.
4. Enter the salary/rate minimum and maximum, pay period and visibility. The
   website formats the public range automatically. Choose Published range only
   when verified with the client; otherwise use Indicative range with honest
   caveat wording. Do not invent numbers. Salary is an Essential transparency
   rule, not a Google-required field.
5. In **2. The advert**, add a factual summary, full overview, responsibilities,
   must-haves and clear application notes. Add why the role exists, David's Take,
   useful extras, benefits and interview steps only when they add real detail.
6. In **3. Publish**, use the original posting date and the genuine closing
   date. Keep Status as Draft until the advert is complete; then choose Live
   and publish. The standard website application form and Candidate Privacy
   Notice are already in place.
   If the client has not confirmed interview stages, the site shows a clearly
   labelled typical process for this kind of role; do not invent steps.
7. Open the public `/jobs/your-role` URL. Check the advert, application route
   and Google's Rich Results Test. Inspect that URL in Search Console; Google
   can take time to discover and index it.

Detailed job standards live in:

```txt
docs/job-copy-standards.md
docs/recruiter-labs-candidate-process-transparency.md
```

Do not publish a role with:

- hidden or unverified salary
- vague hybrid wording
- unclear travel expectation
- no interview-process detail
- no clear data-handling note
- "Rockstar", "Ninja" or other recruitment nonsense

Publish an insight:

1. Open Content.
2. Open Insights / Posts.
3. Add title, slug, excerpt, author, dates, body and FAQs.
4. Publish only when the advice is sharp and checked.

Create salary guide public content:

1. Open Content.
2. Open Salary Guides / Snapshots.
3. Choose Salary guide landing page as the content format.
4. Keep the content public and market-level.
5. Do not add gated lead data, named candidates, client contacts or private
   salary notes.

Update navigation or footer:

1. Open Main Site.
2. Use Navigation for menu links.
3. Use Site Settings for footer copy, contact details and social links.

## Google Calendar Booking Settings

Booking is managed from Site Settings when Sanity is connected.

Open:

```txt
Studio > Main Site > Site Settings
```

Fields:

- Google Calendar booking link.
- Show booking option on the site?
- Booking button text.
- Booking section heading.
- Booking section intro.
- Show booking in the mobile menu?
- Show booking in the footer?
- Show booking on the contact page?
- Show booking on service pages?

Paste the Google Calendar Appointment Schedule booking page link. This lets
visitors book directly into David's Google Calendar when David has configured
Google Meet in the appointment schedule.

If the booking page changes:

1. Copy the new Google Calendar booking link.
2. Replace the old link in Site Settings or Railway env vars.
3. Check `/book-a-call`.
4. Test a booking with another email.
5. Confirm the Google Meet link is generated.

Leave the booking link blank to hide booking CTAs. WhatsApp, email and the
contact form will still work.

## Essential Resourcing Labs Ideas

Labs Ideas are for private feature planning only. They do not create public
pages and they are not queried by the public website.

Use Labs Ideas for:

- future feature ideas
- target user notes
- commercial purpose
- privacy and data-risk notes
- dependencies
- related GitHub issues
- related public content

Do not use Labs Ideas for:

- CV text
- candidate notes
- client contact records
- WhatsApp message content
- DSAR records
- secrets or access tokens

If a Labs idea needs private operational state later, that belongs in Postgres
behind the protected admin layer, not in Sanity planning content.

Invite another editor:

1. Go to `https://www.sanity.io/manage`.
2. Open the Essential Resourcing project.
3. Open Members.
4. Invite the person with Editor/Contributor access unless they genuinely need
   admin rights.

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
- WhatsApp fractional message.
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
- Fractional page.
- Candidate and jobs routes.
- Footer contact links.

If the WhatsApp number is removed or invalid, WhatsApp buttons should not render and the website falls back to the contact form, email and booking routes.

## LinkedIn Profile Settings

David's LinkedIn profile is managed from Site Settings when Sanity is connected.

Open:

```txt
Studio > Main Site > Site Settings
```

Fields:

- David LinkedIn profile URL.
- LinkedIn button label.
- Show LinkedIn link in the footer?
- Show LinkedIn link on the contact page?
- Show LinkedIn link in founder sections?

Use David's public profile URL:

```txt
https://www.linkedin.com/in/davidwalshmarketingsearch/
```

Do not paste private, admin-only or campaign URLs. LinkedIn is shown only where
it supports founder credibility: the About David page, homepage founder section,
contact page, footer and David-authored insight bylines. It should not replace
WhatsApp, booking or contact forms.
