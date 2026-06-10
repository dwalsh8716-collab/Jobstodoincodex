alter table candidates
  add column if not exists consent_source text,
  add column if not exists retention_category text not null default 'general_candidate_enquiry',
  add column if not exists retention_review_at date,
  add column if not exists retention_status text not null default 'active',
  add column if not exists opted_into_talent_pool boolean not null default false,
  add column if not exists talent_pool_consent_until date,
  add column if not exists deletion_approved_at timestamptz,
  add column if not exists anonymised_at timestamptz,
  add column if not exists anonymisation_reason text,
  add column if not exists retention_last_checked_at timestamptz;

alter table applications
  add column if not exists consent_source text,
  add column if not exists data_retention_until date,
  add column if not exists retention_category text not null default 'role_application',
  add column if not exists retention_review_at date,
  add column if not exists retention_status text not null default 'active',
  add column if not exists deletion_requested_at timestamptz,
  add column if not exists deletion_approved_at timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists anonymised_at timestamptz,
  add column if not exists deletion_reason text,
  add column if not exists anonymisation_reason text,
  add column if not exists retention_last_checked_at timestamptz;

alter table enquiries
  add column if not exists consent_source text,
  add column if not exists data_retention_until date,
  add column if not exists retention_category text not null default 'client_hiring_enquiry',
  add column if not exists retention_review_at date,
  add column if not exists retention_status text not null default 'active',
  add column if not exists deletion_requested_at timestamptz,
  add column if not exists deletion_approved_at timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists anonymised_at timestamptz,
  add column if not exists deletion_reason text,
  add column if not exists anonymisation_reason text,
  add column if not exists retention_last_checked_at timestamptz;

alter table files
  add column if not exists retention_category text not null default 'cv_file',
  add column if not exists retention_review_at date,
  add column if not exists retention_status text not null default 'active',
  add column if not exists deletion_requested_at timestamptz,
  add column if not exists deletion_approved_at timestamptz,
  add column if not exists anonymised_at timestamptz,
  add column if not exists deletion_reason text,
  add column if not exists anonymisation_reason text,
  add column if not exists retention_last_checked_at timestamptz;

alter table data_subject_requests
  add column if not exists data_retention_until date,
  add column if not exists retention_category text not null default 'dsar_record',
  add column if not exists retention_review_at date,
  add column if not exists retention_status text not null default 'active',
  add column if not exists anonymised_at timestamptz,
  add column if not exists anonymisation_reason text,
  add column if not exists retention_last_checked_at timestamptz;

do $$
begin
  alter table candidates add constraint candidates_retention_status_check check (
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
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table applications add constraint applications_retention_status_check check (
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
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table enquiries add constraint enquiries_retention_status_check check (
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
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table files add constraint files_retention_status_check check (
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
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table data_subject_requests add constraint data_subject_requests_retention_status_check check (
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
  );
exception
  when duplicate_object then null;
end $$;

create index if not exists candidates_retention_due_idx on candidates(retention_status, data_retention_until, retention_review_at);
create index if not exists applications_retention_due_idx on applications(retention_status, data_retention_until, retention_review_at);
create index if not exists enquiries_retention_due_idx on enquiries(retention_status, data_retention_until, retention_review_at);
create index if not exists files_retention_due_idx on files(retention_status, retention_until, retention_review_at);
create index if not exists data_subject_requests_retention_due_idx on data_subject_requests(retention_status, data_retention_until, retention_review_at);

create or replace view retention_review_queue as
select
  'candidate'::text as entity_type,
  id as entity_id,
  name as entity_label,
  retention_category,
  retention_status,
  data_retention_until,
  retention_review_at,
  delete_requested_at,
  deleted_at,
  anonymised_at,
  case
    when retention_status in ('deleted', 'anonymised', 'retained_for_legal_reason') then 'no_action'
    when delete_requested_at is not null then 'review_deletion_request'
    when data_retention_until is not null and data_retention_until <= current_date then 'review_expired_retention'
    when retention_review_at is not null and retention_review_at <= current_date then 'review_due'
    when data_retention_until is not null and data_retention_until <= current_date + interval '30 days' then 'expiring_soon'
    else 'no_action'
  end as recommended_action
from candidates
where deleted_at is null
union all
select
  'application'::text,
  id,
  coalesce(sanity_job_slug, 'Application') as entity_label,
  retention_category,
  retention_status,
  data_retention_until,
  retention_review_at,
  deletion_requested_at,
  deleted_at,
  anonymised_at,
  case
    when retention_status in ('deleted', 'anonymised', 'retained_for_legal_reason') then 'no_action'
    when deletion_requested_at is not null then 'review_deletion_request'
    when data_retention_until is not null and data_retention_until <= current_date then 'review_expired_retention'
    when retention_review_at is not null and retention_review_at <= current_date then 'review_due'
    when data_retention_until is not null and data_retention_until <= current_date + interval '30 days' then 'expiring_soon'
    else 'no_action'
  end
from applications
where deleted_at is null
union all
select
  'enquiry'::text,
  id,
  concat(enquiry_type, ' enquiry') as entity_label,
  retention_category,
  retention_status,
  data_retention_until,
  retention_review_at,
  deletion_requested_at,
  deleted_at,
  anonymised_at,
  case
    when retention_status in ('deleted', 'anonymised', 'retained_for_legal_reason') then 'no_action'
    when deletion_requested_at is not null then 'review_deletion_request'
    when data_retention_until is not null and data_retention_until <= current_date then 'review_expired_retention'
    when retention_review_at is not null and retention_review_at <= current_date then 'review_due'
    when data_retention_until is not null and data_retention_until <= current_date + interval '30 days' then 'expiring_soon'
    else 'no_action'
  end
from enquiries
where deleted_at is null
union all
select
  'cv_file'::text,
  id,
  file_name as entity_label,
  retention_category,
  retention_status,
  retention_until as data_retention_until,
  retention_review_at,
  deletion_requested_at,
  deleted_at,
  anonymised_at,
  case
    when retention_status in ('deleted', 'anonymised', 'retained_for_legal_reason') then 'no_action'
    when deletion_requested_at is not null then 'review_deletion_request'
    when retention_until is not null and retention_until <= current_date then 'review_expired_retention'
    when retention_review_at is not null and retention_review_at <= current_date then 'review_due'
    when retention_until is not null and retention_until <= current_date + interval '30 days' then 'expiring_soon'
    else 'no_action'
  end
from files
where deleted_at is null
union all
select
  'data_subject_request'::text,
  id,
  concat(request_type, ' privacy request') as entity_label,
  retention_category,
  retention_status,
  data_retention_until,
  retention_review_at,
  null::timestamptz as delete_requested_at,
  null::timestamptz as deleted_at,
  anonymised_at,
  case
    when retention_status in ('deleted', 'anonymised', 'retained_for_legal_reason') then 'no_action'
    when data_retention_until is not null and data_retention_until <= current_date then 'review_expired_retention'
    when retention_review_at is not null and retention_review_at <= current_date then 'review_due'
    when data_retention_until is not null and data_retention_until <= current_date + interval '30 days' then 'expiring_soon'
    else 'no_action'
  end
from data_subject_requests
where anonymised_at is null;
