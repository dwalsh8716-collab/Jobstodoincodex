create table if not exists salary_guide_leads (
  id uuid primary key default gen_random_uuid(),
  guide_slug text not null,
  guide_title text not null,
  name text not null,
  company text not null,
  email text not null,
  job_title text,
  phone text,
  hiring_interest text not null,
  consent_to_contact boolean not null default false,
  marketing_consent boolean not null default false,
  lead_source text not null default 'salary_guide_landing_page',
  delivery_status text not null default 'pending',
  email_delivery_provider text,
  download_url_sent boolean not null default false,
  ip_hash text,
  user_agent_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint salary_guide_leads_hiring_interest_check check (
    hiring_interest in (
      'hiring_this_quarter',
      'hiring_this_year',
      'salary_benchmarking',
      'team_planning',
      'agency_growth',
      'just_researching'
    )
  ),
  constraint salary_guide_leads_delivery_status_check check (
    delivery_status in ('pending', 'sent', 'manual_follow_up', 'failed')
  )
);

create index if not exists salary_guide_leads_created_at_idx
  on salary_guide_leads(created_at desc);

create index if not exists salary_guide_leads_hiring_interest_idx
  on salary_guide_leads(hiring_interest, created_at desc);

create index if not exists salary_guide_leads_email_idx
  on salary_guide_leads(email);
