<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Product Rules

This frontend belongs to the private Interview Coordination Agent. Preserve the
parent product rules in `../AGENTS.md`.

- Do not introduce a Loxo or CRM dependency into the MVP.
- Keep recruiter approval before interview confirmation, rescheduling and
  cancellation.
- Keep mocked email and calendar providers obvious in phase 1.
- Do not expose this app as a public marketing route.
- Keep UK recruiter wording concise, warm and human.
