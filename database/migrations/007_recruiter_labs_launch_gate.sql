alter table recruiter_lab_shortlists
  add column if not exists launch_gate_status text not null default 'blocked',
  add column if not exists launch_gate_reviewed_by uuid references admin_users(id) on delete set null,
  add column if not exists launch_gate_reviewed_at timestamptz,
  add column if not exists client_visible_at timestamptz,
  add column if not exists rollback_at timestamptz,
  add column if not exists rollback_reason text;

alter table recruiter_lab_shortlist_candidates
  add column if not exists sharing_mode text not null default 'named',
  add column if not exists candidate_sharing_consent_at timestamptz,
  add column if not exists cv_access_required boolean not null default false,
  add column if not exists cv_access_approved boolean not null default false,
  add column if not exists cv_access_revoked_at timestamptz,
  add column if not exists retention_status text not null default 'pending_review',
  add column if not exists client_visible_at timestamptz,
  add column if not exists withholding_reason text;

do $$
begin
  alter table recruiter_lab_shortlists add constraint recruiter_lab_shortlists_launch_gate_status_check check (
    launch_gate_status in ('blocked', 'private_beta', 'approved', 'rolled_back')
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table recruiter_lab_shortlist_candidates add constraint recruiter_lab_shortlist_candidates_sharing_mode_check check (
    sharing_mode in ('named', 'anonymised')
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table recruiter_lab_shortlist_candidates add constraint recruiter_lab_shortlist_candidates_retention_status_check check (
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

create index if not exists recruiter_lab_shortlists_launch_gate_idx
  on recruiter_lab_shortlists(launch_gate_status, expires_at, revoked_at);

create index if not exists recruiter_lab_shortlist_candidates_launch_gate_idx
  on recruiter_lab_shortlist_candidates(
    profile_status,
    consent_confirmed,
    cv_access_required,
    cv_access_approved,
    retention_status
  );
