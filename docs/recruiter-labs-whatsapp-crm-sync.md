# Recruiter Labs WhatsApp CRM Sync

Last checked: June 11, 2026.

## Status

Discovery only.

Safe for private prototype planning. Not production ready. No live Loxo API
calls. No live WhatsApp CRM sync. No real messages sent. No personal WhatsApp
scraping. No candidate message bodies stored.

The right target is simple:

```txt
WhatsApp speeds up logistics. Loxo remains the candidate CRM.
```

This is not legal advice. Before live use, David needs provider, privacy,
retention, opt-out and Loxo approval.

## Audit Summary

Already existed:

- Public WhatsApp contact links using `wa.me`.
- Server-side WhatsApp Business Cloud API client, disabled by default.
- WhatsApp webhook route with Meta signature verification support.
- 24-hour customer service window handling.
- Metadata-only `whatsapp_messages` table.
- `FEATURE_WHATSAPP_CRM_SYNC=false`.
- Loxo reference fields for candidates, companies, jobs, applications and
  handoff records.
- ADRs saying Loxo remains the primary CRM and WhatsApp is for logistics, not
  negative news.

Added in this pass:

- Private route:

```txt
/admin/recruiter-labs/whatsapp-crm-sync
```

- Server-only discovery helper:

```txt
src/lib/recruiter-labs-whatsapp-crm-sync.ts
```

- Metadata-only schema draft:

```txt
database/migrations/025_whatsapp_loxo_crm_discovery.sql
```

- Future feature flags:

```txt
FEATURE_LOXO_INTEGRATION=false
FEATURE_WHATSAPP_MESSAGE_LOGGING=false
FEATURE_WHATSAPP_LOGISTICS_AUTOMATION=false
```

- Loxo env placeholders with no secrets committed:

```txt
LOXO_API_BASE_URL=https://app.loxo.co/api
LOXO_AGENCY_SLUG=
LOXO_API_TOKEN=
```

## Discovery Summary

### Loxo

Public Loxo docs support the idea that a future integration may be possible,
but they do not prove David's current plan includes API access.

Useful public evidence:

- Loxo API index:
  <https://loxo.readme.io/llms.txt>
- Loxo API auth:
  <https://loxo.readme.io/reference/loxo-api.md>
- People search:
  <https://loxo.readme.io/reference/peopleindex.md>
- Person phones:
  <https://loxo.readme.io/reference/person_phonesindex.md>
- Person SMS opt-ins:
  <https://loxo.readme.io/reference/person_sms_opt_inscreate.md>
- Person events:
  <https://loxo.readme.io/reference/person_eventscreate.md>
- Webhooks:
  <https://loxo.readme.io/reference/webhookscreate.md>
- SMS endpoint:
  <https://loxo.readme.io/reference/smscreate.md>

Public Loxo marketplace evidence:

- Loxo marketplace:
  <https://www.loxo.co/loxo-marketplace>

The marketplace page currently lists:

- Ringover, including calls, video, SMS, WhatsApp, call summaries and activity
  in Loxo.
- TalentLynk, including WhatsApp, SMS or email from a Loxo contact page with
  activity synced.
- Payemoji, including targeted or bulk WhatsApp messages and conversational AI.

That makes Loxo-native or Loxo-marketplace validation the first commercial
route. It is lower risk than a custom sync layer.

### WhatsApp Providers

Options to compare:

| Option                                  | View                | Notes                                                                                                        |
| --------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------ |
| Ringover via Loxo marketplace           | First check         | Likely best first conversation because it is already presented as Loxo-connected.                            |
| TalentLynk via Loxo marketplace         | First check         | Strong fit if contact-page messaging and synced activity work as described.                                  |
| Payemoji via Loxo marketplace           | Hold                | Review, but do not pick by default. Bulk/targeted messaging is not aligned to this site's no-spam principle. |
| Meta WhatsApp Business Cloud API direct | Possible            | Site already has a staged direct Cloud API path, but custom ownership is higher.                             |
| Twilio WhatsApp                         | Shortlist if custom | Mature WhatsApp sender, sandbox and messaging docs: <https://www.twilio.com/docs/whatsapp>.                  |
| Bird                                    | Compare only        | Mainstream provider. No Loxo-specific proof found in this pass: <https://developers.bird.com>.               |
| Infobip                                 | Compare only        | Mainstream provider. No Loxo-specific proof found in this pass: <https://www.infobip.com/docs/whatsapp>.     |
| Zapier / Make                           | Hold                | Useful for low-risk metadata testing, risky for private message payloads.                                    |
| WatBox / Stitch AI                      | Blocked for now     | Named as discovery candidates only. No reliable public Loxo-specific evidence confirmed in this pass.        |

## Architecture Recommendation

### Option A: Loxo Native Or Marketplace

Preferred first.

Ask Loxo whether Ringover, TalentLynk or another supported communication partner
can give David:

- official WhatsApp Business messaging
- shared inbox or shared communication visibility
- candidate record activity logging
- opt-in and opt-out handling
- DPA/subprocessor documentation
- export/deletion support
- minimal setup work

This is the best route if it avoids turning the website into a second CRM.

### Option B: WhatsApp Provider Plus Loxo API

