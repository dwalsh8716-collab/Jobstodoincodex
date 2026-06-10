# Consent Mode V2 Setup

This is the technical consent-management audit and setup guide for Essential Resourcing.

It is not legal advice.

Analytics is not launch-ready unless consent is handled properly.

## Audit Result

### Existing Consent Banner / CMP

Status before this pass:

- A lightweight custom analytics banner existed.
- It was shown only when tracking environment variables were configured.
- It blocked non-essential tracking scripts until analytics consent was accepted.
- It allowed accept or decline.
- Consent was stored in local storage.
- It did not offer preference management.
- It did not offer an obvious reopen route.
- It did not link to the Cookie Policy or Privacy Policy.
- It did not implement Google Consent Mode V2 defaults and updates fully.

Status after this pass:

- The custom banner supports:
  - Accept all.
  - Reject non-essential.
  - Manage preferences.
  - Save preferences.
  - Cookie Policy link.
  - Privacy Policy link.
  - Stored analytics and marketing preferences.
  - Footer reopen button.
  - Keyboard-native controls.
  - Plain-English wording.
  - No pre-ticked boxes.
  - No dark-pattern copy.
- Known first-party analytics and marketing cookies are cleared when the matching category is rejected.

This is still an interim custom layer. A reputable CMP is recommended before real marketing tags are enabled.

## What Consent Mode V2 Is

Google Consent Mode V2 is a signalling layer for Google tags.

It tells Google whether consent has been granted or denied for storage and advertising-related data use.

It supports:

- `ad_storage`
- `analytics_storage`
- `functionality_storage`
- `personalization_storage`
- `security_storage`
- `ad_user_data`
- `ad_personalization`

## What Consent Mode V2 Does Not Do

Consent Mode is not a cookie banner.

It does not:

- Ask the user for consent.
- Replace a Cookie Policy.
- Replace a Privacy Policy.
- Decide whether your wording is lawful.
- Make every tag compliant automatically.
- Remove the need to configure GTM correctly.

The banner or CMP collects the user's choice. Consent Mode communicates that choice to Google tags.

## Current Technical Defaults

The site now sets the Google Consent Mode default before Google tags load:

```txt
ad_storage: denied
analytics_storage: denied
functionality_storage: denied
personalization_storage: denied
security_storage: granted
ad_user_data: denied
ad_personalization: denied
```

This is privacy-first for UK/EEA traffic.

When a user accepts or saves preferences, the site sends a consent update matching the selected categories.

## Preference Mapping

### Analytics accepted

```txt
analytics_storage: granted
```

GA4, Clarity and Hotjar may load only if configured.

### Marketing accepted

```txt
ad_storage: granted
personalization_storage: granted
ad_user_data: granted
ad_personalization: granted
```

LinkedIn Insight, Meta Pixel or advertising tags may load only if configured.

### Rejected

All non-essential analytics and marketing consent values remain denied.

Known first-party analytics and marketing cookies are cleared when a rejected category is saved.

The site should still work.

## Direct GA4 Approach

Environment variable:

```txt
NEXT_PUBLIC_GA_ID=
```

Current behaviour:

- Consent default is initialised before Google tags.
- Direct GA4 only loads when analytics consent is granted.
- Direct GA4 is suppressed when GTM is configured, to reduce duplicate pageview risk.
- GA4 events use safe payloads and do not send names, emails, phone numbers, CVs or message content.

Use this approach if David wants the simplest first launch setup.

## GTM Approach

Environment variable:

```txt
NEXT_PUBLIC_GTM_ID=
```

Current behaviour:

- Consent default is initialised before GTM loads.
- GTM loads only after analytics or marketing consent is granted.
- Consent updates are pushed before the GTM container is loaded for stored preferences and when a user saves choices.
- Direct GA4 does not also load when GTM is enabled.

Manual GTM setup:

1. Use a Consent Initialization trigger for consent setup tags.
2. Configure built-in consent checks for tags that support them.
3. Add additional consent checks for marketing tags.
4. Make GA4 tags require `analytics_storage`.
5. Make Google Ads or remarketing tags require `ad_storage`, `ad_user_data` and `ad_personalization`.
6. Use GTM Preview to confirm tags do not fire before consent.
7. Use Tag Assistant to check consent states.
8. Avoid adding hardcoded GA4 snippets outside GTM.

