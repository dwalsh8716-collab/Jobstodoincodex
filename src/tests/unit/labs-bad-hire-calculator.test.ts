import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import sitemap from "../../../app/sitemap";
import {
  calculateBadHireCost,
  getLabsBadHireCalculatorPreview,
  getLabsBadHireCalculatorStatus,
  labsBadHireCalculatorAdminRoute,
  labsBadHireCalculatorFeatureFlag,
  labsBadHireCalculatorInputs,
  labsBadHireCalculatorOutputs,
} from "@/lib/labs-bad-hire-calculator";
import { getLabsOverview } from "@/lib/labs";
import { siteConfig } from "@/lib/site";

vi.mock("server-only", () => ({}));

describe("Labs bad hire calculator", () => {
  it("keeps the calculator hidden, noindexed and blocked from public launch", () => {
    const status = getLabsBadHireCalculatorStatus({});
    const preview = getLabsBadHireCalculatorPreview({});

    expect(status).toMatchObject({
      featureFlag: labsBadHireCalculatorFeatureFlag,
      featureEnabled: false,
      adminRoute: labsBadHireCalculatorAdminRoute,
      noIndex: true,
      databaseStatus: { state: "disabled" },
      canStoreLeads: false,
      readyForPublicLaunch: false,
    });
    expect(preview.leadCaptureActions).toEqual(
      expect.arrayContaining([
        "Email me the results",
        "WhatsApp David",
        "Book a 15-minute call",
        "Sense-check the brief",
      ]),
    );
  });

  it("stores leads only when the flag and private database are ready", () => {
    expect(
      getLabsBadHireCalculatorStatus({
        FEATURE_BAD_HIRE_CALCULATOR: "true",
        OPERATIONS_DB_ENABLED: "true",
        DATABASE_URL: "postgres://example",
      }),
    ).toMatchObject({
      featureEnabled: true,
      canStoreLeads: true,
      databaseStatus: { state: "ready" },
    });
  });

  it("calculates a transparent range rather than a single fake number", () => {
    const result = calculateBadHireCost();
    const totals = result.scenarios.map((scenario) => scenario.total);

    expect(result.caveat).toContain("not financial advice");
    expect(result.scenarios.map((scenario) => scenario.name)).toEqual([
      "conservative",
      "realistic",
      "highRisk",
    ]);
    expect(totals[0]).toBeLessThan(totals[1]);
    expect(totals[1]).toBeLessThan(totals[2]);
    expect(result.scenarios[1].breakdown).toMatchObject({
      recruitment: expect.any(Number),
      failedProductivity: expect.any(Number),
      managementTime: expect.any(Number),
      vacancyDrag: expect.any(Number),
      interimCover: expect.any(Number),
      delayedOpportunity: expect.any(Number),
      replacementSearch: expect.any(Number),
    });
  });

  it("maps the required inputs and outputs from the issue", () => {
    for (const input of [
      "role salary or interim rate",
      "seniority",
      "time to hire",
      "time in role before failure",
      "management time wasted",
      "recruitment cost",
      "lost revenue or opportunity",
      "team disruption",
      "agency/client impact",
      "interim gap cover",
      "delayed campaign or commercial impact",
      "replacement hiring time",
    ]) {
      expect(labsBadHireCalculatorInputs).toContain(input);
    }

    expect(labsBadHireCalculatorOutputs).toEqual(
      expect.arrayContaining([
        "conservative estimate",
        "realistic estimate",
        "high-risk estimate",
        "hidden costs breakdown",
        "recommended action",
        "CTA to sense-check the brief",
      ]),
    );
  });

  it("keeps the admin route private and out of public sitemap output", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    const route = readFileSync(
      "app/admin/labs/bad-hire-calculator/page.tsx",
      "utf8",
    );
    const labsAdmin = readFileSync("app/admin/labs/page.tsx", "utf8");

    expect(urls).not.toContain(`${siteConfig.url}${labsBadHireCalculatorAdminRoute}`);
    expect(route).toContain("isCmsSessionValid");
    expect(route).toContain("index: false");
    expect(route).toContain("No public launch");
    expect(route).toContain("WhatsApp David");
    expect(route).not.toMatch(/analyticsAttributes|gtag\(|dataLayer/i);
    expect(labsAdmin).toContain("/admin/labs/bad-hire-calculator");
  });

  it("stages editable assumptions and private lead capture without analytics PII", () => {
    const migration = readFileSync(
      "database/migrations/038_labs_bad_hire_calculator.sql",
      "utf8",
    );

    for (const field of [
      "labs_bad_hire_calculator_assumptions",
      "labs_bad_hire_calculator_leads",
      "bad_hire_calculator_assumptions",
      "bad_hire_calculator_leads",
      "recruitment_fee_rate",
      "ramp_productivity_loss_rate",
      "management_day_cost_gbp",
      "vacancy_cost_multiplier",
      "interim_cover_day_rate_gbp",
      "opportunity_cost_multiplier",
      "email_results_requested",
      "privacy_notice_acknowledged_at",
    ]) {
      expect(migration).toContain(field);
    }

    expect(migration).not.toMatch(/ga4|gtm|analytics|public_url|secret/i);
  });

  it("documents methodology, caveats, sources and blockers", () => {
    const doc = readFileSync(
      "docs/bad-hire-calculator-methodology.md",
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
      (item) => item.featureFlagName === "FEATURE_BAD_HIRE_CALCULATOR",
    );

    for (const section of [
      "## Methodology",
      "## Assumptions",
      "## Source Context",
      "## What The Calculator Does Not Know",
      "## Why Outputs Are Estimates",
      "## Lead Capture Flow",
      "## Privacy Safeguards",
      "## Legal And Commercial Disclaimer",
      "## Blockers",
    ]) {
      expect(doc).toContain(section);
    }

    expect(doc).toContain("CIPD Resourcing and Talent Planning Report 2024");
    expect(doc).toContain("Oxford Economics/Unum");
    expect(doc).toContain("SHRM");
    expect(doc).toContain("Not financial advice");
    expect(doc).toContain("No fake maths");
    expect(roadmap).toContain("docs/bad-hire-calculator-methodology.md");
    expect(labsDoc).toContain("docs/bad-hire-calculator-methodology.md");
    expect(featureFlags).toContain("docs/bad-hire-calculator-methodology.md");
    expect(readme).toContain("docs/bad-hire-calculator-methodology.md");
    expect(idea).toMatchObject({
      status: "private_preview",
      relatedRoute: labsBadHireCalculatorAdminRoute,
    });
  });
});
