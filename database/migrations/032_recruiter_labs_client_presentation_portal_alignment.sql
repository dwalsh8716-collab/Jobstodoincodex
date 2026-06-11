alter table recruiter_lab_shortlists
  add column if not exists client_contact_id uuid references contacts(id) on delete set null,
  add column if not exists related_job_id uuid references jobs(id) on delete set null,
  add column if not exists sanity_job_id text,
  add column if not exists role_title text,
  add column if not exists role_summary text,
  add column if not exists david_intro_note text,
  add column if not exists created_by uuid references admin_users(id) on delete set null,
  add column if not exists archived_at timestamptz,
  add column if not exists last_magic_link_generated_at timestamptz,
  add column if not exists last_magic_link_revoked_at timestamptz;

alter table recruiter_lab_shortlist_candidates
  add column if not exists candidate_profile_id uuid references recruiter_lab_candidate_profiles(id) on delete set null,
  add column if not exists presentation_status text not null default 'draft',
  add column if not exists strengths jsonb not null default '[]'::jsonb,
  add column if not exists watch_outs jsonb not null default '[]'::jsonb,
  add column if not exists salary_expectation text,
  add column if not exists rate_expectation text,
  add column if not exists notice_period text,
  add column if not exists availability text,
  add column if not exists location text,
  add column if not exists work_preference text,
  add column if not exists anonymised_mode boolean not null default false;

do $$
begin
  alter table recruiter_lab_shortlist_candidates add constraint recruiter_lab_shortlist_candidates_presentation_status_check check (
    presentation_status in (
      'draft',
      'david_review',
      'approved',
      'shared',
      'shortlisted',
      'interested',
      'maybe',
      'declined',
      'interview_requested',
      'needs_more_info',
      'withheld',
      'removed'
    )
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table recruiter_lab_shortlist_candidates add constraint recruiter_lab_shortlist_candidates_strengths_array_check check (
    jsonb_typeof(strengths) = 'array'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table recruiter_lab_shortlist_candidates add constraint recruiter_lab_shortlist_candidates_watch_outs_array_check check (
    jsonb_typeof(watch_outs) = 'array'
  );
exception
  when duplicate_object then null;
end $$;

alter table recruiter_lab_shortlist_feedback
  add column if not exists shortlist_id uuid references recruiter_lab_shortlists(id) on delete cascade,
  add column if not exists candidate_id uuid references candidates(id) on delete set null,
  add column if not exists client_contact_id uuid references contacts(id) on delete set null,
  add column if not exists feedback_type text,
  add column if not exists rating integer,
  add column if not exists comment text,
  add column if not exists interview_requested boolean not null default false,
  add column if not exists next_action text;

do $$
begin
  alter table recruiter_lab_shortlist_feedback add constraint recruiter_lab_shortlist_feedback_type_check check (
    feedback_type is null or feedback_type in (
      'shortlist',
      'interested',
      'maybe',
      'decline',
      'request_interview',
      'need_more_info'
    )
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table recruiter_lab_shortlist_feedback add constraint recruiter_lab_shortlist_feedback_rating_check check (
    rating is null or (rating >= 1 and rating <= 5)
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists recruiter_lab_shortlist_activity (
  id uuid primary key default gen_random_uuid(),
  shortlist_id uuid not null references recruiter_lab_shortlists(id) on delete cascade,
  shortlist_candidate_id uuid references recruiter_lab_shortlist_candidates(id) on delete cascade,
  candidate_id uuid references candidates(id) on delete set null,
  client_contact_id uuid references contacts(id) on delete set null,
  activity_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists recruiter_lab_shortlists_client_contact_idx
  on recruiter_lab_shortlists(client_contact_id, created_at desc)
  where client_contact_id is not null;

create index if not exists recruiter_lab_shortlists_related_job_idx
  on recruiter_lab_shortlists(related_job_id, created_at desc)
  where related_job_id is not null;

create index if not exists recruiter_lab_shortlist_candidates_profile_idx
  on recruiter_lab_shortlist_candidates(candidate_profile_id)
  where candidate_profile_id is not null;

create index if not exists recruiter_lab_shortlist_candidates_presentation_status_idx
  on recruiter_lab_shortlist_candidates(presentation_status, updated_at desc);

create index if not exists recruiter_lab_shortlist_feedback_shortlist_idx
  on recruiter_lab_shortlist_feedback(shortlist_id, created_at desc)
  where shortlist_id is not null;

create index if not exists recruiter_lab_shortlist_feedback_client_contact_idx
  on recruiter_lab_shortlist_feedback(client_contact_id, created_at desc)
  where client_contact_id is not null;

create index if not exists recruiter_lab_shortlist_activity_shortlist_idx
  on recruiter_lab_shortlist_activity(shortlist_id, created_at desc);

create index if not exists recruiter_lab_shortlist_activity_candidate_idx
  on recruiter_lab_shortlist_activity(shortlist_candidate_id, created_at desc)
  where shortlist_candidate_id is not null;

create or replace view client_shortlists as
select
  id,
  title,
  client_company_id,
  client_contact_id,
  related_job_id,
  sanity_job_id,
  role_title,
  role_summary,
  david_intro_note,
  status,
  created_by,
  created_at,
  updated_at,
  expires_at,
  archived_at
from recruiter_lab_shortlists;

create or replace view client_shortlist_candidates as
select
  id,
  shortlist_id,
  candidate_id,
  application_id,
  candidate_profile_id,
  display_order,
  presentation_status,
  david_summary,
  strengths,
  watch_outs,
  salary_expectation,
  rate_expectation,
  notice_period,
  availability,
  location,
  work_preference,
  cv_access_approved as cv_access_allowed,
  anonymised_mode,
  created_at,
  updated_at
from recruiter_lab_shortlist_candidates;

create or replace view client_shortlist_access_tokens as
select
  id,
  shortlist_id,
  client_contact_id,
  token_hash,
  expires_at,
  last_used_at,
  revoked_at,
  created_at,
  created_by
from recruiter_lab_client_access_tokens;

create or replace view client_shortlist_feedback as
select
  id,
  shortlist_id,
  candidate_id,
  client_contact_id,
  coalesce(feedback_type, feedback_action) as feedback_type,
  rating,
  coalesce(comment, feedback_note) as comment,
  interview_requested,
  next_action,
  created_at
from recruiter_lab_shortlist_feedback;

create or replace view client_shortlist_activity as
select
  id,
  shortlist_id,
  shortlist_candidate_id,
  candidate_id,
  client_contact_id,
  activity_type,
  metadata,
  created_at
from recruiter_lab_shortlist_activity;
