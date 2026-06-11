create table if not exists whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete set null,
  loxo_candidate_id text,
  phone_hash text not null,
  status text not null default 'open',
  consent_status text not null default 'unknown',
  last_message_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint whatsapp_conversations_status_check check (
    status in ('open', 'needs_review', 'opted_out', 'closed', 'archived')
  ),
  constraint whatsapp_conversations_consent_status_check check (
    consent_status in ('unknown', 'opted_in', 'opted_out', 'withdrawn')
  )
);

create index if not exists whatsapp_conversations_candidate_idx
  on whatsapp_conversations(candidate_id, updated_at desc)
  where candidate_id is not null;

create index if not exists whatsapp_conversations_loxo_candidate_idx
  on whatsapp_conversations(loxo_candidate_id, updated_at desc)
  where loxo_candidate_id is not null;

create unique index if not exists whatsapp_conversations_phone_hash_unique
  on whatsapp_conversations(phone_hash)
  where archived_at is null;

alter table whatsapp_messages
  add column if not exists conversation_id uuid references whatsapp_conversations(id) on delete set null,
  add column if not exists redaction_policy text not null default 'metadata_only',
  add column if not exists loxo_sync_status text not null default 'not_attempted',
  add column if not exists loxo_person_event_id text,
  add column if not exists loxo_synced_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'whatsapp_messages_redaction_policy_check'
  ) then
    alter table whatsapp_messages
      add constraint whatsapp_messages_redaction_policy_check check (
        redaction_policy in ('metadata_only', 'redacted_summary')
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'whatsapp_messages_loxo_sync_status_check'
  ) then
    alter table whatsapp_messages
      add constraint whatsapp_messages_loxo_sync_status_check check (
        loxo_sync_status in ('not_attempted', 'pending', 'synced', 'failed', 'manual_review', 'skipped')
      );
  end if;
end $$;

create index if not exists whatsapp_messages_conversation_idx
  on whatsapp_messages(conversation_id, created_at desc)
  where conversation_id is not null;

create index if not exists whatsapp_messages_loxo_sync_status_idx
  on whatsapp_messages(loxo_sync_status, updated_at desc);

create table if not exists crm_sync_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  crm text not null,
  related_entity_type text not null,
  related_entity_id uuid,
  external_entity_id text,
  action text not null,
  status text not null default 'pending',
  idempotency_key text,
  error_summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint crm_sync_events_provider_check check (
    provider in ('whatsapp_business_cloud_api', 'twilio', 'ringover', 'talentlynk', 'payemoji', 'bird', 'infobip', 'zapier', 'make', 'manual', 'other')
  ),
  constraint crm_sync_events_crm_check check (
    crm in ('loxo', 'postgres', 'manual_review')
  ),
  constraint crm_sync_events_action_check check (
    action in ('message_received', 'message_status_updated', 'person_event_create', 'candidate_match', 'opt_in_update', 'opt_out_update', 'manual_review')
  ),
  constraint crm_sync_events_status_check check (
    status in ('pending', 'synced', 'failed', 'skipped', 'manual_review', 'blocked')
  )
);

create index if not exists crm_sync_events_entity_idx
  on crm_sync_events(related_entity_type, related_entity_id, created_at desc);

create index if not exists crm_sync_events_external_idx
  on crm_sync_events(provider, crm, external_entity_id, created_at desc)
  where external_entity_id is not null;

create unique index if not exists crm_sync_events_idempotency_unique
  on crm_sync_events(provider, crm, idempotency_key)
  where idempotency_key is not null;

create table if not exists candidate_communication_preferences (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  loxo_candidate_id text,
  preferred_contact_method text not null default 'email',
  whatsapp_consent_status text not null default 'unknown',
  whatsapp_opt_in_at timestamptz,
  whatsapp_opt_out_at timestamptz,
  last_whatsapp_message_at timestamptz,
  communication_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint candidate_communication_preferences_method_check check (
    preferred_contact_method in ('email', 'phone', 'whatsapp', 'linkedin', 'no_preference')
  ),
  constraint candidate_communication_preferences_whatsapp_consent_check check (
    whatsapp_consent_status in ('unknown', 'opted_in', 'opted_out', 'withdrawn')
  ),
  constraint candidate_communication_preferences_opt_out_check check (
    whatsapp_consent_status not in ('opted_out', 'withdrawn') or whatsapp_opt_out_at is not null
  )
);

create unique index if not exists candidate_communication_preferences_candidate_unique
  on candidate_communication_preferences(candidate_id)
  where candidate_id is not null;

create index if not exists candidate_communication_preferences_loxo_candidate_idx
  on candidate_communication_preferences(loxo_candidate_id, updated_at desc)
  where loxo_candidate_id is not null;

create index if not exists candidate_communication_preferences_whatsapp_consent_idx
  on candidate_communication_preferences(whatsapp_consent_status, updated_at desc);
