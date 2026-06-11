alter table recruiter_lab_shortlist_feedback
  add column if not exists decline_reason text,
  add column if not exists status_update text,
  add column if not exists notification_required boolean not null default true,
  add column if not exists activity_event_id uuid references activities(id) on delete set null,
  add column if not exists admin_task_id uuid references tasks(id) on delete set null;

alter table recruiter_lab_shortlist_candidates
  add column if not exists client_feedback_status text not null default 'pending',
  add column if not exists latest_feedback_at timestamptz;

do $$
begin
  alter table recruiter_lab_shortlist_feedback
    drop constraint if exists recruiter_lab_shortlist_feedback_action_check;

  alter table recruiter_lab_shortlist_feedback add constraint recruiter_lab_shortlist_feedback_action_check check (
    feedback_action in (
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
  alter table recruiter_lab_shortlist_feedback add constraint recruiter_lab_shortlist_feedback_decline_reason_check check (
    decline_reason is null or decline_reason in (
      'experience_mismatch',
      'salary_rate_mismatch',
      'location_hybrid_mismatch',
      'seniority_mismatch',
      'sector_mismatch',
      'not_enough_detail',
      'not_right_for_this_brief',
      'other'
    )
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table recruiter_lab_shortlist_candidates add constraint recruiter_lab_shortlist_candidates_client_feedback_status_check check (
    client_feedback_status in (
      'pending',
      'shortlisted',
      'interested',
      'maybe',
      'declined',
      'interview_requested',
      'needs_more_info'
    )
  );
exception
  when duplicate_object then null;
end $$;

create index if not exists recruiter_lab_shortlist_feedback_action_idx
  on recruiter_lab_shortlist_feedback(feedback_action, created_at desc);

create index if not exists recruiter_lab_shortlist_feedback_decline_reason_idx
  on recruiter_lab_shortlist_feedback(decline_reason)
  where decline_reason is not null;

create index if not exists recruiter_lab_shortlist_candidates_feedback_status_idx
  on recruiter_lab_shortlist_candidates(client_feedback_status, latest_feedback_at desc);
