import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const docPath = "docs/future-proof-architecture.md";

describe("future-proof architecture documentation", () => {
  it("keeps the architecture guide present and linked from the README", () => {
    const readme = readFileSync("README.md", "utf8");

    expect(existsSync(docPath)).toBe(true);
    expect(readme).toContain(docPath);
  });

  it("states the long-term system boundaries clearly", () => {
    const doc = readFileSync(docPath, "utf8");

    expect(doc).toContain("Sanity is the public CMS");
    expect(doc).toContain("Loxo is the recruitment CRM/ATS");
    expect(doc).toContain("Postgres is not a replacement CRM");
    expect(doc).toContain("Recruiter Labs stays private");
  });

  it("keeps future work tied to quality, monitoring and public performance checks", () => {
    const doc = readFileSync(docPath, "utf8");

    expect(doc).toContain("npm run verify");
    expect(doc).toContain("npm run performance:budget");
    expect(doc).toContain("/api/health");
    expect(doc).toContain("Dependabot");
  });
});
