import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("human-readable release process", () => {
  it("keeps release documents and the PR template present", () => {
    expect(existsSync("CHANGELOG.md")).toBe(true);
    expect(existsSync("docs/release-process.md")).toBe(true);
    expect(existsSync(".github/pull_request_template.md")).toBe(true);
  });

  it("keeps the changelog in David-readable sections", () => {
    const changelog = readFileSync("CHANGELOG.md", "utf8");

    for (const heading of [
      "### Summary",
      "### Public Website Changes",
      "### CMS Changes",
      "### Form Changes",
      "### SEO Changes",
      "### Security / Privacy Changes",
      "### Recruiter Labs Changes",
      "### Manual Actions For David",
      "### Rollback Note",
    ]) {
      expect(changelog).toContain(heading);
    }
  });

  it("documents the release process checks and privacy guardrails", () => {
    const processDoc = readFileSync("docs/release-process.md", "utf8");

    expect(processDoc).toContain("npm run verify");
    expect(processDoc).toContain("npm audit --audit-level=moderate");
    expect(processDoc).toContain("no PII in Sanity");
    expect(processDoc).toContain("no secrets in GitHub");
    expect(processDoc).toContain("no public Recruiter Labs exposure");
    expect(processDoc).toContain("Railway env vars documented");
  });

  it("keeps the PR checklist aligned with release requirements", () => {
    const template = readFileSync(".github/pull_request_template.md", "utf8");

    for (const item of [
      "Build passes",
      "Lint/typecheck pass",
      "No PII",
      "No secrets",
      "No public Recruiter Labs exposure",
      "Docs updated",
      "CHANGELOG.md",
      "Railway environment variables documented",
      "Screenshots or browser checks",
    ]) {
      expect(template).toContain(item);
    }
  });

  it("links the release process and changelog from the README", () => {
    const readme = readFileSync("README.md", "utf8");

    expect(readme).toContain("docs/release-process.md");
    expect(readme).toContain("CHANGELOG.md");
  });
});
