# CI Quality Gates

Audit date: 11 June 2026

## Status

Amber to Green.

CI was missing. This audit added a lightweight GitHub Actions quality gate.

## Added

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

## Why This Matters

This stops future changes breaking:

- public pages
- contact form basics
- sitemap/private route safety
- type safety
- lint rules
- production build
- route smoke tests

## What A Failure Means

- Lint failure: code style or unsafe pattern needs fixing.
- Typecheck failure: TypeScript contract is broken.
- Build failure: production app cannot deploy.
- Unit test failure: a known rule or behavior changed.
- Playwright failure: public route or core user journey may be broken.
- Sanity schema failure: CMS model may not be valid.
- Performance failure: public JavaScript budget may be too high.

## Local Commands

Run:

```bash
npm run verify
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

## Remaining Manual Setup

GitHub branch protection is not configured in code.

David or a GitHub admin should decide whether to require this workflow before merging to `main`.

## Recommendation

Use this workflow as the default safety net.

Do not ignore red checks. Fix them before launch or deployment.
