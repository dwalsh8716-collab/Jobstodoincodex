alter table recruiter_lab_interview_requests
  add column if not exists scheduling_status text not null default 'manual_required',
  add column if not exists candidate_contact_approved_at timestamptz,
  add column if not exists david_final_slot_approved_at timestamptz,
  add column if not exists calendar_draft_ready_at timestamptz,
  add column if not exists calendar_event_created_at timestamptz,
  add column if not exists google_calendar_status text not null default 'manual_required';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'recruiter_lab_interview_requests_scheduling_status_check'
  ) then
    alter table recruiter_lab_interview_requests
      add constraint recruiter_lab_interview_requests_scheduling_status_check check (
        scheduling_status in (
          'manual_required',
          'candidate_contact_pending',
          'availability_requested',
          'availability_received',
          'proposed_slot',
          'final_slot_approved',
          'calendar_draft_ready',
          'scheduled',
          'cancelled',
          'failed'
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'recruiter_lab_interview_requests_google_calendar_status_check'
  ) then
    alter table recruiter_lab_interview_requests
      add constraint recruiter_lab_interview_requests_google_calendar_status_check check (
        google_calendar_status in (
          'manual_required',
          'draft_ready',
          'oauth_required',
          'approved_to_create',
          'created',
          'failed',
          'not_applicable'
        )
      );
  end if;
end $$;

create table if not exists recruiter_lab_interview_availability (
  id uuid primary key default gen_random_uuid(),
  interview_request_id uuid not null references recruiter_lab_interview_requests(id) on delete cascade,
  person_type text not null,
  person_id uuid,
  available_slots jsonb not null default '[]'::jsonb,
  timezone text not null default 'Europe/London',
  submitted_at timestamptz,
  source_channel text not null default 'manual',
  token_hash text,
  token_expires_at timestamptz,
  token_revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recruiter_lab_interview_availability_person_type_check check (
    person_type in ('candidate', 'client', 'david', 'other')
  ),
  constraint recruiter_lab_interview_availability_source_channel_check check (
    source_channel in ('manual', 'secure_link', 'whatsapp', 'email', 'phone')
  )
);

create table if not exists recruiter_lab_interview_events (
  id uuid primary key default gen_random_uuid(),
  interview_request_id uuid not null references recruiter_lab_interview_requests(id) on delete cascade,
  google_calendar_event_id text,
  google_meet_url text,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  timezone text not null default 'Europe/London',
  status text not null default 'draft',
  approved_by uuid references admin_users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint recruiter_lab_interview_events_status_check check (
    status in (
      'draft',
      'david_review',
      'approved',
      'created',
      'cancelled',
      'failed'
    )
  )
);

create table if not exists recruiter_lab_interview_messages (
  id uuid primary key default gen_random_uuid(),
  interview_request_id uuid not null references recruiter_lab_interview_requests(id) on delete cascade,
  channel text not null,
  recipient_type text not null,
  recipient_entity_id uuid,
  recipient_hash text,
  template_name text,
  status text not null default 'draft',
  provider_message_id text,
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  error_summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recruiter_lab_interview_messages_channel_check check (
    channel in ('whatsapp', 'email', 'manual')
  ),
  constraint recruiter_lab_interview_messages_recipient_type_check check (
    recipient_type in ('candidate', 'client', 'david', 'other')
  ),
  constraint recruiter_lab_interview_messages_status_check check (
    status in (
      'draft',
      'pending_approval',
      'approved',
      'sent',
      'delivered',
      'failed',
      'skipped',
      'manual_fallback'
    )
  )
);

create table if not exists recruiter_lab_interview_scheduling_tasks (
  id uuid primary key default gen_random_uuid(),
  interview_request_id uuid not null references recruiter_lab_interview_requests(id) on delete cascade,
  task_type text not null,
  status text not null default 'open',
  assigned_to uuid references admin_users(id) on delete set null,
  due_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recruiter_lab_interview_scheduling_tasks_task_type_check check (
    task_type in (
      'approve_candidate_contact',
      'request_candidate_availability',
      'request_client_availability',
      'propose_slot',
      'approve_final_slot',
      'prepare_calendar_draft',
      'send_confirmation',
      'send_reminder',
      'manual_follow_up'
    )
  ),
  constraint recruiter_lab_interview_scheduling_tasks_status_check check (
    status in ('open', 'in_progress', 'blocked', 'completed', 'cancelled')
  )
);

create index if not exists recruiter_lab_interview_requests_scheduling_status_idx
  on recruiter_lab_interview_requests(scheduling_status, requested_at desc);

create index if not exists recruiter_lab_interview_availability_request_idx
  on recruiter_lab_interview_availability(interview_request_id, submitted_at desc);

create index if not exists recruiter_lab_interview_events_request_idx
  on recruiter_lab_interview_events(interview_request_id, scheduled_start desc);

create index if not exists recruiter_lab_interview_messages_request_idx
  on recruiter_lab_interview_messages(interview_request_id, created_at desc);

create index if not exists recruiter_lab_interview_messages_status_idx
  on recruiter_lab_interview_messages(status, created_at desc);

create index if not exists recruiter_lab_interview_scheduling_tasks_request_idx
  on recruiter_lab_interview_scheduling_tasks(interview_request_id, status, due_at);
