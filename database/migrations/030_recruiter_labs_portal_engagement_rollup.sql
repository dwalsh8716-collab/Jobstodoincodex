alter table recruiter_lab_portal_engagement_events
  drop constraint if exists recruiter_lab_portal_engagement_event_type_check;

alter table recruiter_lab_portal_engagement_events
  add constraint recruiter_lab_portal_engagement_event_type_check check (
    event_type in (
      'shortlist_opened',
      'shortlist_viewed',
      'candidate_card_viewed',
      'candidate_profile_expanded',
      'candidate_profile_opened',
      'candidate_profile_collapsed',
      'modal_opened',
      'modal_closed',
      'dwell_ping',
      'candidate_profile_dwell_time',
      'cv_viewed',
      'cv_downloaded',
      'feedback_submitted',
      'candidate_shortlisted',
      'candidate_declined',
      'interview_requested',
      'need_more_info_clicked',
      'portal_link_expired',
      'portal_link_revoked'
    )
  );

alter table recruiter_lab_shortlists
  add column if not exists last_client_opened_at timestamptz,
  add column if not exists last_client_engagement_at timestamptz,
  add column if not exists feedback_chase_task_created_at timestamptz;

alter table recruiter_lab_shortlist_candidates
  add column if not exists candidate_card_view_count integer not null default 0,
  add column if not exists feedback_submit_count integer not null default 0,
  add column if not exists interview_request_count integer not null default 0,
  add column if not exists need_more_info_count integer not null default 0,
  add column if not exists decline_count integer not null default 0;

do $$
begin
  alter table recruiter_lab_shortlist_candidates add constraint recruiter_lab_shortlist_candidates_feedback_counts_check check (
    candidate_card_view_count >= 0 and
    feedback_submit_count >= 0 and
    interview_request_count >= 0 and
    need_more_info_count >= 0 and
    decline_count >= 0
  );
exception
  when duplicate_object then null;
end $$;

create or replace view recruiter_lab_client_shortlist_activity_rollup as
select
  s.id as shortlist_id,
  s.title as shortlist_title,
  s.status as shortlist_status,
  s.last_client_opened_at,
  s.last_client_engagement_at,
  count(e.id) filter (where e.event_type in ('shortlist_opened', 'shortlist_viewed')) as shortlist_view_events,
  count(e.id) filter (where e.event_type in ('candidate_card_viewed', 'candidate_profile_expanded', 'candidate_profile_opened')) as candidate_view_events,
  count(e.id) filter (where e.event_type in ('feedback_submitted', 'candidate_shortlisted', 'candidate_declined', 'interview_requested', 'need_more_info_clicked')) as feedback_events,
  count(e.id) filter (where e.event_type = 'interview_requested') as interview_request_events,
  coalesce(sum(e.dwell_milliseconds) filter (where e.event_type in ('dwell_ping', 'candidate_profile_dwell_time')), 0) as total_dwell_milliseconds,
  max(e.occurred_at) as latest_event_at
from recruiter_lab_shortlists s
left join recruiter_lab_portal_engagement_events e on e.shortlist_id = s.id
group by
  s.id,
  s.title,
  s.status,
  s.last_client_opened_at,
  s.last_client_engagement_at;

create index if not exists recruiter_lab_shortlists_client_engagement_idx
  on recruiter_lab_shortlists(last_client_engagement_at desc)
  where last_client_engagement_at is not null;
