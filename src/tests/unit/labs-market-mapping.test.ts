import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import sitemap from "../../../app/sitemap";
import {
  getLabsMarketMappingPreview,
  getLabsMarketMappingStatus,
  labsMarketMappingAdminRoute,
  labsMarketMappingFeatureFlag,
  labsMarketMappingFunnel,
  labsMarketMappingPrivacyRules,
  labsMarketMappingSegments,
  labsMarketMappingVisualApproach,
} from "@/lib/labs-market-mapping";
import { getLabsOverview } from "@/lib/labs";
import { siteConfig } from "@/lib/site";

vi.mock("server-only", () => ({}));

describe("Labs market mapping", () => {
  it("keeps market mapping private, noindexed and blocked from public launch", () => {
    const status = getLabsMarketMappingStatus({});
    const preview = getLabsMarketMappingPreview({});

    expect(status).toMatchObject({
      featureFlag: labsMarketMappingFeatureFlag,
      featureEnabled: false,
      adminRoute: labsMarketMappingAdminRoute,
      noIndex: true,
      databaseStatus: { state: "disabled" },
      canSavePrivateMaps: false,
      readyForPublicLaunch: false,
    });
    expect(preview.publicBoundary).toContain("anonymised");
    expect(preview.privateBoundary).toContain("signed access");
  });

  it("saves private maps only when the flag and private database are ready", () => {
    expect(
      getLabsMarketMappingStatus({
        FEATURE_MARKET_MAPPING: "true",
        OPERATIONS_DB_ENABLED: "true",
        DATABASE_URL: "postgres://example",
      }),
    ).toMatchObject({
      featureEnabled: true,
      canSavePrivateMaps: true,
      databaseStatus: { state: "ready" },
    });
  });

  it("maps the required visual approaches and funnel stages from the issue", () => {
    expect(labsMarketMappingVisualApproach).toEqual(
      expect.arrayContaining([
        "search funnel",
        "sector map",
        "seniority heatmap",
        "location spread",
        "status board",
        "network reach cards",
        "anonymised talent pool snapshot",
        "role difficulty score",
      ]),
    );
    expect(labsMarketMappingFunnel.map((stage) => stage.stage)).toEqual([
      "Target role universe",
      "Mapped",
      "Approached",
      "Engaged",
      "Shortlisted",
    ]);
    expect(labsMarketMappingSegments[0]).toMatchObject({
      targetCount: expect.any(Number),
      mappedCount: expect.any(Number),
      approachedCount: expect.any(Number),
      engagedCount: expect.any(Number),
      shortlistedCount: expect.any(Number),
    });
  });

  it("keeps the admin route private and out of public sitemap output", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    const route = readFileSync(
      "app/admin/labs/market-mapping/page.tsx",
      "utf8",
    );
    const labsAdmin = readFileSync("app/admin/labs/page.tsx", "utf8");

    expect(urls).not.toContain(`${siteConfig.url}${labsMarketMappingAdminRoute}`);
    expect(route).toContain("isCmsSessionValid");
    expect(route).toContain("index: false");
    expect(route).toContain("No public launch");
    expect(route).not.toMatch(/analyticsAttributes|gtag\(|dataLayer/i);
    expect(labsAdmin).toContain("/admin/labs/market-mapping");
  });

  it("stages aggregate market-map tables without named candidate fields", () => {
    const migration = readFileSync(
      "database/migrations/039_labs_market_mapping.sql",
      "utf8",
    );

    for (const field of [
      "market_maps",
      "market_map_segments",
      "market_map_snapshots",
      "target_count",
      "mapped_count",
      "approached_count",
      "engaged_count",
      "shortlisted_count",
      "candidate_availability_summary",
      "response_status_summary",
      "anonymised_summary",
    ]) {
      expect(migration).toContain(field);
    }

    expect(migration).not.toMatch(
      /candidate_name|candidate_email|candidate_phone|cv_text|raw_profile|linkedin_url/i,
    );
  });

  it("documents the visual approach, data model and privacy boundary", () => {
    const doc = readFileSync("docs/labs-market-mapping.md", "utf8");
    const roadmap = readFileSync(
      "docs/essential-resourcing-labs-roadmap.md",
      "utf8",
    );
    const labsDoc = readFileSync("docs/essential-resourcing-labs.md", "utf8");
    const featureFlags = readFileSync("docs/feature-flags.md", "utf8");
    const readme = readFileSync("README.md", "utf8");
    const overview = getLabsOverview({});
    const idea = overview.ideas.find(
      (item) => item.featureFlagName === "FEATURE_MARKET_MAPPING",
    );

    for (const section of [
      "## Route",
      "## Feature Flag",
      "## Recommended Visual Approach",
      "## Staged Visuals",
      "## Data Model",
      "## Private/Public Boundary",
      "## Privacy Safeguards",
      "## Client-Facing Use",
      "## Testing Checklist",
      "## Blockers",
    ]) {
      expect(doc).toContain(section);
    }

    expect(labsMarketMappingPrivacyRules).toContain(
      "No named candidate lists in public visualisations.",
    );
    expect(doc).toContain("Make the invisible work visible");
    expect(doc).toContain("No public PII");
    expect(roadmap).toContain("docs/labs-market-mapping.md");
    expect(labsDoc).toContain("docs/labs-market-mapping.md");
    expect(featureFlags).toContain("docs/labs-market-mapping.md");
    expect(readme).toContain("docs/labs-market-mapping.md");
    expect(idea).toMatchObject({
      status: "private_preview",
      relatedRoute: labsMarketMappingAdminRoute,
    });
  });
});
