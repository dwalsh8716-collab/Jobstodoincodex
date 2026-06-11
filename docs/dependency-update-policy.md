# Dependency Update Policy

Audit date: 11 June 2026

## Status

Green for current vulnerabilities.

Amber for ongoing maintenance because updates need a regular process.

## Current Audit Result

Command run:

```bash
npm audit --audit-level=moderate
```

Result:

```txt
found 0 vulnerabilities
```

## Available Updates Seen

`npm outdated --long` reported patch/minor updates for:

- Next.js
- eslint-config-next
- next-sanity
- Sanity packages
- Prettier
- TypeScript types

It also showed major versions available for some tooling:

- ESLint
- TypeScript
- Vitest
- Zod
- Node types

Do not apply major upgrades blindly.

## Dependabot

Added:

- `.github/dependabot.yml`

Dependabot checks:

- npm dependencies weekly
- GitHub Actions weekly

Grouped updates:

- Next/Sanity patch and minor updates
- test/tooling patch and minor updates

## Update Rules

Safe default:

1. Apply patch updates first.
2. Apply minor updates when CI passes.
3. Treat major updates as separate planned work.
4. Never combine major framework updates with content/design changes.
5. Run the full quality gate before merging.

## Commands For David/Codex

Use:

```bash
npm audit --audit-level=moderate
npm outdated --long
npm run verify
```

## What Not To Ignore

- Next.js security advisories.
- Sanity security advisories.
- React/React DOM security advisories.
- Any dependency used in API routes, forms, auth, cookies or HTML rendering.

## Recommendation

Let Dependabot open small PRs.

Ask Codex to review and fix any failed checks.

Do not approve major upgrade PRs without a short compatibility audit.
