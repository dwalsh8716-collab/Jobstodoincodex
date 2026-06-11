import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import sitemap from "../../../app/sitemap";
import {
  createRecruiterLabsClientToken,
  getRecruiterLabsCandidateShareDecision,
  getRecruiterLabsClientAccessDecision,
  getRecruiterLabsClientPortalExpiryDays,
  getRecruiterLabsClientPortalRateLimitDecision,
  getRecruiterLabsClientPortalStatus,
  getRecruiterLabsFeatureFlags,
  getRecruiterLabsLaunchGate,
  getRecruiterLabsOverview,
  hashRecruiterLabsClientToken,
  isRecruiterLabsFeatureEnabled,
  recruiterLabsClientPresentationPortalAdminWorkflow,
  recruiterLabsClientPortalDefaultExpiryDays,
  recruiterLabsClientPortalRoute,
  recruiterLabsFlagDefinitions,
} from "@/lib/recruiter-labs";
import { siteConfig } from "@/lib/site";

vi.mock("server-only", () => ({}));

describe("Recruiter Labs foundation", () => {
  it("keeps Recruiter Labs flags server-side and off by default", () => {
    const flags = getRecruiterLabsFeatureFlags({});

    expect(flags).toHaveLength(recruiterLabsFlagDefinitions.length);
    expect(flags.every((flag) => flag.scope === "server-only")).toBe(true);
    expect(flags.every((flag) => flag.enabled === false)).toBe(true);
  });

  it("requires explicit true to enable a Recruiter Labs feature flag", () => {
    expect(
      isRecruiterLabsFeatureEnabled("FEATURE_CLIENT_PRESENTATION_PORTAL", {
        FEATURE_CLIENT_PRESENTATION_PORTAL: "true",
      }),
    ).toBe(true);
    expect(
      isRecruiterLabsFeatureEnabled("FEATURE_CLIENT_PRESENTATION_PORTAL", {
        FEATURE_CLIENT_PRESENTATION_PORTAL: "false",
      }),
    ).toBe(false);
  });

  it("keeps private Recruiter Labs and client routes out of the sitemap", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).not.toContain(`${siteConfig.url}/admin/recruiter-labs`);
    expect(urls.some((url) => url.includes("/client/shortlist"))).toBe(false);
  });

  it("stages the client shortlist route without making it public", () => {
    const overview = getRecruiterLabsOverview({});
    const route = readFileSync("app/client/shortlist/[token]/page.tsx", "utf8");

    expect(overview.stats.publicRoutes).toBe(0);
    expect(overview.stats.blockedDependencies).toBeGreaterThan(0);
    expect(overview.launchGate.safeForPrivateAdminTesting).toBe(true);
    expect(overview.launchGate.safeForRealClients).toBe(false);
    expect(route).toContain('dynamic = "force-dynamic"');
    expect(route).toContain("noIndex: true");
    expect(route).toContain("getRecruiterLabsClientPortalView");
    expect(route).not.toContain("analyticsAttributes");
    expect(route).toContain("MessageDavidOption");
    expect(route).toContain("View profile");
    expect(route).toContain("Top strengths");
    expect(route).toContain("Watch-outs");
    expect(route).toContain("candidate_profile_expanded");
  });

  it("stages hashed magic-link storage instead of raw token storage", () => {
    const migration = readFileSync(
      "database/migrations/006_recruiter_labs_foundation.sql",
      "utf8",
    );

    expect(migration).toContain("token_hash text not null unique");
    expect(migration).not.toMatch(/\btoken\s+text\b/);
  });

  it("creates high-entropy client portal tokens and stores only the hash", () => {
    const issued = createRecruiterLabsClientToken({
      now: new Date("2026-06-10T12:00:00.000Z"),
      expiryDays: recruiterLabsClientPortalDefaultExpiryDays,
    });

    expect(issued.rawToken).toMatch(/^[A-Za-z0-9_-]{32,}$/);
    expect(issued.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(issued.tokenHash).toBe(
      hashRecruiterLabsClientToken(issued.rawToken),
    );
    expect(issued.tokenHash).not.toContain(issued.rawToken);
    expect(issued.expiresAt.toISOString()).toBe("2026-07-10T12:00:00.000Z");
    expect(hashRecruiterLabsClientToken("not a valid token")).toBeUndefined();
  });

  it("keeps the client portal flag off, expiry configurable and private DB gated", () => {
    expect(getRecruiterLabsClientPortalExpiryDays({})).toBe(30);
    expect(
      getRecruiterLabsClientPortalExpiryDays({
        RECRUITER_LABS_CLIENT_TOKEN_EXPIRY_DAYS: "120",
      }),
    ).toBe(90);
    expect(getRecruiterLabsClientPortalStatus({})).toMatchObject({
      route: recruiterLabsClientPortalRoute,
      featureEnabled: false,
      expiryDays: 30,
      canReadPrivateData: false,
      databaseStatus: { state: "disabled" },
    });
    expect(
      getRecruiterLabsClientPortalStatus({
        FEATURE_CLIENT_PRESENTATION_PORTAL: "true",
        OPERATIONS_DB_ENABLED: "true",
        DATABASE_URL: "postgres://example",
      }),
    ).toMatchObject({
      featureEnabled: true,
      canReadPrivateData: true,
      databaseStatus: { state: "ready" },
    });
  });

  it("rate limits client portal access attempts without storing the raw token", () => {
    const token = createRecruiterLabsClientToken().rawToken;
    const now = new Date("2026-06-10T12:00:00.000Z");

    expect(
      getRecruiterLabsClientPortalRateLimitDecision(token, now, {
        limit: 2,
        windowMs: 1_000,
      }),
    ).toMatchObject({ allowed: true, remaining: 1 });
    expect(
      getRecruiterLabsClientPortalRateLimitDecision(token, now, {
        limit: 2,
        windowMs: 1_000,
      }),
    ).toMatchObject({ allowed: true, remaining: 0 });
    expect(
      getRecruiterLabsClientPortalRateLimitDecision(token, now, {
        limit: 2,
        windowMs: 1_000,
      }),
    ).toMatchObject({ allowed: false, remaining: 0 });
    expect(
      getRecruiterLabsClientPortalRateLimitDecision(
        token,
        new Date("2026-06-10T12:00:01.001Z"),
        {
          limit: 2,
          windowMs: 1_000,
        },
      ),
    ).toMatchObject({ allowed: true, remaining: 1 });
  });

  it("keeps the launch gate explicit about blockers and manual review", () => {
    const launchGate = getRecruiterLabsLaunchGate();

    expect(launchGate.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "client-token-route-staged",
          status: "passed",
        }),
        expect.objectContaining({
          id: "magic-link-validation",
          status: "blocked",
        }),
        expect.objectContaining({
          id: "analytics-pii-boundary",
          status: "passed",
        }),
        expect.objectContaining({
          id: "audit-logging-live",
          status: "manual_review",
        }),
      ]),
    );
    expect(launchGate.blockedChecks.length).toBeGreaterThan(0);
    expect(launchGate.safeForPrivateAdminTesting).toBe(true);
    expect(launchGate.safeForRealClients).toBe(false);
  });

  it("documents the Recruiter Labs client pipeline roadmap without approving launch", () => {
    const roadmap = readFileSync(
      "docs/recruiter-labs-client-pipeline-roadmap.md",
      "utf8",
    );
    const pipelineDoc = readFileSync(
      "docs/recruiter-labs-client-pipeline.md",
      "utf8",
    );
    const readme = readFileSync("README.md", "utf8");

    for (const heading of [
      "## Build Order",
      "## Dependencies",
      "## Safe To Build Now",
      "## Blocked Items",
      "## Private Beta Checklist",
      "## Real-Client Launch Checklist",
      "## Suggested GitHub Issue Order",
      "## Suggested Codex Reasoning Level",
      "## Risk Register",
    ]) {
      expect(roadmap).toContain(heading);
    }

    expect(roadmap).toContain("Build it like a product");
    expect(roadmap).toContain("Hide it like a secret");
    expect(roadmap).toContain("Launch only when safe");
    expect(roadmap).toContain("real CV access");
    expect(roadmap).toContain("real WhatsApp sends");
    expect(roadmap).toContain("Google Calendar and Meet");
    expect(roadmap).toContain("AI-assisted, David-verified summaries");
    expect(roadmap).toContain("not legal advice");
    expect(roadmap).toContain("#69");
    expect(roadmap).toContain("#70");
    expect(roadmap).toContain("#71");
    expect(roadmap).toContain("#72");
    expect(roadmap).toContain("#73");
    expect(roadmap).not.toMatch(/safe to show real clients today:\s+yes/i);
    expect(roadmap).not.toMatch(/automatic candidate ranking is approved/i);
    expect(roadmap).toContain(
      "automatic candidate ranking, scoring, rejection or recommendation",
    );
    expect(pipelineDoc).toContain(
      "docs/recruiter-labs-client-pipeline-roadmap.md",
    );
    expect(readme).toContain(
      "docs/recruiter-labs-client-pipeline-roadmap.md",
    );
  });

  it("blocks invalid, expired and revoked future client tokens", () => {
    const now = new Date("2026-06-10T12:00:00.000Z");

    expect(getRecruiterLabsClientAccessDecision(null, now)).toMatchObject({
      allowed: false,
      state: "invalid",
    });
    expect(
      getRecruiterLabsClientAccessDecision(
        {
          tokenHash: "hash",
          expiresAt: "2026-06-10T11:59:59.000Z",
        },
        now,
      ),
    ).toMatchObject({
      allowed: false,
      state: "expired",
    });
    expect(
      getRecruiterLabsClientAccessDecision(
        {
          tokenHash: "hash",
          expiresAt: "2026-06-11T12:00:00.000Z",
          revokedAt: "2026-06-10T10:00:00.000Z",
        },
        now,
      ),
    ).toMatchObject({
      allowed: false,
      state: "revoked",
    });
    expect(
      getRecruiterLabsClientAccessDecision(
        {
          tokenHash: "hash",
          expiresAt: "2026-06-11T12:00:00.000Z",
        },
        now,
      ),
    ).toMatchObject({
      allowed: true,
      state: "active",
    });
  });

  it("requires consent, retention clearance, CV permission and David approval before sharing", () => {
    expect(
      getRecruiterLabsCandidateShareDecision({
        profileStatus: "david_review",
        consentConfirmed: false,
        cvAccessRequired: true,
        cvAccessApproved: false,
        retentionStatus: "pending_review",
      }),
    ).toMatchObject({
      canShare: false,
      reasons: expect.arrayContaining([
        "david_approval_required",
        "candidate_consent_required",
        "candidate_sharing_consent_timestamp_required",
        "cv_access_permission_required",
        "retention_review_required",
      ]),
    });

    expect(
      getRecruiterLabsCandidateShareDecision({
        profileStatus: "approved",
        approvedAt: "2026-06-10T09:00:00.000Z",
        consentConfirmed: true,
        candidateSharingConsentAt: "2026-06-09T09:00:00.000Z",
        cvAccessRequired: true,
        cvAccessApproved: true,
        retentionStatus: "active",
      }),
    ).toMatchObject({
      canShare: true,
      reasons: [],
    });
  });

  it("stages launch-gate database fields without exposing raw tokens or public CV URLs", () => {
    const migration = readFileSync(
      "database/migrations/007_recruiter_labs_launch_gate.sql",
      "utf8",
    );

    expect(migration).toContain(
      "launch_gate_status text not null default 'blocked'",
    );
    expect(migration).toContain("candidate_sharing_consent_at timestamptz");
    expect(migration).toContain(
      "cv_access_approved boolean not null default false",
    );
    expect(migration).toContain("cv_access_revoked_at timestamptz");
    expect(migration).toContain("sharing_mode in ('named', 'anonymised')");
    expect(migration).not.toMatch(/public_url|raw_token|token text/i);
  });

  it("aligns the magic-link presentation portal model without duplicating raw token storage", () => {
    const migration = readFileSync(
      "database/migrations/032_recruiter_labs_client_presentation_portal_alignment.sql",
      "utf8",
    );
    const portalDoc = readFileSync(
      "docs/recruiter-labs-client-presentation-portal.md",
      "utf8",
    );
    const pipelineDoc = readFileSync(
      "docs/recruiter-labs-client-pipeline.md",
      "utf8",
    );
    const featureFlagsDoc = readFileSync("docs/feature-flags.md", "utf8");

    for (const field of [
      "client_contact_id",
      "related_job_id",
      "role_title",
      "role_summary",
      "david_intro_note",
      "candidate_profile_id",
      "presentation_status",
      "strengths jsonb",
      "watch_outs jsonb",
      "rate_expectation",
      "notice_period",
      "work_preference",
      "anonymised_mode",
    ]) {
      expect(migration).toContain(field);
    }

    for (const viewName of [
      "client_shortlists",
      "client_shortlist_candidates",
      "client_shortlist_access_tokens",
      "client_shortlist_feedback",
      "client_shortlist_activity",
    ]) {
      expect(migration).toContain(`view ${viewName}`);
      expect(portalDoc).toContain(viewName);
    }

    expect(migration).toContain("recruiter_lab_shortlist_activity");
    expect(migration).toContain("token_hash");
    expect(migration).not.toMatch(/raw_token|token text|public_url|candidate_score|ranking/i);
    expect(portalDoc).toContain("One secure link");
    expect(portalDoc).toContain("No GA4, GTM or public analytics event");
    expect(portalDoc).toContain("This is not legal advice");
    expect(pipelineDoc).toContain(
      "docs/recruiter-labs-client-presentation-portal.md",
    );
    expect(featureFlagsDoc).toContain("FEATURE_CLIENT_PRESENTATION_PORTAL");
  });

  it("maps the private admin workflow for the client presentation portal", () => {
    const overview = getRecruiterLabsOverview({});
    const adminPage = readFileSync("app/admin/recruiter-labs/page.tsx", "utf8");

    expect(recruiterLabsClientPresentationPortalAdminWorkflow).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ step: "Create shortlist" }),
        expect.objectContaining({ step: "Generate magic link" }),
        expect.objectContaining({ step: "Revoke access" }),
        expect.objectContaining({ step: "Review feedback and tasks" }),
      ]),
    );
    expect(overview.clientPresentationPortal.route).toBe(
      recruiterLabsClientPortalRoute,
    );
    expect(overview.clientPresentationPortal.dataModelViews).toContain(
      "client_shortlist_activity",
    );
    expect(adminPage).toContain("Client presentation portal");
    expect(adminPage).toContain("One secure shortlist link");
  });
});
