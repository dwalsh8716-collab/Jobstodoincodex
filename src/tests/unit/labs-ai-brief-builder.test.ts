import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import sitemap from "../../../app/sitemap";
import {
  getLabsAiBriefBuilderPreview,
  getLabsAiBriefBuilderStatus,
  labsAiBriefBuilderAdminRoute,
  labsAiBriefBuilderApiRoute,
  labsAiBriefBuilderSections,
} from "@/lib/labs-ai-brief-builder";
import { siteConfig } from "@/lib/site";

vi.mock("server-only", () => ({}));

describe("Labs AI brief builder", () => {
  it("keeps the brief builder staged, private and blocked from public launch", () => {
    const status = getLabsAiBriefBuilderStatus({});
    const preview = getLabsAiBriefBuilderPreview({});

    expect(status).toMatchObject({
      featureFlag: "FEATURE_AI_BRIEF_BUILDER",
      featureFlagEnabled: false,
      dataModelStaged: true,
      nonAiModeAvailable: true,
      aiProviderConfigured: false,
      aiProviderImplemented: false,
      canAcceptSubmissions: false,
      canGenerateAiDrafts: false,
      readyForPublicLaunch: false,
      noIndex: true,
      adminRoute: labsAiBriefBuilderAdminRoute,
      apiRoute: labsAiBriefBuilderApiRoute,
    });
    expect(preview.modes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Structured non-AI mode",
          state: "available_for_private_design",
        }),
        expect.objectContaining({
          label: "AI-assisted draft mode",
          state: "blocked",
        }),
      ]),
    );
  });

  it("maps the consultative seven-step brief flow from the issue", () => {
    expect(labsAiBriefBuilderSections.map((section) => section.title)).toEqual([
      "The business problem",
      "The role reality",
      "The market reality",
      "The must-haves",
      "Salary/rate",
      "Urgency",
      "David's review",
    ]);

    const allQuestions = labsAiBriefBuilderSections
      .flatMap((section) => section.questions)
      .join(" ");

    expect(allQuestions).toContain("What has changed in the business?");
    expect(allQuestions).toContain("Permanent, interim or unsure?");
    expect(allQuestions).toContain("What salary or day-rate is actually approved?");
    expect(allQuestions).toContain("What should not be used until David approves it?");
  });

  it("keeps the hidden admin route noindexed and out of public sitemap output", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    const route = readFileSync(
      "app/admin/labs/ai-brief-builder/page.tsx",
      "utf8",
    );
    const labsAdmin = readFileSync("app/admin/labs/page.tsx", "utf8");
    const api = readFileSync(
      "app/api/recruiter-labs/brief-diagnostic/route.ts",
      "utf8",
    );

    expect(urls).not.toContain(`${siteConfig.url}${labsAiBriefBuilderAdminRoute}`);
    expect(route).toContain("isCmsSessionValid");
    expect(route).toContain("index: false");
    expect(route).toContain("No public launch");
    expect(route).not.toMatch(/analyticsAttributes|gtag|ga4|dataLayer/i);
    expect(labsAdmin).toContain("/admin/labs/ai-brief-builder");
    expect(api).toContain("status.canAcceptSubmissions");
  });

  it("stages the job_brief_requests compatibility model and review event trail", () => {
    const migration = readFileSync(
      "database/migrations/035_labs_ai_brief_builder_alignment.sql",
      "utf8",
    );

    for (const field of [
      "david_notes",
      "reviewed_by",
      "reviewed_at",
      "converted_at",
      "closed_at",
      "ai_mode",
      "sensitive_data_warning_acknowledged_at",
    ]) {
      expect(migration).toContain(field);
    }

    expect(migration).toContain(
      "recruiter_lab_ai_brief_builder_review_events",
    );
    expect(migration).toContain("create or replace view job_brief_requests");
    expect(migration).toContain("clientVisible");
    expect(migration).not.toMatch(
      /raw_prompt|api_key|access_token|secret|published_at|auto_publish/i,
    );
  });

  it("documents AI/non-AI mode, privacy controls and David review blockers", () => {
    const doc = readFileSync("docs/labs-ai-brief-builder.md", "utf8");
    const diagnosticDoc = readFileSync(
      "docs/recruiter-labs-ai-brief-diagnostic.md",
      "utf8",
    );
    const roadmap = readFileSync(
      "docs/essential-resourcing-labs-roadmap.md",
      "utf8",
    );
    const labsDoc = readFileSync("docs/essential-resourcing-labs.md", "utf8");
    const featureFlags = readFileSync("docs/feature-flags.md", "utf8");
    const readme = readFileSync("README.md", "utf8");

    for (const section of [
      "## Routes",
      "## Feature Flag",
      "## Brief Flow",
      "## AI And Non-AI Mode",
      "## Draft Outputs",
      "## Data Model",
      "## Data And Privacy Controls",
      "## Human Review Workflow",
      "## Testing Checklist",
      "## Blockers",
    ]) {
      expect(doc).toContain(section);
    }

    expect(doc).toContain("The job title is not the brief");
    expect(doc).toContain("AI should help ask better questions");
    expect(doc).toContain("No automatic publish");
    expect(doc).toContain("David review");
    expect(diagnosticDoc).toContain("docs/labs-ai-brief-builder.md");
    expect(roadmap).toContain("docs/labs-ai-brief-builder.md");
    expect(labsDoc).toContain("docs/labs-ai-brief-builder.md");
    expect(featureFlags).toContain("FEATURE_AI_BRIEF_BUILDER");
    expect(readme).toContain("docs/labs-ai-brief-builder.md");
  });
});
