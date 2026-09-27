import { describe, expect, it, vi } from "vitest";
import robots from "../../../app/robots";
import sitemap from "../../../app/sitemap";
import {
  caseStudies,
  insightCategories,
  insights,
  isJobLive,
  jobs,
} from "@/lib/content";
import { launchPages, siteConfig } from "@/lib/site";

vi.mock("server-only", () => ({}));

describe("launch search setup", () => {
  it("keeps public launch pages in the sitemap", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    for (const path of launchPages) {
      expect(urls).toContain(`${siteConfig.url}${path}`);
    }
  });

  it("includes approved insight articles and keeps launch categories populated", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    const approvedArticleSlugs = [
      "marketing-recruitment-manchester-north-west-guide",
      "retained-search-vs-contingent-recruitment",
      "how-much-does-senior-marketing-recruitment-cost",
      "the-job-title-isnt-the-brief-senior-marketing-hire",
      "marketing-recruitment-market-isnt-dead-businesses-hiring-differently",
      "what-should-you-pay-a-senior-marketing-hire-in-2026",
      "do-you-actually-need-a-full-time-marketing-director",
      "your-cv-tells-me-where-youve-worked-what-you-actually-did",
      "why-hiring-senior-agency-people-is-harder-than-matching-clients-and-job-titles",
      "your-first-marketing-director-what-should-you-actually-be-hiring-for",
    ];

    for (const slug of approvedArticleSlugs) {
      expect(urls).toContain(`${siteConfig.url}/insights/${slug}`);
    }

    const liveCategories = new Set(
      insights
        .filter((insight) => insight.status === "published")
        .map((insight) => insight.category),
    );

    for (const category of insightCategories.filter(
      (item) => item !== "Case studies",
    )) {
      expect(liveCategories).toContain(category);
    }
  });

  it("includes approved case studies and keeps the case study category populated", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    const approvedCaseStudySlug =
      "havas-media-manchester-managing-partner-james-reddington";

    expect(urls).toContain(
      `${siteConfig.url}/case-studies/${approvedCaseStudySlug}`,
    );
    expect(
      caseStudies.some(
        (caseStudy) =>
          caseStudy.slug === approvedCaseStudySlug &&
          caseStudy.status === "published" &&
          !caseStudy.noIndex,
      ),
    ).toBe(true);
  });

  it("keeps draft jobs out of the sitemap", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    const draftJobs = jobs.filter((job) => !isJobLive(job));

    for (const job of draftJobs) {
      expect(urls).not.toContain(`${siteConfig.url}/jobs/${job.slug}`);
    }
  });

  it("keeps the salary guide gate out of the sitemap until approved", async () => {
    const originalFlag = process.env.FEATURE_SALARY_GUIDE_GATE;

    process.env.FEATURE_SALARY_GUIDE_GATE = "false";
    expect((await sitemap()).map((entry) => entry.url)).not.toContain(
      `${siteConfig.url}/salary-guides`,
    );

    process.env.FEATURE_SALARY_GUIDE_GATE = "true";
    expect((await sitemap()).map((entry) => entry.url)).toContain(
      `${siteConfig.url}/salary-guides`,
    );

    if (originalFlag === undefined) {
      delete process.env.FEATURE_SALARY_GUIDE_GATE;
    } else {
      process.env.FEATURE_SALARY_GUIDE_GATE = originalFlag;
    }
  });

  it("points robots at the sitemap and blocks private routes", () => {
    const rules = robots();

    expect(rules.sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
    expect(rules.rules).toMatchObject({
      userAgent: "*",
      allow: ["/", "/clients", "/clients/"],
      disallow: [
        "/studio",
        "/cms",
        "/admin",
        "/labs",
        "/recruiter-labs",
        "/candidate/",
        "/api",
      ],
    });
  });

  it("keeps public candidate pages crawlable while blocking private token routes", () => {
    const rules = robots();
    const disallow = Array.isArray(rules.rules)
      ? rules.rules.flatMap((rule) => rule.disallow || [])
      : rules.rules.disallow || [];

    expect(disallow).toContain("/candidate/");
    expect(disallow).not.toContain("/client");
    expect(disallow).not.toContain("/client/");
    expect(disallow).not.toContain("/clients");
    expect(disallow).not.toContain("/candidate");
    expect(disallow).not.toContain("/candidates");
    expect(disallow).not.toContain("/candidate-privacy");
  });
});
