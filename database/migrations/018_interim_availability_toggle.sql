create table if not exists interim_candidate_availability (
  candidate_id uuid primary key references candidates(id) on delete cascade,
  availability_status text not null default 'not_confirmed',
  available_from date,
  day_rate text,
  notes text,
  opted_out_at timestamptz,
  last_updated_at timestamptz not null default now(),
  updated_via text not null default 'admin',
  metadata jsonb not null default '{}'::jsonb,
  constraint interim_candidate_availability_status_check check (
    availability_status in (
      'not_confirmed',
      'available_now',
      'available_from',
      'on_assignment',
      'not_looking'
    )
  ),
  constraint interim_candidate_availability_updated_via_check check (
    updated_via in ('admin', 'magic_link', 'email', 'whatsapp')
  )
);

create table if not exists interim_availability_tokens (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  token_hash text not null unique,
  channel text not null default 'email',
  expires_at timestamptz not null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint interim_availability_tokens_channel_check check (
    channel in ('email', 'whatsapp', 'manual')
  )
);

create index if not exists interim_candidate_availability_status_idx
  on interim_candidate_availability(availability_status, last_updated_at desc);

create index if not exists interim_availability_tokens_candidate_idx
  on interim_availability_tokens(candidate_id, expires_at desc)
  where revoked_at is null;
