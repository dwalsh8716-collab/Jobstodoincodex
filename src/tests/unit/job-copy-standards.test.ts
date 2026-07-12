import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { schemaTypes } from "../../../sanity/schemas";

describe("job copy standards", () => {
  it("keeps the public Sanity job schema explicit and candidate-friendly", () => {
    const jobSchema = schemaTypes.find((schema) => schema.name === "job") as
      | { fields?: Array<{ name?: string }> }
      | undefined;
    const fieldNames = jobSchema?.fields?.map((field) => field.name) ?? [];

    expect(fieldNames).toEqual(
      expect.arrayContaining([
        "title",
        "slug",
        "status",
        "salaryRange",
        "salaryMin",
        "salaryMax",
        "salaryCurrency",
        "salaryPeriod",
        "salaryVisibility",
        "rateMin",
        "rateMax",
        "ratePeriod",
        "salaryStatus",
        "workingPattern",
        "location",
        "officeLocation",
        "hybridPattern",
        "remotePossible",
        "travelExpectation",
        "roleType",
        "seniority",
        "sector",
        "agencyOrClientSide",
        "successInThreeMonths",
        "successInSixMonths",
        "successInTwelveMonths",
        "interviewSteps",
        "interviewProcessConfirmed",
        "processOverview",
        "processSteps",
        "expectedTimeline",
        "taskRequired",
        "presentationRequired",
        "firstStageFormat",
        "finalStageFormat",
        "feedbackExpectation",
        "applicationReviewTimeframe",
        "applicationProcessNotes",
        "davidsTake",
        "whyRoleExists",
        "mustHaves",
        "niceToHaves",
        "whatGoodLooksLike",
        "applicationNotes",
        "applicationFormEnabled",
        "candidatePrivacyNote",
        "quickQuestionEnabled",
        "whatsappQuestionEnabled",
        "postedDate",
        "updatedDate",
        "seoTitle",
        "metaDescription",
      ]),
    );
  });

  it("documents the plain-English job copy rules and privacy boundary", () => {
    const standards = readFileSync("docs/job-copy-standards.md", "utf8");
    const editorGuide = readFileSync("docs/sanity-editor-guide.md", "utf8");
    const readme = readFileSync("README.md", "utf8");

    expect(standards).toContain("No fake numbers");
    expect(standards).toContain("David's Take");
    expect(standards).toContain("competitive salary");
    expect(standards).toContain("salary visibility");
    expect(standards).toContain("travel expectation");
    expect(standards).toContain("Success Indicator Rules");
    expect(standards).toContain("Google Jobs Rules");
    expect(standards).toContain("Rich Results Test");
    expect(standards).toContain("Private candidate and application records");
    expect(editorGuide).toContain("docs/job-copy-standards.md");
    expect(readme).toContain("docs/job-copy-standards.md");
  });
});
