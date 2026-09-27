# Security Audit

Date: 2026-08-24

## Executive Summary

The current app is acceptable for local MVP testing, but not production-ready as
a private internal system handling candidate/client personal data and external
calendar/email actions.

The most important risks are:

- OAuth callback state is generated but not verified.
- Session token is now set as an HttpOnly cookie, with bearer fallback kept for
  compatibility.
- Basic login brute-force throttling exists.
- No MFA or Google Workspace/Microsoft login.
- Calendar mutation has no outbox/idempotency protection.
- Public availability endpoints have no rate limiting.
- OAuth token encryption uses the session secret path rather than a separately
  managed encryption secret.

## Evidence

| Area | Evidence |
|---|---|
| Local auth | `backend/app/security.py` creates HMAC bearer tokens and validates configured email/password. |
| Token storage | Login now sets an HttpOnly `ica_session` cookie; bearer token fallback remains for compatibility. |
| OAuth start | `backend/app/services/google.py` creates `state`, but stores nothing server-side. |
| OAuth callback | `backend/app/api/integrations.py` exchanges the code without checking state. |
| Public links | `backend/app/api/public_availability.py` accepts token submissions without rate limit or abuse controls. |
| Calendar mutation | `backend/app/services/workflow.py` calls the calendar provider before DB flush/commit of the event row. |
| Secrets | `backend/.env` exists and is ignored by git. Do not print its values. |

## P0 Findings

### P0-SEC-001: Google OAuth state is not verified

Risk: OAuth CSRF or confused callback handling.

Evidence:

- `build_google_auth_url` creates a random state value.
- The callback accepts `code` and `error`, but no `state` parameter is checked.

Fix:

- Persist a hashed OAuth state with short expiry.
- Require callback state.
- Mark state as used.
- Reject missing, expired, reused or unknown state.
- Add tests.

Status after audit fixes: implemented for Google OAuth start/callback with a
hashed one-time state and 10-minute expiry. Add full route-level callback tests
when mocked OAuth exchange coverage is expanded.

### P0-SEC-002: Approval/calendar mutation is not idempotent enough

Risk: Duplicate meetings or contradictory confirmations under double click,
retry or partial failure.

Evidence:

- `approve_slot` checks state, then calls external calendar create, then adds the
  event row.
- There is no idempotency key, provider request ID tied to the interview, outbox
  table, or unique active-event constraint.

Fix:

- Add backend idempotency for approval.
- Record a durable pending calendar operation before external mutation.
- Use deterministic provider request IDs where supported.
- Add duplicate approval and partial failure tests.

Status after upgrades: partially improved. A `workflow_operations` record,
stable approval keys, Google Meet request IDs, reschedule event updates and
cancellation event updates now reduce duplicate side effects. Full
transactional outbox/reconciliation is still required before production.

## P1 Findings

### P1-SEC-001: Browser localStorage session token

Risk: If any XSS appears, the bearer token can be stolen.

Fix:

- Move session to secure, HttpOnly, SameSite cookie.
- Add CSRF protection for cookie-authenticated mutating requests.

Status after upgrades: mostly implemented with HttpOnly cookie sessions and
credentialed frontend requests. Full CSRF hardening should be added before a
public internet deployment.

### P1-SEC-002: No login rate limiting or account lockout

Risk: Password brute force.

Fix:

- Rate-limit login by IP/user-agent hash and email.
- Audit failed attempts.
- Add temporary lockout or slow-down.

Status after upgrades: basic in-memory login rate limiting exists. Add edge
rate limiting and durable failed-login audit logs before internet deployment.

### P1-SEC-003: No production MFA/RBAC

Risk: One compromised password has owner-level access.

Fix:

- Prefer Google Workspace OAuth or Microsoft OAuth.
- Add MFA if email/password remains.
- Add role checks before approval, integration and export actions.

### P1-SEC-004: Public availability token endpoint has no rate limit

Risk: Token probing, spam submissions, or operational noise.

Fix:

- Rate-limit invalid token attempts.
- Rate-limit submissions per token/IP hash.
- Log suspicious activity without storing raw IP.

### P1-SEC-005: OAuth token encryption should use a dedicated secret

Risk: Session-secret rotation and token encryption are coupled.

Fix:

- Require `ENCRYPTION_KEY` for production.
- Keep `SESSION_SECRET` only for sessions.
- Document rotation.

## Dependency Scan

- Frontend `npm audit --omit=dev --json`: 0 known vulnerabilities.
- Python packages were listed, but no vulnerability scanner was installed.

Required before production:

- Add `pip-audit` or equivalent to CI.
- Pin dependencies and review transitive packages.

## Verdict

Safe for local testing with mock/controlled Google test accounts. Not safe for
production use until OAuth state verification, approval idempotency, stronger
auth/session handling and public endpoint rate limiting are complete.
