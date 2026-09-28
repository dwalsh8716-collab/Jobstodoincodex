import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getPublicHomePage,
  getPublicJobs,
  getPublicServices,
  getPublicInsights,
} from "@/lib/public-content";
import { sanityFetchWithFallback } from "@/lib/sanity-content";
import { homepageFeatureVideo, insights, jobs, services } from "@/lib/content";

vi.mock("server-only", () => ({}));

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

function clearSanityEnv() {
  delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  delete process.env.NEXT_PUBLIC_SANITY_DATASET;
  delete process.env.SANITY_PROJECT_ID;
  delete process.env.SANITY_DATASET;
}

describe("Sanity public fetching layer", () => {
  it("falls back when Sanity is not configured", async () => {
    clearSanityEnv();

    await expect(
      sanityFetchWithFallback({
        query: '*[_type == "service"]',
        fallback: ["fallback"],
      }),
    ).resolves.toEqual(["fallback"]);
  });

  it("returns local public content through route loaders when Sanity is unavailable", async () => {
    clearSanityEnv();

    await expect(getPublicServices()).resolves.toHaveLength(services.length);
    await expect(getPublicInsights()).resolves.toHaveLength(insights.length);
    await expect(getPublicJobs()).resolves.toHaveLength(jobs.length);
    await expect(getPublicHomePage()).resolves.toMatchObject({
      heroHeadline: "Helping Businesses Make Better Hiring Decisions.",
      heroLede:
        "Technology helps find people. Experience and judgement work out who's actually good.",
      premiumMedia: homepageFeatureVideo,
      servicesSection: {
        cards: expect.arrayContaining([
          expect.objectContaining({ title: "Permanent Recruitment" }),
          expect.objectContaining({ title: "Retained Search" }),
          expect.objectContaining({ title: "Fractional Leadership" }),
          expect.objectContaining({
            title: "Market Intelligence & Advisory",
          }),
        ]),
      },
    });
  });

  it("keeps the Sanity client and public-content loaders server-only", () => {
    expect(readFileSync("src/lib/sanity.ts", "utf8")).toContain(
      'import "server-only";',
    );
    expect(readFileSync("src/lib/sanity-content.ts", "utf8")).toContain(
      'import "server-only";',
    );
    expect(readFileSync("src/lib/public-content.ts", "utf8")).toContain(
      'import "server-only";',
    );
  });

  it("keeps production Sanity reads off the CDN so CMS edits revalidate cleanly", () => {
    expect(readFileSync("src/lib/sanity.ts", "utf8")).toContain(
      "useCdn: false",
    );
  });

  it("wires core public routes to the Sanity-with-fallback loaders", () => {
    const files = [
      "app/page.tsx",
      "app/services/page.tsx",
      "app/services/[slug]/page.tsx",
      "app/insights/page.tsx",
      "app/insights/[slug]/page.tsx",
      "app/case-studies/page.tsx",
      "app/case-studies/[slug]/page.tsx",
      "app/salary-snapshots/page.tsx",
      "app/salary-snapshots/[slug]/page.tsx",
      "app/jobs/page.tsx",
      "app/jobs/[slug]/page.tsx",
      "app/sitemap.ts",
    ];

    for (const file of files) {
      expect(readFileSync(file, "utf8")).toContain("@/lib/public-content");
    }
  });

  it("uses CMS-controlled homepage media and preserves uploads during launch sync", () => {
    expect(readFileSync("app/page.tsx", "utf8")).toContain(
      "media={homePage.premiumMedia}",
    );
    expect(readFileSync("app/page.tsx", "utf8")).toContain(
      "homePage.specialismsSection.cards.map",
    );
    expect(readFileSync("app/page.tsx", "utf8")).toContain(
      "homePage.citySection.imageSrc",
    );
    expect(readFileSync("scripts/sync-sanity-launch-shell.mjs", "utf8"))
      .toContain("existingHomePage?.premiumVideo");
  });
});
