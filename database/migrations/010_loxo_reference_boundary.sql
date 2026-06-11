alter table companies
  add column if not exists loxo_company_id text;

alter table contacts
  add column if not exists loxo_contact_id text;

alter table candidates
  add column if not exists loxo_candidate_id text;

alter table jobs
  add column if not exists loxo_job_id text;

alter table applications
  add column if not exists loxo_application_id text,
  add column if not exists loxo_candidate_id text,
  add column if not exists loxo_job_id text;

alter table enquiries
  add column if not exists loxo_handoff_id text;

create unique index if not exists companies_loxo_company_id_unique
  on companies(loxo_company_id)
  where loxo_company_id is not null;

create unique index if not exists contacts_loxo_contact_id_unique
  on contacts(loxo_contact_id)
  where loxo_contact_id is not null;

create unique index if not exists candidates_loxo_candidate_id_unique
  on candidates(loxo_candidate_id)
  where loxo_candidate_id is not null;

create unique index if not exists jobs_loxo_job_id_unique
  on jobs(loxo_job_id)
  where loxo_job_id is not null;

create unique index if not exists applications_loxo_application_id_unique
  on applications(loxo_application_id)
  where loxo_application_id is not null;

create table if not exists integration_sync_events (
  id uuid primary key default gen_random_uuid(),
  integration_name text not null,
  direction text not null,
  entity_type text not null,
  local_entity_id uuid,
  external_entity_id text,
  operation text not null,
  status text not null default 'pending',
  idempotency_key text,
  error_summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint integration_sync_events_integration_check check (
    integration_name in ('loxo', 'whatsapp', 'google_calendar', 'email', 'sanity', 'other')
  ),
  constraint integration_sync_events_direction_check check (
    direction in ('inbound', 'outbound', 'manual_handoff')
  ),
  constraint integration_sync_events_status_check check (
    status in ('pending', 'sent', 'received', 'skipped', 'failed', 'needs_review')
  )
);

create index if not exists integration_sync_events_entity_idx
  on integration_sync_events(entity_type, local_entity_id, created_at desc);

create index if not exists integration_sync_events_external_idx
  on integration_sync_events(integration_name, external_entity_id, created_at desc);

create index if not exists integration_sync_events_status_idx
  on integration_sync_events(integration_name, status, created_at desc);

create unique index if not exists integration_sync_events_idempotency_unique
  on integration_sync_events(integration_name, idempotency_key)
  where idempotency_key is not null;
