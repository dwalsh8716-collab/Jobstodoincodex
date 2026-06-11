alter table interim_candidate_availability
  add column if not exists preferred_contract_type text,
  add column if not exists sectors text,
  add column if not exists functions text,
  add column if not exists location_preference text,
  add column if not exists remote_preference text,
  add column if not exists contact_preference text,
  add column if not exists consent_reviewed_at timestamptz,
  add column if not exists consent_until date,
  add column if not exists profile_visibility text not null default 'private';

do $$
begin
  alter table interim_candidate_availability add constraint interim_candidate_availability_visibility_check check (
    profile_visibility in ('private', 'admin_only', 'withheld', 'deleted')
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists interim_profiles (
  candidate_id uuid primary key references candidates(id) on delete cascade,
  profile_status text not null default 'draft',
  profile_visibility text not null default 'private',
  headline text,
  seniority text,
  sectors jsonb not null default '[]'::jsonb,
  functions jsonb not null default '[]'::jsonb,
  location text,
  remote_preference text,
  current_status text,
  cv_file_id uuid references files(id) on delete set null,
  case_study_highlights jsonb not null default '[]'::jsonb,
  contact_preferences jsonb not null default '{}'::jsonb,
  consent_until date,
  retention_status text not null default 'pending_review',
  last_reviewed_at timestamptz,
  last_updated_at timestamptz not null default now(),
  notes text,
  created_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interim_profiles_status_check check (
    profile_status in ('draft', 'reviewing', 'active', 'stale', 'withheld', 'archived', 'deleted')
  ),
  constraint interim_profiles_visibility_check check (
    profile_visibility in ('private', 'admin_only', 'client_shortlist_only', 'withheld', 'deleted')
  ),
  constraint interim_profiles_retention_status_check check (
    retention_status in (
      'active',
      'pending_review',
      'expiring_soon',
      'delete_requested',
      'deletion_approved',
      'deleted',
      'anonymised',
      'retained_for_legal_reason'
    )
  ),
  constraint interim_profiles_sectors_array_check check (jsonb_typeof(sectors) = 'array'),
  constraint interim_profiles_functions_array_check check (jsonb_typeof(functions) = 'array'),
  constraint interim_profiles_case_studies_array_check check (jsonb_typeof(case_study_highlights) = 'array')
);

create table if not exists interim_preferences (
  candidate_id uuid primary key references candidates(id) on delete cascade,
  preferred_contract_types jsonb not null default '[]'::jsonb,
  sectors jsonb not null default '[]'::jsonb,
  functions jsonb not null default '[]'::jsonb,
  day_rate_min integer,
  day_rate_max integer,
  location_preference text,
  remote_preference text,
  contact_preference text,
  consent_to_interim_bench boolean not null default false,
  consent_until date,
  updated_via text not null default 'admin',
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint interim_preferences_day_rate_check check (
    day_rate_min is null or
    day_rate_max is null or
    day_rate_min <= day_rate_max
  ),
  constraint interim_preferences_contract_types_array_check check (
    jsonb_typeof(preferred_contract_types) = 'array'
  ),
  constraint interim_preferences_sectors_array_check check (jsonb_typeof(sectors) = 'array'),
  constraint interim_preferences_functions_array_check check (jsonb_typeof(functions) = 'array')
);

create table if not exists interim_profile_updates (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  update_source text not null,
  update_type text not null,
  before jsonb,
  after jsonb,
  reviewed_by uuid references admin_users(id) on delete set null,
  reviewed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint interim_profile_updates_source_check check (
    update_source in ('admin', 'magic_link', 'email', 'whatsapp', 'manual_review')
  ),
  constraint interim_profile_updates_type_check check (
    update_type in ('availability', 'preferences', 'profile', 'consent', 'retention', 'cv_reference')
  )
);

create table if not exists interim_consent_records (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  consent_type text not null,
  status text not null,
  source text not null,
  consent_until date,
  privacy_notice_version text,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  constraint interim_consent_records_type_check check (
    consent_type in ('interim_bench', 'availability_check_in', 'profile_storage', 'cv_reference', 'whatsapp_contact')
  ),
  constraint interim_consent_records_status_check check (
    status in ('granted', 'denied', 'withdrawn', 'expired')
  )
);

create index if not exists interim_profiles_status_idx
  on interim_profiles(profile_status, retention_status, last_updated_at desc);

create index if not exists interim_profiles_visibility_idx
  on interim_profiles(profile_visibility, last_reviewed_at desc);

create index if not exists interim_preferences_rate_idx
  on interim_preferences(day_rate_min, day_rate_max)
  where day_rate_min is not null or day_rate_max is not null;

create index if not exists interim_profile_updates_candidate_idx
  on interim_profile_updates(candidate_id, created_at desc);

create index if not exists interim_consent_records_candidate_idx
  on interim_consent_records(candidate_id, consent_type, created_at desc);

create index if not exists interim_candidate_availability_consent_idx
  on interim_candidate_availability(consent_until, last_updated_at desc)
  where consent_until is not null;
