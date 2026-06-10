create table if not exists whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  entity_type text,
  entity_id uuid,
  trigger text not null,
  template_name text not null,
  recipient_hash text,
  provider_message_id text,
  status text not null default 'queued',
  error_code text,
  error_summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint whatsapp_messages_status_check check (status in ('queued', 'sent', 'delivered', 'read', 'failed', 'skipped'))
);

create index if not exists whatsapp_messages_entity_idx on whatsapp_messages(entity_type, entity_id, created_at desc);
create index if not exists whatsapp_messages_status_created_idx on whatsapp_messages(status, created_at desc);
create index if not exists whatsapp_messages_provider_id_idx on whatsapp_messages(provider_message_id);
