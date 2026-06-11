# CI Quality Gates

Audit date: 11 June 2026

## Issue #115 Audit Result

Green.

Issue #119 had already added the first GitHub Actions quality gate, Dependabot
setup, route safety tests and this document.

This #115 pass found one practical gap: dependency audit was documented but not
run inside the GitHub workflow. That is now fixed.

No duplicate CI system was added.

## Workflow

File:

- `.github/workflows/quality.yml`

It runs on:

- pull requests
- pushes to `main`

## Checks

The workflow runs:

- checkout
- Node.js 22 setup
- `npm ci`
- `npm audit --audit-level=moderate`
- Playwright Chromium install
- `npm run verify`
- `npm run sanity -- schema validate`
- `npm run db:status`
- `npm run retention:check`

`npm run verify` includes:

- lint
- production build
- clean Next generated route reference
- TypeScript
- unit tests
- performance budget
- Playwright smoke tests

The Playwright smoke tests check:

- homepage
- mobile navigation
- contact form validation and safe success state
- key public pages
- `sitemap.xml`
- `robots.txt`
- private admin, Labs and client shortlist paths staying out of sitemap output
- 404 page

## Why This Matters

This stops future changes breaking:

- public pages
- contact form basics
- sitemap/private route safety
- type safety
- lint rules
- production build
- route smoke tests
- dependency safety at a moderate-or-higher vulnerability level

## What A Failure Means

- Lint failure: code style or unsafe pattern needs fixing.
- Typecheck failure: TypeScript contract is broken.
- Build failure: production app cannot deploy.
- Unit test failure: a known rule or behavior changed.
- Playwright failure: public route or core user journey may be broken.
- Dependency audit failure: a package has a vulnerability that needs review.
- Sanity schema failure: CMS model may not be valid.
- Performance failure: public JavaScript budget may be too high.

## Local Commands

Run:

```bash
npm run verify
npm audit --audit-level=moderate
npm run sanity -- schema validate
npm run db:status
npm run retention:check
```

For the minimum local gate:

```bash
npm run typecheck
npm run lint
npm run build
```

## How David Can Ask Codex To Fix A Red Check

Use plain English:

```text
Codex, the GitHub quality gate failed. Please inspect the failed check, explain
what broke in plain English, fix it, run the local checks and push the repair.
```

Paste the failing GitHub check name or screenshot if you have it.

## What Not To Ignore

Do not ignore:

- a red build check
- a failed dependency audit
- a failed sitemap/private-route check
- a failed contact form check
- a failed Sanity schema check

If a check is red, treat the site as not launch-ready until the cause is known.

## Remaining Manual Setup

GitHub branch protection is not configured in code.

David or a GitHub admin should decide whether to require this workflow before merging to `main`.

## Recommendation

Use this workflow as the default safety net.

Do not ignore red checks. Fix them before launch or deployment.
