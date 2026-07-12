import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { aiSearchQuestions, jobs, services } from "@/lib/content";
import {
  absoluteUrl,
  breadcrumbSchema,
  createMetadata,
  itemListSchema,
  jobPostingDescriptionHtml,
  jobPostingSchema,
  serviceSchema,
} from "@/lib/seo";

describe("metadata helpers", () => {
  it("creates absolute canonical and open graph URLs", () => {
    const metadata = createMetadata({
      title: "Test title",
      description: "Test description",
      path: "/services/strategic-interim",
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://essentialresourcing.co.uk/services/strategic-interim",
    );
    const openGraphImages = metadata.openGraph?.images;
    const firstImage = Array.isArray(openGraphImages)
      ? openGraphImages[0]
      : openGraphImages;

    expect(firstImage).toMatchObject({
      width: 1200,
      height: 630,
    });
  });

  it("respects noindex metadata", () => {
    const metadata = createMetadata({
      title: "Private",
      description: "Private page",
      noIndex: true,
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});

describe("structured data builders", () => {
  it("builds service schema with an absolute URL", () => {
    const service = services.find((item) => item.slug === "strategic-interim");
    expect(service).toBeDefined();

    const schema = serviceSchema(service!);
    expect(schema).toMatchObject({
      "@type": "Service",
      url: absoluteUrl("/services/strategic-interim"),
      serviceOutput: service!.searchSummary,
    });
    expect(schema.keywords).toContain("strategic interim marketing leader");
  });

  it("builds breadcrumb positions in order", () => {
    const schema = breadcrumbSchema([
      { name: "Home", href: "/" },
      { name: "Services", href: "/services" },
    ]);

    expect(schema.itemListElement).toEqual([
      expect.objectContaining({ position: 1, name: "Home" }),
      expect.objectContaining({ position: 2, name: "Services" }),
    ]);
  });

  it("builds item lists from visible page items only", () => {
    const schema = itemListSchema({
      name: "Visible services",
      items: [
        {
          name: "Strategic Interim",
          url: "/services/strategic-interim",
          description: "Senior interim support.",
        },
      ],
    });

    expect(schema).toMatchObject({
      "@type": "ItemList",
      name: "Visible services",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          url: absoluteUrl("/services/strategic-interim"),
          name: "Strategic Interim",
          description: "Senior interim support.",
        },
      ],
    });
  });

  it("builds job posting schema without exposing draft as live state", () => {
    const job = {
      ...jobs[0],
      employmentType: "Permanent full-time",
      postedDate: "2026-06-10",
      publishedDate: "2026-06-10",
      updatedDate: "2026-06-10",
    };
    const schema = jobPostingSchema(job);

    expect(schema).toMatchObject({
      "@type": "JobPosting",
      title: job.title,
      url: absoluteUrl(`/jobs/${job.slug}`),
      datePosted: "2026-06-10",
      employmentType: "FULL_TIME",
      directApply: true,
    });
    expect(schema.description).toContain("<p><strong>Summary:</strong>");
    expect(schema.description).toContain("Responsibilities");
  });

  it("builds a full HTML job description from visible advert sections", () => {
    const description = jobPostingDescriptionHtml({
      ...jobs[0],
      summary: "Clear summary.",
      description: ["Plain role overview."],
      responsibilities: ["Lead the work."],
      mustHaves: ["Senior PR judgement."],
      niceToHaves: ["Agency experience."],
      whatGoodLooksLike: ["Clients feel well led."],
      requirements: ["Relevant experience."],
      benefits: ["Direct process with David."],
      salaryRange: "GBP 55,000 to GBP 65,000",
      salaryTransparencyNote: "Salary confirmed with the client.",
    });

    expect(description).toContain("<ul>");
    expect(description).toContain("Must-haves");
    expect(description).toContain("Salary or rate");
    expect(description).not.toContain("<script");
  });

  it("omits salary schema when pay is not publishable", () => {
    const schema = jobPostingSchema({
      ...jobs[0],
      salaryVisibility: "confidential",
      salaryStatus: "verified",
      salaryMin: 55000,
      salaryMax: 65000,
      salaryPeriod: "annual",
    });

    expect(schema).not.toHaveProperty("baseSalary");
  });

  it("omits fixed project fees from salary schema rather than using a non-standard unit", () => {
    const schema = jobPostingSchema({
      ...jobs[0],
      salaryRange: "GBP 8,000 fixed project fee",
      salaryVisibility: "public_range",
      salaryStatus: "verified",
      salaryMin: 8000,
      salaryMax: 8000,
      salaryPeriod: "fixed",
    });

    expect(schema).not.toHaveProperty("baseSalary");
  });

  it("uses publishable rate fields for interim JobPosting salary", () => {
    const schema = jobPostingSchema({
      ...jobs[0],
      salaryRange: "GBP 500 to GBP 650 per day",
      salaryVisibility: "public_range",
      salaryStatus: "verified",
      salaryMin: undefined,
      salaryMax: undefined,
      salaryCurrency: "GBP",
      rateMin: 500,
      rateMax: 650,
      ratePeriod: "daily",
    });

    expect(schema).toMatchObject({
      baseSalary: {
        currency: "GBP",
        value: {
          minValue: 500,
          maxValue: 650,
          unitText: "DAY",
        },
      },
    });
  });
});

describe("SEO and AI visibility audit", () => {
  it("keeps priority recruitment search intent explicit without fake proof", () => {
    const clientSide = services.find(
      (item) => item.slug === "client-side-marketing-recruitment",
    );
    const agency = services.find((item) => item.slug === "agency-recruitment");
    const leadership = services.find(
      (item) => item.slug === "leadership-search",
    );
    const questions = aiSearchQuestions
      .map((item) => `${item.question} ${item.answer}`)
      .join("\n");
    const audit = readFileSync("docs/SEO-AI-VISIBILITY-AUDIT.md", "utf8");

    expect(clientSide?.seoTitle).toContain("Marketing Recruitment Manchester");
    expect(clientSide?.searchPhrases).toContain(
      "marketing recruitment Manchester",
    );
    expect(agency?.searchPhrases).toEqual(
      expect.arrayContaining([
        "PR recruitment Manchester",
        "digital recruitment North West",
        "media recruitment North West",
      ]),
    );
    expect(leadership?.searchPhrases).toContain(
      "exclusive recruitment partner",
    );
    expect(questions).toContain(
      "Who handles marketing recruitment in Manchester?",
    );
    expect(questions).toContain("PR recruitment in Manchester");
    expect(audit).toContain("SEO Executive Summary");
    expect(audit).toContain("AI/LLM Visibility Recommendations");
    expect(audit).toContain("No generic SEO waffle");
  });
});
