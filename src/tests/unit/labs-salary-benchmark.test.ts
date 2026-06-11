import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import sitemap from "../../../app/sitemap";
import {
  getLabsSalaryBenchmarkPreview,
  getLabsSalaryBenchmarkStatus,
  labsSalaryBenchmarkAdminRoute,
  labsSalaryBenchmarkDataSources,
  labsSalaryBenchmarkFeatureFlag,
  labsSalaryBenchmarkReportSections,
  labsSalaryBenchmarkRequestFields,
  labsSalaryBenchmarkReviewRules,
} from "@/lib/labs-salary-benchmark";
import { getLabsOverview } from "@/lib/labs";
import { siteConfig } from "@/lib/site";

vi.mock("server-only", () => ({}));

describe("Labs salary benchmark asset", () => {
  it("keeps the benchmark asset hidden, noindexed and blocked from public launch", () => {
    const status = getLabsSalaryBenchmarkStatus({});
    const preview = getLabsSalaryBenchmarkPreview({});

    expect(status).toMatchObject({
      featureFlag: labsSalaryBenchmarkFeatureFlag,
      featureEnabled: false,
      adminRoute: labsSalaryBenchmarkAdminRoute,
      noIndex: true,
      databaseStatus: { state: "disabled" },
      canStoreRequests: false,
      readyForPublicLaunch: false,
    });
    expect(preview.principle).toContain("No fake salary data");
  });

  it("stores requests only when the flag and private database are ready", () => {
    expect(
      getLabsSalaryBenchmarkStatus({
        FEATURE_SALARY_BENCHMARK_ASSET: "true",
        OPERATIONS_DB_ENABLED: "true",
        DATABASE_URL: "postgres://example",
      }),
    ).toMatchObject({
      featureEnabled: true,
      canStoreRequests: true,
      databaseStatus: { state: "ready" },
    });
  });

  it("maps the required request fields, report sections and data sources", () => {
    for (const field of [
      "role title",
      "seniority",
      "location",
      "hybrid/remote setup",
      "agency/client-side",
      "sector",
      "salary/rate budget",
      "must-have skills",
      "hiring urgency",
      "email/company details",
      "consent",
    ]) {
      expect(labsSalaryBenchmarkRequestFields).toContain(field);
    }

    expect(labsSalaryBenchmarkReportSections).toEqual(
      expect.arrayContaining([
        "client role summary",
        "market range",
        "salary/rate caveats",
        "hiring difficulty",
        "likely candidate pool",
        "risk of underpaying",
        "suggested adjustments",
        "comparable roles",
        "interim vs permanent view",
        "David's recommendation",
        "CTA to discuss",
      ]),
    );
    expect(labsSalaryBenchmarkDataSources).toContain(
      "anonymised candidate expectations",
    );
  });

  it("keeps the admin route private and out of public sitemap output", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    const route = readFileSync(
      "app/admin/labs/salary-benchmark/page.tsx",
      "utf8",
    );
    const labsAdmin = readFileSync("app/admin/labs/page.tsx", "utf8");

    expect(urls).not.toContain(`${siteConfig.url}${labsSalaryBenchmarkAdminRoute}`);
    expect(route).toContain("isCmsSessionValid");
    expect(route).toContain("index: false");
    expect(route).toContain("No public launch");
    expect(route).not.toMatch(/analyticsAttributes|gtag\(|dataLayer/i);
    expect(labsAdmin).toContain("/admin/labs/salary-benchmark");
  });

  it("stages request and draft tables with human review before send", () => {
    const migration = readFileSync(
      "database/migrations/040_labs_salary_benchmark_asset.sql",
      "utf8",
    );

    for (const field of [
      "salary_benchmark_requests",
      "requester_name",
      "requester_email",
      "salary_budget",
      "rate_budget",
      "must_have_skills",
      "consent_to_contact",
      "marketing_consent",
      "salary_benchmark_drafts",
      "market_range",
      "salary_rate_caveats",
      "david_recommendation",
      "source_notes",
      "ai_used",
      "david_reviewed_at",
      "approved_to_send_at",
    ]) {
      expect(migration).toContain(field);
    }

    expect(migration).toContain(
      "salary_benchmark_drafts_human_review_before_send_check",
    );
    expect(migration).not.toMatch(/auto_send|unreviewed_final|fake_salary/i);
  });

  it("documents the workflow, AI rules, privacy safeguards and blockers", () => {
    const doc = readFileSync("docs/labs-salary-benchmark-asset.md", "utf8");
    const roadmap = readFileSync(
      "docs/essential-resourcing-labs-roadmap.md",
      "utf8",
    );
    const labsDoc = readFileSync("docs/essential-resourcing-labs.md", "utf8");
    const featureFlags = readFileSync("docs/feature-flags.md", "utf8");
    const readme = readFileSync("README.md", "utf8");
    const overview = getLabsOverview({});
    const idea = overview.ideas.find(
      (item) => item.featureFlagName === "FEATURE_SALARY_BENCHMARK_ASSET",
    );

    for (const section of [
      "## Route",
      "## Feature Flag",
      "## Feature Design",
      "## Request Fields",
      "## Output Asset",
      "## Data Model",
      "## Admin Workflow",
      "## AI And Human Review Rules",
      "## Privacy Safeguards",
      "## Blockers",
    ]) {
      expect(doc).toContain(section);
    }

    expect(labsSalaryBenchmarkReviewRules).toContain(
      "No final report without David review.",
    );
    expect(doc).toContain("No fake salary data");
    expect(doc).toContain("No unreviewed AI advice");
    expect(roadmap).toContain("docs/labs-salary-benchmark-asset.md");
    expect(labsDoc).toContain("docs/labs-salary-benchmark-asset.md");
    expect(featureFlags).toContain("docs/labs-salary-benchmark-asset.md");
    expect(readme).toContain("docs/labs-salary-benchmark-asset.md");
    expect(idea).toMatchObject({
      status: "private_preview",
      relatedRoute: labsSalaryBenchmarkAdminRoute,
    });
  });
});
