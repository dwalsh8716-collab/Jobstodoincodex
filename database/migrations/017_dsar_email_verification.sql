alter table data_subject_requests
  add column if not exists email_verification_token_hash text,
  add column if not exists email_verification_requested_at timestamptz,
  add column if not exists email_verification_expires_at timestamptz,
  add column if not exists email_verification_confirmed_at timestamptz;

create unique index if not exists data_subject_requests_email_verification_token_idx
  on data_subject_requests(email_verification_token_hash)
  where email_verification_token_hash is not null;

create index if not exists data_subject_requests_email_verification_pending_idx
  on data_subject_requests(verification_status, email_verification_expires_at)
  where email_verification_token_hash is not null;
