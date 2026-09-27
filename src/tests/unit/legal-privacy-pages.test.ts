import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function pageSource(path: string) {
  return readFileSync(path, "utf8").replace(/\s+/g, " ");
}

describe("public legal and privacy wording", () => {
  it("covers the core UK GDPR transparency information", () => {
    const policy = pageSource("app/privacy-policy/page.tsx");

    expect(policy).toContain("is the data controller");
    expect(policy).toContain("The lawful bases used");
    expect(policy).toContain("International processing");
    expect(policy).toContain("Automated decisions");
    expect(policy).toContain("Information Commissioner");
  });

  it("states the candidate sharing and retention safeguards", () => {
    const notice = pageSource("app/candidate-privacy/page.tsx");

    expect(notice).toContain("will not be sent to a client without");
    expect(notice).toContain("at least 12 months");
    expect(notice).toContain("does not use solely automated");
    expect(notice).toContain("Railway for website hosting and private file storage");
  });

  it("describes the live consent and analytics configuration", () => {
    const policy = pageSource("app/cookie-policy/page.tsx");
    const consent = pageSource("src/components/AnalyticsConsent.tsx");

    expect(policy).toContain("up to six months");
    expect(policy).toContain("Google Analytics 4");
    expect(policy).toContain("not currently configured");
    expect(consent).toContain("180 * 24 * 60 * 60 * 1000");
  });

  it("keeps website terms separate from recruitment engagement terms", () => {
    const terms = pageSource("app/terms/page.tsx");

    expect(terms).toContain("dealt with separately");
    expect(terms).toContain("not charged a fee");
    expect(terms).toContain("law of England and Wales");
  });
});
