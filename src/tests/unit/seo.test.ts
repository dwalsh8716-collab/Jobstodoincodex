import { describe, expect, it } from "vitest";
import { jobs, services } from "@/lib/content";
import {
  absoluteUrl,
  breadcrumbSchema,
  createMetadata,
  jobPostingSchema,
  serviceSchema,
} from "@/lib/seo";

describe("metadata helpers", () => {
  it("creates absolute canonical and open graph URLs", () => {
    const metadata = createMetadata({
      title: "Test title",
      description: "Test description",
      path: "/services/strategic-interim",
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://essentialresourcing.co.uk/services/strategic-interim",
    );
    const openGraphImages = metadata.openGraph?.images;
    const firstImage = Array.isArray(openGraphImages)
      ? openGraphImages[0]
      : openGraphImages;

    expect(firstImage).toMatchObject({
      width: 1200,
      height: 630,
    });
  });

  it("respects noindex metadata", () => {
    const metadata = createMetadata({
      title: "Private",
      description: "Private page",
      noIndex: true,
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});

describe("structured data builders", () => {
  it("builds service schema with an absolute URL", () => {
    const service = services.find((item) => item.slug === "strategic-interim");
    expect(service).toBeDefined();

    const schema = serviceSchema(service!);
    expect(schema).toMatchObject({
      "@type": "Service",
      url: absoluteUrl("/services/strategic-interim"),
    });
  });

  it("builds breadcrumb positions in order", () => {
    const schema = breadcrumbSchema([
      { name: "Home", href: "/" },
      { name: "Services", href: "/services" },
    ]);

    expect(schema.itemListElement).toEqual([
      expect.objectContaining({ position: 1, name: "Home" }),
      expect.objectContaining({ position: 2, name: "Services" }),
    ]);
  });

  it("builds job posting schema without exposing draft as live state", () => {
    const job = jobs[0];
    const schema = jobPostingSchema(job);

    expect(schema).toMatchObject({
      "@type": "JobPosting",
      title: job.title,
      directApply: true,
    });
  });
});
