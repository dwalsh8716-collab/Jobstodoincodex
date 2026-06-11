create table if not exists labs_functional_matrices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  role_title text not null,
  service_type text not null,
  client_type text,
  status text not null default 'draft',
  matrix_scores jsonb not null default '{}'::jsonb,
  must_haves jsonb not null default '[]'::jsonb,
  nice_to_haves jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  notes text,
  source_context text not null default 'private_admin',
  related_shortlist_id uuid references recruiter_lab_shortlists(id) on delete set null,
  related_job_id uuid references jobs(id) on delete set null,
  created_by uuid references admin_users(id) on delete set null,
  updated_by uuid references admin_users(id) on delete set null,
  reviewed_by uuid references admin_users(id) on delete set null,
  reviewed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint labs_functional_matrices_status_check check (
    status in ('draft', 'david_review', 'approved_template', 'private_client_draft', 'archived')
  ),
  constraint labs_functional_matrices_source_context_check check (
    source_context in ('private_admin', 'client_brief', 'retained_search', 'strategic_interim', 'shortlist_review', 'salary_benchmarking')
  ),
  constraint labs_functional_matrices_scores_object_check check (
    jsonb_typeof(matrix_scores) = 'object'
  ),
  constraint labs_functional_matrices_must_haves_array_check check (
    jsonb_typeof(must_haves) = 'array'
  ),
  constraint labs_functional_matrices_nice_to_haves_array_check check (
    jsonb_typeof(nice_to_haves) = 'array'
  ),
  constraint labs_functional_matrices_risks_array_check check (
    jsonb_typeof(risks) = 'array'
  )
);

create table if not exists labs_functional_matrix_events (
  id uuid primary key default gen_random_uuid(),
  matrix_id uuid not null references labs_functional_matrices(id) on delete cascade,
  event_type text not null,
  actor_admin_id uuid references admin_users(id) on delete set null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint labs_functional_matrix_events_type_check check (
    event_type in (
      'draft_created',
      'matrix_updated',
      'david_review_started',
      'approved_as_template',
      'client_draft_created',
      'shortlist_comparison_created',
      'archived'
    )
  )
);

create index if not exists labs_functional_matrices_status_idx
  on labs_functional_matrices(status, updated_at desc);

create index if not exists labs_functional_matrices_service_idx
  on labs_functional_matrices(service_type, source_context, updated_at desc);

create index if not exists labs_functional_matrices_related_shortlist_idx
  on labs_functional_matrices(related_shortlist_id)
  where related_shortlist_id is not null;

create index if not exists labs_functional_matrix_events_matrix_idx
  on labs_functional_matrix_events(matrix_id, created_at desc);

create or replace view functional_matrices as
select
  id,
  title,
  role_title,
  service_type,
  client_type,
  matrix_scores,
  must_haves,
  nice_to_haves,
  risks,
  notes,
  status,
  source_context,
  related_shortlist_id,
  related_job_id,
  created_at,
  updated_at
from labs_functional_matrices;
