alter table salary_guide_leads
  add column if not exists guide_id text,
  add column if not exists source_page text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists status text not null default 'new';

do $$
begin
  alter table salary_guide_leads
    add constraint salary_guide_leads_status_check
    check (
      status in (
        'new',
        'reviewed',
        'contacted',
        'qualified',
        'converted',
        'closed'
      )
    );
exception
  when duplicate_object then null;
end $$;

create index if not exists salary_guide_leads_status_created_at_idx
  on salary_guide_leads(status, created_at desc);

create index if not exists salary_guide_leads_utm_campaign_idx
  on salary_guide_leads(utm_campaign)
  where utm_campaign is not null;

comment on column salary_guide_leads.status is
  'Human follow-up status for a gated salary guide lead.';

comment on column salary_guide_leads.source_page is
  'Public route that submitted the request. Do not store private notes here.';

comment on column salary_guide_leads.utm_source is
  'Non-PII campaign attribution from the source page URL.';

comment on column salary_guide_leads.utm_medium is
  'Non-PII campaign attribution from the source page URL.';

comment on column salary_guide_leads.utm_campaign is
  'Non-PII campaign attribution from the source page URL.';
