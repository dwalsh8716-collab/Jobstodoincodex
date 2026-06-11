create table if not exists labs_bad_hire_calculator_assumptions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  version text not null default 'v1-staged',
  status text not null default 'draft',
  salary_multiplier numeric(6, 3),
  recruitment_fee_rate numeric(6, 3) not null default 0.220,
  ramp_productivity_loss_rate numeric(6, 3) not null default 0.450,
  management_day_cost_gbp integer not null default 650,
  vacancy_cost_multiplier numeric(6, 3) not null default 0.350,
  replacement_cost_multiplier numeric(6, 3) not null default 0.350,
  interim_cover_day_rate_gbp integer not null default 700,
  opportunity_cost_multiplier numeric(6, 3) not null default 0.500,
  team_disruption_rate numeric(6, 3) not null default 0.080,
  agency_client_impact_rate numeric(6, 3) not null default 0.060,
  source_links jsonb not null default '[]'::jsonb,
  caveats text not null,
  created_by uuid references admin_users(id) on delete set null,
  reviewed_by uuid references admin_users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint labs_bad_hire_assumptions_status_check check (
    status in ('draft', 'david_review', 'approved_for_private_preview', 'approved_for_public', 'archived')
  ),
  constraint labs_bad_hire_assumptions_source_links_array_check check (
    jsonb_typeof(source_links) = 'array'
  )
);

create table if not exists labs_bad_hire_calculator_leads (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  contact_email text not null,
  company_name text,
  role_title text,
  seniority text,
  salary_or_rate_gbp integer,
  result_summary jsonb not null default '{}'::jsonb,
  assumption_version text not null default 'v1-staged',
  email_results_requested boolean not null default false,
  whatsapp_follow_up_requested boolean not null default false,
  booking_follow_up_requested boolean not null default false,
  consent_to_contact boolean not null default false,
  privacy_notice_acknowledged_at timestamptz,
  source_route text not null default '/admin/labs/bad-hire-calculator',
  created_at timestamptz not null default now(),
  constraint labs_bad_hire_leads_result_summary_object_check check (
    jsonb_typeof(result_summary) = 'object'
  )
);

create index if not exists labs_bad_hire_assumptions_status_idx
  on labs_bad_hire_calculator_assumptions(status, updated_at desc);

create index if not exists labs_bad_hire_leads_email_idx
  on labs_bad_hire_calculator_leads(contact_email, created_at desc);

create index if not exists labs_bad_hire_leads_created_idx
  on labs_bad_hire_calculator_leads(created_at desc);

create or replace view bad_hire_calculator_assumptions as
select
  id,
  title,
  version,
  status,
  salary_multiplier,
  recruitment_fee_rate,
  ramp_productivity_loss_rate,
  management_day_cost_gbp,
  vacancy_cost_multiplier,
  replacement_cost_multiplier,
  interim_cover_day_rate_gbp,
  opportunity_cost_multiplier,
  team_disruption_rate,
  agency_client_impact_rate,
  source_links,
  caveats,
  reviewed_at,
  created_at,
  updated_at
from labs_bad_hire_calculator_assumptions;

create or replace view bad_hire_calculator_leads as
select
  id,
  contact_name,
  contact_email,
  company_name,
  role_title,
  seniority,
  salary_or_rate_gbp,
  result_summary,
  assumption_version,
  email_results_requested,
  whatsapp_follow_up_requested,
  booking_follow_up_requested,
  consent_to_contact,
  privacy_notice_acknowledged_at,
  source_route,
  created_at
from labs_bad_hire_calculator_leads;
