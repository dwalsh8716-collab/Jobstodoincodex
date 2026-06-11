import type { MetadataRoute } from "next";
import {
  getPublicCaseStudies,
  getPublicInsights,
  getPublicJobs,
  getPublicSalarySnapshots,
  getPublicServices,
} from "@/lib/public-content";
import { buildPublicSitemap } from "@/lib/sitemap-engine";
import { launchPages, siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, insights, caseStudies, salarySnapshots, jobs] =
    await Promise.all([
      getPublicServices(),
      getPublicInsights(),
      getPublicCaseStudies(),
      getPublicSalarySnapshots(),
      getPublicJobs(),
    ]);

  return buildPublicSitemap({
    baseUrl: siteConfig.url,
    launchPages,
    services,
    insights,
    caseStudies,
    salarySnapshots,
    jobs,
    booking: siteConfig.booking,
    salaryGuide: {
      enabled: process.env.FEATURE_SALARY_GUIDE_GATE === "true",
      path: "/salary-guides",
    },
  });
}
