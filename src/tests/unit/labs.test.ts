import { describe, expect, it, vi } from "vitest";
import sitemap from "../../../app/sitemap";
import {
  getLabsFeatureFlags,
  getLabsOverview,
  isLabsFeatureEnabled,
  labsFeatureFlagDefinitions,
} from "@/lib/labs";
import { siteConfig } from "@/lib/site";

vi.mock("server-only", () => ({}));

describe("Essential Resourcing Labs", () => {
  it("keeps all Labs feature flags server-side and off by default", () => {
    const flags = getLabsFeatureFlags({});

    expect(flags).toHaveLength(labsFeatureFlagDefinitions.length);
    expect(flags.every((flag) => flag.scope === "server-only")).toBe(true);
    expect(flags.every((flag) => flag.enabled === false)).toBe(true);
  });

  it("enables a Labs feature only from an explicit true server env value", () => {
    expect(
      isLabsFeatureEnabled("FEATURE_BAD_HIRE_CALCULATOR", {
        FEATURE_BAD_HIRE_CALCULATOR: "true",
      }),
    ).toBe(true);
    expect(
      isLabsFeatureEnabled("FEATURE_BAD_HIRE_CALCULATOR", {
        FEATURE_BAD_HIRE_CALCULATOR: "false",
      }),
    ).toBe(false);
  });

  it("keeps Labs ideas out of public sitemap output", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).not.toContain(`${siteConfig.url}/labs`);
    expect(urls).not.toContain(`${siteConfig.url}/admin/labs`);
  });

  it("tracks high-risk ideas without marking anything ready for launch", () => {
    const overview = getLabsOverview({});

    expect(overview.stats.totalIdeas).toBeGreaterThan(0);
    expect(overview.stats.highRiskIdeas).toBeGreaterThan(0);
    expect(overview.stats.readyForLaunch).toBe(0);
  });
});
