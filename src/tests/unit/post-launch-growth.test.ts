import { describe, expect, it } from "vitest";
import {
  contentCalendar,
  cornerstoneContentPlan,
  digitalPrCampaigns,
  founderAuthorityPillars,
  measurementFramework,
  salaryMarketAssets,
  stagedRoadmap,
} from "@/lib/post-launch-growth";

describe("post-launch growth roadmap", () => {
  it("keeps the required launch-quarter content plan intact", () => {
    expect(cornerstoneContentPlan).toHaveLength(10);
    expect(cornerstoneContentPlan.map((item) => item.workingTitle)).toEqual(
      expect.arrayContaining([
        "The job title is not the brief",
        "What is Strategic Interim?",
        "Retained search vs contingency recruitment",
      ]),
    );
  });

  it("guards salary assets with evidence and caveat requirements", () => {
    expect(salaryMarketAssets.length).toBeGreaterThanOrEqual(7);
    expect(
      salaryMarketAssets.every(
        (asset) =>
          asset.dataNeeded.length > 0 &&
          asset.collectionMethod.length > 0 &&
          asset.caveat.length > 20,
      ),
    ).toBe(true);
  });

  it("keeps digital PR ideas evidence-led instead of gimmicky", () => {
    expect(digitalPrCampaigns).toHaveLength(10);
    expect(
      digitalPrCampaigns.every(
        (campaign) =>
          campaign.dataNeeded.length > 0 &&
          campaign.risks.length > 0 &&
          campaign.antiGimmickRule.length > 0,
      ),
    ).toBe(true);
  });

  it("covers founder authority, calendar and reporting basics", () => {
    expect(founderAuthorityPillars).toHaveLength(10);
    expect(contentCalendar).toHaveLength(12);
    expect(stagedRoadmap.map((stage) => stage.stage)).toEqual([
      "Week 0",
      "First 30 days",
      "Days 31-90",
      "Months 3-6",
      "Months 6-12",
    ]);
    expect(measurementFramework.seoGeo).toContain("Organic impressions");
    expect(measurementFramework.commercial).toContain("Contact form submissions");
  });
});
