import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/sanity-content", () => ({ sanityFetchWithFallback: vi.fn() }));
import { sanityFetchWithFallback } from "@/lib/sanity-content";
import { getPublicService } from "@/lib/public-content";
import { services } from "@/lib/content";

const fetchContent = vi.mocked(sanityFetchWithFallback);
describe("Migrated service CMS ownership", () => {
  beforeEach(() => vi.resetAllMocks());
  it("keeps approved copy until migration is complete", async () => {
    fetchContent.mockResolvedValue({ title: "Old copy", slug: "fractional" });
    expect((await getPublicService("fractional"))?.title).toBe(
      "Fractional Leadership",
    );
  });
  it("uses published editor changes after migration", async () => {
    fetchContent.mockResolvedValue({
      contentVersion: 2,
      title: "Updated title",
      slug: "fractional",
      heroHeadline: "Edited headline",
      whoFor: ["New audience"],
      processSteps: [{ title: "Updated step", text: "Updated description" }],
    });
    const page = await getPublicService("fractional");
    expect(page?.heroHeadline).toBe("Edited headline");
    expect(page?.title).toBe("Updated title");
    expect(page?.audience).toEqual(["New audience"]);
    expect(page?.processSteps).toEqual([
      { title: "Updated step", description: "Updated description" },
    ]);
  });
  it("preserves intentionally cleared optional arrays", async () => {
    fetchContent.mockResolvedValue({
      contentVersion: 2,
      slug: "fractional",
      faqs: [],
      relatedServices: [],
    });
    const page = await getPublicService("fractional");
    expect(page?.faqs).toEqual([]);
    expect(page?.relatedServiceSlugs).toEqual([]);
  });
  it("retains approved copy when CMS is unavailable", async () => {
    fetchContent.mockResolvedValue(null);
    expect(await getPublicService("fractional")).toEqual(
      services.find((s) => s.slug === "fractional"),
    );
  });
});
