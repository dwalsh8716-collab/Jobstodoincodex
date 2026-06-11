import type { MetadataRoute } from "next";
import { isJobLive } from "@/lib/content";
import {
  getPublicCaseStudies,
  getPublicInsights,
  getPublicJobs,
  getPublicSalarySnapshots,
  getPublicServices,
} from "@/lib/public-content";
import { launchPages, siteConfig } from "@/lib/site";

type SitemapEntry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, insights, caseStudies, salarySnapshots, jobs] =
    await Promise.all([
      getPublicServices(),
      getPublicInsights(),
      getPublicCaseStudies(),
      getPublicSalarySnapshots(),
      getPublicJobs(),
    ]);
  const now = new Date();
  const entries = new Map<string, SitemapEntry>();

  const addEntry = ({
    path,
    lastModified = now,
    changeFrequency = "monthly",
    priority = 0.65,
  }: {
    path: string;
    lastModified?: Date;
    changeFrequency?: SitemapEntry["changeFrequency"];
    priority?: number;
  }) => {
    entries.set(path, {
      url: `${siteConfig.url}${path}`,
      lastModified,
      changeFrequency,
      priority,
    });
  };

  launchPages.forEach((path) => {
    addEntry({
      path,
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : 0.75,
    });
  });

  if (siteConfig.booking.enabled) {
    addEntry({
      path: siteConfig.booking.pagePath,
      changeFrequency: "monthly",
      priority: 0.78,
    });
  }

  services.forEach((service) => {
    addEntry({
      path: `/services/${service.slug}`,
      priority: 0.82,
    });
  });

  insights
    .filter((insight) => insight.status === "published")
    .forEach((insight) => {
      addEntry({
        path: `/insights/${insight.slug}`,
        lastModified: new Date(insight.updatedDate),
        changeFrequency: "weekly",
        priority: 0.72,
      });
    });

  caseStudies
    .filter((caseStudy) => caseStudy.status === "published")
    .forEach((caseStudy) => {
      addEntry({
        path: `/case-studies/${caseStudy.slug}`,
        priority: 0.7,
      });
    });

  salarySnapshots
    .filter((snapshot) => snapshot.status === "published")
    .forEach((snapshot) => {
      addEntry({
        path: `/salary-snapshots/${snapshot.slug}`,
        priority: 0.68,
      });
    });

  jobs
    .filter((job) => isJobLive(job))
    .forEach((job) => {
      addEntry({
        path: `/jobs/${job.slug}`,
        lastModified: new Date(job.publishedDate),
        changeFrequency: "daily",
        priority: 0.7,
      });
    });

  return Array.from(entries.values());
}
