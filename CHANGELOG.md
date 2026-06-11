# Changelog

Human-readable release notes for Essential Resourcing.

Use this file to explain what changed without making David read code, commits
or GitHub issue threads.

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
