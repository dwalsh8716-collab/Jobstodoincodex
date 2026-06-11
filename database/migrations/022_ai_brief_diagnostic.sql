create table if not exists recruiter_lab_ai_brief_diagnostic_submissions (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft',
  feature_flag text not null default 'FEATURE_AI_BRIEF_BUILDER',
  source text not null default 'recruiter_labs_brief_diagnostic',
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  company_name text,
  hiring_for text not null,
  why_now text not null,
  problem_to_solve text not null,
  failure_impact text not null,
  engagement_type text not null,
  salary_rate_budget text not null,
  location_hybrid_reality text not null,
  must_haves jsonb not null default '[]'::jsonb,
  nice_to_haves jsonb not null default '[]'::jsonb,
  tried_hiring_already boolean not null default false,
  what_did_not_work text,
  urgency text not null,
  privacy_notice_acknowledged_at timestamptz,
  ai_draft_acknowledged_at timestamptz,
  marketing_consent boolean not null default false,
  source_page_path text,
  data_classification text not null default 'private',
  retained_until date,
  deletion_requested_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recruiter_lab_ai_brief_diagnostic_status_check check (
    status in ('draft', 'submitted', 'david_review', 'qualified', 'not_right_now', 'archived', 'deleted')
  ),
  constraint recruiter_lab_ai_brief_diagnostic_engagement_check check (
    engagement_type in ('permanent', 'interim', 'unsure')
  ),
  constraint recruiter_lab_ai_brief_diagnostic_urgency_check check (
    urgency in ('low', 'medium', 'high', 'critical')
  ),
  constraint recruiter_lab_ai_brief_diagnostic_classification_check check (
    data_classification in ('private', 'redacted', 'sample')
  ),
  constraint recruiter_lab_ai_brief_diagnostic_must_haves_check check (
    jsonb_typeof(must_haves) = 'array'
  ),
  constraint recruiter_lab_ai_brief_diagnostic_nice_haves_check check (
    jsonb_typeof(nice_to_haves) = 'array'
  )
);

create table if not exists recruiter_lab_ai_brief_diagnostic_drafts (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references recruiter_lab_ai_brief_diagnostic_submissions(id) on delete cascade,
  status text not null default 'draft',
  draft_kind text not null default 'client_brief_diagnostic',
  ai_provider text,
  model_name text,
  prompt_version text not null default 'brief-diagnostic-v1',
  formal_commercial_brief text,
  unclear_areas jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  salary_hybrid_concerns text,
  suggested_follow_up_questions jsonb not null default '[]'::jsonb,
  email_summary_to_david text,
  client_confirmation_draft text,
  human_approved boolean not null default false,
  approved_by uuid references admin_users(id) on delete set null,
  approved_at timestamptz,
  rejected_at timestamptz,
  deleted_at timestamptz,
  ai_generation_event_id uuid references audit_logs(id) on delete set null,
  client_visibility_blocked_at timestamptz not null default now(),
  client_visibility_blocked_reason text not null default 'David approval required before any client-facing use.',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recruiter_lab_ai_brief_diagnostic_drafts_status_check check (
    status in ('draft', 'david_review', 'approved', 'rejected', 'deleted')
  ),
  constraint recruiter_lab_ai_brief_diagnostic_drafts_kind_check check (
    draft_kind = 'client_brief_diagnostic'
  ),
  constraint recruiter_lab_ai_brief_diagnostic_drafts_unclear_check check (
    jsonb_typeof(unclear_areas) = 'array'
  ),
  constraint recruiter_lab_ai_brief_diagnostic_drafts_risks_check check (
    jsonb_typeof(risks) = 'array'
  ),
  constraint recruiter_lab_ai_brief_diagnostic_drafts_questions_check check (
    jsonb_typeof(suggested_follow_up_questions) = 'array'
  ),
  constraint recruiter_lab_ai_brief_diagnostic_drafts_review_check check (
    human_approved = false
    or (approved_by is not null and approved_at is not null and status = 'approved')
  )
);

create index if not exists recruiter_lab_ai_brief_diagnostic_submissions_status_idx
  on recruiter_lab_ai_brief_diagnostic_submissions(status, urgency, created_at desc);

create index if not exists recruiter_lab_ai_brief_diagnostic_submissions_email_idx
  on recruiter_lab_ai_brief_diagnostic_submissions(contact_email, created_at desc);

create index if not exists recruiter_lab_ai_brief_diagnostic_drafts_submission_idx
  on recruiter_lab_ai_brief_diagnostic_drafts(submission_id, status, created_at desc);

create index if not exists recruiter_lab_ai_brief_diagnostic_drafts_review_idx
  on recruiter_lab_ai_brief_diagnostic_drafts(human_approved, approved_at desc);
