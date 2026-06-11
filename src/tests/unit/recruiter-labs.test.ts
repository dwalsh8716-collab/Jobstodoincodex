import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import sitemap from "../../../app/sitemap";
import {
  getRecruiterLabsFeatureFlags,
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

  it("keeps private Recruiter Labs and client routes out of the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).not.toContain(`${siteConfig.url}/admin/recruiter-labs`);
    expect(urls.some((url) => url.includes("/client/shortlist"))).toBe(false);
  });

  it("starts with no public Recruiter Labs routes", () => {
    const overview = getRecruiterLabsOverview({});

    expect(overview.stats.publicRoutes).toBe(0);
    expect(overview.stats.blockedDependencies).toBeGreaterThan(0);
  });

  it("stages hashed magic-link storage instead of raw token storage", () => {
    const migration = readFileSync(
      "database/migrations/006_recruiter_labs_foundation.sql",
      "utf8",
    );

    expect(migration).toContain("token_hash text not null unique");
    expect(migration).not.toMatch(/\btoken\s+text\b/);
  });
});
