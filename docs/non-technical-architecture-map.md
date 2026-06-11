# Non-Technical Architecture Map

Audit date: 11 June 2026

## The Short Version

The website should stay simple:

- Sanity holds public website content.
- Loxo holds recruitment CRM/ATS records.
- Railway runs the website and can hold private website workflow data.
- Next.js is the website.
- GitHub is the code and issue record.

Do not turn the website database into a full recruitment CRM unless David explicitly decides to replace or duplicate Loxo. That is not recommended.

## What Each System Does

## Next.js

Next.js is the website engine.

It renders public pages, handles server routes, runs form handlers, serves SEO files and protects admin routes.

Code locations:

- `app/`
- `src/components/`
- `src/lib/`
- `src/actions/`

## Sanity

Sanity is the public CMS.

Use it for:

- homepage content
- services
- insights/articles
- public jobs
- public case studies
- salary snapshots and salary guide landing content
- images and video metadata
- navigation
- footer/site settings
- SEO fields

Do not use Sanity for:

- candidate applications
- candidate names submitted through forms
- private client contacts
- CVs
- WhatsApp messages
- audit logs
- DSAR requests
- shortlists
- private AI drafts

## Loxo

Loxo should remain the recruitment CRM/ATS.

Use Loxo for:

- candidate records
- client recruitment records
- pipeline history
- placement/search records
- recruiter notes
- live recruitment CRM work

The website should not quietly become a second CRM.

## Railway

Railway is the likely website host.

It can run:

- the Next.js app
- production environment variables
- deployment logs
- service healthchecks
- Postgres, if David enables the private operations database

Railway Postgres is for website-specific private workflows only.

## Railway Postgres

Use Postgres for:

- web enquiries
- form handoff records
- consent logs
- audit logs
- DSAR records
- retention review queues
- magic-link staging
- shortlist feedback staging
- Recruiter Labs prototypes
- integration sync staging
- optional Loxo reference IDs so website workflow records can be matched back to Loxo

Do not use Postgres to replace Loxo without a separate business decision.

Do not store Loxo API keys, access tokens or full raw Loxo payload dumps in Postgres.

## GitHub

GitHub is where code, issues and changes live.

Use GitHub for:

- build tasks
- issue tracking
- pull requests if used later
- code history
- Dependabot alerts
- automated quality checks

## Codex

Codex can inspect, edit, test and document the build.

Codex should not be given passwords, one-time codes, private candidate data or account secrets in chat.

## Safe Data Flow

Public content:

```txt
Sanity -> Next.js public pages -> search engines and visitors
```

Private enquiry:

```txt
Website form -> server validation -> email and/or Railway Postgres -> David/Loxo follow-up
```

Recruitment record:

```txt
Website enquiry or application -> David review -> Loxo as source of truth
```

Recruiter Labs:

```txt
Private admin idea -> feature flag -> test data only -> manual launch gate before real use
```

## Launch Boundary

Public site launch can happen when:

- public routes build and render
- Sanity is configured
- contact routes work
- privacy/cookie pages have legal review
- analytics respects consent
- Railway and domain are live

Recruiter Labs launch is separate.

Recruiter Labs must remain private until real client/candidate data handling, consent, audit, retention and legal checks pass.
