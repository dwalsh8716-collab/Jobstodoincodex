create table if not exists recruiter_lab_interview_transcripts (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete set null,
  application_id uuid references applications(id) on delete set null,
  interview_request_id uuid references recruiter_lab_interview_requests(id) on delete set null,
  source_type text not null default 'fake_transcript',
  storage_file_id uuid references files(id) on delete set null,
  transcript_text_redacted text,
  provider text,
  consent_captured_at timestamptz,
  retention_until date,
  deleted_at timestamptz,
  status text not null default 'staged',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recruiter_lab_interview_transcripts_source_check check (
    source_type in ('manual_notes', 'fake_transcript', 'provider_transcript', 'audio_upload')
  ),
  constraint recruiter_lab_interview_transcripts_status_check check (
    status in ('staged', 'consent_required', 'redacted', 'david_review', 'approved', 'deleted')
  ),
  constraint recruiter_lab_interview_transcripts_consent_check check (
    source_type in ('manual_notes', 'fake_transcript')
    or consent_captured_at is not null
  )
);

create table if not exists recruiter_lab_interview_notes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete set null,
  application_id uuid references applications(id) on delete set null,
  interview_request_id uuid references recruiter_lab_interview_requests(id) on delete set null,
  interviewer_id uuid references admin_users(id) on delete set null,
  source_type text not null default 'manual_notes',
  transcript_id uuid references recruiter_lab_interview_transcripts(id) on delete set null,
  status text not null default 'draft',
  summary_draft text,
  structured_notes jsonb not null default '[]'::jsonb,
  david_edited_notes jsonb not null default '[]'::jsonb,
  approved_for_profile_use boolean not null default false,
  approved_by uuid references admin_users(id) on delete set null,
  approved_at timestamptz,
  approval_event_id uuid references audit_logs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint recruiter_lab_interview_notes_source_check check (
    source_type in ('manual_notes', 'fake_transcript', 'provider_transcript', 'audio_upload')
  ),
  constraint recruiter_lab_interview_notes_status_check check (
    status in (
      'draft',
      'ai_draft_generated',
      'david_review_required',
      'david_edited',
      'approved_for_profile_use',
      'archived',
      'deleted'
    )
  ),
  constraint recruiter_lab_interview_notes_arrays_check check (
    jsonb_typeof(structured_notes) = 'array'
    and jsonb_typeof(david_edited_notes) = 'array'
  ),
  constraint recruiter_lab_interview_notes_approval_check check (
    approved_for_profile_use = false
    or (approved_by is not null and approved_at is not null and status = 'approved_for_profile_use')
  )
);

create table if not exists recruiter_lab_interview_scorecard_sections (
  id uuid primary key default gen_random_uuid(),
  interview_note_id uuid not null references recruiter_lab_interview_notes(id) on delete cascade,
  section_name text not null,
  notes text,
  evidence text,
  follow_up_needed boolean not null default false,
  display_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint recruiter_lab_interview_scorecard_sections_name_check check (
    section_name in (
      'role_motivation',
      'relevant_experience',
      'leadership_seniority',
      'commercial_impact',
      'functional_expertise',
      'stakeholder_management',
      'agency_client_side_fit',
      'strategic_vs_hands_on_balance',
      'availability_notice',
      'salary_rate_alignment',
      'concerns_watchouts',
      'follow_up_questions'
    )
  )
);

create table if not exists recruiter_lab_ai_generation_events (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  provider text,
  model_name text,
  prompt_version text not null,
  input_redacted boolean not null default true,
  output_summary text,
  status text not null default 'blocked',
  reviewed_by uuid references admin_users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint recruiter_lab_ai_generation_events_status_check check (
    status in ('blocked', 'generated', 'david_review', 'approved', 'rejected', 'deleted')
  ),
  constraint recruiter_lab_ai_generation_events_entity_check check (
    entity_type in ('interview_note', 'candidate_summary', 'client_profile', 'brief_diagnostic')
  )
);

create index if not exists recruiter_lab_interview_transcripts_candidate_idx
  on recruiter_lab_interview_transcripts(candidate_id, application_id, created_at desc);

create index if not exists recruiter_lab_interview_notes_candidate_idx
  on recruiter_lab_interview_notes(candidate_id, application_id, created_at desc);

create index if not exists recruiter_lab_interview_notes_status_idx
  on recruiter_lab_interview_notes(status, approved_at desc, created_at desc);

create index if not exists recruiter_lab_interview_scorecard_sections_note_idx
  on recruiter_lab_interview_scorecard_sections(interview_note_id, display_order);

create index if not exists recruiter_lab_ai_generation_events_entity_idx
  on recruiter_lab_ai_generation_events(entity_type, entity_id, created_at desc);
