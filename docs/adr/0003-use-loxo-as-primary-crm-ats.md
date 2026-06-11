# 0003 - Use Loxo As The Primary CRM/ATS

## Status

Accepted.

## Context

Essential Resourcing is a recruitment business. Candidate records, client
records, pipeline history, notes and search activity belong in a proper
recruitment CRM/ATS.

Existing documentation treats Loxo as the primary recruitment system and the
website as a public acquisition and workflow layer.

Supporting docs:

- `docs/data-boundaries.md`
- `docs/future-proof-architecture.md`
- `docs/backend-data-boundary-audit.md`
- `docs/recruiter-labs-whatsapp-crm-sync.md`

## Decision

Use Loxo as the primary CRM/ATS source of truth.

The website may collect enquiries, applications and workflow signals, but it
must not become the master recruitment database.

Postgres may store Loxo reference IDs, handoff status and sync/audit records
where useful.

Future WhatsApp/Loxo sync must write only minimal metadata or approved activity
notes back to Loxo. It must not turn Postgres into a second candidate CRM.

Loxo remains authoritative for:

- candidate records
- client/company recruitment records
- live pipeline state
- recruiter notes
- placements and search history
- CRM/ATS activity

## Consequences

- The website can stay focused and maintainable.
- Private website workflows can hand off to Loxo instead of duplicating it.
- Future integrations must be explicit about which system owns each piece of
  data.
- Sync work must minimise payloads and avoid storing raw Loxo dumps.

## What Not To Do

- Do not rebuild a full CRM inside the website.
- Do not treat website Postgres records as more authoritative than Loxo.
- Do not store Loxo API keys in the database or GitHub.
- Do not dump unnecessary Loxo PII into website tables.
- Do not create candidate ranking or decision systems outside David's approved
  recruitment workflow.
