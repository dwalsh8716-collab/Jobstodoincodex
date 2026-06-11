alter table whatsapp_messages
  add column if not exists direction text not null default 'outbound',
  add column if not exists matched_candidate_id uuid references candidates(id) on delete set null,
  add column if not exists customer_service_window_expires_at timestamptz,
  add column if not exists response_policy text not null default 'approved_template_required';

alter table whatsapp_messages
  drop constraint if exists whatsapp_messages_status_check;

alter table whatsapp_messages
  add constraint whatsapp_messages_status_check check (
    status in ('queued', 'sent', 'delivered', 'read', 'failed', 'skipped', 'received')
  );

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'whatsapp_messages_direction_check'
  ) then
    alter table whatsapp_messages
      add constraint whatsapp_messages_direction_check check (
        direction in ('outbound', 'inbound', 'provider_status')
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'whatsapp_messages_response_policy_check'
  ) then
    alter table whatsapp_messages
      add constraint whatsapp_messages_response_policy_check check (
        response_policy in ('freeform_allowed', 'approved_template_required')
      );
  end if;
end $$;

create index if not exists whatsapp_messages_direction_created_idx
  on whatsapp_messages(direction, created_at desc);

create index if not exists whatsapp_messages_matched_candidate_idx
  on whatsapp_messages(matched_candidate_id, created_at desc)
  where matched_candidate_id is not null;

create unique index if not exists whatsapp_messages_incoming_provider_unique
  on whatsapp_messages(provider_message_id, trigger)
  where provider_message_id is not null
    and trigger in ('incoming_message', 'status_update');
