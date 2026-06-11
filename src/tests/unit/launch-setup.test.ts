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

  it("points robots at the sitemap and blocks private routes", () => {
    const rules = robots();

    expect(rules.sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
    expect(rules.rules).toMatchObject({
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/cms", "/admin", "/labs", "/client", "/api"],
    });
  });
});