If using a CMP with a GTM template, follow that CMP's official template instructions.

## Recommended CMP Approach

The safest production approach is to use a reputable CMP before enabling marketing or advertising tags.

Shortlist:

- Cookiebot: strong fit for small to mid-size sites, common Consent Mode/GTM integrations, good first option to evaluate.
- CookieYes: practical SMB option, common Google Consent Mode support, often quick to implement.
- Civic Cookie Control: UK/EU-suitable and worth evaluating for a UK business.
- Osano: strong governance option, likely more than needed unless wider compliance management is wanted.
- OneTrust: enterprise-grade, powerful, usually heavier and more expensive than this project needs.
- Complianz: strong in WordPress contexts; less obvious for this custom Next.js setup.
- FitConsent: can be evaluated, but it is not a requirement and should not be selected just because someone mentioned it.

Recommendation:

Start by comparing Cookiebot, CookieYes and Civic Cookie Control for:

- UK/EU support.
- Google Consent Mode V2 support.
- GTM template quality.
- Accessibility.
- Plain-English banner customisation.
- Cost at expected traffic level.
- Ease of adding policy text and cookie declarations.
- Whether it can run cleanly inside a Next.js App Router site.

Do not install or pay for a CMP without David's approval.

## Environment Variables

Current tracking variables:

```txt
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_LINKEDIN_PARTNER_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_CLARITY_ID=
NEXT_PUBLIC_HOTJAR_ID=
GOOGLE_SITE_VERIFICATION=
```

Rules:

- Keep IDs in environment variables.
- Do not hardcode IDs.
- Do not commit secrets.
- Do not enable more tools than needed.
- Prefer GA4 direct for a simple launch.
- Prefer GTM when multiple tags or a CMP template will manage tags.

## Current Cookie Banner Requirements

Implemented:

- Accept all.
- Reject non-essential.
- Manage preferences.
- Save preferences.
- Cookie Policy link.
- Privacy Policy link.
- Stored preferences.
- Known first-party analytics and marketing cookie cleanup when categories are rejected.
- Footer reopen route.
- Keyboard-native controls.
- Screen reader labels through semantic buttons, links and checkboxes.
- Fixed panel to avoid page layout shift.
- No forced blocking of essential site use.

Still manual:

- Legal wording review.
- Final cookie table once real tools are enabled.
- CMP vendor approval if a CMP is selected.
- Production Tag Assistant and browser cookie checks.

## QA Checklist

### Before accepting cookies

- Banner is visible when tracking env vars are configured.
- No GA4 analytics cookies are set where consent is required.
- Consent default shows analytics and ad storage denied.
- GA4/GTM does not fire in a non-compliant way.
- Cookie banner can be used by keyboard.
- Cookie and Privacy links work.

### After accepting all

- Consent update switches analytics and marketing categories to granted.
- GA4 pageview/event tracking works if `NEXT_PUBLIC_GA_ID` is configured.
- GTM container loads if `NEXT_PUBLIC_GTM_ID` is configured.
- CTA events fire correctly.
- GA4 Realtime receives events.

### After rejecting non-essential

- Analytics and ad storage stay denied.
- Non-essential tracking scripts do not load.
- Known first-party analytics and marketing cookies are cleared.
- Site still works.
- Forms still work.

### After managing preferences

- Analytics-only choice grants analytics storage and keeps ad storage denied.
- Marketing choice grants advertising-related consent values.
- Stored preference updates.
- Footer Cookie preferences button reopens the panel.
- Changing preferences updates behaviour.

### Extra checks

- Incognito browser.
- Mobile viewport.
- Keyboard-only use.
- Screen-reader-friendly labels where practical.
- Browser dev tools Application > Cookies and Local Storage.
- Google Tag Assistant.
- GTM Preview if GTM is used.
- GA4 Realtime if GA4 is used.

## Legal Review Warning

This implementation is a technical readiness layer.

It does not decide:

- Whether analytics consent wording is legally sufficient.
- Which cookies must be listed.
- Whether legitimate interest applies.
- How long candidate or enquiry data should be retained.
- Whether marketing pixels are appropriate.

David must approve the final tools and get the policy wording reviewed before launch.

## Final Launch Rule

No fake compliance.

No duplicate tags.

No tracking before consent where consent is required.

No dark patterns.

No secrets in GitHub.

No faff.
