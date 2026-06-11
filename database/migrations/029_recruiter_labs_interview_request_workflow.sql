alter table recruiter_lab_interview_requests
  add column if not exists shortlist_id uuid references recruiter_lab_shortlists(id) on delete cascade,
  add column if not exists candidate_id uuid references candidates(id) on delete set null,
  add column if not exists application_id uuid references applications(id) on delete set null,
  add column if not exists client_company_id uuid references companies(id) on delete set null,
  add column if not exists client_contact_id uuid references contacts(id) on delete set null,
  add column if not exists requested_by uuid references contacts(id) on delete set null,
  add column if not exists request_source text not null default 'client_shortlist_portal',
  add column if not exists interview_type text not null default 'to_be_confirmed',
  add column if not exists location_preference text not null default 'to_be_confirmed',
  add column if not exists preferred_times text,
  add column if not exists client_notes text,
  add column if not exists candidate_contact_approved_by uuid references admin_users(id) on delete set null,
  add column if not exists candidate_contact_approved_by_label text,
  add column if not exists candidate_contact_rejected_at timestamptz,
  add column if not exists closed_reason text,
  add column if not exists updated_at timestamptz not null default now();

alter table recruiter_lab_interview_requests
  drop constraint if exists recruiter_lab_interview_requests_status_check;

alter table recruiter_lab_interview_requests
  add constraint recruiter_lab_interview_requests_status_check check (
    status in (
      'requested',
      'reviewing',
      'david_reviewing',
      'candidate_contact_approved',
      'candidate_contacted',
      'awaiting_candidate_availability',
      'awaiting_client_availability',
      'scheduling',
      'scheduled',
      'completed',
      'cancelled',
      'declined',
      'closed'
    )
  );

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'recruiter_lab_interview_requests_source_check'
  ) then
    alter table recruiter_lab_interview_requests
      add constraint recruiter_lab_interview_requests_source_check check (
        request_source in ('client_shortlist_portal', 'admin', 'email', 'phone', 'manual')
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'recruiter_lab_interview_requests_interview_type_check'
  ) then
    alter table recruiter_lab_interview_requests
      add constraint recruiter_lab_interview_requests_interview_type_check check (
        interview_type in ('video', 'phone', 'in_person', 'to_be_confirmed')
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'recruiter_lab_interview_requests_location_preference_check'
  ) then
    alter table recruiter_lab_interview_requests
      add constraint recruiter_lab_interview_requests_location_preference_check check (
        location_preference in ('google_meet', 'phone', 'physical', 'to_be_confirmed')
      );
  end if;
end $$;

create table if not exists recruiter_lab_interview_request_activity (
  id uuid primary key default gen_random_uuid(),
  interview_request_id uuid not null references recruiter_lab_interview_requests(id) on delete cascade,
  activity_type text not null,
  actor_type text not null default 'system',
  actor_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint recruiter_lab_interview_request_activity_type_check check (
    activity_type in (
      'created_from_client_portal',
      'admin_review_started',
      'candidate_contact_approved',
      'candidate_contact_rejected',
      'client_more_info_requested',
      'candidate_contacted',
      'status_updated',
      'closed'
    )
  ),
  constraint recruiter_lab_interview_request_activity_actor_type_check check (
    actor_type in ('client', 'admin', 'system')
  )
);

create index if not exists recruiter_lab_interview_requests_shortlist_idx
  on recruiter_lab_interview_requests(shortlist_id, requested_at desc);

create index if not exists recruiter_lab_interview_requests_status_idx
  on recruiter_lab_interview_requests(status, requested_at desc);

create index if not exists recruiter_lab_interview_requests_client_idx
  on recruiter_lab_interview_requests(client_company_id, client_contact_id, requested_at desc);

create index if not exists recruiter_lab_interview_request_activity_request_idx
  on recruiter_lab_interview_request_activity(interview_request_id, created_at desc);
