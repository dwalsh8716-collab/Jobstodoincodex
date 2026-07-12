import { describe, expect, it, vi } from "vitest";
import robots from "../../../app/robots";
import sitemap from "../../../app/sitemap";
import { isJobLive, jobs } from "@/lib/content";
import { launchPages, siteConfig } from "@/lib/site";

vi.mock("server-only", () => ({}));

describe("launch search setup", () => {
  it("keeps public launch pages in the sitemap", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    for (const path of launchPages) {
      expect(urls).toContain(`${siteConfig.url}${path}`);
    }
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
      allow: "/",
      disallow: [
        "/studio",
        "/cms",
        "/admin",
        "/labs",
        "/recruiter-labs",
        "/client",
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
    expect(disallow).not.toContain("/candidate");
    expect(disallow).not.toContain("/candidates");
    expect(disallow).not.toContain("/candidate-privacy");
  });
});
