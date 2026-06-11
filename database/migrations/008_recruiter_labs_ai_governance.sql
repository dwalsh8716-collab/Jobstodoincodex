create table if not exists recruiter_lab_ai_drafts (
  id uuid primary key default gen_random_uuid(),
  related_entity_type text,
  related_entity_id uuid,
  draft_type text not null,
  status text not null default 'draft',
  data_classification text not null default 'sample',
  ai_provider text,
  model_name text,
  prompt_summary text,
  output_summary text,
  redaction_notes text,
  david_reviewed_by uuid references admin_users(id) on delete set null,
  david_reviewed_at timestamptz,
  approved_for_client_at timestamptz,
  retention_status text not null default 'pending_review',
  created_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint recruiter_lab_ai_drafts_draft_type_check check (
    draft_type in (
      'interview_notes',
      'scorecard_notes',
      'candidate_summary',
      'client_profile',
      'interview_questions',
      'follow_up',
      'admin_task',
      'internal_briefing'
    )
  ),
  constraint recruiter_lab_ai_drafts_status_check check (
    status in ('draft', 'david_review', 'approved', 'rejected', 'deleted')
  ),
  constraint recruiter_lab_ai_drafts_data_classification_check check (
    data_classification in ('sample', 'redacted', 'private')
  ),
  constraint recruiter_lab_ai_drafts_retention_status_check check (
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
  )
);

create index if not exists recruiter_lab_ai_drafts_status_idx
  on recruiter_lab_ai_drafts(status, draft_type, created_at desc);

create index if not exists recruiter_lab_ai_drafts_related_entity_idx
  on recruiter_lab_ai_drafts(related_entity_type, related_entity_id, created_at desc);
