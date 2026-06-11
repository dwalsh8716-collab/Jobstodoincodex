do $$
begin
  alter table files drop constraint if exists files_owner_type_check;

  alter table files add constraint files_owner_type_check check (
    owner_type in (
      'candidate',
      'application',
      'enquiry',
      'company',
      'contact',
      'recruiter_labs_audio_note'
    )
  );
end $$;

create table if not exists recruiter_lab_candidate_audio_notes (
  id uuid primary key default gen_random_uuid(),
  shortlist_candidate_id uuid not null references recruiter_lab_shortlist_candidates(id) on delete cascade,
  source_file_id uuid not null references files(id) on delete restrict,
  compressed_file_id uuid references files(id) on delete restrict,
  title text not null default 'David''s take',
  duration_seconds integer not null,
  transcript text,
  transcript_status text not null default 'not_provided',
  compression_status text not null default 'pending',
  approval_status text not null default 'draft',
  approved_by uuid references admin_users(id) on delete set null,
  approved_at timestamptz,
  client_visible_at timestamptz,
  retention_until date,
  deletion_status text not null default 'active',
  delete_requested_at timestamptz,
  deleted_at timestamptz,
  access_log_count integer not null default 0,
  last_accessed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recruiter_lab_audio_notes_duration_check check (
    duration_seconds >= 1 and duration_seconds <= 60
  ),
  constraint recruiter_lab_audio_notes_transcript_status_check check (
    transcript_status in ('not_provided', 'draft', 'approved')
  ),
  constraint recruiter_lab_audio_notes_compression_status_check check (
    compression_status in ('pending', 'compressed', 'failed', 'manual_review')
  ),
  constraint recruiter_lab_audio_notes_approval_status_check check (
    approval_status in ('draft', 'david_review', 'approved', 'revoked')
  ),
  constraint recruiter_lab_audio_notes_deletion_status_check check (
    deletion_status in ('active', 'delete_requested', 'deleted')
  ),
  constraint recruiter_lab_audio_notes_approved_visibility_check check (
    approval_status <> 'approved' or (
      approved_at is not null and
      compressed_file_id is not null and
      compression_status = 'compressed' and
      deletion_status = 'active'
    )
  ),
  constraint recruiter_lab_audio_notes_access_count_check check (
    access_log_count >= 0
  )
);

create table if not exists recruiter_lab_candidate_audio_note_access_logs (
  id uuid primary key default gen_random_uuid(),
  audio_note_id uuid not null references recruiter_lab_candidate_audio_notes(id) on delete cascade,
  shortlist_candidate_id uuid not null references recruiter_lab_shortlist_candidates(id) on delete cascade,
  access_token_id uuid references recruiter_lab_client_access_tokens(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint recruiter_lab_audio_note_access_event_type_check check (
    event_type in (
      'playback_requested',
      'playback_blocked',
      'signed_playback_issued',
      'audio_deleted'
    )
  )
);

create unique index if not exists recruiter_lab_audio_notes_current_approved_idx
  on recruiter_lab_candidate_audio_notes(shortlist_candidate_id)
  where approval_status = 'approved'
    and deletion_status = 'active'
    and deleted_at is null;

create index if not exists recruiter_lab_audio_notes_candidate_idx
  on recruiter_lab_candidate_audio_notes(shortlist_candidate_id, approval_status, created_at desc);

create index if not exists recruiter_lab_audio_notes_file_idx
  on recruiter_lab_candidate_audio_notes(source_file_id, compressed_file_id);

create index if not exists recruiter_lab_audio_note_access_logs_note_idx
  on recruiter_lab_candidate_audio_note_access_logs(audio_note_id, created_at desc);

create index if not exists recruiter_lab_audio_note_access_logs_token_idx
  on recruiter_lab_candidate_audio_note_access_logs(access_token_id, created_at desc)
  where access_token_id is not null;
