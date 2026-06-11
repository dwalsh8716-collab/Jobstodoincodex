import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CandidateProcessTimeline } from "@/components/CandidateProcessTimeline";

describe("candidate process timeline", () => {
  it("renders a confirmed process with timeline, task and feedback detail", () => {
    const html = renderToStaticMarkup(
      createElement(CandidateProcessTimeline, {
        processConfirmed: "confirmed",
        overview: "Client process confirmed with the hiring lead.",
        steps: [
          "Apply with a short note.",
          "David reviews.",
          "First client stage with the hiring lead.",
          "Final conversation.",
        ],
        expectedTimeline: "Two to three weeks if diaries line up.",
        taskRequired: "no",
        presentationRequired: "possible",
        firstStageFormat: "Video call with the hiring lead.",
        finalStageFormat: "In-person conversation with the founder.",
        feedbackExpectation: "David will share the next step when agreed.",
        applicationReviewTimeframe: "David reviews applications directly.",
      }),
    );

    expect(html).toContain("Confirmed process");
    expect(html).toContain("Two to three weeks");
    expect(html).toContain("Video call with the hiring lead");
    expect(html).toContain("Candidate Privacy Notice");
  });

  it("renders typical process wording when exact client stages are not confirmed", () => {
    const html = renderToStaticMarkup(
      createElement(CandidateProcessTimeline, {
        processConfirmed: "to_be_confirmed",
        steps: [],
        taskRequired: "to_be_confirmed",
        presentationRequired: "to_be_confirmed",
      }),
    );

    expect(html).toContain("Typical process, exact client stages to confirm");
    expect(html).toContain("Apply or send a LinkedIn/profile note");
    expect(html).toContain("To be confirmed");
  });

  it("wires the timeline into job pages and candidate confirmations", () => {
    const jobPage = readFileSync("app/jobs/[slug]/page.tsx", "utf8");
    const contactForm = readFileSync("src/components/ContactForm.tsx", "utf8");
    const css = readFileSync("app/globals.css", "utf8");

    expect(jobPage).toContain("CandidateProcessTimeline");
    expect(jobPage).toContain("job.processOverview");
    expect(contactForm).toContain("CandidateProcessTimeline");
    expect(contactForm).toContain("compact");
    expect(css).toContain(".candidate-process-timeline");
  });

  it("projects and models the Sanity process fields", () => {
    const schema = readFileSync("sanity/schemas/index.ts", "utf8");
    const queries = readFileSync("src/lib/sanity-queries.ts", "utf8");
    const sanityTypes = readFileSync("src/lib/sanity-types.ts", "utf8");
    const publicContent = readFileSync("src/lib/public-content.ts", "utf8");

    for (const field of [
      "processOverview",
      "processSteps",
      "expectedTimeline",
      "taskRequired",
      "presentationRequired",
      "firstStageFormat",
      "finalStageFormat",
      "feedbackExpectation",
      "applicationReviewTimeframe",
    ]) {
      expect(schema).toContain(field);
      expect(queries).toContain(field);
      expect(sanityTypes).toContain(field);
      expect(publicContent).toContain(field);
    }

    expect(schema).toContain("Do not promise steps that are not confirmed");
  });

  it("documents the exact-vs-typical process rule", () => {
    const docs = readFileSync(
      "docs/recruiter-labs-candidate-process-transparency.md",
      "utf8",
    );
    const editorGuide = readFileSync("docs/sanity-editor-guide.md", "utf8");
    const readme = readFileSync("README.md", "utf8");

    expect(docs).toContain("Do not pretend certainty");
    expect(docs).toContain("No false promises");
    expect(editorGuide).toContain("typical process for this kind of role");
    expect(readme).toContain(
      "docs/recruiter-labs-candidate-process-transparency.md",
    );
  });
});
