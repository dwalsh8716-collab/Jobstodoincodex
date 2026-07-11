import type { MetadataRoute } from "next";
import { isJobLive } from "./content";
import type { CaseStudy, Insight, Job, SalarySnapshot, Service } from "./types";

type SitemapEntry = MetadataRoute.Sitemap[number];
type ChangeFrequency = SitemapEntry["changeFrequency"];

type SitemapContent = {
  baseUrl: string;
  launchPages: readonly string[];
  services: Service[];
  insights: Insight[];
  caseStudies: CaseStudy[];
  salarySnapshots: SalarySnapshot[];
  jobs: Job[];
  booking?: {
    enabled: boolean;
    pagePath: string;
  };
  salaryGuide?: {
    enabled: boolean;
    path: string;
  };
  now?: Date;
  referenceDate?: Date;
};

type SitemapContentItem = {
  noIndex?: boolean;
  status?: string;
};

export const privateSitemapPathPrefixes = [
  "/admin",
  "/api",
  "/cms",
  "/client",
  "/labs",
  "/recruiter-labs",
  "/studio",
  "/preview",
] as const;

export const defaultCanonicalSiteUrl = "https://essentialresourcing.co.uk";

export function normaliseCanonicalSiteUrl(
  value: string | undefined,
  fallback = defaultCanonicalSiteUrl,
) {
  if (!value) return fallback;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return fallback;
    return url.origin.replace(/\/+$/, "");
  } catch {
    return fallback;
  }
}

export function isPublicSitemapPath(path: string) {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("?") || path.includes("#")) return false;

  return !privateSitemapPathPrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

function isPublishedPublicItem(item: SitemapContentItem) {
  return item.status !== "draft" && !item.noIndex;
}

function parseSitemapDate(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function buildEntry({
  baseUrl,
  path,
  lastModified,
  changeFrequency = "monthly",
  priority = 0.65,
}: {
  baseUrl: string;
  path: string;
  lastModified?: Date;
  changeFrequency?: ChangeFrequency;
  priority?: number;
}): SitemapEntry | undefined {
  if (!isPublicSitemapPath(path)) return undefined;

  return {
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  };
}

export function buildPublicSitemap({
  baseUrl,
  launchPages,
  services,
  insights,
  caseStudies,
  salarySnapshots,
  jobs,
  booking,
  salaryGuide,
  now = new Date(),
  referenceDate = now,
}: SitemapContent): MetadataRoute.Sitemap {
  const canonicalBaseUrl = normaliseCanonicalSiteUrl(baseUrl);
  const entries = new Map<string, SitemapEntry>();

  const addEntry = ({
    path,
    lastModified = now,
    changeFrequency = "monthly",
    priority = 0.65,
  }: {
    path: string;
    lastModified?: Date;
    changeFrequency?: ChangeFrequency;
    priority?: number;
  }) => {
    const entry = buildEntry({
      baseUrl: canonicalBaseUrl,
      path,
      lastModified,
      changeFrequency,
      priority,
    });

    if (entry) entries.set(path, entry);
  };

  launchPages.forEach((path) => {
    addEntry({
      path,
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : 0.75,
    });
  });

  if (booking?.enabled) {
    addEntry({
      path: booking.pagePath,
      changeFrequency: "monthly",
      priority: 0.78,
    });
  }

  if (salaryGuide?.enabled) {
    addEntry({
      path: salaryGuide.path,
      changeFrequency: "monthly",
      priority: 0.72,
    });
  }

  services.filter(isPublishedPublicItem).forEach((service) => {
    addEntry({
      path: `/services/${service.slug}`,
      priority: 0.82,
    });
  });

  insights
    .filter((insight) => insight.status === "published" && !insight.noIndex)
    .forEach((insight) => {
      addEntry({
        path: `/insights/${insight.slug}`,
        lastModified:
          parseSitemapDate(insight.updatedDate) ||
          parseSitemapDate(insight.publishedDate) ||
          now,
        changeFrequency: "weekly",
        priority: 0.72,
      });
    });

  caseStudies
    .filter((caseStudy) => caseStudy.status === "published" && !caseStudy.noIndex)
    .forEach((caseStudy) => {
      addEntry({
        path: `/case-studies/${caseStudy.slug}`,
        priority: 0.7,
      });
    });

  salarySnapshots
    .filter((snapshot) => snapshot.status === "published" && !snapshot.noIndex)
    .forEach((snapshot) => {
      addEntry({
        path: `/salary-snapshots/${snapshot.slug}`,
        priority: 0.68,
      });
    });

  jobs
    .filter((job) => isJobLive(job, referenceDate) && !job.noIndex)
    .forEach((job) => {
      addEntry({
        path: `/jobs/${job.slug}`,
        lastModified:
          parseSitemapDate(job.updatedDate) ||
          parseSitemapDate(job.publishedDate),
        changeFrequency: "daily",
        priority: 0.7,
      });
    });

  return Array.from(entries.values());
}
