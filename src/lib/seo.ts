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

export function jobPostingSchema(job: Job) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    identifier: {
      "@type": "PropertyValue",
      name: siteConfig.name,
      value: job.slug,
    },
    description: `${job.summary}\n\n${job.description.join("\n")}`,
    datePosted: job.publishedDate,
    ...(job.closingDate ? { validThrough: job.closingDate } : {}),
    employmentType: job.employmentType.toUpperCase().replaceAll("-", "_"),
    industry: job.sector,
    occupationalCategory: job.specialism,
    directApply: true,
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
  };
}
