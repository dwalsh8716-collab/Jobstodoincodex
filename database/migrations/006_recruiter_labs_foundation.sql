create table if not exists recruiter_lab_shortlists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_company_id uuid references companies(id) on delete set null,
  owner_admin_id uuid references admin_users(id) on delete set null,
  status text not null default 'draft',
  feature_flag text not null default 'FEATURE_CLIENT_PRESENTATION_PORTAL',
  expires_at timestamptz,
  revoked_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recruiter_lab_shortlists_status_check check (
    status in ('draft', 'david_review', 'private_preview', 'sent', 'closed', 'archived', 'revoked')
  )
);

create table if not exists recruiter_lab_shortlist_candidates (
  id uuid primary key default gen_random_uuid(),
  shortlist_id uuid not null references recruiter_lab_shortlists(id) on delete cascade,
  candidate_id uuid references candidates(id) on delete restrict,
  application_id uuid references applications(id) on delete set null,
  display_order integer not null default 0,
  profile_status text not null default 'draft',
  david_summary text,
  evidence_notes text,
  consent_confirmed boolean not null default false,
  candidate_profile_snapshot jsonb not null default '{}'::jsonb,
  approved_by uuid references admin_users(id) on delete set null,
  approved_at timestamptz,
  withheld_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recruiter_lab_shortlist_candidates_status_check check (
    profile_status in ('draft', 'david_review', 'approved', 'withheld', 'removed')
  ),
  constraint recruiter_lab_shortlist_candidates_unique_candidate unique (shortlist_id, candidate_id)
);

create table if not exists recruiter_lab_client_access_tokens (
  id uuid primary key default gen_random_uuid(),
  shortlist_id uuid not null references recruiter_lab_shortlists(id) on delete cascade,
  client_contact_id uuid references contacts(id) on delete set null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists recruiter_lab_shortlist_feedback (
  id uuid primary key default gen_random_uuid(),
  shortlist_candidate_id uuid not null references recruiter_lab_shortlist_candidates(id) on delete cascade,
  access_token_id uuid references recruiter_lab_client_access_tokens(id) on delete set null,
  feedback_action text not null,
  feedback_note text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint recruiter_lab_shortlist_feedback_action_check check (
    feedback_action in ('shortlist', 'decline', 'maybe', 'need_more_info', 'request_interview')
  )
);

create table if not exists recruiter_lab_interview_requests (
  id uuid primary key default gen_random_uuid(),
  shortlist_candidate_id uuid not null references recruiter_lab_shortlist_candidates(id) on delete cascade,
  feedback_id uuid references recruiter_lab_shortlist_feedback(id) on delete set null,
  status text not null default 'requested',
  requested_at timestamptz not null default now(),
  google_calendar_event_id text,
  google_meet_url text,
  whatsapp_message_id uuid references whatsapp_messages(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  constraint recruiter_lab_interview_requests_status_check check (
    status in ('requested', 'reviewing', 'scheduled', 'cancelled', 'completed')
  )
);

create index if not exists recruiter_lab_shortlists_status_idx
  on recruiter_lab_shortlists(status, created_at desc);

create index if not exists recruiter_lab_shortlist_candidates_shortlist_idx
  on recruiter_lab_shortlist_candidates(shortlist_id, display_order);

create index if not exists recruiter_lab_client_access_tokens_shortlist_idx
  on recruiter_lab_client_access_tokens(shortlist_id, expires_at);

create index if not exists recruiter_lab_shortlist_feedback_candidate_idx
  on recruiter_lab_shortlist_feedback(shortlist_candidate_id, created_at desc);

create index if not exists recruiter_lab_interview_requests_candidate_idx
  on recruiter_lab_interview_requests(shortlist_candidate_id, requested_at desc);
