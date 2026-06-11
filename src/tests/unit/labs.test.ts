import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import sitemap from "../../../app/sitemap";
import {
  getLabsFeatureFlags,
  getLabsOverview,
  isLabsFeatureEnabled,
  labsFeatureFlagDefinitions,
  labsRoadmapPhases,
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

  it("keeps Labs ideas out of public sitemap output", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).not.toContain(`${siteConfig.url}/labs`);
    expect(urls).not.toContain(`${siteConfig.url}/admin/labs`);
  });

  it("tracks high-risk ideas without marking anything ready for launch", () => {
    const overview = getLabsOverview({});

    expect(overview.stats.totalIdeas).toBeGreaterThan(0);
    expect(overview.stats.totalRoadmapPhases).toBe(7);
    expect(overview.stats.highRiskIdeas).toBeGreaterThan(0);
    expect(overview.stats.readyForLaunch).toBe(0);
  });

  it("defines a dependency-aware 12-month Labs roadmap", () => {
    const overview = getLabsOverview({});
    const adminPage = readFileSync("app/admin/labs/page.tsx", "utf8");

    expect(labsRoadmapPhases).toHaveLength(7);
    expect(overview.roadmapPhases.map((phase) => phase.title)).toEqual([
      "Labs foundation",
      "Lead capture assets",
      "Advisory tools",
      "Private data infrastructure",
      "Client portal features",
      "Interim bench",
      "Market intelligence",
    ]);
    expect(
      overview.roadmapPhases
        .filter((phase) => phase.codexReasoning === "high")
        .map((phase) => phase.title),
    ).toEqual(
      expect.arrayContaining([
        "Private data infrastructure",
        "Client portal features",
        "Interim bench",
        "Market intelligence",
      ]),
    );
    expect(adminPage).toContain("12-month roadmap");
    expect(adminPage).toContain("Build future advantage without derailing launch");
  });

  it("documents the broader Essential Resourcing Labs roadmap", () => {
    const roadmap = readFileSync(
      "docs/essential-resourcing-labs-roadmap.md",
      "utf8",
    );
    const labsDoc = readFileSync("docs/essential-resourcing-labs.md", "utf8");
    const readme = readFileSync("README.md", "utf8");

    for (const section of [
      "## 12-Month Build Order",
      "## Feature Decision Matrix",
      "## Top 3 Highest-Value Ideas",
      "## Top 3 Riskiest Ideas",
      "## What Not To Build Yet",
      "## What Depends On Database/Auth",
      "## What Can Be Staged Privately Now",
      "## What Could Become Public Later",
      "## Suggested GitHub Issue Order",
      "## Codex Reasoning Guidance",
    ]) {
      expect(roadmap).toContain(section);
    }

    for (const feature of [
      "Gated salary guides",
      "Bespoke salary benchmarking",
      "Market mapping visuals",
      "Bad hire calculator",
      "Functional matrix mapping",
      "Passwordless client shortlists",
      "Strategic Interim bench",
      "Live market dashboards",
    ]) {
      expect(roadmap).toContain(feature);
    }

    expect(roadmap).toContain("Do not build everything at once");
    expect(roadmap).toContain("No faff");
    expect(roadmap).not.toMatch(/safe to launch real client links/i);
    expect(roadmap).not.toMatch(/public candidate profiles/i);
    expect(labsDoc).toContain("docs/essential-resourcing-labs-roadmap.md");
    expect(readme).toContain("docs/essential-resourcing-labs-roadmap.md");
  });
});
