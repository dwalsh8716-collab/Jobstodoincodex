# Architecture Decision Records

These records capture the decisions future Codex sessions and engineers should
not casually unwind.

Use them when a task touches framework choice, CMS boundaries, CRM/ATS data,
private workflow storage, Recruiter Labs, hosting, AI or WhatsApp operations.

## Current Decisions

- [0001 - Use Next.js App Router for the public frontend](./0001-use-nextjs-app-router-for-public-frontend.md)
- [0002 - Use Sanity for public CMS only](./0002-use-sanity-for-public-cms-only.md)
- [0003 - Use Loxo as the primary CRM/ATS](./0003-use-loxo-as-primary-crm-ats.md)
- [0004 - Use Postgres only for private website workflows](./0004-use-postgres-only-for-private-website-workflows.md)
- [0005 - Keep Recruiter Labs private, feature-flagged and noindexed](./0005-keep-recruiter-labs-private-feature-flagged-and-noindexed.md)
- [0006 - Use Railway for hosting](./0006-use-railway-for-hosting.md)
- [0007 - AI assists operations, not candidate evaluation](./0007-ai-assists-operations-not-candidate-evaluation.md)
- [0008 - WhatsApp is used for logistics, not negative news](./0008-whatsapp-used-for-logistics-not-negative-news.md)

## How To Add A New ADR

1. Use the next number.
2. Keep the title plain.
3. Include status, context, decision, consequences and what not to do.
4. Link supporting docs.
5. Do not use ADRs to hide uncertainty. If a decision needs David's approval,
   say so.
