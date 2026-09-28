import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/sanity-content", () => ({ sanityFetchWithFallback: vi.fn() }));
import { sanityFetchWithFallback } from "@/lib/sanity-content";
import { getPublicCaseStudy } from "@/lib/public-content";
import { havasSearchStory } from "@/lib/havas-search-story";

const fetchContent = vi.mocked(sanityFetchWithFallback);
const slug = "havas-media-manchester-managing-partner-james-reddington";

describe("Case study story publishing", () => {
  beforeEach(() => vi.resetAllMocks());

  it("uses published Sanity edits for the new story", async () => {
    const story = {
      ...havasSearchStory,
      brief: {
        ...havasSearchStory.brief,
        heading: "An editor's updated heading",
      },
    };
    fetchContent.mockResolvedValue({
      slug,
      contentVersion: 2,
      status: "published",
      searchStory: story,
    });
    expect((await getPublicCaseStudy(slug))?.searchStory).toEqual(story);
  });

  it("does not inject Havas story fields into another case study", async () => {
    fetchContent.mockResolvedValue({
      slug: "another-case",
      contentVersion: 2,
      status: "published",
    });
    expect(
      (await getPublicCaseStudy("another-case"))?.searchStory,
    ).toBeUndefined();
  });

  it("keeps a migrated document's intentionally removed story removed", async () => {
    fetchContent.mockResolvedValue({
      slug,
      contentVersion: 2,
      status: "published",
    });
    expect((await getPublicCaseStudy(slug))?.searchStory).toBeUndefined();
  });
});
