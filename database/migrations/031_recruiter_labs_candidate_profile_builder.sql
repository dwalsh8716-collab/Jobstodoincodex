create table if not exists recruiter_lab_candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete set null,
  application_id uuid references applications(id) on delete set null,
  profile_status text not null default 'draft',
  display_name text,
  anonymised_label text,
  current_title text,
  current_company_private text,
  location text,
  work_preference text,
  salary_expectation text,
  rate_expectation text,
  notice_period text,
  availability text,
  seniority text,
  sector_experience jsonb not null default '[]'::jsonb,
  agency_client_side text,
  functional_strengths jsonb not null default '[]'::jsonb,
  leadership_scope text,
  commercial_impact jsonb not null default '[]'::jsonb,
  david_summary text,
  strengths jsonb not null default '[]'::jsonb,
  watchouts jsonb not null default '[]'::jsonb,
  relevant_experience jsonb not null default '[]'::jsonb,
  cv_access_authorised boolean not null default false,
  cv_file_id uuid,
  cv_metadata jsonb not null default '{}'::jsonb,
  ai_draft_used boolean not null default false,
  ai_draft_id uuid references recruiter_lab_ai_drafts(id) on delete set null,
  ai_draft_reviewed_by uuid references admin_users(id) on delete set null,
  ai_draft_reviewed_at timestamptz,
  approved_for_client_use boolean not null default false,
  approved_by uuid references admin_users(id) on delete set null,
  approved_at timestamptz,
  consent_checked_at timestamptz,
  retention_status text not null default 'pending_review',
  created_by uuid references admin_users(id) on delete set null,
  updated_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint recruiter_lab_candidate_profiles_status_check check (
    profile_status in (
      'draft',
      'david_review_required',
      'david_edited',
      'approved_for_client',
      'withheld',
      'archived',
      'deleted'
    )
  ),
  constraint recruiter_lab_candidate_profiles_agency_side_check check (
    agency_client_side is null
    or agency_client_side in ('agency', 'client_side', 'both', 'to_be_confirmed')
  ),
  constraint recruiter_lab_candidate_profiles_arrays_check check (
    jsonb_typeof(sector_experience) = 'array'
    and jsonb_typeof(functional_strengths) = 'array'
    and jsonb_typeof(commercial_impact) = 'array'
    and jsonb_typeof(strengths) = 'array'
    and jsonb_typeof(watchouts) = 'array'
    and jsonb_typeof(relevant_experience) = 'array'
  ),
  constraint recruiter_lab_candidate_profiles_ai_review_check check (
    ai_draft_used = false
    or (ai_draft_reviewed_by is not null and ai_draft_reviewed_at is not null)
    or approved_for_client_use = false
  ),
  constraint recruiter_lab_candidate_profiles_client_approval_check check (
    approved_for_client_use = false
    or (
      profile_status = 'approved_for_client'
      and approved_by is not null
      and approved_at is not null
      and consent_checked_at is not null
    )
  )
);

alter table recruiter_lab_candidate_profile_versions
  add column if not exists candidate_profile_id uuid references recruiter_lab_candidate_profiles(id) on delete cascade,
  add column if not exists source_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists change_reason text;

create table if not exists recruiter_lab_candidate_profile_generation_events (
  id uuid primary key default gen_random_uuid(),
  candidate_profile_id uuid references recruiter_lab_candidate_profiles(id) on delete cascade,
  shortlist_candidate_id uuid references recruiter_lab_shortlist_candidates(id) on delete set null,
  source_type text not null,
  action text not null,
  actor_id uuid references admin_users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint recruiter_lab_candidate_profile_generation_source_check check (
    source_type in ('manual', 'application', 'cv_metadata', 'cv_text_extract', 'ai_draft')
  ),
  constraint recruiter_lab_candidate_profile_generation_action_check check (
    action in (
      'manual_profile_created',
      'cv_metadata_attached',
      'cv_text_extracted',
      'ai_draft_requested',
      'ai_draft_generated',
      'david_review_started',
      'david_edited',
      'approved_for_client',
      'withheld',
      'archived'
    )
  )
);

create index if not exists recruiter_lab_candidate_profiles_candidate_idx
  on recruiter_lab_candidate_profiles(candidate_id, profile_status, updated_at desc)
  where candidate_id is not null;

create index if not exists recruiter_lab_candidate_profiles_application_idx
  on recruiter_lab_candidate_profiles(application_id, updated_at desc)
  where application_id is not null;

create index if not exists recruiter_lab_candidate_profiles_status_idx
  on recruiter_lab_candidate_profiles(profile_status, approved_at desc, updated_at desc);

create index if not exists recruiter_lab_candidate_profile_versions_profile_idx
  on recruiter_lab_candidate_profile_versions(candidate_profile_id, version_number desc, created_at desc)
  where candidate_profile_id is not null;

create index if not exists recruiter_lab_candidate_profile_generation_events_profile_idx
  on recruiter_lab_candidate_profile_generation_events(candidate_profile_id, created_at desc)
  where candidate_profile_id is not null;
