create table if not exists recruiter_lab_retained_search_dashboards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_company_id uuid references companies(id) on delete set null,
  client_contact_id uuid references contacts(id) on delete set null,
  owner_admin_id uuid references admin_users(id) on delete set null,
  status text not null default 'draft',
  feature_flag text not null default 'FEATURE_RETAINED_SEARCH_DASHBOARD',
  role_context text,
  market_notes text,
  salary_rate_reality text,
  blockers text,
  next_actions text,
  process_timeline jsonb not null default '[]'::jsonb,
  client_visible_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recruiter_lab_retained_search_dashboards_status_check check (
    status in ('draft', 'david_review', 'private_preview', 'sent', 'closed', 'archived', 'revoked')
  ),
  constraint recruiter_lab_retained_search_dashboards_timeline_check check (
    jsonb_typeof(process_timeline) = 'array'
  )
);

create table if not exists recruiter_lab_retained_search_dashboard_access_tokens (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid not null references recruiter_lab_retained_search_dashboards(id) on delete cascade,
  client_contact_id uuid references contacts(id) on delete set null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists recruiter_lab_retained_search_pipeline_events (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid not null references recruiter_lab_retained_search_dashboards(id) on delete cascade,
  event_type text not null,
  event_count integer not null default 1,
  occurred_on date not null default current_date,
  source text not null default 'manual_aggregate',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint recruiter_lab_retained_search_pipeline_event_type_check check (
    event_type in (
      'mapped',
      'approached',
      'responded',
      'screened',
      'rejected',
      'shortlisted',
      'interview_stage'
    )
  ),
  constraint recruiter_lab_retained_search_pipeline_event_count_check check (
    event_count >= 0
  ),
  constraint recruiter_lab_retained_search_pipeline_source_check check (
    source in ('manual_aggregate', 'pipeline_transition', 'imported_aggregate')
  )
);

create table if not exists recruiter_lab_retained_search_dashboard_access_logs (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid not null references recruiter_lab_retained_search_dashboards(id) on delete cascade,
  access_token_id uuid references recruiter_lab_retained_search_dashboard_access_tokens(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint recruiter_lab_retained_search_dashboard_access_event_check check (
    event_type in ('dashboard_view_requested', 'dashboard_view_granted', 'dashboard_view_blocked')
  )
);

create or replace view recruiter_lab_retained_search_dashboard_metric_totals as
select
  dashboard_id,
  coalesce(sum(event_count) filter (where event_type = 'mapped'), 0)::integer as total_mapped,
  coalesce(sum(event_count) filter (where event_type = 'approached'), 0)::integer as total_approached,
  coalesce(sum(event_count) filter (where event_type = 'responded'), 0)::integer as total_responded,
  coalesce(sum(event_count) filter (where event_type = 'screened'), 0)::integer as total_screened,
  coalesce(sum(event_count) filter (where event_type = 'rejected'), 0)::integer as total_rejected,
  coalesce(sum(event_count) filter (where event_type = 'shortlisted'), 0)::integer as total_shortlisted,
  coalesce(sum(event_count) filter (where event_type = 'interview_stage'), 0)::integer as interview_stage_count,
  max(occurred_on) as latest_pipeline_event_on
from recruiter_lab_retained_search_pipeline_events
group by dashboard_id;

create index if not exists recruiter_lab_retained_search_dashboards_status_idx
  on recruiter_lab_retained_search_dashboards(status, client_visible_at, expires_at);

create index if not exists recruiter_lab_retained_search_dashboard_tokens_hash_idx
  on recruiter_lab_retained_search_dashboard_access_tokens(token_hash, expires_at);

create index if not exists recruiter_lab_retained_search_pipeline_events_dashboard_idx
  on recruiter_lab_retained_search_pipeline_events(dashboard_id, event_type, occurred_on desc);

create index if not exists recruiter_lab_retained_search_access_logs_dashboard_idx
  on recruiter_lab_retained_search_dashboard_access_logs(dashboard_id, created_at desc);
