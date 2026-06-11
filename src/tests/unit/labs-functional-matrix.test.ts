import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import sitemap from "../../../app/sitemap";
import {
  getLabsFunctionalMatrixPreview,
  getLabsFunctionalMatrixStatus,
  labsFunctionalMatrixAdminRoute,
  labsFunctionalMatrixDimensions,
  labsFunctionalMatrixFeatureFlag,
  labsFunctionalMatrixOutputs,
} from "@/lib/labs-functional-matrix";
import { getLabsOverview } from "@/lib/labs";
import { siteConfig } from "@/lib/site";

vi.mock("server-only", () => ({}));

describe("Labs functional matrix", () => {
  it("keeps the functional matrix hidden, noindexed and blocked from public launch", () => {
    const status = getLabsFunctionalMatrixStatus({});
    const preview = getLabsFunctionalMatrixPreview({});

    expect(status).toMatchObject({
      featureFlag: labsFunctionalMatrixFeatureFlag,
      featureEnabled: false,
      adminRoute: labsFunctionalMatrixAdminRoute,
      noIndex: true,
      databaseStatus: { state: "disabled" },
      canSaveMatrices: false,
      readyForPublicLaunch: false,
    });
    expect(preview.principle).toBe("The job title is not the brief.");
    expect(preview.safetyRules).toEqual(
      expect.arrayContaining([
        "No candidate scoring or automated recommendation.",
        "Use Postgres if a matrix references live client, role or candidate data.",
      ]),
    );
  });

  it("supports private saving only when the flag and operations database are ready", () => {
    expect(
      getLabsFunctionalMatrixStatus({
        FEATURE_FUNCTIONAL_MATRIX: "true",
        OPERATIONS_DB_ENABLED: "true",
        DATABASE_URL: "postgres://example",
      }),
    ).toMatchObject({
      featureEnabled: true,
      canSaveMatrices: true,
      databaseStatus: { state: "ready" },
    });
  });

  it("maps the required matrix dimensions and outputs from the issue", () => {
    expect(labsFunctionalMatrixDimensions.map((dimension) => dimension.id)).toEqual([
      "strategy",
      "execution",
      "leadership",
      "commercial_impact",
      "technical_skill",
      "channel_expertise",
      "stakeholder_management",
      "agency_client_side",
      "sector_knowledge",
      "team_management",
      "budget_ownership",
      "growth_change",
      "hands_on_delivery",
      "transformation",
      "interim_urgency",
    ]);
    expect(labsFunctionalMatrixOutputs).toEqual(
      expect.arrayContaining([
        "role requirement matrix",
        "must-have/nice-to-have split",
        "brief quality score",
        "mismatch warnings",
        "candidate comparison matrix",
        "shortlist summary",
        "hiring risk notes",
        "salary realism note",
      ]),
    );
  });

  it("keeps the admin route private and out of public sitemap output", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    const route = readFileSync(
      "app/admin/labs/functional-matrix/page.tsx",
      "utf8",
    );
    const labsAdmin = readFileSync("app/admin/labs/page.tsx", "utf8");

    expect(urls).not.toContain(`${siteConfig.url}${labsFunctionalMatrixAdminRoute}`);
    expect(route).toContain("isCmsSessionValid");
    expect(route).toContain("index: false");
    expect(route).toContain("No public launch");
    expect(route).not.toMatch(/analyticsAttributes|gtag|ga4|dataLayer/i);
    expect(labsAdmin).toContain("/admin/labs/functional-matrix");
  });

  it("stages the Postgres model without creating candidate scoring fields", () => {
    const migration = readFileSync(
      "database/migrations/037_labs_functional_matrix.sql",
      "utf8",
    );

    for (const field of [
      "labs_functional_matrices",
      "labs_functional_matrix_events",
      "functional_matrices",
      "matrix_scores jsonb",
      "must_haves jsonb",
      "nice_to_haves jsonb",
      "risks jsonb",
      "source_context",
      "related_shortlist_id",
      "related_job_id",
    ]) {
      expect(migration).toContain(field);
    }

    expect(migration).not.toMatch(
      /candidate_score|candidate_rank|automatic_match|auto_recommend/i,
    );
  });

  it("documents the route, privacy boundary and launch blockers", () => {
    const doc = readFileSync("docs/labs-functional-matrix.md", "utf8");
    const roadmap = readFileSync(
      "docs/essential-resourcing-labs-roadmap.md",
      "utf8",
    );
    const labsDoc = readFileSync("docs/essential-resourcing-labs.md", "utf8");
    const featureFlags = readFileSync("docs/feature-flags.md", "utf8");
    const readme = readFileSync("README.md", "utf8");
    const overview = getLabsOverview({});
    const idea = overview.ideas.find(
      (item) => item.featureFlagName === "FEATURE_FUNCTIONAL_MATRIX",
    );

    for (const section of [
      "## Routes",
      "## Feature Flag",
      "## Proposed Matrix Dimensions",
      "## Outputs",
      "## Data Model",
      "## UI Route And Component",
      "## Privacy Boundary",
      "## Testing Checklist",
      "## Blockers",
    ]) {
      expect(doc).toContain(section);
    }

    expect(doc).toContain("The job title is not the brief");
    expect(doc).toContain("no automated candidate scoring");
    expect(doc).toContain("No faff");
    expect(roadmap).toContain("docs/labs-functional-matrix.md");
    expect(labsDoc).toContain("docs/labs-functional-matrix.md");
    expect(featureFlags).toContain("docs/labs-functional-matrix.md");
    expect(readme).toContain("docs/labs-functional-matrix.md");
    expect(idea).toMatchObject({
      status: "private_preview",
      relatedRoute: labsFunctionalMatrixAdminRoute,
    });
  });
});
