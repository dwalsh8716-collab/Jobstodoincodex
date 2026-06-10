create table if not exists data_subject_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null,
  requester_name text not null,
  requester_email text not null,
  requester_phone text,
  requester_email_hash text,
  message text not null,
  status text not null default 'received',
  verification_status text not null default 'pending',
  verified_at timestamptz,
  assigned_to uuid references admin_users(id) on delete set null,
  related_candidate_id uuid references candidates(id) on delete set null,
  related_contact_id uuid references contacts(id) on delete set null,
  related_enquiry_id uuid references enquiries(id) on delete set null,
  source text not null default 'website_privacy_request',
  due_at timestamptz,
  completed_at timestamptz,
  completion_notes text,
  closed_at timestamptz,
  ip_hash text,
  user_agent_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint data_subject_requests_type_check check (
    request_type in (
      'access_export',
      'deletion',
      'correction',
      'consent_withdrawal',
      'restriction',
      'objection',
      'other'
    )
  ),
  constraint data_subject_requests_status_check check (
    status in (
      'received',
      'verifying_identity',
      'in_review',
      'awaiting_info',
      'approved',
      'rejected',
      'completed',
      'closed'
    )
  ),
  constraint data_subject_requests_verification_check check (
    verification_status in (
      'not_started',
      'pending',
      'verified',
      'failed',
      'not_required'
    )
  )
);

create index if not exists data_subject_requests_status_due_idx on data_subject_requests(status, due_at);
create index if not exists data_subject_requests_email_hash_idx on data_subject_requests(requester_email_hash);
create index if not exists data_subject_requests_candidate_idx on data_subject_requests(related_candidate_id);
create index if not exists data_subject_requests_created_idx on data_subject_requests(created_at desc);
