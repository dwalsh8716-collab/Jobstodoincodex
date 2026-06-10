create extension if not exists pgcrypto;

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null default 'viewer',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz,
  constraint admin_users_role_check check (role in ('owner', 'admin', 'editor', 'recruiter', 'viewer')),
  constraint admin_users_status_check check (status in ('active', 'invited', 'suspended'))
);

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  linkedin_url text,
  sector text,
  location text,
  size text,
  notes text,
  status text not null default 'lead',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  name text not null,
  email text,
  phone text,
  job_title text,
  linkedin_url text,
  contact_type text not null default 'client',
  notes text,
  consent_to_contact boolean not null default false,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'website',
  enquiry_type text not null,
  name text not null,
  email text not null,
  phone text,
  company text,
  job_title text,
  message text not null,
  service_interest text,
  urgency text,
  preferred_contact_method text,
  consent_to_contact boolean not null default false,
  marketing_consent boolean not null default false,
  status text not null default 'new',
  priority text not null default 'normal',
  assigned_to uuid references admin_users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint enquiries_status_check check (status in ('new', 'reviewed', 'contacted', 'qualified', 'converted', 'closed', 'spam')),
  constraint enquiries_priority_check check (priority in ('low', 'normal', 'high', 'urgent'))
);

create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  location text,
  linkedin_url text,
  current_title text,
  current_company text,
  desired_role text,
  salary_expectation text,
  notice_period text,
  work_preference text,
  sector_experience text,
  seniority text,
  status text not null default 'new',
  source text not null default 'website',
  consent_to_store_data boolean not null default false,
  consent_timestamp timestamptz,
  privacy_notice_version text,
  data_retention_until date,
  delete_requested_at timestamptz,
  export_requested_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  deleted_at timestamptz,
  deletion_reason text,
  constraint candidates_status_check check (status in ('new', 'reviewing', 'contacted', 'active', 'shortlisted', 'placed', 'notSuitable', 'archived', 'deleteRequested'))
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  sanity_job_id text,
  sanity_job_slug text,
  title text not null,
  client_company_id uuid references companies(id) on delete set null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null,
  owner_id uuid,
  file_name text not null,
  file_type text not null,
  file_size bigint not null,
  storage_provider text not null,
  storage_key text not null,
  uploaded_by uuid references admin_users(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  virus_scan_status text not null default 'pending',
  access_level text not null default 'private',
  retention_until date,
  deleted_at timestamptz,
  constraint files_owner_type_check check (owner_type in ('candidate', 'application', 'enquiry', 'company', 'contact')),
  constraint files_access_level_check check (access_level in ('private', 'restricted')),
  constraint files_virus_scan_status_check check (virus_scan_status in ('pending', 'clean', 'flagged', 'manual_review'))
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete set null,
  job_id uuid references jobs(id) on delete set null,
  sanity_job_id text,
  sanity_job_slug text,
  source text not null default 'website',
  cover_message text,
  cv_file_id uuid references files(id) on delete set null,
  status text not null default 'received',
  consent_to_store_data boolean not null default false,
  consent_timestamp timestamptz,
  privacy_notice_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint applications_status_check check (status in ('received', 'reviewing', 'contacted', 'shortlisted', 'submitted', 'interviewing', 'offered', 'placed', 'rejected', 'withdrawn', 'archived'))
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  note text not null,
  note_type text not null default 'general',
  created_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  title text not null,
  description text,
  status text not null default 'open',
  priority text not null default 'normal',
  due_at timestamptz,
  assigned_to uuid references admin_users(id) on delete set null,
  created_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint tasks_status_check check (status in ('open', 'in_progress', 'waiting', 'done', 'cancelled')),
  constraint tasks_priority_check check (priority in ('low', 'normal', 'high', 'urgent'))
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  activity_type text not null,
  title text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists consent_records (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  consent_type text not null,
  status text not null,
  source text not null,
  privacy_notice_version text,
  ip_hash text,
  user_agent_hash text,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  constraint consent_records_status_check check (status in ('granted', 'denied', 'withdrawn'))
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references admin_users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create index if not exists enquiries_status_created_at_idx on enquiries(status, created_at desc);
create index if not exists enquiries_email_idx on enquiries(lower(email));
create index if not exists candidates_status_created_at_idx on candidates(status, created_at desc);
create index if not exists candidates_email_idx on candidates(lower(email));
create index if not exists applications_status_created_at_idx on applications(status, created_at desc);
create index if not exists applications_sanity_job_slug_idx on applications(sanity_job_slug);
create index if not exists tasks_status_due_at_idx on tasks(status, due_at);
create index if not exists activities_entity_idx on activities(entity_type, entity_id, created_at desc);
create index if not exists consent_records_entity_idx on consent_records(entity_type, entity_id, created_at desc);
create index if not exists audit_logs_entity_idx on audit_logs(entity_type, entity_id, created_at desc);
