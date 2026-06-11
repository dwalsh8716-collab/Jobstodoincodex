import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getSanityCoreSchemaCoverage } from "@/lib/sanity-core";

const schemaSource = readFileSync("sanity/schemas/index.ts", "utf8");
const querySource = readFileSync("src/lib/sanity-queries.ts", "utf8");
const typeSource = readFileSync("src/lib/sanity-types.ts", "utf8");
const cmsArchitectureDoc = readFileSync("docs/CMS-ARCHITECTURE.md", "utf8");
const editorGuide = readFileSync("docs/sanity-editor-guide.md", "utf8");

function schemaChunk(schemaConstName: string) {
  const start = schemaSource.indexOf(`const ${schemaConstName} = defineType`);
  expect(start).toBeGreaterThanOrEqual(0);

  const nextConst = schemaSource.indexOf("\nconst ", start + 1);
  const end =
    nextConst === -1
      ? schemaSource.indexOf("\nexport const schemaTypes")
      : nextConst;

  return schemaSource.slice(start, end);
}

describe("Sanity CMS core", () => {
  it("documents the issue 90 core schema coverage without duplicate models", () => {
    const coverage = getSanityCoreSchemaCoverage();

    expect(coverage.requiredCount).toBe(10);
    expect(coverage.documents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          requirement: "Post",
          schemaType: "insight",
        }),
        expect.objectContaining({
          requirement: "Author",
          schemaType: "person",
        }),
        expect.objectContaining({
          requirement: "Footer",
          schemaType: "siteSettings",
        }),
        expect.objectContaining({
          requirement: "SalaryGuide",
          schemaType: "salarySnapshot",
        }),
      ]),
    );
    expect(coverage.privateDataPolicy.publicCms).toMatch(/public website/i);
    expect(coverage.privateDataPolicy.privateStore).toMatch(
      /Railway Postgres/i,
    );
  });

  it("keeps each covered schema type present in Sanity", () => {
    const coverage = getSanityCoreSchemaCoverage();

    for (const item of coverage.documents) {
      expect(schemaSource).toContain(`name: "${item.schemaType}"`);
    }
    expect(schemaSource).not.toContain('name: "candidate"');
    expect(schemaSource).not.toContain('name: "application"');
    expect(schemaSource).not.toContain('name: "cv"');
  });

  it("adds preview configuration to the main editor-facing document types", () => {
    const schemaConstNames = [
      "siteSettings",
      "homePage",
      "navigation",
      "page",
      "service",
      "job",
      "insight",
      "caseStudy",
      "salarySnapshot",
      "testimonial",
      "faq",
      "person",
      "ctaBlock",
      "proofItem",
    ];

    for (const schemaConstName of schemaConstNames) {
      expect(schemaChunk(schemaConstName)).toContain("preview:");
    }
  });

  it("keeps salary guide content public and separate from gated lead data", () => {
    const salarySchema = schemaChunk("salarySnapshot");

    expect(salarySchema).toContain('title: "Salary Guide / Snapshot"');
    expect(salarySchema).toContain('name: "contentFormat"');
    expect(salarySchema).toContain("Salary guide landing page");
    expect(querySource).toContain("contentFormat");
    expect(typeSource).toContain(
      'contentFormat?: "snapshot" | "guide_landing_page";',
    );
    expect(salarySchema).not.toMatch(/leadEmail|downloadToken|gatedLead/i);
  });

  it("projects the public job advert transparency fields from Sanity", () => {
    for (const field of [
      "salaryStatus",
      "salaryCurrency",
      "salaryVisibility",
      "rateMin",
      "rateMax",
      "ratePeriod",
      "salaryTransparencyNote",
      "hybridReality",
      "locationExpectation",
      "travelExpectation",
      "successInThreeMonths",
      "successInSixMonths",
      "successInTwelveMonths",
      "mustHaves",
      "niceToHaves",
      "interviewProcess",
      "processOverview",
      "processSteps",
      "expectedTimeline",
      "taskRequired",
      "presentationRequired",
      "firstStageFormat",
      "finalStageFormat",
      "feedbackExpectation",
      "applicationReviewTimeframe",
      "applicationProcess",
      "applicationProcessNotes",
      "candidateDataHandling",
      "quickQuestionRoute",
    ]) {
      expect(querySource).toContain(field);
      expect(typeSource).toContain(field);
    }
  });

  it("explains the Post, Author, Footer and SalaryGuide mapping for editors", () => {
    expect(cmsArchitectureDoc).toContain("Post requirement");
    expect(cmsArchitectureDoc).toContain("Author requirement");
    expect(cmsArchitectureDoc).toContain("Footer requirement");
    expect(cmsArchitectureDoc).toContain("SalaryGuide requirement");
    expect(editorGuide).toContain("Insights / Posts");
    expect(editorGuide).toContain("Authors / David Walsh / Team");
    expect(editorGuide).toContain("Salary Guides / Snapshots");
  });
});
