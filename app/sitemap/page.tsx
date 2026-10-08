import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { specialisms } from "@/lib/content";
import {
  getPublicServices,
  getPublicInsights,
  getPublicCaseStudies,
  getPublicJobs,
  getPublicSalarySnapshots,
} from "@/lib/public-content";
import { createMetadata } from "@/lib/seo";
import { buildPublicSitemap } from "@/lib/sitemap-engine";
import { launchPages, siteConfig } from "@/lib/site";
import styles from "./sitemap.module.css";

export const metadata = createMetadata({
  title: "Sitemap | Essential Resourcing",
  description:
    "Find Essential Resourcing services, specialisms, current jobs, insights and useful information.",
  path: "/sitemap",
});

const pageNames: Record<string, string> = {
  "/": "Home",
  "/about-essential": "About Essential",
  "/about-david-walsh": "About David Walsh",
  "/clients": "Clients",
  "/candidates": "Candidates",
  "/services": "Services",
  "/how-essential-resourcing-works": "How Essential Resourcing Works",
  "/specialisms": "Specialisms",
  "/insights": "Insight",
  "/case-studies": "Case Studies",
  "/contact": "Contact",
  "/jobs": "Current Jobs",
  "/candidate-privacy": "Candidate Privacy",
  "/candidate-privacy/request": "Data Request",
  "/privacy-policy": "Privacy Policy",
  "/cookie-policy": "Cookie Policy",
  "/terms": "Terms",
  "/book-a-call": "Book a 15-minute call",
  "/salary-guides": "Salary Guides",
};

export default async function SitemapPage() {
  const [services, insights, caseStudies, jobs, salarySnapshots] =
    await Promise.all([
      getPublicServices(),
      getPublicInsights(),
      getPublicCaseStudies(),
      getPublicJobs(),
      getPublicSalarySnapshots(),
    ]);
  const entries = buildPublicSitemap({
    baseUrl: siteConfig.url,
    launchPages,
    services,
    insights,
    caseStudies,
    jobs,
    salarySnapshots,
    booking: siteConfig.booking,
    salaryGuide: {
      enabled: process.env.FEATURE_SALARY_GUIDE_GATE === "true",
      path: "/salary-guides",
    },
  });
  const names = { ...pageNames };
  for (const [prefix, items] of [
    ["services", services],
    ["insights", insights],
    ["case-studies", caseStudies],
    ["jobs", jobs],
    ["salary-snapshots", salarySnapshots],
  ] as const) {
    for (const item of items) names[`/${prefix}/${item.slug}`] = item.title;
  }
  for (const item of specialisms)
    names[`/specialisms/${item.slug}`] = item.title;
  const groups: Record<string, Array<{ href: string; label: string }>> = {
    "Essential Resourcing": [],
    Services: [],
    Specialisms: [],
    Jobs: [],
    "Insight & salary guides": [],
    "Case Studies": [],
    "Policies & privacy": [],
  };
  for (const entry of entries) {
    const href = new URL(entry.url).pathname;
    if (href === "/sitemap" || !names[href]) continue;
    const group = href.startsWith("/services")
      ? "Services"
      : href.startsWith("/specialisms")
        ? "Specialisms"
        : href.startsWith("/jobs")
          ? "Jobs"
          : href.startsWith("/insights") || href.startsWith("/salary-")
            ? "Insight & salary guides"
            : href.startsWith("/case-studies")
              ? "Case Studies"
              : /privacy|cookie|terms/.test(href)
                ? "Policies & privacy"
                : "Essential Resourcing";
    groups[group].push({ href, label: names[href] });
  }
  return (
    <>
      <Breadcrumbs items={[{ name: "Sitemap", href: "/sitemap" }]} />
      <section className="section surface">
        <div className="container">
          <div className="section-heading">
            <h1>Sitemap</h1>
            <p className="lede">Find your way around Essential Resourcing.</p>
          </div>
          <div className={styles.directory}>
            {Object.entries(groups)
              .filter(([, links]) => links.length)
              .map(([heading, links]) => (
                <section key={heading}>
                  <h2>{heading}</h2>
                  <ul>
                    {links.map(({ href, label }) => (
                      <li key={href}>
                        <Link href={href}>{label}</Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
