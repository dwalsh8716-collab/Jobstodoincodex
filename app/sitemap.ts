import type { MetadataRoute } from "next";
import { caseStudies, insights, jobs, salarySnapshots, services } from "@/lib/content";
import { launchPages, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const seen = new Set<string>();
  const unique = (paths: string[]) =>
    paths.filter((path) => {
      if (seen.has(path)) return false;
      seen.add(path);
      return true;
    });

  const staticPages = unique([...launchPages]).map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.75
  }));

  const dynamicPages = unique([
    ...services.map((item) => `/services/${item.slug}`),
    ...insights.filter((item) => item.status === "published").map((item) => `/insights/${item.slug}`),
    ...caseStudies.filter((item) => item.status === "published").map((item) => `/case-studies/${item.slug}`),
    ...salarySnapshots.filter((item) => item.status === "published").map((item) => `/salary-snapshots/${item.slug}`),
    ...jobs.filter((item) => item.status === "live").map((item) => `/jobs/${item.slug}`)
  ]).map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.65
  }));

  return [...staticPages, ...dynamicPages];
}
