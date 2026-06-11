import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  getRetainedSearchDashboardStatus,
  getRetainedSearchDashboardView,
  retainedSearchDashboardRoute,
} from "@/lib/retained-search-dashboard";

vi.mock("server-only", () => ({}));

const validToken = "abcdefghijklmnopqrstuvwxyzABCDEF";

describe("retained search client dashboard", () => {
  it("keeps retained search dashboards disabled until the flag and private database are ready", () => {
    expect(getRetainedSearchDashboardStatus({})).toMatchObject({
      route: retainedSearchDashboardRoute,
      featureEnabled: false,
      canReadPrivateData: false,
      databaseStatus: { state: "disabled" },
    });

    expect(
      getRetainedSearchDashboardStatus({
        FEATURE_RETAINED_SEARCH_DASHBOARD: "true",
        OPERATIONS_DB_ENABLED: "true",
        DATABASE_URL: "postgres://example",
      }),
    ).toMatchObject({
      featureEnabled: true,
      canReadPrivateData: true,
      databaseStatus: { state: "ready" },
    });
  });

  it("returns a safe disabled view without touching the database", async () => {
    const view = await getRetainedSearchDashboardView(validToken, {});

    expect(view).toMatchObject({
      decision: {
        allowed: false,
        state: "feature_disabled",
      },
      dashboard: null,
    });
  });

  it("stages aggregate-only dashboard tables without candidate PII fields", () => {
    const migration = readFileSync(
      "database/migrations/021_retained_search_dashboard.sql",
      "utf8",
    );

    expect(migration).toContain("recruiter_lab_retained_search_dashboards");
    expect(migration).toContain("recruiter_lab_retained_search_pipeline_events");
    expect(migration).toContain("recruiter_lab_retained_search_dashboard_metric_totals");
    expect(migration).toContain("'mapped'");
    expect(migration).toContain("'interview_stage'");
    expect(migration).toContain("event_count integer");
    expect(migration).not.toMatch(
      /candidate_id|candidate_name|candidate_email|candidate_phone|cv_file|public_url|raw_token|token text/i,
    );
  });

  it("keeps the private client dashboard route noindexed and out of public tracking", () => {
    const route = readFileSync(
      "app/client/retained-search/[token]/page.tsx",
      "utf8",
    );

    expect(route).toContain('dynamic = "force-dynamic"');
    expect(route).toContain("noIndex: true");
    expect(route).toContain("getRetainedSearchDashboardView");
    expect(route).toContain("Aggregate only");
    expect(route).not.toMatch(/analyticsAttributes|gtag|ga4|dataLayer/i);
  });

  it("documents the feature flag, data boundary and launch blockers", () => {
    const docs = readFileSync(
      "docs/recruiter-labs-retained-search-dashboard.md",
      "utf8",
    );
    const env = readFileSync(".env.example", "utf8");
    const dataBoundaries = readFileSync("src/lib/data-boundaries.ts", "utf8");
    const readme = readFileSync("README.md", "utf8");

    expect(env).toContain("FEATURE_RETAINED_SEARCH_DASHBOARD=false");
    expect(docs).toContain("aggregate-only");
    expect(docs).toContain("No candidate PII");
    expect(docs).toContain("/client/retained-search/[token]");
    expect(dataBoundaries).toContain("retainedSearchDashboardToken");
    expect(readme).toContain("docs/recruiter-labs-retained-search-dashboard.md");
  });
});
