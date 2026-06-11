create table if not exists market_data_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null,
  citation_url text,
  owner_admin_id uuid references admin_users(id) on delete set null,
  confidence_level text not null default 'draft',
  methodology_note text not null,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint market_data_sources_type_check check (
    source_type in (
      'verified_salary_guide',
      'anonymised_internal_application',
      'anonymised_candidate_expectation',
      'manual_market_range',
      'survey_response',
      'public_citation',
      'david_verified_market_note'
    )
  ),
  constraint market_data_sources_confidence_check check (
    confidence_level in ('draft', 'low', 'medium', 'high', 'verified')
  )
);

create table if not exists market_dashboard_configs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  audience text not null,
  status text not null default 'hidden',
  feature_flag text not null default 'FEATURE_LIVE_MARKET_DASHBOARDS',
  route_path text,
  noindex boolean not null default true,
  methodology_note text not null,
  lead_capture_path text,
  last_published_at timestamptz,
  created_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint market_dashboard_configs_status_check check (
    status in ('hidden', 'draft', 'private_preview', 'verified', 'published', 'archived')
  ),
  constraint market_dashboard_configs_public_gate_check check (
    status <> 'published' or (
      noindex = false and
      last_published_at is not null and
      methodology_note <> ''
    )
  )
);

create table if not exists market_data_points (
  id uuid primary key default gen_random_uuid(),
  dashboard_config_id uuid references market_dashboard_configs(id) on delete cascade,
  source_id uuid references market_data_sources(id) on delete restrict,
  role_family text not null,
  role_title text,
  seniority text,
  location text,
  sector text,
  function_channel text,
  demand_level text,
  availability_level text,
  confidence_level text not null default 'draft',
  sample_size integer,
  notes text,
  last_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint market_data_points_confidence_check check (
    confidence_level in ('draft', 'low', 'medium', 'high', 'verified')
  ),
  constraint market_data_points_sample_size_check check (
    sample_size is null or sample_size >= 0
  )
);

create table if not exists salary_ranges (
  id uuid primary key default gen_random_uuid(),
  market_data_point_id uuid references market_data_points(id) on delete cascade,
  currency text not null default 'GBP',
  period text not null default 'annual',
  min_salary integer,
  median_salary integer,
  max_salary integer,
  confidence_level text not null default 'draft',
  notes text,
  last_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint salary_ranges_period_check check (
    period in ('annual', 'daily', 'hourly', 'fixed')
  ),
  constraint salary_ranges_order_check check (
    min_salary is null or
    median_salary is null or
    max_salary is null or
    (min_salary <= median_salary and median_salary <= max_salary)
  ),
  constraint salary_ranges_confidence_check check (
    confidence_level in ('draft', 'low', 'medium', 'high', 'verified')
  )
);

create table if not exists rate_ranges (
  id uuid primary key default gen_random_uuid(),
  market_data_point_id uuid references market_data_points(id) on delete cascade,
  currency text not null default 'GBP',
  period text not null default 'daily',
  day_rate_min integer,
  day_rate_median integer,
  day_rate_max integer,
  confidence_level text not null default 'draft',
  notes text,
  last_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint rate_ranges_period_check check (
    period in ('daily', 'hourly', 'fixed')
  ),
  constraint rate_ranges_order_check check (
    day_rate_min is null or
    day_rate_median is null or
    day_rate_max is null or
    (
      day_rate_min <= day_rate_median and
      day_rate_median <= day_rate_max
    )
  ),
  constraint rate_ranges_confidence_check check (
    confidence_level in ('draft', 'low', 'medium', 'high', 'verified')
  )
);

create index if not exists market_data_sources_confidence_idx
  on market_data_sources(confidence_level, last_verified_at desc);

create index if not exists market_dashboard_configs_status_idx
  on market_dashboard_configs(status, noindex, updated_at desc);

create index if not exists market_data_points_dashboard_idx
  on market_data_points(dashboard_config_id, role_family, seniority, location);

create index if not exists market_data_points_confidence_idx
  on market_data_points(confidence_level, last_updated_at desc);

create index if not exists salary_ranges_market_data_point_idx
  on salary_ranges(market_data_point_id, confidence_level);

create index if not exists rate_ranges_market_data_point_idx
  on rate_ranges(market_data_point_id, confidence_level);
