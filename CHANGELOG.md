# Changelog

Human-readable release notes for Essential Resourcing.

Use this file to explain what changed without making David read code, commits
or GitHub issue threads.

## 2026-06-11 - CV Anonymization Drafts Staged

### Summary

Staged a private, disabled-by-default CV anonymization draft layer for future
Recruiter Labs use. It does not enable public CV upload, live AI processing or
client-facing CV presentation.

### Public Website Changes

- No public page or navigation change.
- No public CV upload was enabled.

### CMS Changes

- No Sanity schema change.
- CVs and private candidate data remain blocked from Sanity.

### Form Changes

- No form behaviour changed.
- Candidate CV upload remains disabled until private storage and approval gates
  are ready.

### SEO Changes

- No sitemap, metadata, schema or indexation change.
- Recruiter Labs remains private and noindexed by policy.

### Security / Privacy Changes

- Added a server-only CV anonymization helper for obvious identifier redaction.
- Added a private Postgres staging table for draft anonymized text.
- Added audit action support for CV anonymization draft creation.
- Added documentation that real CV use remains blocked until storage, consent,
  retention, audit and legal/privacy checks are approved.

### Recruiter Labs Changes

- Added `FEATURE_CV_ANONYMIZATION=false`.
- Added `docs/cv-anonymization.md`.
- Added tests proving the feature is private, disabled by default and not a
  candidate ranking or decision tool.

### Manual Actions For David

- Keep `FEATURE_CV_ANONYMIZATION=false` until private CV storage, consent
  wording, review UI and legal/privacy checks are approved.
- Do not use this on real CVs yet.

### Rollback Note

- Revert the CV anonymization staging commit and keep
  `FEATURE_CV_ANONYMIZATION=false`. No public runtime behaviour depends on it.

## 2026-06-11 - Release Notes Process Added

### Summary

Added the changelog, release-process guide and PR checklist so future website
changes are easier to review, approve and roll back.

### Public Website Changes

- No public page design or conversion route changed in this release.
- This is a process/documentation release.

### CMS Changes

- No Sanity schema change in this release.
- Future CMS changes should be called out here in plain English.

### Form Changes

- No form behaviour changed in this release.
- Future changes to contact, candidate, DSAR, salary guide or application forms
  must be described here.

### SEO Changes

- No sitemap, metadata, schema or indexation behaviour changed in this release.
- Future SEO/GEO changes should explain the route, schema or crawl impact.

### Security / Privacy Changes

- Added a release checklist that explicitly checks for secrets, PII, Sanity data
  boundaries and public Recruiter Labs exposure.

### Recruiter Labs Changes

- No Recruiter Labs feature changed in this release.
- Future Labs changes must state whether the feature remains private,
  feature-flagged, noindexed and excluded from public bundles.

### Manual Actions For David

- Use `docs/release-process.md` when reviewing future website changes.
- For future pull requests, check the David-readable release note before
  approving.

### Rollback Note

- This release can be rolled back by reverting the process/docs commit. It does
  not affect runtime website behaviour.
