create table if not exists market_maps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_company_id uuid references companies(id) on delete set null,
  role_title text not null,
  sector text,
  geography text,
  seniority text,
  status text not null default 'draft',
  visibility text not null default 'private_admin',
  role_risk_level text not null default 'unknown',
  salary_rate_reality text,
  market_constraints jsonb not null default '[]'::jsonb,
  notes text,
  created_by uuid references admin_users(id) on delete set null,
  reviewed_by uuid references admin_users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint market_maps_status_check check (
    status in ('draft', 'mapping', 'private_preview', 'client_ready', 'closed', 'archived')
  ),
  constraint market_maps_visibility_check check (
    visibility in ('private_admin', 'private_client', 'anonymised_public')
  ),
  constraint market_maps_role_risk_check check (
    role_risk_level in ('unknown', 'low', 'medium', 'high', 'critical')
  ),
  constraint market_maps_constraints_array_check check (
    jsonb_typeof(market_constraints) = 'array'
  )
);

create table if not exists market_map_segments (
  id uuid primary key default gen_random_uuid(),
  map_id uuid not null references market_maps(id) on delete cascade,
  segment_name text not null,
  segment_type text not null,
  target_count integer not null default 0,
  mapped_count integer not null default 0,
  approached_count integer not null default 0,
  engaged_count integer not null default 0,
  shortlisted_count integer not null default 0,
  candidate_availability_summary jsonb not null default '{}'::jsonb,
  response_status_summary jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint market_map_segments_type_check check (
    segment_type in ('sector', 'agency_brand', 'geography', 'seniority', 'channel', 'availability', 'status', 'constraint')
  ),
  constraint market_map_segments_counts_check check (
    target_count >= 0 and
    mapped_count >= 0 and
    approached_count >= 0 and
    engaged_count >= 0 and
    shortlisted_count >= 0
  ),
  constraint market_map_segments_availability_object_check check (
    jsonb_typeof(candidate_availability_summary) = 'object'
  ),
  constraint market_map_segments_response_object_check check (
    jsonb_typeof(response_status_summary) = 'object'
  )
);

create table if not exists market_map_snapshots (
  id uuid primary key default gen_random_uuid(),
  map_id uuid not null references market_maps(id) on delete cascade,
  snapshot_type text not null default 'progress_update',
  mapped_total integer not null default 0,
  approached_total integer not null default 0,
  engaged_total integer not null default 0,
  shortlisted_total integer not null default 0,
  anonymised_summary jsonb not null default '{}'::jsonb,
  created_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint market_map_snapshots_type_check check (
    snapshot_type in ('progress_update', 'client_update', 'sales_presentation', 'public_anonymised')
  ),
  constraint market_map_snapshots_counts_check check (
    mapped_total >= 0 and
    approached_total >= 0 and
    engaged_total >= 0 and
    shortlisted_total >= 0
  ),
  constraint market_map_snapshots_summary_object_check check (
    jsonb_typeof(anonymised_summary) = 'object'
  )
);

create index if not exists market_maps_status_idx
  on market_maps(status, visibility, updated_at desc);

create index if not exists market_maps_client_idx
  on market_maps(client_company_id, updated_at desc)
  where client_company_id is not null;

create index if not exists market_map_segments_map_idx
  on market_map_segments(map_id, segment_type, segment_name);

create index if not exists market_map_snapshots_map_idx
  on market_map_snapshots(map_id, created_at desc);
