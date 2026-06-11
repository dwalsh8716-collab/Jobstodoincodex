alter table recruiter_lab_ai_drafts
  add column if not exists shortlist_candidate_id uuid references recruiter_lab_shortlist_candidates(id) on delete cascade,
  add column if not exists draft_summary text,
  add column if not exists draft_strengths jsonb not null default '[]'::jsonb,
  add column if not exists draft_watchouts jsonb not null default '[]'::jsonb,
  add column if not exists human_approved boolean not null default false,
  add column if not exists approved_by uuid references admin_users(id) on delete set null,
  add column if not exists approved_at timestamptz,
  add column if not exists ai_generation_event_id uuid references audit_logs(id) on delete set null,
  add column if not exists uncertainty_notes jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'recruiter_lab_ai_drafts_candidate_summary_review_check'
  ) then
    alter table recruiter_lab_ai_drafts
      add constraint recruiter_lab_ai_drafts_candidate_summary_review_check check (
        draft_type <> 'candidate_summary'
        or (
          human_approved = false
          or (approved_by is not null and approved_at is not null and status = 'approved')
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'recruiter_lab_ai_drafts_no_summary_score_check'
  ) then
    alter table recruiter_lab_ai_drafts
      add constraint recruiter_lab_ai_drafts_no_summary_score_check check (
        draft_type <> 'candidate_summary'
        or metadata->>'suitabilityScore' is null
      );
  end if;
end $$;

create index if not exists recruiter_lab_ai_drafts_shortlist_candidate_idx
  on recruiter_lab_ai_drafts(shortlist_candidate_id, status, created_at desc)
  where shortlist_candidate_id is not null;

create index if not exists recruiter_lab_ai_drafts_human_approval_idx
  on recruiter_lab_ai_drafts(human_approved, approved_at desc)
  where draft_type = 'candidate_summary';