Second choice.

Use official WhatsApp Business infrastructure through Meta, Twilio, Bird,
Infobip or another approved provider.

Then use Loxo API only for:

- candidate/person lookup
- opt-in status if Loxo can hold it
- person event or activity note creation
- webhook-driven sync events

The website database should store metadata, not conversation content.

### Option C: Lightweight Custom Sync Layer

Last resort.

Only consider this if marketplace/native options fail and David approves the
operational burden.

Possible shape:

1. WhatsApp Business webhook receives message/status event.
2. Webhook verifies provider signature.
3. Server hashes the phone number.
4. Postgres stores provider ID, direction, message type, status and hash.
5. Candidate match is allowed only on one exact private match.
6. Loxo person event is created with a short metadata note, not a raw message
   dump.
7. Failures create manual review tasks.

Do not build a custom shared inbox inside the website unless David explicitly
decides to own that product.

## Data Model Draft

Migration:

```txt
database/migrations/025_whatsapp_loxo_crm_discovery.sql
```

Tables:

- `whatsapp_conversations`
- `crm_sync_events`
- `candidate_communication_preferences`

Extended table:

- `whatsapp_messages`

Data rules:

- Store phone hashes, not raw phone numbers, in sync tables.
- Store provider message IDs and statuses.
- Store `conversation_id` and `loxo_sync_status` where useful.
- Store opt-in and opt-out state.
- Do not store raw WhatsApp message bodies.
- Do not store Loxo access tokens.
- Do not dump raw Loxo payloads.
- Do not put any of this in Sanity.

## Message Policy

Allowed WhatsApp use:

- interview confirmation
- approved address/location drop
- Google Meet link
- reminder 24 hours before
- reminder 1 hour before
- availability check
- reschedule request
- document reminder
- application received acknowledgement
- "David has sent you an email"
- "Can you confirm availability?"

Banned by default:

- rejection
- offer withdrawal
- difficult feedback
- sensitive salary negotiation
- disciplinary or sensitive matters
- bulk job broadcasts
- speculative marketing campaigns
- anything that should be a human phone call

Hard rule:

```txt
Negative news starts with a human phone call.
```

## Consent Model

Before WhatsApp communication:

- candidate provides a mobile number
- candidate selects or accepts WhatsApp as a contact method
- purpose is operational and clear
- WhatsApp is optional
- opt-out is available
- marketing consent is separate
- message templates are approved where required
- retention/deletion route is documented

If a candidate opts out, WhatsApp stops. Email or phone remains available.

## Private Prototype

Route:

```txt
/admin/recruiter-labs/whatsapp-crm-sync
```

Properties:

- protected by CMS session
- noindexed
- fake timeline only
- feature flags visible
- no live WhatsApp sends
- no Loxo API calls
- no real candidate data
- provider comparison shown
- Loxo questions shown

## Loxo Questions For David

1. Does my Loxo plan include Open API access?
2. Can I create candidate/person activities or notes via API?
3. Can I search people by phone number or email via API?
4. Can custom fields store WhatsApp consent and contact preference?
5. Does Loxo support webhooks for person and person_event changes?
6. Does Loxo have a native WhatsApp Business integration?
7. Which WhatsApp/SMS partners does Loxo officially support for my plan?
8. Can message history or message metadata be synced to candidate records?
9. Do you support shared inbox workflows for recruiters?
10. Is there a sandbox or test API environment?
11. What OAuth, bearer-token or API-key authentication method is used?
12. What rate limits apply?
13. Can API permissions be restricted to people, events, phones and webhooks?
14. Do you provide GDPR, DPA and subprocessor documentation for integrations?

## Launch Blockers

Live use is blocked until:

- David chooses Loxo-native/marketplace/provider/custom route
- Loxo confirms API or partner support on David's plan
- Meta/WhatsApp Business setup is approved if direct Cloud API is used
- provider DPA and subprocessor terms are reviewed
- candidate consent and opt-out wording is approved
- retention/deletion policy is approved
- Railway Postgres migrations are run
- secrets are added in Railway, not GitHub
- `WHATSAPP_BUSINESS_APP_SECRET` is set before live webhook sync
- feature flags are explicitly approved for the release stage
- test candidate data is used before real candidate data

## Testing Checklist

Discovery/prototype now:

- private route only
- feature flags off by default
- no real messages sent
- no real Loxo data pulled
- mock timeline uses fake data
- docs created
- env vars not required for prototype
- no secrets added
- build, typecheck and lint pass

Future integration:

- test with Loxo sandbox/test account only
- test WhatsApp provider sandbox only
- test signature verification
- test opt-in
- test opt-out
- test candidate matching by exact private hash only
- test duplicate/ambiguous candidate match
- test CRM sync failure
- test retry and idempotency
- test DSAR/export implications
- test retention/deletion implications
- test no PII in public analytics

## Production Readiness

Not ready.

Discovery only.

Safe for private prototype.

Blocked before live use.

Final principle:

```txt
WhatsApp should speed up logistics, not replace human judgement.
Loxo should remain the candidate CRM source of truth if possible.
No personal WhatsApp data silos.
No sensitive bad news by WhatsApp.
No bulk spam.
No secrets.
No faff.
```
