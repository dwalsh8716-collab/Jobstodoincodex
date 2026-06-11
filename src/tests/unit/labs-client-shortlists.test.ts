import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import sitemap from "../../../app/sitemap";
import {
  getRecruiterLabsClientPortalStatus,
  isRecruiterLabsClientPortalFeatureEnabled,
  recruiterLabsClientPortalFeatureFlags,
} from "@/lib/recruiter-labs";
import { getDavidsAudioNotesStatus } from "@/lib/recruiter-labs-audio-notes";
import { getRecruiterLabsEngagementReadiness } from "@/lib/recruiter-labs-engagement";
import { getRecruiterLabsFeedbackReadiness } from "@/lib/recruiter-labs-feedback";
import { siteConfig } from "@/lib/site";

vi.mock("server-only", () => ({}));

describe("Labs client shortlists", () => {
  it("supports the issue-aligned shortlist flag without creating a second portal", () => {
    expect(recruiterLabsClientPortalFeatureFlags).toEqual([
      "FEATURE_CLIENT_SHORTLIST_PORTAL",
      "FEATURE_CLIENT_PRESENTATION_PORTAL",
    ]);
    expect(isRecruiterLabsClientPortalFeatureEnabled({})).toBe(false);
    expect(
      isRecruiterLabsClientPortalFeatureEnabled({
        FEATURE_CLIENT_SHORTLIST_PORTAL: "true",
      }),
    ).toBe(true);
    expect(
      isRecruiterLabsClientPortalFeatureEnabled({
        FEATURE_CLIENT_PRESENTATION_PORTAL: "true",
      }),
    ).toBe(true);
    expect(
      getRecruiterLabsClientPortalStatus({
        FEATURE_CLIENT_SHORTLIST_PORTAL: "true",
        OPERATIONS_DB_ENABLED: "true",
        DATABASE_URL: "postgres://example",
      }),
    ).toMatchObject({
      featureEnabled: true,
      canReadPrivateData: true,
      featureFlagNames: recruiterLabsClientPortalFeatureFlags,
      databaseStatus: { state: "ready" },
    });
    expect(
      getRecruiterLabsFeedbackReadiness({
        FEATURE_CLIENT_SHORTLIST_PORTAL: "true",
        FEATURE_SHORTLIST_FEEDBACK_TRACKING: "true",
        OPERATIONS_DB_ENABLED: "true",
        DATABASE_URL: "postgres://example",
      }),
    ).toMatchObject({ portalEnabled: true, ready: true });
    expect(
      getRecruiterLabsEngagementReadiness({
        FEATURE_CLIENT_SHORTLIST_PORTAL: "true",
        FEATURE_SHORTLIST_FEEDBACK_TRACKING: "true",
        OPERATIONS_DB_ENABLED: "true",
        DATABASE_URL: "postgres://example",
      }),
    ).toMatchObject({ portalEnabled: true, ready: true });
    expect(
      getDavidsAudioNotesStatus({
        FEATURE_CLIENT_SHORTLIST_PORTAL: "true",
      }),
    ).toMatchObject({ portalEnabled: true });
  });

  it("keeps the private shortlist route noindexed and out of public discovery", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    const route = readFileSync("app/client/shortlist/[token]/page.tsx", "utf8");

    expect(urls).not.toContain(`${siteConfig.url}/client/shortlist`);
    expect(urls.some((url) => url.includes("/client/shortlist"))).toBe(false);
    expect(route).toContain("noIndex: true");
    expect(route).toContain("force-dynamic");
    expect(route).toContain("getRecruiterLabsClientPortalView");
    expect(route).not.toMatch(/analyticsAttributes|gtag|ga4|dataLayer/i);
  });

  it("logs safe access outcomes without raw tokens, candidate names or CV content", () => {
    const route = readFileSync("app/client/shortlist/[token]/page.tsx", "utf8");

    expect(route).toContain("logClientShortlistAccess");
    expect(route).toContain("recruiter_labs_access_granted");
    expect(route).toContain("recruiter_labs_access_denied");
    expect(route).toContain("client_shortlist_portal");
    expect(route).not.toMatch(/rawToken|candidateName|signedUrl|cvContent/i);
  });

  it("adds issue-aligned compatibility views without weakening token storage", () => {
    const migration = readFileSync(
      "database/migrations/036_labs_client_shortlists_alignment.sql",
      "utf8",
    );

    for (const viewName of [
      "shortlist_candidates",
      "shortlist_access_tokens",
      "shortlist_feedback",
      "shortlist_activity_logs",
    ]) {
      expect(migration).toContain(`view ${viewName}`);
    }

    expect(migration).toContain("token_hash");
    expect(migration).toContain("viewed_at");
    expect(migration).toContain("interview_requested");
    expect(migration).not.toMatch(/raw_token|token text|public_url|cv_url/i);
  });

  it("documents the staged architecture, security model and launch blockers", () => {
    const doc = readFileSync("docs/labs-client-shortlists.md", "utf8");
    const portalDoc = readFileSync(
      "docs/recruiter-labs-client-presentation-portal.md",
      "utf8",
    );
    const roadmap = readFileSync(
      "docs/essential-resourcing-labs-roadmap.md",
      "utf8",
    );
    const labsDoc = readFileSync("docs/essential-resourcing-labs.md", "utf8");
    const featureFlags = readFileSync("docs/feature-flags.md", "utf8");
    const readme = readFileSync("README.md", "utf8");

    for (const section of [
      "## Audit Result",
      "## Routes",
      "## Feature Flags",
      "## Data Model",
      "## Security Model",
      "## Client UX",
      "## CV Access",
      "## Dependencies",
      "## Testing Checklist",
      "## Blockers",
    ]) {
      expect(doc).toContain(section);
    }

    expect(doc).toContain("FEATURE_CLIENT_SHORTLIST_PORTAL=false");
    expect(doc).toContain("One secure link");
    expect(doc).toContain("No loose CVs");
    expect(doc).toContain("This is not legal advice");
    expect(portalDoc).toContain("docs/labs-client-shortlists.md");
    expect(roadmap).toContain("docs/labs-client-shortlists.md");
    expect(labsDoc).toContain("docs/labs-client-shortlists.md");
    expect(featureFlags).toContain("FEATURE_CLIENT_SHORTLIST_PORTAL");
    expect(readme).toContain("docs/labs-client-shortlists.md");
  });
});
