alter table recruiter_lab_ai_drafts
  add column if not exists source_data_summary text,
  add column if not exists prompt_version text not null default 'v0-governance-only',
  add column if not exists david_deleted_at timestamptz,
  add column if not exists david_delete_reason text,
  add column if not exists client_visibility_blocked_at timestamptz,
  add column if not exists client_visibility_blocked_reason text;

create index if not exists recruiter_lab_ai_drafts_prompt_version_idx
  on recruiter_lab_ai_drafts(prompt_version, created_at desc);
