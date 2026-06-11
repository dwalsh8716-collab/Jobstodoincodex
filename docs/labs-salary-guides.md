# Labs Salary Guides

Audit date: 11 June 2026

## Status

Private preview.

The salary guide lead-capture route already exists at `/salary-guides`. This
work keeps that implementation, adds a protected Labs admin view at
`/admin/labs/salary-guides`, and tightens the private lead model so David can
track serious B2B guide requests properly when he chooses to launch.

The feature remains hidden from navigation, noindexed while private, and out of
the sitemap until `FEATURE_SALARY_GUIDE_GATE=true`.

## Feature Flag

```bash
FEATURE_SALARY_GUIDE_GATE=false
```

Keep the flag `false` until the guide asset, privacy wording, Railway Postgres,
email delivery and lead-access rules are approved.

## What Already Existed

- `/salary-guides` public preview route
- `/salary-guides/thanks` confirmation route
- `SalaryGuideLeadForm`
- `/api/salary-guide`
- private Postgres table `salary_guide_leads`
- consent records for contact and optional marketing consent
- honeypot, completion-time and rate-limit checks
- no PII analytics event for the conversion
- sitemap exclusion until the feature flag is enabled

No duplicate form or duplicate salary guide route was added.

## What Was Added

- protected Labs preview route: `/admin/labs/salary-guides`
- Labs helper: `src/lib/labs-salary-guides.ts`
- roadmap status moved from idea to private preview
- admin dashboard link from `/admin/labs`
- migration `041_labs_salary_guide_asset_alignment.sql`
- lead status values: `new`, `reviewed`, `contacted`, `qualified`,
  `converted`, `closed`
- optional `guide_id`, `source_page`, `utm_source`, `utm_medium` and
  `utm_campaign` fields

## Guide Assets

The feature can support assets such as:

- North West Senior Marketing Salary Guide
- Manchester Agency Salary Guide
- Strategic Interim Day Rate Guide
- PR & Communications Salary Snapshot
- Marketing Director Salary Guide
- Head of Marketing Salary Guide
- Agency Client Services Salary Guide
- Digital/Performance Marketing Salary Snapshot

No salary figures should be invented in code, Sanity or test data.

## Lead Flow

1. David approves a useful salary guide asset.
2. Sanity can hold public guide copy and asset metadata.
3. The feature flag remains off until launch approval.
4. Visitor completes the request form when the route is launched.
5. Lead data is validated server-side.
6. Honeypot, completion-time and rate-limit checks run.
7. Lead is stored in private Postgres.
8. Contact and marketing consent are stored separately.
9. David is notified if email delivery is configured.
10. The requester receives the approved guide link if configured.
11. Follow-up status is handled privately.
12. Analytics records only a non-identifying conversion event.

## Data Model

Existing table:

```txt
salary_guide_leads
```

Core fields:

- `guide_id`
- `guide_slug`
- `guide_title`
- `name`
- `email`
- `company`
- `job_title`
- `phone`
- `hiring_interest`
- `consent_to_contact`
- `marketing_consent`
- `source_page`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `status`
- `delivery_status`
- `ip_hash`
- `user_agent_hash`
- `metadata`
- `created_at`
- `updated_at`

Private lead data belongs in Postgres, not Sanity.

## CMS Boundary

Sanity can manage public/editorial guide content:

- title
- slug
- summary
- target audience
- guide type
- year
- region
- roles covered
- intro copy
- key findings
- caveats
- downloadable asset metadata
- gated/public launch status
- SEO fields
- related services and insights
- CTA copy

Sanity must not store salary guide leads, private follow-up notes, raw consent
records or download tokens.

## Privacy Safeguards

- no fake salary data
- no public exposure of leads
- no PII in analytics
- no pre-ticked marketing consent
- contact and marketing consent are separate
- request metadata is hashed where it identifies a visitor
- the page is noindexed until approved
- the page is absent from sitemap output until the feature flag is enabled

## Manual Launch Gates

David must approve:

- final guide content or PDF
- `SALARY_GUIDE_DOWNLOAD_URL`
- privacy and cookie wording
- retention period for salary guide leads
- Railway Postgres production migration
- Resend or another approved email provider
- who can access salary guide leads
- whether extra anti-spam protection is needed

## Testing Checklist

- feature disabled by default
- `/salary-guides` noindexed while private
- `/salary-guides` absent from sitemap while the flag is off
- admin route protected by CMS session
- invalid submissions fail safely
- honeypot submissions are rejected
- too-fast submissions are rejected
- repeated submissions are rate-limited
- valid submissions write to Postgres after launch gate approval
- contact and marketing consent are recorded separately
- guide delivery only sends from the approved URL
- analytics event contains no name, email, phone or company

## Recommendation

This is technically staged well enough for private review. Do not publish it
until the guide itself, legal/privacy wording, database migration, delivery
provider and lead-access rules are signed off.

Useful first. Gated carefully. No fake data. No faff.
