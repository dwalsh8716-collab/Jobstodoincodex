create table if not exists recruiter_lab_portal_engagement_events (
  id uuid primary key default gen_random_uuid(),
  shortlist_id uuid not null references recruiter_lab_shortlists(id) on delete cascade,
  shortlist_candidate_id uuid references recruiter_lab_shortlist_candidates(id) on delete cascade,
  access_token_id uuid references recruiter_lab_client_access_tokens(id) on delete set null,
  event_type text not null,
  dwell_milliseconds integer,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint recruiter_lab_portal_engagement_event_type_check check (
    event_type in (
      'shortlist_opened',
      'candidate_profile_expanded',
      'candidate_profile_collapsed',
      'modal_opened',
      'modal_closed',
      'dwell_ping',
      'cv_viewed',
      'cv_downloaded',
      'feedback_submitted'
    )
  ),
  constraint recruiter_lab_portal_engagement_dwell_check check (
    dwell_milliseconds is null or (
      dwell_milliseconds >= 5000 and dwell_milliseconds <= 1800000
    )
  )
);

alter table recruiter_lab_shortlist_candidates
  add column if not exists latest_engagement_at timestamptz,
  add column if not exists total_dwell_seconds integer not null default 0,
  add column if not exists profile_expand_count integer not null default 0,
  add column if not exists cv_view_count integer not null default 0,
  add column if not exists cv_download_count integer not null default 0;

do $$
begin
  alter table recruiter_lab_shortlist_candidates add constraint recruiter_lab_shortlist_candidates_engagement_counts_check check (
    total_dwell_seconds >= 0 and
    profile_expand_count >= 0 and
    cv_view_count >= 0 and
    cv_download_count >= 0
  );
exception
  when duplicate_object then null;
end $$;

create index if not exists recruiter_lab_portal_engagement_shortlist_idx
  on recruiter_lab_portal_engagement_events(shortlist_id, occurred_at desc);

create index if not exists recruiter_lab_portal_engagement_candidate_idx
  on recruiter_lab_portal_engagement_events(shortlist_candidate_id, occurred_at desc)
  where shortlist_candidate_id is not null;

create index if not exists recruiter_lab_portal_engagement_event_type_idx
  on recruiter_lab_portal_engagement_events(event_type, occurred_at desc);

create index if not exists recruiter_lab_portal_engagement_token_event_idx
  on recruiter_lab_portal_engagement_events(access_token_id, event_type, created_at desc)
  where access_token_id is not null;

create index if not exists recruiter_lab_shortlist_candidates_engagement_idx
  on recruiter_lab_shortlist_candidates(latest_engagement_at desc)
  where latest_engagement_at is not null;
