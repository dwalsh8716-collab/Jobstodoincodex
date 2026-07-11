import { describe, expect, it } from "vitest";
import { caseStudies, insights, jobs, salarySnapshots, services } from "@/lib/content";
import {
  buildPublicSitemap,
  isPublicSitemapPath,
  normaliseCanonicalSiteUrl,
} from "@/lib/sitemap-engine";
import { normaliseSiteUrl } from "@/lib/site";
import type { Job } from "@/lib/types";

const now = new Date("2026-06-11T09:00:00.000Z");
const publicService = { ...services[0], status: "published" as const };
const publicInsight = { ...insights[0], status: "published" as const };
const publicCaseStudy = { ...caseStudies[0], status: "published" as const };
const publicSalarySnapshot = {
  ...salarySnapshots[0],
  status: "published" as const,
};

const liveJob: Job = {
  ...jobs[0],
  slug: "live-marketing-director",
  status: "live",
  salaryRange: "£80,000 to £90,000",
  salaryMin: 80000,
  salaryMax: 90000,
  salaryCurrency: "GBP",
  salaryPeriod: "annual",
  salaryVisibility: "public_range",
  rateMin: undefined,
  rateMax: undefined,
  ratePeriod: "to_be_confirmed",
  salary: "£80,000 to £90,000",
  salaryStatus: "verified",
  salaryTransparencyNote:
    "Range checked against the brief and current senior marketing market.",
  officeLocation: "Manchester",
  workingPattern: "Hybrid, two days in Manchester",
  hybridPattern: "Two days a week in Manchester, three days flexible.",
  remotePossible: "limited",
  hybridReality: "Two days a week in Manchester, three days flexible.",
  locationExpectation:
    "The person needs to be close enough to Manchester for senior meetings.",
  travelExpectation: "No regular travel beyond senior Manchester meetings.",
  agencyOrClientSide: "client-side",
  whyRoleExists:
    "The business needs a senior marketing leader to bring structure and pace.",
  whyThisRoleMatters:
    "The business needs a senior marketing leader to bring structure and pace.",
  summary:
    "A live senior marketing leadership role with clear scope and salary.",
  description: [
    "Lead the marketing function with commercial focus and practical judgement.",
  ],
  davidsTake: [
    "This needs someone who can make decisions, not just manage channels.",
  ],
  successInThreeMonths:
    "The team has clearer priorities and leadership rhythm.",
  successInSixMonths:
    "Reporting and planning are sharper across the marketing function.",
  successInTwelveMonths:
    "The business has a more confident senior marketing function.",
  responsibilities: ["Lead planning", "Improve reporting"],
  requirements: ["Senior marketing leadership"],
  whatGoodLooksLike: ["Clear priorities and a confident team"],
  benefits: ["Strong leadership access"],
  interviewSteps: ["First conversation with David", "Client leadership stage"],
  interviewProcessConfirmed: "confirmed",
  interviewProcess: ["First conversation with David", "Client leadership stage"],
  applicationProcess: [
    "David reviews the application directly.",
    "Nothing goes to the client without permission.",
  ],
  applicationProcessNotes:
    "David reviews profile links or short notes before any client introduction.",
  applicationNotes: "Send a short note about relevant senior marketing work.",
  candidatePrivacyNote:
    "Candidate details are handled under the Candidate Privacy Notice.",
  candidateDataHandling:
    "Candidate details are handled under the Candidate Privacy Notice.",
  quickQuestionRoute:
    "Candidates can message David with a sensible question before applying.",
  publishedDate: "2026-06-10",
  updatedDate: "2026-06-11",
};

function urls(entries: ReturnType<typeof buildPublicSitemap>) {
  return entries.map((entry) => entry.url);
}

