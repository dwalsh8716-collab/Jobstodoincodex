create or replace view shortlist_candidates as
select
  id,
  shortlist_id,
  candidate_id,
  application_id,
  candidate_profile_id,
  display_order,
  presentation_status as status,
  david_summary,
  strengths,
  watch_outs,
  salary_expectation,
  rate_expectation,
  notice_period,
  availability,
  location,
  work_preference,
  cv_access_allowed,
  anonymised_mode,
  created_at,
  updated_at
from client_shortlist_candidates;

create or replace view shortlist_access_tokens as
select
  id,
  shortlist_id,
  client_contact_id as contact_id,
  token_hash,
  expires_at,
  last_used_at as viewed_at,
  revoked_at,
  created_at,
  created_by
from client_shortlist_access_tokens;

create or replace view shortlist_feedback as
select
  id,
  shortlist_id,
  candidate_id,
  client_contact_id as contact_id,
  feedback_type as feedback,
  rating,
  comment,
  interview_requested,
  next_action,
  created_at
from client_shortlist_feedback;

create or replace view shortlist_activity_logs as
select
  id,
  shortlist_id,
  shortlist_candidate_id,
  candidate_id,
  client_contact_id as contact_id,
  activity_type,
  metadata,
  created_at
from client_shortlist_activity;
