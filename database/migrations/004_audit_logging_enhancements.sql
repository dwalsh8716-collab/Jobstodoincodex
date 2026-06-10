alter table audit_logs
  add column if not exists actor_email text,
  add column if not exists actor_role text,
  add column if not exists entity_label text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists ip_hash text,
  add column if not exists user_agent_hash text;

create index if not exists audit_logs_action_created_idx on audit_logs(action, created_at desc);
create index if not exists audit_logs_actor_created_idx on audit_logs(actor_email, created_at desc);
create index if not exists audit_logs_entity_type_created_idx on audit_logs(entity_type, created_at desc);

create or replace function prevent_audit_log_mutation()
returns trigger as $$
begin
  if current_setting('essential.allow_audit_log_mutation', true) = 'true' then
    if tg_op = 'DELETE' then
      return old;
    end if;

    return new;
  end if;

  raise exception 'audit_logs are append-only in normal application flow';
end;
$$ language plpgsql;

drop trigger if exists audit_logs_append_only on audit_logs;

create trigger audit_logs_append_only
before update or delete on audit_logs
for each row execute function prevent_audit_log_mutation();
