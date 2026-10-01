import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { JobListingCard } from "@/components/JobListingCard";
import { jobs, isJobLive } from "@/lib/content";
import { fallbackContentHubPages } from "@/lib/content-hub-pages";

vi.mock("@/lib/public-content", () => ({
  getPublicContentHubPages: vi.fn(),
  getPublicJobs: vi.fn(),
}));
vi.mock("@/lib/content", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/content")>()),
  isJobLive: vi.fn(),
}));

const job = {
  ...jobs[0],
  title: "Biddable Account Director / Senior Account Director",
  status: "live" as const,
  noIndex: false,
  postedDate: "2020-01-01",
  publishedDate: "2020-01-01",
  closingDate: "2099-12-01",
  salaryVisibility: "public_range" as const,
  salaryRange: "£50,000 per year",
  employmentType: "permanent-full-time",
  hiringOrganizationName: "DO NOT EXPOSE THIS CLIENT",
};

describe("jobs index presentation", () => {
  it("shows canonical public details without internal status or client data", () => {
    const html = renderToStaticMarkup(createElement(JobListingCard, { job }));
    expect(html).toContain(job.title);
    expect(html).toContain(job.salaryRange);
    expect(html).toContain("Permanent, full-time");
    expect(html).toContain(`/jobs/${job.slug}`);
    expect(html).not.toContain(job.hiringOrganizationName);
    expect(html).not.toContain("Process:");
    expect(html).not.toContain("Salary: verified");
  });

  it("does not expose a confidential salary and qualifies indicative pay", () => {
    const hidden = renderToStaticMarkup(
      createElement(JobListingCard, {
        job: { ...job, salaryVisibility: "confidential" },
      }),
    );
    expect(hidden).not.toContain(job.salaryRange);
    expect(hidden).toContain("Speak to David about the salary");
    const indicative = renderToStaticMarkup(
      createElement(JobListingCard, {
        job: { ...job, salaryVisibility: "indicative_range" },
      }),
    );
    expect(indicative).toContain("Indicative range");
  });

  it.each([0, 1, 2, 6, 12])(
    "renders %i roles selected by the canonical lifecycle helper",
    async (count) => {
      vi.mocked(isJobLive).mockReset().mockReturnValue(false);
      for (let i = 0; i < count; i++)
        vi.mocked(isJobLive).mockReturnValueOnce(true);
      const { getPublicContentHubPages, getPublicJobs } =
        await import("@/lib/public-content");
      vi.mocked(getPublicContentHubPages).mockResolvedValue({
        jobs: fallbackContentHubPages.jobs ?? {},
        insights: fallbackContentHubPages.insights ?? {},
        caseStudies: fallbackContentHubPages.caseStudies ?? {},
      });
      vi.mocked(getPublicJobs).mockResolvedValue([
        ...Array.from({ length: count }, (_, i) => ({
          ...job,
          slug: `test-${i}`,
        })),
        { ...job, slug: "closed", status: "closed" },
        { ...job, slug: "draft", status: "draft" },
        { ...job, slug: "expired", closingDate: "2020-01-02" },
      ]);
      const { default: JobsPage } = await import("../../../app/jobs/page");
      const html = renderToStaticMarkup(await JobsPage());
      expect(isJobLive).toHaveBeenCalledTimes(count + 3);
      expect((html.match(/aria-label="View role:/g) || []).length).toBe(count);
      expect(html).not.toContain('href="/jobs/closed"');
      expect(html).not.toContain('href="/jobs/draft"');
      expect(html).not.toContain('href="/jobs/expired"');
      expect(html).not.toContain('"@type":"JobPosting"');
      expect(html).toContain("/candidates#candidate-contact");
      if (count === 0)
        expect(html).toContain("No live roles published right now.");
      else expect(html).toContain('"@type":"ItemList"');
    },
  );
});
