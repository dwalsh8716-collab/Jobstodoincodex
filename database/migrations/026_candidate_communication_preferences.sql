alter table enquiries
  add column if not exists whatsapp_contact_consent boolean not null default false,
  add column if not exists phone_contact_consent boolean not null default false,
  add column if not exists email_contact_consent boolean not null default false,
  add column if not exists communication_notes text;

alter table applications
  add column if not exists preferred_contact_method text,
  add column if not exists whatsapp_contact_consent boolean not null default false,
  add column if not exists phone_contact_consent boolean not null default false,
  add column if not exists email_contact_consent boolean not null default false,
  add column if not exists communication_notes text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'applications_preferred_contact_method_check'
  ) then
    alter table applications
      add constraint applications_preferred_contact_method_check check (
        preferred_contact_method is null or preferred_contact_method in ('email', 'phone', 'whatsapp', 'no_preference')
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'enquiries_preferred_contact_method_check'
  ) then
    alter table enquiries
      add constraint enquiries_preferred_contact_method_check check (
        preferred_contact_method is null or preferred_contact_method in ('email', 'phone', 'whatsapp', 'no_preference')
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'enquiries_whatsapp_consent_requires_preference_check'
  ) then
    alter table enquiries
      add constraint enquiries_whatsapp_consent_requires_preference_check check (
        whatsapp_contact_consent = false or preferred_contact_method = 'whatsapp'
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'applications_whatsapp_consent_requires_preference_check'
  ) then
    alter table applications
      add constraint applications_whatsapp_consent_requires_preference_check check (
        whatsapp_contact_consent = false or preferred_contact_method = 'whatsapp'
      );
  end if;
end $$;

create index if not exists enquiries_contact_preferences_idx
  on enquiries(preferred_contact_method, whatsapp_contact_consent, created_at desc);

create index if not exists applications_contact_preferences_idx
  on applications(preferred_contact_method, whatsapp_contact_consent, created_at desc);
