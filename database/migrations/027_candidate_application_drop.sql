alter table applications
  add column if not exists applicant_name text,
  add column if not exists applicant_email text,
  add column if not exists applicant_phone text,
  add column if not exists profile_url text,
  add column if not exists note text,
  add column if not exists application_method text not null default 'profile_or_note',
  add column if not exists source_page text,
  add column if not exists talent_pool_consent boolean not null default false,
  add column if not exists privacy_notice_acknowledged boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'applications_application_method_check'
  ) then
    alter table applications
      add constraint applications_application_method_check check (
        application_method in ('profile_or_note', 'cv_upload', 'manual_import')
      );
  end if;
end $$;

create table if not exists candidate_files (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete set null,
  application_id uuid references applications(id) on delete set null,
  file_type text not null,
  original_filename text not null,
  storage_key text not null,
  file_size bigint not null,
  uploaded_at timestamptz not null default now(),
  retention_until date,
  retention_category text not null default 'cv_file',
  retention_review_at date,
  retention_status text not null default 'active',
  deletion_requested_at timestamptz,
  deletion_approved_at timestamptz,
  deleted_at timestamptz,
  anonymised_at timestamptz,
  deletion_reason text,
  anonymisation_reason text,
  retention_last_checked_at timestamptz,
  virus_scan_status text not null default 'pending',
  access_level text not null default 'private',
  constraint candidate_files_file_size_check check (file_size > 0),
  constraint candidate_files_retention_status_check check (
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
  constraint candidate_files_access_level_check check (access_level in ('private', 'restricted')),
  constraint candidate_files_virus_scan_status_check check (virus_scan_status in ('pending', 'clean', 'flagged', 'manual_review'))
);

create index if not exists applications_applicant_email_idx
  on applications(lower(applicant_email))
  where applicant_email is not null;

create index if not exists applications_source_page_idx
  on applications(source_page, created_at desc)
  where source_page is not null;

create index if not exists candidate_files_candidate_idx
  on candidate_files(candidate_id, uploaded_at desc);

create index if not exists candidate_files_application_idx
  on candidate_files(application_id, uploaded_at desc);

create index if not exists candidate_files_retention_due_idx
  on candidate_files(retention_status, retention_until, retention_review_at);
