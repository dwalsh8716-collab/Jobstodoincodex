import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import sitemap from "../../../app/sitemap";
import {
  getRecruiterLabsCandidateShareDecision,
  getRecruiterLabsClientAccessDecision,
  getRecruiterLabsFeatureFlags,
  getRecruiterLabsLaunchGate,
  getRecruiterLabsOverview,
  isRecruiterLabsFeatureEnabled,
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

  it("starts with no public Recruiter Labs routes", () => {
    const overview = getRecruiterLabsOverview({});

    expect(overview.stats.publicRoutes).toBe(0);
    expect(overview.stats.blockedDependencies).toBeGreaterThan(0);
    expect(overview.launchGate.safeForPrivateAdminTesting).toBe(true);
    expect(overview.launchGate.safeForRealClients).toBe(false);
  });

  it("stages hashed magic-link storage instead of raw token storage", () => {
    const migration = readFileSync(
      "database/migrations/006_recruiter_labs_foundation.sql",
      "utf8",
    );

    expect(migration).toContain("token_hash text not null unique");
    expect(migration).not.toMatch(/\btoken\s+text\b/);
  });

  it("keeps the launch gate explicit about blockers and manual review", () => {
    const launchGate = getRecruiterLabsLaunchGate();

    expect(launchGate.checks).toEqual(
      expect.arrayContaining([
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
});
