create table if not exists recruiter_lab_cv_anonymization_drafts (
  id uuid primary key default gen_random_uuid(),
  original_cv_file_id uuid not null references files(id) on delete restrict,
  anonymized_text text not null,
  anonymization_status text not null default 'david_review',
  reviewed_by uuid references admin_users(id) on delete set null,
  reviewed_at timestamptz,
  approved_for_client_use boolean not null default false,
  ai_generation_event_id uuid references audit_logs(id) on delete set null,
  redaction_notes text,
  removed_items jsonb not null default '[]'::jsonb,
  employer_names_redacted boolean not null default false,
  created_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint recruiter_lab_cv_anonymization_status_check check (
    anonymization_status in ('draft', 'david_review', 'approved', 'rejected', 'deleted')
  ),
  constraint recruiter_lab_cv_anonymization_client_approval_check check (
    approved_for_client_use = false or anonymization_status = 'approved'
  )
);

create index if not exists recruiter_lab_cv_anonymization_original_cv_idx
  on recruiter_lab_cv_anonymization_drafts(original_cv_file_id, created_at desc);

create index if not exists recruiter_lab_cv_anonymization_status_idx
  on recruiter_lab_cv_anonymization_drafts(anonymization_status, created_at desc);
