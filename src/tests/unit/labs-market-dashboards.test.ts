import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import sitemap from "../../../app/sitemap";
import {
  getLabsMarketDashboardPreview,
  getLabsMarketDashboardStatus,
  labsMarketDashboardDefinitions,
  labsMarketDashboardRoute,
} from "@/lib/labs-market-dashboards";
import { siteConfig } from "@/lib/site";

vi.mock("server-only", () => ({}));

describe("Labs live market dashboards", () => {
  it("keeps live market dashboards hidden and blocked by default", () => {
    const status = getLabsMarketDashboardStatus({});
    const preview = getLabsMarketDashboardPreview({});

    expect(status).toMatchObject({
      featureEnabled: false,
      readyForPrivatePreview: false,
      readyForPublicLaunch: false,
      noIndex: true,
      route: labsMarketDashboardRoute,
      databaseStatus: { state: "disabled" },
    });
    expect(preview.dashboards).toHaveLength(
      labsMarketDashboardDefinitions.length,
    );
    expect(
      preview.dashboards.every(
        (dashboard) => dashboard.dataState === "waiting_for_verified_data",
      ),
    ).toBe(true);
  });

  it("requires the dashboard flag and private database before private preview", () => {
    expect(
      getLabsMarketDashboardStatus({
        FEATURE_LIVE_MARKET_DASHBOARDS: "true",
      }),
    ).toMatchObject({
      featureEnabled: true,
      readyForPrivatePreview: false,
      databaseStatus: { state: "disabled" },
    });

    expect(
      getLabsMarketDashboardStatus({
        FEATURE_LIVE_MARKET_DASHBOARDS: "true",
        OPERATIONS_DB_ENABLED: "true",
        DATABASE_URL: "postgres://example",
      }),
    ).toMatchObject({
      featureEnabled: true,
      readyForPrivatePreview: true,
      readyForPublicLaunch: false,
      databaseStatus: { state: "ready" },
    });
  });

  it("keeps the hidden route noindexed and out of public sitemap output", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    const route = readFileSync(
      "app/admin/labs/market-dashboards/page.tsx",
      "utf8",
    );
    const labsAdmin = readFileSync("app/admin/labs/page.tsx", "utf8");

    expect(urls).not.toContain(`${siteConfig.url}${labsMarketDashboardRoute}`);
    expect(route).toContain("isCmsSessionValid");
    expect(route).toContain("index: false");
    expect(route).toContain("Public launch blocked");
    expect(route).not.toMatch(/analyticsAttributes|gtag|ga4|dataLayer/i);
    expect(labsAdmin).toContain("/admin/labs/market-dashboards");
  });

  it("stages a data model with confidence, methodology and no raw PII fields", () => {
    const migration = readFileSync(
      "database/migrations/033_labs_market_dashboards.sql",
      "utf8",
    );

    for (const tableName of [
      "market_data_sources",
      "market_dashboard_configs",
      "market_data_points",
      "salary_ranges",
      "rate_ranges",
    ]) {
      expect(migration).toContain(tableName);
    }

    for (const field of [
      "confidence_level",
      "methodology_note",
      "sample_size",
      "last_updated_at",
      "min_salary",
      "median_salary",
      "max_salary",
      "day_rate_min",
      "day_rate_max",
    ]) {
      expect(migration).toContain(field);
    }

    expect(migration).not.toMatch(
      /candidate_id|client_contact_id|raw_pii|cv_text|phone|email|raw_token/i,
    );
  });

  it("documents the methodology and no-fake-data launch gate", () => {
    const doc = readFileSync("docs/labs-live-market-dashboards.md", "utf8");
    const roadmap = readFileSync(
      "docs/essential-resourcing-labs-roadmap.md",
      "utf8",
    );
    const labsDoc = readFileSync("docs/essential-resourcing-labs.md", "utf8");
    const featureFlags = readFileSync("docs/feature-flags.md", "utf8");
    const readme = readFileSync("README.md", "utf8");

    for (const section of [
      "## Hidden Route",
      "## Feature Flag",
      "## Dashboard Architecture",
      "## Planned Dashboards",
      "## Data Model",
      "## Data Sources",
      "## Confidence Rules",
      "## Lead Capture",
      "## Privacy Safeguards",
      "## Testing Checklist",
      "## Blockers",
    ]) {
      expect(doc).toContain(section);
    }

    expect(doc).toContain("No fake benchmarks");
    expect(doc).toContain("No raw PII");
    expect(doc).toContain("verified");
    expect(roadmap).toContain("docs/labs-live-market-dashboards.md");
    expect(labsDoc).toContain("docs/labs-live-market-dashboards.md");
    expect(featureFlags).toContain("FEATURE_LIVE_MARKET_DASHBOARDS");
    expect(readme).toContain("docs/labs-live-market-dashboards.md");
  });
});
