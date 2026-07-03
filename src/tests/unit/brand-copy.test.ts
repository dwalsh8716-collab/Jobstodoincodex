import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const liveCopySources = [
  "app/about-essential/page.tsx",
  "app/candidates/page.tsx",
  "src/components/Cards.tsx",
  "src/components/ContactForm.tsx",
  "src/lib/content.ts",
].map((path) => readFileSync(path, "utf8"));

describe("brand copy and tone", () => {
  it("documents the tone audit and keeps the strongest public copy sharp", () => {
    const audit = readFileSync("docs/BRAND-COPY-TONE-AUDIT.md", "utf8");
    const source = liveCopySources.join("\n");

    expect(audit).toContain("Brand/Copy Executive Summary");
    expect(audit).toContain("Strong Copy Worth Keeping");
    expect(audit).toContain("CTA Improvements");
    expect(audit).toContain("sharpen the voice, do not sand it down");

    expect(source).toContain(
      "Senior marketing and comms recruitment, without the usual noise.",
    );
    expect(source).toContain("Explore the service");
    expect(source).toContain("View proof standard");
    expect(source).toContain("Read the role");
    expect(source).toContain("Private two-minute note.");
  });

  it("keeps banned generic recruitment phrases out of live copy sources", () => {
    const source = liveCopySources.join("\n").toLowerCase();
    const bannedPhrases = [
      "talent solutions",
      "human capital",
      "best-in-class",
      "unlock potential",
      "strategic alignment",
      "end-to-end recruitment partner",
      "sourcing top talent",
      "bespoke solutions",
      "ever-changing landscape",
      "submit vacancy",
      "request talent",
      "transform your talent strategy",
    ];

    for (const phrase of bannedPhrases) {
      expect(source).not.toContain(phrase);
    }
  });
});
