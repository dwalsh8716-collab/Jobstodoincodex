import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import sitemap from "../../../app/sitemap";
import {
  getLabsSalaryGuidesPreview,
  getLabsSalaryGuidesStatus,
  labsSalaryGuideAssetTypes,
  labsSalaryGuideLeadStatuses,
  labsSalaryGuidePrivacyRules,
  labsSalaryGuideRequestFields,
  labsSalaryGuidesAdminRoute,
  labsSalaryGuidesFeatureFlag,
} from "@/lib/labs-salary-guides";
import { getLabsOverview } from "@/lib/labs";
import { siteConfig } from "@/lib/site";

vi.mock("server-only", () => ({}));

describe("Labs gated salary guides", () => {
  it("keeps the feature private, noindexed and disabled by default", () => {
    const status = getLabsSalaryGuidesStatus({});
    const preview = getLabsSalaryGuidesPreview({});

    expect(status).toMatchObject({
      featureFlag: labsSalaryGuidesFeatureFlag,
      featureEnabled: false,
      adminRoute: labsSalaryGuidesAdminRoute,
      publicRoute: "/salary-guides",
      noIndex: true,
      hiddenFromNavigation: true,
      hiddenFromSitemap: true,
      canCaptureLeads: false,
      canDeliverGuide: false,
      readyForPublicLaunch: false,
    });
    expect(preview.principle).toContain("serious B2B conversations");
  });

  it("only captures and delivers when storage, email and guide delivery are ready", () => {
    expect(
      getLabsSalaryGuidesStatus({
        FEATURE_SALARY_GUIDE_GATE: "true",
        OPERATIONS_DB_ENABLED: "true",
        DATABASE_URL: "postgresql://example",
        RESEND_API_KEY: "test-resend-key",
        CONTACT_TO_EMAIL: "david@example.com",
        CONTACT_FROM_EMAIL: "website@example.com",
        SALARY_GUIDE_DOWNLOAD_URL: "https://example.com/guide.pdf",
      }),
    ).toMatchObject({
      featureEnabled: true,
      hiddenFromSitemap: false,
      canCaptureLeads: true,
      canDeliverGuide: true,
      readyForPublicLaunch: false,
    });
  });

  it("maps the requested assets, lead fields, statuses and privacy rules", () => {
    expect(labsSalaryGuideAssetTypes).toContain(
      "North West Senior Marketing Salary Guide",
    );
    expect(labsSalaryGuideAssetTypes).toContain(
      "Strategic Interim Day Rate Guide",
    );
    expect(labsSalaryGuideRequestFields).toEqual(
      expect.arrayContaining([
        "name",
        "email",
        "company",
        "role/title",
        "hiring interest",
        "optional phone",
        "contact consent",
        "optional marketing consent",
        "source page",
        "UTM source/medium/campaign",
      ]),
    );
    expect(labsSalaryGuideLeadStatuses).toEqual([
      "new",
      "reviewed",
      "contacted",
      "qualified",
      "converted",
      "closed",
    ]);
    expect(labsSalaryGuidePrivacyRules).toContain("No fake salary data.");
    expect(labsSalaryGuidePrivacyRules).toContain(
      "No PII in GA4, GTM or analytics events.",
    );
  });

  it("keeps the admin route protected, noindexed and out of public sitemap output", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    const route = readFileSync(
      "app/admin/labs/salary-guides/page.tsx",
      "utf8",
    );
    const labsAdmin = readFileSync("app/admin/labs/page.tsx", "utf8");

    expect(urls).not.toContain(`${siteConfig.url}${labsSalaryGuidesAdminRoute}`);
    expect(route).toContain("isCmsSessionValid");
    expect(route).toContain("index: false");
    expect(route).toContain("No public launch");
    expect(route).not.toMatch(/analyticsAttributes|gtag\(|dataLayer/i);
    expect(labsAdmin).toContain(labsSalaryGuidesAdminRoute);
  });

  it("extends the private lead table without duplicating the existing capture flow", () => {
    const baseMigration = readFileSync(
      "database/migrations/012_salary_guide_leads.sql",
      "utf8",
    );
    const alignmentMigration = readFileSync(
      "database/migrations/041_labs_salary_guide_asset_alignment.sql",
      "utf8",
    );
    const salaryGuideLib = readFileSync("src/lib/salary-guide.ts", "utf8");

    expect(baseMigration).toContain("create table if not exists salary_guide_leads");
    expect(alignmentMigration).toContain("add column if not exists guide_id");
    expect(alignmentMigration).toContain("add column if not exists source_page");
    expect(alignmentMigration).toContain("add column if not exists utm_source");
    expect(alignmentMigration).toContain("add column if not exists status");
    expect(alignmentMigration).toContain("salary_guide_leads_status_check");
    expect(salaryGuideLib).toContain("source_page");
    expect(salaryGuideLib).toContain("utm_campaign");
    expect(salaryGuideLib).not.toContain("downloadToken");
  });

  it("documents the Labs route, manual gates and public launch blockers", () => {
    const doc = readFileSync("docs/labs-salary-guides.md", "utf8");
    const leadCaptureDoc = readFileSync(
      "docs/salary-guide-lead-capture.md",
      "utf8",
    );
    const roadmap = readFileSync(
      "docs/essential-resourcing-labs-roadmap.md",
      "utf8",
    );
    const labsDoc = readFileSync("docs/essential-resourcing-labs.md", "utf8");
    const featureFlags = readFileSync("docs/feature-flags.md", "utf8");
    const readme = readFileSync("README.md", "utf8");
    const overview = getLabsOverview({});
    const idea = overview.ideas.find(
      (item) => item.featureFlagName === "FEATURE_SALARY_GUIDE_GATE",
    );

    for (const section of [
      "## Status",
      "## Feature Flag",
      "## What Already Existed",
      "## What Was Added",
      "## Guide Assets",
      "## Lead Flow",
      "## Data Model",
      "## CMS Boundary",
      "## Privacy Safeguards",
      "## Manual Launch Gates",
      "## Testing Checklist",
    ]) {
      expect(doc).toContain(section);
    }

    expect(doc).toContain("/admin/labs/salary-guides");
    expect(doc).toContain("No duplicate form or duplicate salary guide route");
    expect(leadCaptureDoc).toContain("/admin/labs/salary-guides");
    expect(roadmap).toContain("docs/labs-salary-guides.md");
    expect(labsDoc).toContain("docs/labs-salary-guides.md");
    expect(featureFlags).toContain("docs/labs-salary-guides.md");
    expect(readme).toContain("docs/labs-salary-guides.md");
    expect(idea).toMatchObject({
      status: "private_preview",
      relatedRoute: labsSalaryGuidesAdminRoute,
    });
  });
});
