import type { Metadata } from "next";
import { siteConfig } from "./site";
import type { FAQ, Insight, Job, Service } from "./types";

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalizedPath}`;
}

export function createMetadata({
  title,
  description,
  path = "/",
  image = siteConfig.ogImage,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} - ${description}`,
        },
      ],
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function organisationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl(siteConfig.logoDark),
    areaServed: ["Manchester", "North West England", "United Kingdom"],
    founder: { "@type": "Person", name: siteConfig.founder },
    description: siteConfig.defaultDescription,
    keywords: [
      "marketing recruitment Manchester",
      "PR recruitment Manchester",
      "digital recruitment North West",
      "media recruitment North West",
      "retained marketing recruitment",
      "strategic interim marketing leader",
    ],
    ...(siteConfig.phone ? { telephone: siteConfig.phone } : {}),
    ...(siteConfig.linkedIn ? { sameAs: [siteConfig.linkedIn] } : {}),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Recruitment enquiries",
      email: siteConfig.email,
      ...(siteConfig.phone ? { telephone: siteConfig.phone } : {}),
      areaServed: "GB",
    },
  };
}

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.founder,
    jobTitle: "Founder",
    worksFor: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    url: absoluteUrl("/about-david-walsh"),
    ...(siteConfig.linkedIn ? { sameAs: [siteConfig.linkedIn] } : {}),
    knowsAbout: [
      "Marketing recruitment",
      "PR recruitment",
      "Communications recruitment",
      "Digital recruitment",
      "Leadership search",
      "Strategic interim",
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    publisher: { "@type": "Organization", name: siteConfig.name },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; href: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

export function itemListSchema({
  name,
  description,
  items,
}: {
  name: string;
  description?: string;
  items: Array<{ name: string; url: string; description?: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    ...(description ? { description } : {}),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(item.url),
      name: item.name,
      ...(item.description ? { description: item.description } : {}),
    })),
  };
}

export function serviceSchema(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.shortDescription,
    ...(service.searchPhrases.length
      ? { keywords: service.searchPhrases }
      : {}),
    ...(service.searchSummary ? { serviceOutput: service.searchSummary } : {}),
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: ["Manchester", "North West England", "United Kingdom"],
    audience: service.audience.map((audience) => ({
      "@type": "Audience",
      audienceType: audience,
    })),
    url: absoluteUrl(`/services/${service.slug}`),
  };
}

export function faqSchema(faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function articleSchema(insight: Insight) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: insight.title,
    description: insight.excerpt,
    author: { "@type": "Person", name: siteConfig.founder },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: absoluteUrl(siteConfig.logoDark) },
    },
    datePublished: insight.publishedDate,
    dateModified: insight.updatedDate,
    image: absoluteUrl(siteConfig.ogImage),
    mainEntityOfPage: absoluteUrl(`/insights/${insight.slug}`),
  };
}

const htmlEscapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) => htmlEscapes[character] ?? character,
  );
}

function cleanJobText(value?: string) {
  return value?.replace(/\s+/g, " ").trim() || "";
}

function jobPostingParagraph(label: string, value?: string) {
  const text = cleanJobText(value);
  if (!text) return "";
  return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(text)}</p>`;
}

function jobPostingList(label: string, items: string[]) {
  const cleanItems = items.map(cleanJobText).filter(Boolean);
  if (!cleanItems.length) return "";

  return `<p><strong>${escapeHtml(label)}:</strong></p><ul>${cleanItems
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")}</ul>`;
}

export function jobPostingDescriptionHtml(job: Job) {
  const salaryText = [job.salaryRange, job.salaryTransparencyNote]
    .map(cleanJobText)
    .filter(Boolean)
    .join(". ");
  const locationText = [
    job.location,
    job.officeLocation,
    job.workingPattern,
    job.hybridPattern,
    job.hybridReality,
    job.locationExpectation,
    job.travelExpectation,
  ]
    .map(cleanJobText)
    .filter(Boolean)
    .join(". ");

  return [
    jobPostingParagraph("Summary", job.summary),
    jobPostingParagraph("Why the role exists", job.whyRoleExists),
    jobPostingList("Role overview", job.description),
    jobPostingList("David's take", job.davidsTake),
    jobPostingList("Responsibilities", job.responsibilities),
    jobPostingList("Must-haves", job.mustHaves),
    jobPostingList("Useful extras", job.niceToHaves),
    jobPostingList("What good looks like", job.whatGoodLooksLike),
    jobPostingList("Requirements", job.requirements),
    jobPostingList("Benefits", job.benefits),
    jobPostingParagraph("Salary or rate", salaryText),
    jobPostingParagraph("Location and working pattern", locationText),
    jobPostingList(
      "Interview process",
      job.interviewSteps.length ? job.interviewSteps : job.interviewProcess,
    ),
    jobPostingList("What happens after applying", job.applicationProcess),
    jobPostingParagraph("How to apply", job.applicationNotes),
  ]
    .filter(Boolean)
    .join("");
}

