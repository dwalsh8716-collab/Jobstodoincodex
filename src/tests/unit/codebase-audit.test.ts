import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const requiredAuditDocs = [
  "docs/codebase-forensic-audit-report.md",
  "docs/non-technical-architecture-map.md",
  "docs/sanity-cms-audit.md",
  "docs/backend-data-boundary-audit.md",
  "docs/railway-readiness-audit.md",
  "docs/security-privacy-audit.md",
  "docs/dependency-update-policy.md",
  "docs/ci-quality-gates.md",
  "docs/observability-audit.md",
  "docs/david-non-technical-owner-checklist.md",
];

describe("codebase forensic audit pack", () => {
  it("keeps the plain-English audit documents present and discoverable", () => {
    const readme = readFileSync("README.md", "utf8");

    for (const file of requiredAuditDocs) {
      expect(existsSync(file)).toBe(true);
      expect(readme).toContain(file);
    }
  });

  it("states the core architecture boundary clearly", () => {
    const report = readFileSync(
      "docs/codebase-forensic-audit-report.md",
      "utf8",
    );
    const architectureMap = readFileSync(
      "docs/non-technical-architecture-map.md",
      "utf8",
    );

    expect(report).toContain("Loxo should remain the recruitment CRM/ATS");
    expect(report).toContain("Sanity is the public CMS");
    expect(report).toContain("Railway Postgres is staged");
    expect(architectureMap).toContain("Do not turn the website database");
  });

  it("adds GitHub quality and dependency automation", () => {
    const workflow = readFileSync(".github/workflows/quality.yml", "utf8");
    const dependabot = readFileSync(".github/dependabot.yml", "utf8");

    expect(workflow).toContain("npm run verify");
    expect(workflow).toContain("npm audit --audit-level=moderate");
    expect(workflow).toContain("npm run sanity -- schema validate");
    expect(workflow).toContain("npm run db:status");
    expect(workflow).toContain("npm run retention:check");
    expect(dependabot).toContain("package-ecosystem: npm");
    expect(dependabot).toContain("package-ecosystem: github-actions");
  });
});
