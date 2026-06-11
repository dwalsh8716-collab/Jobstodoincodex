alter table recruiter_lab_ai_drafts
  add column if not exists draft_relevant_experience jsonb not null default '[]'::jsonb,
  add column if not exists draft_role_fit_notes jsonb not null default '[]'::jsonb,
  add column if not exists draft_client_interview_questions jsonb not null default '[]'::jsonb,
  add column if not exists draft_interview_prep_notes jsonb not null default '[]'::jsonb,
  add column if not exists david_rationale text,
  add column if not exists david_edited_summary text,
  add column if not exists david_edited_strengths jsonb not null default '[]'::jsonb,
  add column if not exists david_edited_watchouts jsonb not null default '[]'::jsonb,
  add column if not exists version_number integer not null default 1,
  add column if not exists previous_version_id uuid references recruiter_lab_ai_drafts(id) on delete set null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'recruiter_lab_ai_drafts_candidate_summary_arrays_check'
  ) then
    alter table recruiter_lab_ai_drafts
      add constraint recruiter_lab_ai_drafts_candidate_summary_arrays_check check (
        draft_type <> 'candidate_summary'
        or (
          jsonb_typeof(draft_strengths) = 'array'
          and jsonb_typeof(draft_watchouts) = 'array'
          and jsonb_typeof(draft_relevant_experience) = 'array'
          and jsonb_typeof(draft_role_fit_notes) = 'array'
          and jsonb_typeof(draft_client_interview_questions) = 'array'
          and jsonb_typeof(draft_interview_prep_notes) = 'array'
          and jsonb_typeof(david_edited_strengths) = 'array'
          and jsonb_typeof(david_edited_watchouts) = 'array'
        )
      );
  end if;
end $$;

create table if not exists recruiter_lab_candidate_profile_versions (
  id uuid primary key default gen_random_uuid(),
  shortlist_candidate_id uuid not null references recruiter_lab_shortlist_candidates(id) on delete cascade,
  ai_draft_id uuid references recruiter_lab_ai_drafts(id) on delete set null,
  version_number integer not null default 1,
  status text not null default 'not_generated',
  summary text,
  strengths jsonb not null default '[]'::jsonb,
  watchouts jsonb not null default '[]'::jsonb,
  relevant_experience jsonb not null default '[]'::jsonb,
  role_fit_notes jsonb not null default '[]'::jsonb,
  client_interview_questions jsonb not null default '[]'::jsonb,
  interview_prep_notes jsonb not null default '[]'::jsonb,
  david_rationale text,
  ai_draft_label text not null default 'AI-assisted draft. David review required.',
  edited_by uuid references admin_users(id) on delete set null,
  edited_at timestamptz,
  approved_by uuid references admin_users(id) on delete set null,
  approved_at timestamptz,
  client_visible_at timestamptz,
  archived_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recruiter_lab_candidate_profile_versions_status_check check (
    status in (
      'not_generated',
      'ai_draft_generated',
      'david_review_required',
      'david_edited',
      'approved_for_client',
      'archived',
      'deleted'
    )
  ),
  constraint recruiter_lab_candidate_profile_versions_arrays_check check (
    jsonb_typeof(strengths) = 'array'
    and jsonb_typeof(watchouts) = 'array'
    and jsonb_typeof(relevant_experience) = 'array'
    and jsonb_typeof(role_fit_notes) = 'array'
    and jsonb_typeof(client_interview_questions) = 'array'
    and jsonb_typeof(interview_prep_notes) = 'array'
  ),
  constraint recruiter_lab_candidate_profile_versions_approval_check check (
    status <> 'approved_for_client'
    or (approved_by is not null and approved_at is not null)
  ),
  constraint recruiter_lab_candidate_profile_versions_visibility_check check (
    client_visible_at is null
    or status = 'approved_for_client'
  )
);

create index if not exists recruiter_lab_candidate_profile_versions_candidate_idx
  on recruiter_lab_candidate_profile_versions(shortlist_candidate_id, version_number desc, created_at desc);

create index if not exists recruiter_lab_candidate_profile_versions_status_idx
  on recruiter_lab_candidate_profile_versions(status, approved_at desc, created_at desc);

create index if not exists recruiter_lab_ai_drafts_candidate_summary_version_idx
  on recruiter_lab_ai_drafts(shortlist_candidate_id, version_number desc, created_at desc)
  where draft_type = 'candidate_summary';
