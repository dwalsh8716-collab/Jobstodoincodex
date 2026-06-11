create table if not exists salary_benchmark_requests (
  id uuid primary key default gen_random_uuid(),
  requester_name text not null,
  requester_email text not null,
  company text not null,
  phone text,
  role_title text not null,
  seniority text,
  sector text,
  location text,
  work_pattern text,
  salary_budget text,
  rate_budget text,
  hiring_urgency text,
  brief_context text,
  must_have_skills jsonb not null default '[]'::jsonb,
  consent_to_contact boolean not null default false,
  marketing_consent boolean not null default false,
  status text not null default 'new',
  assigned_to uuid references admin_users(id) on delete set null,
  converted_enquiry_id uuid references enquiries(id) on delete set null,
  privacy_notice_acknowledged_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint salary_benchmark_requests_status_check check (
    status in ('new', 'reviewing', 'benchmark_drafted', 'sent', 'converted', 'closed')
  ),
  constraint salary_benchmark_requests_must_have_skills_array_check check (
    jsonb_typeof(must_have_skills) = 'array'
  )
);

create table if not exists salary_benchmark_drafts (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references salary_benchmark_requests(id) on delete cascade,
  draft_status text not null default 'draft',
  draft_kind text not null default 'manual_structure',
  role_summary text,
  market_range text,
  salary_rate_caveats text,
  hiring_difficulty text,
  likely_candidate_pool text,
  underpaying_risk text,
  suggested_adjustments text,
  comparable_roles jsonb not null default '[]'::jsonb,
  interim_vs_permanent_view text,
  david_recommendation text,
  source_notes jsonb not null default '[]'::jsonb,
  ai_used boolean not null default false,
  ai_usage_notes text,
  david_reviewed_by uuid references admin_users(id) on delete set null,
  david_reviewed_at timestamptz,
  approved_to_send_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint salary_benchmark_drafts_status_check check (
    draft_status in ('draft', 'needs_david_review', 'david_reviewed', 'approved_to_send', 'sent', 'rejected', 'archived')
  ),
  constraint salary_benchmark_drafts_kind_check check (
    draft_kind in ('manual_structure', 'ai_assisted_structure', 'final_reviewed_asset')
  ),
  constraint salary_benchmark_drafts_comparable_roles_array_check check (
    jsonb_typeof(comparable_roles) = 'array'
  ),
  constraint salary_benchmark_drafts_source_notes_array_check check (
    jsonb_typeof(source_notes) = 'array'
  ),
  constraint salary_benchmark_drafts_human_review_before_send_check check (
    sent_at is null or (
      approved_to_send_at is not null and
      david_reviewed_at is not null
    )
  )
);

create index if not exists salary_benchmark_requests_status_idx
  on salary_benchmark_requests(status, created_at desc);

create index if not exists salary_benchmark_requests_email_idx
  on salary_benchmark_requests(requester_email, created_at desc);

create index if not exists salary_benchmark_drafts_request_idx
  on salary_benchmark_drafts(request_id, draft_status, created_at desc);