describe("dynamic sitemap engine", () => {
  it("normalises production site URLs from env-style values", () => {
    expect(normaliseSiteUrl("https://www.essentialresourcing.co.uk/")).toBe(
      "https://www.essentialresourcing.co.uk",
    );
    expect(normaliseCanonicalSiteUrl("https://example.com///")).toBe(
      "https://example.com",
    );
    expect(normaliseSiteUrl("not-a-url")).toBe(
      "https://essentialresourcing.co.uk",
    );
  });

  it("defensively blocks private, preview and malformed paths", () => {
    expect(isPublicSitemapPath("/services")).toBe(true);
    expect(isPublicSitemapPath("/admin")).toBe(false);
    expect(isPublicSitemapPath("/recruiter-labs")).toBe(false);
    expect(isPublicSitemapPath("/client/shortlist/token")).toBe(false);
    expect(isPublicSitemapPath("/api/health")).toBe(false);
    expect(isPublicSitemapPath("/preview/draft")).toBe(false);
    expect(isPublicSitemapPath("//admin")).toBe(false);
    expect(isPublicSitemapPath("/jobs?draft=true")).toBe(false);
  });

  it("builds canonical entries while excluding noindexed and private content", () => {
    const sitemap = buildPublicSitemap({
      baseUrl: "https://www.essentialresourcing.co.uk/",
      launchPages: [
        "/",
        "/services",
        "/services/leadership-search",
        "/admin",
        "/recruiter-labs",
        "/client/shortlist/example",
      ],
      services: [
        publicService,
        { ...publicService, slug: "hidden-service", noIndex: true },
      ],
      insights: [
        publicInsight,
        { ...publicInsight, slug: "hidden-insight", noIndex: true },
        { ...publicInsight, slug: "draft-insight", status: "draft" },
      ],
      caseStudies: [
        publicCaseStudy,
        { ...publicCaseStudy, slug: "hidden-case-study", noIndex: true },
      ],
      salarySnapshots: [
        publicSalarySnapshot,
        {
          ...publicSalarySnapshot,
          slug: "hidden-salary-guide",
          contentFormat: "guide_landing_page",
          noIndex: true,
        },
      ],
      jobs: [liveJob, { ...liveJob, slug: "hidden-job", noIndex: true }],
      booking: { enabled: true, pagePath: "/book-a-call" },
      salaryGuide: { enabled: false, path: "/salary-guides" },
      now,
      referenceDate: now,
    });

    const builtUrls = urls(sitemap);

    expect(builtUrls).toContain("https://www.essentialresourcing.co.uk/");
    expect(builtUrls).toContain(
      "https://www.essentialresourcing.co.uk/services/leadership-search",
    );
    expect(builtUrls).toContain(
      `https://www.essentialresourcing.co.uk/insights/${publicInsight.slug}`,
    );
    expect(builtUrls).toContain(
      `https://www.essentialresourcing.co.uk/jobs/${liveJob.slug}`,
    );
    expect(builtUrls).toContain(
      "https://www.essentialresourcing.co.uk/book-a-call",
    );
    expect(builtUrls).not.toContain(
      "https://www.essentialresourcing.co.uk/admin",
    );
    expect(builtUrls.some((url) => url.includes("/client/shortlist"))).toBe(
      false,
    );
    expect(builtUrls.some((url) => url.includes("hidden-"))).toBe(false);
    expect(builtUrls).not.toContain(
      "https://www.essentialresourcing.co.uk/salary-guides",
    );
  });

  it("keeps closed and expired jobs out while allowing the approved salary guide gate", () => {
    const sitemap = buildPublicSitemap({
      baseUrl: "https://essentialresourcing.co.uk",
      launchPages: ["/", "/jobs"],
      services: [],
      insights: [],
      caseStudies: [],
      salarySnapshots: [],
      jobs: [
        liveJob,
        { ...liveJob, slug: "closed-job", status: "closed" },
        {
          ...liveJob,
          slug: "expired-job",
          closingDate: "2026-06-01",
        },
      ],
      salaryGuide: { enabled: true, path: "/salary-guides" },
      now,
      referenceDate: now,
    });

    const builtUrls = urls(sitemap);

    expect(builtUrls).toContain(
      "https://essentialresourcing.co.uk/jobs/live-marketing-director",
    );
    expect(builtUrls).toContain(
      "https://essentialresourcing.co.uk/salary-guides",
    );
    expect(builtUrls).not.toContain(
      "https://essentialresourcing.co.uk/jobs/closed-job",
    );
    expect(builtUrls).not.toContain(
      "https://essentialresourcing.co.uk/jobs/expired-job",
    );
  });
});
