# Release Process

## Purpose

David needs to know what changed without reading code.

Every meaningful website change should leave behind a short, plain-English
record:

- what changed
- why it matters
- what David needs to do
- how to roll it back if needed

No faff. No hidden cleverness.

## When To Update The Changelog

Update `CHANGELOG.md` when a change affects any of these:

- public pages, navigation, CTAs or design
- CMS schemas, editor guidance or content workflows
- forms, submissions, email, WhatsApp, booking or data handling
- SEO, GEO, schema, sitemap, robots, RSS or AI index routes
- security, privacy, consent, retention or audit behaviour
- Recruiter Labs, client portals, AI tools or private admin workflows
- Railway deployment, environment variables, database or launch operations
- user-visible documentation or owner checklists

Tiny internal refactors do not need a changelog entry unless they change how
David or a visitor experiences the site.

## Changelog Entry Format

Use this format for each release:

```txt
## YYYY-MM-DD - Short Release Name

### Summary

Plain-English summary.

### Public Website Changes

- ...

### CMS Changes

- ...

### Form Changes

- ...

### SEO Changes

- ...

### Security / Privacy Changes

- ...

### Recruiter Labs Changes

- ...

### Manual Actions For David

- ...

### Rollback Note

- ...
```

If a section has no changes, say so. That makes the absence deliberate.

## Required Checks Before Release

Run the project release gate:

```bash
npm run verify
```

For production-sensitive changes, also run:

```bash
npm audit --audit-level=moderate
npm run sanity -- schema validate
npm run db:status
npm run retention:check
```

If a command fails, do not pretend it passed. Fix it or record the blocker.

## Pull Request Checklist

Every PR should confirm:

- build passes
- lint/typecheck passes
- no PII in Sanity
- no secrets in GitHub
- no public Recruiter Labs exposure
- docs updated where needed
- changelog updated where needed
- Railway env vars documented where needed
- screenshots or browser checks included where UI changed

The PR template lives at:

```txt
.github/pull_request_template.md
```

## Privacy And Data Rules

Before release, check:

- private candidate/client data is not stored in Sanity
- secrets are not committed
- logs do not include email, phone, CV data or private notes
- analytics events do not send PII
- consent-sensitive tracking still respects the consent layer
- Recruiter Labs stays private unless a launch gate explicitly says otherwise

Use these docs:

- `docs/data-boundaries.md`
- `docs/consent-mode-v2-setup.md`
- `docs/security-privacy-audit.md`
- `docs/recruiter-labs-ai-launch-gate.md`

## Screenshots And Browser Checks

If the UI changed, capture or report checks for:

- desktop viewport
- mobile viewport
- no horizontal overflow
- no clipped text
- visible focus states where interaction changed

Use the in-app browser for local preview checks when possible.

## Manual Actions For David

Call out anything David must do outside GitHub, for example:

- add Railway environment variables
- approve legal/privacy wording
- connect Google, Sanity, Railway, Meta or Loxo accounts
- approve a CMP, AI provider, WhatsApp template or tracking tool
- test a form in production
- confirm domain/DNS changes

Do not bury manual actions in code comments.

## Rollback Notes

Every changelog entry needs a rollback note.

Good rollback notes explain:

- whether revert is enough
- whether an environment variable must be changed
- whether a migration is involved
- whether manual account setup is affected
- whether any user data needs review

If rollback is risky, say so clearly.
