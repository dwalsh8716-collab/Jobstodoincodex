# Dependency Update Policy

Audit date: 11 June 2026

## Status

Green for current vulnerabilities.

Green for a controlled update process.

Amber only for manual account-side setup: David still needs GitHub dependency
graph, Dependabot alerts and security updates enabled in the repository
settings.

## Current Package Setup

- package manager: npm
- manifest: `package.json`
- lockfile: `package-lock.json`
- lockfile version: 3
- Docker: no Dockerfile found, so no Docker Dependabot ecosystem is configured
- GitHub Actions workflow: `.github/workflows/quality.yml`

## Current Audit Result

Command run:

```bash
npm audit --audit-level=moderate
npm outdated --long
```

Result:

```txt
found 0 vulnerabilities
```

`npm outdated --long` is advisory. It may return a non-zero exit code when
updates are available. That is not a failure by itself.

Latest local check found routine wanted updates for:

- Next.js
- `eslint-config-next`
- `next-sanity`
- Sanity packages
- Prettier
- Node types

It also showed major-version candidates for:

- ESLint
- TypeScript
- Vitest
- Zod

Those major-version candidates should remain planned upgrade work, not casual
Dependabot merges.

## Dependabot

Configured:

- `.github/dependabot.yml`

Dependabot version updates:

- npm production dependencies monthly
- npm development dependencies monthly
- GitHub Actions monthly
- patch and minor updates only

Dependabot security updates:

- grouped separately from version updates
- production dependencies grouped separately from development dependencies
- GitHub Actions security updates grouped separately

Major version updates:

- ignored by routine Dependabot version updates
- handled as planned work only
- require a short compatibility audit before merge

This follows GitHub's Dependabot model: version updates and security updates are
separate streams, and group rules must say whether they apply to version updates
or security updates.

## Update Rules

Safe default:

1. Apply patch updates first.
2. Apply minor updates when CI passes.
3. Treat major updates as separate planned work.
4. Never combine major framework updates with content/design changes.
5. Run the full quality gate before merging.
6. Do not auto-merge dependency PRs.
7. Do not mix dependency upgrades with feature, copy or design work.
8. Do not remove security-related overrides unless the audit proves they are no
   longer needed.

## Commands For David/Codex

Use:

```bash
npm audit --audit-level=moderate
npm outdated --long
npm run verify
```

If a Dependabot PR fails, ask:

```txt
Codex, review this Dependabot PR, explain what changed, fix any failing checks,
and tell me whether it is safe to merge.
```

## Human Review Required

David or Codex must review:

- any major version upgrade
- Next.js upgrades
- React or React DOM upgrades
- Sanity or `next-sanity` upgrades
- Zod upgrades
- packages used by forms, cookies, auth, analytics, API routes or HTML rendering
- any PR that changes `package-lock.json` heavily
- any PR where `npm audit` fails
- any PR where `npm run verify` fails

## Rollback

If a dependency update breaks production:

1. Revert the merge commit in GitHub, or ask Codex to revert that specific
   dependency PR.
2. Redeploy the previous working commit.
3. Reopen the dependency PR or create a follow-up issue with the failure
   details.
4. Do not run `npm audit fix --force` in production unless the breaking change
   has been reviewed.

## Post-Update Test List

Run:

```bash
npm ci
npm audit --audit-level=moderate
npm run verify
npm run sanity -- schema validate
npm run db:status
npm run retention:check
```

Then spot-check:

- homepage
- contact form
- `/sitemap.xml`
- `/robots.txt`
- `/studio`
- `/admin`

## What Not To Ignore

- Next.js security advisories.
- Sanity security advisories.
- React/React DOM security advisories.
- Any dependency used in API routes, forms, auth, cookies or HTML rendering.
- GitHub Actions updates, because CI is the gate that protects releases.

## Recommendation

Let Dependabot open small grouped PRs.

Ask Codex to review and fix any failed checks.

Do not approve major upgrade PRs without a short compatibility audit.

No secrets are stored in package scripts, Dependabot config or the lockfile.