function googleEmploymentType(job: Job) {
  const copy = [job.employmentType, job.workingPattern, job.roleType]
    .join(" ")
    .toLowerCase();
  const types = new Set<string>();

  if (/\b(part[- ]time|fractional)\b/.test(copy)) types.add("PART_TIME");
  if (/\b(full[- ]time|permanent)\b/.test(copy)) types.add("FULL_TIME");
  if (/\b(contract|contractor|freelance)\b/.test(copy)) {
    types.add("CONTRACTOR");
  }
  if (/\b(interim|temporary|temp|fixed[- ]term)\b/.test(copy)) {
    types.add("TEMPORARY");
  }
  if (/\b(day rate|daily rate|per diem)\b/.test(copy)) types.add("PER_DIEM");

  const values = [...types];
  if (!values.length) return "OTHER";
  return values.length === 1 ? values[0] : values;
}

export function jobPostingSchema(job: Job) {
  type SalaryUnitText = "YEAR" | "DAY" | "HOUR" | "WEEK" | "MONTH";
  const unitTextBySalaryPeriod: Partial<
    Record<Job["salaryPeriod"] | Job["ratePeriod"], SalaryUnitText>
  > = {
    annual: "YEAR",
    daily: "DAY",
    hourly: "HOUR",
    weekly: "WEEK",
    monthly: "MONTH",
  };
  const canPublishSalary = ["public_range", "indicative_range"].includes(
    job.salaryVisibility,
  );
  const salaryMin =
    typeof job.salaryMin === "number" ? job.salaryMin : job.rateMin;
  const salaryMax =
    typeof job.salaryMax === "number" ? job.salaryMax : job.rateMax;
  const salaryPeriod =
    typeof job.salaryMin === "number" && typeof job.salaryMax === "number"
      ? job.salaryPeriod
      : job.ratePeriod;
  const salaryUnitText = unitTextBySalaryPeriod[salaryPeriod];
  const hasStructuredSalary =
    canPublishSalary &&
    typeof salaryMin === "number" &&
    typeof salaryMax === "number" &&
    Boolean(salaryUnitText);

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    identifier: {
      "@type": "PropertyValue",
      name: siteConfig.name,
      value: job.slug,
    },
    url: absoluteUrl(`/jobs/${job.slug}`),
    description: jobPostingDescriptionHtml(job),
    datePosted: job.postedDate || job.publishedDate,
    dateModified: job.updatedDate || job.postedDate || job.publishedDate,
    ...(job.closingDate ? { validThrough: job.closingDate } : {}),
    employmentType: googleEmploymentType(job),
    industry: job.sector,
    occupationalCategory: job.specialism,
    directApply:
      job.applicationFormEnabled !== false ||
      Boolean(job.applicationEmail.trim()),
    ...(job.responsibilities.length
      ? { responsibilities: job.responsibilities.join("\n") }
      : {}),
    ...(job.mustHaves.length || job.requirements.length
      ? { qualifications: [...job.mustHaves, ...job.requirements].join("\n") }
      : {}),
    ...(job.mustHaves.length || job.niceToHaves.length
      ? { skills: [...job.mustHaves, ...job.niceToHaves].join("\n") }
      : {}),
    ...(hasStructuredSalary
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: job.salaryCurrency || "GBP",
            value: {
              "@type": "QuantitativeValue",
              minValue: salaryMin,
              maxValue: salaryMax,
              unitText: salaryUnitText,
            },
          },
        }
      : {}),
    hiringOrganization: {
      "@type": "Organization",
      name: siteConfig.name,
      sameAs: siteConfig.url,
      logo: absoluteUrl(siteConfig.logoDark),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: "GB",
      },
    },
    ...(job.remotePossible === "yes"
      ? {
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: {
            "@type": "Country",
            name: "United Kingdom",
          },
        }
      : {}),
  };
}
