alter table recruiter_lab_ai_brief_diagnostic_submissions
  add column if not exists david_notes text,
  add column if not exists reviewed_by uuid references admin_users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists converted_at timestamptz,
  add column if not exists closed_at timestamptz,
  add column if not exists ai_mode text not null default 'structured_non_ai',
  add column if not exists sensitive_data_warning_acknowledged_at timestamptz;

do $$
begin
  alter table recruiter_lab_ai_brief_diagnostic_submissions add constraint recruiter_lab_ai_brief_diagnostic_ai_mode_check check (
    ai_mode in ('structured_non_ai', 'ai_assisted_draft', 'ai_disabled')
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists recruiter_lab_ai_brief_builder_review_events (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references recruiter_lab_ai_brief_diagnostic_submissions(id) on delete cascade,
  draft_id uuid references recruiter_lab_ai_brief_diagnostic_drafts(id) on delete set null,
  event_type text not null,
  actor_admin_id uuid references admin_users(id) on delete set null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint recruiter_lab_ai_brief_builder_review_events_type_check check (
    event_type in (
      'submitted',
      'structured_draft_created',
      'ai_draft_created',
      'david_review_started',
      'david_notes_added',
      'david_reviewed',
      'converted',
      'closed',
      'deleted'
    )
  )
);

create or replace view job_brief_requests as
select
  s.id,
  s.contact_name as requester_name,
  s.contact_email as requester_email,
  s.company_name as company,
  s.hiring_for as role_title,
  jsonb_build_object(
    'whyNow', s.why_now,
    'problemToSolve', s.problem_to_solve,
    'failureImpact', s.failure_impact,
    'engagementType', s.engagement_type,
    'salaryRateBudget', s.salary_rate_budget,
    'locationHybridReality', s.location_hybrid_reality,
    'mustHaves', s.must_haves,
    'niceToHaves', s.nice_to_haves,
    'triedHiringAlready', s.tried_hiring_already,
    'whatDidNotWork', s.what_did_not_work,
    'urgency', s.urgency
  ) as brief_answers,
  (
    select jsonb_build_object(
      'status', d.status,
      'draftKind', d.draft_kind,
      'promptVersion', d.prompt_version,
      'formalCommercialBrief', d.formal_commercial_brief,
      'unclearAreas', d.unclear_areas,
      'risks', d.risks,
      'salaryHybridConcerns', d.salary_hybrid_concerns,
      'suggestedFollowUpQuestions', d.suggested_follow_up_questions,
      'humanApproved', d.human_approved,
      'clientVisible', false
    )
    from recruiter_lab_ai_brief_diagnostic_drafts d
    where d.submission_id = s.id
    order by d.created_at desc
    limit 1
  ) as ai_draft,
  s.david_notes,
  case
    when s.status = 'david_review' then 'reviewing'
    when s.status = 'qualified' then 'david_reviewed'
    when s.status = 'not_right_now' then 'closed'
    else s.status
  end as status,
  s.privacy_notice_acknowledged_at is not null as consent_to_contact,
  s.created_at,
  s.updated_at
from recruiter_lab_ai_brief_diagnostic_submissions s;

create index if not exists recruiter_lab_ai_brief_diagnostic_review_idx
  on recruiter_lab_ai_brief_diagnostic_submissions(reviewed_at desc)
  where reviewed_at is not null;

create index if not exists recruiter_lab_ai_brief_diagnostic_ai_mode_idx
  on recruiter_lab_ai_brief_diagnostic_submissions(ai_mode, created_at desc);

create index if not exists recruiter_lab_ai_brief_builder_review_events_submission_idx
  on recruiter_lab_ai_brief_builder_review_events(submission_id, created_at desc);
