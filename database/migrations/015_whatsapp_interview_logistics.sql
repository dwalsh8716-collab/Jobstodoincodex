alter table recruiter_lab_interview_requests
  add column if not exists interview_start_at timestamptz,
  add column if not exists interview_timezone text not null default 'Europe/London',
  add column if not exists interview_location_type text not null default 'to_be_confirmed',
  add column if not exists interview_location_label text,
  add column if not exists interview_map_url text,
  add column if not exists location_approved_for_whatsapp boolean not null default false,
  add column if not exists whatsapp_logistics_status text not null default 'not_ready',
  add column if not exists whatsapp_logistics_last_attempt_at timestamptz,
  add column if not exists whatsapp_logistics_failure_reason text,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'recruiter_lab_interview_requests_location_type_check'
  ) then
    alter table recruiter_lab_interview_requests
      add constraint recruiter_lab_interview_requests_location_type_check check (
        interview_location_type in ('google_meet', 'physical', 'phone', 'to_be_confirmed')
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'recruiter_lab_interview_requests_whatsapp_logistics_status_check'
  ) then
    alter table recruiter_lab_interview_requests
      add constraint recruiter_lab_interview_requests_whatsapp_logistics_status_check check (
        whatsapp_logistics_status in ('not_ready', 'pending', 'sent', 'failed', 'manual_fallback', 'skipped')
      );
  end if;
end $$;

create index if not exists recruiter_lab_interview_requests_scheduled_idx
  on recruiter_lab_interview_requests(status, interview_start_at)
  where status = 'scheduled';

create index if not exists recruiter_lab_interview_requests_whatsapp_status_idx
  on recruiter_lab_interview_requests(whatsapp_logistics_status, whatsapp_logistics_last_attempt_at desc);
