import { isJobLive } from "./content";
import { absoluteUrl, jobPostingDescriptionHtml } from "./seo";
import { siteConfig } from "./site";
import type { Job } from "./types";

const xmlSafe = (value: string) =>
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "");

const xml = (value: string) =>
  xmlSafe(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const cdata = (value: string) => `<![CDATA[${xmlSafe(value).replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

const tag = (name: string, value: string | number | undefined, useCdata = false) =>
  value === undefined || value === ""
    ? ""
    : `<${name}>${useCdata ? cdata(String(value)) : xml(String(value))}</${name}>`;

export const canonicalJobUrl = (job: Pick<Job, "slug">) => absoluteUrl(`/jobs/${job.slug}`);

export const activeDistributionJobs = (jobs: Job[], now = new Date()) => {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    if (!job.slug || seen.has(job.slug) || !isJobLive(job, now) || job.noIndex) return false;
    seen.add(job.slug);
    return true;
  });
};

export const jobReference = (job: Job) => job.externalJobId || job.slug;

function salaryFields(job: Job) {
  if (job.salaryStatus !== "verified" || job.salaryVisibility !== "public_range") return "";
  return [
    tag("salaryMin", job.salaryMin),
    tag("salaryMax", job.salaryMax),
    tag("salaryCurrency", job.salaryCurrency),
    tag("salaryPeriod", job.salaryPeriod),
  ].join("");
}

export function buildUniversalJobsXml(jobs: Job[], now = new Date()) {
  const entries = activeDistributionJobs(jobs, now).map((job) => [
    "<job>",
    tag("id", jobReference(job)),
    tag("title", job.title),
    tag("description", jobPostingDescriptionHtml(job), true),
    tag("location", job.location),
    tag("region", job.locationRegion),
    tag("country", "GB"),
    tag("employer", job.hiringOrganizationName || "confidential"),
    tag("recruiter", siteConfig.name),
    salaryFields(job),
    tag("employmentType", job.employmentType),
    tag("workingPattern", job.workingPattern),
    tag("workplaceType", job.remotePossible === "yes" ? "remote" : job.remotePossible === "limited" ? "hybrid" : "on-site"),
    tag("category", job.specialism || job.sector),
    tag("seniority", job.seniority),
    tag("datePosted", job.postedDate || job.publishedDate),
    tag("dateModified", job.updatedDate || job.postedDate || job.publishedDate),
    tag("validThrough", job.closingDate),
    tag("url", canonicalJobUrl(job)),
    tag("applyUrl", canonicalJobUrl(job)),
    "</job>",
  ].join("")).join("");

  return `<?xml version="1.0" encoding="UTF-8"?><jobs source="${xml(siteConfig.name)}">${entries}</jobs>`;
}

// Talent confirmed that Essential Resourcing may be shown for confidential roles.
// Only send jobs whose published location identifies a real city and region.
export function buildTalentJobsXml(jobs: Job[], now = new Date()) {
  const entries = activeDistributionJobs(jobs, now)
    .filter((job) => {
      const parts = job.location.split(",").map((part) => part.trim());
      return parts.length === 3 && Boolean(parts[0] && parts[1]) && ["UK", "GB", "United Kingdom"].includes(parts[2]);
    })
    .map((job) => {
      const [city, region] = job.location.split(",").map((part) => part.trim());
      return [
        "<job>",
        tag("referencenumber", jobReference(job), true),
        tag("title", job.title, true),
        tag("company", siteConfig.name, true),
        tag("city", city, true),
        tag("region", region, true),
        tag("state", region, true),
        tag("country", "United Kingdom", true),
        tag("dateposted", job.postedDate || job.publishedDate, true),
        tag("url", canonicalJobUrl(job), true),
        tag("description", jobPostingDescriptionHtml(job), true),
        tag("jobtype", job.workingPattern, true),
        tag("isremote", job.remotePossible === "yes" ? "yes" : "no", true),
        "</job>",
      ].join("");
    }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?><source>${tag("publisher", siteConfig.name, true)}${tag("publisherurl", siteConfig.url, true)}${entries}</source>`;
}
